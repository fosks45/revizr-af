/**
 * Auth routes: register, login, refresh, logout, forgot-password, reset-password.
 *
 * SPEC SIGN-OFF ENFORCEMENT:
 *   - POST /auth/register ONLY allows role=parent.
 *   - If role=student is submitted, return 403 with message:
 *     "Students are registered by a parent account."
 *   - Student accounts are created exclusively by POST /accounts/pair.
 *
 * Password hashing: Argon2id (ADR-0005 — "Never bcrypt").
 * Token signing: RS256 JWT access token + opaque refresh token in Redis.
 * Audit: auth events logged via writeAuditLog (no PII values in audit rows).
 *
 * Schema note: the users table requires an email_hash column beyond data-model.md v1.0.0.
 * Add to migration (T-011):
 *   ALTER TABLE users ADD COLUMN email_hash varchar(64);
 *   CREATE UNIQUE INDEX users_email_hash_idx ON users(email_hash) WHERE deleted_at IS NULL;
 * This column stores the HMAC-SHA256 of the plaintext email for O(1) lookup queries
 * without exposing the plaintext email value (satisfies C3 classification).
 *
 * The questions table requires a board_licence_cleared boolean column (C-003):
 *   ALTER TABLE questions ADD COLUMN board_licence_cleared boolean NOT NULL DEFAULT false;
 *   CREATE INDEX questions_board_licence_idx ON questions(board_licence_cleared) WHERE board_licence_cleared = true;
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { randomBytes } from 'node:crypto';
import {
  hashPassword,
  verifyPassword,
  generateRefreshToken,
  storeRefreshToken,
  consumeRefreshToken,
  revokeRefreshToken,
  storePasswordResetToken,
  consumePasswordResetToken,
} from '../plugins/auth.js';
import { requireAuth, getAuthUser } from '../middleware/auth-guard.js';
import { encryptEmail, hashEmailForLookup, encrypt, decrypt } from '../lib/encryption.js';
import { writeAuditLog, hashUserIdForAudit } from '../lib/audit.js';

// ─── Validation schemas ───────────────────────────────────────────────────────

const passwordSchema = z
  .string()
  .min(10, 'Password must be at least 10 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one digit');

const registerSchema = z.object({
  email: z.string().email(),
  password: passwordSchema,
  display_name: z.string().min(1).max(100),
  role: z.enum(['student', 'parent']),
  age_band: z.enum(['under13', '13to15', '16to18', 'adult']),
  locale: z.enum(['en-GB', 'cy']).default('en-GB'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refresh_token: z.string().min(1),
});

const logoutSchema = z.object({
  refresh_token: z.string().min(1),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  new_password: passwordSchema,
});

// ─── Route plugin ─────────────────────────────────────────────────────────────

export default async function authRoutes(fastify: FastifyInstance): Promise<void> {
  const db = fastify.db;
  const redis = fastify.redis;

  // ─── POST /auth/register ──────────────────────────────────────────────────

  fastify.post('/auth/register', {
    config: { rateLimit: { max: 5, timeWindow: '1 hour' } },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const parse = registerSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.code(422).send({
        code: 'VALIDATION_ERROR',
        message: 'Request body failed validation',
        details: parse.error.flatten().fieldErrors,
      });
    }

    const { email, password, display_name, role, age_band, locale } = parse.data;

    // ── SPEC SIGN-OFF GATE: students cannot self-register ─────────────────
    if (role === 'student') {
      return reply.code(403).send({
        code: 'SELF_REGISTRATION_FORBIDDEN',
        message: 'Students are registered by a parent account.',
      });
    }

    const emailHash = hashEmailForLookup(email);
    const encryptedEmail = encryptEmail(email);
    const encryptedDisplayName = encrypt(display_name);
    const encryptedAgeBand = encrypt(age_band);
    const passwordHash = await hashPassword(password);
    const userId = uuidv4();

    // Check for existing email (lookup by HMAC hash — never decrypt all rows)
    const existing = await db.query(
      'SELECT id FROM users WHERE email_hash = $1 AND deleted_at IS NULL',
      [emailHash]
    );
    if ((existing.rowCount ?? 0) > 0) {
      return reply.code(409).send({
        code: 'EMAIL_CONFLICT',
        message: 'An account with this email already exists',
      });
    }

    // Insert user
    await db.query(
      `INSERT INTO users
         (id, email, email_hash, password_hash, display_name, role, age_band, locale)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [userId, encryptedEmail, emailHash, passwordHash, encryptedDisplayName, role, encryptedAgeBand, locale]
    );

    // Create subscription row (free tier)
    await db.query(
      `INSERT INTO subscriptions (id, user_id, plan, status, current_period_end)
       VALUES ($1, $2, 'free', 'active', now() + interval '100 years')`,
      [uuidv4(), userId]
    );

    // Create notification preferences row (defaults)
    await db.query(
      `INSERT INTO notification_preferences (id, user_id)
       VALUES ($1, $2)`,
      [uuidv4(), userId]
    );

    // Issue tokens
    const accessToken = fastify.signAccessToken({ sub: userId, role });
    const refreshToken = generateRefreshToken();
    await storeRefreshToken(redis, refreshToken, { userId, role });

    // Audit
    await writeAuditLog({
      agentOrUserId: hashUserIdForAudit(userId),
      action: 'auth.register.success',
      entityType: 'user',
      entityId: userId,
      decision: 'allowed',
      policy: 'auth_register',
    });

    return reply.code(201).send({
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 900,
      user: {
        id: userId,
        email,
        display_name,
        role,
        age_band,
        locale,
        created_at: new Date().toISOString(),
      },
    });
  });

  // ─── POST /auth/login ─────────────────────────────────────────────────────

  fastify.post('/auth/login', {
    config: { rateLimit: { max: 10, timeWindow: '15 minutes' } },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const parse = loginSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.code(422).send({
        code: 'VALIDATION_ERROR',
        message: 'Request body failed validation',
        details: parse.error.flatten().fieldErrors,
      });
    }

    const { email, password } = parse.data;
    const emailHash = hashEmailForLookup(email);

    const result = await db.query(
      `SELECT id, email, password_hash, display_name, role, age_band, locale, created_at
       FROM users
       WHERE email_hash = $1 AND deleted_at IS NULL`,
      [emailHash]
    );

    const user = result.rows[0] as {
      id: string;
      email: string;
      password_hash: string;
      display_name: string;
      role: 'student' | 'parent';
      age_band: string;
      locale: string;
      created_at: Date;
    } | undefined;

    // Constant-time: always attempt password verify even on not-found
    const passwordValid = user
      ? await verifyPassword(user.password_hash, password)
      : (await hashPassword('dummy_to_avoid_timing_leak'), false);

    if (!user || !passwordValid) {
      await writeAuditLog({
        agentOrUserId: 'unknown',
        action: 'auth.login.failed',
        entityType: 'user',
        entityId: 'unknown',
        decision: 'denied',
        policy: 'auth_login',
      });
      return reply.code(401).send({
        code: 'INVALID_CREDENTIALS',
        message: 'Email or password is incorrect',
      });
    }

    // Decrypt PII fields for response
    const decryptedEmail = decrypt(user.email);
    const decryptedDisplayName = decrypt(user.display_name);
    const decryptedAgeBand = decrypt(user.age_band);

    const accessToken = fastify.signAccessToken({ sub: user.id, role: user.role });
    const refreshToken = generateRefreshToken();
    await storeRefreshToken(redis, refreshToken, { userId: user.id, role: user.role });

    await writeAuditLog({
      agentOrUserId: hashUserIdForAudit(user.id),
      action: 'auth.login.success',
      entityType: 'user',
      entityId: user.id,
      decision: 'allowed',
      policy: 'auth_login',
    });

    return reply.code(200).send({
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 900,
      user: {
        id: user.id,
        email: decryptedEmail,
        display_name: decryptedDisplayName,
        role: user.role,
        age_band: decryptedAgeBand,
        locale: user.locale,
        created_at: user.created_at.toISOString(),
      },
    });
  });

  // ─── POST /auth/refresh ───────────────────────────────────────────────────

  fastify.post('/auth/refresh', {
    config: { rateLimit: { max: 10, timeWindow: '15 minutes' } },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const parse = refreshSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.code(422).send({
        code: 'VALIDATION_ERROR',
        message: 'Request body failed validation',
      });
    }

    const data = await consumeRefreshToken(redis, parse.data.refresh_token);
    if (!data) {
      return reply.code(401).send({
        code: 'UNAUTHORIZED',
        message: 'Refresh token is invalid or expired',
      });
    }

    // Issue new token pair (rotation)
    const newAccessToken = fastify.signAccessToken({ sub: data.userId, role: data.role });
    const newRefreshToken = generateRefreshToken();
    await storeRefreshToken(redis, newRefreshToken, data);

    return reply.code(200).send({
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
      expires_in: 900,
    });
  });

  // ─── POST /auth/logout ────────────────────────────────────────────────────

  fastify.post('/auth/logout', {
    preHandler: [requireAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const parse = logoutSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.code(422).send({
        code: 'VALIDATION_ERROR',
        message: 'Request body failed validation',
      });
    }

    await revokeRefreshToken(redis, parse.data.refresh_token);

    const user = getAuthUser(request);
    await writeAuditLog({
      agentOrUserId: hashUserIdForAudit(user.sub),
      action: 'auth.logout',
      entityType: 'user',
      entityId: user.sub,
      decision: 'allowed',
      policy: 'auth_logout',
    });

    return reply.code(204).send();
  });

  // ─── POST /auth/forgot-password ───────────────────────────────────────────

  fastify.post('/auth/forgot-password', {
    config: { rateLimit: { max: 5, timeWindow: '1 hour' } },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const parse = forgotPasswordSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.code(422).send({
        code: 'VALIDATION_ERROR',
        message: 'Request body failed validation',
      });
    }

    const { email } = parse.data;
    const emailHash = hashEmailForLookup(email);

    const result = await db.query(
      'SELECT id FROM users WHERE email_hash = $1 AND deleted_at IS NULL',
      [emailHash]
    );

    // Anti-enumeration: identical response regardless of whether account exists
    if ((result.rowCount ?? 0) > 0) {
      const user = result.rows[0] as { id: string };
      const resetToken = randomBytes(32).toString('hex');
      await storePasswordResetToken(redis, resetToken, user.id);

      // TODO [T-015]: Send reset email via Resend SDK
      // await sendPasswordResetEmail(email, resetToken);
      fastify.log.info({ userId: user.id }, 'Password reset token issued');
    }

    return reply.code(202).send({
      message: 'If an account exists with this email, a reset link has been sent.',
    });
  });

  // ─── POST /auth/reset-password ────────────────────────────────────────────
  // F-SEC-002 FIX: Rate limit added — was the only auth endpoint without one.

  fastify.post('/auth/reset-password', {
    config: { rateLimit: { max: 5, timeWindow: '1 hour' } },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const parse = resetPasswordSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.code(422).send({
        code: 'VALIDATION_ERROR',
        message: 'Request body failed validation',
        details: parse.error.flatten().fieldErrors,
      });
    }

    const { token, new_password } = parse.data;
    const userId = await consumePasswordResetToken(redis, token);

    if (!userId) {
      return reply.code(400).send({
        code: 'INVALID_RESET_TOKEN',
        message: 'Reset token is invalid or has expired',
      });
    }

    const newHash = await hashPassword(new_password);
    await db.query(
      'UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2',
      [newHash, userId]
    );

    // Revoke all existing refresh tokens for this user by scanning Redis pattern
    // In production, maintain a user-level token set for bulk revocation
    // For v1: users are advised to log in fresh after password reset

    // Fetch user role for new tokens
    const userResult = await db.query(
      'SELECT role FROM users WHERE id = $1 AND deleted_at IS NULL',
      [userId]
    );
    const userRole = (userResult.rows[0] as { role: 'student' | 'parent' } | undefined)?.role ?? 'parent';

    const accessToken = fastify.signAccessToken({ sub: userId, role: userRole });
    const refreshToken = generateRefreshToken();
    await storeRefreshToken(redis, refreshToken, { userId, role: userRole });

    await writeAuditLog({
      agentOrUserId: hashUserIdForAudit(userId),
      action: 'auth.password_reset.complete',
      entityType: 'user',
      entityId: userId,
      decision: 'allowed',
      policy: 'auth_password_reset',
    });

    return reply.code(200).send({
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 900,
    });
  });
}

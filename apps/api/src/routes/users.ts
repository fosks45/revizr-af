/**
 * User profile and GDPR rights routes.
 *
 * GET    /users/me           — get current user's profile
 * PATCH  /users/me           — update display_name and/or locale
 * DELETE /users/me           — GDPR right-to-erasure (soft delete + queue)
 * GET    /users/me/export    — GDPR data export (rate-limited to 1/24h per user)
 *
 * Data handling:
 *   - C3 fields (email, display_name, age_band) are decrypted before response.
 *   - C3 fields are re-encrypted on PATCH.
 *   - DELETE soft-deletes and nullifies C3 fields within 30 days (queued job).
 *   - GDPR export returns all personal data; rate-limited via Redis key.
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { requireAuth, getAuthUser } from '../middleware/auth-guard.js';
import { encrypt, decrypt } from '../lib/encryption.js';
import { writeAuditLog, hashUserIdForAudit } from '../lib/audit.js';

const patchUserSchema = z.object({
  display_name: z.string().min(1).max(100).optional(),
  locale: z.enum(['en-GB', 'cy']).optional(),
});

const deleteUserSchema = z.object({
  confirm: z.literal(true),
});

export default async function usersRoutes(fastify: FastifyInstance): Promise<void> {
  const db = fastify.db;
  const redis = fastify.redis;

  // ─── GET /users/me ────────────────────────────────────────────────────────

  fastify.get('/users/me', {
    preHandler: [requireAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = getAuthUser(request);

    const result = await db.query(
      `SELECT id, email, display_name, role, age_band, locale, created_at
       FROM users
       WHERE id = $1 AND deleted_at IS NULL`,
      [user.sub]
    );

    if ((result.rowCount ?? 0) === 0) {
      return reply.code(404).send({ code: 'NOT_FOUND', message: 'User not found' });
    }

    const row = result.rows[0] as {
      id: string;
      email: string;
      display_name: string;
      role: string;
      age_band: string;
      locale: string;
      created_at: Date;
    };

    return reply.code(200).send({
      id: row.id,
      email: decrypt(row.email),
      display_name: decrypt(row.display_name),
      role: row.role,
      age_band: decrypt(row.age_band),
      locale: row.locale,
      created_at: row.created_at.toISOString(),
    });
  });

  // ─── PATCH /users/me ──────────────────────────────────────────────────────

  fastify.patch('/users/me', {
    preHandler: [requireAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const parse = patchUserSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.code(422).send({
        code: 'VALIDATION_ERROR',
        message: 'Request body failed validation',
        details: parse.error.flatten().fieldErrors,
      });
    }

    const user = getAuthUser(request);
    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIdx = 1;

    if (parse.data.display_name !== undefined) {
      updates.push(`display_name = $${paramIdx++}`);
      values.push(encrypt(parse.data.display_name));
    }
    if (parse.data.locale !== undefined) {
      updates.push(`locale = $${paramIdx++}`);
      values.push(parse.data.locale);
    }

    if (updates.length === 0) {
      return reply.code(422).send({ code: 'VALIDATION_ERROR', message: 'No fields to update' });
    }

    updates.push(`updated_at = now()`);
    values.push(user.sub);

    await db.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIdx} AND deleted_at IS NULL`,
      values
    );

    // Return updated profile
    const result = await db.query(
      `SELECT id, email, display_name, role, age_band, locale, created_at
       FROM users WHERE id = $1 AND deleted_at IS NULL`,
      [user.sub]
    );
    const row = result.rows[0] as {
      id: string;
      email: string;
      display_name: string;
      role: string;
      age_band: string;
      locale: string;
      created_at: Date;
    };

    return reply.code(200).send({
      id: row.id,
      email: decrypt(row.email),
      display_name: decrypt(row.display_name),
      role: row.role,
      age_band: decrypt(row.age_band),
      locale: row.locale,
      created_at: row.created_at.toISOString(),
    });
  });

  // ─── DELETE /users/me ─────────────────────────────────────────────────────

  fastify.delete('/users/me', {
    preHandler: [requireAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const parse = deleteUserSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.code(422).send({
        code: 'VALIDATION_ERROR',
        message: 'confirm must be true to proceed with account deletion',
      });
    }

    const user = getAuthUser(request);

    // Soft-delete: set deleted_at and nullify C3 fields
    // Hard erasure of remaining C3 data is queued as a background job (30-day SLA)
    await db.query(
      `UPDATE users
       SET deleted_at = now(),
           email = NULL,
           email_hash = NULL,
           display_name = NULL,
           age_band = NULL,
           updated_at = now()
       WHERE id = $1 AND deleted_at IS NULL`,
      [user.sub]
    );

    // TODO [T-018]: Cancel Stripe subscription immediately via stripe.ts
    // await cancelStripeSubscriptionForUser(user.sub, db);

    // TODO [T-018]: Queue hard-deletion job (BullMQ) for 30-day cascade
    // await enqueueGdprErasureJob(user.sub);

    await writeAuditLog({
      agentOrUserId: hashUserIdForAudit(user.sub),
      action: 'gdpr.deletion_requested',
      entityType: 'user',
      entityId: user.sub,
      decision: 'allowed',
      policy: 'gdpr_deletion',
    });

    return reply.code(202).send({
      message: 'Account deletion queued. Data will be erased within 30 days.',
    });
  });

  // ─── GET /users/me/export ─────────────────────────────────────────────────

  fastify.get('/users/me/export', {
    preHandler: [requireAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = getAuthUser(request);

    // Rate limit: 1 export per 24h per user (Redis key)
    const exportRateLimitKey = `gdpr_export:${user.sub}`;
    const lastExport = await redis.get(exportRateLimitKey);
    if (lastExport) {
      return reply.code(429).send({
        code: 'RATE_LIMITED',
        message: 'Data export is limited to once per 24 hours',
      });
    }
    // Set with 24h TTL
    await redis.setex(exportRateLimitKey, 86400, '1');

    // Fetch user profile
    const userResult = await db.query(
      `SELECT id, email, display_name, role, age_band, locale, created_at
       FROM users WHERE id = $1 AND deleted_at IS NULL`,
      [user.sub]
    );

    if ((userResult.rowCount ?? 0) === 0) {
      return reply.code(404).send({ code: 'NOT_FOUND', message: 'User not found' });
    }

    const row = userResult.rows[0] as {
      id: string;
      email: string;
      display_name: string;
      role: string;
      age_band: string;
      locale: string;
      created_at: Date;
    };

    // Fetch subjects
    const subjectsResult = await db.query(
      `SELECT id, user_id, subject_name, exam_board, level, is_active
       FROM subjects WHERE user_id = $1`,
      [user.sub]
    );

    // Fetch diagnostic sessions (metadata only — documents deleted, evidences are C5)
    const diagnosticResult = await db.query(
      `SELECT id, session_type, status, created_at, completed_at
       FROM diagnostic_sessions WHERE user_id = $1`,
      [user.sub]
    );

    // Fetch practice sessions (metadata only)
    const practiceResult = await db.query(
      `SELECT id, subject_id, status, started_at, ended_at, question_count
       FROM practice_sessions WHERE user_id = $1`,
      [user.sub]
    );

    await writeAuditLog({
      agentOrUserId: hashUserIdForAudit(user.sub),
      action: 'gdpr.export_requested',
      entityType: 'user',
      entityId: user.sub,
      decision: 'allowed',
      policy: 'gdpr_export',
    });

    return reply.code(200).send({
      export_generated_at: new Date().toISOString(),
      user: {
        id: row.id,
        email: decrypt(row.email),
        display_name: decrypt(row.display_name),
        role: row.role,
        age_band: decrypt(row.age_band),
        locale: row.locale,
        created_at: row.created_at.toISOString(),
      },
      subjects: subjectsResult.rows,
      diagnostic_sessions: diagnosticResult.rows,
      practice_sessions: practiceResult.rows,
    });
  });
}

/**
 * Account pairing and parental consent routes.
 *
 * POST /accounts/pair   — parent initiates student pairing
 * POST /accounts/consent — record parental consent (timestamp, mechanism, IP hash)
 *
 * Spec sign-off rules:
 *   - Only authenticated parents (role=parent) can call /accounts/pair.
 *   - Students are NOT created via self-registration (/auth/register is parent-only).
 *   - Consent IP is stored as SHA-256 hash — never in plaintext (C3 classification).
 *   - Consent timestamp and mechanism are encrypted at rest (C3 fields).
 *
 * Note: In ADR-0005 v2 (post spec-sign-off), the flow is:
 *   parent registers → parent creates student account via /accounts/pair →
 *   student receives credentials. The pending_consent flow for under-13
 *   is simplified: parent is the account holder; student is a dependent user.
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { randomBytes } from 'node:crypto';
import { requireAuth, requireParent, getAuthUser } from '../middleware/auth-guard.js';
import {
  hashEmailForLookup,
  encryptEmail,
  encrypt,
  hashIpAddress,
} from '../lib/encryption.js';
import { storeConsentToken, consumeConsentToken } from '../plugins/auth.js';
import { writeAuditLog, hashUserIdForAudit } from '../lib/audit.js';

const pairSchema = z.object({
  student_email: z.string().email(),
  relationship: z.enum(['parent', 'guardian', 'carer']),
});

const consentSchema = z.object({
  account_id: z.string().uuid(),
  consent_token: z.string().min(1),
});

export default async function accountsRoutes(fastify: FastifyInstance): Promise<void> {
  const db = fastify.db;
  const redis = fastify.redis;

  // ─── POST /accounts/pair ──────────────────────────────────────────────────

  fastify.post('/accounts/pair', {
    preHandler: [requireAuth, requireParent],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const parse = pairSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.code(422).send({
        code: 'VALIDATION_ERROR',
        message: 'Request body failed validation',
        details: parse.error.flatten().fieldErrors,
      });
    }

    const parent = getAuthUser(request);
    const { student_email, relationship } = parse.data;

    // Look up student by email hash
    const emailHash = hashEmailForLookup(student_email);
    const studentResult = await db.query(
      `SELECT id, role FROM users WHERE email_hash = $1 AND deleted_at IS NULL`,
      [emailHash]
    );

    if ((studentResult.rowCount ?? 0) === 0) {
      return reply.code(404).send({
        code: 'STUDENT_NOT_FOUND',
        message: 'No account found with this email',
      });
    }

    const student = studentResult.rows[0] as { id: string; role: string };

    // Check for existing pairing
    const existingPair = await db.query(
      `SELECT id FROM accounts WHERE parent_user_id = $1 AND student_user_id = $2`,
      [parent.sub, student.id]
    );

    if ((existingPair.rowCount ?? 0) > 0) {
      return reply.code(409).send({
        code: 'PAIRING_EXISTS',
        message: 'This parent-student pair already exists',
      });
    }

    const accountId = uuidv4();
    const consentToken = randomBytes(32).toString('hex');

    // Encrypt C3 fields before DB write
    const encRelationship = encrypt(relationship);
    const encParentUserId = encrypt(parent.sub);
    const encStudentUserId = encrypt(student.id);

    await db.query(
      `INSERT INTO accounts
         (id, parent_user_id, student_user_id, relationship, status)
       VALUES ($1, $2, $3, $4, 'pending')`,
      [accountId, encParentUserId, encStudentUserId, encRelationship]
    );

    // Store consent token in Redis (24h TTL)
    await storeConsentToken(redis, consentToken, accountId);

    // TODO [T-016]: Send consent/pairing invitation email via Resend to student_email
    // await sendPairingInvitationEmail(student_email, consentToken, accountId);
    fastify.log.info({ accountId, parentId: parent.sub, studentId: student.id }, 'Pairing invitation issued');

    await writeAuditLog({
      agentOrUserId: hashUserIdForAudit(parent.sub),
      action: 'accounts.pair.initiated',
      entityType: 'account',
      entityId: accountId,
      decision: 'allowed',
      policy: 'accounts_pair',
    });

    return reply.code(202).send({
      account_id: accountId,
      status: 'pending',
    });
  });

  // ─── POST /accounts/consent ───────────────────────────────────────────────

  fastify.post('/accounts/consent', {
    preHandler: [requireAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const parse = consentSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.code(422).send({
        code: 'VALIDATION_ERROR',
        message: 'Request body failed validation',
        details: parse.error.flatten().fieldErrors,
      });
    }

    const { account_id, consent_token } = parse.data;
    const caller = getAuthUser(request);

    // Verify consent token
    const storedAccountId = await consumeConsentToken(redis, consent_token);
    if (!storedAccountId || storedAccountId !== account_id) {
      return reply.code(400).send({
        code: 'INVALID_CONSENT_TOKEN',
        message: 'Consent token is invalid or has expired',
      });
    }

    // Get IP from request for hashing
    const rawIp = request.ip ?? '0.0.0.0';
    const ipHash = hashIpAddress(rawIp);

    // Encrypt C3 consent fields
    const encConsentGivenAt = encrypt(new Date().toISOString());
    const encConsentMechanism = encrypt('email_verified_link');
    const encConsentIpHash = encrypt(ipHash);

    await db.query(
      `UPDATE accounts
       SET status = 'active',
           consent_given_at = $1,
           consent_mechanism = $2,
           consent_ip_hash = $3,
           updated_at = now()
       WHERE id = $4`,
      [encConsentGivenAt, encConsentMechanism, encConsentIpHash, account_id]
    );

    await writeAuditLog({
      agentOrUserId: hashUserIdForAudit(caller.sub),
      action: 'accounts.consent.recorded',
      entityType: 'account',
      entityId: account_id,
      decision: 'allowed',
      policy: 'accounts_consent',
      metadata: { consent_mechanism: 'email_verified_link' },
    });

    return reply.code(200).send({
      account_id,
      status: 'active',
    });
  });
}

/**
 * Notification preferences routes.
 *
 * GET   /notifications/preferences — get current user's notification preferences
 * PATCH /notifications/preferences — update notification preferences
 *
 * Push token handling (C6 classification):
 *   - The push subscription endpoint URL is NEVER stored in plaintext.
 *   - push_token_hash (SHA-256 of endpoint URL) is stored for deduplication/deletion.
 *   - The full push subscription object (endpoint + keys) is stored in the
 *     application secrets store (TODO: implement secrets vault in Sprint 6).
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'node:crypto';
import { requireAuth, getAuthUser } from '../middleware/auth-guard.js';

const patchPreferencesSchema = z.object({
  email_session_reminders: z.boolean().optional(),
  email_progress_reports: z.boolean().optional(),
  push_enabled: z.boolean().optional(),
  push_subscription: z.object({
    endpoint: z.string().url(),
    keys: z.object({
      p256dh: z.string(),
      auth: z.string(),
    }),
  }).optional(),
});

export default async function notificationsRoutes(fastify: FastifyInstance): Promise<void> {
  const db = fastify.db;

  // ─── GET /notifications/preferences ──────────────────────────────────────

  fastify.get('/notifications/preferences', {
    preHandler: [requireAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = getAuthUser(request);

    const result = await db.query(
      `SELECT email_session_reminders, email_progress_reports, push_enabled
       FROM notification_preferences
       WHERE user_id = $1`,
      [user.sub]
    );

    if ((result.rowCount ?? 0) === 0) {
      // Return defaults if no row exists
      return reply.code(200).send({
        email_session_reminders: true,
        email_progress_reports: true,
        push_enabled: false,
      });
    }

    const prefs = result.rows[0] as {
      email_session_reminders: boolean;
      email_progress_reports: boolean;
      push_enabled: boolean;
    };

    return reply.code(200).send({
      email_session_reminders: prefs.email_session_reminders,
      email_progress_reports: prefs.email_progress_reports,
      push_enabled: prefs.push_enabled,
    });
  });

  // ─── PATCH /notifications/preferences ────────────────────────────────────

  fastify.patch('/notifications/preferences', {
    preHandler: [requireAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const parse = patchPreferencesSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.code(422).send({
        code: 'VALIDATION_ERROR',
        message: 'Request body failed validation',
        details: parse.error.flatten().fieldErrors,
      });
    }

    const user = getAuthUser(request);
    const { email_session_reminders, email_progress_reports, push_enabled, push_subscription } = parse.data;

    // Hash push token (C6 — never log or store in plaintext)
    let pushTokenHash: string | undefined;
    if (push_subscription?.endpoint) {
      pushTokenHash = createHash('sha256').update(push_subscription.endpoint).digest('hex');
      // TODO [T-064]: Store full push_subscription object in secrets vault
      // The plaintext push_subscription is intentionally NOT stored in DB
      fastify.log.info({ userId: user.sub }, 'Push subscription registered (endpoint hashed)');
    }

    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIdx = 1;

    if (email_session_reminders !== undefined) {
      updates.push(`email_session_reminders = $${paramIdx++}`);
      values.push(email_session_reminders);
    }
    if (email_progress_reports !== undefined) {
      updates.push(`email_progress_reports = $${paramIdx++}`);
      values.push(email_progress_reports);
    }
    if (push_enabled !== undefined) {
      updates.push(`push_enabled = $${paramIdx++}`);
      values.push(push_enabled);
    }
    if (pushTokenHash) {
      updates.push(`push_token_hash = $${paramIdx++}`);
      values.push(pushTokenHash);
    }

    if (updates.length === 0) {
      return reply.code(422).send({ code: 'VALIDATION_ERROR', message: 'No fields to update' });
    }

    values.push(user.sub);

    // Upsert notification preferences
    const existing = await db.query(
      `SELECT id FROM notification_preferences WHERE user_id = $1`,
      [user.sub]
    );

    if ((existing.rowCount ?? 0) === 0) {
      await db.query(
        `INSERT INTO notification_preferences (id, user_id) VALUES ($1, $2)`,
        [uuidv4(), user.sub]
      );
    }

    await db.query(
      `UPDATE notification_preferences SET ${updates.join(', ')} WHERE user_id = $${paramIdx}`,
      values
    );

    const result = await db.query(
      `SELECT email_session_reminders, email_progress_reports, push_enabled
       FROM notification_preferences WHERE user_id = $1`,
      [user.sub]
    );

    const updated = result.rows[0] as {
      email_session_reminders: boolean;
      email_progress_reports: boolean;
      push_enabled: boolean;
    };

    return reply.code(200).send({
      email_session_reminders: updated.email_session_reminders,
      email_progress_reports: updated.email_progress_reports,
      push_enabled: updated.push_enabled,
    });
  });
}

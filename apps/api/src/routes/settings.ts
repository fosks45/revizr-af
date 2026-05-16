/**
 * Locale/settings routes.
 *
 * GET   /settings/locale — get current locale setting
 * PATCH /settings/locale — update locale (Welsh toggle)
 *
 * Locale is C1 (internal) — not encrypted at rest, not PII.
 * Persisted in users.locale; survives logout/login.
 * Next.js middleware uses the locale from the JWT token payload at login.
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { requireAuth, getAuthUser } from '../middleware/auth-guard.js';

const patchLocaleSchema = z.object({
  locale: z.enum(['en-GB', 'cy']),
});

export default async function settingsRoutes(fastify: FastifyInstance): Promise<void> {
  const db = fastify.db;

  // ─── GET /settings/locale ─────────────────────────────────────────────────

  fastify.get('/settings/locale', {
    preHandler: [requireAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = getAuthUser(request);

    const result = await db.query(
      `SELECT locale FROM users WHERE id = $1 AND deleted_at IS NULL`,
      [user.sub]
    );

    if ((result.rowCount ?? 0) === 0) {
      return reply.code(200).send({ locale: 'en-GB' });
    }

    const row = result.rows[0] as { locale: string };
    return reply.code(200).send({ locale: row.locale });
  });

  // ─── PATCH /settings/locale ───────────────────────────────────────────────

  fastify.patch('/settings/locale', {
    preHandler: [requireAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const parse = patchLocaleSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.code(422).send({
        code: 'VALIDATION_ERROR',
        message: 'Request body failed validation',
        details: parse.error.flatten().fieldErrors,
      });
    }

    const user = getAuthUser(request);
    const { locale } = parse.data;

    await db.query(
      `UPDATE users SET locale = $1, updated_at = now() WHERE id = $2 AND deleted_at IS NULL`,
      [locale, user.sub]
    );

    return reply.code(200).send({ locale });
  });
}

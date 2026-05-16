/**
 * Progress tracking routes.
 *
 * GET /progress        — progress summary for current user (by subject and period)
 * GET /progress/topics — topic-level progress breakdown (multi-week)
 *
 * Data source: progress_snapshots table (pre-computed weekly aggregates).
 * The snapshot job (T-043) runs weekly and computes scores from session_question_attempts.
 * Empty array is returned if no snapshot data exists yet (new user).
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { requireAuth, getAuthUser } from '../middleware/auth-guard.js';
import { encrypt } from '../lib/encryption.js';

const progressSummarySchema = z.object({
  subject_id: z.string().uuid(),
  period: z.string().optional(), // ISO week: 2026-W20
});

const progressTopicsSchema = z.object({
  subject_id: z.string().uuid(),
  weeks: z.coerce.number().int().min(1).max(52).default(8),
});

/** Convert a Date to ISO week string e.g. "2026-W20" */
function toIsoWeek(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export default async function progressRoutes(fastify: FastifyInstance): Promise<void> {
  const db = fastify.db;

  // ─── GET /progress ────────────────────────────────────────────────────────

  fastify.get('/progress', {
    preHandler: [requireAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const parse = progressSummarySchema.safeParse(request.query);
    if (!parse.success) {
      return reply.code(422).send({
        code: 'VALIDATION_ERROR',
        message: 'Query parameters failed validation',
        details: parse.error.flatten().fieldErrors,
      });
    }

    const user = getAuthUser(request);
    const { subject_id, period } = parse.data;
    const currentPeriod = period ?? toIsoWeek(new Date());

    // Parse ISO week to a date for DB query
    const weekMatch = /^(\d{4})-W(\d{1,2})$/.exec(currentPeriod);
    if (!weekMatch) {
      return reply.code(422).send({ code: 'VALIDATION_ERROR', message: 'period must be in format YYYY-Www' });
    }

    const [, yearStr, weekStr] = weekMatch;
    const year = parseInt(yearStr!, 10);
    const week = parseInt(weekStr!, 10);
    // Convert ISO week to Monday date
    const jan4 = new Date(Date.UTC(year, 0, 4));
    const dayOfWeek = jan4.getUTCDay() || 7;
    const weekStart = new Date(jan4.getTime() + ((week - 1) * 7 - (dayOfWeek - 1)) * 86400000);

    const result = await db.query(
      `SELECT topic_tag, score_avg, questions_attempted, questions_correct
       FROM progress_snapshots
       WHERE user_id = $1
         AND subject_id = $2
         AND snapshot_date = $3`,
      [encrypt(user.sub), subject_id, weekStart.toISOString().split('T')[0]]
    );

    return reply.code(200).send({
      user_id: user.sub,
      subject_id,
      period: currentPeriod,
      topics: result.rows,
    });
  });

  // ─── GET /progress/topics ─────────────────────────────────────────────────

  fastify.get('/progress/topics', {
    preHandler: [requireAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const parse = progressTopicsSchema.safeParse(request.query);
    if (!parse.success) {
      return reply.code(422).send({
        code: 'VALIDATION_ERROR',
        message: 'Query parameters failed validation',
        details: parse.error.flatten().fieldErrors,
      });
    }

    const user = getAuthUser(request);
    const { subject_id, weeks } = parse.data;

    // Aggregate across the last N weeks
    const result = await db.query(
      `SELECT
         topic_tag,
         AVG(score_avg)::numeric(4,3) AS score_avg,
         SUM(questions_attempted) AS questions_attempted,
         SUM(questions_correct) AS questions_correct
       FROM progress_snapshots
       WHERE user_id = $1
         AND subject_id = $2
         AND snapshot_date >= (date_trunc('week', now()) - ($3 || ' weeks')::interval)
       GROUP BY topic_tag
       ORDER BY score_avg ASC`,
      [encrypt(user.sub), subject_id, weeks]
    );

    return reply.code(200).send({ topics: result.rows });
  });
}

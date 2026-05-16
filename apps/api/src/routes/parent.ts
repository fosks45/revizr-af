/**
 * Parent dashboard routes.
 *
 * GET  /parent/children                              — list linked students
 * GET  /parent/children/:studentId/progress          — child's progress
 * GET  /parent/children/:studentId/sessions          — child's session history (cursor-paginated)
 * POST /parent/children/:studentId/controls          — set parental controls
 *
 * All endpoints require role=parent.
 * Parent can only access students where accounts.status='active' and they are the parent.
 * account.parent_user_id and student_user_id are stored encrypted — queries decrypt for comparison.
 *
 * Note: The accounts table stores encrypted UUIDs. We must query by decrypted value or
 * maintain a non-encrypted index. For v1: we query all active accounts for this parent
 * and filter in application code after decryption. This is acceptable at v1 volume.
 * TODO [performance]: add a parent_user_id_hash index (HMAC of UUID) for O(1) lookups.
 *
 * Schema note: The accounts table requires two additional columns for parental controls
 * beyond what is in data-model.md v1.0.0. Add to migration (T-048):
 *   ALTER TABLE accounts ADD COLUMN daily_question_cap smallint;
 *   ALTER TABLE accounts ADD COLUMN session_duration_minutes smallint;
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { requireAuth, requireParent, getAuthUser } from '../middleware/auth-guard.js';
import { encrypt, decrypt } from '../lib/encryption.js';

const parentalControlsSchema = z.object({
  daily_question_cap: z.number().int().min(0).max(200).nullable().optional(),
  session_duration_minutes: z.number().int().min(5).max(120).nullable().optional(),
});

const childSessionsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  before: z.string().datetime().optional(),
});

function isValidUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
}

export default async function parentRoutes(fastify: FastifyInstance): Promise<void> {
  const db = fastify.db;

  /**
   * Helper: get all active student IDs linked to this parent.
   * Decrypts parent_user_id and student_user_id for each active account row.
   */
  async function getLinkedStudentIds(parentId: string): Promise<string[]> {
    const result = await db.query(
      `SELECT student_user_id FROM accounts WHERE status = 'active'`
    );

    const studentIds: string[] = [];
    for (const row of result.rows as { student_user_id: string }[]) {
      try {
        // We also need to verify parent_user_id matches. Fetch with parent check.
        const decStudent = decrypt(row.student_user_id);
        studentIds.push(decStudent);
      } catch {
        // Skip rows where decryption fails
      }
    }

    // Re-query with parent filter (encrypt parent ID for match)
    const encParentId = encrypt(parentId);
    const filtered = await db.query(
      `SELECT student_user_id FROM accounts
       WHERE parent_user_id = $1 AND status = 'active'`,
      [encParentId]
    );

    return (filtered.rows as { student_user_id: string }[])
      .map(r => {
        try { return decrypt(r.student_user_id); } catch { return null; }
      })
      .filter((id): id is string => id !== null);
  }

  // ─── GET /parent/children ─────────────────────────────────────────────────

  fastify.get('/parent/children', {
    preHandler: [requireAuth, requireParent],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const parent = getAuthUser(request);
    const studentIds = await getLinkedStudentIds(parent.sub);

    if (studentIds.length === 0) {
      return reply.code(200).send({ children: [] });
    }

    const children = [];

    for (const studentId of studentIds) {
      const userResult = await db.query(
        `SELECT id, display_name FROM users WHERE id = $1 AND deleted_at IS NULL`,
        [studentId]
      );

      if ((userResult.rowCount ?? 0) === 0) continue;

      const user = userResult.rows[0] as { id: string; display_name: string };
      const displayName = decrypt(user.display_name);

      const subjectsResult = await db.query(
        `SELECT id, user_id, subject_name, exam_board, level, is_active
         FROM subjects WHERE user_id = $1 AND is_active = true`,
        [studentId]
      );

      children.push({
        student_id: studentId,
        display_name: displayName,
        subjects: subjectsResult.rows,
      });
    }

    return reply.code(200).send({ children });
  });

  // ─── GET /parent/children/:studentId/progress ─────────────────────────────

  fastify.get('/parent/children/:studentId/progress', {
    preHandler: [requireAuth, requireParent],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const parent = getAuthUser(request);
    const { studentId } = request.params as { studentId: string };

    if (!isValidUuid(studentId)) {
      return reply.code(422).send({ code: 'VALIDATION_ERROR', message: 'Invalid studentId format' });
    }

    const studentIds = await getLinkedStudentIds(parent.sub);
    if (!studentIds.includes(studentId)) {
      return reply.code(403).send({ code: 'FORBIDDEN', message: 'You do not have access to this student' });
    }

    const { subject_id } = request.query as { subject_id?: string };

    const params: unknown[] = [encrypt(studentId)];
    let subjectFilter = '';

    if (subject_id) {
      if (!isValidUuid(subject_id)) {
        return reply.code(422).send({ code: 'VALIDATION_ERROR', message: 'Invalid subject_id format' });
      }
      subjectFilter = 'AND subject_id = $2';
      params.push(subject_id);
    }

    const result = await db.query(
      `SELECT user_id, subject_id, snapshot_date, topic_tag, score_avg,
              questions_attempted, questions_correct
       FROM progress_snapshots
       WHERE user_id = $1
         ${subjectFilter}
       ORDER BY snapshot_date DESC, subject_id`,
      params
    );

    // Group by subject_id and return as ProgressSummary array
    const bySubject = new Map<string, {
      subject_id: string;
      period: string;
      topics: { topic_tag: string; score_avg: number; questions_attempted: number; questions_correct: number }[];
    }>();

    for (const row of result.rows as {
      user_id: string;
      subject_id: string;
      snapshot_date: string;
      topic_tag: string;
      score_avg: number;
      questions_attempted: number;
      questions_correct: number;
    }[]) {
      const key = row.subject_id;
      if (!bySubject.has(key)) {
        bySubject.set(key, {
          subject_id: key,
          period: row.snapshot_date,
          topics: [],
        });
      }
      bySubject.get(key)!.topics.push({
        topic_tag: row.topic_tag,
        score_avg: row.score_avg,
        questions_attempted: row.questions_attempted,
        questions_correct: row.questions_correct,
      });
    }

    return reply.code(200).send(
      Array.from(bySubject.values()).map(s => ({ user_id: studentId, ...s }))
    );
  });

  // ─── GET /parent/children/:studentId/sessions ────────────────────────────

  fastify.get('/parent/children/:studentId/sessions', {
    preHandler: [requireAuth, requireParent],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const parent = getAuthUser(request);
    const { studentId } = request.params as { studentId: string };

    if (!isValidUuid(studentId)) {
      return reply.code(422).send({ code: 'VALIDATION_ERROR', message: 'Invalid studentId format' });
    }

    const studentIds = await getLinkedStudentIds(parent.sub);
    if (!studentIds.includes(studentId)) {
      return reply.code(403).send({ code: 'FORBIDDEN', message: 'You do not have access to this student' });
    }

    const parse = childSessionsSchema.safeParse(request.query);
    if (!parse.success) {
      return reply.code(422).send({ code: 'VALIDATION_ERROR', message: 'Query parameters failed validation' });
    }

    const { limit, before } = parse.data;
    const encStudentId = encrypt(studentId);

    const params: unknown[] = [encStudentId, limit + 1]; // fetch +1 to detect next page
    let beforeClause = '';

    if (before) {
      beforeClause = 'AND started_at < $3';
      params.push(new Date(before).toISOString());
    }

    const result = await db.query(
      `SELECT id, user_id, subject_id, status, started_at, ended_at, question_count
       FROM practice_sessions
       WHERE user_id = $1
         ${beforeClause}
       ORDER BY started_at DESC
       LIMIT $2`,
      params
    );

    const rows = result.rows as {
      id: string;
      user_id: string;
      subject_id: string;
      status: string;
      started_at: Date;
      ended_at: Date | null;
      question_count: number;
    }[];

    const hasMore = rows.length > limit;
    const sessions = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? sessions[sessions.length - 1]!.started_at.toISOString() : null;

    return reply.code(200).send({
      sessions: sessions.map(s => ({
        id: s.id,
        user_id: studentId,
        subject_id: s.subject_id,
        status: s.status,
        started_at: s.started_at.toISOString(),
        ended_at: s.ended_at?.toISOString() ?? null,
        question_count: s.question_count,
      })),
      next_cursor: nextCursor,
    });
  });

  // ─── POST /parent/children/:studentId/controls ───────────────────────────

  fastify.post('/parent/children/:studentId/controls', {
    preHandler: [requireAuth, requireParent],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const parent = getAuthUser(request);
    const { studentId } = request.params as { studentId: string };

    if (!isValidUuid(studentId)) {
      return reply.code(422).send({ code: 'VALIDATION_ERROR', message: 'Invalid studentId format' });
    }

    const parse = parentalControlsSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.code(422).send({
        code: 'VALIDATION_ERROR',
        message: 'Request body failed validation',
        details: parse.error.flatten().fieldErrors,
      });
    }

    const studentIds = await getLinkedStudentIds(parent.sub);
    if (!studentIds.includes(studentId)) {
      return reply.code(403).send({ code: 'FORBIDDEN', message: 'You do not have access to this student' });
    }

    const { daily_question_cap, session_duration_minutes } = parse.data;

    // Upsert parental controls — stored in accounts table
    const encStudentId = encrypt(studentId);
    const encParentId = encrypt(parent.sub);

    await db.query(
      `UPDATE accounts
       SET daily_question_cap = $1,
           session_duration_minutes = $2,
           updated_at = now()
       WHERE parent_user_id = $3
         AND student_user_id = $4
         AND status = 'active'`,
      [
        daily_question_cap ?? null,
        session_duration_minutes ?? null,
        encParentId,
        encStudentId,
      ]
    );

    return reply.code(200).send({
      student_id: studentId,
      daily_question_cap: daily_question_cap ?? null,
      session_duration_minutes: session_duration_minutes ?? null,
    });
  });
}

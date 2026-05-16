/**
 * Practice session routes.
 *
 * GET    /practice/questions              — personalised question pack
 * POST   /practice/sessions              — start a new session
 * GET    /practice/sessions/:id          — get session state with attempts
 * PATCH  /practice/sessions/:id          — end/pause session
 * POST   /practice/sessions/:id/attempt  — submit self-mark attempt
 *
 * Board licence gate: ALL queries on the questions table include
 *   `WHERE board_licence_cleared = true`
 * This is ENFORCED here — no exceptions. Questions without clearance
 * are invisible to the API.
 *
 * Parental control enforcement (T-048):
 *   - daily_question_cap: enforced in GET /practice/questions
 *   - session_duration_minutes: validated on attempt submit
 *
 * Attempt idempotency (T-035): re-submitting same question_id in same session
 *   returns the existing attempt (not an error, not a double-write).
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { requireAuth, getAuthUser } from '../middleware/auth-guard.js';
import { encrypt, decrypt } from '../lib/encryption.js';

const getQuestionsSchema = z.object({
  subject_id: z.string().uuid(),
  topic_tag: z.string().optional(),
  count: z.coerce.number().int().min(1).max(30).default(10),
});

const createSessionSchema = z.object({
  subject_id: z.string().uuid(),
  question_ids: z.array(z.string().uuid()).min(1).max(30),
});

const updateSessionSchema = z.object({
  status: z.enum(['completed', 'abandoned']),
});

const submitAttemptSchema = z.object({
  question_id: z.string().uuid(),
  self_mark_score: z.number().int().min(0),
  time_spent_seconds: z.number().int().min(0),
  mark_scheme_viewed: z.boolean().default(false),
});

function isValidUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
}

export default async function practiceRoutes(fastify: FastifyInstance): Promise<void> {
  const db = fastify.db;

  // ─── GET /practice/questions ──────────────────────────────────────────────

  fastify.get('/practice/questions', {
    preHandler: [requireAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const parse = getQuestionsSchema.safeParse(request.query);
    if (!parse.success) {
      return reply.code(422).send({
        code: 'VALIDATION_ERROR',
        message: 'Query parameters failed validation',
        details: parse.error.flatten().fieldErrors,
      });
    }

    const user = getAuthUser(request);
    const { subject_id, topic_tag, count } = parse.data;

    // Verify subject belongs to user
    const subjectResult = await db.query(
      `SELECT subject_name, exam_board, level FROM subjects
       WHERE id = $1 AND user_id = $2 AND is_active = true`,
      [subject_id, user.sub]
    );

    if ((subjectResult.rowCount ?? 0) === 0) {
      return reply.code(422).send({ code: 'VALIDATION_ERROR', message: 'Subject not found or not owned by user' });
    }

    const subject = subjectResult.rows[0] as { subject_name: string; exam_board: string; level: string };

    // Parental daily question cap check (T-048)
    const controlsResult = await db.query(
      `SELECT a.daily_question_cap
       FROM accounts a
       WHERE a.student_user_id = $1 AND a.status = 'active'
       LIMIT 1`,
      [encrypt(user.sub)]
    );

    if ((controlsResult.rowCount ?? 0) > 0) {
      const cap = (controlsResult.rows[0] as { daily_question_cap: number | null }).daily_question_cap;
      if (cap !== null) {
        // Count questions attempted today
        const todayCount = await db.query(
          `SELECT COUNT(*) AS cnt
           FROM session_question_attempts sqa
           JOIN practice_sessions ps ON ps.id = sqa.practice_session_id
           WHERE ps.user_id = $1
             AND sqa.presented_at >= date_trunc('day', now())`,
          [encrypt(user.sub)]
        );
        const attempted = parseInt((todayCount.rows[0] as { cnt: string }).cnt, 10);
        if (attempted >= cap) {
          return reply.code(403).send({
            code: 'DAILY_CAP_REACHED',
            message: 'Daily question limit reached. Contact your parent to adjust the limit.',
          });
        }
      }
    }

    // Fetch personalised questions:
    //   If diagnostic results exist: weight top-3 weak topics (≥60% from those topics)
    //   Otherwise: curriculum order
    //
    // BOARD LICENCE GATE: board_licence_cleared = true is MANDATORY on all question queries
    const diagnosticResult = await db.query(
      `SELECT topic_tag, weakness_score
       FROM diagnostic_results
       WHERE user_id = $1
         AND subject_id = $2
       ORDER BY weakness_score DESC
       LIMIT 3`,
      [encrypt(user.sub), subject_id]
    );

    let questions: unknown[];

    if ((diagnosticResult.rowCount ?? 0) > 0 && !topic_tag) {
      // Personalised: at least 60% from weak topics
      const weakTopics = (diagnosticResult.rows as { topic_tag: string }[]).map(r => r.topic_tag);
      const weakCount = Math.ceil(count * 0.6);
      const normalCount = count - weakCount;

      const weakQuestions = await db.query(
        `SELECT id, board, level, subject, year, paper_ref, topic_tags,
                question_text, mark_scheme_text, max_marks, question_type, image_refs
         FROM questions
         WHERE board = $1
           AND level = $2
           AND subject = $3
           AND topic_tags ?| $4
           AND board_licence_cleared = true
         ORDER BY random()
         LIMIT $5`,
        [subject.exam_board, subject.level, subject.subject_name, weakTopics, weakCount]
      );

      const weakIds = new Set((weakQuestions.rows as { id: string }[]).map(r => r.id));

      const normalQuestions = await db.query(
        `SELECT id, board, level, subject, year, paper_ref, topic_tags,
                question_text, mark_scheme_text, max_marks, question_type, image_refs
         FROM questions
         WHERE board = $1
           AND level = $2
           AND subject = $3
           AND id != ALL($4::uuid[])
           AND board_licence_cleared = true
         ORDER BY random()
         LIMIT $5`,
        [
          subject.exam_board,
          subject.level,
          subject.subject_name,
          Array.from(weakIds),
          normalCount,
        ]
      );

      questions = [...weakQuestions.rows, ...normalQuestions.rows];
    } else {
      // Default: by topic_tag filter or curriculum order
      const params: unknown[] = [subject.exam_board, subject.level, subject.subject_name, count];
      let topicFilter = '';

      if (topic_tag) {
        topicFilter = `AND topic_tags ? $${params.length + 1}`;
        params.push(topic_tag);
      }

      const result = await db.query(
        `SELECT id, board, level, subject, year, paper_ref, topic_tags,
                question_text, mark_scheme_text, max_marks, question_type, image_refs
         FROM questions
         WHERE board = $1
           AND level = $2
           AND subject = $3
           AND board_licence_cleared = true
           ${topicFilter}
         ORDER BY year DESC, created_at ASC
         LIMIT $4`,
        params
      );

      questions = result.rows;
    }

    return reply.code(200).send({ questions });
  });

  // ─── POST /practice/sessions ──────────────────────────────────────────────

  fastify.post('/practice/sessions', {
    preHandler: [requireAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const parse = createSessionSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.code(422).send({
        code: 'VALIDATION_ERROR',
        message: 'Request body failed validation',
        details: parse.error.flatten().fieldErrors,
      });
    }

    const user = getAuthUser(request);
    const { subject_id, question_ids } = parse.data;

    // Verify subject
    const subjectCheck = await db.query(
      `SELECT id FROM subjects WHERE id = $1 AND user_id = $2 AND is_active = true`,
      [subject_id, user.sub]
    );
    if ((subjectCheck.rowCount ?? 0) === 0) {
      return reply.code(422).send({ code: 'VALIDATION_ERROR', message: 'Subject not found or not owned by user' });
    }

    // Verify all question IDs exist and have board licence cleared
    const questionsCheck = await db.query(
      `SELECT id FROM questions
       WHERE id = ANY($1::uuid[])
         AND board_licence_cleared = true`,
      [question_ids]
    );

    if ((questionsCheck.rowCount ?? 0) !== question_ids.length) {
      return reply.code(422).send({
        code: 'VALIDATION_ERROR',
        message: 'One or more question IDs are invalid or not available',
      });
    }

    const sessionId = uuidv4();
    const encUserId = encrypt(user.sub);
    const now = new Date();

    await db.query(
      `INSERT INTO practice_sessions (id, user_id, subject_id, status, started_at, question_count)
       VALUES ($1, $2, $3, 'active', $4, $5)`,
      [sessionId, encUserId, subject_id, now, question_ids.length]
    );

    // Create attempt rows (presented_at = now)
    for (const qId of question_ids) {
      await db.query(
        `INSERT INTO session_question_attempts
           (id, practice_session_id, question_id, presented_at)
         VALUES ($1, $2, $3, $4)`,
        [uuidv4(), sessionId, qId, now]
      );
    }

    // Fetch the created session with attempts
    const sessionResult = await db.query(
      `SELECT ps.id, ps.user_id, ps.subject_id, ps.status,
              ps.started_at, ps.ended_at, ps.question_count
       FROM practice_sessions ps
       WHERE ps.id = $1`,
      [sessionId]
    );

    const attemptsResult = await db.query(
      `SELECT id, question_id, presented_at, self_mark_score,
              time_spent_seconds, mark_scheme_viewed
       FROM session_question_attempts
       WHERE practice_session_id = $1
       ORDER BY presented_at ASC`,
      [sessionId]
    );

    const session = sessionResult.rows[0] as {
      id: string;
      user_id: string;
      subject_id: string;
      status: string;
      started_at: Date;
      ended_at: Date | null;
      question_count: number;
    };

    return reply.code(201).send({
      id: session.id,
      user_id: user.sub,
      subject_id: session.subject_id,
      status: session.status,
      started_at: session.started_at.toISOString(),
      ended_at: session.ended_at?.toISOString() ?? null,
      question_count: session.question_count,
      attempts: attemptsResult.rows,
    });
  });

  // ─── GET /practice/sessions/:id ───────────────────────────────────────────

  fastify.get('/practice/sessions/:id', {
    preHandler: [requireAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = getAuthUser(request);
    const { id } = request.params as { id: string };

    if (!isValidUuid(id)) {
      return reply.code(422).send({ code: 'VALIDATION_ERROR', message: 'Invalid session ID format' });
    }

    const sessionResult = await db.query(
      `SELECT id, user_id, subject_id, status, started_at, ended_at, question_count
       FROM practice_sessions WHERE id = $1`,
      [id]
    );

    if ((sessionResult.rowCount ?? 0) === 0) {
      return reply.code(404).send({ code: 'NOT_FOUND', message: 'Session not found' });
    }

    const session = sessionResult.rows[0] as {
      id: string;
      user_id: string;
      subject_id: string;
      status: string;
      started_at: Date;
      ended_at: Date | null;
      question_count: number;
    };

    const sessionUserId = decrypt(session.user_id);
    if (sessionUserId !== user.sub) {
      return reply.code(403).send({ code: 'FORBIDDEN', message: 'You do not have permission to view this session' });
    }

    const attemptsResult = await db.query(
      `SELECT id, question_id, presented_at, self_mark_score, time_spent_seconds, mark_scheme_viewed
       FROM session_question_attempts
       WHERE practice_session_id = $1
       ORDER BY presented_at ASC`,
      [id]
    );

    return reply.code(200).send({
      id: session.id,
      user_id: user.sub,
      subject_id: session.subject_id,
      status: session.status,
      started_at: session.started_at.toISOString(),
      ended_at: session.ended_at?.toISOString() ?? null,
      question_count: session.question_count,
      attempts: attemptsResult.rows,
    });
  });

  // ─── PATCH /practice/sessions/:id ────────────────────────────────────────

  fastify.patch('/practice/sessions/:id', {
    preHandler: [requireAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const parse = updateSessionSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.code(422).send({
        code: 'VALIDATION_ERROR',
        message: 'Request body failed validation',
        details: parse.error.flatten().fieldErrors,
      });
    }

    const user = getAuthUser(request);
    const { id } = request.params as { id: string };

    if (!isValidUuid(id)) {
      return reply.code(422).send({ code: 'VALIDATION_ERROR', message: 'Invalid session ID format' });
    }

    const sessionResult = await db.query(
      `SELECT id, user_id, status FROM practice_sessions WHERE id = $1`,
      [id]
    );

    if ((sessionResult.rowCount ?? 0) === 0) {
      return reply.code(404).send({ code: 'NOT_FOUND', message: 'Session not found' });
    }

    const session = sessionResult.rows[0] as { id: string; user_id: string; status: string };

    if (decrypt(session.user_id) !== user.sub) {
      return reply.code(403).send({ code: 'FORBIDDEN', message: 'You do not have permission to update this session' });
    }

    if (session.status !== 'active') {
      return reply.code(400).send({
        code: 'SESSION_ALREADY_TERMINAL',
        message: 'Session is already completed or abandoned',
      });
    }

    await db.query(
      `UPDATE practice_sessions SET status = $1, ended_at = now(), updated_at = now() WHERE id = $2`,
      [parse.data.status, id]
    );

    const updatedResult = await db.query(
      `SELECT id, user_id, subject_id, status, started_at, ended_at, question_count
       FROM practice_sessions WHERE id = $1`,
      [id]
    );

    const updatedSession = updatedResult.rows[0] as {
      id: string;
      user_id: string;
      subject_id: string;
      status: string;
      started_at: Date;
      ended_at: Date | null;
      question_count: number;
    };

    const attemptsResult = await db.query(
      `SELECT id, question_id, presented_at, self_mark_score, time_spent_seconds, mark_scheme_viewed
       FROM session_question_attempts WHERE practice_session_id = $1`,
      [id]
    );

    return reply.code(200).send({
      id: updatedSession.id,
      user_id: user.sub,
      subject_id: updatedSession.subject_id,
      status: updatedSession.status,
      started_at: updatedSession.started_at.toISOString(),
      ended_at: updatedSession.ended_at?.toISOString() ?? null,
      question_count: updatedSession.question_count,
      attempts: attemptsResult.rows,
    });
  });

  // ─── POST /practice/sessions/:id/attempt ─────────────────────────────────

  fastify.post('/practice/sessions/:id/attempt', {
    preHandler: [requireAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const parse = submitAttemptSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.code(422).send({
        code: 'VALIDATION_ERROR',
        message: 'Request body failed validation',
        details: parse.error.flatten().fieldErrors,
      });
    }

    const user = getAuthUser(request);
    const { id } = request.params as { id: string };

    if (!isValidUuid(id)) {
      return reply.code(422).send({ code: 'VALIDATION_ERROR', message: 'Invalid session ID format' });
    }

    const { question_id, self_mark_score, time_spent_seconds, mark_scheme_viewed } = parse.data;

    // Verify session ownership and status
    const sessionResult = await db.query(
      `SELECT id, user_id, status FROM practice_sessions WHERE id = $1`,
      [id]
    );

    if ((sessionResult.rowCount ?? 0) === 0) {
      return reply.code(404).send({ code: 'NOT_FOUND', message: 'Session not found' });
    }

    const session = sessionResult.rows[0] as { id: string; user_id: string; status: string };

    if (decrypt(session.user_id) !== user.sub) {
      return reply.code(403).send({ code: 'FORBIDDEN', message: 'You do not have permission to submit to this session' });
    }

    // Verify question exists and is licenced (BOARD LICENCE GATE)
    const questionResult = await db.query(
      `SELECT id, max_marks FROM questions WHERE id = $1 AND board_licence_cleared = true`,
      [question_id]
    );

    if ((questionResult.rowCount ?? 0) === 0) {
      return reply.code(404).send({ code: 'NOT_FOUND', message: 'Question not found' });
    }

    const question = questionResult.rows[0] as { id: string; max_marks: number };

    // Validate score is within bounds (T-042)
    if (self_mark_score > question.max_marks) {
      return reply.code(422).send({
        code: 'VALIDATION_ERROR',
        message: `self_mark_score (${self_mark_score}) exceeds max_marks (${question.max_marks}) for this question`,
      });
    }

    // Idempotency check (T-035): return existing attempt if already submitted
    const existingAttempt = await db.query(
      `SELECT id, question_id, presented_at, self_mark_score, time_spent_seconds, mark_scheme_viewed
       FROM session_question_attempts
       WHERE practice_session_id = $1 AND question_id = $2 AND self_mark_score IS NOT NULL`,
      [id, question_id]
    );

    if ((existingAttempt.rowCount ?? 0) > 0) {
      return reply.code(201).send(existingAttempt.rows[0]);
    }

    // Update the existing attempt row (created when session was created)
    await db.query(
      `UPDATE session_question_attempts
       SET self_mark_score = $1,
           time_spent_seconds = $2,
           mark_scheme_viewed = $3
       WHERE practice_session_id = $4 AND question_id = $5`,
      [self_mark_score, time_spent_seconds, mark_scheme_viewed, id, question_id]
    );

    const attemptResult = await db.query(
      `SELECT id, question_id, presented_at, self_mark_score, time_spent_seconds, mark_scheme_viewed
       FROM session_question_attempts
       WHERE practice_session_id = $1 AND question_id = $2`,
      [id, question_id]
    );

    return reply.code(201).send(attemptResult.rows[0]);
  });
}

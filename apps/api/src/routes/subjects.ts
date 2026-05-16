/**
 * Subject management routes.
 *
 * POST   /subjects        — add a subject for the current user
 * GET    /subjects        — list current user's active subjects
 * DELETE /subjects/:id    — soft-delete a subject (set is_active = false)
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { requireAuth, getAuthUser } from '../middleware/auth-guard.js';

const createSubjectSchema = z.object({
  subject_name: z.string().min(1).max(100),
  exam_board: z.string().min(1).max(50),
  level: z.enum(['11plus', 'ks3', 'gcse', 'alevel']),
});

export default async function subjectsRoutes(fastify: FastifyInstance): Promise<void> {
  const db = fastify.db;

  // ─── POST /subjects ───────────────────────────────────────────────────────

  fastify.post('/subjects', {
    preHandler: [requireAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const parse = createSubjectSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.code(422).send({
        code: 'VALIDATION_ERROR',
        message: 'Request body failed validation',
        details: parse.error.flatten().fieldErrors,
      });
    }

    const user = getAuthUser(request);
    const { subject_name, exam_board, level } = parse.data;
    const subjectId = uuidv4();

    await db.query(
      `INSERT INTO subjects (id, user_id, subject_name, exam_board, level, is_active)
       VALUES ($1, $2, $3, $4, $5, true)`,
      [subjectId, user.sub, subject_name, exam_board, level]
    );

    return reply.code(201).send({
      id: subjectId,
      user_id: user.sub,
      subject_name,
      exam_board,
      level,
      is_active: true,
    });
  });

  // ─── GET /subjects ────────────────────────────────────────────────────────

  fastify.get('/subjects', {
    preHandler: [requireAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = getAuthUser(request);

    const result = await db.query(
      `SELECT id, user_id, subject_name, exam_board, level, is_active
       FROM subjects
       WHERE user_id = $1 AND is_active = true
       ORDER BY created_at DESC`,
      [user.sub]
    );

    return reply.code(200).send({ subjects: result.rows });
  });

  // ─── DELETE /subjects/:id ─────────────────────────────────────────────────

  fastify.delete('/subjects/:id', {
    preHandler: [requireAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = getAuthUser(request);
    const { id } = request.params as { id: string };

    // Validate UUID format
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
      return reply.code(422).send({ code: 'VALIDATION_ERROR', message: 'Invalid subject ID format' });
    }

    // Verify ownership
    const existing = await db.query(
      `SELECT id, user_id FROM subjects WHERE id = $1`,
      [id]
    );

    if ((existing.rowCount ?? 0) === 0) {
      return reply.code(404).send({ code: 'NOT_FOUND', message: 'Subject not found' });
    }

    const subject = existing.rows[0] as { id: string; user_id: string };
    if (subject.user_id !== user.sub) {
      return reply.code(403).send({ code: 'FORBIDDEN', message: 'You do not have permission to delete this subject' });
    }

    await db.query(
      `UPDATE subjects SET is_active = false, updated_at = now() WHERE id = $1`,
      [id]
    );

    return reply.code(204).send();
  });
}

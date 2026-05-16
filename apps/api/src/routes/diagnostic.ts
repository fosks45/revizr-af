/**
 * Diagnostic routes — Sprint 2 scaffold.
 *
 * POST /diagnostic/upload             — create session, presigned S3 URL, enqueue job
 * GET  /diagnostic/status/:jobId      — poll job status
 * GET  /diagnostic/events/:jobId      — SSE stream for job progress
 * GET  /diagnostic/results/:sessionId — weakness map for completed session
 *
 * F31 AI-assisted marking is scaffolded but GATED behind Sprint 2 spike (T-032b).
 * TODO [T-032b]: Implement AI marking endpoint after ADR-0011 is written and approved.
 *
 * Board licence gate: any endpoint returning question content (not diagnostic results)
 * MUST include `WHERE board_licence_cleared = true`. Diagnostic results contain
 * weakness scores derived from uploaded documents — not raw question content.
 *
 * Data: uploaded S3 documents are deleted immediately after processing (ADR-0008, T-025).
 * S3 keys are encrypted at rest (C3 field in uploaded_documents.s3_key).
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { Queue } from 'bullmq';
import { requireAuth, getAuthUser } from '../middleware/auth-guard.js';
import { encrypt, decrypt } from '../lib/encryption.js';
import { generatePresignedPutUrl, buildDiagnosticS3Key } from '../lib/s3.js';
import { writeAuditLog, hashUserIdForAudit } from '../lib/audit.js';

const DIAGNOSTIC_QUEUE_NAME = 'diagnostic';

const uploadSchema = z.object({
  subject_id: z.string().uuid(),
  file_name: z.string().min(1).max(255),
  content_type: z.enum(['application/pdf', 'image/jpeg', 'image/png']),
});

export default async function diagnosticRoutes(fastify: FastifyInstance): Promise<void> {
  const db = fastify.db;
  const redis = fastify.redis;

  // BullMQ queue for diagnostic processing jobs
  const diagnosticQueue = new Queue(DIAGNOSTIC_QUEUE_NAME, {
    connection: redis,
  });

  fastify.addHook('onClose', async () => {
    await diagnosticQueue.close();
  });

  // ─── POST /diagnostic/upload ──────────────────────────────────────────────

  fastify.post('/diagnostic/upload', {
    preHandler: [requireAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const parse = uploadSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.code(422).send({
        code: 'VALIDATION_ERROR',
        message: 'Request body failed validation',
        details: parse.error.flatten().fieldErrors,
      });
    }

    const user = getAuthUser(request);
    const { subject_id, file_name, content_type } = parse.data;

    // Verify subject belongs to user
    const subjectCheck = await db.query(
      `SELECT id FROM subjects WHERE id = $1 AND user_id = $2 AND is_active = true`,
      [subject_id, user.sub]
    );
    if ((subjectCheck.rowCount ?? 0) === 0) {
      return reply.code(422).send({ code: 'VALIDATION_ERROR', message: 'Subject not found or not owned by user' });
    }

    // Free tier check — allow max 3 diagnostic sessions for free users
    // TODO [T-052]: Replace with proper subscription middleware check
    const subResult = await db.query(
      `SELECT plan FROM subscriptions WHERE user_id = $1`,
      [user.sub]
    );
    const plan = (subResult.rows[0] as { plan: string } | undefined)?.plan ?? 'free';

    if (plan === 'free') {
      const sessionCount = await db.query(
        `SELECT COUNT(*) AS cnt FROM diagnostic_sessions WHERE user_id = $1`,
        [user.sub]
      );
      const cnt = parseInt((sessionCount.rows[0] as { cnt: string }).cnt, 10);
      if (cnt >= 3) {
        return reply.code(402).send({
          code: 'SUBSCRIPTION_REQUIRED',
          message: 'Upgrade to continue using the diagnostic feature',
        });
      }
    }

    const sessionId = uuidv4();
    const jobId = uuidv4();

    // Encrypt user_id for diagnostic_sessions (C3 field)
    const encUserId = encrypt(user.sub);

    // Create diagnostic_session
    await db.query(
      `INSERT INTO diagnostic_sessions (id, user_id, session_type, status)
       VALUES ($1, $2, 'report_upload', 'pending')`,
      [sessionId, encUserId]
    );

    // Build S3 key and generate presigned URL
    const s3Key = buildDiagnosticS3Key(user.sub, sessionId, file_name);
    const { url: uploadUrl, expiresAt: uploadExpiresAt } = await generatePresignedPutUrl(s3Key, content_type);

    // Encrypt s3_key for uploaded_documents (C3 field)
    const encS3Key = encrypt(s3Key);

    // Create uploaded_documents record
    await db.query(
      `INSERT INTO uploaded_documents (id, diagnostic_session_id, s3_key, status)
       VALUES ($1, $2, $3, 'uploaded')`,
      [uuidv4(), sessionId, encS3Key]
    );

    // Enqueue BullMQ job
    await diagnosticQueue.add(
      'process-diagnostic',
      {
        jobId,
        sessionId,
        userId: user.sub,
        subjectId: subject_id,
        s3Key,
        contentType: content_type,
      },
      {
        jobId,
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: false,
        removeOnFail: false,
      }
    );

    await writeAuditLog({
      agentOrUserId: hashUserIdForAudit(user.sub),
      action: 'diagnostic.upload.initiated',
      entityType: 'diagnostic_session',
      entityId: sessionId,
      decision: 'allowed',
      policy: 'diagnostic_upload',
      metadata: { job_id: jobId, content_type: content_type },
    });

    return reply.code(201).send({
      job_id: jobId,
      session_id: sessionId,
      upload_url: uploadUrl,
      upload_expires_at: uploadExpiresAt,
    });
  });

  // ─── GET /diagnostic/status/:jobId ────────────────────────────────────────

  fastify.get('/diagnostic/status/:jobId', {
    preHandler: [requireAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = getAuthUser(request);
    const { jobId } = request.params as { jobId: string };

    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(jobId)) {
      return reply.code(422).send({ code: 'VALIDATION_ERROR', message: 'Invalid jobId format' });
    }

    const job = await diagnosticQueue.getJob(jobId);
    if (!job) {
      return reply.code(404).send({ code: 'NOT_FOUND', message: 'Job not found' });
    }

    // Verify ownership: job data contains userId
    const jobData = job.data as { userId: string; sessionId: string };
    if (jobData.userId !== user.sub) {
      return reply.code(403).send({ code: 'FORBIDDEN', message: 'You do not have permission to view this job' });
    }

    const state = await job.getState();

    const statusMap: Record<string, 'pending' | 'processing' | 'complete' | 'failed'> = {
      waiting: 'pending',
      delayed: 'pending',
      active: 'processing',
      completed: 'complete',
      failed: 'failed',
    };

    const status = statusMap[state] ?? 'pending';
    const progress = typeof job.progress === 'number' ? job.progress : 0;

    return reply.code(200).send({
      job_id: jobId,
      status,
      progress_pct: progress,
      error_message: job.failedReason ?? null,
    });
  });

  // ─── GET /diagnostic/events/:jobId — SSE stream ───────────────────────────

  fastify.get('/diagnostic/events/:jobId', {
    preHandler: [requireAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = getAuthUser(request);
    const { jobId } = request.params as { jobId: string };

    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(jobId)) {
      return reply.code(422).send({ code: 'VALIDATION_ERROR', message: 'Invalid jobId format' });
    }

    const job = await diagnosticQueue.getJob(jobId);
    if (!job) {
      return reply.code(404).send({ code: 'NOT_FOUND', message: 'Job not found' });
    }

    const jobData = job.data as { userId: string; sessionId: string };
    if (jobData.userId !== user.sub) {
      return reply.code(403).send({ code: 'FORBIDDEN', message: 'You do not have permission to view this job' });
    }

    // Set SSE headers
    reply.raw.setHeader('Content-Type', 'text/event-stream');
    reply.raw.setHeader('Cache-Control', 'no-cache, no-store, private');
    reply.raw.setHeader('Connection', 'keep-alive');
    reply.raw.setHeader('X-Accel-Buffering', 'no'); // disable nginx buffering
    reply.raw.flushHeaders();

    // Helper to send an SSE event
    function sendEvent(eventData: Record<string, unknown>): void {
      reply.raw.write(`data: ${JSON.stringify(eventData)}\n\n`);
    }

    // Check current job state immediately
    const initialState = await job.getState();

    if (initialState === 'completed') {
      sendEvent({ event: 'complete', job_id: jobId, session_id: jobData.sessionId });
      reply.raw.end();
      return;
    }

    if (initialState === 'failed') {
      sendEvent({ event: 'failed', job_id: jobId, error: job.failedReason });
      reply.raw.end();
      return;
    }

    // Poll for job progress using Redis pub/sub on the BullMQ events channel
    // BullMQ publishes progress updates to `bull:{queueName}:events`
    // We poll with a simple interval for v1 (replace with proper subscription in v2)
    const POLL_INTERVAL_MS = 1000;
    const MAX_WAIT_MS = 120_000; // 2 min hard timeout
    let elapsed = 0;
    let lastProgress = -1;

    const pollInterval = setInterval(async () => {
      elapsed += POLL_INTERVAL_MS;

      if (elapsed > MAX_WAIT_MS) {
        sendEvent({ event: 'timeout', job_id: jobId });
        clearInterval(pollInterval);
        reply.raw.end();
        return;
      }

      const state = await job.getState();
      const progress = typeof job.progress === 'number' ? job.progress : 0;

      if (progress !== lastProgress) {
        lastProgress = progress;
        sendEvent({ event: 'progress', job_id: jobId, progress_pct: progress });
      }

      if (state === 'completed') {
        sendEvent({ event: 'complete', job_id: jobId, session_id: jobData.sessionId });
        clearInterval(pollInterval);
        reply.raw.end();
      } else if (state === 'failed') {
        sendEvent({ event: 'failed', job_id: jobId, error: job.failedReason });
        clearInterval(pollInterval);
        reply.raw.end();
      }
    }, POLL_INTERVAL_MS);

    // Clean up on client disconnect
    request.raw.on('close', () => {
      clearInterval(pollInterval);
    });

    // Prevent Fastify from sending a response — SSE handles this manually
    await new Promise<void>((resolve) => {
      reply.raw.on('close', resolve);
      reply.raw.on('finish', resolve);
    });
  });

  // ─── GET /diagnostic/results/:sessionId ───────────────────────────────────

  fastify.get('/diagnostic/results/:sessionId', {
    preHandler: [requireAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = getAuthUser(request);
    const { sessionId } = request.params as { sessionId: string };

    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sessionId)) {
      return reply.code(422).send({ code: 'VALIDATION_ERROR', message: 'Invalid sessionId format' });
    }

    // Verify session exists and belongs to user
    const sessionResult = await db.query(
      `SELECT id, status, user_id FROM diagnostic_sessions WHERE id = $1`,
      [sessionId]
    );

    if ((sessionResult.rowCount ?? 0) === 0) {
      return reply.code(404).send({ code: 'NOT_FOUND', message: 'Diagnostic session not found' });
    }

    const session = sessionResult.rows[0] as { id: string; status: string; user_id: string };

    // Ownership check: decrypt user_id from session and compare
    const sessionUserId = decrypt(session.user_id);
    if (sessionUserId !== user.sub) {
      return reply.code(403).send({ code: 'FORBIDDEN', message: 'You do not have permission to view these results' });
    }

    if (session.status !== 'complete') {
      return reply.code(400).send({
        code: 'SESSION_NOT_COMPLETE',
        message: 'Diagnostic session is still processing',
      });
    }

    // Fetch results (weakness scores — not C5 evidence snippets which require separate decrypt)
    const resultsResult = await db.query(
      `SELECT topic_tag, weakness_score
       FROM diagnostic_results
       WHERE diagnostic_session_id = $1
       ORDER BY weakness_score DESC`,
      [sessionId]
    );

    return reply.code(200).send({
      session_id: sessionId,
      results: resultsResult.rows,
    });
  });
}

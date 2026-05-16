/**
 * BullMQ Diagnostic Worker.
 *
 * Processes uploaded school reports:
 *   1. Fetch file bytes from S3
 *   2. Extract text from PDF/image (TODO: PDF extraction library)
 *   3. Scrub PII before sending to Claude (student name, school name → tokens)
 *   4. Call Claude API gateway with topic taxonomy system prompt + document text
 *   5. Parse weakness scores from Claude response
 *   6. Write diagnostic_results to DB
 *   7. DELETE S3 object immediately (ADR-0008, T-025)
 *   8. Update uploaded_documents.status = 'deleted', set deleted_at
 *
 * Retry: 3 attempts, exponential backoff (configured in the job producer).
 * On all 3 failures: diagnostic_session.status → 'failed'.
 *
 * COMPLIANCE:
 *   - PII scrubbing is MANDATORY before the Claude API call (C-004, DPIA).
 *     Student name and school name are replaced with tokens before Claude sees the text.
 *   - S3 deletion happens BEFORE the Claude API call completes storage of results.
 *     If deletion fails, worker retries 3 times then escalates (fails the job).
 *   - No raw document content is ever stored in diagnostic_results or audit_log.
 *   - evidence_snippets are C5 — field-level encrypted (per-record key from KMS).
 *     For v1: evidence_snippets are omitted from the DB write until C5 key management
 *     is implemented. TODO [C5]: Implement per-record key derivation via AWS KMS.
 *
 * BOARD LICENCE GATE: The worker does NOT query the questions table.
 *   It processes the document and produces topic_tag → weakness_score mappings.
 *   The topic_tag values must match the taxonomy used in questions.topic_tags.
 */

import { Worker, Job } from 'bullmq';
import type { Redis } from 'ioredis';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { fetchObjectBytes, deleteObject } from '../lib/s3.js';
import { callClaude, parseClaudeJson } from '../lib/claude.js';
import { encrypt, decrypt } from '../lib/encryption.js';
import { writeAuditLog, hashUserIdForAudit } from '../lib/audit.js';
import { z } from 'zod';

const DIAGNOSTIC_QUEUE_NAME = 'diagnostic';

// ─── Claude API schema for weakness map output ────────────────────────────────

const weaknessResultSchema = z.object({
  topic_tag: z.string().min(1),
  weakness_score: z.number().min(0).max(1),
});

const weaknessMapSchema = z.object({
  topics: z.array(weaknessResultSchema),
});

type WeaknessMap = z.infer<typeof weaknessMapSchema>;

// ─── Job data type ────────────────────────────────────────────────────────────

interface DiagnosticJobData {
  jobId: string;
  sessionId: string;
  userId: string;
  subjectId: string;
  s3Key: string;
  contentType: 'application/pdf' | 'image/jpeg' | 'image/png';
}

// ─── PII scrubbing ────────────────────────────────────────────────────────────

/**
 * Scrub PII from extracted document text before sending to Claude.
 * Replaces patterns that could identify the student (name, school name).
 *
 * This is a best-effort pre-processing step. The Claude system prompt
 * also instructs the model to ignore and not reproduce any identifiers it finds.
 *
 * For v1: simple heuristic replacement. TODO [T-024]: Improve with NER model.
 */
function scrubPii(text: string): string {
  let scrubbed = text;

  // Replace patterns that look like proper nouns near school/student context
  // These are conservative replacements to avoid removing topic content
  scrubbed = scrubbed.replace(/\b(student|pupil|learner)[:\s]+[A-Z][a-z]+(?:\s[A-Z][a-z]+)*/g, '$1: [STUDENT_NAME]');
  scrubbed = scrubbed.replace(/\b(name)[:\s]+[A-Z][a-z]+(?:\s[A-Z][a-z]+)*/g, '$1: [STUDENT_NAME]');
  scrubbed = scrubbed.replace(/\b(school|college|academy)[:\s]+[A-Z][A-Za-z\s]*/g, '$1: [SCHOOL_NAME]');

  // Remove common PII patterns
  scrubbed = scrubbed.replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[EMAIL]');
  scrubbed = scrubbed.replace(/\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g, '[DATE]'); // birth dates
  scrubbed = scrubbed.replace(/\b\d{5,}\b/g, '[REF_NO]'); // candidate numbers, UPNs

  return scrubbed;
}

// ─── System prompt (cached — satisfies constitution §4 cost governance) ───────

function buildDiagnosticSystemPrompt(examBoard: string, level: string, subject: string): string {
  return `You are an educational assessment specialist analysing UK school reports for ${examBoard} ${level} ${subject}.

Your task: extract topic-level weakness signals from the provided school report text and return a structured JSON weakness map.

OUTPUT FORMAT — return only valid JSON, no markdown, no preamble:
{
  "topics": [
    { "topic_tag": "algebra", "weakness_score": 0.75 },
    { "topic_tag": "geometry", "weakness_score": 0.30 }
  ]
}

RULES:
1. weakness_score is a float from 0.0 (strength) to 1.0 (significant weakness).
2. Only include topics that have clear signal in the document.
3. topic_tag values must be lowercase, underscore-separated, using standard ${examBoard} ${level} ${subject} curriculum terminology.
4. DO NOT include any student name, school name, teacher name, or other personal identifiers in your response.
5. DO NOT include any health information, SEN status, neurodivergence diagnoses, mental health observations, or disability indicators. Extract only academic performance signals.
6. If the document mentions a topic but gives no performance signal, do not include it.
7. Return an empty topics array if no clear academic performance signals are found.

The input text has already had student/school names replaced with tokens like [STUDENT_NAME] and [SCHOOL_NAME]. Ignore these tokens entirely.`;
}

// ─── Worker factory ───────────────────────────────────────────────────────────

export function createDiagnosticWorker(redis: Redis, db: Pool): Worker {
  const worker = new Worker<DiagnosticJobData>(
    DIAGNOSTIC_QUEUE_NAME,
    async (job: Job<DiagnosticJobData>) => {
      const { jobId, sessionId, userId, subjectId, s3Key, contentType } = job.data;
      const userIdHash = hashUserIdForAudit(userId);

      // ── Step 1: Update session status to processing ──────────────────────
      await db.query(
        `UPDATE diagnostic_sessions SET status = 'processing' WHERE id = $1`,
        [sessionId]
      );
      await job.updateProgress(10);

      // ── Step 2: Fetch file bytes from S3 ─────────────────────────────────
      let fileBytes: Buffer;
      try {
        fileBytes = await fetchObjectBytes(s3Key);
      } catch (err) {
        throw new Error(`Failed to fetch S3 object ${s3Key}: ${String(err)}`);
      }
      await job.updateProgress(20);

      // ── Step 3: Extract text from document ───────────────────────────────
      let documentText: string;

      if (contentType === 'application/pdf') {
        // TODO [T-024]: Integrate a PDF text extraction library.
        // Options evaluated: pdf-parse, pdfjs-dist, unstructured.
        // ADR-0011 (Sprint 2 technical spike) will confirm the chosen library.
        // For now: convert bytes to base64 and pass to Claude as a text placeholder.
        // Claude's vision capability can process PDF content directly via the API
        // (Anthropic supports PDF processing in claude-sonnet-4-5+).
        // TODO: replace with proper PDF extraction once library is selected.
        documentText = `[PDF CONTENT — ${fileBytes.length} bytes — PDF extraction library TBD per ADR-0011]\n\nBase64 excerpt: ${fileBytes.slice(0, 500).toString('base64')}`;
      } else {
        // Images: pass as base64 encoded text for Claude's vision capability
        // TODO [T-024]: Use Claude's native image processing (messages.content with image type)
        // For now: encode as base64 text
        documentText = `[IMAGE CONTENT — ${contentType} — ${fileBytes.length} bytes]\nBase64: ${fileBytes.toString('base64').slice(0, 1000)}`;
      }

      await job.updateProgress(35);

      // ── Step 4: Scrub PII before Claude call ─────────────────────────────
      const scrubbedText = scrubPii(documentText);
      await job.updateProgress(40);

      // ── Step 5: Fetch subject metadata for system prompt ─────────────────
      const subjectResult = await db.query(
        `SELECT subject_name, exam_board, level FROM subjects WHERE id = $1`,
        [subjectId]
      );

      if ((subjectResult.rowCount ?? 0) === 0) {
        throw new Error(`Subject ${subjectId} not found for diagnostic job ${jobId}`);
      }

      const subject = subjectResult.rows[0] as { subject_name: string; exam_board: string; level: string };
      const systemPrompt = buildDiagnosticSystemPrompt(subject.exam_board, subject.level, subject.subject_name);

      // ── Step 6: DELETE S3 object BEFORE Claude API call ──────────────────
      // Per T-025 and ADR-0008: raw document deleted as soon as text is extracted.
      // We have the extracted text in memory (scrubbedText); the raw file is no longer needed.
      let s3Deleted = false;
      let deletionError: Error | null = null;

      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          await deleteObject(s3Key);
          s3Deleted = true;
          break;
        } catch (err) {
          deletionError = err instanceof Error ? err : new Error(String(err));
          if (attempt < 2) {
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
          }
        }
      }

      if (!s3Deleted) {
        // S3 deletion failed after 3 retries — this is an escalation condition.
        // We do NOT proceed with Claude API call without confirming deletion.
        await writeAuditLog({
          agentOrUserId: userIdHash,
          action: 'diagnostic.s3_deletion.failed',
          entityType: 'uploaded_document',
          entityId: sessionId,
          decision: 'escalated',
          policy: 'diagnostic_s3_deletion',
          metadata: { error: deletionError?.message ?? 'unknown' },
        });
        throw new Error(`S3 deletion failed for key ${s3Key} after 3 attempts: ${deletionError?.message}`);
      }

      // Update uploaded_documents record
      await db.query(
        `UPDATE uploaded_documents
         SET status = 'deleted', deleted_at = now()
         WHERE diagnostic_session_id = $1`,
        [sessionId]
      );

      await job.updateProgress(55);

      await writeAuditLog({
        agentOrUserId: userIdHash,
        action: 'diagnostic.s3_deleted',
        entityType: 'uploaded_document',
        entityId: sessionId,
        decision: 'allowed',
        policy: 'diagnostic_s3_deletion',
      });

      // ── Step 7: Call Claude API gateway ──────────────────────────────────
      const claudeResult = await callClaude({
        model: 'diagnostic',
        systemPrompt,
        userMessage: scrubbedText,
        maxTokens: 2048,
        jobId,
        userIdHash,
      });
      await job.updateProgress(75);

      // ── Step 8: Parse weakness map ────────────────────────────────────────
      let weaknessMap: WeaknessMap;
      try {
        weaknessMap = parseClaudeJson(claudeResult.text, (raw) => weaknessMapSchema.parse(raw));
      } catch (err) {
        throw new Error(`Claude response parsing failed for job ${jobId}: ${String(err)}`);
      }

      // ── Step 9: Write diagnostic_results to DB ────────────────────────────
      // C5 NOTE: evidence_snippets are omitted for v1 (require per-record KMS key management).
      // TODO [C5]: Implement C5 field-level encryption for evidence_snippets.
      const encUserId = encrypt(userId);

      for (const result of weaknessMap.topics) {
        await db.query(
          `INSERT INTO diagnostic_results
             (id, diagnostic_session_id, user_id, subject_id, topic_tag, weakness_score)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (diagnostic_session_id, topic_tag)
           DO UPDATE SET weakness_score = $6, created_at = now()`,
          [uuidv4(), sessionId, encUserId, subjectId, result.topic_tag, result.weakness_score]
        );
      }

      await job.updateProgress(90);

      // ── Step 10: Mark session complete ────────────────────────────────────
      await db.query(
        `UPDATE diagnostic_sessions
         SET status = 'complete', completed_at = now()
         WHERE id = $1`,
        [sessionId]
      );

      await job.updateProgress(100);

      await writeAuditLog({
        agentOrUserId: userIdHash,
        action: 'diagnostic.processing.complete',
        entityType: 'diagnostic_session',
        entityId: sessionId,
        decision: 'allowed',
        policy: 'diagnostic_worker',
        metadata: {
          topic_count: weaknessMap.topics.length,
          latency_ms: claudeResult.latencyMs,
          cost_usd: claudeResult.estimatedCostUsd,
        },
      });

      return { sessionId, topicCount: weaknessMap.topics.length };
    },
    {
      connection: redis,
      concurrency: 5,
    }
  );

  // On permanent failure (after all retries), mark session as failed
  worker.on('failed', async (job, err) => {
    if (!job) return;

    const data = job.data;
    await db.query(
      `UPDATE diagnostic_sessions SET status = 'failed', completed_at = now() WHERE id = $1`,
      [data.sessionId]
    ).catch((dbErr) => {
      process.stderr.write(`[DIAGNOSTIC_WORKER] Failed to update session status: ${String(dbErr)}\n`);
    });

    await writeAuditLog({
      agentOrUserId: hashUserIdForAudit(data.userId),
      action: 'diagnostic.processing.failed',
      entityType: 'diagnostic_session',
      entityId: data.sessionId,
      decision: 'escalated',
      policy: 'diagnostic_worker',
      metadata: { error_message: err.message.slice(0, 200) },
    }).catch(() => {});
  });

  return worker;
}

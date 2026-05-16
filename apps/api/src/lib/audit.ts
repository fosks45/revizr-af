/**
 * Append-only audit log writer — Principle 10 compliance.
 *
 * Rules (non-negotiable per constitution Principle 10 and data model):
 *   - No user content, no prompt text, no PII VALUES are ever written here.
 *   - Only metadata: action names, entity IDs (opaque), decisions, policy names,
 *     token counts, latency, cost.
 *   - The audit_log table has INSERT-only permissions for the application DB role.
 *   - Every auth event, diagnostic event, subscription event, and GDPR action
 *     must produce an audit row.
 *
 * Classification of audit_log rows: C0 — no PII in any field.
 */

import type { Pool } from 'pg';

export type AuditDecision = 'allowed' | 'denied' | 'escalated';

export interface AuditEntry {
  /** Opaque user UUID hash (SHA-256) or agent identifier. Never raw user_id. */
  agentOrUserId: string;
  /** Action identifier, e.g. 'auth.login.success', 'diagnostic.upload.initiated' */
  action: string;
  /** Entity type, e.g. 'user', 'diagnostic_session', 'subscription' */
  entityType: string;
  /** Entity UUID or opaque string identifier */
  entityId: string;
  /** Governance outcome */
  decision: AuditDecision;
  /** Policy that produced the decision */
  policy?: string;
  /**
   * Structured metadata — NO user content, NO PII values.
   * Allowed keys: token counts, latency_ms, cost_usd, model_id, job_id, error_code.
   */
  metadata?: Record<string, string | number | boolean | null>;
}

let _pool: Pool | null = null;

export function initAuditWriter(pool: Pool): void {
  _pool = pool;
}

/**
 * Write an audit log entry. Fire-and-forget — failures are logged to stderr
 * but do NOT propagate (audit failure must not block the business operation,
 * but is always surfaced in stderr for monitoring).
 *
 * If the database pool is unavailable (e.g. during tests), the entry is
 * written to stderr only. This must be replaced in production with a
 * queue-backed fallback to prevent audit gaps.
 */
export async function writeAuditLog(entry: AuditEntry): Promise<void> {
  const row = {
    agent_or_user_id: entry.agentOrUserId,
    action: entry.action,
    entity_type: entry.entityType,
    entity_id: entry.entityId,
    decision: entry.decision,
    policy: entry.policy ?? 'default',
    metadata_json: entry.metadata ?? {},
  };

  if (!_pool) {
    // Development/test mode: log to stderr only
    process.stderr.write(`[AUDIT] ${JSON.stringify(row)}\n`);
    return;
  }

  try {
    await _pool.query(
      `INSERT INTO audit_log
         (agent_or_user_id, action, entity_type, entity_id, decision, policy, metadata_json)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        row.agent_or_user_id,
        row.action,
        row.entity_type,
        row.entity_id,
        row.decision,
        row.policy,
        JSON.stringify(row.metadata_json),
      ]
    );
  } catch (err) {
    // F-SEC-005 FIX: Audit write failure is a Principle 10 violation — log to
    // stderr AND enqueue to a Redis dead-letter list so the record can be replayed.
    // The dead-letter key is consumed by a separate reconciliation job.
    process.stderr.write(`[AUDIT_WRITE_ERROR] ${String(err)} | entry=${JSON.stringify(row)}\n`);
    try {
      // Lazy-import Redis to avoid circular deps. If Redis is also down, the
      // stderr line above is the last resort — acceptable for a dual failure.
      const { redisClient } = await import('./redis-client.js');
      if (redisClient) {
        await redisClient.lpush(
          'audit_dead_letter',
          JSON.stringify({ timestamp: new Date().toISOString(), entry: row, error: String(err) })
        );
      }
    } catch {
      // Redis also unavailable — stderr is the only record. Alert threshold
      // on AUDIT_WRITE_ERROR in production monitoring should page on-call.
    }
  }
}

/**
 * Hash a user_id for use as agentOrUserId in audit entries.
 * This ensures the audit log contains no direct foreign key link
 * to the users table (immutability preservation).
 */
export function hashUserIdForAudit(userId: string): string {
  const { createHash } = require('node:crypto') as typeof import('node:crypto');
  return createHash('sha256').update(`audit:${userId}`).digest('hex').slice(0, 32);
}

/**
 * Claude API Gateway — server-side only.
 *
 * COMPLIANCE: This module MUST NOT be imported by any browser-side code.
 * All Anthropic API calls in this product go through this gateway — no direct
 * SDK calls elsewhere (Principle 10, ADR-0004, compliance condition C-013).
 *
 * Every call is logged to the audit ledger:
 *   { action: 'claude_api_call', model_id, tokens_in, tokens_out, latency_ms, cost_usd }
 *   NO prompt content is logged (C3+ data must not appear in audit log in plaintext).
 *   prompt_hash (SHA-256 of system+user prompt) IS logged for traceability.
 *
 * Prompt caching is applied to system prompts exceeding 1024 tokens per the
 * constitution §4 cost governance requirement ("Failing to cache a pattern that
 * qualifies is a cost governance defect").
 *
 * Model tiering (ADR-0004):
 *   - DIAGNOSTIC: claude-sonnet-4-5 (complex document comprehension)
 *   - SUMMARY:    claude-haiku-3-5  (structured data → prose, lower cost)
 */

import Anthropic from '@anthropic-ai/sdk';
import { createHash } from 'node:crypto';
import { writeAuditLog } from './audit.js';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ClaudeCallOptions {
  /** Which model tier to use */
  model: 'diagnostic' | 'summary';
  /** System prompt (will be cached if ≥ 1024 tokens estimated) */
  systemPrompt: string;
  /** User message content — the document text or data payload */
  userMessage: string;
  /** Maximum tokens to generate */
  maxTokens?: number;
  /** Opaque job/session identifier for audit correlation */
  jobId?: string;
  /** Opaque user ID hash for audit (never raw user_id) */
  userIdHash?: string;
}

export interface ClaudeCallResult {
  /** The text content of the model's first choice */
  text: string;
  /** Token usage for cost accounting */
  usage: {
    inputTokens: number;
    outputTokens: number;
    cacheReadInputTokens: number;
    cacheCreationInputTokens: number;
  };
  /** Wall-clock latency in milliseconds */
  latencyMs: number;
  /** Estimated cost in USD (informational; actual billing is on Anthropic side) */
  estimatedCostUsd: number;
}

// ─── Pricing (as of 2026-05; re-check quarterly per constitution §4) ─────────

const PRICING: Record<string, { input: number; output: number; cacheWrite: number; cacheRead: number }> = {
  'claude-sonnet-4-5': { input: 0.000003, output: 0.000015, cacheWrite: 0.00000375, cacheRead: 0.0000003 },
  'claude-haiku-3-5':  { input: 0.00000025, output: 0.00000125, cacheWrite: 0.0000003, cacheRead: 0.000000025 },
};

const MODEL_MAP: Record<'diagnostic' | 'summary', string> = {
  diagnostic: 'claude-sonnet-4-5',
  summary:    'claude-haiku-3-5',
};

// ─── Gateway ─────────────────────────────────────────────────────────────────

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!_client) {
    const apiKey = process.env['ANTHROPIC_API_KEY'];
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not set. Claude API is unavailable.');
    }
    _client = new Anthropic({ apiKey });
  }
  return _client;
}

/**
 * Call the Claude API through the instrumented gateway.
 *
 * PII scrubbing responsibility: callers MUST scrub PII from userMessage before
 * calling this function. The worker (diagnostic.worker.ts) is responsible for
 * replacing student name and school name tokens before this call.
 *
 * Prompt caching: the system prompt is automatically cached using Anthropic's
 * ephemeral cache_control when the estimated token count exceeds 1024 tokens.
 * This satisfies the cost governance requirement in constitution §4.
 *
 * Retries: callers are responsible for retry logic. The gateway does not retry
 * internally to avoid double-billing on partial successes. The BullMQ worker
 * handles retries at the job level (max 3 attempts with exponential backoff).
 */
export async function callClaude(options: ClaudeCallOptions): Promise<ClaudeCallResult> {
  const client = getClient();
  const modelId = MODEL_MAP[options.model];
  const maxTokens = options.maxTokens ?? 4096;

  // Estimate token count for cache decision (rough: 4 chars ≈ 1 token)
  const estimatedSystemTokens = Math.ceil(options.systemPrompt.length / 4);
  const shouldCache = estimatedSystemTokens >= 1024;

  // Build prompt hash for audit (SHA-256 of full prompt — NOT logged as content)
  const promptHash = createHash('sha256')
    .update(options.systemPrompt + options.userMessage)
    .digest('hex');

  const startTime = Date.now();

  // Build the messages array with optional prompt caching
  const systemContent: Anthropic.TextBlockParam[] = shouldCache
    ? [{
        type: 'text',
        text: options.systemPrompt,
        // @ts-expect-error — cache_control is a valid Anthropic API field; SDK types may lag
        cache_control: { type: 'ephemeral' },
      }]
    : [{ type: 'text', text: options.systemPrompt }];

  const response = await client.messages.create({
    model: modelId,
    max_tokens: maxTokens,
    system: systemContent,
    messages: [
      { role: 'user', content: options.userMessage },
    ],
  });

  const latencyMs = Date.now() - startTime;

  const usage = response.usage as {
    input_tokens: number;
    output_tokens: number;
    cache_read_input_tokens?: number;
    cache_creation_input_tokens?: number;
  };

  const inputTokens = usage.input_tokens;
  const outputTokens = usage.output_tokens;
  const cacheReadTokens = usage.cache_read_input_tokens ?? 0;
  const cacheCreationTokens = usage.cache_creation_input_tokens ?? 0;

  // Compute estimated cost
  const pricing = PRICING[modelId] ?? PRICING['claude-sonnet-4-5']!;
  const estimatedCostUsd =
    (inputTokens * pricing.input) +
    (outputTokens * pricing.output) +
    (cacheCreationTokens * pricing.cacheWrite) +
    (cacheReadTokens * pricing.cacheRead);

  // Derive response hash for audit (hash of response text, not the content itself)
  const responseText = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map(b => b.text)
    .join('');
  const responseHash = createHash('sha256').update(responseText).digest('hex');

  // ─── Audit log — NO prompt content, NO response content ───────────────────
  await writeAuditLog({
    agentOrUserId: options.userIdHash ?? 'system',
    action: 'claude_api_call',
    entityType: 'ai_call',
    entityId: options.jobId ?? 'unknown',
    decision: 'allowed',
    policy: 'claude_gateway',
    metadata: {
      model_id: modelId,
      prompt_hash: promptHash,
      response_hash: responseHash,
      tokens_in: inputTokens,
      tokens_out: outputTokens,
      cache_read_tokens: cacheReadTokens,
      cache_creation_tokens: cacheCreationTokens,
      latency_ms: latencyMs,
      cost_usd: estimatedCostUsd,
      cache_applied: shouldCache,
    },
  });

  return {
    text: responseText,
    usage: {
      inputTokens,
      outputTokens,
      cacheReadInputTokens: cacheReadTokens,
      cacheCreationInputTokens: cacheCreationTokens,
    },
    latencyMs,
    estimatedCostUsd,
  };
}

/**
 * Parse a Claude response as JSON, validating against the provided Zod schema.
 * Throws if the response is not valid JSON or does not match the schema.
 * Used by the diagnostic worker to validate the weakness map output.
 */
export function parseClaudeJson<T>(text: string, validate: (raw: unknown) => T): T {
  // Claude sometimes wraps JSON in markdown fences — strip them
  const stripped = text
    .replace(/^```(?:json)?\s*/m, '')
    .replace(/\s*```$/m, '')
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(stripped);
  } catch {
    throw new Error(`Claude response is not valid JSON. Raw: ${stripped.slice(0, 200)}`);
  }

  return validate(parsed);
}

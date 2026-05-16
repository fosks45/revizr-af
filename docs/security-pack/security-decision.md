---
phase: 9
gate: security-sign-off
status: passed-with-conditions
risk-classification: medium
critical-findings: []
remediated-findings:
  - F-SEC-001: FIXED — SSE now uses fetch-based reader with Authorization header (apps/web/lib/api.ts)
  - F-SEC-002: FIXED — Rate limit added to POST /auth/reset-password (5/hour)
  - F-SEC-003: FIXED — encrypt(user.sub) replaced with raw UUID in all subscriptions WHERE clauses
  - F-SEC-004: FIXED — Hard startup guard throws in production when CORS_ORIGIN is unset
  - F-SEC-005: FIXED — Audit dead-letter via Redis lpush on write failure
conditions:
  - OpenAPI role enum: remove 'teacher' from users role enum in openapi.yaml (cosmetic cleanup)
  - GDPR hard-delete: account deletion must cancel Stripe subscription and cascade-delete student data (tracked as pre-launch item in quality-pack)
  - Human DPO sign-off on auth architecture (compliance condition C-001) — not a code gap, a governance gate
human-approval-required: true
remediated-at: 2026-05-16
reviewed-by: Security Lead (automated review — human sign-off required per constitution §2)
reviewed-at: 2026-05-16
evidence-files:
  - products/002-revizr/apps/api/src/plugins/auth.ts
  - products/002-revizr/apps/api/src/routes/auth.ts
  - products/002-revizr/apps/api/src/routes/diagnostic.ts
  - products/002-revizr/apps/api/src/routes/subscriptions.ts
  - products/002-revizr/apps/api/src/lib/encryption.ts
  - products/002-revizr/apps/api/src/lib/claude.ts
  - products/002-revizr/apps/api/src/middleware/auth-guard.ts
  - products/002-revizr/apps/web/middleware.ts
  - products/002-revizr/apps/web/app/(auth)/register/page.tsx
  - products/002-revizr/apps/api/src/lib/audit.ts
  - products/002-revizr/apps/api/src/lib/stripe.ts
  - products/002-revizr/apps/api/src/server.ts
  - products/002-revizr/apps/api/src/workers/diagnostic.worker.ts
  - products/002-revizr/apps/web/lib/api.ts
---

# Security Decision — Revizr Phase 9

## Executive Summary

The codebase demonstrates strong security fundamentals: Argon2id password hashing, RS256 JWT with 15-minute TTL, AES-256-GCM column encryption for all C3+ fields, HMAC-SHA256 email lookup index, Stripe webhook signature verification, stripe_customer_id and stripe_subscription_id never returned in API responses, student self-registration blocked at both server and UI layers, PII scrubbing before Claude API calls, and an append-only audit log with hashed user IDs.

Two blockers prevent an unconditional pass: a JWT token exposed in an SSE URL and a missing rate limit on password reset. Three important conditions require resolution before launch. The deployment MUST NOT proceed to production until all critical findings are remediated and a human security engineer signs off this document.

---

## Findings

### 🔴 CRITICAL — F-SEC-001: JWT Access Token Exposed in SSE URL Query Parameter

**File:** `products/002-revizr/apps/web/lib/api.ts`, line 439–441

**Detail:**
```typescript
const token = _accessToken ?? "";
const url = `${BASE_URL}/diagnostic/events/${jobId}?token=${encodeURIComponent(token)}`;
const es = new EventSource(url);
```

The `connectJobSSE` function appends the live JWT access token as a plain `?token=` query parameter. EventSource does not support custom headers, but the workaround chosen places a C6 credential directly in:

- Server access logs (nginx, ALB, CloudWatch) — the full URL including query string is logged by every layer by default.
- Browser history.
- Referrer headers on any subsequent navigation.
- Any CDN or proxy cache key.

The comment in the code acknowledges this ("The server must accept `?token=` as an alternative to Authorization header") but the server-side `diagnostic.ts` route does **not** implement query-param token reading — it uses `requireAuth` which only reads the `Authorization: Bearer` header. This means the SSE endpoint will currently return 401 for all real clients that use `connectJobSSE`. The security issue and the functional breakage are both present simultaneously.

**Classification:** C6 credential exposure in logs — constitution §3 C6 class: "never logged".

**Recommendation:** Replace `EventSource` with a `fetch`-based SSE reader using the Streams API or a wrapper library (e.g. `@microsoft/fetch-event-source`). This allows a standard `Authorization: Bearer` header. Remove the `?token=` query-param pattern entirely from both client and server. The server endpoint must NOT accept token via URL query string.

---

### 🔴 CRITICAL — F-SEC-002: No Rate Limit on POST /auth/reset-password

**File:** `products/002-revizr/apps/api/src/routes/auth.ts`, line 375

**Detail:**
```typescript
fastify.post('/auth/reset-password', async (request: FastifyRequest, reply: FastifyReply) => {
```

Every other sensitive auth endpoint has an explicit per-route rate limit:
- `/auth/register` → 5 per hour
- `/auth/login` → 10 per 15 minutes
- `/auth/forgot-password` → 5 per hour
- `/auth/refresh` → 10 per 15 minutes

`/auth/reset-password` has no `config: { rateLimit: ... }` and falls through to the global default of 100 per minute. A reset token is a 64-char hex value (256-bit entropy) so brute-force is not practical, but the absence of a route-specific limit means an attacker can spray this endpoint at 100 rpm for other abuse patterns (e.g. repeated hash computation to exhaust CPU, or as a timing oracle). More critically, alignment with the security model is incomplete.

**Recommendation:** Add `config: { rateLimit: { max: 5, timeWindow: '1 hour' } }` to this route, consistent with `/auth/forgot-password`.

---

### 🟡 IMPORTANT — F-SEC-003: subscriptions.ts Uses `encrypt(user.sub)` for WHERE Clause Lookups

**File:** `products/002-revizr/apps/api/src/routes/subscriptions.ts`, lines 57, 116, 186

**Detail:**
```typescript
// Line 57
const result = await db.query(
  `SELECT id, plan, status, current_period_end, cancelled_at FROM subscriptions WHERE user_id = $1`,
  [encrypt(user.sub)]
);
```

`encrypt()` in `lib/encryption.ts` uses a **non-deterministic IV** (random 12-byte IV per call). Each call to `encrypt(user.sub)` produces a different ciphertext. Using this as a `WHERE user_id = $1` predicate will never match any stored row because the stored ciphertext (written during `checkout.session.completed` at line 288) was a different encryption call with a different IV.

This is a data integrity and a latent security issue. If the queries are silently returning zero rows, the subscription check at line 119–125 (`currentSub && currentSub.plan !== 'free'`) will always see `currentSub === undefined` and allow a checkout session to be created even for users already on a paid plan. The `/subscriptions/me` endpoint will always return the synthetic "free tier" fallback at line 62–68 for any paid user.

The `diagnostic.ts` route correctly uses the raw `user.sub` UUID for its subject ownership check (`WHERE user_id = $2` at line 68-70) and compares against a deterministic HMAC hash for session ownership. The subscriptions routes are inconsistent.

**Possible intent:** The `subscriptions` table may store `user_id` as the raw UUID (not encrypted), with only `stripe_subscription_id` and `stripe_customer_id` encrypted. If so, remove the `encrypt()` wrapper from the WHERE clause parameters at lines 57, 116, and 186. Confirm the migration for the subscriptions table and align accordingly.

**Recommendation:** Audit the subscriptions table schema. If `user_id` is stored as raw UUID (the most likely correct design, since it is a foreign key to `users.id`), remove `encrypt(user.sub)` from all subscription WHERE clauses. If it is encrypted, switch to a deterministic HMAC index equivalent to `email_hash`. Fix before launch — until this is resolved, subscription gating does not function correctly for paid users.

---

### 🟡 IMPORTANT — F-SEC-004: CORS Allows `false` (No Origin Restriction) When `CORS_ORIGIN` is Unset

**File:** `products/002-revizr/apps/api/src/server.ts`, lines 94–100

**Detail:**
```typescript
const corsOrigin = process.env['CORS_ORIGIN'];
await fastify.register(cors, {
  origin: corsOrigin ?? false,
  ...
});
```

When `CORS_ORIGIN` is not set, `origin: false` is passed to `@fastify/cors`. Per the `@fastify/cors` documentation, `origin: false` **disables CORS entirely** (no `Access-Control-Allow-Origin` header is emitted). In a browser context this blocks all cross-origin requests, which is safe. However, `origin: false` does not cause the server to fail startup — a misconfigured production deployment where the env var is accidentally absent would silently block all frontend requests without any logging or alerting.

There is no startup validation that `CORS_ORIGIN` is set in production (unlike `JWT_PRIVATE_KEY_PEM`, `ENCRYPTION_KEY`, and `AWS_DEFAULT_REGION` which all fail fast).

**Recommendation:** Add a production-mode startup guard: if `NODE_ENV === 'production'` and `CORS_ORIGIN` is not set, write a FATAL log and exit. Add `CORS_ORIGIN` to the environment variable checklist in the deployment runbook. The current behaviour is safe (no unintended cross-origin access) but silent failure is a deployment reliability risk.

---

### 🟡 IMPORTANT — F-SEC-005: Audit Log is Fire-and-Forget with No Dead-Letter Fallback

**File:** `products/002-revizr/apps/api/src/lib/audit.ts`, lines 54–91

**Detail:**
```typescript
// Audit write failure: surface to stderr for monitoring but do not throw.
// In production, this should also push to a dead-letter queue.
process.stderr.write(`[AUDIT_WRITE_ERROR] ${String(err)} | entry=${JSON.stringify(row)}\n`);
```

The comment itself acknowledges the gap. The audit log is append-only and constitutes the primary compliance evidence surface (constitution Principle 6 and Principle 10). An audit write failure during a DB connection blip or table lock silently drops the record with only a stderr write. In a containerised environment, stderr is captured by the log aggregator but there is no replay mechanism. Constitution Principle 10 requires that every model call and every governance decision is logged; a dropped audit row is a compliance gap.

**Recommendation:** Before production traffic, implement the dead-letter mechanism noted in the TODO. Options: BullMQ queue named `audit-dlq` with a dedicated low-priority worker, or a Redis LPUSH fallback with a sweeper job. The dead-letter store must itself be append-only (never delete from it without a human-approved GDPR erasure workflow).

---

### 🟢 SUGGESTION — F-SEC-006: `hashIpAddress` and `hashUserIdForAudit` Use `require()` Inside ES Module Functions

**File:** `products/002-revizr/apps/api/src/lib/encryption.ts`, lines 113–114; `audit.ts` line 99

**Detail:**
```typescript
const { createHash } = require('node:crypto') as typeof import('node:crypto');
```

These functions use CommonJS `require()` inline rather than the top-level ES module `import`. This works (Node.js allows mixed module interop) but is inconsistent with the rest of the codebase and may cause subtle issues if the module is ever moved to strict ESM. The `createHash` function is already available from the top-level import in `encryption.ts` (`import { createCipheriv, createDecipheriv, createHmac, randomBytes } from 'node:crypto'`).

**Recommendation:** Replace the inline `require('node:crypto')` calls with the already-imported `createHash` from the existing top-level destructured import. Low risk, purely a code quality issue.

---

### 🟢 SUGGESTION — F-SEC-007: `safeCompare` Length Branch Does Not Actually Compare in Constant Time

**File:** `products/002-revizr/apps/api/src/lib/encryption.ts`, lines 121–132

**Detail:**
```typescript
export function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    const dummyA = Buffer.alloc(32);
    const dummyB = Buffer.alloc(32);
    timingSafeEqual(dummyA, dummyB); // always true, result discarded
    return false;
  }
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
```

The function does the right thing for equal-length inputs. For unequal-length inputs it performs a dummy comparison (which the result of is discarded) and then returns `false`. The dummy comparison adds a fixed small delay regardless of which input was longer or shorter, which partially mitigates timing leaks but doesn't prevent an attacker from distinguishing "wrong length" from "right length, wrong content" by measuring the length check itself. The standard pattern is to pad both buffers to a common length before `timingSafeEqual`.

`safeCompare` does not appear to be called anywhere in the currently reviewed files, so this is not an active risk today. If used for token comparison in future, it should be corrected.

**Recommendation:** Pad both inputs to `Math.max(a.length, b.length)` before calling `timingSafeEqual`, or use a well-tested library such as `crypto.timingSafeEqual` directly with HMAC-derived fixed-length buffers.

---

## Confirmed-Safe Areas (Explicitly Verified)

The following compliance requirements from the compliance pack were checked and are correctly implemented:

| Requirement | Status | Evidence |
|---|---|---|
| C7: No student self-registration endpoint | PASS | `auth.ts` line 107–112: role=student returns 403. `RegisterForm.tsx` line 109: hardcodes `role: "parent"`. No role selector in UI. |
| C3: Email encrypted before DB write | PASS | `auth.ts` line 115: `encryptEmail(email)` called before INSERT. HMAC hash used for lookup. |
| C3: display_name encrypted before DB write | PASS | `auth.ts` line 116: `encrypt(display_name)`. |
| C6: password_hash never in logs | PASS | `server.ts` line 62: `req.body.password` and `req.body.new_password` in Fastify redact list. |
| C6: refresh_token never in logs | PASS | `server.ts` line 65–66: `req.body.refresh_token` and `req.body.token` in redact list. |
| C6: access token not in localStorage | PASS | `api.ts` lines 155–163: token stored in module-scope memory variable only. Comment explicitly forbids localStorage. |
| C4: No card data in API responses | PASS | `subscriptions.ts` line 79–86: SELECT excludes `stripe_subscription_id` and `stripe_customer_id`. |
| C4: Stripe webhook signature verified | PASS | `subscriptions.ts` lines 217–232: `verifyStripeWebhook()` called before any event processing. Invalid signature returns 400 before handleStripeEvent. |
| C4: Stripe redirect URLs validated against allowlist | PASS | `stripe.ts` lines 31–60: origin compared against `STRIPE_ALLOWED_REDIRECT_ORIGINS` env var. |
| Prompt injection: user content scrubbed before Claude | PASS | `diagnostic.worker.ts` lines 79–94: `scrubPii()` replaces names, emails, dates, candidate numbers. System prompt (line 120) instructs model to ignore any residual tokens. |
| Argon2id (not bcrypt) | PASS | `plugins/auth.ts` lines 49–57: `argon2.argon2id`, 64 MiB memory cost, 3 time cost, 4 parallelism. |
| RS256 JWT, algorithms locked | PASS | `plugins/auth.ts` line 100: `algorithms: ['RS256']` explicitly passed to `verify()`. |
| Refresh token rotation (single-use) | PASS | `plugins/auth.ts` lines 131–146: `redis.getdel()` — atomic retrieve-and-delete. |
| AES-256-GCM with authentication tag | PASS | `encryption.ts` lines 46–58: 96-bit IV, 128-bit tag, GCM mode. Decrypt throws on tag mismatch. |
| HMAC-SHA256 email lookup index | PASS | `encryption.ts` lines 99–104: keyed HMAC with `EMAIL_HMAC_KEY`. |
| Stripe IDs encrypted at rest | PASS | `subscriptions.ts` lines 289–291: `encUserId`, `encSubId`, `encCustId` all pass through `encrypt()` on write. |
| S3 key encrypted at rest | PASS | `diagnostic.ts` line 116: `encrypt(s3Key)` before INSERT into uploaded_documents. |
| S3 raw document deleted before results stored | PASS | `diagnostic.worker.ts` line 186–218: deletion with 3-retry loop; throws (aborts job) if deletion fails. |
| board_licence_cleared gate acknowledged | PASS (spec only) | `diagnostic.ts` file header lines 12–14 and `auth.ts` lines 22–23 document the required column and index. Gate is enforced at the practice/questions query layer (not in scope of this review). |
| Cookie security: httpOnly, secure, sameSite strict | PASS | `web/middleware.ts` lines 67–72 and 75–79: all token cookies set with httpOnly=true, secure=production, sameSite=strict. |
| CORS restricted to configured origin | CONDITIONAL — see F-SEC-004 | Production domain enforced when `CORS_ORIGIN` is set; silent fallback when unset. |
| Rate limiting on auth endpoints | PARTIAL — see F-SEC-002 | Present on register/login/refresh/forgot-password; missing on reset-password. |
| Global rate limit default | PASS | `server.ts` lines 104–112: 100 per minute global default. |
| Audit log: no PII values | PASS | `audit.ts` lines 1–10: interface comments prohibit PII values. All auth audit calls use `hashUserIdForAudit()`. |
| Audit log: no prompt content | PASS | `claude.ts` lines 166–185: only prompt_hash and response_hash logged, never content. |
| Data residency: eu-west-2 enforced at startup | PASS | `server.ts` lines 44–51: production startup fails if region != eu-west-2. |

---

## Conditions for Human Sign-Off

Before a human security engineer signs this document and the release gate is opened, the following must be evidenced:

1. **F-SEC-001 resolved** — SSE client uses `fetch`-based streaming; `?token=` query param removed from both client and server code. Confirm access logs do not capture token values.
2. **F-SEC-002 resolved** — Rate limit added to `/auth/reset-password`. Confirmed by code inspection.
3. **F-SEC-003 resolved** — subscriptions `user_id` column type confirmed (raw UUID or encrypted); WHERE clause corrected and tested with an actual paid-user round-trip.
4. **F-SEC-004 resolved** — Either: startup guard added for missing `CORS_ORIGIN` in production, OR confirmation that infra-as-code (Terraform/CDK) guarantees the variable is always set.
5. **F-SEC-005 resolved** — Dead-letter mechanism implemented and tested for audit write failures.

Upon resolution of conditions 1–5, this document should be updated to `status: passed`, the conditions list cleared, and this section replaced with a sign-off record containing the human reviewer's name, date, and method of verification.

---

*Generated by Security Lead agent — Phase 9 gate review.*
*Constitution authority: docs/architecture/agentic-engineering-enterprise.md*
*This document is immutable once signed off. Amendments require a new review cycle.*

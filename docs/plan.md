# Revizr Build Plan — 8-Sprint Schedule

**Version:** 1.0.0
**Date:** 2026-05-15
**Authority:** Phase 7 gate — architecture-decision.md
**Status:** Approved — awaiting human approvals HA-001 to HA-005 before Sprint 1

Sprint duration: 2 weeks.
All tasks follow: spec exists → BDD scenarios written → code → tests pass → gate.
Every commit message must carry the task ID (e.g. `[T-001]`).

---

## Sprint 0 — Scaffold & Infrastructure

**Goal:** Working monorepo, CI green, empty app shells deployed to staging, BullMQ
running, design tokens integrated. No feature code yet.

| ID | Title | Squad | Feature | ADR | Acceptance Criteria |
|----|-------|-------|---------|-----|---------------------|
| T-001 | Initialise monorepo (pnpm workspaces: apps/web, apps/api, packages/shared-types) | infra | — | — | `pnpm install` succeeds; `packages/shared-types` compiles with `tsc --noEmit`; lint passes |
| T-002 | GitHub Actions CI pipeline: lint, typecheck, unit tests, build | infra | — | — | CI runs on every PR; pipeline fails on lint errors or typecheck failures; badge in README |
| T-003 | Fastify API server bootstrap (TypeScript, Zod validation, health endpoint) | backend | — | ADR-0002 | `GET /health` returns `{ status: "ok", region: "eu-west-2" }` with 200; server refuses to start if `AWS_DEFAULT_REGION` is not `eu-west-2` |
| T-004 | Next.js 15 App Router bootstrap (TypeScript, `en-GB`/`cy` locale routing, design tokens) | frontend | — | ADR-0001 | `pnpm dev` renders `/en-GB` and `/cy` routes without error; `<html lang>` is set correctly on both; Lighthouse PWA category ≥ 60 in CI |
| T-005 | PostgreSQL provisioning: RDS eu-west-2, schema migrations (Drizzle ORM), seed script | data | — | ADR-0003 | Migration runs against staging DB without error; `SELECT 1` health check passes from API; no tables exist outside eu-west-2 |
| T-006 | BullMQ + Redis (ElastiCache eu-west-2) setup; diagnostic queue wired to Fastify | infra | — | ADR-0006 | A test job enqueued via Fastify is picked up and processed by the worker; Redis is in eu-west-2 |
| T-007 | AWS S3 bucket provisioning (eu-west-2, SSE-KMS CMK, public-access block, deny-replication policy) | infra | — | ADR-0008, ADR-0009 | Bucket exists in eu-west-2 only; `aws s3api get-bucket-replication` returns NoSuchReplicationConfiguration; SSE-KMS enabled; public access blocked |
| T-008 | Cloudflare CDN wired to static assets; `Cache-Control: no-store, private` on all API routes confirmed | infra | — | ADR-0009 | Static asset loads via Cloudflare; authenticated API responses contain `Cache-Control: no-store, private` header; no API response is cached at Cloudflare edge |
| T-009 | Service worker baseline: `@ducanh2912/next-pwa` configured; manifest.json; offline fallback page | frontend | — | ADR-0010 | Lighthouse PWA installability check passes in CI; offline fallback page served when network is unavailable; no API responses cached by service worker |
| T-010 | Audit log table created; `audit_writer` DB role has INSERT only; application audit client wired to Fastify plugin | backend | — | Principle 10 | Every Fastify request emits an audit log row; `UPDATE` and `DELETE` on `audit_log` are rejected by the DB role |

---

## Sprint 1 — Auth & Account Pairing (F1)

**Goal:** Users can register, log in, refresh tokens, link parent–student accounts,
and record parental consent. GDPR deletion and export endpoints present.

| ID | Title | Squad | Feature | ADR | Acceptance Criteria |
|----|-------|-------|---------|-----|---------------------|
| T-011 | `POST /auth/register` — student and parent registration with Argon2id hashing | backend | F1 | ADR-0005 | Registration creates user; password stored as Argon2id hash; email is encrypted at rest; `201` returned with token pair |
| T-012 | `POST /auth/login` — credential validation, JWT (RS256) access + refresh token issuance | backend | F1 | ADR-0005 | Valid credentials return `200` with access token (15 min TTL) and refresh token (30 day TTL); invalid credentials return `401`; rate limit (10 attempts / 15 min) enforced |
| T-013 | `POST /auth/refresh` — refresh token rotation | backend | F1 | ADR-0005 | Valid refresh token returns new token pair; old refresh token is invalidated; expired token returns `401` |
| T-014 | `POST /auth/logout` — refresh token revocation | backend | F1 | ADR-0005 | Refresh token added to revocation list; subsequent use of revoked token returns `401` |
| T-015 | `POST /auth/forgot-password` and `POST /auth/reset-password` — reset via Resend email | backend | F1 | ADR-0005 | Reset email sent via Resend within 30 s; reset token expires in 1 h; password updated; previous refresh tokens invalidated; response is identical whether email exists or not (anti-enumeration) |
| T-016 | `POST /accounts/pair` — parent initiates student pairing; invitation email sent | backend | F1 | ADR-0005 | Pair record created with status `pending`; invitation email sent via Resend to student's email; `202` returned with account_id |
| T-017 | `POST /accounts/consent` — record parental consent (timestamp, mechanism, IP hash) | backend | F1 | ADR-0005 | Consent fields written and encrypted; account status transitions to `active`; consent_ip_hash stored as SHA-256 of real IP, never plaintext |
| T-018 | `GET /users/me`, `PATCH /users/me`, `DELETE /users/me`, `GET /users/me/export` | backend | F1 | ADR-0009 | Profile returned correctly; PATCH updates display_name and locale; DELETE soft-deletes and queues Stripe cancellation; export returns all personal data fields |
| T-019 | Registration UI — multi-step form (role, age_band, email, password, locale) | frontend | F1 | ADR-0001 | WCAG 2.2 AA: all inputs have labels; error messages linked via `aria-describedby`; keyboard navigation complete; form submits to `/auth/register` |
| T-020 | Login UI — email/password form, forgot password link | frontend | F1 | ADR-0001 | Login form submits; access token stored in memory (not localStorage); refresh token in `httpOnly` cookie; redirect to dashboard on success |
| T-021 | Account pairing UI — parent enters student email; consent confirmation screen | frontend | F1 | ADR-0001 | Parent can initiate pairing; student receives email with consent link; consent confirmation page activates account pair |
| T-022 | Auth unit tests: registration, login, refresh, revocation | backend | F1 | ADR-0005 | 100% branch coverage for auth handlers; idempotency test: same register request twice returns `409` |

---

## Sprint 2 — Diagnostic Engine (F2, F3)

**Goal:** Users can upload a school report; the system processes it via Claude API
and returns a weakness map. Raw document deleted post-processing.

| ID | Title | Squad | Feature | ADR | Acceptance Criteria |
|----|-------|-------|---------|-----|---------------------|
| T-023 | `POST /diagnostic/upload` — create diagnostic_session, generate presigned S3 PUT URL, enqueue BullMQ job | backend | F2 | ADR-0008 | Presigned URL valid for 15 min; URL includes correct S3 key prefix; job enqueued with session ID; `uploaded_documents` row created with status `uploaded` |
| T-024 | BullMQ diagnostic worker — fetch from S3, PDF/image text extraction, PII scrubbing, Claude API call | backend | F2 | ADR-0004, ADR-0008 | Worker extracts text; student name and school name tokens replace identifiers before Claude call; Claude response parsed; weakness scores written to `diagnostic_results` |
| T-025 | Immediate S3 deletion in worker — delete object after text extraction; verify `deleted_at` written | backend | F2 | ADR-0008 | S3 object deleted before Claude API response is processed; `uploaded_documents.status = 'deleted'`; `deleted_at` timestamp set; if deletion fails, worker retries 3 times then escalates |
| T-026 | S3 lifecycle rule — 24-hour expiry on all objects in diagnostic bucket (belt-and-braces) | infra | F2 | ADR-0008 | Lifecycle rule configured; objects older than 24 h are expired automatically; confirmed via `aws s3api get-bucket-lifecycle-configuration` |
| T-027 | `GET /diagnostic/status/:jobId` — poll job status | backend | F2 | ADR-0006 | Returns `pending`, `processing`, `complete`, or `failed` with `progress_pct`; `403` if job does not belong to authenticated user |
| T-028 | `GET /diagnostic/events/:jobId` — SSE stream for job progress | backend | F2 | ADR-0006 | SSE connection stays open; `progress` events emitted at each worker step; `complete` event includes `session_id`; connection closes on terminal event |
| T-029 | `GET /diagnostic/results/:sessionId` — weakness map endpoint | backend | F2 | ADR-0004 | Returns array of `{ topic_tag, weakness_score }` for completed sessions; `400` if session not complete; `403` if session belongs to another user |
| T-030 | Report upload UI — drag-drop or file picker, upload progress indicator, SSE progress stream | frontend | F2 | ADR-0001, ADR-0010 | File accepted (PDF, JPEG, PNG); upload progress shown; SSE stream drives progress bar; on completion, redirect to weakness map |
| T-031 | Weakness map UI — visual topic breakdown, priority indicators | frontend | F3 | ADR-0001 | Topics displayed with weakness scores; colour is not the only differentiator (icons + text labels); WCAG 2.2 AA: contrast ≥ 4.5:1; screen reader announces weakness level for each topic |
| T-032 | Diagnostic engine unit + integration tests | backend | F2 | ADR-0008 | Test: document uploaded → processed → deleted (assertion on S3 mock: DeleteObject called); PII scrubbing test: student name not present in captured Claude prompt; Claude API mocked |
| T-032b | **TECHNICAL SPIKE — F31 AI-assisted extended-answer marking** (spec sign-off gate) | backend | F31 | ADR-0004 | Spike must answer: (1) Can Claude reliably score extended prose answers against a mark scheme at GCSE and A-level accuracy thresholds (≥80% agreement with human marker on a 20-question test set)? (2) What is the per-question latency and cost? (3) What prompt pattern achieves the best mark scheme alignment? Spike output: ADR-0011 with go/no-go recommendation. **Sprint 3 does not begin F31 build tasks until ADR-0011 is written and approved.** |

---

## Sprint 3 — Practice Session Core (F4, F8, F9, F10, F31)

**Goal:** Students can select a subject, start a practice session, answer questions
via self-mark, view mark schemes, and review past sessions.

| ID | Title | Squad | Feature | ADR | Acceptance Criteria |
|----|-------|-------|---------|-----|---------------------|
| T-033 | `GET /practice/questions` — personalised question pack weighted by diagnostic results | backend | F4 | ADR-0003 | Returns `count` questions; if diagnostic results exist, at least 60% of questions are from the top-3 weak topics; falls back to curriculum order if no diagnostic data |
| T-034 | `POST /practice/sessions` — create session with question list | backend | F4 | — | Session created; all provided question IDs are valid and belong to specified subject; `session_question_attempts` rows created with `presented_at = now()` |
| T-035 | `POST /practice/sessions/:id/attempt` — submit self-mark | backend | F4 | — | Attempt written with `self_mark_score`, `time_spent_seconds`, `mark_scheme_viewed`; score must be ≤ question.max_marks; idempotent: re-submitting same question_id in same session returns existing attempt |
| T-036 | `GET /practice/sessions/:id` — session state | backend | F10 | — | Returns session with all attempts; `403` if session belongs to another user |
| T-037 | `PATCH /practice/sessions/:id` — end/pause session | backend | F10 | — | Status transitions to `completed` or `abandoned`; `ended_at` set; `400` if session already terminal |
| T-038 | Subject/exam board selection UI (F8) — subject picker, board picker, level picker | frontend | F8 | ADR-0001 | `POST /subjects` called on save; subjects list renders on dashboard; WCAG: all select elements have labels |
| T-039 | Question display UI — render question text, optional image, timer | frontend | F4 | ADR-0001 | Question text rendered; images have alt text; timer counts up; next/back navigation via keyboard; no mark scheme shown before student self-marks |
| T-040 | Self-mark UI — score input + mark scheme reveal (F4, F9) | frontend | F4, F9 | ADR-0001 | Score input constrained to 0–max_marks; mark scheme toggle works; mark_scheme_viewed sent in attempt payload; confirm before moving to next question |
| T-041 | Session summary UI + session history list (F10) | frontend | F10 | ADR-0001 | Session results shown on completion; history list paginates correctly; scores displayed with non-colour secondary indicators |
| T-042 | Practice session unit + integration tests | backend | F4 | — | Attempt idempotency test; score > max_marks returns `422`; session owned by other user returns `403` |

---

## Sprint 4 — Progress & Parent Dashboard (F5, F6, F14)

**Goal:** Students see their weekly progress trends. Parents see their linked
children's progress and can set session controls.

| ID | Title | Squad | Feature | ADR | Acceptance Criteria |
|----|-------|-------|---------|-----|---------------------|
| T-043 | Weekly progress snapshot job — compute `progress_snapshots` from `session_question_attempts` | data | F5 | ADR-0003 | Cron job runs weekly; computes `score_avg`, `questions_attempted`, `questions_correct` per user/subject/topic; idempotent (upsert on unique constraint) |
| T-044 | `GET /progress` and `GET /progress/topics` — progress summary endpoints | backend | F5 | — | Returns pre-computed snapshots; `subject_id` required; empty array if no data; `period` defaults to current ISO week |
| T-045 | Progress trend UI — chart of weekly score averages per topic | frontend | F5 | ADR-0001 | Chart renders without requiring colour alone to distinguish lines (pattern/shape differentiation); keyboard-navigable data points; screen reader announces data values |
| T-046 | `GET /parent/children` — list linked students | backend | F6 | ADR-0005 | Returns children only for authenticated parent; `403` if user is not a parent |
| T-047 | `GET /parent/children/:studentId/progress` and `GET /parent/children/:studentId/sessions` | backend | F6 | ADR-0005 | Returns child data only if account pair is active and authenticated user is the parent; `403` otherwise; session history is cursor-paginated |
| T-048 | `POST /parent/children/:studentId/controls` — parental controls | backend | F14 | ADR-0005 | Controls written; `daily_question_cap` enforced in `GET /practice/questions` (returns `403` with `DAILY_CAP_REACHED` if cap exceeded); `session_duration_minutes` enforced client-side (server validates on attempt submit) |
| T-049 | Parent dashboard UI — children list, per-child progress, last session date | frontend | F6 | ADR-0001 | Only visible to users with role=parent; child progress data fetched server-side (RSC); WCAG AA throughout |
| T-050 | Parental controls UI — daily cap slider, session duration picker | frontend | F14 | ADR-0001 | Controls saved via `POST /parent/children/:studentId/controls`; confirmation toast on save; values validated client-side before submit |
| T-051 | Progress + parent dashboard integration tests | backend | F5, F6 | — | Parent cannot access a student they are not paired with; progress returns empty array for new user with no sessions |

---

## Sprint 5 — Subscription & Billing (F7)

**Goal:** Free tier gating enforced. Paid users can subscribe via Stripe Checkout,
manage via Billing Portal. Webhook keeps subscription state in sync.

| ID | Title | Squad | Feature | ADR | Acceptance Criteria |
|----|-------|-------|---------|-----|---------------------|
| T-052 | Subscription middleware — `requiresSubscription(plan)` guard applied to gated endpoints | backend | F7 | ADR-0007 | Free tier users receive `402` with `SUBSCRIPTION_REQUIRED` on gated routes; active paid users pass through; middleware checks `subscriptions.plan` and `current_period_end` |
| T-053 | `GET /subscriptions/me` — return current subscription | backend | F7 | ADR-0007 | Returns plan, status, and current_period_end; `stripe_subscription_id` and `stripe_customer_id` never returned in response body |
| T-054 | `POST /subscriptions/checkout` — create Stripe Checkout session | backend | F7 | ADR-0007 | Stripe Checkout session created via server-side SDK; checkout URL returned; `success_url` and `cancel_url` validated against allowlist to prevent open redirect |
| T-055 | `POST /subscriptions/portal` — create Stripe Billing Portal session | backend | F7 | ADR-0007 | Portal session created for existing Stripe customer; `return_url` validated; `404` if no Stripe customer exists |
| T-056 | `POST /subscriptions/webhook` — handle Stripe events (subscription created/updated/cancelled, payment_failed) | backend | F7 | ADR-0007 | Signature verified before processing; events are idempotent (upsert on `stripe_subscription_id`); out-of-order events handled safely; audit log entry written per webhook |
| T-057 | Upgrade CTA UI — free tier banner, upgrade button, Stripe redirect | frontend | F7 | ADR-0001 | Banner shown to free tier users on gated features; upgrade button triggers checkout; success return page shows confirmation |
| T-058 | Subscription settings UI — current plan, manage/cancel button (portal), invoice history label | frontend | F7 | ADR-0001 | Plan and status displayed; manage button opens Stripe Billing Portal; no card data shown in Revizr UI |
| T-059 | Stripe webhook integration tests — simulated events via Stripe CLI | backend | F7 | ADR-0007 | `checkout.session.completed` creates subscription; `customer.subscription.updated` updates plan; `customer.subscription.deleted` sets status to `cancelled`; invalid signature returns `400` |

---

## Sprint 6 — PWA, Welsh, Notifications, GDPR (F11, F12, F13)

**Goal:** Service worker hardened for performance; Welsh toggle works end-to-end;
notification preferences saved; GDPR export and deletion flows complete.

| ID | Title | Squad | Feature | ADR | Acceptance Criteria |
|----|-------|-------|---------|-----|---------------------|
| T-060 | Service worker hardening — CacheFirst for static assets, NetworkFirst for API, offline fallback page | frontend | — | ADR-0010 | Repeat visit loads static assets from cache (network tab shows `(ServiceWorker)` origin); `/offline` page served when network fails; no C3+ data in service worker cache |
| T-061 | PWA install prompt — capture `beforeinstallprompt`; show after first completed session | frontend | — | ADR-0010 | Install banner appears after first `practice_sessions.status = 'completed'`; does not appear on first load; dismissal persisted in `localStorage`; prompt not shown on desktop Chrome |
| T-062 | Welsh (cy) locale — all UI strings extracted to `en-GB.json` and `cy.json`; locale toggle in settings | frontend | F13 | ADR-0001 | `/cy` routes render all strings in Welsh; `PATCH /settings/locale` persists choice; `<html lang="cy">` set correctly for cy routes; no English strings visible on cy routes |
| T-063 | Notification preferences UI — email toggles, push opt-in (with Web Push API subscription) | frontend | F11 | ADR-0001 | `PATCH /notifications/preferences` called on save; push_subscription sent only when push_enabled=true and browser permission granted; WCAG: toggle state announced to screen readers |
| T-064 | Push notification delivery — backend sends Web Push via VAPID; session reminder and progress report templates | backend | F11 | — | Test push notification delivered to subscribed device; Resend transactional email sent for email_session_reminders; push token hash never logged |
| T-065 | GDPR data export UI — "Download my data" page; triggers `GET /users/me/export`; JSON file download | frontend | F12 | ADR-0001 | Export triggers API call; JSON file downloaded; page explains what data is included; rate-limit message shown if called twice in 24 h |
| T-066 | GDPR account deletion UI — "Delete my account" page; confirmation step; soft-delete + queued erasure | frontend | F12 | ADR-0001 | Confirmation requires typing "DELETE" or equivalent; DELETE API called on confirm; user logged out; account deactivated; email sent confirming deletion queued |
| T-067 | Locale persistence — locale stored in `users.locale`; survives logout/login; server-side resolved | backend | F13 | — | `PATCH /settings/locale` updates `users.locale`; on next login, token payload includes locale; Next.js middleware routes to correct locale prefix |
| T-068 | Welsh string completeness CI check — lint step fails if any `cy.json` key is missing vs `en-GB.json` | infra | F13 | — | CI fails if Welsh translation file has fewer keys than English; runs on every PR touching locale files |

---

## Sprint 7 — Hardening

**Goal:** Performance budgets enforced in CI; WCAG 2.2 AA audit complete; security
hardening; load tested.

| ID | Title | Squad | Feature | ADR | Acceptance Criteria |
|----|-------|-------|---------|-----|---------------------|
| T-069 | Lighthouse CI configuration — FCP ≤ 2000 ms, TTI ≤ 3500 ms, JS bundle ≤ 150 kB gzipped, PWA ≥ 90 | infra | — | ADR-0001 | CI fails if any Lighthouse budget threshold is breached on representative pages (`/`, `/en-GB/session`, `/en-GB/progress`) |
| T-070 | Bundle analyser CI step — `@next/bundle-analyzer` with size-limit gates | infra | — | ADR-0001 | CI reports bundle composition; build fails if initial JS > 150 kB gzipped; alert if any single page chunk > 50 kB |
| T-071 | Automated WCAG 2.2 AA audit — axe-core in Playwright; zero critical violations required | frontend | — | — | Playwright tests run axe-core on all key pages; CI fails if any WCAG A or AA violation is found; violations logged with WCAG criterion reference |
| T-072 | Manual WCAG audit — keyboard navigation, screen reader (VoiceOver + NVDA), colour contrast | frontend | — | — | Manual QA pass: all interactive elements reachable by keyboard; screen reader announces dynamic content changes; contrast ≥ 4.5:1 verified with Colour Contrast Analyser |
| T-073 | Dependency security audit — `pnpm audit --audit-level=high`; Dependabot alerts reviewed | infra | — | — | Zero high or critical CVEs in production dependencies; `pnpm audit --audit-level=high` returns clean; Dependabot enabled on repo |
| T-074 | OWASP scan — OWASP ZAP baseline scan against staging | infra | — | — | ZAP baseline scan passes with zero high-risk alerts; medium-risk alerts documented and triaged |
| T-075 | Load test — k6 load test: 200 concurrent users, practice session flow, 10-minute ramp | infra | — | — | p95 API response time ≤ 500 ms at 200 concurrent users; zero `5xx` errors during ramp; BullMQ diagnostic queue does not back up |
| T-076 | IAM least-privilege review — ECS task roles, S3 bucket policy, RDS credentials, KMS key policy | infra | — | ADR-0009 | ECS task role has only required permissions; S3 bucket policy restricts access to diagnostic worker role; RDS password rotated; KMS CMK policy reviewed and documented |
| T-077 | Data-class-linter CI gate — verify all API response schemas honour `no-store` for C3+ fields | backend | — | ADR-0009 | CI linter checks that no API endpoint returning C3+ fields is missing `Cache-Control: no-store, private`; linter runs against OpenAPI schema |
| T-078 | Evidence pack assembly — Phase 7 evidence pack written; all gate artefacts linked; Phase 7 frozen | infra | — | Principle 6 | Evidence pack exists in `.specify/memory/evidence/phase-7-revizr.md`; links all ADRs, data model, OpenAPI, architecture-decision.md, plan.md; Phase 7 gatekeeper sign-off recorded |

---

## Task Summary

| Sprint | Tasks | Squad split |
|--------|-------|-------------|
| 0 — Scaffold | T-001 – T-010 | 5 infra, 2 backend, 2 frontend, 1 data |
| 1 — Auth | T-011 – T-022 | 7 backend, 4 frontend, 1 backend (tests) |
| 2 — Diagnostic | T-023 – T-032 | 6 backend, 3 frontend, 1 infra, 2 backend (tests) |
| 3 — Practice | T-033 – T-042 | 5 backend, 5 frontend, 2 backend (tests) |
| 4 — Progress & Parent | T-043 – T-051 | 4 backend, 3 frontend, 1 data, 1 backend (tests) |
| 5 — Billing | T-052 – T-059 | 6 backend, 2 frontend, 1 backend (tests) |
| 6 — PWA/Welsh/GDPR | T-060 – T-068 | 2 backend, 5 frontend, 1 infra, 1 backend |
| 7 — Hardening | T-069 – T-078 | 6 infra, 2 frontend, 2 backend |

Total tasks: **78**

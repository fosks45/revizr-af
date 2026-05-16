# Revizr

AI-powered UK exam revision platform. Pinpoints student weaknesses and delivers personalised practice from authentic past papers.

## Prerequisites

- [Node.js](https://nodejs.org/) v22+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for PostgreSQL + Redis)
- An [Anthropic API key](https://console.anthropic.com/) (for the diagnostic engine)
- A [Stripe test account](https://dashboard.stripe.com/) (for subscription flow — optional for basic development)

---

## First-time setup

### 1. Clone the repo

```bash
git clone https://github.com/fosks45/revizr-af.git
cd revizr-af
```

### 2. Start the database and cache

```bash
docker compose -f docker-compose.dev.yml up -d
```

This starts PostgreSQL on port 5432 and Redis on port 6379.

### 3. Configure the API environment

```bash
cd apps/api
cp .env.development .env.local
```

Open `.env.local` and fill in:

| Variable | Where to get it |
|---|---|
| `JWT_PRIVATE_KEY_PEM` | Generate: `openssl genrsa 2048` |
| `JWT_PUBLIC_KEY_PEM` | Derive from private: `openssl rsa -pubout` |
| `ENCRYPTION_KEY` | Generate: `openssl rand -hex 32` |
| `EMAIL_HMAC_KEY` | Generate: `openssl rand -hex 32` |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com/) |
| `STRIPE_SECRET_KEY` | Stripe dashboard → Developers → API keys (use `sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe dashboard → Webhooks (or use `stripe listen` — see below) |

The AWS variables (S3) are only needed if you're testing the school report upload feature. You can skip them for everything else.

**Generate the JWT key pair in one step:**
```bash
openssl genrsa -out /tmp/revizr-jwt.pem 2048
openssl rsa -in /tmp/revizr-jwt.pem -pubout -out /tmp/revizr-jwt-pub.pem
```
Copy the contents of each file into `.env.local` replacing newlines with `\n`.

### 4. Install dependencies

```bash
# From the repo root
cd apps/api && npm install
cd ../web && npm install
```

### 5. Run database migrations

```bash
cd apps/api
DATABASE_URL=postgres://revizr:changeme@localhost:5432/revizr npm run migrate
```

You should see 13 migrations applied (including the development seed data).

---

## Running the app

Open two terminals from the repo root.

**Terminal 1 — API (port 3001):**
```bash
cd apps/api
npm run dev
```

You should see:
```
Server listening on http://0.0.0.0:3001
Health: http://localhost:3001/health
```

**Terminal 2 — Web (port 3000):**
```bash
cd apps/web
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Stripe webhooks (local)

If you're testing the subscription flow, you need Stripe to send webhook events to your local API. Install the [Stripe CLI](https://stripe.com/docs/stripe-cli) and run:

```bash
stripe listen --forward-to localhost:3001/subscriptions/webhook
```

Copy the webhook signing secret it prints (`whsec_...`) into `STRIPE_WEBHOOK_SECRET` in your `.env.local`.

---

## Project structure

```
apps/
  api/          Fastify/TypeScript backend (port 3001)
    src/
      routes/   One file per endpoint group
      lib/      claude.ts, encryption.ts, audit.ts, s3.ts, stripe.ts
      plugins/  auth.ts, db.ts, redis.ts
      workers/  diagnostic.worker.ts (BullMQ)
    db/
      migrations/  001–012 SQL migration files
      migrate.ts   Migration runner
  web/          Next.js 15 PWA (port 3000)
    app/
      (auth)/   Login, register (parent-only)
      (app)/    All authenticated screens
    components/ UI primitives + feature components
    lib/        api.ts, tokens.ts, i18n.ts, hooks/
docs/           Evidence packs from the product pipeline
```

---

## Key constraints

- **No student self-registration** — all accounts created by a parent. `/auth/register` is parent-only.
- **Copyright gate** — no exam paper content is served until `board_licence_cleared = TRUE` for that board in the `exam_boards_config` table. Real boards are FALSE by default; the SAMPLE board (migration 013) is TRUE for development. This is a business/legal constraint, not a code gap — the gate is fully implemented.
- **Data residency** — all user data must stay in `eu-west-2` (London). The server enforces this at startup in production.
- **Welsh language** — toggle available at `/settings/locale`. Strings in `apps/web/lib/i18n.ts`.

## What works end-to-end

- **Authentication & accounts** — parent registration, student account creation, JWT auth, token refresh.
- **Subjects** — create, list, soft-delete.
- **Diagnostic quiz (F3)** — `POST /diagnostic/quiz` accepts confidence self-assessments per topic, converts them to weakness scores, and returns a `sessionId` immediately. The frontend (`DiagnosticQuiz` component) posts the quiz and redirects to results. No document upload or Claude API call required for this path.
- **Diagnostic report upload (F2)** — `POST /diagnostic/upload` creates a session and returns a presigned S3 URL. The BullMQ worker extracts text (PDF via `pdf-parse`, images via `tesseract.js`), scrubs PII, calls the Claude API, and writes weakness scores. The S3 object is deleted after extraction (ADR-0008).
- **Practice sessions** — create session, fetch personalised questions, submit attempts, mark as complete. Questions are served only for boards with `board_licence_cleared = TRUE` (use migration 013 SAMPLE data for local development).
- **Progress** — weakness map, topic-level scores, session history.
- **Parent dashboard** — child progress, session list, parental controls (daily cap, session duration).
- **Subscriptions** — Stripe checkout, billing portal, webhook handler.
- **Notifications** — preference management.
- **Settings** — locale toggle (en-GB / cy).
- **Parental consent** — account pairing, consent token flow.

## Genuine remaining gaps before production launch

- **Copyright licences** — real exam boards (`AQA`, `Edexcel`, `OCR`, etc.) have `board_licence_cleared = FALSE`. No code change required; a human DPO must confirm a signed licence agreement, then run: `UPDATE exam_boards_config SET board_licence_cleared = TRUE, licence_cleared_at = NOW(), licence_reference = '<ref>' WHERE board_code = '<code>';`
- **DPIA sign-off** — school report upload (F2) requires DPO sign-off before enabling for end users. The code is compliant; this is a governance step.
- **DPO sign-off on parent-initiated account model** — required before launch.
- **AADC Standard 6 review** — streak mechanic (F16) feature flag must remain off until the age-appropriate design code review is complete.
- **Evidence snippets (C5)** — `diagnostic_results.evidence_snippets` field-level encryption (per-record KMS key) is not yet implemented. The field is NULL in all writes until the KMS key derivation path (TODO [C5] in `diagnostic.worker.ts`) is built.
- **Production S3 and AWS config** — the upload feature requires AWS credentials and a bucket in `eu-west-2`. See `.env.example`.

## Pre-launch checklist

- [ ] Copyright licence confirmed from at least one real exam board → `UPDATE exam_boards_config SET board_licence_cleared = TRUE ...`
- [ ] DPO sign-off on parent-initiated account model
- [ ] DPIA completed and signed off for school report upload (F2)
- [ ] AADC Standard 6 review of streak mechanic (F16) before enabling the feature flag
- [ ] C5 evidence snippets KMS encryption implemented (TODO [C5] in diagnostic.worker.ts)
- [ ] Production AWS credentials and S3 bucket configured in `eu-west-2`

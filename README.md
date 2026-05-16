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

You should see 12 migrations applied.

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
- **Copyright gate** — no exam paper content is served until `board_licence_cleared = TRUE` for that board in the `exam_boards_config` table. Currently all boards are FALSE (negotiations in progress).
- **Data residency** — all user data must stay in `eu-west-2` (London). The server enforces this at startup in production.
- **Welsh language** — toggle available at `/settings/locale`. Strings in `apps/web/lib/i18n.ts`.

## Pre-launch checklist (before removing `--prerelease`)

- [ ] Copyright licence confirmed from at least one exam board → set `board_licence_cleared = TRUE` for that board
- [ ] DPO sign-off on parent-initiated account model
- [ ] DPIA completed for school report upload (F2)
- [ ] PDF text extraction library selected (see `apps/api/src/workers/diagnostic.worker.ts` TODO)
- [ ] Diagnostic quiz backend route wired (F3)
- [ ] AADC Standard 6 review of streak mechanic (F16) before enabling the feature flag

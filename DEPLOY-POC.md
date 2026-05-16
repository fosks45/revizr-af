# Revizr — POC Deployment Guide

Deploy the full Revizr stack for free in under 30 minutes using:
- **Frontend:** Vercel (free tier)
- **Backend API:** Railway (free trial / Starter $5/month)
- **Database:** Supabase PostgreSQL (free tier — 500 MB, 2 projects)
- **Redis:** Upstash (free tier — 10,000 commands/day)
- **Email:** Resend (free tier — 100 emails/day)
- **AI:** Anthropic Claude API (pay-as-you-go — ~$0.01 per diagnostic)
- **File storage:** Supabase Storage (free tier — 1 GB)

**Estimated cost:** £0/month until you exceed free tier limits (~500 active users/month)

---

## Prerequisites

- [Node.js v22+](https://nodejs.org/)
- [Railway CLI](https://docs.railway.app/develop/cli): `npm i -g @railway/cli`
- [Vercel CLI](https://vercel.com/docs/cli): `npm i -g vercel`
- [Supabase account](https://supabase.com/) (free)
- [Upstash account](https://upstash.com/) (free)
- [Resend account](https://resend.com/) (free)
- [Anthropic API key](https://console.anthropic.com/)
- [Stripe test account](https://dashboard.stripe.com/) (free)

---

## Step 1 — Supabase (Database + Storage)

1. Create a new Supabase project at [supabase.com](https://supabase.com/)
2. Choose region: **eu-west-2 (London)** or closest EU region
3. Copy the connection string from **Settings → Database → Connection string (URI)**
   It looks like: `postgresql://postgres:[password]@[host]:5432/postgres`
4. Create a storage bucket: **Storage → New bucket → `diagnostic-uploads`** (private)
5. Copy the Supabase URL and `service_role` key from **Settings → API**

## Step 2 — Upstash (Redis for job queue)

1. Create a free Redis database at [upstash.com](https://upstash.com/)
2. Choose region: **eu-west-2** or **eu-central-1**
3. Copy the **UPSTASH_REDIS_REST_URL** — but for BullMQ you need the `ioredis`-compatible URL
4. In Upstash dashboard, go to **Details** and copy the **Redis connection string**:
   `redis://default:[password]@[host]:[port]`

## Step 3 — Generate secrets

```bash
# JWT key pair
openssl genrsa -out /tmp/jwt-private.pem 2048
openssl rsa -in /tmp/jwt-private.pem -pubout -out /tmp/jwt-public.pem
cat /tmp/jwt-private.pem   # copy this
cat /tmp/jwt-public.pem    # copy this

# Encryption keys (64 hex chars each)
openssl rand -hex 32   # ENCRYPTION_KEY
openssl rand -hex 32   # EMAIL_HMAC_KEY
```

## Step 4 — Deploy the API to Railway

```bash
cd apps/api

# Login
railway login

# Create project
railway init   # select "Empty project", name it "revizr-api"

# Set environment variables (paste from your notes above)
railway variables set DATABASE_URL="postgresql://postgres:..."
railway variables set REDIS_URL="redis://default:...@..."
railway variables set JWT_PRIVATE_KEY_PEM="$(cat /tmp/jwt-private.pem | tr '\n' '\\n')"
railway variables set JWT_PUBLIC_KEY_PEM="$(cat /tmp/jwt-public.pem | tr '\n' '\\n')"
railway variables set ENCRYPTION_KEY="[your-hex-key]"
railway variables set EMAIL_HMAC_KEY="[your-hex-key]"
railway variables set ANTHROPIC_API_KEY="sk-ant-..."
railway variables set STRIPE_SECRET_KEY="sk_test_..."
railway variables set STRIPE_WEBHOOK_SECRET="whsec_..."
railway variables set STRIPE_ALLOWED_REDIRECT_ORIGINS="https://[your-vercel-url]"
railway variables set NODE_ENV="production"
railway variables set CORS_ORIGIN="https://[your-vercel-url]"   # fill in after step 5
railway variables set PORT="3001"
# POC: no AWS needed — using Supabase Storage
railway variables set SUPABASE_URL="https://[project-id].supabase.co"
railway variables set SUPABASE_SERVICE_ROLE_KEY="[service-role-key]"
railway variables set SUPABASE_STORAGE_BUCKET="diagnostic-uploads"

# Run migrations
DATABASE_URL="postgresql://postgres:..." npm run migrate

# Deploy
railway up
```

Railway will give you a URL like `https://revizr-api-production.up.railway.app`

## Step 5 — Deploy the frontend to Vercel

```bash
cd ../web

vercel   # follow the prompts: new project, Next.js auto-detected

# Set environment variables in Vercel dashboard or CLI:
vercel env add NEXT_PUBLIC_API_BASE_URL production
# enter: https://revizr-api-production.up.railway.app

vercel --prod
```

Vercel will give you a URL like `https://revizr.vercel.app`

**Go back and update Railway:**
```bash
cd ../api
railway variables set CORS_ORIGIN="https://revizr.vercel.app"
railway variables set STRIPE_ALLOWED_REDIRECT_ORIGINS="https://revizr.vercel.app"
railway up   # redeploy with updated CORS
```

## Step 6 — Stripe webhooks

```bash
# Install Stripe CLI if testing locally, OR set up a webhook in the Stripe dashboard:
# Stripe Dashboard → Developers → Webhooks → Add endpoint
# URL: https://revizr-api-production.up.railway.app/subscriptions/webhook
# Events: customer.subscription.created, customer.subscription.updated,
#          customer.subscription.deleted, invoice.payment_succeeded
# Copy the webhook signing secret → update STRIPE_WEBHOOK_SECRET in Railway
```

## Step 7 — Verify

```bash
# Check the API is up
curl https://revizr-api-production.up.railway.app/health

# Expected:
# {"status":"ok","timestamp":"...","region":"..."}
```

Open `https://revizr.vercel.app` — you should see the login screen.

---

## What works in the POC

Everything in the app works. The only difference from production:
- **File storage** uses Supabase Storage instead of AWS S3 (same API shape for uploads)
- **Database** is Supabase PostgreSQL instead of AWS RDS — identical schema, same migrations
- **Redis** is Upstash instead of ElastiCache
- **Hosting** is Railway + Vercel instead of ECS + CloudFront

**Note on file storage:** The diagnostic worker (`apps/api/src/workers/diagnostic.worker.ts`)
uses the AWS S3 SDK. For the POC you'll need to update the S3 calls to use the Supabase
Storage SDK, or use an S3-compatible endpoint (Supabase Storage exposes an S3-compatible API).
See [Supabase S3 compatibility docs](https://supabase.com/docs/guides/storage/s3/compatibility).

---

## When to upgrade to Production

You're ready to move to the Production stack when:
- You have paying users (or a pilot school signed up)
- You need UK data residency guarantees for exam board licensing conversations
- You're approaching Supabase free tier limits (500 MB database, 1 GB storage)
- You need SLAs and uptime guarantees

The Production upgrade path is documented in `specs/002-revizr/architecture-pack/`.
Each ADR has a `## POC Decision` and `## Production Decision` section.

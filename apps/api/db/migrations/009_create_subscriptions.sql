-- =============================================================================
-- Migration: 009_create_subscriptions.sql
-- Task:      T-005 [Sprint 0], T-052–T-059 [Sprint 5 — Subscription & Billing]
-- Table:     subscriptions
-- Purpose:   Revizr-side subscription entitlement record (F7). Stripe is the
--            source of truth for billing; this table is maintained exclusively
--            via Stripe webhooks (T-056). No card data is ever stored here.
--
--            stripe_subscription_id and stripe_customer_id are opaque identifiers
--            (not card data) but are classified C3 because they are linked to a
--            specific user's financial activity. They are encrypted at rest.
--
--            Unique constraint on user_id: one subscription per user (one row).
--            Webhook handler uses UPSERT on stripe_subscription_id to handle
--            idempotent event replay (Principle 8).
--
-- Authority: data-model.md §Entity:subscriptions, ADR-0007,
--            compliance-decision.md C-015
-- =============================================================================

-- ============================================================
-- UP
-- ============================================================

CREATE TYPE IF NOT EXISTS subscription_plan   AS ENUM ('free', 'monthly', 'annual');
CREATE TYPE IF NOT EXISTS subscription_status AS ENUM ('active', 'trialing', 'past_due', 'cancelled', 'incomplete');

CREATE TABLE IF NOT EXISTS subscriptions (
    id                      UUID                    NOT NULL DEFAULT gen_random_uuid(),  -- C0: public PK
    user_id                 UUID                    NOT NULL,                            -- C3: encrypted at rest: AES-256-GCM; FK → users.id; unique — one subscription per user
    stripe_subscription_id  VARCHAR(255)            NOT NULL,                            -- C3: encrypted at rest: AES-256-GCM; Stripe subscription ID e.g. 'sub_1Abc...'; opaque; never returned in API responses
    stripe_customer_id      VARCHAR(255)            NOT NULL,                            -- C3: encrypted at rest: AES-256-GCM; Stripe customer ID e.g. 'cus_1Abc...'; opaque; used for Billing Portal session creation
    plan                    subscription_plan       NOT NULL DEFAULT 'free',             -- C1: 'free' | 'monthly' | 'annual'; drives feature gating
    status                  subscription_status     NOT NULL DEFAULT 'active',           -- C1: mirrors Stripe subscription status; used for access control gate (T-052)
    current_period_end      TIMESTAMPTZ             NOT NULL,                            -- C1: when the current billing period ends; used by subscription middleware to determine active access
    created_at              TIMESTAMPTZ             NOT NULL DEFAULT NOW(),              -- C1: set on insert; immutable
    cancelled_at            TIMESTAMPTZ                 NULL DEFAULT NULL,               -- C1: set when status transitions to 'cancelled'; null otherwise

    CONSTRAINT subscriptions_pkey PRIMARY KEY (id),

    -- Unique: one subscription row per user. The subscription middleware relies on
    -- this to do a simple point lookup (no array iteration).
    CONSTRAINT subscriptions_user_id_unique UNIQUE (user_id),

    -- ON DELETE CASCADE: if user is hard-deleted (GDPR purge), their subscription
    -- record cascades. The application must cancel the Stripe subscription before
    -- allowing a hard-delete (users.deleted_at soft-delete queues this; T-018).
    CONSTRAINT subscriptions_user_id_fk
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- The UNIQUE constraint on user_id already creates an index; this named index
-- is for readability in query plans and explicit intent documentation.
CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx
    ON subscriptions (user_id);

-- Index on stripe_subscription_id for the webhook UPSERT lookup:
-- INSERT ... ON CONFLICT ... or UPDATE WHERE stripe_subscription_id = $1
CREATE INDEX IF NOT EXISTS subscriptions_stripe_sub_id_idx
    ON subscriptions (stripe_subscription_id);

COMMENT ON TABLE  subscriptions                         IS 'Revizr-side subscription entitlement. Maintained via Stripe webhooks only. No card data stored. stripe_* fields are C3 (encrypted).';
COMMENT ON COLUMN subscriptions.id                      IS 'C0 — public PK; gen_random_uuid()';
COMMENT ON COLUMN subscriptions.user_id                 IS 'C3 — encrypted at rest: AES-256-GCM; FK → users.id CASCADE; unique — one subscription per user';
COMMENT ON COLUMN subscriptions.stripe_subscription_id  IS 'C3 — encrypted at rest: AES-256-GCM; opaque Stripe identifier; never returned in API responses; used for webhook UPSERT';
COMMENT ON COLUMN subscriptions.stripe_customer_id      IS 'C3 — encrypted at rest: AES-256-GCM; opaque Stripe identifier; used for Billing Portal session creation only';
COMMENT ON COLUMN subscriptions.plan                    IS 'C1 — enum: free | monthly | annual; drives feature gating middleware';
COMMENT ON COLUMN subscriptions.status                  IS 'C1 — mirrors Stripe status: active | trialing | past_due | cancelled | incomplete';
COMMENT ON COLUMN subscriptions.current_period_end      IS 'C1 — billing period end; subscription middleware checks this for access control';
COMMENT ON COLUMN subscriptions.created_at              IS 'C1 — set on insert; immutable';
COMMENT ON COLUMN subscriptions.cancelled_at            IS 'C1 — set on status → cancelled transition; null until cancelled';

-- ============================================================
-- DOWN
-- ============================================================

DROP INDEX  IF EXISTS subscriptions_stripe_sub_id_idx;
DROP INDEX  IF EXISTS subscriptions_user_id_idx;
DROP TABLE  IF EXISTS subscriptions;
DROP TYPE   IF EXISTS subscription_status;
DROP TYPE   IF EXISTS subscription_plan;

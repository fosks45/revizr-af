-- =============================================================================
-- Migration: 001_create_users.sql
-- Task:      T-005 [Sprint 0 — Scaffold]
-- Table:     users
-- Purpose:   Primary identity record for all Revizr users (parents and students).
--            Soft-delete via deleted_at. Emails stored encrypted (C3); lookup via
--            HMAC hash. Passwords stored as Argon2id hashes (C6) — never returned
--            in API responses, never logged.
-- Authority: data-model.md §Entity:users, ADR-0003, ADR-0005, compliance-decision.md
-- =============================================================================

-- ============================================================
-- UP
-- ============================================================

CREATE TYPE IF NOT EXISTS user_role AS ENUM ('parent', 'student');
-- Note: 'teacher' role excluded per spec sign-off decision.

CREATE TYPE IF NOT EXISTS age_band AS ENUM ('under13', '13to15', '16to18', 'adult');

CREATE TABLE IF NOT EXISTS users (
    id              UUID            NOT NULL DEFAULT gen_random_uuid(),  -- C0: public PK
    email           TEXT            NOT NULL,                            -- C3: encrypted at rest: AES-256-GCM (app layer, CMK in AWS KMS eu-west-2); never stored plaintext; unique lookup via email_hash
    email_hash      VARCHAR(64)     NOT NULL,                            -- C3: HMAC-SHA-256 of plaintext email using a secret pepper; used for uniqueness check and login lookup; pepper stored in AWS Secrets Manager
    password_hash   TEXT            NOT NULL,                            -- C6: Argon2id hash; never logged; never returned in API responses; not a C3 field — irreversible hash, not PII
    display_name    TEXT            NOT NULL,                            -- C3: encrypted at rest: AES-256-GCM; shown in UI
    role            user_role       NOT NULL,                            -- C1: internal enum; drives dashboard routing; no encryption required
    age_band        age_band        NOT NULL,                            -- C3: encrypted at rest: AES-256-GCM; drives C7 classification context at runtime; any C3 field for a row with age_band in (under13, 13to15, 16to18) inherits C7 controls
    locale          VARCHAR(10)     NOT NULL DEFAULT 'en-GB',            -- C1: BCP-47 locale code; internal config; no encryption required
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),              -- C1: set on insert; immutable
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),              -- C1: updated on every write
    deleted_at      TIMESTAMPTZ         NULL DEFAULT NULL,               -- C1: soft-delete; null = active; GDPR erasure sets this and nullifies C3 fields

    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_email_hash_unique UNIQUE (email_hash)
);

-- Lookup index for login (HMAC hash lookup replaces plaintext email index).
-- email_hash is already UNIQUE above; this index name is for clarity in query plans.
CREATE INDEX IF NOT EXISTS users_email_hash_idx
    ON users (email_hash);

-- Partial index: active (non-deleted) users only — used on auth and profile queries.
CREATE INDEX IF NOT EXISTS users_deleted_at_idx
    ON users (deleted_at)
    WHERE deleted_at IS NULL;

-- Role index — used on parent dashboard queries and admin tooling.
CREATE INDEX IF NOT EXISTS users_role_idx
    ON users (role);

COMMENT ON TABLE  users                IS 'Primary identity record. One row per registered user. Soft-delete via deleted_at. Data residency: eu-west-2 only (C7 requirement).';
COMMENT ON COLUMN users.id             IS 'C0 — public PK; gen_random_uuid()';
COMMENT ON COLUMN users.email          IS 'C3 — encrypted at rest: AES-256-GCM; never stored plaintext; app layer encrypts before write';
COMMENT ON COLUMN users.email_hash     IS 'C3 — HMAC-SHA-256 of plaintext email with server-side pepper; unique; used for login lookup and deduplication';
COMMENT ON COLUMN users.password_hash  IS 'C6 — Argon2id hash; never logged; never returned in API responses; stored only in this column';
COMMENT ON COLUMN users.display_name   IS 'C3 — encrypted at rest: AES-256-GCM; shown in UI only after app-layer decrypt';
COMMENT ON COLUMN users.role           IS 'C1 — enum: parent | student; drives routing and authorisation';
COMMENT ON COLUMN users.age_band       IS 'C3 — encrypted at rest: AES-256-GCM; drives C7 runtime classification; C7 controls apply to all C3 fields where age_band IN (under13, 13to15, 16to18)';
COMMENT ON COLUMN users.locale         IS 'C1 — BCP-47 locale; default en-GB';
COMMENT ON COLUMN users.created_at     IS 'C1 — set on insert; immutable';
COMMENT ON COLUMN users.updated_at     IS 'C1 — updated on every write via application layer';
COMMENT ON COLUMN users.deleted_at     IS 'C1 — soft-delete; GDPR erasure sets this and nullifies all C3 fields in the same transaction';

-- ============================================================
-- DOWN
-- ============================================================

DROP INDEX  IF EXISTS users_role_idx;
DROP INDEX  IF EXISTS users_deleted_at_idx;
DROP INDEX  IF EXISTS users_email_hash_idx;
DROP TABLE  IF EXISTS users;
DROP TYPE   IF EXISTS age_band;
DROP TYPE   IF EXISTS user_role;

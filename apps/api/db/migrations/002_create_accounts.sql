-- =============================================================================
-- Migration: 002_create_accounts.sql
-- Task:      T-005, T-016, T-017 [Sprint 0 / Sprint 1]
-- Table:     accounts
-- Purpose:   Links a parent user to a student user. Records parental consent
--            (timestamp, mechanism, IP hash). Stores parental controls
--            (daily_question_cap, session_duration_minutes). One row per
--            parent–student relationship.
--
--            Under-17s cannot self-register; students are always created by a
--            parent. There is therefore no 'consent_pending' status — the account
--            row is written by the parent at registration time with consent already
--            recorded. Status is 'active' on creation (via POST /accounts/pair +
--            POST /accounts/consent flow) or 'suspended' by parental action.
--
-- Authority: data-model.md §Entity:accounts, spec sign-off decisions,
--            compliance-decision.md C-001, C-002, ADR-0005
-- =============================================================================

-- ============================================================
-- UP
-- ============================================================

CREATE TYPE IF NOT EXISTS account_status AS ENUM ('active', 'suspended');

CREATE TABLE IF NOT EXISTS accounts (
    id                          UUID            NOT NULL DEFAULT gen_random_uuid(),  -- C0: public PK
    parent_user_id              UUID            NOT NULL,                            -- C3: encrypted at rest: AES-256-GCM; FK → users.id; ON DELETE RESTRICT — a parent user record must not be hard-deleted while a linked account exists; soft-delete via users.deleted_at
    student_user_id             UUID            NOT NULL,                            -- C3: encrypted at rest: AES-256-GCM; FK → users.id; ON DELETE RESTRICT — a student user record must not be hard-deleted while a linked account exists
    consent_given_at            TIMESTAMPTZ     NOT NULL,                            -- C3: encrypted at rest: AES-256-GCM; timestamp of explicit parental consent event; ICO-required record (C-002)
    consent_mechanism           TEXT            NOT NULL DEFAULT 'parent-initiated-account-creation',  -- C3: encrypted at rest: AES-256-GCM; always 'parent-initiated-account-creation' for v1; retained for ICO accountability (C-002)
    consent_ip_hash             VARCHAR(64)     NOT NULL,                            -- C3: encrypted at rest: AES-256-GCM; SHA-256 of consenting parent IP at consent time; never stored plaintext; accountability record only
    relationship                TEXT            NOT NULL,                            -- C3: encrypted at rest: AES-256-GCM; self-declared: 'parent' | 'guardian' | 'carer'
    status                      account_status  NOT NULL DEFAULT 'active',           -- C1: 'active' | 'suspended'; parent can suspend access without full deletion
    daily_question_cap          SMALLINT        NOT NULL DEFAULT 50,                 -- C1: parental control — max questions per day; enforced by API (T-048)
    session_duration_minutes    SMALLINT        NOT NULL DEFAULT 60,                 -- C1: parental control — max session length in minutes; enforced client-side, validated server-side on attempt submit (T-048)
    created_at                  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),              -- C1: set on insert; immutable

    CONSTRAINT accounts_pkey PRIMARY KEY (id),

    -- Each parent–student pair must be unique.
    CONSTRAINT accounts_parent_student_unique UNIQUE (parent_user_id, student_user_id),

    -- ON DELETE RESTRICT: the application must soft-delete users via users.deleted_at
    -- and handle account teardown before any hard-delete of a user row is permitted.
    -- This is a safety net — hard deletes of users should never occur in production.
    CONSTRAINT accounts_parent_user_id_fk
        FOREIGN KEY (parent_user_id) REFERENCES users (id) ON DELETE RESTRICT,

    CONSTRAINT accounts_student_user_id_fk
        FOREIGN KEY (student_user_id) REFERENCES users (id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS accounts_parent_user_id_idx
    ON accounts (parent_user_id);

CREATE INDEX IF NOT EXISTS accounts_student_user_id_idx
    ON accounts (student_user_id);

COMMENT ON TABLE  accounts                          IS 'Parent–student relationship and parental consent record. One row per pairing. Data residency: eu-west-2 only (C7 requirement).';
COMMENT ON COLUMN accounts.id                       IS 'C0 — public PK; gen_random_uuid()';
COMMENT ON COLUMN accounts.parent_user_id           IS 'C3 — encrypted at rest: AES-256-GCM; FK → users.id RESTRICT; identifies consenting parent';
COMMENT ON COLUMN accounts.student_user_id          IS 'C3 — encrypted at rest: AES-256-GCM; FK → users.id RESTRICT; identifies the student whose data is governed by this consent record';
COMMENT ON COLUMN accounts.consent_given_at         IS 'C3 — encrypted at rest: AES-256-GCM; ICO-required consent timestamp (C-002)';
COMMENT ON COLUMN accounts.consent_mechanism        IS 'C3 — encrypted at rest: AES-256-GCM; ICO accountability field; v1 always parent-initiated-account-creation';
COMMENT ON COLUMN accounts.consent_ip_hash          IS 'C3 — encrypted at rest: AES-256-GCM; SHA-256 of parent IP at consent; never plaintext; accountability not tracking';
COMMENT ON COLUMN accounts.relationship             IS 'C3 — encrypted at rest: AES-256-GCM; self-declared: parent | guardian | carer';
COMMENT ON COLUMN accounts.status                   IS 'C1 — enum: active | suspended; parent can suspend without deleting';
COMMENT ON COLUMN accounts.daily_question_cap       IS 'C1 — parental control; max questions per calendar day; default 50; enforced by GET /practice/questions';
COMMENT ON COLUMN accounts.session_duration_minutes IS 'C1 — parental control; max session length in minutes; default 60; enforced client-side and validated server-side on attempt submit';
COMMENT ON COLUMN accounts.created_at               IS 'C1 — set on insert; immutable';

-- ============================================================
-- DOWN
-- ============================================================

DROP INDEX  IF EXISTS accounts_student_user_id_idx;
DROP INDEX  IF EXISTS accounts_parent_user_id_idx;
DROP TABLE  IF EXISTS accounts;
DROP TYPE   IF EXISTS account_status;

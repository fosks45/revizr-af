-- =============================================================================
-- Migration: 010_create_notifications.sql
-- Task:      T-005 [Sprint 0], T-063–T-064 [Sprint 6 — Notifications]
-- Table:     notification_preferences
-- Purpose:   Per-user notification opt-in/opt-out state (F11). One row per user.
--            Push token is hashed (C6) — never stored in plaintext here.
--            The plaintext push subscription endpoint is stored in the application
--            secrets store (AWS Secrets Manager), keyed by push_token_hash.
--
--            push notifications to under-16 users require explicit parental consent
--            per AADC (compliance C-009d). The application layer enforces this by
--            checking accounts.status and users.age_band before enabling push.
--            This table stores the preference state only; consent enforcement is
--            at the API layer.
--
-- Authority: data-model.md §Entity:notification_preferences,
--            compliance-decision.md C-009
-- =============================================================================

-- ============================================================
-- UP
-- ============================================================

CREATE TABLE IF NOT EXISTS notification_preferences (
    id                          UUID        NOT NULL DEFAULT gen_random_uuid(),  -- C0: public PK
    user_id                     UUID        NOT NULL,                            -- C1: FK → users.id; unique — one row per user; not directly identifying in isolation
    email_session_reminders     BOOLEAN     NOT NULL DEFAULT TRUE,               -- C1: opt-in to weekly session reminder emails; default true (AADC privacy-by-default for under-18 means this default may be overridden to false by application layer)
    email_progress_reports      BOOLEAN     NOT NULL DEFAULT TRUE,               -- C1: opt-in to weekly progress summary emails; default true
    push_enabled                BOOLEAN     NOT NULL DEFAULT FALSE,              -- C1: whether push notifications are enabled; default false (AADC privacy-by-default for under-18 users)
    push_token_hash             VARCHAR(64)     NULL DEFAULT NULL,               -- C6: SHA-256 of the browser push subscription endpoint; used to identify the subscription for deletion; NEVER logged; plaintext push token stored in AWS Secrets Manager only, never in this column; null until push_enabled = true and browser permission granted

    CONSTRAINT notification_preferences_pkey PRIMARY KEY (id),

    -- Unique: one preferences row per user.
    CONSTRAINT notification_preferences_user_id_unique UNIQUE (user_id),

    -- ON DELETE CASCADE: if user is hard-deleted (GDPR purge), their notification
    -- preferences cascade. The application must also delete the plaintext push
    -- subscription from AWS Secrets Manager as part of the GDPR erasure job.
    CONSTRAINT notification_preferences_user_id_fk
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Named index for the unique user lookup (the UNIQUE constraint creates one
-- implicitly; this makes intent explicit in query plans).
CREATE INDEX IF NOT EXISTS notification_preferences_user_id_idx
    ON notification_preferences (user_id);

COMMENT ON TABLE  notification_preferences                          IS 'Per-user notification opt-in/out state. One row per user. push_token_hash is C6 — never logged. Plaintext push token in Secrets Manager only.';
COMMENT ON COLUMN notification_preferences.id                       IS 'C0 — public PK; gen_random_uuid()';
COMMENT ON COLUMN notification_preferences.user_id                  IS 'C1 — FK → users.id CASCADE; unique; not directly identifying in isolation';
COMMENT ON COLUMN notification_preferences.email_session_reminders  IS 'C1 — email reminder opt-in; default true; AADC privacy-by-default may override for under-18 at application layer';
COMMENT ON COLUMN notification_preferences.email_progress_reports   IS 'C1 — weekly progress email opt-in; default true';
COMMENT ON COLUMN notification_preferences.push_enabled             IS 'C1 — push notifications enabled; default false; push to under-16 requires parental consent (C-009d)';
COMMENT ON COLUMN notification_preferences.push_token_hash          IS 'C6 — SHA-256 of push endpoint; never logged; never returned in API responses; plaintext token in AWS Secrets Manager only; null until push enabled and permission granted';

-- ============================================================
-- DOWN
-- ============================================================

DROP INDEX  IF EXISTS notification_preferences_user_id_idx;
DROP TABLE  IF EXISTS notification_preferences;

-- =============================================================================
-- Migration: 006_create_diagnostic.sql
-- Task:      T-005 [Sprint 0], T-023–T-029 [Sprint 2 — Diagnostic Engine]
-- Tables:    diagnostic_sessions, uploaded_documents, diagnostic_results
-- Purpose:   Supports the school-report upload diagnostic flow (F2, F3).
--
--            diagnostic_sessions — parent session record (one per upload or quiz run).
--            uploaded_documents  — metadata record of each uploaded file.
--                                  The raw S3 object is deleted post-processing (ADR-0008);
--                                  this table retains only audit metadata.
--                                  s3_key and content_hash are C3 (encrypted).
--            diagnostic_results  — derived weakness scores and evidence snippets.
--                                  evidence_snippets is C3/C5: field-level encrypted
--                                  (per-record AES-256 key, key in KMS-backed vault).
--                                  DPIA applies to this table (compliance C-004).
--
-- Special-category data note (C-004, C5):
--   evidence_snippets may contain health/SEND/neurodivergence text extracted from
--   school reports. These are special-category data under UK GDPR Art 9. Field-level
--   encryption is required. The application encrypts evidence_snippets with a
--   per-record data key generated via AWS KMS GenerateDataKey before write.
--   The ciphertext is stored here; the plaintext data key is never persisted.
--
-- Authority: data-model.md §§ diagnostic_sessions, uploaded_documents,
--            diagnostic_results; compliance-decision.md C-004, C-013; ADR-0008
-- =============================================================================

-- ============================================================
-- UP
-- ============================================================

CREATE TYPE IF NOT EXISTS diagnostic_session_type   AS ENUM ('report_upload', 'quiz');
CREATE TYPE IF NOT EXISTS diagnostic_session_status AS ENUM ('pending', 'processing', 'complete', 'failed');
CREATE TYPE IF NOT EXISTS uploaded_document_status  AS ENUM ('uploaded', 'processing', 'deleted');

-- ------------------------------------------------------------
-- diagnostic_sessions
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS diagnostic_sessions (
    id              UUID                        NOT NULL DEFAULT gen_random_uuid(),  -- C0: public PK
    user_id         UUID                        NOT NULL,                            -- C3: encrypted at rest: AES-256-GCM; FK → users.id; identifies the student whose session this is
    session_type    diagnostic_session_type     NOT NULL,                            -- C1: 'report_upload' | 'quiz'
    status          diagnostic_session_status   NOT NULL DEFAULT 'pending',          -- C1: 'pending' | 'processing' | 'complete' | 'failed'
    created_at      TIMESTAMPTZ                 NOT NULL DEFAULT NOW(),              -- C1: set on insert
    completed_at    TIMESTAMPTZ                     NULL DEFAULT NULL,               -- C1: set when status transitions to 'complete' or 'failed'

    CONSTRAINT diagnostic_sessions_pkey PRIMARY KEY (id),

    -- ON DELETE CASCADE: if a user is hard-deleted (GDPR purge), their diagnostic
    -- sessions and all child records (uploaded_documents, diagnostic_results) cascade.
    CONSTRAINT diagnostic_sessions_user_id_fk
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS diagnostic_sessions_user_id_idx
    ON diagnostic_sessions (user_id);

CREATE INDEX IF NOT EXISTS diagnostic_sessions_status_idx
    ON diagnostic_sessions (status);

COMMENT ON TABLE  diagnostic_sessions              IS 'One row per diagnostic run (report upload or quiz). Parent of uploaded_documents and diagnostic_results. DPIA applies (C-004).';
COMMENT ON COLUMN diagnostic_sessions.id           IS 'C0 — public PK; gen_random_uuid()';
COMMENT ON COLUMN diagnostic_sessions.user_id      IS 'C3 — encrypted at rest: AES-256-GCM; FK → users.id CASCADE';
COMMENT ON COLUMN diagnostic_sessions.session_type IS 'C1 — enum: report_upload | quiz';
COMMENT ON COLUMN diagnostic_sessions.status       IS 'C1 — enum: pending | processing | complete | failed';
COMMENT ON COLUMN diagnostic_sessions.created_at   IS 'C1 — set on insert; immutable';
COMMENT ON COLUMN diagnostic_sessions.completed_at IS 'C1 — set when terminal status reached; null until then';

-- ------------------------------------------------------------
-- uploaded_documents
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS uploaded_documents (
    id                      UUID                        NOT NULL DEFAULT gen_random_uuid(),  -- C0: public PK
    diagnostic_session_id   UUID                        NOT NULL,                            -- C1: FK → diagnostic_sessions.id; not directly identifying in isolation
    s3_key                  TEXT                        NOT NULL,                            -- C3: encrypted at rest: AES-256-GCM; the S3 object key used during upload window; recorded for audit trail; underlying S3 object deleted post-processing (ADR-0008)
    content_hash            VARCHAR(64)                 NOT NULL,                            -- C3: encrypted at rest: AES-256-GCM; SHA-256 of raw file bytes before upload; deduplication check; never plaintext
    status                  uploaded_document_status    NOT NULL DEFAULT 'uploaded',         -- C1: 'uploaded' | 'processing' | 'deleted'; must reach 'deleted' post-processing (ADR-0008)
    uploaded_at             TIMESTAMPTZ                 NOT NULL DEFAULT NOW(),              -- C1: set on insert
    deleted_at              TIMESTAMPTZ                     NULL DEFAULT NULL,               -- C1: set when raw document confirmed deleted from S3; null until deletion confirmed; monitoring alert if still null after 15 min (T-025)

    CONSTRAINT uploaded_documents_pkey PRIMARY KEY (id),

    -- ON DELETE CASCADE: if the parent diagnostic_session is deleted (GDPR purge),
    -- this metadata record also cascades. The raw S3 object is already deleted by
    -- this point (it is deleted at processing time, long before any purge).
    CONSTRAINT uploaded_documents_session_id_fk
        FOREIGN KEY (diagnostic_session_id) REFERENCES diagnostic_sessions (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS uploaded_documents_session_id_idx
    ON uploaded_documents (diagnostic_session_id);

-- Partial index for monitoring undeleted documents (ADR-0008 compliance check).
-- Used by the monitoring job that alerts if any document has not been deleted
-- within 15 minutes of upload.
CREATE INDEX IF NOT EXISTS uploaded_documents_not_deleted_idx
    ON uploaded_documents (uploaded_at)
    WHERE status != 'deleted';

COMMENT ON TABLE  uploaded_documents                    IS 'Audit metadata for each uploaded school report. Raw S3 object deleted post-processing (ADR-0008). This table retains metadata only. DPIA applies (C-004).';
COMMENT ON COLUMN uploaded_documents.id                 IS 'C0 — public PK; gen_random_uuid()';
COMMENT ON COLUMN uploaded_documents.diagnostic_session_id IS 'C1 — FK → diagnostic_sessions.id CASCADE; not directly identifying';
COMMENT ON COLUMN uploaded_documents.s3_key             IS 'C3 — encrypted at rest: AES-256-GCM; S3 object key; underlying object deleted post-processing; this column retained for audit trail only';
COMMENT ON COLUMN uploaded_documents.content_hash       IS 'C3 — encrypted at rest: AES-256-GCM; SHA-256 of raw bytes before upload; deduplication only; never plaintext';
COMMENT ON COLUMN uploaded_documents.status             IS 'C1 — enum: uploaded | processing | deleted; MUST reach deleted after processing (ADR-0008)';
COMMENT ON COLUMN uploaded_documents.uploaded_at        IS 'C1 — set on insert; immutable';
COMMENT ON COLUMN uploaded_documents.deleted_at         IS 'C1 — set when S3 object deletion confirmed; null triggers monitoring alert if not set within 15 min';

-- ------------------------------------------------------------
-- diagnostic_results
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS diagnostic_results (
    id                      UUID            NOT NULL DEFAULT gen_random_uuid(),  -- C0: public PK
    diagnostic_session_id   UUID            NOT NULL,                            -- C1: FK → diagnostic_sessions.id; not directly identifying in isolation
    user_id                 UUID            NOT NULL,                            -- C3: encrypted at rest: AES-256-GCM; FK → users.id; denormalised for query performance on dashboard
    subject_id              UUID            NOT NULL,                            -- C1: FK → subjects.id; not directly identifying in isolation
    topic_tag               TEXT            NOT NULL,                            -- C1: e.g. 'algebra', 'forces'; matches questions.topic_tags values
    weakness_score          NUMERIC(4,3)    NOT NULL,                            -- C1: 0.000–1.000; higher = weaker; derived by Claude API scoring model; CHECK constraint enforces range
    evidence_snippets       JSONB               NULL DEFAULT NULL,               -- C3/C5: FIELD-LEVEL ENCRYPTION REQUIRED; DPIA APPLIES; array of text fragments from report supporting weakness score; MAY contain C5 data (health, SEND, neurodivergence); encrypted with per-record AES-256 key via AWS KMS GenerateDataKey; ciphertext stored here; key never persisted in DB
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),              -- C1: set on insert; immutable

    CONSTRAINT diagnostic_results_pkey PRIMARY KEY (id),

    CONSTRAINT diagnostic_results_weakness_score_range
        CHECK (weakness_score >= 0.000 AND weakness_score <= 1.000),

    -- ON DELETE CASCADE: cascades when the parent diagnostic_session is deleted.
    CONSTRAINT diagnostic_results_session_id_fk
        FOREIGN KEY (diagnostic_session_id) REFERENCES diagnostic_sessions (id) ON DELETE CASCADE,

    -- ON DELETE CASCADE: cascades when the user is hard-deleted (GDPR purge).
    CONSTRAINT diagnostic_results_user_id_fk
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,

    -- ON DELETE RESTRICT: subjects must be soft-deleted (is_active = false) rather
    -- than hard-deleted while diagnostic results reference them, to preserve the
    -- audit trail of what subject context the weakness was measured against.
    CONSTRAINT diagnostic_results_subject_id_fk
        FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE RESTRICT
);

-- Composite index for the primary dashboard query: get all weakness results for
-- a user across their subjects.
CREATE INDEX IF NOT EXISTS diagnostic_results_user_id_subject_idx
    ON diagnostic_results (user_id, subject_id);

CREATE INDEX IF NOT EXISTS diagnostic_results_session_id_idx
    ON diagnostic_results (diagnostic_session_id);

COMMENT ON TABLE  diagnostic_results                    IS 'Derived weakness scores from a diagnostic session. Permanent record — raw document is deleted. evidence_snippets is C3/C5 field-level encrypted. DPIA applies (C-004).';
COMMENT ON COLUMN diagnostic_results.id                 IS 'C0 — public PK; gen_random_uuid()';
COMMENT ON COLUMN diagnostic_results.diagnostic_session_id IS 'C1 — FK → diagnostic_sessions.id CASCADE; not directly identifying';
COMMENT ON COLUMN diagnostic_results.user_id            IS 'C3 — encrypted at rest: AES-256-GCM; FK → users.id CASCADE; denormalised for performance';
COMMENT ON COLUMN diagnostic_results.subject_id         IS 'C1 — FK → subjects.id RESTRICT; not directly identifying';
COMMENT ON COLUMN diagnostic_results.topic_tag          IS 'C1 — topic label; matches questions.topic_tags values';
COMMENT ON COLUMN diagnostic_results.weakness_score     IS 'C1 — 0.000–1.000; higher = weaker; Claude API output; range-checked';
COMMENT ON COLUMN diagnostic_results.evidence_snippets  IS 'C3/C5 — FIELD-LEVEL ENCRYPTION: per-record AES-256 key from AWS KMS GenerateDataKey; ciphertext only stored here; MAY contain special-category health/SEND data (C5); DPIA applies; key never stored in DB';
COMMENT ON COLUMN diagnostic_results.created_at         IS 'C1 — set on insert; immutable';

-- ============================================================
-- DOWN
-- ============================================================

DROP INDEX  IF EXISTS diagnostic_results_session_id_idx;
DROP INDEX  IF EXISTS diagnostic_results_user_id_subject_idx;
DROP TABLE  IF EXISTS diagnostic_results;

DROP INDEX  IF EXISTS uploaded_documents_not_deleted_idx;
DROP INDEX  IF EXISTS uploaded_documents_session_id_idx;
DROP TABLE  IF EXISTS uploaded_documents;

DROP INDEX  IF EXISTS diagnostic_sessions_status_idx;
DROP INDEX  IF EXISTS diagnostic_sessions_user_id_idx;
DROP TABLE  IF EXISTS diagnostic_sessions;

DROP TYPE   IF EXISTS uploaded_document_status;
DROP TYPE   IF EXISTS diagnostic_session_status;
DROP TYPE   IF EXISTS diagnostic_session_type;

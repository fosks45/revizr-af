-- =============================================================================
-- Migration: 003_create_subjects.sql
-- Task:      T-005 [Sprint 0], T-038 [Sprint 3 — Subject Selection]
-- Table:     subjects
-- Purpose:   A subject that a student is studying. User-owned — not a global
--            catalogue. Soft-hide via is_active (no hard delete). Each row
--            represents one (student, subject, exam_board, level) combination.
-- Authority: data-model.md §Entity:subjects, ADR-0003
-- =============================================================================

-- ============================================================
-- UP
-- ============================================================

CREATE TABLE IF NOT EXISTS subjects (
    id              UUID            NOT NULL DEFAULT gen_random_uuid(),  -- C0: public PK
    user_id         UUID            NOT NULL,                            -- C1: FK → users.id; not directly identifying in isolation; ON DELETE CASCADE — if the user record is eventually hard-deleted, their subjects are also removed
    subject_name    VARCHAR(100)    NOT NULL,                            -- C1: e.g. 'Mathematics', 'English Literature'; internal operational data
    exam_board      VARCHAR(20)     NOT NULL,                            -- C1: enum-like: AQA | Edexcel | OCR | CCEA | WJEC | Cambridge; must match exam_boards_config.board_code (enforced by application layer, not FK, to allow future board additions without migration)
    level           VARCHAR(20)     NOT NULL,                            -- C1: enum-like: 11plus | ks3 | gcse | alevel
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,               -- C1: soft-hide; false = hidden from student dashboard; no hard delete
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),              -- C1: set on insert; immutable
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),              -- C1: updated on every write

    CONSTRAINT subjects_pkey PRIMARY KEY (id),

    -- ON DELETE CASCADE: subjects are personal to the user; if the user row is
    -- hard-deleted (end of GDPR retention period), their subjects cascade-delete.
    -- In normal operation, users are soft-deleted via users.deleted_at; hard deletes
    -- only occur during a scheduled GDPR purge job.
    CONSTRAINT subjects_user_id_fk
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- General lookup by user.
CREATE INDEX IF NOT EXISTS subjects_user_id_idx
    ON subjects (user_id);

-- Partial index for active subjects — the common query path (dashboard subject list).
CREATE INDEX IF NOT EXISTS subjects_user_id_active_idx
    ON subjects (user_id)
    WHERE is_active = TRUE;

COMMENT ON TABLE  subjects              IS 'Student-owned subject record. Not a global catalogue. One row per student + subject + board + level combination.';
COMMENT ON COLUMN subjects.id           IS 'C0 — public PK; gen_random_uuid()';
COMMENT ON COLUMN subjects.user_id      IS 'C1 — FK → users.id CASCADE; not directly identifying in isolation';
COMMENT ON COLUMN subjects.subject_name IS 'C1 — e.g. Mathematics, English Literature';
COMMENT ON COLUMN subjects.exam_board   IS 'C1 — enum-like: AQA | Edexcel | OCR | CCEA | WJEC | Cambridge; application layer validates against exam_boards_config';
COMMENT ON COLUMN subjects.level        IS 'C1 — enum-like: 11plus | ks3 | gcse | alevel';
COMMENT ON COLUMN subjects.is_active    IS 'C1 — soft-hide; false = not shown on dashboard; default true';
COMMENT ON COLUMN subjects.created_at   IS 'C1 — set on insert; immutable';
COMMENT ON COLUMN subjects.updated_at   IS 'C1 — updated on every write';

-- ============================================================
-- DOWN
-- ============================================================

DROP INDEX  IF EXISTS subjects_user_id_active_idx;
DROP INDEX  IF EXISTS subjects_user_id_idx;
DROP TABLE  IF EXISTS subjects;

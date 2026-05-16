-- =============================================================================
-- Migration: 005_create_questions.sql
-- Task:      T-005 [Sprint 0 — Scaffold]
-- Table:     questions
-- Purpose:   Exam question bank. Content is copyright-licensed from exam boards.
--            Not user-generated. Read-only from the application; seeded and
--            updated by the data pipeline only.
--
--            board_id FK → exam_boards_config enforces that questions can only
--            be loaded for boards that exist in the config table. The application
--            question-serving gate also checks exam_boards_config.board_licence_cleared
--            before assembling any question pack (compliance C-003).
--
--            question_text and mark_scheme_text are C1 (copyright-licensed content;
--            not C0 due to licence redistribution restrictions). All other fields C0.
--
-- Authority: data-model.md §Entity:questions, ADR-0003 (GIN index on topic_tags),
--            compliance-decision.md C-003
-- =============================================================================

-- ============================================================
-- UP
-- ============================================================

-- Enable pg_trgm for future full-text question search (admin interface, ADR-0003).
-- No-op if already enabled.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS questions (
    id                  UUID            NOT NULL DEFAULT gen_random_uuid(),  -- C0: public PK
    board_id            UUID            NOT NULL,                            -- C0: FK → exam_boards_config.id; ON DELETE RESTRICT — do not drop a board config row while questions reference it
    level               VARCHAR(20)     NOT NULL,                            -- C0: e.g. 'gcse', 'alevel', 'ks3', '11plus'; public metadata
    subject             VARCHAR(100)    NOT NULL,                            -- C0: e.g. 'Mathematics', 'English Literature'; public metadata
    year                SMALLINT        NOT NULL,                            -- C0: e.g. 2023; public paper year
    paper_ref           VARCHAR(50)     NOT NULL,                            -- C0: e.g. '8300/1H'; public paper reference
    topic_tags          TEXT[]          NOT NULL DEFAULT '{}',               -- C0: array of topic strings, e.g. ARRAY['algebra','quadratics']; GIN-indexed for multi-topic filter queries
    question_text       TEXT            NOT NULL,                            -- C1: copyright-licensed; not C0 due to licence redistribution restrictions; stored in plaintext (storage-level encryption only); access gated by board_licence_cleared check
    mark_scheme_text    TEXT            NOT NULL,                            -- C1: copyright-licensed; same restrictions as question_text; shown to students only after self-mark
    max_marks           SMALLINT        NOT NULL,                            -- C0: e.g. 5; public metadata
    question_type       VARCHAR(50)     NOT NULL,                            -- C0: enum-like: multiple_choice | short_answer | extended_answer
    image_refs          JSONB               NULL DEFAULT NULL,               -- C0: array of S3 keys for question diagrams; publicly accessible images; null if no images
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),              -- C0: pipeline ingestion timestamp

    CONSTRAINT questions_pkey PRIMARY KEY (id),

    -- ON DELETE RESTRICT: prevents removing an exam board config row while
    -- questions are still linked to it. Board removal requires a data migration
    -- to reassign or delete questions first.
    CONSTRAINT questions_board_id_fk
        FOREIGN KEY (board_id) REFERENCES exam_boards_config (id) ON DELETE RESTRICT
);

-- Composite B-tree index for the question pack assembly query:
-- "get questions for (board, level, subject)" — the primary question-retrieval pattern.
CREATE INDEX IF NOT EXISTS questions_board_level_subject_idx
    ON questions (board_id, level, subject);

-- GIN index on topic_tags array for multi-topic filter:
-- e.g. WHERE topic_tags && ARRAY['algebra', 'quadratics']
CREATE INDEX IF NOT EXISTS questions_topic_tags_gin_idx
    ON questions USING GIN (topic_tags);

COMMENT ON TABLE  questions                 IS 'Exam question bank. Copyright-licensed content. Read-only from application; written by data pipeline only. Question serving gated by exam_boards_config.board_licence_cleared (C-003).';
COMMENT ON COLUMN questions.id              IS 'C0 — public PK; gen_random_uuid()';
COMMENT ON COLUMN questions.board_id        IS 'C0 — FK → exam_boards_config.id RESTRICT; application must also check board_licence_cleared before serving';
COMMENT ON COLUMN questions.level           IS 'C0 — e.g. gcse | alevel | ks3 | 11plus';
COMMENT ON COLUMN questions.subject         IS 'C0 — e.g. Mathematics';
COMMENT ON COLUMN questions.year            IS 'C0 — paper year e.g. 2023';
COMMENT ON COLUMN questions.paper_ref       IS 'C0 — public paper reference e.g. 8300/1H';
COMMENT ON COLUMN questions.topic_tags      IS 'C0 — text array of topic labels; GIN-indexed; matches diagnostic_results.topic_tag values';
COMMENT ON COLUMN questions.question_text   IS 'C1 — copyright-licensed; not freely redistributable; storage-level encryption; access gated by board licence check';
COMMENT ON COLUMN questions.mark_scheme_text IS 'C1 — copyright-licensed; shown to students only after self-mark';
COMMENT ON COLUMN questions.max_marks       IS 'C0 — e.g. 5';
COMMENT ON COLUMN questions.question_type   IS 'C0 — enum-like: multiple_choice | short_answer | extended_answer';
COMMENT ON COLUMN questions.image_refs      IS 'C0 — JSONB array of S3 keys for question diagrams; null if no images';
COMMENT ON COLUMN questions.created_at      IS 'C0 — pipeline ingestion timestamp; immutable';

-- ============================================================
-- DOWN
-- ============================================================

DROP INDEX  IF EXISTS questions_topic_tags_gin_idx;
DROP INDEX  IF EXISTS questions_board_level_subject_idx;
DROP TABLE  IF EXISTS questions;
-- Note: pg_trgm extension is shared; do not drop it in per-table DOWN scripts.
-- Drop extension only in a dedicated infrastructure migration if intentionally removing it.

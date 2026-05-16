-- =============================================================================
-- Migration: 004_create_exam_boards_config.sql
-- Task:      T-005 [Sprint 0 — Scaffold]
-- Table:     exam_boards_config
-- Purpose:   Content-licensing gate. Controls which exam boards' questions may
--            be served to subscribers. board_licence_cleared MUST be TRUE before
--            any question from that board is served (compliance C-003).
--
--            All columns are C0 (public): board codes and names are public
--            knowledge; licence status is an internal commercial record but
--            carries no personal data. Seed rows inserted in this migration
--            with board_licence_cleared = FALSE (default). Set to TRUE only
--            when a signed licence agreement is on file (human DPO sign-off
--            required per compliance-decision.md C-003).
--
-- Authority: data-model.md, spec sign-off (board_licence_cleared field),
--            compliance-decision.md C-003
-- =============================================================================

-- ============================================================
-- UP
-- ============================================================

CREATE TABLE IF NOT EXISTS exam_boards_config (
    id                      UUID            NOT NULL DEFAULT gen_random_uuid(),  -- C0: public PK
    board_code              VARCHAR(20)     NOT NULL,                            -- C0: short identifier, e.g. 'AQA', 'Edexcel'; public knowledge
    board_name              VARCHAR(100)    NOT NULL,                            -- C0: full name, e.g. 'Assessment and Qualifications Alliance'
    board_licence_cleared   BOOLEAN         NOT NULL DEFAULT FALSE,              -- C0: compliance gate (C-003); FALSE until signed licence is on file; application MUST check this before serving any question from this board
    licence_cleared_at      TIMESTAMPTZ         NULL DEFAULT NULL,               -- C0: timestamp when licence was confirmed; null until cleared; set by human DPO/admin action only
    licence_reference       TEXT                NULL DEFAULT NULL,               -- C0: internal reference number or document identifier for the signed agreement; null until cleared
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),              -- C0: set on insert
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),              -- C0: updated when licence status changes

    CONSTRAINT exam_boards_config_pkey PRIMARY KEY (id),
    CONSTRAINT exam_boards_config_board_code_unique UNIQUE (board_code)
);

CREATE INDEX IF NOT EXISTS exam_boards_config_board_code_idx
    ON exam_boards_config (board_code);

-- Partial index: quickly find boards that are cleared (the hot query path for
-- the question-serving gate check).
CREATE INDEX IF NOT EXISTS exam_boards_config_licence_cleared_idx
    ON exam_boards_config (board_code)
    WHERE board_licence_cleared = TRUE;

COMMENT ON TABLE  exam_boards_config                        IS 'Content-licensing gate. All C0. board_licence_cleared must be TRUE before questions from a board are served (compliance C-003). Set to TRUE only when human DPO confirms signed licence is on file.';
COMMENT ON COLUMN exam_boards_config.id                     IS 'C0 — public PK; gen_random_uuid()';
COMMENT ON COLUMN exam_boards_config.board_code             IS 'C0 — short board identifier; unique; e.g. AQA, Edexcel';
COMMENT ON COLUMN exam_boards_config.board_name             IS 'C0 — full board name';
COMMENT ON COLUMN exam_boards_config.board_licence_cleared  IS 'C0 — COMPLIANCE GATE (C-003): FALSE = no questions from this board may be served to any subscriber; TRUE only after signed licence confirmed by human DPO';
COMMENT ON COLUMN exam_boards_config.licence_cleared_at     IS 'C0 — timestamp when licence was confirmed; null until cleared; set by admin action only';
COMMENT ON COLUMN exam_boards_config.licence_reference      IS 'C0 — internal reference for the signed licence agreement; null until cleared';
COMMENT ON COLUMN exam_boards_config.created_at             IS 'C0 — set on insert';
COMMENT ON COLUMN exam_boards_config.updated_at             IS 'C0 — updated on licence status change';

-- ============================================================
-- Seed Data
-- All six boards seeded with board_licence_cleared = FALSE (default).
-- board_licence_cleared may only be set to TRUE by a human admin/DPO action
-- after a signed licence agreement is confirmed (compliance C-003).
-- DO NOT set board_licence_cleared = TRUE in this migration.
-- ============================================================

INSERT INTO exam_boards_config (board_code, board_name, board_licence_cleared)
VALUES
    ('AQA',       'Assessment and Qualifications Alliance',                FALSE),
    ('Edexcel',   'Pearson Edexcel',                                       FALSE),
    ('OCR',       'Oxford Cambridge and RSA Examinations',                  FALSE),
    ('CCEA',      'Council for the Curriculum, Examinations and Assessment', FALSE),
    ('WJEC',      'Welsh Joint Education Committee',                        FALSE),
    ('Cambridge', 'Cambridge Assessment International Education',           FALSE)
ON CONFLICT (board_code) DO NOTHING;

-- ============================================================
-- DOWN
-- ============================================================

DROP INDEX  IF EXISTS exam_boards_config_licence_cleared_idx;
DROP INDEX  IF EXISTS exam_boards_config_board_code_idx;
DROP TABLE  IF EXISTS exam_boards_config;

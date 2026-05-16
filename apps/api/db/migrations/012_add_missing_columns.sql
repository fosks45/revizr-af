-- Migration 012: Add columns required by application code but missing from initial migrations.
-- These were documented in route-file comments but not formalised as migrations.
-- Without this migration the application fails on a clean database.
--
-- Columns added:
--   users.email_hash          — HMAC-SHA256 of email for login lookup (C3)
--   questions.board_licence_cleared — copyright gate for question serving (C0)
--   accounts.daily_question_cap     — parental controls (C1)
--   accounts.session_duration_minutes — parental controls (C1)

-- ============================================================
-- UP
-- ============================================================

-- C3 — encrypted; HMAC-SHA256 of plaintext email for constant-time lookup
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS email_hash VARCHAR(64); -- C3: HMAC lookup index

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_hash
  ON users (email_hash)
  WHERE email_hash IS NOT NULL;

COMMENT ON COLUMN users.email_hash IS 'C3: HMAC-SHA256(email + server_salt) for constant-time login lookup. Not the email itself.';

-- C0 — content licensing gate; default FALSE until licence is confirmed per board
ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS board_licence_cleared BOOLEAN NOT NULL DEFAULT FALSE; -- C0: copyright gate

CREATE INDEX IF NOT EXISTS idx_questions_board_cleared
  ON questions (board_licence_cleared)
  WHERE board_licence_cleared = TRUE;

COMMENT ON COLUMN questions.board_licence_cleared IS 'C0: TRUE only after written licence from the exam board is received and recorded. All question-serving queries MUST include WHERE board_licence_cleared = TRUE.';

-- C1 — parental controls written by POST /parent/children/:studentId/controls
ALTER TABLE accounts
  ADD COLUMN IF NOT EXISTS daily_question_cap SMALLINT NOT NULL DEFAULT 50, -- C1: parental control
  ADD COLUMN IF NOT EXISTS session_duration_minutes SMALLINT NOT NULL DEFAULT 60; -- C1: parental control

COMMENT ON COLUMN accounts.daily_question_cap IS 'C1: Maximum questions per day for the student. Set by parent via parental controls. 0 = no limit.';
COMMENT ON COLUMN accounts.session_duration_minutes IS 'C1: Maximum session duration in minutes. Set by parent. 0 = no limit.';


-- ============================================================
-- DOWN
-- ============================================================

ALTER TABLE accounts
  DROP COLUMN IF EXISTS session_duration_minutes,
  DROP COLUMN IF EXISTS daily_question_cap;

DROP INDEX IF EXISTS idx_questions_board_cleared;
ALTER TABLE questions
  DROP COLUMN IF EXISTS board_licence_cleared;

DROP INDEX IF EXISTS idx_users_email_hash;
ALTER TABLE users
  DROP COLUMN IF EXISTS email_hash;

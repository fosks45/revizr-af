-- =============================================================================
-- Migration: 007_create_practice.sql
-- Task:      T-005 [Sprint 0], T-033–T-042 [Sprint 3 — Practice Session Core]
-- Tables:    practice_sessions, session_question_attempts
-- Purpose:   Practice session model (F4, F8, F9, F10, F31).
--
--            practice_sessions — one row per student practice session.
--            session_question_attempts — one row per question presented within
--            a session; records self-mark score and timing data.
--
--            user_id on practice_sessions is C3 (encrypted) as it directly
--            identifies the student. subject_id is C1 (not directly identifying).
--            All attempt columns are C1 — behavioural/performance data; no PII.
--
-- Authority: data-model.md §§ practice_sessions, session_question_attempts,
--            ADR-0003
-- =============================================================================

-- ============================================================
-- UP
-- ============================================================

CREATE TYPE IF NOT EXISTS practice_session_status AS ENUM ('active', 'completed', 'abandoned');

-- ------------------------------------------------------------
-- practice_sessions
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS practice_sessions (
    id              UUID                        NOT NULL DEFAULT gen_random_uuid(),  -- C0: public PK
    user_id         UUID                        NOT NULL,                            -- C3: encrypted at rest: AES-256-GCM; FK → users.id; identifies the student; C7 context applies if student is under 18
    subject_id      UUID                        NOT NULL,                            -- C1: FK → subjects.id; not directly identifying in isolation
    started_at      TIMESTAMPTZ                 NOT NULL DEFAULT NOW(),              -- C1: set on insert; immutable
    ended_at        TIMESTAMPTZ                     NULL DEFAULT NULL,               -- C1: set when status transitions to completed or abandoned; null during active session
    status          practice_session_status     NOT NULL DEFAULT 'active',           -- C1: 'active' | 'completed' | 'abandoned'
    question_count  SMALLINT                    NOT NULL,                            -- C1: number of questions in this session; set at session creation; >= 1

    CONSTRAINT practice_sessions_pkey PRIMARY KEY (id),

    CONSTRAINT practice_sessions_question_count_positive
        CHECK (question_count >= 1),

    -- ON DELETE CASCADE: if user is hard-deleted (GDPR purge), their sessions
    -- and all child attempt records cascade-delete.
    CONSTRAINT practice_sessions_user_id_fk
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,

    -- ON DELETE RESTRICT: subject must not be hard-deleted while sessions reference
    -- it, to preserve the context of historical performance data. Subjects are
    -- soft-deleted via is_active = false.
    CONSTRAINT practice_sessions_subject_id_fk
        FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS practice_sessions_user_id_idx
    ON practice_sessions (user_id);

CREATE INDEX IF NOT EXISTS practice_sessions_user_id_status_idx
    ON practice_sessions (user_id, status);

COMMENT ON TABLE  practice_sessions                IS 'One row per student practice session. Parent of session_question_attempts.';
COMMENT ON COLUMN practice_sessions.id             IS 'C0 — public PK; gen_random_uuid()';
COMMENT ON COLUMN practice_sessions.user_id        IS 'C3 — encrypted at rest: AES-256-GCM; FK → users.id CASCADE; C7 context if under-18 student';
COMMENT ON COLUMN practice_sessions.subject_id     IS 'C1 — FK → subjects.id RESTRICT; not directly identifying';
COMMENT ON COLUMN practice_sessions.started_at     IS 'C1 — set on insert; immutable';
COMMENT ON COLUMN practice_sessions.ended_at       IS 'C1 — set on status transition to completed | abandoned; null during active session';
COMMENT ON COLUMN practice_sessions.status         IS 'C1 — enum: active | completed | abandoned';
COMMENT ON COLUMN practice_sessions.question_count IS 'C1 — number of questions; set at creation; >= 1';

-- ------------------------------------------------------------
-- session_question_attempts
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS session_question_attempts (
    id                      UUID        NOT NULL DEFAULT gen_random_uuid(),  -- C0: public PK
    practice_session_id     UUID        NOT NULL,                            -- C1: FK → practice_sessions.id; not directly identifying in isolation
    question_id             UUID        NOT NULL,                            -- C0: FK → questions.id; public question reference
    presented_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),              -- C1: when the question was shown to the student
    self_mark_score         SMALLINT        NULL DEFAULT NULL,               -- C1: student's self-assessed score (0 to questions.max_marks); null until submitted
    time_spent_seconds      SMALLINT        NULL DEFAULT NULL,               -- C1: elapsed seconds between presentation and self-mark submission; null until submitted; SMALLINT supports up to ~9 hours
    mark_scheme_viewed      BOOLEAN     NOT NULL DEFAULT FALSE,              -- C1: whether student clicked "Show mark scheme" before self-marking; used for session analytics

    CONSTRAINT session_question_attempts_pkey PRIMARY KEY (id),

    CONSTRAINT session_question_attempts_self_mark_score_non_negative
        CHECK (self_mark_score IS NULL OR self_mark_score >= 0),

    CONSTRAINT session_question_attempts_time_spent_non_negative
        CHECK (time_spent_seconds IS NULL OR time_spent_seconds >= 0),

    -- ON DELETE CASCADE: if the parent practice session is deleted (GDPR purge),
    -- all attempt records for that session cascade-delete.
    CONSTRAINT session_question_attempts_session_id_fk
        FOREIGN KEY (practice_session_id) REFERENCES practice_sessions (id) ON DELETE CASCADE,

    -- ON DELETE RESTRICT: question records are read-only pipeline data; they should
    -- never be deleted while practice attempts reference them. Deletion of a question
    -- requires a data migration to handle orphaned attempts.
    CONSTRAINT session_question_attempts_question_id_fk
        FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS attempts_session_id_idx
    ON session_question_attempts (practice_session_id);

CREATE INDEX IF NOT EXISTS attempts_question_id_idx
    ON session_question_attempts (question_id);

COMMENT ON TABLE  session_question_attempts                    IS 'One row per question presented in a practice session. Records self-mark and timing. C1 only — no PII.';
COMMENT ON COLUMN session_question_attempts.id                 IS 'C0 — public PK; gen_random_uuid()';
COMMENT ON COLUMN session_question_attempts.practice_session_id IS 'C1 — FK → practice_sessions.id CASCADE; not directly identifying';
COMMENT ON COLUMN session_question_attempts.question_id        IS 'C0 — FK → questions.id RESTRICT; public question reference';
COMMENT ON COLUMN session_question_attempts.presented_at       IS 'C1 — when question was shown; set on insert';
COMMENT ON COLUMN session_question_attempts.self_mark_score    IS 'C1 — student self-assessed score; null until submitted; must be <= questions.max_marks (enforced by application)';
COMMENT ON COLUMN session_question_attempts.time_spent_seconds IS 'C1 — elapsed seconds presentation to submission; null until submitted';
COMMENT ON COLUMN session_question_attempts.mark_scheme_viewed IS 'C1 — true if student viewed mark scheme before self-marking; default false';

-- ============================================================
-- DOWN
-- ============================================================

DROP INDEX  IF EXISTS attempts_question_id_idx;
DROP INDEX  IF EXISTS attempts_session_id_idx;
DROP TABLE  IF EXISTS session_question_attempts;

DROP INDEX  IF EXISTS practice_sessions_user_id_status_idx;
DROP INDEX  IF EXISTS practice_sessions_user_id_idx;
DROP TABLE  IF EXISTS practice_sessions;

DROP TYPE   IF EXISTS practice_session_status;

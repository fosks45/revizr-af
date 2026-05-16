-- =============================================================================
-- Migration: 008_create_progress.sql
-- Task:      T-005 [Sprint 0], T-043–T-045 [Sprint 4 — Progress Dashboard]
-- Table:     progress_snapshots
-- Purpose:   Pre-computed weekly aggregate of practice performance per user,
--            subject, and topic (F5). Populated by a scheduled job (T-043);
--            NOT written by the application request path.
--
--            The unique constraint on (user_id, subject_id, snapshot_date, topic_tag)
--            allows the snapshot job to use an UPSERT (INSERT ... ON CONFLICT DO UPDATE)
--            making it idempotent (Principle 8).
--
--            user_id is C3 (encrypted) as it directly identifies the student.
--            All aggregate metrics are C1.
--
-- Authority: data-model.md §Entity:progress_snapshots, ADR-0003, plan.md T-043
-- =============================================================================

-- ============================================================
-- UP
-- ============================================================

CREATE TABLE IF NOT EXISTS progress_snapshots (
    id                      UUID            NOT NULL DEFAULT gen_random_uuid(),  -- C0: public PK
    user_id                 UUID            NOT NULL,                            -- C3: encrypted at rest: AES-256-GCM; FK → users.id; identifies the student; C7 context if under-18
    subject_id              UUID            NOT NULL,                            -- C1: FK → subjects.id; not directly identifying in isolation
    snapshot_date           DATE            NOT NULL,                            -- C1: ISO date of the snapshot (Monday of each week); not identifying in isolation
    topic_tag               VARCHAR(100)    NOT NULL,                            -- C1: topic granularity; matches questions.topic_tags and diagnostic_results.topic_tag
    score_avg               NUMERIC(4,3)    NOT NULL,                            -- C1: average self-mark proportion (0.000–1.000) for the period and topic; CHECK enforces range
    questions_attempted     INTEGER         NOT NULL DEFAULT 0,                  -- C1: total questions attempted in the period for this topic; >= 0
    questions_correct       INTEGER         NOT NULL DEFAULT 0,                  -- C1: questions where self_mark_score = questions.max_marks; >= 0; <= questions_attempted (enforced by application)
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),              -- C1: row creation timestamp; set by snapshot job

    CONSTRAINT progress_snapshots_pkey PRIMARY KEY (id),

    CONSTRAINT progress_snapshots_score_avg_range
        CHECK (score_avg >= 0.000 AND score_avg <= 1.000),

    CONSTRAINT progress_snapshots_questions_non_negative
        CHECK (questions_attempted >= 0 AND questions_correct >= 0),

    -- Unique constraint enables the snapshot job's UPSERT:
    -- INSERT ... ON CONFLICT (user_id, subject_id, snapshot_date, topic_tag) DO UPDATE
    -- This makes the weekly snapshot job idempotent (Principle 8).
    CONSTRAINT progress_snapshots_unique_period_topic
        UNIQUE (user_id, subject_id, snapshot_date, topic_tag),

    -- ON DELETE CASCADE: if user is hard-deleted (GDPR purge), their snapshot
    -- history cascades. Progress data is derived from session attempts; no
    -- separate GDPR erasure step is needed beyond the user cascade.
    CONSTRAINT progress_snapshots_user_id_fk
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,

    -- ON DELETE RESTRICT: subject must not be hard-deleted while snapshots
    -- reference it, to preserve dashboard history. Use is_active = false.
    CONSTRAINT progress_snapshots_subject_id_fk
        FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE RESTRICT
);

-- Primary dashboard query index: "get all snapshots for user X, subject Y,
-- in date range" — used by GET /progress and GET /progress/topics.
CREATE INDEX IF NOT EXISTS snapshots_user_subject_date_idx
    ON progress_snapshots (user_id, subject_id, snapshot_date);

COMMENT ON TABLE  progress_snapshots                        IS 'Pre-computed weekly performance aggregates per user, subject, and topic. Written by scheduled job only; not written by request path. UPSERT-safe via unique constraint.';
COMMENT ON COLUMN progress_snapshots.id                     IS 'C0 — public PK; gen_random_uuid()';
COMMENT ON COLUMN progress_snapshots.user_id                IS 'C3 — encrypted at rest: AES-256-GCM; FK → users.id CASCADE; C7 context if under-18 student';
COMMENT ON COLUMN progress_snapshots.subject_id             IS 'C1 — FK → subjects.id RESTRICT; not directly identifying';
COMMENT ON COLUMN progress_snapshots.snapshot_date          IS 'C1 — ISO date; Monday of each snapshot week';
COMMENT ON COLUMN progress_snapshots.topic_tag              IS 'C1 — topic label; matches questions.topic_tags and diagnostic_results.topic_tag';
COMMENT ON COLUMN progress_snapshots.score_avg              IS 'C1 — 0.000–1.000 average self-mark proportion; range-checked';
COMMENT ON COLUMN progress_snapshots.questions_attempted    IS 'C1 — total questions attempted in period for this topic; >= 0';
COMMENT ON COLUMN progress_snapshots.questions_correct      IS 'C1 — questions where self_mark = max_marks; >= 0; <= questions_attempted (application-enforced)';
COMMENT ON COLUMN progress_snapshots.created_at             IS 'C1 — row creation timestamp; set by snapshot job; immutable';

-- ============================================================
-- DOWN
-- ============================================================

DROP INDEX  IF EXISTS snapshots_user_subject_date_idx;
DROP TABLE  IF EXISTS progress_snapshots;

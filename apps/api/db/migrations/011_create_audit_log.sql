-- =============================================================================
-- Migration: 011_create_audit_log.sql
-- Task:      T-010 [Sprint 0 — Audit Log], T-005
-- Table:     audit_log (partitioned, append-only)
-- Purpose:   Governance and audit trail (Principle 10 — No Black Boxes).
--            Records every agent/user action, tool call, and governance decision.
--            Immutable: no UPDATE or DELETE permitted for the application role.
--            A separate 'audit_writer' role has INSERT only.
--
--            No user content, no prompt text, no personal data VALUES are stored
--            here — only metadata, hashed identifiers, and governance outcomes.
--            actor_id_hash is an opaque reference: it is the SHA-256 of the
--            actor's user UUID (or an agent ID string), salted with a server-side
--            secret, so the original UUID cannot be reversed from this table alone.
--
--            Table is partitioned by month (RANGE on timestamp) for query
--            performance and retention management. The default partition catches
--            any rows that fall outside explicitly created monthly partitions
--            (prevents data loss if the partition-creation job is late).
--            Monthly partitions must be created by the ops/infra job before the
--            start of each month.
--
--            Retention: per compliance-decision.md C-014 and GDPR Art 5(1)(e),
--            audit logs are retained for a minimum of 7 years after the event
--            (C1 internal data). Monthly partitions older than 7 years are
--            detached and archived to S3 Glacier (cold storage) before being
--            dropped — never dropped directly without archival.
--
-- Authority: data-model.md §Entity:audit_log, Principle 10, compliance-decision.md
--            C-006, C-010, C-014; ADR-0003
-- =============================================================================

-- ============================================================
-- UP
-- ============================================================

-- audit_log is a partitioned table (PARTITION BY RANGE on timestamp).
-- Partitions are created monthly by an ops job.
-- The primary key includes the partition key (timestamp) as required by
-- PostgreSQL for partitioned tables with a global unique constraint.
CREATE TABLE IF NOT EXISTS audit_log (
    id              BIGSERIAL,                                              -- C0: monotonically increasing surrogate PK; not a UUID to allow efficient range scans on sequential IDs within a partition
    timestamp       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),                 -- C0: server-side now(); partition key; immutable; not updated
    actor_id_hash   VARCHAR(64)     NOT NULL,                               -- C0: opaque actor reference; SHA-256(actor_uuid + server_salt); never stores plaintext user UUID or agent name; lookup is one-way only
    action          VARCHAR(100)    NOT NULL,                               -- C0: e.g. 'diagnostic.upload.initiated', 'auth.login.success', 'subscription.webhook.received'
    entity_type     VARCHAR(50)         NULL DEFAULT NULL,                  -- C0: e.g. 'diagnostic_session', 'user', 'subscription'; null for non-entity actions
    entity_id       UUID                NULL DEFAULT NULL,                  -- C0: entity UUID; stored as UUID type for sortability; no FK — immutability requires no FK dependency
    decision        VARCHAR(20)     NOT NULL,                               -- C0: enum-like: 'allowed' | 'denied' | 'escalated'
    policy_name     VARCHAR(100)        NULL DEFAULT NULL,                  -- C0: policy that produced the decision; e.g. 'rate_limit_tool_calls', 'data_class_linter'; null if no policy applied
    metadata_json   JSONB               NULL DEFAULT NULL,                  -- C0: structured metadata only: token counts, latency_ms, cost_usd, policy_rule_matched; NO user content; NO prompt text; NO PII values; schema governed by audit agent before write

    -- The primary key spans (id, timestamp) because PostgreSQL requires all
    -- partition key columns to be part of the primary key for partitioned tables.
    CONSTRAINT audit_log_pkey PRIMARY KEY (id, timestamp)

) PARTITION BY RANGE (timestamp);

-- ------------------------------------------------------------
-- Default partition: catches rows that fall outside all monthly partitions.
-- This prevents data loss if the monthly partition-creation job is late.
-- The default partition should always be empty in normal operation.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_log_default
    PARTITION OF audit_log DEFAULT;

-- ------------------------------------------------------------
-- Bootstrap: create the current and next month's partitions so the table
-- is immediately usable after this migration runs. The ops job creates
-- future partitions at the start of each month.
-- These partition names use the format audit_log_YYYY_MM.
-- ------------------------------------------------------------

-- Current month partition (2026-05):
CREATE TABLE IF NOT EXISTS audit_log_2026_05
    PARTITION OF audit_log
    FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');

-- Next month partition (2026-06):
CREATE TABLE IF NOT EXISTS audit_log_2026_06
    PARTITION OF audit_log
    FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');

-- ------------------------------------------------------------
-- Indexes (created on the parent table; PostgreSQL propagates to partitions).
-- ------------------------------------------------------------

-- Primary time-range query index (audit dashboard, retention sweep).
CREATE INDEX IF NOT EXISTS audit_log_timestamp_idx
    ON audit_log (timestamp);

-- Actor-based lookup (e.g. "show all actions by this actor in the last 30 days").
CREATE INDEX IF NOT EXISTS audit_log_actor_id_hash_idx
    ON audit_log (actor_id_hash);

-- Entity lookup (e.g. "show all audit events for this diagnostic_session").
CREATE INDEX IF NOT EXISTS audit_log_entity_type_entity_id_idx
    ON audit_log (entity_type, entity_id);

-- ------------------------------------------------------------
-- Role-based append-only enforcement (Principle 10, ADR-0003 §Append-only).
-- The 'audit_writer' role is created by the infrastructure provisioning script
-- (T-010) and has INSERT only on audit_log.
-- The PUBLIC role (which includes the application's 'revizr_app' DB role) has
-- UPDATE and DELETE explicitly revoked as a defence-in-depth measure.
-- NOTE: REVOKE from PUBLIC here is belt-and-braces; the primary enforcement
-- is that 'revizr_app' is never granted UPDATE or DELETE on this table.
-- ------------------------------------------------------------
REVOKE UPDATE, DELETE ON audit_log FROM PUBLIC;

-- ------------------------------------------------------------
-- Table and column comments.
-- ------------------------------------------------------------
COMMENT ON TABLE  audit_log                 IS 'Append-only governance and audit trail (Principle 10). All C0. No user content, no prompt text, no PII values. Partitioned by month. Retained 7 years minimum then archived to S3 Glacier before drop. UPDATE and DELETE revoked from PUBLIC.';
COMMENT ON COLUMN audit_log.id              IS 'C0 — BIGSERIAL surrogate PK; monotonically increasing; combined with timestamp for partitioned PK';
COMMENT ON COLUMN audit_log.timestamp       IS 'C0 — partition key; server-side now(); immutable; never updated';
COMMENT ON COLUMN audit_log.actor_id_hash   IS 'C0 — opaque actor reference; SHA-256(uuid + server_salt); never stores plaintext UUID; one-way only';
COMMENT ON COLUMN audit_log.action          IS 'C0 — action string; e.g. diagnostic.upload.initiated, auth.login.success';
COMMENT ON COLUMN audit_log.entity_type     IS 'C0 — entity type; e.g. diagnostic_session, user, subscription; null for non-entity actions';
COMMENT ON COLUMN audit_log.entity_id       IS 'C0 — entity UUID; no FK to preserve immutability; null for non-entity actions';
COMMENT ON COLUMN audit_log.decision        IS 'C0 — governance outcome: allowed | denied | escalated';
COMMENT ON COLUMN audit_log.policy_name     IS 'C0 — policy that produced the decision; null if no policy applied';
COMMENT ON COLUMN audit_log.metadata_json   IS 'C0 — structured metadata only: token counts, latency_ms, cost_usd; NO user content; NO prompts; NO PII; schema governed by audit agent';

-- ============================================================
-- DOWN
-- Partitions must be dropped before the parent table.
-- ============================================================

REVOKE ALL ON audit_log FROM PUBLIC;  -- clean up any grants before drop

DROP INDEX  IF EXISTS audit_log_entity_type_entity_id_idx;
DROP INDEX  IF EXISTS audit_log_actor_id_hash_idx;
DROP INDEX  IF EXISTS audit_log_timestamp_idx;

-- Drop partitions in reverse chronological order before parent.
DROP TABLE  IF EXISTS audit_log_2026_06;
DROP TABLE  IF EXISTS audit_log_2026_05;
DROP TABLE  IF EXISTS audit_log_default;

DROP TABLE  IF EXISTS audit_log;

# Revizr Data Model

**Document version:** 1.0.0
**Date:** 2026-05-15
**Authority:** ADR-0003 (PostgreSQL), §8.5 Data Classification Taxonomy (CLAUDE.md)
**Status:** Approved — Phase 7 architecture gate

All fields carry a classification from the C0–C8 taxonomy. Fields classified C3 or
above are encrypted at rest (AES-256 column-level encryption via application-layer
encryption before write, unless noted). Fields classified C5 carry field-level
encryption. Fields classified C6 are never logged and are stored in a secrets manager
or equivalent (e.g. hashed + salted in the database, never stored in plaintext).

Classification legend:
- **C0** — Public
- **C1** — Internal
- **C3** — Customer PII
- **C5** — Special Category (health, SEND, biometric data if present in uploaded docs)
- **C6** — Authentication Secrets
- **C7** — Children's Data (any field linked to a user with `age_band` in under13/13to15/16to18)

> Note: C7 is not a separate column-level classification — it is a context classification.
> Any C3 field belonging to a user identified as a minor inherits C7 controls at runtime.
> The data-class-linter agent enforces this via the `users.age_band` join at CI.

---

## Entity: users

Primary identity record. One row per registered user. Soft-delete via `deleted_at`.

| Field | Type | Classification | Notes |
|-------|------|----------------|-------|
| id | uuid | C0 | PK; default `gen_random_uuid()` |
| email | varchar(320) | C3 | Encrypted at rest (AES-256); unique index on ciphertext hash; used for login and notifications |
| password_hash | varchar(255) | C6 | Never logged; Argon2id hash; secrets manager not applicable (stored hashed in DB); never returned in API responses |
| display_name | varchar(100) | C3 | Encrypted at rest (AES-256); shown in UI |
| role | varchar(20) | C1 | Enum: `student`, `parent`, `teacher`; controls dashboard routing |
| age_band | varchar(20) | C3 | Encrypted at rest (AES-256); enum: `under13`, `13to15`, `16to18`, `adult`; drives C7 classification context and consent requirements |
| locale | varchar(10) | C1 | BCP-47 locale code, e.g. `en-GB`, `cy`; default `en-GB` |
| created_at | timestamptz | C1 | Set on insert; not updated |
| updated_at | timestamptz | C1 | Updated on every write |
| deleted_at | timestamptz | C1 | Soft delete; null = active; GDPR erasure sets this and nullifies C3 fields |

**Indexes:** `users_email_hash_idx` (on SHA-256 hash of plaintext email for lookup);
`users_role_idx`; `users_deleted_at_idx` (partial, where deleted_at IS NULL).

---

## Entity: accounts

Links a parent user to a student user. Records parental consent. One row per
parent–student relationship.

| Field | Type | Classification | Notes |
|-------|------|----------------|-------|
| id | uuid | C0 | PK |
| parent_user_id | uuid | C3 | FK → users.id; encrypted at rest (AES-256) |
| student_user_id | uuid | C3 | FK → users.id; encrypted at rest (AES-256) |
| consent_given_at | timestamptz | C3 | Encrypted at rest (AES-256); timestamp of explicit parental consent event |
| consent_mechanism | varchar(50) | C3 | Encrypted at rest (AES-256); e.g. `email_verified_link`, `in-app-checkbox`; required for ICO accountability |
| consent_ip_hash | varchar(64) | C3 | Encrypted at rest (AES-256); SHA-256 of consenting parent's IP at consent time; never stored in plaintext; used for accountability not tracking |
| relationship | varchar(50) | C3 | Encrypted at rest (AES-256); self-declared: `parent`, `guardian`, `carer` |
| status | varchar(20) | C1 | Enum: `pending`, `active`, `revoked`; parental consent can be revoked |
| created_at | timestamptz | C1 | Set on insert |
| updated_at | timestamptz | C1 | Updated on status changes |

**Indexes:** `accounts_parent_user_id_idx`; `accounts_student_user_id_idx`;
unique constraint on `(parent_user_id, student_user_id)`.

---

## Entity: subjects

A subject that a student is studying. User-owned; not a global catalogue.

| Field | Type | Classification | Notes |
|-------|------|----------------|-------|
| id | uuid | C0 | PK |
| user_id | uuid | C1 | FK → users.id; not directly identifying in isolation |
| subject_name | varchar(100) | C1 | e.g. `Mathematics`, `English Literature` |
| exam_board | varchar(50) | C1 | e.g. `AQA`, `Edexcel`, `OCR`, `WJEC` |
| level | varchar(20) | C1 | Enum: `11plus`, `ks3`, `gcse`, `alevel` |
| is_active | boolean | C1 | Soft-hide without deletion; default true |
| created_at | timestamptz | C1 | Set on insert |
| updated_at | timestamptz | C1 | Updated on write |

**Indexes:** `subjects_user_id_idx`; `subjects_user_id_active_idx` (partial, where is_active = true).

---

## Entity: questions

The exam question bank. Content is copyright-licensed from exam boards under a
data licence agreement. Not user-generated. Read-only from the application; seeded
and updated by the data pipeline.

| Field | Type | Classification | Notes |
|-------|------|----------------|-------|
| id | uuid | C0 | PK |
| board | varchar(50) | C0 | e.g. `AQA`, `Edexcel`; public |
| level | varchar(20) | C0 | e.g. `gcse`, `alevel` |
| subject | varchar(100) | C0 | e.g. `Mathematics` |
| year | smallint | C0 | e.g. `2023` |
| paper_ref | varchar(50) | C0 | e.g. `8300/1H`; public paper reference |
| topic_tags | jsonb | C0 | Array of strings, e.g. `["algebra","quadratics"]` |
| question_text | text | C1 | Copyright-licensed; not C0 due to licence restrictions on redistribution |
| mark_scheme_text | text | C1 | Copyright-licensed |
| max_marks | smallint | C0 | e.g. `5` |
| question_type | varchar(30) | C0 | Enum: `multiple_choice`, `short_answer`, `extended_answer` |
| image_refs | jsonb | C0 | Array of S3 keys for question diagrams; publicly accessible images |
| created_at | timestamptz | C0 | Pipeline ingestion timestamp |

**Indexes:** `questions_board_level_subject_idx`; `questions_topic_tags_gin_idx` (GIN on jsonb).

---

## Entity: diagnostic_sessions

A single diagnostic run — either a report upload or a quiz-based diagnostic. Parent
of `uploaded_documents` and `diagnostic_results`.

| Field | Type | Classification | Notes |
|-------|------|----------------|-------|
| id | uuid | C0 | PK |
| user_id | uuid | C3 | FK → users.id; encrypted at rest (AES-256) |
| session_type | varchar(30) | C1 | Enum: `report_upload`, `quiz` |
| status | varchar(20) | C1 | Enum: `pending`, `processing`, `complete`, `failed` |
| created_at | timestamptz | C1 | Set on insert |
| completed_at | timestamptz | C1 | Set when status transitions to `complete` or `failed` |

**Indexes:** `diagnostic_sessions_user_id_idx`; `diagnostic_sessions_status_idx`.

---

## Entity: uploaded_documents

Audit record of each report upload. The raw document is deleted immediately after
processing (ADR-0008); this table retains only metadata for audit purposes.

| Field | Type | Classification | Notes |
|-------|------|----------------|-------|
| id | uuid | C0 | PK |
| diagnostic_session_id | uuid | C1 | FK → diagnostic_sessions.id |
| s3_key | varchar(500) | C3 | Encrypted at rest (AES-256); the S3 object key used during upload window; recorded for audit trail; object is deleted post-processing |
| content_hash | varchar(64) | C3 | Encrypted at rest (AES-256); SHA-256 of raw file bytes before upload; allows re-upload deduplication check |
| status | varchar(20) | C1 | Enum: `uploaded`, `processing`, `deleted`; must reach `deleted` post-processing |
| uploaded_at | timestamptz | C1 | Set on insert |
| deleted_at | timestamptz | C1 | Set when raw document is deleted from S3; null until deletion confirmed |

**Indexes:** `uploaded_documents_session_id_idx`; partial index on `status = 'uploaded'` for
monitoring undeleted documents.

---

## Entity: diagnostic_results

Derived weakness scores and evidence snippets produced from a diagnostic session.
This is the permanent record; the raw document is deleted. Evidence snippets are
extracted text fragments from the report — they may contain C5 data (SEND references,
health context) and are field-level encrypted.

| Field | Type | Classification | Notes |
|-------|------|----------------|-------|
| id | uuid | C0 | PK |
| diagnostic_session_id | uuid | C1 | FK → diagnostic_sessions.id |
| user_id | uuid | C3 | FK → users.id; encrypted at rest (AES-256); denormalised for query performance |
| subject_id | uuid | C1 | FK → subjects.id |
| topic_tag | varchar(100) | C1 | e.g. `algebra`, `forces`; matches questions.topic_tags values |
| weakness_score | numeric(4,3) | C1 | 0.000–1.000; higher = weaker; derived by Claude API scoring model |
| evidence_snippets | jsonb | C3 | **Field-level encryption required; DPIA applies.** Array of text fragments extracted from report supporting the weakness score; may contain C5 data (health, SEND); encrypted with per-record AES-256 key; key stored in application-layer key vault |
| created_at | timestamptz | C1 | Set on insert |

**Indexes:** `diagnostic_results_user_id_subject_idx` (composite);
`diagnostic_results_session_id_idx`.

---

## Entity: practice_sessions

A timed or untimed practice session in which the user answers questions.

| Field | Type | Classification | Notes |
|-------|------|----------------|-------|
| id | uuid | C0 | PK |
| user_id | uuid | C3 | FK → users.id; encrypted at rest (AES-256) |
| subject_id | uuid | C1 | FK → subjects.id |
| started_at | timestamptz | C1 | Set on insert |
| ended_at | timestamptz | C1 | Set when status transitions to `completed` or `abandoned` |
| status | varchar(20) | C1 | Enum: `active`, `completed`, `abandoned` |
| question_count | smallint | C1 | Number of questions in this session; set at session creation |

**Indexes:** `practice_sessions_user_id_idx`; `practice_sessions_user_id_status_idx`.

---

## Entity: session_question_attempts

One row per question presented within a practice session. Records the student's
self-mark and timing data.

| Field | Type | Classification | Notes |
|-------|------|----------------|-------|
| id | uuid | C0 | PK |
| practice_session_id | uuid | C1 | FK → practice_sessions.id |
| question_id | uuid | C0 | FK → questions.id |
| presented_at | timestamptz | C1 | When the question was shown to the user |
| self_mark_score | smallint | C1 | Student's self-assessed score (0 to question.max_marks) |
| time_spent_seconds | smallint | C1 | Elapsed seconds between question presentation and self-mark submission |
| mark_scheme_viewed | boolean | C1 | Whether the student clicked "Show mark scheme" before self-marking; default false |

**Indexes:** `attempts_session_id_idx`; `attempts_question_id_idx`.

---

## Entity: progress_snapshots

Pre-computed weekly aggregate of practice performance per user, subject, and topic.
Populated by a scheduled job; not written by the application request path.

| Field | Type | Classification | Notes |
|-------|------|----------------|-------|
| id | uuid | C0 | PK |
| user_id | uuid | C3 | FK → users.id; encrypted at rest (AES-256) |
| subject_id | uuid | C1 | FK → subjects.id |
| snapshot_date | date | C1 | ISO date of the snapshot (Monday of each week) |
| topic_tag | varchar(100) | C1 | Topic granularity |
| score_avg | numeric(4,3) | C1 | Average self-mark score as a proportion of max marks for the period |
| questions_attempted | integer | C1 | Total questions attempted in the period for this topic |
| questions_correct | integer | C1 | Questions where self_mark_score = max_marks |

**Indexes:** `snapshots_user_subject_date_idx` (composite); unique on
`(user_id, subject_id, snapshot_date, topic_tag)`.

---

## Entity: subscriptions

Billing subscription state. Stripe is the source of truth for billing; this table
is the Revizr-side entitlement record, maintained exclusively via Stripe webhooks.
No card data is stored.

| Field | Type | Classification | Notes |
|-------|------|----------------|-------|
| id | uuid | C0 | PK |
| user_id | uuid | C3 | FK → users.id; encrypted at rest (AES-256); unique (one subscription per user) |
| stripe_subscription_id | varchar(255) | C3 | Encrypted at rest (AES-256); Stripe subscription ID (e.g. `sub_1Abc...`); opaque identifier, not card data |
| stripe_customer_id | varchar(255) | C3 | Encrypted at rest (AES-256); Stripe customer ID (e.g. `cus_1Abc...`); opaque identifier |
| plan | varchar(20) | C1 | Enum: `free`, `monthly`, `annual` |
| status | varchar(20) | C1 | Mirrors Stripe subscription status: `active`, `trialing`, `past_due`, `cancelled`, `incomplete` |
| current_period_end | timestamptz | C1 | When the current billing period ends; used for feature gating |
| created_at | timestamptz | C1 | Set on insert |
| cancelled_at | timestamptz | C1 | Set when status transitions to `cancelled`; null otherwise |

**Indexes:** `subscriptions_user_id_idx` (unique); `subscriptions_stripe_sub_id_idx`.

---

## Entity: notification_preferences

Per-user notification opt-in/opt-out state. Push token is hashed (C6) — never stored
in plaintext.

| Field | Type | Classification | Notes |
|-------|------|----------------|-------|
| id | uuid | C0 | PK |
| user_id | uuid | C1 | FK → users.id; unique (one row per user) |
| email_session_reminders | boolean | C1 | Opt-in to weekly session reminder emails; default true |
| email_progress_reports | boolean | C1 | Opt-in to weekly progress summary emails; default true |
| push_enabled | boolean | C1 | Whether push notifications are enabled; default false |
| push_token_hash | varchar(64) | C6 | Never logged; secrets manager only. SHA-256 of the browser push subscription endpoint; used to identify the subscription for deletion; plaintext token stored in application secrets store, not in this table |

**Indexes:** `notification_preferences_user_id_idx` (unique).

---

## Entity: audit_log

Append-only governance and audit trail. Records every agent or user action, tool call,
and governance decision. Immutable — no update or delete operations permitted on this
table. No user content, no prompt text, no personal data values are stored here;
only metadata and identifiers.

| Field | Type | Classification | Notes |
|-------|------|----------------|-------|
| id | uuid | C0 | PK; default `gen_random_uuid()` |
| timestamp | timestamptz | C0 | Set on insert; not updated; server-side `now()` |
| agent_or_user_id | varchar(255) | C0 | Opaque ID: either a user UUID (not linked to users table by FK to preserve immutability) or an agent identifier string |
| action | varchar(100) | C0 | e.g. `diagnostic.upload.initiated`, `auth.login.success`, `subscription.webhook.received` |
| entity_type | varchar(100) | C0 | e.g. `diagnostic_session`, `user`, `subscription` |
| entity_id | varchar(255) | C0 | The entity's UUID or opaque identifier; stored as text to avoid FK dependency |
| decision | varchar(20) | C0 | Enum: `allowed`, `denied`, `escalated`; governance outcome |
| policy | varchar(100) | C0 | Policy name that produced the decision, e.g. `rate_limit_tool_calls`, `data_class_linter` |
| metadata_json | jsonb | C0 | Structured metadata: token counts, latency, cost, policy rule matched. No user content, no prompt text, no PII values. Keys are governed by the audit schema; any key containing user content is rejected by the audit agent before write. |

**Constraints:** No `UPDATE` or `DELETE` grants on this table for the application
database role. A separate `audit_writer` role has `INSERT` only. Table is partitioned
by month (`PARTITION BY RANGE (timestamp)`) for query performance and retention management.

**Indexes:** `audit_log_timestamp_idx`; `audit_log_agent_or_user_id_idx`;
`audit_log_entity_type_entity_id_idx` (composite).

---

## Data Encryption Summary

| Classification | At-Rest Encryption | Field-Level | Logging Policy |
|---|---|---|---|
| C0 | Storage-level (AWS EBS/RDS encryption) | No | Freely logged |
| C1 | Storage-level + AES-256 column (app layer) | No | Logged without value |
| C3 | AES-256 column encryption (app layer) | No (column-level) | Hashed or redacted in logs |
| C5 | AES-256 column + per-record key (field-level) | Yes — per-record key | Never logged; DPIA applies |
| C6 | KDF (Argon2id for passwords); SHA-256 hash for tokens | N/A | Never logged |

All AES-256 column encryption keys are stored in AWS KMS eu-west-2 (CMK).
Per-record C5 field keys are derived from the CMK via KMS `GenerateDataKey`.
Key rotation: CMK rotation is enabled (annual); per-record data keys are rotated
on each write.

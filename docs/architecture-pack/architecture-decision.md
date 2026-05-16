# Architecture Decision — Phase 7 Gate Record

```yaml
phase: 7
gate: plan-sign-off
status: passed
date: 2026-05-15
author: solution-architect
feature: 002-revizr

stack-profile: nextjs-fastify-postgres-claude

stack-summary:
  frontend: Next.js 15 (App Router) + TypeScript
  backend: Fastify + TypeScript + Node.js
  database: PostgreSQL (AWS RDS, eu-west-2)
  ai-gateway: Claude API (claude-sonnet-4-6) via server-side gateway with PII scrubbing
  auth: Email/password + JWT (RS256) + refresh tokens
  async: BullMQ + Redis (ElastiCache, eu-west-2)
  storage: AWS S3 eu-west-2 (presigned URLs, immediate post-processing delete)
  payments: Stripe Checkout + Billing Portal (SAQ A PCI scope)
  email: Resend (transactional)
  cdn: Cloudflare (static assets only; no personal data at edge)
  pwa: Workbox via @ducanh2912/next-pwa; install prompt deferred to post-first-session
  deployment: AWS ECS Fargate eu-west-2 / Vercel Pro lhr1

plan-complete: true
data-model-classified: true
openapi-complete: true
adr-count: 10

adrs:
  - id: ADR-0001
    title: Frontend Framework Selection (Next.js App Router)
    status: accepted
  - id: ADR-0002
    title: Backend API Framework (TypeScript / Fastify)
    status: accepted
  - id: ADR-0003
    title: Primary Data Store (PostgreSQL)
    status: accepted
  - id: ADR-0004
    title: AI Integration (Claude API via server-side gateway)
    status: accepted
  - id: ADR-0005
    title: Authentication (Email/password, JWT + refresh tokens)
    status: accepted
  - id: ADR-0006
    title: Async Diagnostic Processing (Job Queue + SSE)
    status: accepted
  - id: ADR-0007
    title: Payment Processor (Stripe)
    status: accepted
  - id: ADR-0008
    title: File Storage and Deletion Policy (S3 UK + immediate post-processing delete)
    status: accepted
  - id: ADR-0009
    title: UK Data Residency Enforcement
    status: accepted
  - id: ADR-0010
    title: PWA Strategy (Workbox, install prompt deferred, offline deferred to v2)
    status: accepted

human-approval-required: true
human-approval-items:
  - id: HA-001
    adr: ADR-0004
    item: >
      Anthropic Data Processing Agreement (DPA) must be in place under UK GDPR
      Article 28 before any real user data is sent to the Claude API.
      PII-scrubbing architecture reduces exposure but does not eliminate the DPA
      requirement pending legal confirmation of the pseudonymisation position.
    owner: DPO + Legal
    blocking: true

  - id: HA-002
    adr: ADR-0005
    item: >
      DPO sign-off on the authentication architecture for paired accounts involving
      C7 data (users with age_band under13 / 13to15). Specifically: lawful basis
      for storing parental consent mechanism and IP hash; parental consent flow
      meets ICO Children's Code requirements.
    owner: DPO
    blocking: true

  - id: HA-003
    adr: ADR-0007
    item: >
      Stripe commercial agreement confirmation. Ensure Stripe DPA (standard,
      available in Stripe Dashboard) is accepted by a company director before
      processing any real payment data.
    owner: Commercial / Finance
    blocking: true

  - id: HA-004
    adr: ADR-0008
    item: >
      Data Protection Impact Assessment (DPIA) for the diagnostic document upload
      feature (F2). Required before v1 launch with real user data due to C5
      (Special Category) risk profile of school reports. DPO must sign off on
      lawful basis, retention policy, and technical controls documented in ADR-0008.
    owner: DPO
    blocking: true

  - id: HA-005
    adr: ADR-0009
    item: >
      AWS UK region (eu-west-2) data residency controls confirmation. Engineering
      lead must confirm: S3 bucket replication deny policy is active; RDS is in
      eu-west-2 with no cross-region replicas; ECS Fargate tasks are pinned to
      eu-west-2; KMS CMK is in eu-west-2 with rotation enabled.
    owner: Engineering Lead / DevOps
    blocking: true

  - id: HA-006
    adr: ADR-0009
    item: >
      Legal review of the Claude API pseudonymisation position. If the legal
      conclusion is that pseudonymised data sent to Anthropic constitutes a
      cross-border transfer of personal data (not merely processing pseudonymous
      data), UK Standard Contractual Clauses (SCCs) or equivalent transfer
      mechanism must be put in place under UK GDPR Article 46.
    owner: Legal
    blocking: false
    note: Non-blocking for v1 launch if DPA (HA-001) is in place and legal review is in progress.

compliance-conditions-addressed:
  - C-004: Raw documents deleted immediately post-processing (ADR-0008)
  - C-008: C5 data (school reports) deleted immediately post-processing (ADR-0008)
  - C-012: No personal data at CDN edge; all data stores in eu-west-2 (ADR-0009)

data-model-entities: 13
data-model-classification-complete: true
openapi-endpoints: 37
openapi-security-scheme: BearerAuth (RS256 JWT)

next-phase: build
next-action: >
  Human approvals HA-001 through HA-005 must be recorded before Sprint 1 begins.
  HA-006 may run in parallel with Sprint 0 (scaffold). Once approvals are in place,
  the Build squad may begin Sprint 0 using plan.md as the authoritative task list.
```

---
phase: 3
gate: requirements-sign-off
feature: 002-revizr
squad: personas-and-requirements
authored_by: requirements-synthesiser-agent
date: 2026-05-15
status: passed
human-approval-required: true
human-approval-reason: >
  This requirements set includes functional requirements for child data handling
  (C7 classification under the constitution's data taxonomy), consent flows for
  under-16 users, and Age-Appropriate Design Code compliance mechanics. These
  touch user data for minors, which requires human approval per the constitution
  §2 before the Compliance squad proceeds. Additionally, the authentication
  architecture for paired student–parent accounts involves personal data flows
  that require human code-owner sign-off before build.
evidence-pack: personas-pack/
prior-packs:
  - discovery-pack/
  - market-pack/
workers:
  - persona-author
  - jtbd-analyst
  - requirements-synthesiser
  - feature-list-curator
moscow_summary:
  must: 24
  should: 12
  could: 8
  wont: 6
---

# Requirements Decision — Revizr (002-revizr)

## Verdict: PASSED — with human approval required before Compliance phase proceeds

The requirements synthesiser has generated a complete, deduplicated, JTBD-linked
functional requirements set across nine categories. All Must requirements carry a
direct link to at least one P1 JTBD. The MoSCoW prioritisation is grounded in
commercial impact and product viability findings from the prior two phases.

---

## Key Requirements Decisions

### Decision 1: Diagnostic Engine is the product, not a feature

The diagnostic engine — AI analysis of school reports, teacher notes, and
diagnostic test results to produce a topic-level weakness map — is architecturally
the most critical component of the product. Every downstream requirement depends on
it. This creates a sequencing dependency: the diagnostic engine must be designed
first, and its output schema (the topic weakness map) must be the contract that all
other components consume.

The requirements synthesiser has classified the diagnostic engine as Must across
all three input modes (school report upload, teacher note upload, in-product
diagnostic test). All three modes are Must in v1 because different personas will
arrive via different paths: primary school parents (Priya) will upload school
reports; some students (Tariq) will prefer a self-directed diagnostic test;
teachers (Denise) may submit their own notes.

A confidence score on the AI diagnosis output is classified as Should, not Must, in
v1. The product can launch with a diagnosis accuracy that is high enough to be
useful without surfacing the confidence score to users. However, the back-end must
track confidence scores from launch because they will be needed for monitoring
and iteration.

### Decision 2: Parent dashboard is a co-equal product surface, not an afterthought

The parent dashboard has been elevated to Must status across all its core
components: session log, score progression, topic coverage summary, and plain-
English progress summary. This is a deliberate commercial decision grounded in
Cluster C JTBDs (J04, J05, J10, J12) and in the market finding that the parent
purchasing decision is the primary revenue trigger. If the parent dashboard is weak,
conversion from the free diagnostic preview will be low.

The plain-English progress summary (J05, J12) is specifically called out as a
distinct requirement from the session log — it is not enough to show numbers; the
product must translate those numbers into natural language that a non-expert parent
can interpret in 30 seconds.

### Decision 3: Free tier is a conversion funnel, designed as such from day one

The free tier is not a charitable feature — it is the primary paid conversion
mechanism. The requirements for the free tier (R-AUTH-4, R-DIAG-3) are written to
produce maximum emotional investment before the paywall is encountered:

1. The school report upload and diagnostic test must be available in the free tier.
2. The topic weakness map must be visible in the free tier.
3. Three sample questions per weak topic must be accessible in the free tier.
4. The parent dashboard preview (non-live, illustrative) must be visible in the
   free tier.

Everything beyond those four elements requires a paid subscription. The free tier
must not provide ongoing session tracking, full question packs, or live parent
dashboard data. This boundary is a commercial decision, not a technical one, and
must be maintained in product design.

### Decision 4: Exam board coverage — genuine, not cosmetic

JTBD J11 (Siobhan O'Neill, CCEA coverage) and J17 (Denise Okafor, teacher
credibility) both point to the same underlying risk: that the product claims to
cover exam boards it does not genuinely support. The requirement R-PAPER-1 explicitly
requires full coverage of AQA, Edexcel, OCR, CCEA, WJEC, and Cambridge Assessment
in the paper database. R-PAPER-2 requires that all question metadata includes exam
board, year, paper, question number, mark allocation, and topic mapping.

Incomplete exam board coverage is classified as a trust-destruction risk, not just
a content gap. The Personas squad recommendation is that CCEA and WJEC coverage
should be validated before launch, not treated as a future-release item, because
negative word-of-mouth from the NI/Wales market segments would damage the
authentic-papers brand promise.

### Decision 5: Mark schemes are Must, not Should

JTBD J15 (Tariq, A-level) and J02 (Amara, 11+) both require access to correct
answer explanations, not just a binary right/wrong indicator. The requirements
synthesiser has classified mark scheme availability as Must (R-SESS-4) rather than
Should, because without mark scheme explanations the product cannot fulfil the
"learn from mistakes" student JTBD and the improvement loop that drives retention.

This creates a data dependency: the Architecture squad must confirm whether the
founder's database includes mark schemes, or whether mark scheme data must be
sourced separately. This is flagged as an open question for spec.md.

### Decision 6: Child data and consent flows are pre-build blockers

All authentication requirements for accounts where the registered student is under
16 carry a C7 data classification. The consent flow for a parent creating a student
account on behalf of a child aged 10–15 is not a UX detail — it is a legal
prerequisite under the UK Children's Code (Age-Appropriate Design Code) and GDPR
Article 8. The requirement R-AUTH-2 specifies that the parental consent flow must
be in place before any child account can be created and activated.

The requirements synthesiser flags this as a blocking dependency: the Compliance
squad must define the consent mechanism before the Build squad can implement account
creation for under-16 users. This is one of the grounds for the human-approval-
required flag at this gate.

### Decision 7: Teacher/B2B portal is Should, not Must, in v1

The teacher-facing functionality (Denise's JTBDs J16–J18) is strategically valuable
but not a v1 launch blocker. A basic version of the B2B teacher portal — allowing a
teacher to view a student's session report — is classified as Should. A full class-
management dashboard with cohort analytics is classified as Could in v1 and Must in
v2. The rationale is that the D2C consumer channel (parents and students finding the
product directly) is the Year 1 revenue source. The teacher/school channel is Year 2.
Building a full B2B portal in v1 would divert build resource from the core product.

### Decision 8: Streak and habit mechanics are Should, not Must

The student motivation gap (identified in Discovery and carried through to JTBDs
J03 and J08) must be addressed, but the specific mechanics (streaks, leaderboards,
achievement badges) are classified as Should rather than Must. The core product
delivers value without gamification; gamification improves retention and daily
active use. The UX/Design squad is tasked with designing the habit mechanics in a
way that complies with the UK Age-Appropriate Design Code (which restricts certain
types of compulsive design patterns for under-18 users). This is a constraint to
carry into the UX design phase.

---

## Requirements Summary (Full list in spec.md Feature sections)

The complete list of 44 functional requirements (24 Must, 12 Should, 8 Could) is
curated into the feature list in feature-list-curator output and reproduced in
spec.md. The nine categories are:

1. Authentication & Accounts (R-AUTH-1 through R-AUTH-6)
2. Diagnostic Engine (R-DIAG-1 through R-DIAG-6)
3. Paper Database & Question Assembly (R-PAPER-1 through R-PAPER-5)
4. Practice Session (R-SESS-1 through R-SESS-6)
5. Progress Tracking (R-PROG-1 through R-PROG-5)
6. Parent Dashboard (R-DASH-1 through R-DASH-5)
7. Notifications (R-NOTIF-1 through R-NOTIF-4)
8. Admin & Content Management (R-ADMIN-1 through R-ADMIN-5)
9. Subscription & Billing (R-BILL-1 through R-BILL-4)

---

## Open Items for Human Decision

1. **Parental consent mechanism** — The specific UX and legal mechanism for
   obtaining parental consent for under-16 student accounts must be reviewed by a
   human data protection advisor before the Compliance squad produces its consent
   flow design. The requirements specify that consent must be obtained; the mechanism
   (email verification, ID check, or alternative) must be determined in consultation
   with legal counsel.

2. **Mark scheme data availability** — The founder must confirm whether the 30,000+
   paper database includes mark schemes for all papers, a subset, or none. This
   determination affects whether R-SESS-4 (mark scheme explanations) is achievable
   at launch or requires a data sourcing programme.

3. **CCEA and WJEC paper completeness** — The portfolio of papers for CCEA and WJEC
   boards must be audited before the content completeness claim is made in marketing.
   A product that advertises CCEA coverage but has patchy CCEA content would
   invalidate J11 and damage trust in NI/Wales markets.

4. **Age gate threshold** — The product targets students from age 9 (11+ candidates
   in Year 5). This is below the GDPR Article 8 consent threshold (age 13 in the UK,
   and special consideration applies). The Compliance squad must determine the minimum
   account age, the consent mechanism for the 9–12 age range, and whether the product
   needs specific Age-Appropriate Design Code adaptations for this cohort.

5. **Teacher data sharing model** — When a teacher or tutor is given access to a
   student's session data (J16), the legal basis for sharing that student's data
   with a third party (the tutor, not the parent) must be established. This is a
   compliance question that requires human legal review before the teacher portal
   requirements are developed into a build specification.

---
feature: 002-revizr
document: product-specification
version: 1.0.0
status: draft
phase: 3
authored_by: personas-squad-lead
date: 2026-05-15
prior_gates:
  discovery: proceed
  market-viability: proceed
  requirements-sign-off: passed
human-approval-required: true
human-approval-reason: >
  Child data (C7) and parental consent flows for under-16 accounts are in scope.
  Authentication architecture for paired student–parent accounts involves personal
  data. Both require human approval per constitution §2 before Compliance or Build
  squads proceed.
tech-stack: none — this spec is implementation-free
---

# Revizr — Product Specification

**Feature:** 002-revizr
**Version:** 1.0.0
**Status:** draft
**Squad:** Personas & Requirements
**Date:** 2026-05-15

---

## Problem

UK students preparing for high-stakes examinations — 11+, KS3, GCSE, and A-level —
spend the majority of their revision time on generic content that does not target
their individual weaknesses. The result is wasted hours, persistent blind spots, and
underperformance relative to potential. Families spend an estimated £4–5 billion per
year on private tutors in an attempt to solve this focus problem, but even tutoring
provides limited visibility to parents: revision happens behind closed doors, and
parents have no reliable way to know whether it occurred, whether it was effective,
or whether it targeted the right topics. Students in Northern Ireland and Wales face
an additional problem: most digital revision products are designed exclusively around
English exam boards (AQA, Edexcel, OCR), leaving CCEA and WJEC students with content
that does not match their actual examinations.

---

## Solution

Revizr is a subscription revision platform that maps each student's topic-level
weaknesses — by analysing their school report, teacher notes, or a structured
diagnostic assessment — and then assembles a personalised practice pack drawn
exclusively from authentic past examination papers. Students practise only on real
questions from real past papers, targeted only at the topics where they are genuinely
weak, from whichever UK or Northern Ireland exam board sets their examinations.
Parents receive a real-time dashboard showing session activity, score progression,
and a plain-English summary of whether their child is on track — giving them the
accountability visibility that tutoring has never reliably provided. The product is
accessible to families without the budget for private tutoring and to families who
use tutoring but want to maximise the productivity of the time between sessions.

---

## Personas

Full persona definitions are in `personas-pack/personas.md`. Below is the summary
reference with each persona's primary JTBD.

| Persona | Role | Exam Context | Primary JTBD |
|---|---|---|---|
| **Amara Osei-Mensah** | Student, age 10 | 11+, Birmingham | When I sit down to practise 11+ papers, I want to be shown only the question types I find difficult, so I can improve my weak areas without wasting time on questions I can already do. (J01) |
| **Priya Sharma** | Parent, age 42 | 11+, Leicester | When I am evaluating whether Revizr is worth £20/month, I want to see a personalised diagnosis based on my child's actual school report before I pay, so I can trust that the platform understands my child's situation rather than offering generic content. (J06) |
| **Jack Whitfield** | Student, age 15 | GCSE, Sheffield | When I sit down to revise and do not know where to start, I want to be told exactly which topics to focus on for my specific exam board, so I can start practising immediately without reading through the entire specification. (J07) |
| **Siobhan O'Neill** | Parent, age 38 | GCSE/CCEA, Belfast | When I am looking for GCSE revision support in Northern Ireland, I want to find a platform that genuinely covers CCEA past paper content, so my child practises on questions that match her actual examinations. (J11) |
| **Tariq Hassan** | Student, age 17 | A-level, Manchester | When I start a revision session, I want to see my personalised question pack ready to go without having to search exam board websites for topic-specific past paper questions, so I can begin focused practice immediately. (J14) |
| **Denise Okafor** | Teacher/Tutor, age 34 | GCSE/A-level, London | When I assign between-session revision to a tutoring student, I want to see a report of which authentic past paper questions they attempted and how they performed, so I can begin the next session at the point of actual difficulty. (J16) |

---

## Core Features (Must-Have)

### F1 — Student Account Creation and Paired Parent Account

**Description:**
A user can create a student account with an associated parent account. The student
and parent may share a login credential or have separate credentials, but each has
a distinct view and distinct permissions. When the student is under 16, parental
consent must be recorded before the account becomes active and before any student
data is collected.

**Linked JTBDs:** J04, J05, J06, J10, J12
**Linked requirements:** R-AUTH-1, R-AUTH-2

**Acceptance criteria:**
- A user can create a student profile by providing name, year group, target exam
  level, and exam board(s).
- When the student's year group places them under 16, the account creation flow
  requires a designated parent/guardian to confirm consent before the account is
  active.
- The student view and parent view are distinct and cannot be accessed without
  the appropriate credential or permission.
- A student account can be associated with exactly one parent/guardian account.
  A parent account can be associated with up to five student accounts (sibling
  support).
- Account creation is completable on a mobile screen with no more than four steps
  before the diagnostic entry point is reached.

---

### F2 — School Report and Teacher Notes Upload for Diagnostic

**Description:**
A user can upload a PDF, image, or plain-text school report or teacher notes during
onboarding. The diagnostic engine analyses the uploaded document to identify
topic-level weaknesses per subject and exam board. This upload is available in the
free tier.

**Linked JTBDs:** J04, J06, J07
**Linked requirements:** R-AUTH-4, R-DIAG-1, R-DIAG-2

**Acceptance criteria:**
- The upload accepts PDF, JPEG, PNG, and plain text (minimum); maximum file size
  is stated clearly before upload.
- After upload, the system produces a topic weakness map within a defined maximum
  processing time (see Non-functional requirements: Performance).
- The topic weakness map shows, per subject, which topics are identified as weak,
  with a readable description of each topic.
- If the document cannot be parsed (illegible scan, unrecognised format, insufficient
  content), the user is shown a clear explanation and offered the alternative
  diagnostic test path (F3) rather than a generic error.
- The upload and resulting topic map are accessible to the user in the free tier
  before any payment is required.

---

### F3 — In-Product Diagnostic Assessment

**Description:**
A student can complete a structured multi-subject diagnostic test within the product
as an alternative to document upload. The diagnostic test covers the student's
selected exam level and board, and produces the same topic weakness map output as
the document upload path.

**Linked JTBDs:** J01, J07, J13
**Linked requirements:** R-DIAG-3

**Acceptance criteria:**
- The diagnostic test covers all core subjects at the student's selected exam level
  and board.
- The test adapts in real time: questions in areas where the student is clearly
  strong are reduced and replaced by questions in areas of uncertainty.
- The diagnostic test requires no more than 30 minutes to complete for a single
  exam level.
- On completion, the student and parent are shown the same topic weakness map as
  produced by the document upload path.
- The diagnostic test is available in the free tier.

---

### F4 — Topic Weakness Map (Personalised Diagnosis Output)

**Description:**
The output of the diagnostic engine — the topic weakness map — is a persistent,
structured view of the student's subject-by-subject, topic-by-topic weakness profile.
It is the central navigational object of the product. The map updates after each
practice session.

**Linked JTBDs:** J01, J04, J07, J13
**Linked requirements:** R-DIAG-4, R-DIAG-5

**Acceptance criteria:**
- The topic weakness map displays, for each subject, a list of topics sorted by
  the degree of weakness (most weak first).
- Each topic entry shows the student's estimated strength level and the number of
  authentic past paper questions available for that topic.
- The map is visible to the student and to the paired parent account.
- After each practice session, topics where the student has demonstrated improvement
  are visually updated.
- In the free tier, the topic weakness map is visible but the "begin practice"
  action for each topic is gated behind a subscription prompt.

---

### F5 — Free Tier Diagnostic Preview and Conversion Gate

**Description:**
A non-paying user can complete the full diagnostic flow (upload or assessment),
view the complete topic weakness map, and access three sample questions per
identified weak topic from the authentic past paper database. All further practice
requires a paid subscription. The parent dashboard is shown as a non-live preview.

**Linked JTBDs:** J06, J07
**Linked requirements:** R-AUTH-4, R-DIAG-3, R-BILL-1

**Acceptance criteria:**
- A non-paying account can complete the diagnostic and view the full topic weakness
  map with no time restriction.
- A non-paying account can access exactly three authentic past paper questions per
  identified weak topic, with mark scheme explanations visible.
- After the three sample questions per topic are exhausted, the user is shown a
  subscription prompt with pricing options (monthly and annual).
- The parent dashboard is visible to the parent account in preview mode,
  illustrating what live data will look like once a subscription is active, with a
  clear visual indicator that it is a preview.
- There is no time limit on the free tier — users are not forced to upgrade within
  a trial window.

---

### F6 — Personalised Question Pack Assembly

**Description:**
For a subscribed student, the system assembles a personalised practice pack of
authentic past paper questions targeted at the student's identified weak topics for
their specific exam board(s). The pack is regenerated and extended after each
session as the weakness map is updated.

**Linked JTBDs:** J01, J07, J09, J11, J13, J14
**Linked requirements:** R-PAPER-1, R-PAPER-2, R-PAPER-3, R-PAPER-4

**Acceptance criteria:**
- Every question in the pack is drawn from an authentic past paper from the
  student's selected exam board(s).
- Each question carries metadata: exam board, year, paper reference, question number,
  topic, and mark allocation.
- Questions are sorted by topic relevance to the student's current weakness map,
  most-relevant first.
- Questions the student has already answered are not repeated until the full
  available set for that topic has been exhausted, at which point they may recycle
  with a visible indicator that the question has been seen before.
- The pack contains at least 20 unseen questions for each identified weak topic
  before recycling begins (subject to database availability).
- The system surfaces an alert when available questions for a specific topic are
  near exhaustion.

---

### F7 — Practice Session Flow

**Description:**
A student works through their personalised question pack in a structured session.
Each question is presented individually. The student submits an answer, sees whether
they were correct, and is shown the official mark scheme explanation. Session
progress is tracked and stored.

**Linked JTBDs:** J01, J02, J03, J08, J09, J13, J15
**Linked requirements:** R-SESS-1, R-SESS-2, R-SESS-3, R-SESS-4, R-SESS-5

**Acceptance criteria:**
- Each question is displayed one at a time with the full question text, any diagrams
  or data that appeared in the original paper, and the mark allocation.
- The student can submit an answer (for multiple choice questions, by selection; for
  written questions, by free-text entry) or mark a question as "skipped."
- After submission, the student sees whether their answer was correct (or receives
  a marking guide for written answers), the official mark scheme explanation, and
  which topic the question belongs to.
- The student can flag a question as having an issue (incorrect mark scheme, display
  problem) without interrupting session flow.
- A session can be paused at any point and resumed from the same question.
- The session stores the timestamp, duration, questions attempted, and score on
  completion.

---

### F8 — Mark Scheme Explanations

**Description:**
After each question in a practice session, the student is shown the official mark
scheme answer and, where available, an examiner's commentary on common errors for
that question type. This is the primary mechanism for learning from mistakes.

**Linked JTBDs:** J02, J15
**Linked requirements:** R-SESS-4

**Acceptance criteria:**
- The mark scheme for each question is displayed immediately after the student
  submits their answer.
- The mark scheme display shows the full accepted answer(s), point-by-point, as
  they appear in the official mark scheme.
- Where the database includes examiner commentary or chief examiner reports for a
  question, that commentary is displayed in a collapsible section below the mark
  scheme.
- The mark scheme is available for every question in the practice pack; a question
  without a mark scheme is not served to the student until a mark scheme is
  available.

---

### F9 — Parent Real-Time Session Dashboard

**Description:**
The parent account has a dashboard that shows, for each associated student account:
the most recent session date, duration, questions attempted, score, and topics
covered. The dashboard updates within a defined time after session completion.

**Linked JTBDs:** J04, J05, J10, J12
**Linked requirements:** R-DASH-1, R-DASH-2, R-DASH-3

**Acceptance criteria:**
- The parent dashboard is accessible from any device on which the parent is
  authenticated.
- The dashboard shows, per student: date and time of last session, session duration,
  number of questions attempted, score as a percentage, and the topics covered in
  that session.
- The dashboard shows a session history for the past 90 days with individual session
  entries.
- The parent view does not expose the student's individual question responses or
  answer text — only summary metrics.
- The dashboard shows the current topic weakness map alongside a directional
  indicator (improving / stable / declining) for each topic.

---

### F10 — Plain-English Progress Summary

**Description:**
The parent dashboard includes a dynamically generated plain-English summary of the
student's overall progress and whether they are on track for their target grade.
The summary is written to be interpretable by a parent with no subject-matter
expertise.

**Linked JTBDs:** J05, J12
**Linked requirements:** R-DASH-4

**Acceptance criteria:**
- The progress summary is generated and displayed on the parent dashboard after
  the student has completed at least two sessions.
- The summary describes, in plain English: which subjects are being practised most
  actively, which topics have shown the most improvement, which topics remain the
  weakest, and whether the overall trajectory is consistent with the student's
  target grade.
- The summary is updated after each session.
- The summary uses no jargon from the exam board specification language that a
  non-specialist parent would not understand.
- The summary does not make specific grade predictions — it uses directional
  language ("on track," "needs attention," "significant improvement needed").

---

### F11 — Score Progression Tracking

**Description:**
Students and parents can view the student's score progression over time, broken
down by subject and topic. The progression view makes improvement visible and
tangible.

**Linked JTBDs:** J03, J08
**Linked requirements:** R-PROG-1, R-PROG-2

**Acceptance criteria:**
- A score progression chart is available in both the student view and the parent
  dashboard view.
- The chart shows score percentage per session over time for each subject.
- A separate breakdown shows score by topic within each subject.
- The chart is readable on a mobile screen at standard viewing distance.
- Progress data is retained for the lifetime of the subscription.

---

### F12 — Multi-Exam-Board Support (AQA, Edexcel, OCR, CCEA, WJEC, Cambridge)

**Description:**
The paper database and question assembly system fully supports questions from all
major UK and Northern Ireland exam boards: AQA, Edexcel, OCR, CCEA, WJEC, and
Cambridge Assessment. A student can select one or more exam boards relevant to
their examinations, and only questions from those boards are served to them.

**Linked JTBDs:** J09, J11, J17
**Linked requirements:** R-PAPER-1, R-PAPER-2

**Acceptance criteria:**
- A student can select their exam board(s) at account creation and update the
  selection at any time.
- Questions served to the student are exclusively from the selected exam board(s).
- CCEA and WJEC coverage is confirmed to contain past paper questions for the
  full range of subjects available in the database before launch — not a subset
  or placeholder.
- The exam board for each question is displayed in the question metadata shown
  to the student.
- No question from a non-selected exam board is served to a student.

---

### F13 — Subscription Management (Monthly and Annual Plans)

**Description:**
A paying user can subscribe on a monthly (£19.99/month) or annual (£179/year) plan
per student. Payment is processed through an integrated billing service. The user
can view, upgrade, downgrade, pause, or cancel their subscription. Family plan
pricing (multiple student accounts under one payment) is supported.

**Linked JTBDs:** J06
**Linked requirements:** R-BILL-1, R-BILL-2, R-BILL-3

**Acceptance criteria:**
- At the point of conversion from free to paid, the user is presented with both
  monthly and annual plan options with pricing clearly stated.
- Payment is processed without storing card data in the product's own database.
- After successful payment, the account is immediately upgraded to full access.
- The subscriber can view their next billing date, amount, and plan type in their
  account settings.
- The subscriber can cancel at any time; cancellation takes effect at the end of
  the current billing period and does not delete account or progress data.
- A family plan option supports up to five student accounts at a stated discounted
  total price.

---

### F14 — Exam Level Coverage (11+, KS3, GCSE, A-level)

**Description:**
The product covers all four target exam levels. A student account is associated with
one primary exam level; a parent account can have student accounts at different
levels. The topic weakness map, question packs, and mark schemes are appropriate
for the student's specific exam level.

**Linked JTBDs:** J01, J07, J09, J11, J13
**Linked requirements:** R-PAPER-1, R-PAPER-5

**Acceptance criteria:**
- At account creation, the student selects their current year group and target exam
  level (11+, KS3, GCSE, or A-level).
- All questions served are appropriate for the selected exam level.
- The diagnostic assessment and weakness map are calibrated to the specification
  and mark scheme standards of the selected exam level.
- A student can update their exam level (for example, when moving from GCSE to
  A-level) without losing historical progress data.

---

## Should-Have Features

### F15 — Diagnostic Confidence Score (Internal Tracking)

**Description:**
The diagnostic engine records an internal confidence score for each weakness
identification — indicating how reliably the AI mapped the uploaded document to
specific topics. This score is used for product monitoring and quality improvement,
and displayed to users in an appropriate form when the score is low.

**Linked JTBDs:** J04, J06
**Linked requirements:** R-DIAG-6

**Acceptance criteria:**
- The system computes and stores a confidence score for each topic weakness entry
  generated from an uploaded document.
- When a topic's confidence score falls below a defined threshold, the student
  and parent are informed that the diagnosis for that topic is tentative and
  encouraged to complete the in-product diagnostic test to supplement it.
- Confidence scores are never surfaced in raw numeric form to users — only as
  a plain-language qualifier.

---

### F16 — Session Streak and Habit Mechanic

**Description:**
Students are shown a visual streak indicator for consecutive days of practice.
The streak mechanic is designed to encourage daily revision habit, subject to
Age-Appropriate Design Code compliance constraints on compulsive design patterns.

**Linked JTBDs:** J03, J08
**Linked requirements:** R-SESS-6

**Acceptance criteria:**
- A visible streak counter increments for each day a student completes at least
  one question.
- The streak resets if no questions are answered in a calendar day.
- The streak mechanic does not generate push notifications or alerts for under-16
  users without explicit parental consent.
- The design of the streak mechanic is reviewed for compliance with the UK
  Age-Appropriate Design Code before implementation.

---

### F17 — Parent Email Digest

**Description:**
The parent account receives a weekly email digest summarising the student's
revision activity for the past seven days: sessions completed, time spent,
topics covered, and the current plain-English progress summary.

**Linked JTBDs:** J05, J12
**Linked requirements:** R-NOTIF-1, R-NOTIF-2

**Acceptance criteria:**
- The weekly digest is sent to the parent's registered email address every seven
  days, on a day and time the parent can configure.
- The digest contains: number of sessions completed that week, total time spent,
  subjects and topics revised, and the current progress summary.
- The digest can be disabled by the parent in account settings.
- The digest email contains a direct link to the full parent dashboard.

---

### F18 — Teacher/Tutor Read-Only Portal

**Description:**
A teacher or tutor can be granted read-only access to a student's session reports
and progress data by the parent account. The teacher portal shows session history
and the current topic weakness map but does not allow the teacher to modify the
student's account or question pack.

**Linked JTBDs:** J16, J17
**Linked requirements:** R-AUTH-5, R-AUTH-6

**Acceptance criteria:**
- A parent can generate a share link or access code that grants a named teacher
  read-only access to a specific student's data.
- The teacher sees the student's session history (dates, durations, topics, scores)
  and the current topic weakness map.
- The teacher cannot access the student's individual question responses or answer
  text.
- The share link has an expiry date (maximum 12 months, configurable by the parent).
- The parent can revoke teacher access at any time from account settings.

---

### F19 — Question Flag and Content Issue Reporting

**Description:**
A student can flag a question as having a potential issue (incorrect mark scheme,
display problem, possible wrong exam board attribution) during a practice session.
Flagged questions are queued for manual review by content moderators.

**Linked JTBDs:** J09, J17
**Linked requirements:** R-ADMIN-3

**Acceptance criteria:**
- Every question display includes a "flag this question" action that is accessible
  without interrupting the session.
- The flag action allows the user to select a reason from a short list and add an
  optional free-text comment.
- Flagged questions are visible in the admin content management interface.
- A question that has been flagged a defined number of times is automatically
  removed from active question packs pending review.

---

### F20 — Multi-Subject Account Configuration

**Description:**
A student can revise across multiple subjects in the same account, with separate
topic weakness maps and question packs per subject. The diagnostic engine produces
a weakness map for each subject included in the student's examination set.

**Linked JTBDs:** J07, J13, J14
**Linked requirements:** R-DIAG-5, R-PAPER-3

**Acceptance criteria:**
- At account setup or in account settings, the student can add or remove subjects
  from their active revision set.
- The topic weakness map shows all active subjects side by side.
- The student can start a session in a specific subject or set the system to
  automatically select the highest-priority weak topic across all subjects.
- Subject additions do not require re-completing the full diagnostic — only the
  diagnostic relevant to the newly added subject.

---

### F21 — Target Grade Setting

**Description:**
A student can set a target grade for each subject. The progress summary and topic
weakness map interpret the student's current trajectory relative to their target
grade, not a generic population average.

**Linked JTBDs:** J03, J08, J12
**Linked requirements:** R-PROG-3

**Acceptance criteria:**
- The student can set a target grade for each active subject from within their
  topic weakness map or account settings.
- The progress summary explicitly references the target grade when assessing
  trajectory.
- The target grade setting does not change the questions served — it only changes
  the language and context of progress communication.

---

### F22 — Session History for Students

**Description:**
The student can view their own session history — past sessions, topics covered,
scores, and time spent — from within their account, providing the same visibility
the parent dashboard offers but from the student's perspective.

**Linked JTBDs:** J03, J08
**Linked requirements:** R-PROG-4

**Acceptance criteria:**
- The student's own account includes a session history view listing all past
  sessions with date, subject(s), topics, duration, and score.
- The session history is visually distinct from the parent dashboard and styled
  to be appropriate for the student's age group.
- The student can see their score progression chart from within their own account.

---

### F23 — Admin Content Management Interface

**Description:**
An internal admin interface allows authorised Revizr staff to upload, tag,
validate, and retire questions from the paper database. Content moderators can
review flagged questions and update metadata.

**Linked JTBDs:** (Internal — supports all student-facing JTBDs indirectly)
**Linked requirements:** R-ADMIN-1, R-ADMIN-2, R-ADMIN-3, R-ADMIN-4

**Acceptance criteria:**
- Authorised admin users can add questions to the database individually or in
  batch, with required metadata fields enforced at input.
- Admin users can search the database by exam board, level, subject, topic, year,
  and paper reference.
- Admin users can review and resolve flagged questions, either correcting metadata
  or removing the question from active packs.
- Admin user access is role-based; content moderators cannot access billing or
  user account data.
- All admin actions on the content database are logged with the acting user
  identity and timestamp.

---

~~### F24 — B2B School Licence Accounts~~

**Removed from v1 and v1 Should-Have by founder decision (spec sign-off 2026-05-15).**
D2C consumer product only for v1. B2B school licences deferred to v2. Reason: no
teacher-facing features exist in v1 (per Q4 answer), making a school-facing product
premature. See Won't-Have section.

---

### F25 — Cross-Device Session Continuity

**Description:**
A student can begin a practice session on one device and continue it on another
without losing progress or having to restart the session.

**Linked JTBDs:** J14
**Linked requirements:** R-SESS-5

**Acceptance criteria:**
- Session state (current question position, answers already given, time elapsed)
  is preserved server-side and restored when the student resumes on a different
  device.
- A student resuming a session on a different device is shown the question they
  were on when they paused, with prior answers in the session preserved.

---

## Could-Have Features

### F26 — Push Notifications for Parent Inactivity Alerts

**Description:**
The parent account can opt in to receive a push notification if a student has not
completed any revision for a configurable number of consecutive days (e.g., three
or five days). Notifications for under-16 students require parental consent under
the Age-Appropriate Design Code.

**Linked JTBDs:** J10
**Linked requirements:** R-NOTIF-3, R-NOTIF-4

**Acceptance criteria:**
- Inactivity notifications are opt-in only; they are off by default.
- The parent configures the inactivity threshold (minimum 1 day, maximum 14 days).
- Notifications are sent to the parent, not the student, for under-16 accounts.
- The notification links directly to the parent dashboard.

---

### F27 — Subject-Specific Revision Timetable Generator

**Description:**
Based on the student's upcoming examination dates and the current topic weakness
map, the system generates a suggested day-by-day revision timetable for the weeks
preceding the exam. The timetable allocates time proportionally to topic weakness
severity.

**Linked JTBDs:** J13, J14
**Linked requirements:** (To be defined in v2 requirements phase)

**Acceptance criteria:**
- The student can enter their exam date(s) in account settings.
- The system generates a suggested timetable showing which topics to revise on
  which days, with estimated session lengths.
- The timetable is editable by the student.
- Completing a session updates the timetable to reflect progress.

---

### F28 — Sibling Account Family Plan

**Description:**
A parent account can manage multiple student accounts (siblings) under a single
subscription. Family plan pricing (£299/year for up to two students) is offered at
checkout as an alternative to individual student plans.

**Linked JTBDs:** J04, J05
**Linked requirements:** R-AUTH-3, R-BILL-3

**Acceptance criteria:**
- At checkout, the parent is offered a family plan option if two or more student
  accounts are configured.
- The family plan applies a defined discount compared to two individual annual
  plans.
- Each student under the family plan maintains a separate topic weakness map,
  session history, and question pack.
- The parent dashboard shows a student-switcher control to toggle between children's
  data.

---

### F29 — Offline Mode for Practice Sessions

**Description:**
A student can download a question pack for offline practice. Completed sessions
in offline mode are synchronised to the account when the device reconnects.

**Linked JTBDs:** J14
**Linked requirements:** (To be defined in v2 requirements phase)

**Acceptance criteria:**
- A student can download up to 50 questions for offline access in a single pack.
- Questions downloaded for offline use are from the student's current personalised
  pack.
- Completed offline sessions sync automatically when connectivity is restored.
- Downloaded packs expire after 30 days to ensure content freshness.

---

### F30 — Referral Programme

**Description:**
A subscribed user can generate a referral link. When a new subscriber signs up via
the referral link, both the referring user and the new subscriber receive one month
of free subscription credit.

**Linked JTBDs:** (Commercial — supports all user JTBDs by expanding access)
**Linked requirements:** R-BILL-2

**Acceptance criteria:**
- Every subscribed account has access to a unique referral link in account settings.
- When a new subscriber uses the referral link and completes payment, both accounts
  receive one month of credit applied to the next billing cycle.
- The referral programme has a maximum credit cap (no more than six months'
  credit earned per referring account in any 12-month period).

---

### F31 — Written Answer Marking Assistance

**Description:**
For extended-response questions (GCSE and A-level essay-style questions), the
system provides an AI-assisted marking guide that scores the student's written
response against the mark scheme criteria and highlights which assessment objectives
were met and which were missed.

**Linked JTBDs:** J02, J15
**Linked requirements:** R-SESS-3

**Acceptance criteria:**
- Extended-response questions are identified in the question metadata.
- The student submits a free-text answer for extended-response questions.
- The system returns an AI-generated score and commentary against each mark scheme
  criterion, clearly labelled as AI-assisted marking and not equivalent to examiner
  marking.
- The student can request a human moderator review (if and when a moderation
  service is available) for an additional fee.

---

### F32 — Curriculum Coverage Report

**Description:**
A parent or student can view a curriculum coverage report showing which topics in
the full exam specification have been practised and which remain untouched. This
gives a comprehensive view of revision breadth, supplementing the weakness-depth
view of the topic weakness map.

**Linked JTBDs:** J04, J13
**Linked requirements:** R-PROG-5

**Acceptance criteria:**
- The curriculum coverage report is accessible from the topic weakness map view.
- The report shows the full list of specification topics for the student's exam
  board and level, with a coverage indicator for each (not started / in progress /
  confident).
- The report is printable or exportable as a PDF.

---

### F33 — Exam Board Specification Change Alerts

**Description:**
When an exam board updates its subject specification (which occurs on a defined
cycle), the system notifies affected student accounts and updates the topic weakness
map to reflect the current specification.

**Linked JTBDs:** J09, J11
**Linked requirements:** R-ADMIN-4

**Acceptance criteria:**
- Admin users can flag a specification change for a given exam board, level, and
  subject.
- When a specification change is flagged, students in the affected cohort receive
  an in-product notification.
- The topic weakness map is updated to reflect any topics added, removed, or
  restructured by the specification change.

---

## Won't-Have in v1

The following items are explicitly out of scope for v1. Each exclusion carries a
reason. These are not permanent rejections — they are v1 scope boundaries.

| Item | Reason for exclusion |
|---|---|
| Live tutoring / video sessions | Outside the product's core mission; high operational complexity; covered by existing market incumbents. Revizr is a practice-and-accountability platform, not a tutoring marketplace. |
| Scotland (SQA) exam board coverage | The SQA specification and question format differ significantly from the English and Northern Irish boards. Including SQA in v1 would require a separate diagnostic model. Explicitly scoped for v2. |
| International exam boards (IB, IGCSE international) | Outside the confirmed geographic and board scope. Cambridge Assessment International Edition is in scope for its UK GCSE/A-level papers, but IB is a distinct qualification system requiring a separate product treatment. |
| School management information system (MIS) integration | Integrating with SIMS, Arbor, or other UK school MIS platforms is a B2B Year 2 item. |
| B2B school licence accounts (F24) | Removed from v1 by founder decision at spec sign-off (2026-05-15). D2C consumer only for v1. B2B deferred to v2 when teacher-facing product is scoped. |
| In-product messaging between student and teacher | A messaging feature creates content moderation obligations, safeguarding responsibilities, and regulatory complexity for a platform involving minors. Not in scope for v1. |
| Native iOS and Android applications | v1 is delivered as a responsive web application. Native applications are a v2 item, prioritised based on mobile usage data from the v1 launch. The v1 product must be fully functional on mobile web. |

---

## Non-Functional Requirements

### Performance

- **Diagnostic processing time:** The topic weakness map must be generated within
  90 seconds of a school report upload or diagnostic test completion, measured from
  the point of submission under standard load conditions. A processing status
  indicator must be displayed during this period.
- **Question pack load time:** The practice session view and first question must
  be visible to the user within 3 seconds of session initiation on a standard mobile
  4G connection.
- **Parent dashboard refresh:** Session data must be visible in the parent dashboard
  within 5 minutes of session completion.
- **Concurrent users:** The product must sustain expected peak load (modelled on
  UK academic calendar: Sunday evenings and the weeks preceding May/June exam
  season) without degradation in the above response times.

### Accessibility

- The product must meet WCAG 2.2 Level AA for all student-facing and parent-facing
  surfaces.
- The student interface for the 11+ cohort (age 9–11) must be designed for users
  who may have limited reading fluency; instructions must be written in plain
  English at age-appropriate reading level.
- All interactive elements must be keyboard-navigable.
- Colour is never the sole means of conveying information (topic weakness severity,
  correct/incorrect question outcomes).

### Security and Data Classification

- All student data for under-16 users is classified **C7 (Children's Data)** under
  the constitution's data taxonomy and must receive the strictest storage, encryption,
  and access controls.
- Student personal data (name, year group, school, session history, answer history)
  is classified **C3 (Customer PII)** at minimum; for under-16 users, C7 controls
  apply.
- Authentication secrets (passwords, session tokens) are classified **C6** and must
  never be logged or stored in plain text.
- Billing and payment card data is classified **C4** and must be handled exclusively
  through a compliant payment processing service; card data must not enter Revizr's
  own systems.
- All data is stored within the UK or a jurisdiction with an adequacy decision
  under UK GDPR; no student data is transferred to a non-adequate jurisdiction
  without appropriate safeguards.

### Compliance

- The product must comply with the UK Children's Code (Age-Appropriate Design Code,
  2021) for all features accessible to users under 18. Specific obligations include:
  privacy by default, no profiling for commercial purposes, and no design patterns
  that exploit behavioural tendencies in ways that are detrimental to child wellbeing.
- Parental consent must be obtained and recorded before any personal data from a
  child under the UK GDPR Article 8 age threshold is processed. The consent
  mechanism must meet the ICO's guidance for verifiable parental consent.
- Copyright and licensing for all authentic past paper content must be confirmed as
  cleared before any content is served to users. This is a blocking prerequisite
  and is delegated to the Compliance squad.
- The product must have a privacy policy and terms of service appropriate for a
  service accessed by minors, reviewed by a UK-qualified legal practitioner before
  launch.

### Reliability

- The core practice session flow (F7) must have a target availability of 99.5%
  measured monthly, excluding planned maintenance windows communicated at least 24
  hours in advance.
- Planned maintenance windows must not fall during known peak usage periods (Sunday
  evenings, exam-season weeknights in May–June).

---

## Open Questions — RESOLVED (Spec Sign-Off 2026-05-15)

All 7 open questions have been answered by the founder (stu-fosks) and are recorded
below verbatim with their impact on downstream phases.

---

### Q1 — Parental consent mechanism
**Answer (verbatim):** "Parents has to set the account up for everyone, No child
unless over 17 can open their own account."

**Resolution:** The product's account creation model is parent-initiated for all
users under 17. No child can self-register. This is a stronger protection than the
GDPR Article 8 minimum (age 13). The parental consent mechanism is structural — the
parent IS the account creator and primary account holder. Under-17s are dependent
users on a parent-created account. Architecture impact: ADR-0005 (auth) must be
updated to reflect the under-17 restriction. The email-to-parent verification debate
is moot — the parent always creates the account. DPO sign-off still required to
confirm this mechanism satisfies C7 obligations under the ICO Age-Appropriate Design
Code, but the mechanism itself is now defined.

**Status:** RESOLVED — architectural decision confirmed. DPO review still required
before go-live (compliance condition C-001 remains open).

---

### Q2 — Mark scheme availability
**Answer (verbatim):** "Yes — mark schemes are included for all (or almost all) papers."

**Resolution:** F9 (mark scheme display) is confirmed as Must-Have and can proceed
to Build immediately. The "almost all" caveat means the data layer must handle the
edge case of questions without mark schemes — such questions must not be served to
students until a mark scheme is available (this acceptance criterion was already in
the spec and is confirmed).

**Status:** RESOLVED — F9 unblocked for Build.

---

### Q3 — CCEA and WJEC paper completeness
**Answer (verbatim):** "Full coverage — both CCEA and WJEC are comprehensive across
subjects."

**Resolution:** No coverage disclosure screen needed. NI and Wales personas can be
served at launch. CCEA and WJEC are confirmed as fully-covered in the database.
Market-pack NI/Wales TAM is valid.

**Status:** RESOLVED — full coverage confirmed.

---

### Q4 — Teacher/tutor data sharing
**Answer (verbatim):** "No teachers or tutors at all."

**Resolution:** F18 (teacher/tutor read-only portal) is REMOVED from the product
entirely — not deferred to v2, removed. No teacher or tutor access to any student
data in any version. F21 (school B2B) is similarly removed. The B2B channel
identified in market research as a Year 2 opportunity is not pursued. Update spec
Won't-Have section accordingly.

**Status:** RESOLVED — F18 and F21 removed from spec.

---

### Q5 — AI-assisted marking of extended answers (F31)
**Answer (verbatim):** "v1 for all question types including extended answers."

**Resolution:** F31 (AI-assisted marking of extended-response questions) is
confirmed as in scope for v1 for ALL question types. This is a high-risk technical
decision. Build squad must create a technical spike (Architecture spike ADR required)
before Sprint 3 to validate accuracy of AI mark scheme alignment for GCSE/A-level
extended prose. The spike outcome determines whether the feature launches in v1 or
is descoped. Build proceeds on assumption of feasibility; spike acts as a gate.

**Status:** RESOLVED — in v1 scope, technical spike required as gate before Sprint 3.

---

### Q6 — Age-Appropriate Design Code review of streak mechanic (F16)
**Answer (verbatim):** "Not yet — flag as pre-launch compliance task."

**Resolution:** F16 (streak mechanic) is built but held behind an AADC Standard 6
(detrimental use) review gate before it is enabled for under-18 users. The Build
squad implements F16 with a feature flag. The flag defaults to OFF for all under-18
accounts until the Compliance squad completes the AADC Standard 6 review and
records sign-off. This is a pre-launch blocker — the feature must not be switched on
without that sign-off.

**Status:** RESOLVED — F16 built behind feature flag, AADC review is pre-launch gate.

---

### Q7 — Copyright and licensing clearance
**Answer (verbatim):** "In progress — conversations started with some boards."

**Resolution:** Copyright clearance is in progress. Specific boards engaged were
not confirmed in this sign-off session. Build can proceed on all features EXCEPT
serving actual past paper content to users. Content serving (F4, F9) is gated
per-board: questions from board X can only be served to users once licence clearance
for board X is confirmed in writing and recorded in the compliance pack. The Build
squad must implement a per-board content-availability gate in the question database
(a `board_licence_cleared: boolean` field on the exam board configuration). At
launch, only cleared boards' content is served; the app handles the "no content
available for this board yet" state gracefully.

**Status:** PARTIALLY RESOLVED — build proceeds with content-serving gate.
Remaining action: founder to confirm which boards have active conversations and
record board names in compliance-pack/copyright-analysis.md.

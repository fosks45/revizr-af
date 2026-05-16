---
phase: 6
gate: design-sign-off
feature: 002-revizr
document: user-flows
worker: user-flow-architect
status: complete
date: 2026-05-15
features-covered: F1–F14
---

# Revizr — User Flows

## Reading This Document

Each row represents one Must-Have feature (F1–F14).

- **Trigger** — what initiates the flow
- **Step Sequence (Happy Path)** — screens in order, screen IDs from IA
- **Happy Exit** — successful completion condition
- **Primary Error Path** — most likely failure and its recovery screen
- **Error Exit** — where the error path terminates or recovers

Screen IDs reference `information-architecture.md`. All flows are traversable —
every step is a named screen, not a description of intent.

---

## Flow Table

| # | Feature | Trigger | Step Sequence (Happy Path) | Happy Exit | Primary Error Path | Error Exit |
|---|---------|---------|---------------------------|------------|--------------------|------------|
| F1-A | Student + parent account creation (student ≥13 or parent-initiated for any age) | New user taps "Get Started" on OB-01 | OB-01 → OB-02 (select Student) → OB-03 (name, year group, exam level) → OB-04 (exam boards, subjects) → OB-05 (diagnostic choice) → [F2 or F3 flow] → OB-10 (account ready) | Student account active; student directed to ST-01 | Email already registered → OB-03 shows inline error "An account with this email already exists. Sign in instead?" with link to GL-01 | OB-03 (error state) |
| F1-B | Parental consent for under-13 student | During F1-A, system detects year group = Year 5 or below (age <13) | OB-03 → OB-04 → OB-05 → [F2 or F3] → OB-09 (consent pending — "We've sent an email to your parent or guardian. Your account will be ready once they confirm.") | Child account created in pending state; parent receives consent email | Parent consent email not received → OB-09 shows "Resend email" action (rate-limited: 3 resends); if still not received, support link shown | OB-09 (resend state) |
| F1-C | Parent completes consent via email link | Parent receives consent email, taps link | PO-01 (parent welcome) → PO-02 (parent registration — name, email, password) → PO-03 (consent review — child's name, year group, what data will be collected) → PO-04 (explicit consent checkbox + submit) → PO-05 (done — "Your child's account is now active") | Child account activated; parent account created and linked; parent directed to PD-01 | Parent email link expired (24-hour TTL) → Expired link screen with "Return to sign-in and request a new link" action | GL-01 with instruction copy |
| F2-A | Report upload diagnostic | Student selects "Upload my school report" on OB-05 | OB-05 → OB-06 (upload screen — drag/drop or browse; accepted formats and max size stated; privacy notice for C7 data) → OB-08 (processing — spinner, "We're reading your report. This takes up to 90 seconds.") → ST-02 (weakness map) | Weakness map generated; student sees subject/topic breakdown | File unreadable or unsupported format → OB-06 error state: "We couldn't read this file. Try a clearer scan, or choose a different format. Or, take our free quiz instead." with action to OB-05 | OB-06 (error state) with path back to OB-05 |
| F2-B | Report upload — insufficient content | Upload accepted but diagnostic engine cannot extract enough topic data | OB-06 → OB-08 → Diagnostic insufficient screen (inline state on OB-08): "Your report didn't give us enough detail to map your topics. You can still take our quick quiz instead." | Student offered alternative path to OB-07 | None (this IS the error path) | OB-07 (in-app diagnostic) |
| F3 | In-app diagnostic assessment | Student selects "Take the quiz" on OB-05 or is redirected from F2-B | OB-05 → OB-07 (diagnostic questions, one at a time, 5-option format for 11+; adaptive; progress indicator "Question X of approx. Y") → OB-08 (processing — "Analysing your answers…") → ST-02 (weakness map) | Weakness map generated from diagnostic results | Student abandons mid-diagnostic (closes tab / navigates away) → On return, OB-07 resumes at last completed question with "Resume your quiz" prompt | OB-07 (resume state) |
| F4-A | View weakness map | Authenticated student taps "My Topics" nav tab | ST-01 → ST-02 | Student sees all subjects with topic strength ratings; most-weak topics first | No diagnostic completed yet → ST-02 empty state: "Your topic map isn't ready yet. Complete the quick quiz to see your weak spots." with action to OB-07 | OB-07 |
| F4-B | Drill into subject topic list | Student taps a subject card on ST-02 | ST-02 → ST-03 (subject topic list, sorted weak-first, each topic shows strength level and available questions count) → ST-04 (topic detail — stats, "Start session on this topic") | Student can see per-topic detail and initiate topic-specific session | No questions available for topic (near-exhaustion) → ST-04 shows "You've practised all available questions on this topic. More questions are being added." with link to ST-02 | ST-02 |
| F5 | Practice session (complete flow) | Student taps "Start Revision" on ST-01 or "Start session" on ST-04 | ST-01/ST-04 → ST-05 (question view — question text, mark allocation, exam board/year metadata, flag button) → ST-06 (answer submission — text entry or option selection, "Submit" button, "Skip" secondary) → ST-07 (mark scheme — correct/incorrect status, full mark scheme, examiner notes collapsible, "Next question" primary) → repeat ST-05–ST-07 for each question → ST-08 (session complete — questions attempted, score, topics covered, "Back to home" primary) | Session saved; weakness map updated; student on ST-08 | Connection lost mid-session → ST-05/ST-06 shows "You're offline. Your progress is saved. Reconnect to continue." banner; session paused automatically | ST-05 (offline/paused state) |
| F5-B | Session pause and resume | Student taps nav tab during active session | ST-05 → Session Pause Modal (overlay): "Pause and go? Your session is saved." with "Continue session" and "Save and leave" actions | If "Save and leave": session paused, student on destination screen; ST-01 shows "Resume your session" banner | None — pause is always successful | ST-01 (with resume banner) |
| F6 | Parent dashboard — view child progress | Parent authenticates and reaches PD-01 or taps child name in nav | PD-01 (all linked children; each shows last session date, score, "Needs attention" or "On track" label) → PD-02 (Student Overview — plain-English summary, latest session stats, weakness map summary) | Parent can see at-a-glance status for each child with ≤2 taps to full detail | No sessions yet (new student account) → PD-02 preview state: "Lena hasn't had a session yet. Once she starts, you'll see her progress here." with "Show her how to start" guide link | PD-02 (preview state) |
| F7 | Free-to-paid subscription upgrade | Student hits locked content (topic with >3 questions used) or taps "Upgrade" in Account / Home banner | UP-01 (upgrade entry — "Unlock your full personalised pack. You've seen what Revizr can do." — benefit summary, no countdown timer, no urgency language) → UP-02 (plan selection — Monthly £19.99/month, Annual £179/year with saving shown, Family plan option) → UP-03 (checkout — billing service handles; CCR pre-contractual info shown: price, renewal date, cancellation policy; digital rights waiver checkbox) → UP-04 (upgrade confirmation — "You're all set. Your full question pack is ready.") | Account upgraded; student directed to ST-02 (full weakness map) or ST-05 (session start) | Payment declined → UP-03 error state: "Your payment didn't go through. Check your card details and try again." with retry and "Use a different card" options | UP-03 (error state) |
| F7-B | Subscription cancellation | Authenticated user taps "Cancel subscription" in ST-17 or PD-10 | ST-17 → Cancellation screen (inline modal, not a separate page): "Are you sure? Your access continues until [date]. Your progress and topics are saved — you can pick up where you left off if you come back." → Two actions: "Keep my subscription" (primary) and "Cancel at end of period" (secondary, clearly labelled) | Subscription cancelled at period end; data retained; downgrade to free tier at expiry | None — cancellation is always honoured; this IS the happy path | ST-17 (cancelled state showing "Access until [date]") |
| F8 | Subject and exam board selection | Student creates account (OB-04) or edits subjects in ST-14 | OB-04 or ST-14 → Exam level confirmed → Exam board selection (AQA / Edexcel / OCR / CCEA / WJEC / Cambridge — only boards with content for selected level shown) → Subject selection (subjects for chosen board; multiple allowed) → Confirm | Exam boards and subjects saved; weakness map filtered to selection | Student selects exam board with no available content yet (e.g., CCEA at A-level before content launch) → OB-04 shows "We're still adding [board] at [level]. Sign up and we'll let you know when it's ready." with continue-anyway option | OB-04 (partial coverage state) |
| F9 | Mark scheme display | Student submits answer in ST-06 | ST-06 → ST-07 (mark scheme) — immediate reveal; "Did you get it right?" self-mark (for written questions); full mark scheme point-by-point; examiner notes collapsible section below | Student sees mark scheme and moves to next question or ends session | Mark scheme unavailable for this question (DB gap) → This question is never served (spec F8 acceptance criterion): unreachable in normal flow. If detected at runtime: question is silently replaced, no error shown to student | N/A — handled before question is served |
| F10 | Session history | Student taps History tab or parent views PD-04 | ST-09 (session list — most recent first; each entry: date, subject, score, duration) → ST-10 (session detail — topics covered, questions count, score, time) | Student or parent sees complete session history | No sessions yet → ST-09 empty state: "No sessions yet. Start your first session to see your history here." with "Start revision" action | ST-09 (empty state) |
| F11 | Notification preferences | Student or parent navigates to notification settings | ST-15 or PD-09 → Notification preferences screen (each notification type listed with toggle: on/off; weekly digest preference for parents: day of week and time; push notifications: off by default for under-16, toggle enabled only after parent consent) | Preferences saved; confirmation toast | System fails to save preferences (connectivity) → Inline error: "Your settings couldn't be saved. Please try again." with retry | ST-15 / PD-09 (error state) |
| F12 | Account settings and GDPR rights | Authenticated user taps Account nav → Data rights section | ST-13 / PD-07 → ST-18 / PD-11 (data rights screen: "Your data rights" — Download my data, Delete my account; plain-English explanations of each right; 30-day fulfilment notice) → Request submitted confirmation | Data rights request submitted; confirmation email sent to registered address | User requests deletion while subscription is active → Confirmation modal: "Deleting your account will cancel your subscription at the end of the current billing period and permanently remove your data. This cannot be undone." with "Confirm deletion" and "Keep my account" | ST-18 (active subscription deletion state) |
| F13 | Welsh language toggle | User navigates to language setting and switches to Welsh | ST-16 → Toggle selection → Immediate full-page re-render in Welsh (cy locale) | UI chrome rendered in Welsh; question content language unchanged | Welsh strings missing for a UI element (locale gap) → Element falls back to English with no visible error (silent fallback, logged for content team) | Same screen (Welsh) |
| F14 | Parental controls | Parent navigates to Controls for a linked student | PD-01 → PD-06 (parental controls: content restriction settings, session time limits note, notification consent for under-16 push, teacher portal management — generate/revoke share link) | Controls saved; changes take effect on student's next session load | None for save actions — standard error recovery applies | PD-06 (error state) |

---

## Flow Dependency Map

The following flows have blocking dependencies on each other and must be traversed
in order for a new user:

```
F1-A (or F1-B+F1-C for under-13)
   └── F2-A or F3 (diagnostic — required to reach main app)
          └── F4-A (weakness map — the product core)
                 ├── F5 (practice session — requires weakness map)
                 └── F7 (upgrade — can be triggered from F4-A for free-tier users)
```

The following flows are independent and can be reached from any authenticated state:

```
F6  (parent — parallel context, requires F1-C)
F8  (exam board selection — accessible from Account at any time post-onboarding)
F9  (mark scheme — inline in F5, not a separate navigation entry)
F10 (session history — navigation tab, any time post first session)
F11 (notification preferences — Account settings, any time)
F12 (GDPR data rights — Account settings, any time)
F13 (Welsh toggle — Account settings, any time)
F14 (parental controls — parent Account, any time post F1-C)
```

---

## Inline Modals vs. Full Screen Flows

The following interactions use inline modals (not full-screen navigation) to
minimise friction and avoid breaking context:

- Session pause (F5-B)
- Subscription cancellation confirmation (F7-B)
- Account deletion confirmation (F12)
- "Flag this question" during a session (F5 — non-blocking, dismissible)
- Mark scheme examiner notes (F9 — collapsible inline, not a modal)
- Session resume prompt (F5 — persistent banner on ST-01)

Everything else is a full-screen navigation event with a back affordance.

---
phase: 6
gate: design-sign-off
feature: 002-revizr
document: information-architecture
worker: information-architect
status: complete
date: 2026-05-15
features-covered: F1–F14
---

# Revizr — Information Architecture

## 1. IA Principles

1. **Two distinct apps, one codebase.** The student app and the parent dashboard
   are separate navigation contexts. A user authenticated as a parent always lands
   in the parent context. A user authenticated as a student always lands in the
   student context. The two cannot be confused.

2. **Highest-frequency jobs reachable in ≤3 taps.** Primary JTBDs: start a practice
   session (Jack, Amara, Tariq) and check a child's progress (Priya, Siobhan). Both
   must be reachable in 3 taps from the home screen. The architecture is validated
   against this constraint in §5 below.

3. **The weakness map is the central object.** Every flow in the student app
   resolves either toward the weakness map or outward from it. It is not a settings
   screen or a dashboard — it is the persistent product core.

4. **Flat over deep.** Maximum navigation depth from any landing screen: 4 levels.
   No orphan screens — every screen has a back path that resolves to a named parent.

5. **Age-appropriate surface area.** The 11+ student view presents a reduced
   surface area (no explicit analytics, no history deep-dives). The GCSE/A-level
   view exposes the full surface. The parent view is always full-fidelity.

---

## 2. Site Map — Student App

```
STUDENT APP
│
├── [ONBOARDING — pre-auth]
│   ├── /welcome                         Welcome screen
│   ├── /register                        Account type selection (student / parent creates student)
│   ├── /register/student                Student profile form (name, year group, exam level)
│   ├── /register/exam-setup             Exam board and subject selection
│   ├── /register/diagnostic-choice      Choose: upload report OR take diagnostic
│   ├── /register/upload                 School report / teacher notes upload
│   ├── /register/diagnostic             In-app diagnostic assessment
│   ├── /register/processing             Diagnostic processing status screen
│   ├── /register/consent-pending        Under-13: awaiting parental consent screen
│   └── /register/complete               Account ready / subscription prompt entry
│
├── [STUDENT HOME — authenticated]
│   ├── /home                            Student home (session prompt, top weak topic, streak)
│   │
│   ├── /weakness-map                    Weakness map (all subjects, all topics)
│   │   ├── /weakness-map/:subject       Subject-level topic list
│   │   └── /weakness-map/:subject/:topic  Topic detail (stats, start session)
│   │
│   ├── /session                         Active practice session
│   │   ├── /session/question            Single question view
│   │   ├── /session/answer              Answer submission / self-mark
│   │   ├── /session/mark-scheme         Mark scheme reveal
│   │   └── /session/complete            Session summary
│   │
│   ├── /history                         Session history list
│   │   └── /history/:sessionId          Individual session detail
│   │
│   ├── /progress                        Score progression charts (GCSE/A-level)
│   │   └── /progress/:subject           Subject-level progress detail
│   │
│   └── /account                         Account settings
│       ├── /account/profile             Name, year group, exam level, exam board
│       ├── /account/subjects            Add/remove subjects
│       ├── /account/notifications       Notification preferences
│       ├── /account/language            Welsh/English toggle
│       ├── /account/subscription        Plan view, upgrade, cancel
│       └── /account/data                GDPR data rights (access, export, delete)
│
└── [SUBSCRIPTION GATE — inline, not a separate section]
    └── /upgrade                         Free-to-paid conversion screen
        ├── /upgrade/plans               Plan selection (monthly / annual / family)
        └── /upgrade/checkout            Payment (handled by billing service)
```

---

## 3. Site Map — Parent Dashboard

```
PARENT DASHBOARD
│
├── [PARENT ONBOARDING — pre-auth]
│   ├── /parent/welcome                  Parent-specific welcome
│   ├── /parent/register                 Parent account creation
│   ├── /parent/consent                  Parental consent flow for child account
│   │   ├── /parent/consent/review       Review child account data + consent request
│   │   ├── /parent/consent/confirm      Consent confirmation (GDPR-compliant record)
│   │   └── /parent/consent/done         Consent recorded, child account activated
│   └── /parent/add-student              Add existing or new student account
│
├── [PARENT DASHBOARD — authenticated]
│   ├── /parent/home                     Dashboard overview (all linked students)
│   │
│   ├── /parent/student/:id              Individual student dashboard
│   │   ├── /parent/student/:id/overview     Latest session + progress summary
│   │   ├── /parent/student/:id/weakness-map Parent view of child's weakness map
│   │   ├── /parent/student/:id/history      Session history (90 days)
│   │   └── /parent/student/:id/progress     Score progression
│   │
│   ├── /parent/controls                 Parental controls (F14)
│   │   └── /parent/controls/:studentId  Per-student controls
│   │
│   └── /parent/account                  Parent account settings
│       ├── /parent/account/profile      Parent name, email
│       ├── /parent/account/students     Manage linked student accounts
│       ├── /parent/account/notifications Weekly digest preferences
│       ├── /parent/account/subscription Plan view, upgrade, cancel, family plan
│       └── /parent/account/data         GDPR rights for parent's own data
│
└── [TEACHER PORTAL — read-only, accessed via share link]
    └── /teacher/:shareToken             Read-only student session + weakness map
```

---

## 4. Screen Inventory (Complete)

Every named screen in the product. Screen names are the design system vocabulary.
All names below are canonical and must be used consistently across wireframes,
flows, and build tickets.

### Onboarding Screens (pre-auth)

| Screen ID | Screen Name | Route |
|-----------|-------------|-------|
| OB-01 | Welcome | /welcome |
| OB-02 | Account Type Selection | /register |
| OB-03 | Student Profile Form | /register/student |
| OB-04 | Exam Setup | /register/exam-setup |
| OB-05 | Diagnostic Choice | /register/diagnostic-choice |
| OB-06 | Report Upload | /register/upload |
| OB-07 | Diagnostic Assessment | /register/diagnostic |
| OB-08 | Diagnostic Processing | /register/processing |
| OB-09 | Consent Pending | /register/consent-pending |
| OB-10 | Registration Complete | /register/complete |

### Parent Onboarding Screens

| Screen ID | Screen Name | Route |
|-----------|-------------|-------|
| PO-01 | Parent Welcome | /parent/welcome |
| PO-02 | Parent Registration Form | /parent/register |
| PO-03 | Consent Review | /parent/consent/review |
| PO-04 | Consent Confirmation | /parent/consent/confirm |
| PO-05 | Consent Done | /parent/consent/done |
| PO-06 | Add Student | /parent/add-student |

### Student App Screens

| Screen ID | Screen Name | Route |
|-----------|-------------|-------|
| ST-01 | Student Home | /home |
| ST-02 | Weakness Map — All Subjects | /weakness-map |
| ST-03 | Weakness Map — Subject | /weakness-map/:subject |
| ST-04 | Topic Detail | /weakness-map/:subject/:topic |
| ST-05 | Active Session — Question | /session/question |
| ST-06 | Active Session — Answer | /session/answer |
| ST-07 | Mark Scheme Reveal | /session/mark-scheme |
| ST-08 | Session Complete | /session/complete |
| ST-09 | Session History List | /history |
| ST-10 | Session History Detail | /history/:sessionId |
| ST-11 | Progress Overview | /progress |
| ST-12 | Subject Progress | /progress/:subject |
| ST-13 | Account Profile | /account/profile |
| ST-14 | Subject Management | /account/subjects |
| ST-15 | Notification Preferences | /account/notifications |
| ST-16 | Language Toggle | /account/language |
| ST-17 | Subscription Management | /account/subscription |
| ST-18 | Data Rights (GDPR) | /account/data |

### Subscription / Upgrade Screens

| Screen ID | Screen Name | Route |
|-----------|-------------|-------|
| UP-01 | Upgrade Entry (inline gate) | /upgrade |
| UP-02 | Plan Selection | /upgrade/plans |
| UP-03 | Checkout (billing service) | /upgrade/checkout |
| UP-04 | Upgrade Confirmation | /upgrade/confirmation |

### Parent Dashboard Screens

| Screen ID | Screen Name | Route |
|-----------|-------------|-------|
| PD-01 | Parent Dashboard Home | /parent/home |
| PD-02 | Student Overview | /parent/student/:id/overview |
| PD-03 | Child Weakness Map (parent view) | /parent/student/:id/weakness-map |
| PD-04 | Child Session History | /parent/student/:id/history |
| PD-05 | Child Progress Charts | /parent/student/:id/progress |
| PD-06 | Parental Controls | /parent/controls/:studentId |
| PD-07 | Parent Account Profile | /parent/account/profile |
| PD-08 | Manage Students | /parent/account/students |
| PD-09 | Digest Preferences | /parent/account/notifications |
| PD-10 | Parent Subscription | /parent/account/subscription |
| PD-11 | Parent Data Rights | /parent/account/data |

### Teacher Portal Screens (read-only)

| Screen ID | Screen Name | Route |
|-----------|-------------|-------|
| TC-01 | Teacher View — Session Summary | /teacher/:shareToken |

### Global Utility Screens

| Screen ID | Screen Name | Notes |
|-----------|-------------|-------|
| GL-01 | Sign In | Shared sign-in, routes to correct context on auth |
| GL-02 | Forgot Password | Password reset flow |
| GL-03 | Email Verification | Email confirmation landing |
| GL-04 | Error (404) | Not found |
| GL-05 | Error (500) | Server error |
| GL-06 | Session Expired | Re-auth prompt |
| GL-07 | Maintenance | Planned downtime page |
| GL-08 | Cookie Consent | First-visit PECR-compliant consent banner |

---

## 5. Navigation Structure

### Student App — Bottom Navigation (mobile)

Primary navigation at ≤768px is a bottom tab bar with 4 tabs:

```
[ Home ]  [ My Topics ]  [ History ]  [ Account ]
```

- **Home (ST-01):** Session prompt, top weak topic, streak indicator (GCSE/A-level).
  11+ variant: session prompt and encouragement message only — no streak.
- **My Topics (ST-02):** Weakness map entry. All subjects. Drill to subject, then topic.
- **History (ST-09):** Session history list and progress charts.
- **Account (ST-13):** Profile, subjects, notifications, language, subscription, data rights.

### Student App — Sidebar Navigation (desktop ≥1024px)

Left-side persistent sidebar expands from icon-only to labelled at ≥1440px.

```
[Logo]
─────────────────
[Home]
[My Topics]
[History]
[Progress]          ← surfaced separately on desktop (merged into History on mobile)
─────────────────
[Account]
[Subscription]      ← visible only if on free tier
```

### Parent Dashboard — Top Navigation (all widths)

Header navigation with student switcher:

```
[Revizr logo] [Child name ▾] .............. [Account ▾] [Sign out]
```

Below header, horizontal tab bar (mobile: scrollable; desktop: full):

```
[ Overview ]  [ Topics ]  [ History ]  [ Progress ]  [ Controls ]
```

On mobile (≤768px), top navigation collapses to hamburger + child name. Student
switcher becomes a full-screen bottom sheet.

### Subscription State in Navigation

- **Free tier:** Subscription prompt card appears on Student Home (ST-01) beneath
  the top weak topic. "My Topics" tab shows locked topic cards.
  "Upgrade" appears as a persistent secondary action in Account navigation.
- **Subscribed:** No persistent upgrade prompt. Subscription management visible
  in Account only.

---

## 6. Taps-to-Task Analysis (Key JTBDs)

### JTBD: Start a practice session (Jack, Tariq, Amara)

| Tap | Screen | Action |
|-----|--------|--------|
| 0 | Student Home (ST-01) | Authenticated landing screen |
| 1 | — | Tap "Start Revision" primary action on Home |
| 2 | Active Session — Question (ST-05) | First question loads |

**Result: 1 tap.** Home screen shows the ready-to-go session prompt by default.
This exceeds the ≤3 tap requirement.

### JTBD: Check child's progress (Priya, Siobhan)

| Tap | Screen | Action |
|-----|--------|--------|
| 0 | Parent Dashboard Home (PD-01) | Authenticated landing screen |
| 1 | — | Child card is on home screen — tap child name or "View details" |
| 2 | Student Overview (PD-02) | Progress summary + latest session visible |

**Result: 1–2 taps.** Exceeds requirement.

### JTBD: See which topics are weakest (Jack, Tariq)

| Tap | Screen | Action |
|-----|--------|--------|
| 0 | Student Home (ST-01) | — |
| 1 | Weakness Map (ST-02) | Tap "My Topics" nav |

**Result: 1 tap.**

### JTBD: Upgrade to paid (Priya, any free-tier user)

| Tap | Screen | Action |
|-----|--------|--------|
| 0 | Weakness Map (ST-02) or Student Home | — |
| 1 | Upgrade Entry (UP-01) | Tap locked topic "Unlock" or home banner |
| 2 | Plan Selection (UP-02) | View plans |
| 3 | Checkout (UP-03) | Complete payment |

**Result: 3 taps to begin payment.** Meets requirement.

### JTBD: Find subject-specific session for GCSE Chemistry (Jack)

| Tap | Screen | Action |
|-----|--------|--------|
| 0 | Student Home (ST-01) | — |
| 1 | Weakness Map (ST-02) | Tap "My Topics" |
| 2 | Subject — Chemistry (ST-03) | Tap Chemistry card |
| 3 | Active Session (ST-05) | Tap "Start Chemistry Session" |

**Result: 3 taps.** Meets requirement.

---

## 7. Navigation Rules

1. The bottom tab bar / sidebar is always visible during authenticated sessions
   except during an active practice session. In an active session, the app enters
   a focused mode with minimal navigation chrome — only a pause/exit button.

2. The "Back" affordance (top-left on mobile, keyboard ESC for modals) is present
   on all non-home, non-session screens and always navigates to the correct logical
   parent, not just the previous history entry.

3. Session pause creates a recoverable state. Tapping "My Topics" or any nav tab
   during a session shows a "Your session is paused" modal with options:
   "Continue session" or "End and save."

4. The Welsh language toggle (ST-16) in Account settings immediately re-renders
   all UI chrome in Welsh. Question content language is controlled by the exam
   paper source language, not the UI toggle.

5. The parent dashboard never shows the student's individual question responses or
   answer text — this is an AADC Standard 11 constraint and is enforced at the
   IA level, not only at the data layer.

6. Teacher portal (TC-01) accessed via share link is a distinct authentication
   context and cannot navigate to any other part of the product.

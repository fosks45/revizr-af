---
phase: 6
gate: design-sign-off
feature: 002-revizr
document: wireframes/parent-dashboard
worker: wireframe-author
status: complete
date: 2026-05-15
features-covered: F6 (parent dashboard), F10 (plain-English summary), F11 (notifications), F14 (parental controls)
screens-covered: PD-01, PD-02, PD-03, PD-04, PD-05, PD-06
---

# Revizr — Parent Dashboard Wireframes (F6)

## Design Rationale

Priya (iPhone) and Siobhan (iPhone) are the primary parent personas. Priorities:
1. **At-a-glance status** — is my child on track? Visible from PD-01 without tapping
2. **Plain English throughout** — no exam-board jargon, no spec vocabulary
3. **Compact on mobile** — Priya checks this in 30 seconds between tasks
4. **Multi-child support** — Priya has two children; student switcher must be natural

The parent view never shows individual student answer text — AADC Standard 11 constraint.

---

## PD-01 — Parent Dashboard Home (mobile)

```
┌─────────────────────────────────┐
│  Revizr          [Priya ▾] [⚙] │  ← top bar (sticky)
├─────────────────────────────────┤
│                                 │
│  Your children                  │  ← h1
│                                 │
│  ┌─────────────────────────┐    │
│  │ Aaryan                  │    │  ← child card (tap to PD-02)
│  │ Year 5 · 11+ · AQA      │    │
│  │                         │    │
│  │ ✓ On track              │    │  ← status: icon + text (not colour alone)
│  │                         │    │
│  │ Last session: Yesterday │    │
│  │ Score: 73% (Maths)      │    │
│  │                         │    │
│  │ [View Aaryan's progress]│    │  ← explicit tap target (48px)
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │ Diya                    │    │  ← second child card
│  │ Year 3 · KS2            │    │
│  │                         │    │
│  │ ○ Not started yet       │    │  ← pending first session
│  │                         │    │
│  │ [View Diya's progress]  │    │
│  └─────────────────────────┘    │
│                                 │
│  ─────────────────────────      │
│                                 │
│  ┌─────────────────────────┐    │
│  │ [+] Add another child   │    │  ← secondary action
│  └─────────────────────────┘    │
│                                 │
│  ─────────────────────────      │
│                                 │
│  Subscription                   │  ← h2
│  Family plan · Active           │
│  Next billing: 14 June 2026     │
│  [Manage subscription]          │  ← link to PD-10
│                                 │
└─────────────────────────────────┘
```

**Overall status indicators (icon + text, never colour alone):**
- ✓ On track
- ↑ Improving
- ⚑ Needs attention
- ○ Not started
- ↓ Falling behind

---

## PD-02 — Student Overview (individual child)

```
┌─────────────────────────────────┐
│  ← Your children                │  ← back to PD-01
│                                 │
│  [Overview][Topics][History]    │  ← tab bar within child context
│  [Progress][Controls]           │  (scrollable if needed on small screens)
│                                 │
│  Aaryan's overview              │  ← h1
│  Year 5 · 11+ · AQA             │
│                                 │
│  ─────────────────────────      │
│                                 │
│  Last session                   │  ← h2
│                                 │
│  ┌─────────────────────────┐    │
│  │ Today at 4:15 pm         │   │
│  │                          │   │
│  │ Subjects: Maths,         │   │
│  │           Verbal Reas.   │   │
│  │ Questions: 14            │   │
│  │ Score: 73%               │   │
│  │ Time: 18 minutes         │   │
│  └─────────────────────────┘    │
│                                 │
│  ─────────────────────────      │
│                                 │
│  How Aaryan is doing            │  ← h2 (plain-English summary — F10)
│                                 │
│  ┌─────────────────────────┐    │
│  │ Aaryan has been          │   │
│  │ practising regularly     │   │
│  │ this week — 4 sessions   │   │
│  │ in 7 days.               │   │
│  │                          │   │
│  │ He's making good         │   │
│  │ progress in Maths.       │   │
│  │ Verbal Reasoning needs   │   │
│  │ the most attention right │   │
│  │ now.                     │   │
│  │                          │   │
│  │ Based on where he is,    │   │
│  │ he looks to be on track  │   │
│  │ for his target.          │   │
│  └─────────────────────────┘    │
│                                 │
│  [Full progress report →]       │  ← routes to PD-05
│                                 │
│  ─────────────────────────      │
│                                 │
│  Topics this week               │  ← h2
│                                 │
│  ↑ Maths — Fractions            │  ← improving
│  ↑ Maths — Mental Arithmetic    │
│  ↓ Verbal — Synonyms            │  ← declining
│  ↓ Non-Verbal — Rotations       │
│                                 │
│  [See all topics →]             │  ← routes to PD-03
└─────────────────────────────────┘
```

**Content constraints (AADC Standard 11):**
- Individual question answers are not shown — only summary metrics
- Score shown as percentage and count, not raw answer text
- Parent can see *which topics* were covered but not *which questions* or
  *what the student wrote*

---

## PD-03 — Child Weakness Map (parent view)

Same visual structure as ST-02 (weakness map) but:
- Read-only — no "Start session" buttons (parent cannot initiate sessions)
- "Start session" replaced with "Aaryan can practise this in the app"
- Subject and topic status displayed identically to student view
- Parent cannot modify the weakness map

```
┌─────────────────────────────────┐
│  ← Aaryan                       │  ← breadcrumb
│                                 │
│  [Overview][★Topics][History]   │  ← active: Topics
│  [Progress][Controls]           │
│                                 │
│  Aaryan's topic map             │  ← h1
│                                 │
│  MATHS                          │  ← h2
│  3 areas need more practice     │
│                                 │
│  ┌─────────────────────────┐    │
│  │ ↓ Mental Arithmetic     │    │
│  │   Needs practice        │    │
│  │   Aaryan hasn't tried   │    │
│  │   this topic yet        │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │ ↑ Fractions             │    │
│  │   Improving             │    │
│  │   Score this week: 68%  │    │
│  └─────────────────────────┘    │
│                                 │
│  [and so on per topic...]       │
│                                 │
│  VERBAL REASONING               │  ← h2
│  !! 2 topics need most work     │
│                                 │
│  ┌─────────────────────────┐    │
│  │ !! Synonyms             │    │
│  │   Most needs work       │    │
│  │   Score: 32%            │    │
│  └─────────────────────────┘    │
│                                 │
└─────────────────────────────────┘
```

---

## PD-04 — Child Session History (parent view)

```
┌─────────────────────────────────┐
│  ← Aaryan                       │
│                                 │
│  [Overview][Topics][★History]   │
│  [Progress][Controls]           │
│                                 │
│  Aaryan's sessions              │  ← h1
│  Last 90 days                   │  ← per spec F9
│                                 │
│  ┌─────────────────────────┐    │
│  │ Today, 4:15 pm          │    │  ← session entry
│  │ Maths, Verbal Reasoning │    │
│  │ 14 questions · 73%      │    │
│  │ 18 minutes              │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │ Yesterday, 5:00 pm      │    │
│  │ Maths                   │    │
│  │ 10 questions · 65%      │    │
│  │ 12 minutes              │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │ 12 May, 6:30 pm         │    │
│  │ Non-Verbal Reasoning    │    │
│  │ 8 questions · 50%       │    │
│  │ 10 minutes              │    │
│  └─────────────────────────┘    │
│                                 │
│  [Load older sessions]          │  ← pagination (not infinite scroll)
└─────────────────────────────────┘
```

---

## PD-05 — Child Progress Charts (parent view)

```
┌─────────────────────────────────┐
│  ← Aaryan                       │
│                                 │
│  [Overview][Topics][History]    │
│  [★Progress][Controls]          │
│                                 │
│  Aaryan's progress              │  ← h1
│                                 │
│  ─────────────────────────      │
│                                 │
│  Score over time                │  ← h2
│                                 │
│  [Line chart — Maths            │
│   and Verbal scores over        │
│   last 30 days.                 │
│   Two lines, distinguished      │
│   by both line style (solid     │
│   vs. dashed) AND colour        │
│   AND label, not colour alone.  │
│   X-axis: dates                 │
│   Y-axis: score %               │
│   All data points labelled.     │
│   aria-label: "Maths score      │
│   chart: 12 May 52%, 13 May     │
│   58%, [etc.]..."               │
│   Below chart: data table       │
│   as text alternative]          │
│                                 │
│  ─────────────────────────      │
│                                 │
│  Subject breakdown              │  ← h2
│                                 │
│  Maths          73%  ↑         │  ← bar + text + direction icon
│  [████████████──────]           │
│                                 │
│  Verbal Reasoning  48%  ↓      │
│  [███████─────────────]         │
│                                 │
│  Non-Verbal Reas.  52%  –      │
│  [████████─────────────]        │
│                                 │
│  ─────────────────────────      │
│                                 │
│  Note: scores are based on      │  ← small print / honesty
│  Aaryan's self-marking.         │
│  Accuracy improves over time    │
│  as he gets used to mark        │
│  schemes.                       │
└─────────────────────────────────┘
```

---

## PD-06 — Parental Controls (F14)

```
┌─────────────────────────────────┐
│  ← Aaryan                       │
│                                 │
│  [Overview][Topics][History]    │
│  [Progress][★Controls]          │
│                                 │
│  Aaryan's settings              │  ← h1
│                                 │
│  ─────────────────────────      │
│                                 │
│  Notifications                  │  ← h2
│                                 │
│  Inactivity alerts              │
│  ○ Off (default)                │  ← radio; off by default (AADC Standard 7)
│  ○ After 3 days without         │
│    a session                    │
│  ○ After 5 days                 │
│  ○ After 7 days                 │
│                                 │
│  [Save notification settings]   │  ← button (48px)
│                                 │
│  ─────────────────────────      │
│                                 │
│  Teacher / tutor access         │  ← h2 (F18 — teacher portal)
│                                 │
│  Share Aaryan's progress with   │
│  a teacher or tutor             │
│                                 │
│  No active share links          │
│                                 │
│  ┌─────────────────────────┐    │
│  │  Create share link      │    │  ← primary
│  └─────────────────────────┘    │
│                                 │
│  A share link gives read-only   │  ← transparency before action
│  access to session summaries    │
│  and topic map. Not individual  │
│  answers. Expires after 12      │
│  months. You can remove it      │
│  at any time.                   │
│                                 │
│  ─────────────────────────      │
│                                 │
│  Remove Aaryan's account        │  ← h2
│                                 │
│  [Delete Aaryan's data]         │  ← destructive — secondary style
│                                 │
│  This permanently removes all   │
│  of Aaryan's data from          │
│  Revizr, including his topic    │
│  map and session history.       │
│  This cannot be undone.         │
└─────────────────────────────────┘
```

---

## PD-01-DESKTOP — Parent Dashboard: Desktop Layout (≥1024px)

```
┌─────────────────────────────────────────────────────────────────┐
│ [Revizr]  [Aaryan ▾] ────────────────────── [Priya ▾] [Sign out]│
├──────────┬──────────────────────────────────────────────────────┤
│          │                                                       │
│ Overview │  Aaryan's overview                  [Diya →]         │
│ Topics   │  Year 5 · 11+ · AQA                                  │
│ History  │                                                       │
│ Progress │  ┌────────────────────┐  ┌────────────────────────┐  │
│ Controls │  │ Last session       │  │ How Aaryan is doing    │  │
│          │  │ Today 4:15 pm      │  │                        │  │
│          │  │ 14q · 73% · 18min  │  │ [Plain-English summary]│  │
│          │  └────────────────────┘  └────────────────────────┘  │
│          │                                                       │
│          │  ┌────────────────────────────────────────────────┐  │
│          │  │ Progress last 30 days                          │  │
│          │  │ [Line chart — full width, readable at desktop] │  │
│          │  └────────────────────────────────────────────────┘  │
│          │                                                       │
│          │  Topics this week                                     │
│          │  ↑ Maths Fractions    ↑ Maths Arithmetic             │
│          │  ↓ Verbal Synonyms    ↓ Non-Verbal Rotations         │
│          │                                                       │
└──────────┴───────────────────────────────────────────────────────┘
```

The student switcher in the top nav (Aaryan ▾) expands to a dropdown showing
all linked student names. Selecting a student swaps the main panel content.
On mobile this becomes a bottom sheet.

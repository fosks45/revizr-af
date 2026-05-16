---
phase: 6
gate: design-sign-off
feature: 002-revizr
document: wireframes/practice-session
worker: wireframe-author
status: complete
date: 2026-05-15
features-covered: F5 (practice session flow), F9 (mark scheme display)
screens-covered: ST-05, ST-06, ST-07, ST-08
---

# Revizr — Practice Session Wireframes (F5 + F9)

## Design Rationale

The practice session is the core product interaction. Design priorities:
1. **Question is the hero** — question text is the largest element on screen
2. **Focused mode** — navigation chrome is suppressed; full attention on question
3. **Mark scheme reveal is immediate** — no extra tap required after submission
4. **Self-mark for written questions** — AI-informed guide, student confirms
5. **Flag action is non-blocking** — never interrupts session flow

The session flow repeats: ST-05 → ST-06 → ST-07 → ST-05 (next question).

---

## ST-05 — Question Screen

### Multiple Choice / Single Select Variant

```
┌─────────────────────────────────┐
│  ×                    [⚑ Flag] │  ← minimal header: exit + flag only
│  [━━━━━━━━━━────────────────]   │  ← session progress (aria-label: "Q7 of 12")
│                                 │
│  ─────────────────────────      │
│                                 │
│  ┌─────────────────────────┐    │
│  │ Algebra · 4 marks       │    │  ← topic + mark allocation chip
│  │ AQA · GCSE · 2022 · Q3b │    │  ← exam metadata (contextual, not loud)
│  └─────────────────────────┘    │
│                                 │
│  Solve the equation:            │  ← h1 (question text — largest type)
│                                 │
│  3x² + 5x − 2 = 0              │
│                                 │
│  Give both values of x to       │
│  2 significant figures.         │
│                                 │
│  ─────────────────────────      │
│                                 │
│  ○ x = 0.33 and x = −2         │  ← radio options
│  ○ x = 1.5 and x = −0.44       │    (min 52px each, full-width tap target)
│  ○ x = −0.33 and x = 2         │
│  ○ x = 0.44 and x = −1.5       │
│                                 │
│  ─────────────────────────      │
│                                 │
│  ┌─────────────────────────┐    │
│  │       Submit answer     │    │  ← primary (48px; disabled until option selected)
│  └─────────────────────────┘    │
│                                 │
│  Skip this question             │  ← secondary text link
└─────────────────────────────────┘
```

---

### ST-05-WRITTEN — Written / Short Answer Variant

Used for GCSE/A-level open-response questions.

```
┌─────────────────────────────────┐
│  ×                    [⚑ Flag] │
│  [━━━━━━━━━━━━━━────────────]   │
│                                 │
│  ┌─────────────────────────┐    │
│  │ Chemical Bonding · 3 marks│   │
│  │ AQA · GCSE · 2023 · Q5a │    │
│  └─────────────────────────┘    │
│                                 │
│  Explain why sodium chloride    │  ← h1
│  has a high melting point.      │
│                                 │
│  [3 marks]                      │
│                                 │
│  ─────────────────────────      │
│                                 │
│  Your answer                    │  ← label (associated with textarea)
│  ┌─────────────────────────┐    │
│  │                         │    │  ← textarea (min 160px height)
│  │                         │    │
│  │                         │    │
│  │                         │    │
│  └─────────────────────────┘    │
│                                 │
│  Tip: aim for 3 separate        │  ← contextual hint
│  points in your answer          │
│                                 │
│  ┌─────────────────────────┐    │
│  │       Submit answer     │    │  ← primary (enabled when ≥1 char typed)
│  └─────────────────────────┘    │
│                                 │
│  Skip this question             │
└─────────────────────────────────┘
```

---

### ST-05-FLAG — Flag Confirmation (inline, non-blocking)

Tapping [⚑ Flag] shows a bottom sheet (not a modal — session continues in background):

```
┌─────────────────────────────────┐
│  (session screen dimmed above)  │
│                                 │
├─────────────────────────────────┤
│  Flag this question             │  ← bottom sheet header (h2)
│                                 │
│  What's the issue?              │
│                                 │
│  ○ Mark scheme seems wrong      │  ← radio (48px each)
│  ○ Question doesn't display     │
│    correctly                    │
│  ○ Wrong exam board / year      │
│  ○ Other                        │
│                                 │
│  Optional: add a note           │  ← label
│  ┌─────────────────────────┐    │
│  │                         │    │  ← textarea (optional)
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │  Submit flag            │    │  ← primary
│  └─────────────────────────┘    │
│                                 │
│  [Cancel — go back to question] │  ← secondary text
└─────────────────────────────────┘
```

---

## ST-06 — Answer / Self-Mark Screen

### For Multiple Choice (immediate result)

After selecting an option and tapping "Submit answer", the screen transitions
to ST-07 immediately (no intermediate screen needed for MCQ).

### For Written Questions — Self-Mark Screen

```
┌─────────────────────────────────┐
│  ×                    [⚑ Flag] │
│  [━━━━━━━━━━━━━━━━──────────]   │
│                                 │
│  Your answer                    │  ← h1 equivalent (context label)
│                                 │
│  ┌─────────────────────────┐    │
│  │ "The high melting point  │    │  ← student's submitted answer
│  │  is because the ions     │    │    (read-only, not editable)
│  │  are held strongly       │    │
│  │  together"               │    │
│  └─────────────────────────┘    │
│                                 │
│  ─────────────────────────      │
│                                 │
│  Mark scheme                    │  ← h2 (revealed immediately)
│                                 │
│  ┌─────────────────────────┐    │
│  │ Award 1 mark each for:  │    │
│  │                         │    │
│  │ • Giant ionic lattice   │    │
│  │   structure             │    │
│  │ • Strong electrostatic  │    │
│  │   forces of attraction  │    │
│  │   between oppositely    │    │
│  │   charged ions          │    │
│  │ • Large amount of energy│    │
│  │   needed to overcome    │    │
│  │   these forces          │    │
│  └─────────────────────────┘    │
│                                 │
│  How did you do?                │  ← h2
│                                 │
│  ┌────┐  ┌────┐  ┌────┐  ┌────┐│
│  │ 0  │  │ 1  │  │ 2  │  │ 3  ││  ← self-mark buttons (equal width)
│  │mark│  │mark│  │mark│  │mark ││  ← (48px height each)
│  └────┘  └────┘  └────┘  └────┘│
│                                 │
│  Be honest — this helps us      │  ← reassurance copy
│  find the right questions       │
│  for you.                       │
└─────────────────────────────────┘
```

---

## ST-07 — Mark Scheme Reveal

### Correct MCQ Variant

```
┌─────────────────────────────────┐
│  ×                    [⚑ Flag] │
│  [━━━━━━━━━━━━━━━━━━────────]   │
│                                 │
│  ┌─────────────────────────┐    │
│  │ ✓ Correct!              │    │  ← status chip (icon + text, NOT colour only)
│  └─────────────────────────┘    │
│                                 │
│  Your answer:                   │  ← h2
│  x = −0.33 and x = 2            │  ← student's choice
│                                 │
│  ─────────────────────────      │
│                                 │
│  Mark scheme                    │  ← h2
│                                 │
│  ┌─────────────────────────┐    │
│  │ Correct answer:         │    │
│  │ x = −0.33 and x = 2     │    │
│  │                         │    │
│  │ Working:                │    │
│  │ Using the quadratic     │    │
│  │ formula:                │    │
│  │ x = [−5 ± √(25+24)] / 6│    │
│  │ x = [−5 ± 7] / 6        │    │
│  │ x = 0.33... or −2       │    │
│  │                         │    │
│  │ Note: both values        │    │
│  │ required for full marks  │    │
│  └─────────────────────────┘    │
│                                 │
│  ▸ Examiner tips                │  ← collapsible (disclosure widget)
│    "Common error: forgetting     │    (expanded inline, no nav)
│     to give both solutions"     │
│                                 │
│  ─────────────────────────      │
│                                 │
│  ┌─────────────────────────┐    │
│  │    Next question →      │    │  ← primary (56px — large target)
│  └─────────────────────────┘    │
│                                 │
│  [End session]                  │  ← secondary text link
└─────────────────────────────────┘
```

### Incorrect MCQ Variant

```
│  ┌─────────────────────────┐    │
│  │ ✗ Not quite             │    │  ← "Not quite" not "Wrong!" — positive framing
│  └─────────────────────────┘    │
│                                 │
│  Your answer:                   │
│  x = 1.5 and x = −0.44          │  ← student's wrong choice (clearly stated)
│                                 │
│  Correct answer:                │
│  x = −0.33 and x = 2            │
│                                 │
│  [mark scheme and examiner      │
│   tips as above]                │
```

**Tone note:** "Not quite" not "Wrong" or "Incorrect" — positive learning framing
per copy guidelines. Shame-free. For 11+ cohort, "Not this time — here's how
to get it right."

---

## ST-08 — Session Complete

```
┌─────────────────────────────────┐
│                                 │
│   ┌─────────────────────────┐   │
│   │ [Completion illustration│   │
│   │  — star / badge         │   │
│   │  decorative, alt=""]    │   │
│   └─────────────────────────┘   │
│                                 │
│   Session complete, Jack!       │  ← h1
│                                 │
│   ─────────────────────────     │
│                                 │
│   This session                  │  ← h2
│                                 │
│   Questions: 12                 │
│   Score: 8/12 (67%)             │
│   Time: 22 minutes              │
│                                 │
│   Topics covered:               │  ← h2
│   • Algebra (8 questions)       │
│   • Fractions (4 questions)     │
│                                 │
│   ─────────────────────────     │
│                                 │
│   Your progress                 │  ← h2
│                                 │
│   Algebra: improving            │  ← directional with icon (↑ not just text)
│   ↑ up from 43% to 58%          │
│                                 │
│   ─────────────────────────     │
│                                 │
│   ┌─────────────────────────┐   │
│   │   Start another session │   │  ← primary
│   └─────────────────────────┘   │
│                                 │
│   ┌─────────────────────────┐   │
│   │   Back to My Topics     │   │  ← secondary
│   └─────────────────────────┘   │
│                                 │
│   [View session details]        │  ← routes to ST-10 (history detail)
└─────────────────────────────────┘
```

**11+ cohort variant:** Larger illustration, simpler stats, stronger encouragement
copy: "Brilliant work, Amara! You answered 8 right today." No percentage shown
(age-appropriate — young children may not contextualise percentages well).

**PWA install prompt:** After first session completion (here), show a subtle
bottom-anchored install banner: "Add Revizr to your home screen for quick access.
[Add now] [Not now]" — per platform-pack constraint (install prompt only after
first session complete, not during onboarding or payment).

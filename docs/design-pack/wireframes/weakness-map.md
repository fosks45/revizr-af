---
phase: 6
gate: design-sign-off
feature: 002-revizr
document: wireframes/weakness-map
worker: wireframe-author
status: complete
date: 2026-05-15
features-covered: F4 (topic weakness map), F5 (free tier gate on map)
screens-covered: ST-02, ST-03, ST-04
---

# Revizr — Weakness Map Wireframes (F4)

## Design Rationale

The weakness map is the central navigational object of the product. It must:
1. Be scannable in seconds — parent or student can immediately see what needs attention
2. Never rely on colour alone to convey topic strength (WCAG 1.4.1)
3. Be usable on a 320px viewport without horizontal scroll
4. Respect the free-tier state — locked topics are visible but clearly gated

---

## ST-02 — Weakness Map: All Subjects (mobile)

```
┌─────────────────────────────────┐
│  [≡] Revizr         [Account] │  ← top bar (sticky)
├─────────────────────────────────┤
│  [Home] [★Topics] [History][⚙] │  ← bottom tab bar (active: Topics)
├─────────────────────────────────┤
│                                 │
│  My Topics                      │  ← h1
│                                 │
│  Jack · GCSE · AQA              │  ← student/context label
│                                 │
│  ─────────────────────────      │
│                                 │
│  MATHS                          │  ← subject heading (h2)
│  3 topics need practice         │  ← summary (not colour-only)
│                                 │
│  ┌─────────────────────────┐    │
│  │ ↓ Algebra               │    │  ← topic card
│  │   Needs practice        │    │  ← status text (icon + label)
│  │   12 questions ready    │    │
│  │   [Start practice]      │    │  ← CTA inline (48px height)
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │ ↓ Fractions             │    │
│  │   Needs practice        │    │
│  │   8 questions ready     │    │
│  │   [Start practice]      │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │ – Number & Place Value  │    │  ← icon: – = stable/moderate
│  │   Building confidence   │    │
│  │   5 questions ready     │    │
│  │   [Continue practice]   │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │ ✓ Statistics            │    │  ← icon: ✓ = strong
│  │   Looking good          │    │
│  │   [Practise anyway]     │    │  ← secondary action
│  └─────────────────────────┘    │
│                                 │
│  ─────────────────────────      │
│                                 │
│  CHEMISTRY                      │  ← h2
│  2 topics need practice         │
│                                 │
│  ┌─────────────────────────┐    │
│  │ !! Atomic Structure     │    │  ← !! = critical / most weak
│  │   Most needs work       │    │
│  │   15 questions ready    │    │
│  │   [Start practice]      │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │ ↓ Chemical Bonding      │    │
│  │   Needs practice        │    │
│  │   9 questions ready     │    │
│  │   [Start practice]      │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │ ✓ Organic Chemistry     │    │
│  │   Looking good          │    │
│  │   [Practise anyway]     │    │
│  └─────────────────────────┘    │
│                                 │
│  [+ Add a subject]              │  ← secondary text action
│                                 │
└─────────────────────────────────┘
```

**Status icon legend (visible at top of screen, accessible):**
```
!! = Most needs work  (color-status-critical + label)
↓  = Needs practice   (color-status-weak + label)
–  = Building         (color-status-moderate + label)
✓  = Looking good     (color-status-strong + label)
```
Each icon has a visible text label alongside it — colour is supplementary, not primary.
The legend is shown as a collapsible "What do these mean?" disclosure widget.

---

## ST-02-FREE — Weakness Map: Free Tier State

After 3 questions per topic exhausted, topic cards show a gate. The weakness map
itself remains fully visible — the user can see all topics and their strength ratings.
Only the practice action is gated.

```
│  ┌─────────────────────────┐    │
│  │ ↓ Algebra               │    │
│  │   Needs practice        │    │
│  │   [🔒 Unlock to         │    │  ← locked CTA (not hidden — visible)
│  │      continue]          │    │
│  └─────────────────────────┘    │
```

Below the locked topics, a persistent (but non-intrusive) upgrade prompt:

```
│  ┌─────────────────────────┐    │
│  │  You've seen what        │   │
│  │  Revizr can do.          │   │
│  │                          │   │
│  │  Unlock your full        │   │
│  │  question pack.          │   │
│  │                          │   │
│  │  [See plans →]          │    │  ← routes to UP-02
│  └─────────────────────────┘    │
```

**AADC compliance:** No countdown timer. No shame language ("you've only done X").
No urgent language. This is the subscription prompt for users under 18.

---

## ST-02-DESKTOP — Weakness Map: Desktop Layout (≥1024px)

```
┌──────────────────────────────────────────────────────────────┐
│ [Revizr] [Home][Topics][History][Progress]    [Account][⚙]  │ ← top nav
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  My Topics                         Filter: [All subjects ▾] │ ← h1 + filter
│  Jack · GCSE · AQA                                          │
│                                                              │
│  ┌─────────────────────────────┐  ┌──────────────────────┐  │
│  │ MATHS (3 need practice)     │  │ CHEMISTRY (2 need)   │  │  ← 2-col
│  │                             │  │                      │  │
│  │ !! Algebra · 12q [Start]   │  │ !! Atomic Str · 15q  │  │
│  │ ↓  Fractions · 8q [Start]  │  │    [Start]           │  │
│  │ –  Number · 5q [Continue]  │  │ ↓  Bonding · 9q      │  │
│  │ ✓  Statistics [Practise]   │  │    [Start]           │  │
│  │                             │  │ ✓  Organic [Practise]│  │
│  └─────────────────────────────┘  └──────────────────────┘  │
│                                                              │
│  [+ Add a subject]                                          │
└──────────────────────────────────────────────────────────────┘
```

---

## ST-03 — Weakness Map: Subject-Level (drill-down)

```
┌─────────────────────────────────┐
│  ← My Topics                    │  ← back to ST-02
│                                 │
│  Maths                          │  ← h1 (subject name)
│  GCSE · AQA                     │  ← context
│                                 │
│  ┌─────────────────────────┐    │
│  │ Overall: 3 areas to     │    │  ← summary card
│  │ focus on                │    │
│  │                         │    │
│  │ Your sessions: 4        │    │
│  │ this month              │    │
│  └─────────────────────────┘    │
│                                 │
│  Topics (sorted by priority)    │  ← h2
│                                 │
│  ┌─────────────────────────┐    │
│  │ 1. !! Algebra           │    │  ← topic card (tap to ST-04)
│  │    Most needs work      │    │
│  │    12 questions ready   │    │
│  │    Last practised:      │    │
│  │    3 days ago           │    │
│  │    [Start session]      │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │ 2. ↓ Fractions          │    │
│  │    Needs practice       │    │
│  │    8 questions ready    │    │
│  │    Not practised yet    │    │
│  │    [Start session]      │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │ 3. – Number &           │    │
│  │      Place Value        │    │
│  │    Building confidence  │    │
│  │    5 questions ready    │    │
│  │    Last practised:      │    │
│  │    Yesterday            │    │
│  │    [Continue session]   │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │ 4. ✓ Statistics         │    │
│  │    Looking good         │    │
│  │    2 questions ready    │    │
│  │    [Practise anyway]    │    │
│  └─────────────────────────┘    │
│                                 │
│  ─────────────────────────      │
│                                 │
│  [Start smart session]          │  ← starts auto-selected top priority
│  (Picks your top weak topic)    │
└─────────────────────────────────┘
```

---

## ST-04 — Topic Detail Screen

```
┌─────────────────────────────────┐
│  ← Maths                        │  ← back to ST-03
│                                 │
│  Algebra                        │  ← h1
│  Maths · GCSE · AQA             │  ← breadcrumb context
│                                 │
│  ┌─────────────────────────┐    │
│  │ !! Most needs work      │    │  ← status chip (icon + label + semantic bg)
│  └─────────────────────────┘    │
│                                 │
│  Your progress                  │  ← h2
│                                 │
│  Sessions on this topic: 2      │
│  Questions attempted: 7         │
│  Average score: 43%             │
│                                 │
│  [Progress chart:               │
│   Simple bar chart showing      │
│   score per session.            │
│   2 bars visible.               │
│   aria-label="Algebra scores:   │
│   Session 1: 40%, Session 2:    │
│   46%"                          │
│   Text values shown below bars] │
│                                 │
│  ─────────────────────────      │
│                                 │
│  About this topic               │  ← h2
│                                 │
│  Algebra covers: forming        │
│  expressions, solving           │
│  equations, sequences,          │
│  quadratics (AQA GCSE spec)     │
│                                 │
│  Questions available: 12        │
│  From: AQA GCSE past papers     │
│  2018 – 2024                    │
│                                 │
│  ─────────────────────────      │
│                                 │
│  ┌─────────────────────────┐    │
│  │  Start Algebra session  │    │  ← primary (large, 56px height)
│  └─────────────────────────┘    │
│                                 │
│  ← Back to all Maths topics     │  ← secondary nav
└─────────────────────────────────┘
```

**Free tier variant of ST-04:**

```
│  ┌─────────────────────────┐    │
│  │  🔒 Unlock to continue  │    │  ← replaces "Start session"
│  │                          │   │
│  │  You've used your 3     │    │
│  │  free questions for      │   │
│  │  this topic. Subscribe   │   │
│  │  to practise all 12.     │   │
│  │                          │   │
│  │  [See subscription       │   │
│  │   plans]                │    │
│  └─────────────────────────┘    │
```

**Tone note:** "You've used your 3 free questions" — factual, not shaming.
No "You only have X left" urgency framing while questions remain available.

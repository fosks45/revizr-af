---
phase: 6
gate: design-sign-off
feature: 002-revizr
document: wireframes/diagnostic
worker: wireframe-author
status: complete
date: 2026-05-15
features-covered: F2 (report upload), F3 (in-app diagnostic)
screens-covered: OB-06, OB-07, OB-08 (error variant)
---

# Revizr — Diagnostic Wireframes (F2 + F3)

## Layout Conventions

- Mobile-first: 375px viewport
- These wireframes cover both diagnostic entry paths:
  Path A — school report / teacher notes upload (F2)
  Path B — in-app diagnostic quiz (F3)
- Both paths conclude at OB-08 (processing) and then ST-02 (weakness map)

---

## PATH A: Report Upload

### OB-06 — Report Upload Screen

```
┌─────────────────────────────────┐
│  ← Back                         │
│                                 │
│   Upload your school report     │  ← h1
│   or teacher notes              │
│                                 │
│   We'll read it and build your  │
│   personal topic map.           │
│                                 │
│   ┌─────────────────────────┐   │
│   │                         │   │
│   │   [Upload icon          │   │
│   │    aria-hidden="true"]  │   │
│   │                         │   │
│   │   Tap to choose a file  │   │  ← file input, visible label
│   │   or drag it here       │   │
│   │                         │   │
│   │   Accepted: PDF, JPEG,  │   │
│   │   PNG, plain text       │   │
│   │   Maximum size: 10 MB   │   │
│   └─────────────────────────┘   │
│   (entire box is the upload     │   ← full-area tap target
│    target; min 120px height)    │
│                                 │
│   ─────────────────────────     │
│                                 │
│   Your privacy                  │  ← h2
│                                 │
│   Your report is used only to   │  ← AADC Standard 5 + H-003
│   build your topic map. We      │
│   delete it from our servers    │
│   within 24 hours of            │
│   processing. It is never       │
│   shared or used for anything   │
│   else.                         │
│                                 │
│   [Read our full privacy        │
│   notice]                       │
│                                 │
│   ┌─────────────────────────┐   │
│   │       Upload now        │   │  ← primary (disabled until file selected)
│   └─────────────────────────┘   │
│                                 │
│   No report? Take the quiz      │  ← text link back to OB-05
│   instead                       │
└─────────────────────────────────┘
```

**A11y notes:**
- File input has an explicit `<label>` — the entire upload zone is the label
- File type and size constraints stated before upload (not after failure)
- Privacy notice displayed inline — no buried link pattern

---

### OB-06-SELECTED — File Selected State

```
┌─────────────────────────────────┐
│  ← Back                         │
│                                 │
│   Upload your school report     │  ← h1
│                                 │
│   ┌─────────────────────────┐   │
│   │ ✓ AmbraReport.pdf       │   │  ← selected file shown
│   │   2.4 MB                │   │
│   │   [Remove file ×]       │   │  ← remove action (accessible button)
│   └─────────────────────────┘   │
│                                 │
│   Your privacy                  │
│   [as above — unchanged]        │
│                                 │
│   ┌─────────────────────────┐   │
│   │       Upload now        │   │  ← primary (now enabled)
│   └─────────────────────────┘   │
│                                 │
│   No report? Take the quiz      │
│   instead                       │
└─────────────────────────────────┘
```

---

### OB-06-ERROR — Upload Error State

```
┌─────────────────────────────────┐
│  ← Back                         │
│                                 │
│   Upload your school report     │  ← h1
│                                 │
│   ┌─────────────────────────┐   │
│   │ [!] We couldn't read    │   │  ← role="alert" (announced immediately)
│   │ this file               │   │
│   │                         │   │
│   │ This can happen if the  │   │
│   │ scan is blurry or the   │   │
│   │ file is password-       │   │
│   │ protected.              │   │
│   │                         │   │
│   │ What you can try:       │   │
│   │ • Take a clearer photo  │   │
│   │   of the report         │   │
│   │ • Make sure the file    │   │
│   │   isn't locked          │   │
│   │ • Try a PDF instead     │   │
│   └─────────────────────────┘   │
│                                 │
│   ┌─────────────────────────┐   │
│   │   Try a different file  │   │  ← primary
│   └─────────────────────────┘   │
│                                 │
│   ┌─────────────────────────┐   │
│   │   Take the quiz instead │   │  ← secondary (prominent — not buried)
│   └─────────────────────────┘   │
└─────────────────────────────────┘
```

**Content notes:**
- Error copy: actionable, no blame language, no "invalid file" jargon
- Alternative path is equally prominent — this is the escape hatch into F3

---

## PATH B: In-App Diagnostic Assessment

### OB-07 — Diagnostic Question Screen

The diagnostic renders questions one at a time. The layout is the same as the
practice session (ST-05) to prime the student for the main product experience.

```
┌─────────────────────────────────┐
│  ← Stop quiz                    │  ← back exits with confirmation
│                                 │
│   Quick quiz · Question 4       │  ← progress label (h2 equivalent)
│                                 │
│   [━━━━━━━━━━────────]          │  ← progress bar (aria-label="4 of approx 15")
│   About 11 left                 │  ← approximate because adaptive
│                                 │
│   ─────────────────────────     │
│                                 │
│   Maths — Fractions             │  ← topic label (not h1 — metadata)
│                                 │
│   What is 3/4 + 1/3?            │  ← question text (h1, largest text on screen)
│                                 │
│   ─────────────────────────     │
│                                 │
│   ○ 13/12                       │  ← radio options (min 52px touch target each)
│   ○ 4/7                         │
│   ○ 1 1/4                       │
│   ○ 4/12                        │
│   ○ 1/12                        │
│                                 │
│   ─────────────────────────     │
│                                 │
│   ┌─────────────────────────┐   │
│   │       Submit answer     │   │  ← primary (disabled until option selected)
│   └─────────────────────────┘   │
│                                 │
│   Skip this question            │  ← secondary text link
└─────────────────────────────────┘
```

**11+ variant (Amara — larger font, simpler layout):**

The same template applies. The age-cohort token layer enlarges font to
font-size-md (20px), increases line-height, and reduces the number of answer
options to 4 maximum for the 11+ cohort.

---

### OB-07-WRITTEN — Written / Short Answer Question Variant

For GCSE and A-level diagnostic questions that require short written responses:

```
┌─────────────────────────────────┐
│  ← Stop quiz                    │
│                                 │
│   Quick quiz · Question 7       │
│   [━━━━━━━━━━━━────────]        │
│   About 8 left                  │
│                                 │
│   ─────────────────────────     │
│                                 │
│   Chemistry — Atomic Structure  │
│                                 │
│   Describe what happens to      │  ← h1 question text
│   an electron when it absorbs   │
│   energy. [2 marks]             │
│                                 │
│   ─────────────────────────     │
│                                 │
│   Your answer                   │  ← label
│   ┌─────────────────────────┐   │
│   │                         │   │  ← textarea (min 120px height)
│   │                         │   │
│   │                         │   │
│   └─────────────────────────┘   │
│                                 │
│   This is to understand your    │  ← contextual note (diagnostic only)
│   level — you won't be graded   │
│   on this answer.               │
│                                 │
│   ┌─────────────────────────┐   │
│   │       Submit answer     │   │  ← primary
│   └─────────────────────────┘   │
│                                 │
│   Skip this question            │
└─────────────────────────────────┘
```

---

### OB-07-ABANDON — Abandon Confirmation Modal

When student taps "← Stop quiz" mid-diagnostic:

```
┌─────────────────────────────────┐
│   ╔═════════════════════════╗   │
│   ║                         ║   │
│   ║  Stop the quiz?         ║   │  ← dialog h1 (role="dialog")
│   ║                         ║   │
│   ║  Your progress so far   ║   │
│   ║  is saved. You can      ║   │
│   ║  come back and finish   ║   │
│   ║  any time.              ║   │
│   ║                         ║   │
│   ║  ┌───────────────────┐  ║   │
│   ║  │  Keep going       │  ║   │  ← primary (stays in quiz)
│   ║  └───────────────────┘  ║   │
│   ║                         ║   │
│   ║  ┌───────────────────┐  ║   │
│   ║  │  Save and leave   │  ║   │  ← secondary
│   ║  └───────────────────┘  ║   │
│   ║                         ║   │
│   ╚═════════════════════════╝   │
│   [dimmed background]           │  ← inert backdrop
└─────────────────────────────────┘
```

**A11y notes:**
- Native `<dialog>` element with `showModal()` — built-in focus trap and Escape key
- Focus on "Keep going" (primary) on open
- Returns focus to "Stop quiz" button on dismiss

---

### OB-07-COMPLETE — Diagnostic Complete Confirmation

After final question is answered:

```
┌─────────────────────────────────┐
│                                 │
│   [━━━━━━━━━━━━━━━━━━━━━━━━━]   │  ← progress bar: 100%
│                                 │
│   All done!                     │  ← h1
│                                 │
│   We're putting together        │
│   your topic map now.           │
│                                 │
│   ┌─────────────────────────┐   │
│   │  See my results         │   │  ← routes to OB-08
│   └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

---

## OB-08 — Processing Screen (shared by both paths)

```
┌─────────────────────────────────┐
│                                 │
│                                 │
│   [Animated graphic:            │
│    concept art of a map         │
│    being drawn — lines          │
│    appearing on a grid.         │
│    Purely decorative.           │
│    aria-hidden="true"           │
│    Respects prefers-            │
│    reduced-motion: static       │
│    image fallback]              │
│                                 │
│   Building your topic map…      │  ← h1 (aria-live="polite" wrapper)
│                                 │
│   We're reading your subjects   │
│   and finding where you need    │
│   the most practice.            │
│                                 │
│   ─────────────────────────     │
│                                 │
│   [Status update at 15s:]       │  ← aria-live update
│   "Still working — almost       │
│    there"                       │
│                                 │
│   [Status update at 45s:]       │
│   "Taking a little longer       │
│    than usual. Thanks for       │
│    your patience."              │
│                                 │
│   [Status update at 90s:]       │
│   "This is taking longer than   │
│    expected. We'll email you    │
│    when your map is ready."     │
│   [Continue to home screen]     │  ← escape at 90s timeout
└─────────────────────────────────┘
```

**Performance note:** Processing screen displayed during async diagnostic processing.
Must display spinner/animation entirely client-side — no server round-trip for
display. Status updates polled via lightweight heartbeat endpoint.

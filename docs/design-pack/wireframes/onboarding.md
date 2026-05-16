---
phase: 6
gate: design-sign-off
feature: 002-revizr
document: wireframes/onboarding
worker: wireframe-author
status: complete
date: 2026-05-15
features-covered: F1 (student account creation, parental consent for under-13)
screens-covered: OB-01, OB-02, OB-03, OB-04, OB-05, OB-08, OB-09, OB-10, PO-01, PO-02, PO-03, PO-04, PO-05
note: >
  These are lo-fi wireframes expressing layout and content hierarchy only.
  No colour, no font specification — those are in design-tokens.md.
  All interactive targets meet the 44×44px minimum.
---

# Revizr — Onboarding Wireframes (F1)

## Layout Conventions

- All mobile wireframes: 375px viewport width
- Page padding: 16px each side
- Tap targets: minimum 48px height for all interactive elements
- Progress indicator: step dots at top of each onboarding screen
- All screens have a single primary action (visually prominent) and at most
  one secondary action (visually quiet)
- Back affordance: top-left arrow on all screens except OB-01

---

## OB-01 — Welcome Screen

```
┌─────────────────────────────────┐
│                                 │
│          [Revizr logo]          │
│                                 │
│                                 │
│   ┌─────────────────────────┐   │
│   │                         │   │
│   │     [Illustration:      │   │
│   │      student at desk    │   │
│   │      — decorative,      │   │
│   │      alt=""]            │   │
│   │                         │   │
│   └─────────────────────────┘   │
│                                 │
│   Revision that knows           │
│   exactly what you need         │
│                                 │
│   Real past paper questions,    │
│   targeted at your weak spots.  │
│   Free to try.                  │
│                                 │
│   ┌─────────────────────────┐   │
│   │   Get started — free    │   │  ← primary action (48px height)
│   └─────────────────────────┘   │
│                                 │
│   Already have an account?      │
│   [Sign in]                     │  ← text link
│                                 │
│   [Privacy policy] [Terms]      │  ← small legal links
└─────────────────────────────────┘
```

**Content notes:**
- Headline: age-neutral; parents and students both land here
- No urgency language, no "limited time" framing
- "Free to try" — transparent about free tier upfront
- PWA install prompt is NOT shown here (deferred until first session complete)
- Welsh language toggle not shown at welcome — set in Account after registration

---

## OB-02 — Account Type Selection

```
┌─────────────────────────────────┐
│  ← Back                         │
│                                 │
│   ●  ○  ○  ○  ○                 │  ← step indicator (step 1 of 5)
│                                 │
│   Who's signing up today?       │  ← page heading (h1)
│                                 │
│   ┌─────────────────────────┐   │
│   │  👤  I'm a student      │   │  ← card option (min 64px height)
│   │      I'm revising for   │   │
│   │      an exam            │   │
│   └─────────────────────────┘   │
│                                 │
│   ┌─────────────────────────┐   │
│   │  👪  I'm a parent       │   │  ← card option
│   │      Setting up for     │   │
│   │      my child           │   │
│   └─────────────────────────┘   │
│                                 │
│   ┌─────────────────────────┐   │
│   │  🏫  I'm a teacher      │   │  ← card option
│   │      or tutor           │   │
│   └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

**Content notes:**
- Icons are decorative (aria-hidden); card text is the accessible label
- Tapping a card selects it and immediately advances (no separate "Continue" needed)
- Teacher/tutor path routes to school contact form (v1 — no direct self-serve B2B)
- Parent path: goes to PO-01 (parent welcome) then links back to create student account

---

## OB-03 — Student Profile Form

```
┌─────────────────────────────────┐
│  ← Back                         │
│                                 │
│   ●  ●  ○  ○  ○                 │  ← step 2
│                                 │
│   Tell us about yourself        │  ← h1
│                                 │
│   ┌─────────────────────────┐   │
│   │ Your first name          │   │  ← label above input
│   │ ┌─────────────────────┐ │   │
│   │ │ e.g. Amara           │ │   │  ← text input (48px height)
│   │ └─────────────────────┘ │   │
│   └─────────────────────────┘   │
│                                 │
│   ┌─────────────────────────┐   │
│   │ What year are you in?    │   │  ← label
│   │ ┌─────────────────────┐ │   │
│   │ │ Select year group   ▾│ │   │  ← select / picker (48px)
│   │ └─────────────────────┘ │   │
│   │ Year 5 · Year 6 ·        │   │  ← helper text
│   │ Year 7–11 · Year 12–13   │   │
│   └─────────────────────────┘   │
│                                 │
│   [!] Children under 13 need    │  ← shown conditionally if year 5/6 selected
│   a parent or guardian to       │   (role="alert", live region)
│   confirm their account.        │
│   We'll send them an email.     │
│                                 │
│   ┌─────────────────────────┐   │
│   │       Continue          │   │  ← primary (48px)
│   └─────────────────────────┘   │
│                                 │
│   [Privacy notice for children] │  ← age-appropriate link
└─────────────────────────────────┘
```

**Content notes:**
- First name only collected at this step — minimise data collection (AADC Standard 8)
- Year group picker triggers consent notice dynamically (no page reload)
- "Children under 13" copy is informational — positive framing, no shame
- For 11+ cohort: font-size-md (20px), line-height-loose (1.85) applied

---

## OB-04 — Exam Setup

```
┌─────────────────────────────────┐
│  ← Back                         │
│                                 │
│   ●  ●  ●  ○  ○                 │  ← step 3
│                                 │
│   Which exam are you            │  ← h1
│   preparing for?                │
│                                 │
│   [Detected from year group:    │  ← contextual label
│    11+ | GCSE | A-level | KS3]  │    (pre-filled from OB-03)
│                                 │
│   Exam board                    │  ← label
│   ┌─────────────────────────┐   │
│   │ ○ AQA                   │   │  ← radio options (min 48px each)
│   │ ○ Edexcel               │   │
│   │ ○ OCR                   │   │
│   │ ○ CCEA (Northern        │   │
│   │       Ireland)          │   │
│   │ ○ WJEC (Wales)          │   │
│   │ ○ Cambridge Assessment  │   │
│   │ ○ Not sure yet          │   │  ← allowed; defaults to AQA for session
│   └─────────────────────────┘   │
│                                 │
│   Your subjects                 │  ← label
│   (You can add more later)      │  ← helper
│   ┌─────────────────────────┐   │
│   │ □ Maths                 │   │  ← checkboxes (min 48px each)
│   │ □ English Language      │   │
│   │ □ English Literature    │   │
│   │ □ Science               │   │
│   │ □ History               │   │
│   │ [+ Show all subjects]   │   │  ← expand control
│   └─────────────────────────┘   │
│                                 │
│   ┌─────────────────────────┐   │
│   │       Continue          │   │  ← primary
│   └─────────────────────────┘   │
└─────────────────────────────────┘
```

**Content notes:**
- Exam level pre-filled from OB-03 year group selection — no re-entry
- "Not sure yet" option — reduces abandonment, prevents user feeling stuck
- CCEA and WJEC options clearly labelled with region — Siobhan and Welsh families
  can immediately identify relevant choice

---

## OB-05 — Diagnostic Choice

```
┌─────────────────────────────────┐
│  ← Back                         │
│                                 │
│   ●  ●  ●  ●  ○                 │  ← step 4
│                                 │
│   How do you want us to         │  ← h1
│   find your weak spots?         │
│                                 │
│   ┌─────────────────────────┐   │
│   │  📄  Upload your        │   │  ← option card (min 80px height)
│   │      school report      │   │
│   │                         │   │
│   │  We'll read your        │   │
│   │  teacher's comments     │   │
│   │  and build your topic   │   │
│   │  map from that.         │   │
│   │                         │   │
│   │  Takes: under 2 mins    │   │
│   │  [Choose this]          │   │  ← within-card button (48px)
│   └─────────────────────────┘   │
│                                 │
│   ┌─────────────────────────┐   │
│   │  ✏️  Take a short quiz  │   │  ← option card
│   │                         │   │
│   │  Answer a few questions │   │
│   │  and we'll map your     │   │
│   │  topics for you.        │   │
│   │                         │   │
│   │  Takes: about 10–20 min │   │
│   │  [Choose this]          │   │
│   └─────────────────────────┘   │
│                                 │
│   Both options are free.        │  ← reassurance — no payment gate here
└─────────────────────────────────┘
```

**Content notes:**
- No "better" or "worse" framing between options — both are equally valid
- Time estimates set expectations without pressure
- "Both options are free" — explicit, prevents hesitation

---

## OB-06 — Report Upload (see diagnostic.md wireframes)

---

## OB-08 — Diagnostic Processing

```
┌─────────────────────────────────┐
│                                 │
│                                 │
│   ┌─────────────────────────┐   │
│   │                         │   │
│   │   [Animated progress    │   │
│   │    indicator — not a    │   │
│   │    spinner; animated    │   │
│   │    topic map building   │   │
│   │    metaphor             │   │
│   │    aria-hidden="true"]  │   │
│   │                         │   │
│   └─────────────────────────┘   │
│                                 │
│   Building your topic map…      │  ← h1 (live region — aria-live="polite")
│                                 │
│   We're reading your subjects   │
│   and finding where you need    │
│   the most practice.            │
│                                 │
│   [Accessible progress text:    │
│    "Still working — this takes  │  ← status update at 15s, 45s intervals
│    up to 90 seconds"]           │    (aria-live="polite")
│                                 │
│   [!] Don't close this tab      │  ← subtle note (not alarming)
│                                 │
└─────────────────────────────────┘
```

**Content notes:**
- Screen announced to screen readers via aria-live region
- Animation is decorative (aria-hidden) — no information conveyed by it alone
- Progress updates provided by text, not animation state
- If processing exceeds 90s: "This is taking a bit longer. We'll email you when
  your map is ready." with continue-to-home option

---

## OB-09 — Consent Pending (under-13 users)

```
┌─────────────────────────────────┐
│  ← Back to start                │
│                                 │
│   ┌─────────────────────────┐   │
│   │  [Envelope illustration │   │
│   │   — decorative, alt=""] │   │
│   └─────────────────────────┘   │
│                                 │
│   Check your inbox — or         │  ← h1 (addressed to parent reading this)
│   ask a parent to               │
│                                 │
│   We've sent an email to:       │
│   [parent email address]        │  ← masked for child privacy
│                                 │
│   A parent or guardian needs    │
│   to confirm your account       │
│   before you can start.         │
│                                 │
│   ─────────────────────────     │
│                                 │
│   While you wait, here's        │
│   a taster question:            │  ← free sample to maintain engagement
│                                 │
│   [Sample question — no         │
│    data collected, no account   │
│    required]                    │
│                                 │
│   ─────────────────────────     │
│                                 │
│   [Resend email]                │  ← secondary action (text button)
│   Sent to the wrong address?    │
│   [Change email address]        │
└─────────────────────────────────┘
```

**Content notes:**
- Parent email address partially masked (user@***.com) to protect privacy
- Taster question keeps the child engaged without collecting data
- No data collected or processed until parent consent confirmed
- "Resend email" rate-limited to 3 per hour (shown in disabled state with countdown
  after first resend)

---

## OB-10 — Registration Complete / Account Ready

```
┌─────────────────────────────────┐
│                                 │
│   ┌─────────────────────────┐   │
│   │  [Success illustration  │   │
│   │   — decorative, alt=""] │   │
│   └─────────────────────────┘   │
│                                 │
│   Your topic map is ready,      │  ← h1 (uses student first name if known)
│   Amara!                        │
│                                 │
│   We found 3 topic areas        │  ← specific, actionable summary
│   where you can improve.        │
│   Let's go!                     │
│                                 │
│   ┌─────────────────────────┐   │
│   │   See my topic map      │   │  ← primary (goes to ST-02)
│   └─────────────────────────┘   │
│                                 │
│   or                            │
│                                 │
│   ┌─────────────────────────┐   │
│   │   Start practising now  │   │  ← secondary (goes to ST-05)
│   └─────────────────────────┘   │
│                                 │
│   Free tier: your 3 sample      │  ← transparent about tier
│   questions per topic are       │    no countdown, no urgency
│   waiting for you.              │
└─────────────────────────────────┘
```

**AADC compliance note:** No urgency language. No "your trial ends in X days."
The free tier has no time limit per spec F5, and the UX reflects this accurately.

---

## PO-01 — Parent Welcome (parent registration entry)

```
┌─────────────────────────────────┐
│                                 │
│          [Revizr logo]          │
│                                 │
│   Welcome to Revizr for         │  ← h1
│   parents                       │
│                                 │
│   You'll have your own          │
│   dashboard showing your        │
│   child's progress — in         │
│   plain English, no jargon.     │
│                                 │
│   ┌─────────────────────────┐   │
│   │   Create my account     │   │  ← primary
│   └─────────────────────────┘   │
│                                 │
│   Already registered?           │
│   [Sign in]                     │
│                                 │
│   ─────────────────────────     │
│                                 │
│   You'll be able to:            │
│   ✓ See every session your      │
│     child completes             │
│   ✓ Understand which topics     │
│     need the most work          │
│   ✓ Share progress with         │
│     their teacher or tutor      │
│                                 │
└─────────────────────────────────┘
```

---

## PO-02 — Parent Registration Form

```
┌─────────────────────────────────┐
│  ← Back                         │
│                                 │
│   Create your parent account    │  ← h1
│                                 │
│   ┌─────────────────────────┐   │
│   │ Your name                │   │
│   │ ┌─────────────────────┐ │   │
│   │ │                      │ │   │  ← text input
│   │ └─────────────────────┘ │   │
│   └─────────────────────────┘   │
│                                 │
│   ┌─────────────────────────┐   │
│   │ Email address            │   │
│   │ ┌─────────────────────┐ │   │
│   │ │                      │ │   │
│   │ └─────────────────────┘ │   │
│   │ We'll send account       │   │
│   │ updates here             │   │
│   └─────────────────────────┘   │
│                                 │
│   ┌─────────────────────────┐   │
│   │ Create a password        │   │
│   │ ┌─────────────────────┐ │   │
│   │ │ ••••••••••          👁│ │   │  ← show/hide (accessible)
│   │ └─────────────────────┘ │   │
│   │ At least 10 characters   │   │
│   └─────────────────────────┘   │
│                                 │
│   □ I agree to the Terms of     │  ← required checkbox (aria-required)
│     Service and Privacy Policy  │
│     [Terms] [Privacy Policy]    │
│                                 │
│   ┌─────────────────────────┐   │
│   │       Create account    │   │  ← primary
│   └─────────────────────────┘   │
└─────────────────────────────────┘
```

---

## PO-03 — Consent Review

```
┌─────────────────────────────────┐
│  ← Back                         │
│                                 │
│   ●  ●  ○                       │  ← step indicator (3-step consent flow)
│                                 │
│   Review your child's account   │  ← h1
│                                 │
│   ┌─────────────────────────┐   │
│   │ Child's name:            │   │
│   │ Amara Osei-Mensah        │   │
│   │                          │   │
│   │ Year group: Year 5       │   │
│   │ Exam: 11+                │   │
│   │ Exam board: AQA          │   │
│   └─────────────────────────┘   │
│                                 │
│   What Revizr will store        │  ← h2 (GDPR transparency, H-009)
│   for Amara:                    │
│                                 │
│   • Her first name              │
│   • Her year group and subjects │
│   • Her practice session data   │
│     (questions attempted,       │
│     scores, topics — not        │
│     individual written          │
│     answers)                    │
│   • Any school report she       │
│     uploads (securely stored,   │
│     used only for her topic     │
│     map)                        │
│                                 │
│   [Full privacy notice]         │  ← link opens in same tab / new section
│   [Child-friendly version]      │  ← AADC Standard 4 requirement
│                                 │
│   ┌─────────────────────────┐   │
│   │       I understand      │   │  ← primary
│   │   — next step           │   │
│   └─────────────────────────┘   │
└─────────────────────────────────┘
```

---

## PO-04 — Consent Confirmation

```
┌─────────────────────────────────┐
│  ← Back                         │
│                                 │
│   ●  ●  ●                       │  ← step 3 of 3
│                                 │
│   Confirm your consent          │  ← h1
│                                 │
│   ┌─────────────────────────┐   │
│   │ ☐  I confirm that I     │   │  ← required checkbox (aria-required)
│   │    am the parent or      │   │    (48px touch target)
│   │    guardian of Amara     │   │
│   │    and I give consent    │   │
│   │    for Revizr to process │   │
│   │    her personal data as  │   │
│   │    described above.      │   │
│   └─────────────────────────┘   │
│                                 │
│   ┌─────────────────────────┐   │
│   │ ☐  I understand that I  │   │  ← required checkbox
│   │    can withdraw consent  │   │
│   │    and delete Amara's    │   │
│   │    data at any time      │   │
│   │    from Account          │   │
│   │    Settings.             │   │
│   └─────────────────────────┘   │
│                                 │
│   ┌─────────────────────────┐   │
│   │  Confirm and activate   │   │  ← primary (disabled until both boxes checked)
│   │  Amara's account        │   │
│   └─────────────────────────┘   │
│                                 │
│   [Cancel — don't create        │  ← secondary text link
│   this account]                 │
└─────────────────────────────────┘
```

**Compliance note (H-007, H-017, H-018, H-019):** This is the verifiable parental
consent record. Both checkboxes are individually required. The consent timestamp
and parent account ID are recorded server-side on confirm. No child data processing
begins until this confirmation is submitted.

---

## PO-05 — Consent Done

```
┌─────────────────────────────────┐
│                                 │
│   ┌─────────────────────────┐   │
│   │  [Checkmark illustration│   │
│   │   — decorative, alt=""] │   │
│   └─────────────────────────┘   │
│                                 │
│   Amara's account is ready      │  ← h1
│                                 │
│   Her topic map is being built  │
│   now. You'll see her progress  │
│   as soon as she starts her     │
│   first session.                │
│                                 │
│   ┌─────────────────────────┐   │
│   │  Go to my dashboard     │   │  ← primary (routes to PD-01)
│   └─────────────────────────┘   │
│                                 │
│   Confirmation sent to:         │
│   [parent email address]        │
└─────────────────────────────────┘
```

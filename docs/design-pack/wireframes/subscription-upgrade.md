---
phase: 6
gate: design-sign-off
feature: 002-revizr
document: wireframes/subscription-upgrade
worker: wireframe-author
status: complete
date: 2026-05-15
features-covered: F7 (subscription and billing — free-to-paid conversion)
screens-covered: UP-01, UP-02, UP-03, UP-04, ST-17 (manage subscription)
commercial-priority: HIGHEST
compliance-constraints:
  - No countdown timers on any screen accessible to under-18s
  - No confusing cancellation flows (Consumer Rights Act 2015, H-028)
  - CCR pre-contractual information required before checkout (H-045)
  - Digital rights waiver checkbox required if immediate access granted (H-046)
  - 14-day cancellation right or its waiver must be clearly stated (H-027)
  - No dark patterns — no hidden costs, no shame framing
---

# Revizr — Subscription Upgrade Wireframes (F7)

## Design Rationale

The free-to-paid conversion flow is the primary revenue gate. It must be:
1. **Genuinely frictionless** — fewest possible steps to payment
2. **Transparent about price** — no hidden costs, no surprise at checkout
3. **Legally compliant** — CCR pre-contractual information, digital rights waiver
4. **Dark-pattern-free** — no countdown timers, no shame copy, no confusing
   cancellation paths on any screen accessible to under-18s
5. **Confident, not desperate** — the product has already demonstrated value
   via the free tier; the upgrade screen builds on that, not on anxiety

Entry points to this flow:
- Locked topic card on weakness map (ST-02): "🔒 Unlock to continue"
- Session gate after 3rd free question: inline prompt
- Persistent banner on Student Home (ST-01) — free tier only
- Account Settings → Subscription (ST-17): user-initiated

---

## UP-01 — Upgrade Entry

Triggered when user taps a locked topic or "Unlock" CTA.

```
┌─────────────────────────────────┐
│  ×                              │  ← close (returns to previous screen)
│                                 │
│                                 │
│   ┌─────────────────────────┐   │
│   │ [Your topic map graphic │   │
│   │  — same visual as ST-02 │   │
│   │  but with 'unlocked'    │   │
│   │  state illustration.    │   │
│   │  aria-hidden="true"]    │   │
│   └─────────────────────────┘   │
│                                 │
│   You've seen exactly where     │  ← h1
│   you need to focus.            │
│                                 │
│   Now practise on all the       │
│   real past paper questions     │
│   that will make the            │
│   difference.                   │
│                                 │
│   ─────────────────────────     │
│                                 │
│   What you unlock:              │  ← h2
│                                 │
│   ✓ All past paper questions    │
│     for every weak topic        │
│   ✓ Updated question packs      │
│     as you improve              │
│   ✓ Detailed mark scheme        │
│     explanations for every      │
│     question                    │
│   ✓ Parent progress dashboard   │
│     (full, not preview)         │
│                                 │
│   No time limits on your        │  ← reassurance — no free-trial pressure
│   free account. Upgrade when    │
│   you're ready.                 │
│                                 │
│   ┌─────────────────────────┐   │
│   │   See plans and pricing │   │  ← primary (48px) → UP-02
│   └─────────────────────────┘   │
│                                 │
│   [Not now — back to my topics] │  ← secondary text link
└─────────────────────────────────┘
```

**AADC note:** No countdown timer. No "offer expires" language. This screen is
accessible to users as young as age 9. Urgency mechanics prohibited by
AADC Standard 13.

---

## UP-02 — Plan Selection

```
┌─────────────────────────────────┐
│  ← Back                         │
│                                 │
│   Choose your plan              │  ← h1
│                                 │
│   ─────────────────────────     │
│                                 │
│   ┌─────────────────────────┐   │
│   │ Monthly                 │   │  ← plan card (not pre-selected)
│   │                         │   │
│   │ £19.99 / month          │   │  ← price prominent
│   │                         │   │
│   │ Billed monthly.         │   │  ← billing cadence
│   │ Cancel any time.        │   │  ← cancellation is visible upfront
│   │                         │   │
│   │ [Choose monthly]        │   │  ← 48px button
│   └─────────────────────────┘   │
│                                 │
│   ┌─────────────────────────┐   │
│   │ Annual                  │   │  ← plan card (recommended — visually indicated
│   │ [Best value]            │   │    with a text label "Best value", not hidden)
│   │                         │   │
│   │ £179 / year             │   │  ← price
│   │ That's £14.92/month     │   │  ← equivalent monthly shown
│   │ Save £61 vs monthly     │   │  ← saving stated in £, not %
│   │                         │   │
│   │ Billed annually.        │   │
│   │ Cancel any time —       │   │
│   │ access continues to     │   │  ← honest cancellation policy
│   │ end of year.            │   │
│   │                         │   │
│   │ [Choose annual]         │   │
│   └─────────────────────────┘   │
│                                 │
│   ┌─────────────────────────┐   │
│   │ Family plan             │   │  ← third option (F28)
│   │                         │   │
│   │ Up to 5 children        │   │
│   │                         │   │
│   │ £299 / year             │   │
│   │ Covers all children     │   │
│   │ under one account       │   │
│   │                         │   │
│   │ [Choose family plan]    │   │
│   └─────────────────────────┘   │
│                                 │
│   ─────────────────────────     │
│                                 │
│   All plans include:            │  ← h2 (reassurance block below plans)
│   ✓ Cancel any time             │
│   ✓ Your topic map and          │
│     progress are saved          │
│     forever                     │
│   ✓ No hidden fees              │
│                                 │
│   Questions? [Read the FAQs]    │
└─────────────────────────────────┘
```

**Compliance notes:**
- All three plan prices include VAT (H-045 pre-contractual information)
- "Cancel any time" stated on every plan card — CCR H-028 compliance
- "Annual" plan is visually indicated as recommended but not pre-selected.
  Pre-selecting the more expensive plan is a recognised dark pattern.
  Both plans are presented with equal prominence, differentiated by value.
- No countdown timers. No "limited time pricing."

---

## UP-03 — Checkout (billing service handoff)

The payment form is rendered by the integrated billing service (e.g., Stripe
hosted elements). Revizr's pre-checkout screen provides required CCR information
before the payment form renders.

### UP-03-PRE — Pre-Checkout Information Screen

```
┌─────────────────────────────────┐
│  ← Change plan                  │
│                                 │
│   Review your order             │  ← h1
│                                 │
│   ┌─────────────────────────┐   │
│   │ Revizr Annual Plan      │   │  ← order summary
│   │                         │   │
│   │ For: Aaryan             │   │  ← student name (parent purchasing)
│   │                         │   │
│   │ Price: £179.00          │   │  ← total inc VAT
│   │ (includes VAT)          │   │
│   │                         │   │
│   │ First charge: today     │   │
│   │ Renews: 14 June 2027    │   │  ← exact renewal date stated
│   │ at £179.00              │   │  ← renewal price stated (same)
│   └─────────────────────────┘   │
│                                 │
│   ─────────────────────────     │
│                                 │
│   Your cancellation rights      │  ← h2 (CCR H-027, H-045)
│                                 │
│   You can cancel any time from  │
│   Account Settings. Your        │
│   access continues until the    │
│   end of your paid period.      │
│   No refund for unused time     │
│   after the 14-day return       │
│   window.                       │
│                                 │
│   ─────────────────────────     │
│                                 │
│   ☐ I want to start using      │  ← required checkbox (H-046)
│     Revizr immediately and      │
│     I understand my 14-day      │
│     cancellation right starts   │
│     now and is fulfilled when   │
│     I first access content.     │
│                                 │
│   ┌─────────────────────────┐   │
│   │   Continue to payment   │   │  ← primary (disabled until checkbox ticked)
│   └─────────────────────────┘   │
└─────────────────────────────────┘
```

### UP-03-PAYMENT — Payment Form

The payment form is provided by the billing service. Revizr's wrapper:

```
┌─────────────────────────────────┐
│  ← Back                         │
│                                 │
│   Pay securely                  │  ← h1
│                                 │
│   Annual plan — £179.00         │  ← persistent order summary
│                                 │
│   ─────────────────────────     │
│                                 │
│   [Billing service payment      │
│    form: card number, expiry,   │
│    CVC, billing name.           │
│    Accessible labels on all     │
│    inputs. Error messages        │
│    via aria-describedby.        │
│    Paste and autofill allowed   │
│    — WCAG 3.3.8 compliance.]    │
│                                 │
│   ─────────────────────────     │
│                                 │
│   ┌─────────────────────────┐   │
│   │   Pay £179.00           │   │  ← primary (exact amount stated in button)
│   └─────────────────────────┘   │
│                                 │
│   🔒 Secure payment powered     │
│   by [billing provider]         │
│                                 │
│   Card data is handled by       │  ← compliance statement (H-005, C4 data)
│   our payment provider and      │
│   never stored on Revizr's      │
│   servers.                      │
└─────────────────────────────────┘
```

### UP-03-ERROR — Payment Error State

```
│   ┌─────────────────────────┐   │
│   │ [!] Your payment didn't │   │  ← role="alert"
│   │ go through              │   │
│   │                         │   │
│   │ Check your card details │   │
│   │ and try again.          │   │
│   │                         │   │
│   │ Common reasons:         │   │
│   │ • Incorrect card number │   │
│   │ • Billing address       │   │
│   │   doesn't match         │   │
│   │ • Card declined by bank │   │
│   │   (contact your bank)   │   │
│   └─────────────────────────┘   │
│                                 │
│   [Try again]                   │  ← primary
│   [Use a different card]        │  ← secondary
│   [Contact support]             │  ← tertiary text link
```

---

## UP-04 — Upgrade Confirmation

```
┌─────────────────────────────────┐
│                                 │
│   ┌─────────────────────────┐   │
│   │ [Success checkmark —    │   │
│   │  decorative, alt=""]    │   │
│   └─────────────────────────┘   │
│                                 │
│   You're all set!               │  ← h1
│                                 │
│   Your full question pack       │
│   is ready for Aaryan.          │
│                                 │
│   ─────────────────────────     │
│                                 │
│   What's waiting:               │  ← h2
│                                 │
│   Algebra           12 questions│
│   Fractions          8 questions│
│   Atomic Structure  15 questions│
│   [+ more topics]               │
│                                 │
│   ─────────────────────────     │
│                                 │
│   ┌─────────────────────────┐   │
│   │  Start practising now   │   │  ← primary → ST-05 (session start)
│   └─────────────────────────┘   │
│                                 │
│   ┌─────────────────────────┐   │
│   │  See my full topic map  │   │  ← secondary → ST-02
│   └─────────────────────────┘   │
│                                 │
│   A receipt has been sent to    │
│   [parent email]                │
│                                 │
│   [Manage your subscription]    │  ← link to ST-17
└─────────────────────────────────┘
```

---

## ST-17 — Subscription Management (Account Settings)

```
┌─────────────────────────────────┐
│  ← Account                      │
│                                 │
│   Your subscription             │  ← h1
│                                 │
│   ┌─────────────────────────┐   │
│   │ Annual Plan             │   │
│   │ Active                  │   │
│   │                         │   │
│   │ Next billing:           │   │
│   │ 14 June 2027 · £179.00  │   │
│   │                         │   │
│   │ Student: Aaryan         │   │
│   └─────────────────────────┘   │
│                                 │
│   ─────────────────────────     │
│                                 │
│   Change plan                   │  ← h2
│                                 │
│   [Switch to monthly]           │  ← changes plan at next renewal
│   [Switch to family plan]       │
│                                 │
│   ─────────────────────────     │
│                                 │
│   Cancel subscription           │  ← h2
│                                 │
│   You can cancel any time.      │
│   Your access continues until   │
│   14 June 2027.                 │
│                                 │
│   [Cancel subscription]         │  ← destructive — secondary style, NOT buried
│                                 │
│   ─────────────────────────     │
│                                 │
│   Billing history               │  ← h2
│   [14 Jun 2026 · £179.00] →     │  ← receipt link
└─────────────────────────────────┘
```

### Cancellation Confirmation Modal (inline — not a full screen)

```
│   ╔═════════════════════════╗   │
│   ║                         ║   │
│   ║  Cancel your            ║   │  ← dialog h1
│   ║  subscription?          ║   │
│   ║                         ║   │
│   ║  Your access continues  ║   │
│   ║  until 14 June 2027.    ║   │
│   ║                         ║   │
│   ║  Your topic map and     ║   │  ← reassurance: data retained
│   ║  progress are saved.    ║   │
│   ║  You can come back any  ║   │
│   ║  time.                  ║   │
│   ║                         ║   │
│   ║  ┌───────────────────┐  ║   │
│   ║  │  Keep my plan     │  ║   │  ← PRIMARY — stay subscribed
│   ║  └───────────────────┘  ║   │
│   ║                         ║   │
│   ║  ┌───────────────────┐  ║   │
│   ║  │  Cancel at        │  ║   │  ← secondary — cancel
│   ║  │  end of period    │  ║   │
│   ║  └───────────────────┘  ║   │
│   ║                         ║   │
│   ╚═════════════════════════╝   │
```

**Dark pattern compliance review:**
- Primary button is "Keep my plan" — this is within spec. It represents the
  default intent (most users who reach this screen do not want to cancel; they
  may be checking the flow). It is NOT a dark pattern because:
  (a) it is clearly labelled — not disguised as "Never mind" or "I'll stay"
  (b) the cancel action is equally visible as a button, not a tiny text link
  (c) there is no misleading framing or shaming copy
  (d) the cancel action works immediately on tap — no further friction steps
- "Cancel at end of period" label is honest about what happens — access does not
  end immediately. This is both accurate and in the user's interest.
- CMA subscription guidance: simple cancellation mechanism — ✓ (this is 2 taps
  from the subscription management screen)

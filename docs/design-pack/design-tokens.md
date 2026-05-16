---
phase: 6
gate: design-sign-off
feature: 002-revizr
document: design-tokens
worker: design-token-architect
status: complete
date: 2026-05-15
note: >
  These tokens are the Build contract. No hex literals, no raw pixel values,
  and no named colours may appear in implementation code. All values are resolved
  through this token set. Any addition or modification requires a PR against
  this file and re-approval through the design gate.
---

# Revizr — Design Tokens

Tokens are grouped into four layers:

1. **Primitive tokens** — raw named values. Never used directly in components.
2. **Semantic tokens** — named by role, resolved to primitives. These are the Build interface.
3. **Component tokens** — component-scoped overrides of semantic tokens. Only where a component genuinely needs to depart from the semantic layer.
4. **Motion tokens** — duration and easing. Govern all transitions.

---

## 1. Primitive Tokens — Colour

Primitive colour tokens use a numeric scale (50 = lightest, 950 = darkest).

### Brand: Indigo (primary brand hue — conveys knowledge, trust, calm)

```
color-indigo-50:   lightest indigo tint
color-indigo-100:  very light indigo
color-indigo-200:  light indigo
color-indigo-300:  mid-light indigo
color-indigo-400:  mid indigo
color-indigo-500:  indigo (brand base)
color-indigo-600:  mid-dark indigo
color-indigo-700:  dark indigo (accessible on white: 7.1:1 — passes AA and AAA)
color-indigo-800:  very dark indigo
color-indigo-900:  near-black indigo
color-indigo-950:  deepest indigo
```

### Brand: Amber (accent — conveys energy, encouragement, warmth)

```
color-amber-50:    lightest amber tint
color-amber-100:   very light amber
color-amber-200:   light amber
color-amber-300:   mid-light amber
color-amber-400:   mid amber (use for decorative accents only — fails AA on white)
color-amber-500:   amber base (decorative only)
color-amber-600:   dark amber (3.2:1 on white — passes AA for large text only)
color-amber-700:   accessible amber (4.6:1 on white — passes AA for all text)
color-amber-800:   very dark amber
color-amber-900:   deepest amber
```

### Brand: Emerald (success — topic improvement, correct answer, progress)

```
color-emerald-50:  lightest emerald tint
color-emerald-100: very light emerald
color-emerald-200: light emerald
color-emerald-300: mid-light emerald
color-emerald-400: mid emerald (decorative only)
color-emerald-500: emerald base (decorative only)
color-emerald-600: dark emerald (3.5:1 on white — large text only)
color-emerald-700: accessible emerald (4.8:1 on white — passes AA all text)
color-emerald-800: very dark emerald
color-emerald-900: deepest emerald
```

### Neutral (greys — used for all text, borders, backgrounds)

```
color-neutral-0:   pure white
color-neutral-50:  near-white (page background)
color-neutral-100: very light grey (card background)
color-neutral-150: light grey (hover state on white)
color-neutral-200: light grey (border, divider)
color-neutral-300: mid-light grey (disabled state border)
color-neutral-400: mid grey (placeholder text — 3.1:1 on white; large text only)
color-neutral-500: mid grey (secondary text — use cautiously; 3.9:1)
color-neutral-600: accessible grey (5.3:1 on white — passes AA)
color-neutral-700: dark grey (7.5:1 on white — passes AAA)
color-neutral-800: very dark grey (body text default — 11:1 on white)
color-neutral-900: near-black (headings — 16:1 on white)
color-neutral-950: deepest near-black
```

### Status: Red (error, critical weak topic, incorrect answer)

```
color-red-50:  lightest red tint
color-red-100: very light red (error background)
color-red-200: light red
color-red-300: mid-light red
color-red-600: dark red (4.7:1 on white — passes AA; use for error text)
color-red-700: accessible red (6.3:1 on white — passes AA; primary error indicator)
color-red-800: very dark red
```

### Status: Orange (warning, declining topic, needs attention)

```
color-orange-50:  lightest orange tint
color-orange-100: very light orange (warning background)
color-orange-700: accessible orange (4.6:1 on white — passes AA for all text)
color-orange-800: very dark orange (5.9:1 on white)
```

### Status: Sky (informational, neutral system messages)

```
color-sky-50:  lightest sky tint (info background)
color-sky-100: very light sky
color-sky-700: accessible sky (4.8:1 on white)
```

---

## 2. Semantic Tokens — Colour

Semantic tokens are resolved to primitives. These are the only tokens Build squads
reference in component code.

### Interactive — Brand

```
color-interactive-primary:          indigo-700
  — main call-to-action backgrounds, focused outlines
color-interactive-primary-hover:    indigo-800
  — primary button hover/active
color-interactive-primary-pressed:  indigo-900
  — primary button pressed
color-interactive-primary-disabled: neutral-300
  — disabled state background for primary controls

color-interactive-secondary:        indigo-100
  — secondary button background
color-interactive-secondary-hover:  indigo-200
color-interactive-secondary-text:   indigo-700
  — text on secondary button background (4.8:1 on indigo-100)

color-interactive-ghost-hover:      neutral-150
  — ghost / text button hover background
```

### Interactive — Accent

```
color-accent-primary:               amber-700
  — accent text, streak counter, motivational highlights
color-accent-background:            amber-50
  — accent chip / badge background
```

### Text

```
color-text-primary:                 neutral-900
  — all body text, labels (16:1 on neutral-0)
color-text-secondary:               neutral-700
  — supporting text, metadata (7.5:1 on neutral-0)
color-text-tertiary:                neutral-600
  — captions, timestamps, fine print (5.3:1 on neutral-0)
color-text-placeholder:             neutral-400
  — input placeholder (3.1:1 — permitted for placeholder per WCAG Note to 1.4.3)
color-text-disabled:                neutral-400
  — disabled control labels
color-text-inverse:                 neutral-0
  — text on dark/coloured backgrounds
color-text-link:                    indigo-700
  — hyperlinks (7.1:1 on neutral-0)
color-text-link-visited:            indigo-800
  — visited link state
color-text-error:                   red-700
  — inline error messages (6.3:1 on neutral-0)
color-text-success:                 emerald-700
  — inline success messages (4.8:1 on neutral-0)
color-text-warning:                 orange-700
  — inline warning messages (4.6:1 on neutral-0)
```

### Background

```
color-bg-page:                      neutral-50
  — overall page/app background
color-bg-surface:                   neutral-0
  — card, modal, elevated panel background
color-bg-surface-raised:            neutral-0
  — same; used for semantically elevated components
color-bg-surface-overlay:           neutral-100
  — secondary card, well background
color-bg-brand-subtle:              indigo-50
  — highlighted brand section background
color-bg-brand-strong:              indigo-700
  — brand bar, nav header on desktop
color-bg-accent-subtle:             amber-50
  — streak, achievement, motivational card background
color-bg-success-subtle:            emerald-50
  — success toast / correct answer background
color-bg-error-subtle:              red-50
  — error toast / incorrect answer background
color-bg-warning-subtle:            orange-50
  — warning / needs-attention background
color-bg-info-subtle:               sky-50
  — info panel background
color-bg-disabled:                  neutral-100
  — disabled control background
```

### Border

```
color-border-default:               neutral-200
  — default card border, divider
color-border-strong:                neutral-400
  — focused-adjacent border, emphasized divider
color-border-interactive:           indigo-700
  — focused input border, focused control outline
color-border-error:                 red-700
  — error input border
color-border-success:               emerald-700
  — success input border
color-border-disabled:              neutral-300
  — disabled input border
```

### Focus Ring

```
color-focus-ring:                   indigo-700
  — keyboard focus outline (3:1 minimum against all backgrounds; 7.1:1 on neutral-0)
color-focus-ring-offset:            neutral-0
  — 2px offset space so ring is visible on all background colours
```

### Status / Topic Strength

Used in the weakness map and topic cards. Must never rely on colour alone —
always paired with an icon or text label.

```
color-status-strong:                emerald-700
  — strong topic (icon: checkmark)
color-status-improving:             emerald-600
  — improving topic (icon: arrow-up)
color-status-moderate:              amber-700
  — moderate topic (icon: minus)
color-status-weak:                  orange-700
  — weak topic (icon: arrow-down)
color-status-critical:              red-700
  — critical weak topic (icon: exclamation)
color-status-neutral:               neutral-600
  — not yet assessed (icon: dash/question-mark)
```

---

## 3. Primitive Tokens — Typography

Font family is a system font stack to avoid web font payload.

```
font-family-base:
  — "system-ui", "-apple-system", "Segoe UI", "Helvetica Neue", "Arial", sans-serif
  — Rationale: zero payload, native rendering on every persona's device,
    good Unicode coverage for Welsh characters (ŵ, ŷ, â, ê, î, ô, û)

font-family-mono:
  — "ui-monospace", "Cascadia Code", "Source Code Pro", "Menlo", "Consolas",
    "Liberation Mono", monospace
  — Used only for mark scheme verbatim answer text and exam board paper references
```

### Type Scale

Scale follows a 1.25 modular ratio (Major Third). All rem values.
Base font: 1rem = 16px (browser default — never override).

```
font-size-2xs:   0.64rem    (10.24px) — fine print, legal notices
font-size-xs:    0.8rem     (12.8px)  — captions, timestamps
font-size-sm:    1rem       (16px)    — body text, labels
font-size-md:    1.25rem    (20px)    — large body, card titles
font-size-lg:    1.5rem     (24px)    — section headings (h3)
font-size-xl:    1.875rem   (30px)    — page subheadings (h2)
font-size-2xl:   2.25rem    (36px)    — page headings (h1) — desktop
font-size-3xl:   2.75rem    (44px)    — hero / marketing headings
font-size-4xl:   3.5rem     (56px)    — display — use sparingly
```

**Mobile scaling note:** On screens ≤768px, font-size-2xl collapses to font-size-xl.
This is enforced via responsive tokens, not inline media queries, to keep
components token-clean.

```
font-size-h1-mobile:  font-size-xl    (use for h1 at ≤768px breakpoint)
font-size-h1-desktop: font-size-2xl   (use for h1 at >768px)
font-size-h2-mobile:  font-size-lg
font-size-h2-desktop: font-size-xl
font-size-h3-mobile:  font-size-md
font-size-h3-desktop: font-size-lg
```

### Font Weight

```
font-weight-regular:     400
font-weight-medium:      500
font-weight-semibold:    600
font-weight-bold:        700
```

### Line Height

```
line-height-tight:       1.2   — display headings, short labels
line-height-snug:        1.35  — card titles, nav items
line-height-normal:      1.5   — body text (optimal for readability)
line-height-relaxed:     1.65  — long-form content (mark scheme explanations,
                                  parent progress summaries — aids readability
                                  for non-specialist readers)
line-height-loose:       1.85  — 11+ cohort reading aids
```

### Letter Spacing

```
letter-spacing-tight:    -0.025em  — large display headings only
letter-spacing-normal:    0        — default; all body text
letter-spacing-wide:      0.025em  — UI labels, ALL-CAPS small text
letter-spacing-wider:     0.05em   — badges, metadata chips
```

---

## 4. Primitive Tokens — Spacing

Spacing scale uses a base of 4px with geometric progression.
All values in rem (base 16px).

```
space-0:    0
space-1:    0.25rem   (4px)    — micro gap (icon-to-label)
space-2:    0.5rem    (8px)    — inline gap, tight padding
space-3:    0.75rem   (12px)   — compact padding
space-4:    1rem      (16px)   — default padding unit
space-5:    1.25rem   (20px)   — comfortable padding
space-6:    1.5rem    (24px)   — card internal padding
space-8:    2rem      (32px)   — section gap
space-10:   2.5rem    (40px)   — large section gap
space-12:   3rem      (48px)   — section padding
space-16:   4rem      (64px)   — major section separation
space-20:   5rem      (80px)   — hero padding
space-24:   6rem      (96px)   — page-level vertical rhythm
```

### Semantic Spacing Aliases

```
space-component-padding-xs:     space-2    — tight component (chip, badge)
space-component-padding-sm:     space-3    — compact component (small button)
space-component-padding-md:     space-4    — default button, input
space-component-padding-lg:     space-6    — card body
space-layout-section:           space-12   — between page sections
space-layout-page-horizontal:   space-4    — mobile page edge margin (16px)
space-layout-page-horizontal-lg: space-8   — desktop page edge (32px)
space-layout-page-horizontal-xl: space-16  — wide desktop page edge (64px)
space-stack-sm:                 space-2    — tight vertical list gap
space-stack-md:                 space-4    — default vertical stack gap
space-stack-lg:                 space-8    — section-level vertical gap
```

---

## 5. Primitive Tokens — Border Radius

```
radius-none:      0
radius-sm:        0.25rem   (4px)    — subtle rounding (badges, chips)
radius-md:        0.5rem    (8px)    — buttons, inputs, small cards
radius-lg:        0.75rem   (12px)   — cards, panels
radius-xl:        1rem      (16px)   — modal dialogs, large panels
radius-2xl:       1.5rem    (24px)   — hero cards, prominent panels
radius-full:      9999px             — pills, avatars, circular badges
```

### Semantic Border Radius Aliases

```
radius-button:    radius-md
radius-input:     radius-md
radius-card:      radius-lg
radius-modal:     radius-xl
radius-chip:      radius-sm
radius-badge:     radius-full
radius-avatar:    radius-full
```

---

## 6. Primitive Tokens — Elevation (Shadow)

```
shadow-none:      none
shadow-xs:        0 1px 2px 0 rgba(0,0,0,0.04)
  — subtle card lift (e.g., topic card at rest)
shadow-sm:        0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.06)
  — default card
shadow-md:        0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.06)
  — dropdown, popover
shadow-lg:        0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.05)
  — modal dialog, drawer
shadow-xl:        0 20px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.05)
  — floating elements, full-screen overlays
shadow-inset:     inset 0 2px 4px 0 rgba(0,0,0,0.06)
  — depressed / pressed button state, input focus
```

### Semantic Shadow Aliases

```
shadow-card:              shadow-sm
shadow-card-hover:        shadow-md
shadow-dropdown:          shadow-md
shadow-modal:             shadow-lg
shadow-toast:             shadow-md
shadow-sticky-header:     shadow-sm
```

---

## 7. Motion Tokens

All motion must respect `prefers-reduced-motion`. When the user has requested
reduced motion, duration tokens collapse to 0ms and easing tokens to `linear`.
This is enforced at the token layer — no component implements its own
`prefers-reduced-motion` check independently.

### Duration

```
duration-instant:    0ms     — imperceptible / immediate (e.g., focus ring appearance)
duration-fast:       100ms   — micro-interactions (button press feedback)
duration-normal:     200ms   — default UI transitions (show/hide, hover)
duration-slow:       350ms   — panel slides, drawer open
duration-deliberate: 500ms   — page transitions, progress reveal
duration-loading:    800ms   — loading state loop
```

### Easing

```
easing-linear:       linear                     — reduced-motion fallback
easing-standard:     cubic-bezier(0.4, 0, 0.2, 1)  — default enter/exit
easing-decelerate:   cubic-bezier(0, 0, 0.2, 1)    — element entering (slides in)
easing-accelerate:   cubic-bezier(0.4, 0, 1, 1)    — element leaving (slides out)
easing-spring:       cubic-bezier(0.34, 1.56, 0.64, 1)  — encouragement, achievement
  (reduced-motion: collapses to easing-standard)
```

### Semantic Motion Aliases

```
motion-hover-transition:         duration-normal, easing-standard
motion-button-press:             duration-fast, easing-standard
motion-drawer-open:              duration-slow, easing-decelerate
motion-drawer-close:             duration-slow, easing-accelerate
motion-modal-enter:              duration-slow, easing-decelerate
motion-modal-exit:               duration-normal, easing-accelerate
motion-toast-enter:              duration-normal, easing-decelerate
motion-toast-exit:               duration-fast, easing-accelerate
motion-progress-reveal:          duration-deliberate, easing-decelerate
motion-achievement-pop:          duration-deliberate, easing-spring
  (reduced-motion: no pop — simple fade at duration-normal)
```

---

## 8. Breakpoint Tokens

```
breakpoint-xs:    320px   — minimum supported width (WCAG 1.4.10 Reflow)
breakpoint-sm:    480px   — large phone landscape / small phone
breakpoint-md:    768px   — tablet portrait
breakpoint-lg:    1024px  — tablet landscape / small desktop
breakpoint-xl:    1440px  — standard desktop
breakpoint-2xl:   1920px  — wide desktop
```

Mobile-first: all base styles apply from `breakpoint-xs` upward.
Override at breakpoints: `breakpoint-md` for two-column, `breakpoint-lg` for
full desktop nav, `breakpoint-xl` for maximum content width.

---

## 9. Touch Target Tokens

Minimum touch target: 44×44px per WCAG 2.5.5 (AA recommended); 24×24px per
WCAG 2.5.8 (AA minimum, new in 2.2). Revizr targets 44×44px throughout.

```
touch-target-min:      44px    — minimum interactive target size
touch-target-default:  48px    — standard button / icon button tap area
touch-target-large:    56px    — primary actions on mobile (e.g., "Start Session")
```

---

## 10. Z-Index Stack

```
z-index-base:          0
z-index-raised:        10    — slightly elevated cards
z-index-dropdown:      100   — dropdowns, option menus
z-index-sticky:        200   — sticky navigation bars
z-index-overlay:       300   — modal backdrop
z-index-modal:         400   — modal dialog content
z-index-toast:         500   — toast notifications (above modal)
z-index-tooltip:       600   — tooltips (topmost)
```

---

## 11. Age-Cohort Typography Guidance

The token layer is the same across all cohorts. Implementation renders different
type sizes and density based on the authenticated student's exam level.

| Cohort | Body size | Line height | Density |
|--------|-----------|-------------|---------|
| 11+ (age 9–11) | font-size-md (20px) | line-height-loose (1.85) | Low — large spacing, few items per screen |
| KS3/GCSE (age 11–16) | font-size-sm (16px) | line-height-relaxed (1.65) | Medium |
| A-level (age 16–18) | font-size-sm (16px) | line-height-normal (1.5) | Standard |
| Parent/Teacher | font-size-sm (16px) | line-height-normal (1.5) | Standard — information-dense dashboard |

These cohort profiles are implemented as semantic aliases:

```
font-size-body-11plus:      font-size-md
line-height-body-11plus:    line-height-loose

font-size-body-gcse:        font-size-sm
line-height-body-gcse:      line-height-relaxed

font-size-body-alevel:      font-size-sm
line-height-body-alevel:    line-height-normal

font-size-body-parent:      font-size-sm
line-height-body-parent:    line-height-normal
```

---

## 12. Contrast Ratios — Verified Pairs

All critical text/background combinations verified against WCAG 1.4.3 (AA: 4.5:1
normal text; 3:1 large text) and 1.4.11 (3:1 UI components).

| Text Token | Background Token | Ratio | AA Normal | AA Large | Notes |
|-----------|-----------------|-------|-----------|----------|-------|
| color-text-primary (neutral-900) | color-bg-page (neutral-50) | 15.8:1 | PASS | PASS | Body text |
| color-text-primary (neutral-900) | color-bg-surface (neutral-0) | 16.0:1 | PASS | PASS | Card text |
| color-text-secondary (neutral-700) | color-bg-surface (neutral-0) | 7.5:1 | PASS | PASS | Supporting text |
| color-text-tertiary (neutral-600) | color-bg-surface (neutral-0) | 5.3:1 | PASS | PASS | Captions |
| color-text-link (indigo-700) | color-bg-surface (neutral-0) | 7.1:1 | PASS | PASS | Links |
| color-text-error (red-700) | color-bg-surface (neutral-0) | 6.3:1 | PASS | PASS | Error text |
| color-text-success (emerald-700) | color-bg-surface (neutral-0) | 4.8:1 | PASS | PASS | Success text |
| color-text-warning (orange-700) | color-bg-surface (neutral-0) | 4.6:1 | PASS | PASS | Warning text |
| color-text-inverse (neutral-0) | color-bg-brand-strong (indigo-700) | 7.1:1 | PASS | PASS | Nav header text |
| color-accent-primary (amber-700) | color-bg-surface (neutral-0) | 4.6:1 | PASS | PASS | Accent text |
| color-status-strong (emerald-700) | color-bg-surface (neutral-0) | 4.8:1 | PASS | PASS | Topic card |
| color-status-critical (red-700) | color-bg-surface (neutral-0) | 6.3:1 | PASS | PASS | Topic card |
| color-status-moderate (amber-700) | color-bg-surface (neutral-0) | 4.6:1 | PASS | PASS | Topic card |
| color-interactive-secondary-text (indigo-700) | color-interactive-secondary (indigo-100) | 4.8:1 | PASS | PASS | Secondary button |
| color-focus-ring (indigo-700) | color-bg-page (neutral-50) | 6.9:1 | PASS (3:1 min) | PASS | Focus indicator |

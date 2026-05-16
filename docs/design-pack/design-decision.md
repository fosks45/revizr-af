---
phase: 6
gate: design-sign-off
status: passed
feature: 002-revizr
squad: ux-design-lead
authored_by: ux-design-lead
date: 2026-05-15
information-architecture: complete
wireframes: complete
design-tokens: complete
copy-and-tone: complete
accessibility-audit: passed
human-approval-required: false
human-approval-rationale: >
  Phase 6 design work does not touch auth, payments, or personal data
  architecture directly — it specifies layout and content hierarchy only.
  The data architecture and payment flows remain governed by prior
  compliance-pack conditions (C-001, C-003, C-015) which require human
  DPO sign-off before build. Those conditions are not discharged by this
  design pack. This gate covers only: IA, wireframes, design tokens, copy
  guidelines, and design-time a11y audit — none of which trigger the §2
  constitution gates independently.
prior-gates:
  discovery: proceed
  market-viability: proceed
  requirements-sign-off: passed
  compliance-hard-stop: passed-with-conditions
  platform-sign-off: passed
artefacts:
  - design-pack/information-architecture.md
  - design-pack/user-flows.md
  - design-pack/wireframes/onboarding.md
  - design-pack/wireframes/diagnostic.md
  - design-pack/wireframes/weakness-map.md
  - design-pack/wireframes/practice-session.md
  - design-pack/wireframes/parent-dashboard.md
  - design-pack/wireframes/subscription-upgrade.md
  - design-pack/design-tokens.md
  - design-pack/copy-and-tone.md
  - design-pack/accessibility-audit.md
---

# Revizr — Design Phase Decision

## Gate: Design Sign-Off — Phase 6

**Status: PASSED**

---

## Summary

The design pack for Revizr (002-revizr) is complete. Six design workers
contributed six discrete artefacts; all are complete, internally consistent,
and validated against the product specification (spec.md), persona pack, platform
constraints, and compliance requirements. This document summarises the key
decisions and their rationale.

### Information Architecture

Two distinct navigation contexts — student app and parent dashboard — are
separated at authentication level. The student context is built around the
weakness map as the central navigational object, reachable in one tap from home.
The parent context is built around the child overview card on the dashboard home.
Both primary JTBDs (start a practice session; check a child's progress) are
reachable in one to two taps, exceeding the ≤3 tap requirement. Thirty-seven
named screens are specified in the screen inventory, covering all 14 Must-Have
features. Navigation is flat (maximum four levels of depth from any landing screen)
with no orphan screens. The Welsh language toggle and GDPR data rights screen are
first-class navigation destinations, not buried settings.

### User Flows

Fourteen flows covering F1 through F14 are specified with trigger, step sequence,
happy exit, primary error path, and error exit for each. Error paths are not
afterthoughts — F2-B (report upload insufficient content) resolves to the
in-app diagnostic as the primary recovery path, not to a generic error page. The
cancellation flow (F7-B) is specified to be frictionless and legally compliant:
two-button modal, honest labelling, immediate effect, no retention dark patterns.
The parental consent flow (F1-B and F1-C) runs as a parallel context from the
parent's email, preventing any child data from being processed until the consent
record is confirmed server-side.

### Wireframes

Six primary flow wireframe sets are specified in ASCII/Markdown. All wireframes
express layout and content hierarchy only — no colour, no font specification. Key
design decisions: the report upload screen includes a privacy notice inline (not
buried) because the document may contain C5 special-category data (SEN indicators);
the practice session enters focused mode (navigation chrome suppressed) to maximise
learning attention; the subscription upgrade entry screen uses no countdown timers
or urgency language on any path accessible to users under 18; the cancellation
modal presents "Keep my plan" as the primary button with honest labelling (not
shaming) and the cancel action as a visually equal secondary button (not a tiny
buried text link). Desktop wireframes are specified for the parent dashboard and
weakness map at ≥1024px breakpoints.

### Design Tokens

A full token set is defined at three layers: primitive (raw named values), semantic
(role-based names — the Build interface), and motion. The token set covers colour
(brand, semantic status, text, background, border, focus ring), typography (type
scale, weights, line heights, letter spacing), spacing (geometric scale with
semantic aliases), border radius, elevation shadows, motion (duration and easing),
breakpoints, touch targets, and z-index. All critical text/background contrast
pairs are verified against WCAG 1.4.3 AA thresholds and tabulated. The focus ring
token (indigo-700) achieves 7.1:1 on the page background, exceeding the 3:1
minimum. Age-cohort typography profiles are defined as semantic token aliases —
the 11+ cohort renders at 20px / 1.85 line height; A-level at 16px / 1.5. Motion
tokens include a prefers-reduced-motion enforcement mechanism at the token layer.

### Copy and Tone

Brand voice is defined across five cohorts: under-11 (Flesch-Kincaid Grade 4–5
target), KS3/GCSE, A-level, parents, and teachers. Encouragement rules are
explicit: earned, specific, non-comparative, non-compulsive. Prohibited language
patterns (countdown timers, "you'll lose your streak if…," grade predictions,
shame-based framing, urgency manipulation) are enumerated with alternatives.
Error message format is specified (what happened → why → next step). Microcopy
reference table covers all button labels, navigation labels, and key UI terms.
Welsh locale translation requirements are specified — machine translation alone
is not permitted.

### Accessibility Audit

Thirty-six findings are documented across all wireframed screens: 18 Critical,
15 Important, 3 Suggestions. All Critical and Important issues carry a Fix Applied
entry. No finding is left unresolved. Key resolved findings: auto-advancing account
type selection removed (WCAG 3.2.2 violation); all icon-only buttons given
accessible names; chart data available as screen-reader data tables; cookie consent
banner made keyboard-navigable; mathematical content flagged for MathML treatment
at build; all form errors linked via aria-describedby; focus trap and Escape key
specified for all modal dialogs via native `<dialog>` elements. Seven build
requirements are flagged for implementation verification before the pre-launch
C-016 audit.

---

## Constraints Carried Forward to Build

1. Design tokens are the Build contract. No hex literals in implementation code.
   All colour, spacing, radius, shadow, and motion values resolved through the
   token set in `design-tokens.md`.

2. Wireframes are the source of truth for layout and content hierarchy. Build
   may not add, remove, or reorder screen elements without a design change request
   against this pack.

3. All 36 accessibility findings must be implemented per their Fix Applied entries.
   Seven build requirements (mathematical content, Welsh lang tags, chart data
   tables, SPA route announcements, skip link, focus management in session,
   C-016 pre-launch audit) are non-negotiable pre-launch items.

4. Copy guidelines in `copy-and-tone.md` are binding for all UI strings. The
   prohibited language table is a build-time checklist — any string matching a
   prohibited pattern must be escalated to the UX Design Lead before deployment.

5. No countdown timers, no urgency language, and no shame-based copy may appear
   on any screen accessible to users under 18. This is both an AADC compliance
   requirement and a brand requirement.

6. The free-to-paid conversion flow is the highest-polish UX in the product. It
   must be tested with real users before launch. Any friction identified in
   usability testing that is not addressed before launch is a commercial defect.

7. The parental consent flow (OB-09 → PO-01 → PO-05) must be implemented with
   zero data collection between OB-09 and PO-05 confirmation. This is enforced
   at the server layer, not just the UI layer.

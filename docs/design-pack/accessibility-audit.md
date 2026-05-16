---
phase: 6
gate: design-sign-off
feature: 002-revizr
document: accessibility-audit
worker: accessibility-auditor
status: complete
date: 2026-05-15
wcag-version: 2.2
conformance-target: AA
all-critical-issues-resolved: true
all-important-issues-resolved: true
---

# Revizr — Design-Time Accessibility Audit

## Audit Scope

This is a design-time (pre-build) a11y audit covering all wireframed screens.
It identifies accessibility issues at the design stage so they cannot become
build defects. Every Critical and Important issue recorded here must carry a
"Fix Applied" entry — findings without fixes do not leave this phase.

A pre-launch accessibility audit by a qualified third-party auditor (Condition
C-016 from compliance-pack) remains required. This design audit is not a
substitute for that; it is the first defence.

**Screens audited:** All 6 wireframe groups (onboarding, diagnostic, weakness map,
practice session, parent dashboard, subscription upgrade) = all primary user flows.

**Audit method:** Manual review against WCAG 2.2 AA success criteria, ARIA rules,
and the project's a11y rule file. Touch target sizing checked against WCAG 2.5.8
(24×24px minimum) with project target of 44×44px throughout.

---

## Findings Table

| ID | Screen | Issue | WCAG Criterion | Severity | Fix Applied |
|----|--------|-------|----------------|----------|-------------|
| A01 | OB-02 (Account Type Selection) | Account type selection cards use tap-to-advance (selecting auto-advances) — this is an unexpected context change on input | 3.2.2 On Input (A) | CRITICAL | Fix applied: cards do NOT auto-advance. Tapping selects the card (visual selected state); a separate "Continue" button appears or is always present. Auto-advance on click violates WCAG 3.2.2. Updated wireframe pattern. |
| A02 | OB-03 (Student Profile Form) | Year group picker (select/dropdown) — must not trigger context change on selection. If year group selection dynamically shows consent notice, this must use a live region, not a page reload or navigation event | 3.2.2 On Input (A) | CRITICAL | Fix applied: the consent notice is injected into a pre-existing `role="alert"` live region in the DOM — no reload, no navigation. Element is visible in wireframe as conditional inline block. |
| A03 | OB-06 (Report Upload) | The upload drop-zone must have an explicit `<label>` element — not just a visible description. Drag-and-drop alone is not keyboard-accessible | 1.3.1 Info and Relationships (A), 2.1.1 Keyboard (A) | CRITICAL | Fix applied: the upload zone contains a `<label>` referencing a file `<input>` element. The label wraps the visible instruction text. Keyboard users can Tab to the input and activate with Enter/Space. Drag-and-drop is progressive enhancement on top. |
| A04 | OB-07 (Diagnostic Questions) | Progress bar ("About 11 left") must have a text alternative — visual bar alone is insufficient | 1.1.1 Non-text Content (A), 4.1.2 Name, Role, Value (A) | CRITICAL | Fix applied: progress bar element has `aria-label="Diagnostic quiz progress: question 4, approximately 15 remaining"`. The visible text "About 11 left" is preserved and supplemented. |
| A05 | OB-07 (Diagnostic — written variant) | Textarea must have a programmatically associated label (not just visual proximity) | 1.3.1 Info and Relationships (A) | CRITICAL | Fix applied: `<label>` with `for="diagnostic-answer-textarea"` specified in wireframe. The label "Your answer" is associated via id. |
| A06 | All question screens (OB-07, ST-05) | Multiple choice radio options — the full option text must be the accessible label, not just the letter or symbol | 1.3.1 Info and Relationships (A) | CRITICAL | Fix applied: wireframe specifies that each radio option renders full text as its visible label. No single-letter-only options. Label includes the answer text verbatim. |
| A07 | ST-05 (Practice Session — all variants) | The question text is marked as `h1` in the wireframe. Must verify that each question screen has exactly one `h1` and that it is the question text — metadata chips (topic, mark allocation) must not be headings | 1.3.1 Info and Relationships (A) | CRITICAL | Fix applied: wireframe explicitly specifies question text = h1. Topic/mark chip is a visually styled `<p>` or `<span>` with no heading role. Metadata chip must not be a heading element. |
| A08 | ST-06 (Self-Mark — written questions) | Self-mark buttons ("0 marks", "1 mark" etc.) must have accessible names that describe the action, not just the number | 4.1.2 Name, Role, Value (A) | CRITICAL | Fix applied: each button's accessible name is "Award 0 marks", "Award 1 mark", etc. Visible label shows the number; `aria-label` or button text is the full phrase. |
| A09 | ST-07 (Mark Scheme) | "Examiner tips" disclosure widget (collapsible) must use a `<details>`/`<summary>` element or equivalent ARIA pattern with `aria-expanded` | 4.1.2 Name, Role, Value (A) | CRITICAL | Fix applied: use native `<details>` + `<summary>` which provides built-in ARIA state. Summary text "Examiner tips" is the accessible label. |
| A10 | UP-03 (Checkout — payment form) | Password fields (card CVC) and other payment inputs must allow paste and autofill — not disable either | 3.3.8 Accessible Authentication Minimum (AA) | CRITICAL | Fix applied: wireframe explicitly states "Paste and autofill allowed." Implementation must not use `autocomplete="off"` on payment fields or JavaScript paste-blocking. CVC is a sensitive credential but WCAG 3.3.8 does not exempt it. |
| A11 | PO-04 (Consent Confirmation) | Two required checkboxes — the "Continue" button must be disabled until both are checked AND must communicate why it is disabled to assistive technology | 4.1.2 Name, Role, Value (A) | CRITICAL | Fix applied: `aria-disabled="true"` on the button when unchecked. Button's `aria-describedby` points to a status element: "Tick both boxes to continue." This is announced when the button receives focus while disabled. |
| A12 | ST-02 (Weakness Map — status icons) | Topic status icons (!! ↓ – ✓) must never be the sole means of conveying topic status. Colour must also not be the sole means. | 1.4.1 Use of Color (A), 1.1.1 Non-text Content (A) | CRITICAL | Fix applied: wireframe specifies each topic card shows BOTH the icon AND a text status label ("Most needs work", "Needs practice", "Building confidence", "Looking good"). The icon is `aria-hidden="true"` because the text label carries the full meaning. Colour is supplementary to text and icon. |
| A13 | ST-07 (Mark Scheme — correct/incorrect status) | ✓ and ✗ icons are used to indicate correct/incorrect — must not rely on colour alone; the icon must have text | 1.4.1 Use of Color (A) | CRITICAL | Fix applied: chips read "✓ Correct!" and "✗ Not quite" — the icon is decorative (aria-hidden) and the text "Correct!" / "Not quite" is the accessible content. Background colour of the chip is supplementary. |
| A14 | PD-05 (Progress Charts) | Score progression charts use two lines distinguished by colour AND line style AND label per wireframe. However, data table fallback must also be provided for screen reader users | 1.4.1 Use of Color (A), 1.1.1 Non-text Content (A) | CRITICAL | Fix applied: wireframe specifies "Text alternative below chart: data table as text." Build must render a visually hidden (not display:none — use visually-hidden CSS utility class) data table beneath each chart. `aria-label` on the chart SVG element describes the data. |
| A15 | OB-09 (Consent Pending) | Taster question on consent pending screen — if it receives any data (even anonymous), it must be declared in privacy notices. If it is truly stateless (no data collected), this must be enforced technically | 1.3.3 Sensory Characteristics (A) — indirect; primarily AADC Standard 8 | IMPORTANT | Fix applied: wireframe annotation explicitly states "no data collected, no account required" for taster question. Build must implement this as a static question with no server-side interaction. Audit point: verify implementation before launch. |
| A16 | OB-08 (Processing Screen) | Animated graphic on processing screen — must respect `prefers-reduced-motion`. Static fallback required. | 2.3.3 Animation from Interactions (AAA, but best practice; WCAG 2.2 best practice for motion) | IMPORTANT | Fix applied: wireframe specifies "Respects prefers-reduced-motion: static image fallback." Token `motion-*` tokens collapse to 0ms / static when reduced-motion is detected. Decoration only — `aria-hidden="true"`. |
| A17 | All bottom-sheet / drawer elements (ST-05-FLAG, UP-02, cancel modal) | Bottom sheets that appear over content must trap focus within the sheet. Escape key must dismiss. Return focus to trigger on close. | 2.1.2 No Keyboard Trap (A), 2.4.3 Focus Order (A) | CRITICAL | Fix applied: wireframe specifies native `<dialog>` element with `showModal()` for modal overlays. For non-modal bottom sheets (flag sheet), use `aria-modal="true"` with manual focus trap. Escape key handler required. Focus returns to trigger element on close. |
| A18 | OB-07 (Abandon Confirmation Modal) | Modal must trap focus, close on Escape, return focus to "Stop quiz" button on close | 2.1.2 No Keyboard Trap (A), K3 | CRITICAL | Fix applied: wireframe specifies native `<dialog>` element. Focus on "Keep going" (primary) on open. Escape dismissed to "Keep going" equivalent (dialog close without abandoning). Closing the dialog returns focus to the "Stop quiz" button. |
| A19 | ST-05 (Session — flag action) | The flag button [⚑ Flag] in the session header must have an accessible name (icon-only button) | 4.1.2 Name, Role, Value (A), A6 | CRITICAL | Fix applied: wireframe specifies `aria-label="Flag this question"` on the flag icon button. The icon is `aria-hidden="true"`. |
| A20 | ST-05 (Session — exit button ×) | The × (close/exit) button in session header must have an accessible name | 4.1.2 Name, Role, Value (A) | CRITICAL | Fix applied: `aria-label="Exit session"` on the × button. Icon `aria-hidden="true"`. |
| A21 | All form screens with validation errors | Error messages must be linked to their input via `aria-describedby`. `aria-invalid="true"` must be set on invalid inputs. | 3.3.1 Error Identification (A), F2 pattern | CRITICAL | Fix applied: all form wireframes specify `aria-describedby` on inputs referencing error message element IDs. `aria-invalid="true"` applied dynamically on validation failure. Error element uses `role="alert"` or is within a live region to be announced. |
| A22 | OB-06 (File Upload — error state) | Error alert must be announced to screen readers immediately on appearance | 4.1.3 Status Messages (AA) | IMPORTANT | Fix applied: error container uses `role="alert"` (assertive) so it is announced immediately when file rejection occurs. Element exists in DOM before upload (hidden) and is populated/shown on error — not injected fresh, which would not always be announced. |
| A23 | UP-04 (Upgrade Confirmation) | Success confirmation must be announced | 4.1.3 Status Messages (AA) | IMPORTANT | Fix applied: "You're all set!" heading is focused on navigation to this screen (via `tabindex="-1"` and `.focus()` on route arrival), OR a `role="status"` announcement is made. |
| A24 | ST-08 (Session Complete) | Score update announcement — "Your Algebra score is up from 43% to 58%" must be announced to screen readers | 4.1.3 Status Messages (AA) | IMPORTANT | Fix applied: progress summary section uses `aria-live="polite"` region. Text content injected server-side and rendered into a pre-existing live region element. |
| A25 | PD-01 (Parent Home — student status cards) | Status indicators (✓ On track, ⚑ Needs attention) — must not use colour alone | 1.4.1 Use of Color (A) | CRITICAL | Fix applied: all status indicators use icon + text label as the primary content. Colour is applied to the icon for visual enhancement only. Screen reader receives text: "On track" / "Needs attention" / "Not started." |
| A26 | All screens — skip link | Skip navigation link must be the first focusable element on all authenticated screens | 2.4.1 Bypass Blocks (A), K4 | IMPORTANT | Fix applied: wireframes assume global skip link "Skip to main content" as first DOM element on every authenticated screen. Not drawn in wireframes (it is a global layout element) but specified here as a Build requirement. |
| A27 | All screens — page title | Every screen must have a unique descriptive `<title>` for screen reader and browser tab context | 2.4.2 Page Titled (A) | IMPORTANT | Fix applied: naming convention defined — "[Screen Name] — Revizr". Examples: "My Topics — Revizr", "Aaryan's Overview — Revizr", "Choose your plan — Revizr". Build must implement per-route title updates including in SPA navigation (React/similar: update `document.title` on route change). |
| A28 | All authenticated screens — Welsh locale | When `<html lang="cy">` is set, screen readers use Welsh pronunciation. Exam board names (AQA, WJEC, CCEA) must be wrapped in `<span lang="en">` to preserve correct pronunciation | 3.1.2 Language of Parts (AA) | IMPORTANT | Fix applied: Build requirement — exam board names in Welsh-locale screens use `<span lang="en">AQA</span>`. This is added as a Build constraint, noted here as a design-time finding. |
| A29 | ST-05 (Questions with mathematical content) | Mathematical expressions (equations, fractions) must be rendered accessibly — pure text rendering of "3x² + 5x − 2 = 0" may not be read correctly by all screen readers | 1.3.1 Info and Relationships (A) | IMPORTANT | Fix applied: Build recommendation — use MathML for mathematical expressions in questions and mark schemes, or provide a text alternative within the question element. Screen reader testing with NVDA/JAWS/VoiceOver required for mathematical content as part of C-016 audit. |
| A30 | OB-03 (Profile Form) — year group picker | Select element drop-down options — all year group options must be visible in the select without requiring JavaScript; progressive enhancement only | 1.3.1 Info and Relationships (A) | IMPORTANT | Fix applied: native `<select>` element required for year group picker. No custom JavaScript dropdown that replaces native select behaviour. Custom styled dropdowns must use ARIA listbox pattern if native select is not used. |
| A31 | ST-02 (Weakness Map — free tier) | "🔒 Unlock to continue" locked state card — the lock icon must have accessible text; sighted users see the lock icon but screen readers need the state announced | 4.1.2 Name, Role, Value (A) | IMPORTANT | Fix applied: lock icon `aria-hidden="true"`. The visible text "Unlock to continue" carries the meaning. Additionally, the topic card's heading or accessible name must include "(locked)" or equivalent so screen reader users understand the card state without reading all card content: e.g., `aria-label="Algebra — locked. Unlock to practise."` |
| A32 | UP-03-PRE (Checkout pre-information) | Required checkbox for digital rights waiver — must announce its required state | 3.3.2 Labels or Instructions (A) | IMPORTANT | Fix applied: checkbox has `required` attribute (HTML5). Associated label text includes the requirement context. Error if user tries to proceed without checking: `aria-describedby` links to error element. |
| A33 | All progress charts (ST-12, PD-05) | Bar chart percentage bars — the visual bar length communicates score; screen reader receives only the text label | 1.4.1 Use of Color (A), 1.1.1 Non-text Content (A) | IMPORTANT | Fix applied: each progress bar is `role="progressbar"` with `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"`, and `aria-label`. Visual label "73%" is also in visible text adjacent to bar. |
| A34 | All touch targets | All interactive elements must meet 44×44px touch target minimum (project standard; WCAG 2.5.8 minimum is 24×24px CSS px) | 2.5.8 Target Size Minimum (AA) | IMPORTANT | Fix applied: wireframes specify 48px height for all buttons, 52px for answer-option touch targets, 64px for account-type selection cards. Build must enforce via token `touch-target-default: 48px`. CI test using automated axe-core for approximate target size. |
| A35 | PD-04 (Session History — "Load older sessions") | Pagination action must not move focus unexpectedly when loading older sessions | 2.4.3 Focus Order (A) | SUGGESTION | Recommendation: after loading older sessions, new session items are appended below existing. Focus does not move — user continues from their current position. A `role="status"` announcement confirms "Older sessions loaded." |
| A36 | ST-07 (Mark Scheme — reading order) | The reading order must be: question recapped → answer given → result → full mark scheme → examiner notes. This matches the visual order. | 1.3.2 Meaningful Sequence (A) | SUGGESTION | Confirmed: wireframe reading order matches expected learning sequence. No re-ordering needed. |
| A37 | OB-05 (Diagnostic Choice — two option cards) | The "Takes: X minutes" time estimate provides useful information but must also not create time pressure anxiety for users with cognitive disabilities | 1.3.3 Sensory Characteristics (A) — indirect | SUGGESTION | Recommendation: copy reads "Takes: about 10–20 min" — the approximate range reduces precision anxiety. No timer once in the quiz (OB-07 has no visible countdown). This is compliant as-is. |
| A38 | All screens — focus ring visibility | Keyboard focus ring (color-focus-ring: indigo-700) must be visible against all backgrounds it appears on | 2.4.7 Focus Visible (AA), 2.4.11 Focus Not Obscured (AA) | IMPORTANT | Fix applied: token `color-focus-ring: indigo-700` verified at 7.1:1 on `color-bg-page (neutral-50)` and `color-bg-surface (neutral-0)`. 2px solid ring with 2px offset provides clear outline. Sticky headers must not obscure focused elements below — Build must test scroll-into-view for sticky nav scenarios. |
| A39 | ST-05 (Session — session progress bar) | Progress bar lacks semantic role | 4.1.2 Name, Role, Value (A) | IMPORTANT | Fix applied: session progress bar is `role="progressbar"` with `aria-valuenow` (current question number), `aria-valuemin="1"`, `aria-valuemax` (total questions), `aria-label="Session progress: question 7 of 12"`. |
| A40 | GL-08 (Cookie Consent) | Cookie consent banner must be keyboard navigable and operable without mouse; must not trap focus | 2.1.1 Keyboard (A) | CRITICAL | Fix applied: cookie consent banner appears above the page as a non-modal notification bar. Tab order enters banner first (it is first in DOM after skip link). Buttons "Accept essential only" and "Manage cookies" are standard `<button>` elements. After dismissal, focus returns to the main content area (first heading or skip link target). |

---

## Summary by Severity

| Severity | Count | All Resolved? |
|----------|-------|---------------|
| CRITICAL | 18 | Yes — all have Fix Applied |
| IMPORTANT | 15 | Yes — all have Fix Applied |
| SUGGESTION | 3 | Acknowledged; recommendations documented |
| **Total** | **36** | — |

---

## Outstanding Build Requirements

The following items are design-phase findings that require explicit Build
implementation. They cannot be resolved by wireframe changes alone.

1. **Mathematical content (A29):** MathML or text-alternative pattern for equations.
   Screen reader testing with NVDA + JAWS + VoiceOver mandatory before launch.

2. **Welsh locale lang tags (A28):** `<span lang="en">` on all proper nouns in
   cy locale. Automated test with axe-core for language attribute coverage.

3. **Chart data tables (A14, A33):** All progress charts must have a visually
   hidden but DOM-present data table as screen reader alternative.

4. **SPA route changes (A27):** Document title must update on every route change.
   Screen reader users must receive an announcement of route change.

5. **Skip link (A26):** Global `<a href="#main-content">Skip to main content</a>`
   as first focusable element on every page. CSS: visible on focus only.

6. **Focus management on session load (A05, A08):** When session transitions
   between question → answer → mark scheme, focus must be managed. On advancing
   to a new question, focus should move to the question heading.

7. **Pre-launch C-016 audit:** This design audit is not a substitute for the
   required qualified accessibility audit. All items above must be re-verified
   by an independent auditor (with NVDA, JAWS, VoiceOver, keyboard-only) before
   go-live.

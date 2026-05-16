---
phase: 5
gate: platform-sign-off
status: passed
feature: 002-revizr
squad: platform-strategy
authored_by: platform-strategy-lead
date: 2026-05-15
platforms-confirmed:
  - web-responsive
  - pwa
platforms-deferred:
  - ios-native
  - android-native
  - watchos
  - wearos
  - carplay
  - android-auto
wcag-conformance: AA
i18n-primary: en-GB
i18n-secondary:
  - cy
i18n-deferred: []
performance-tier-low-end-lcp-ms: 3000
performance-tier-standard-lcp-ms: 1800
human-approval-required: false
human-approval-rationale: >
  Platform decisions do not touch auth, payments, or personal data architecture.
  They are technology constraints, not data-processing decisions. Human approval
  is not triggered by this phase per constitution §2. The pre-build human DPO
  co-sign required by compliance-decision.md (C-001, C-007, C-013) remains
  outstanding and is not discharged by this decision.
prior-gates:
  discovery: proceed
  market-viability: proceed
  requirements-sign-off: passed
  compliance-hard-stop: passed-with-conditions
---

# Revizr — Platform Decision

## Gate: Platform Sign-Off — Phase 5

**Status: PASSED**
**WCAG Conformance: AA (hard constraint)**
**Primary Locale: en-GB | Secondary: cy (Welsh)**

---

## Decision Summary

### 1. Platform Set

Revizr v1 is confirmed as a **responsive progressive web application** served via web on all devices. No native iOS or Android application is built in v1 — this is an explicit Won't-have from `spec.md` and is reaffirmed here as a platform constraint, not an aspiration. The full device surface is covered by a single responsive web codebase with a service worker layer. The six personas map cleanly to four browser environments: mobile Safari (iOS), mobile Chrome/Samsung Internet (Android), desktop Chrome/Edge (Windows), and desktop Safari/Chrome (macOS). All four are served by the same web application.

PWA features are split across two phases: the service worker (for asset caching and offline graceful degradation) and the install prompt are required in v1. Full offline session play (F29) and web push to student accounts are deferred, the latter pending compliance clearance for under-16 push notifications (C-009(d)).

### 2. App Type

Responsive web with progressive enhancement to PWA. The app shell renders at four breakpoints (320 px, 768 px, 1 024 px, 1 440 px). The 320 px breakpoint is not optional — it is required to satisfy WCAG 2.2 AA criterion 1.4.10 (Reflow). This is a standard web stack. No new portfolio platform is introduced.

### 3. WCAG Conformance

**WCAG 2.2 Level AA is the hard constraint.** The rationale for choosing AA over AAA is that AA is the statutory minimum required by the Equality Act 2010 for UK digital services, the EAA enforcement regime (effective June 2025), and the ICO Children's Code Standard 7 (online tools used by children with disabilities must meet accessibility standards). AAA is not mandated by any of these regimes for a commercial subscription product. Where specific AAA criteria are achievable without disproportionate cost — for example, 1.4.6 Enhanced Contrast for the 11+ child cohort, whose reading fluency may be limited — they are recommended but not gated.

The compliance decision (C-016) requires a documented WCAG audit by a qualified auditor before go-live. That audit must confirm AA conformance across all student-facing and parent-facing surfaces. No surface is exempt.

### 4. Performance Budgets

Hard numbers are set for two tiers: low-end (Amara's shared tablet, school Chromebook, 5 Mbps) and standard (Priya's iPhone, Tariq's MacBook, 50 Mbps). The defining low-end constraints are: LCP ≤ 3,000 ms, TTI ≤ 5,000 ms, initial JS bundle ≤ 150 kB gzipped, memory ≤ 180 MB. These numbers are not aspirational targets — they are pass/fail gates enforced in CI via Lighthouse CI. Any build that regresses a budget blocks promotion. Full details are in `performance-budgets.md`.

### 5. i18n Scope

**English (en-GB)** is the primary and v1 launch locale. All date formatting (DD/MM/YYYY), number formatting (comma thousands separator), and currency (£ GBP, no EUR or USD display) must use en-GB locale conventions throughout. Screen reader locale must be set to `en-GB` on the `<html lang>` attribute for correct pronunciation of UK-specific vocabulary (exam board names, grade notation).

**Welsh (cy)** is confirmed as a required v1 secondary locale, not a deferred item. The Welsh Language (Wales) Measure 2011 applies to Welsh public-sector bodies; it does not automatically impose obligations on commercial entities. However, compliance condition C-018 flags that if Revizr markets to Welsh-medium schools or positions WJEC coverage as a selling point in Wales, a Welsh language scheme may be legally required and a Welsh-qualified legal advisor must confirm this before the Welsh market is entered. Given that WJEC coverage is a confirmed Must-Have feature (F12) and Welsh students are an explicit target market, the Welsh language scheme risk is material. To manage this risk, Revizr v1 will ship with a Welsh UI locale (cy) from launch, eliminating the compliance exposure from the outset rather than deferring it to a retrofit. The cy locale covers UI chrome, navigation, error messages, and onboarding copy. Past paper question content itself is in the language of the original exam paper (Welsh-medium WJEC papers are in Welsh; English-medium papers are in English) and does not require translation beyond correct lang attribute tagging.

Northern Ireland (Siobhan, CCEA context) is English-only. CCEA papers are in English; no Irish-language locale is required or evidenced in the persona data.

**i18n-deferred:** None. The full v1 i18n scope is en-GB + cy. No other locales are in scope for v1 or any committed future version at this stage.

### 6. Wearable and Automotive

watchOS, WearOS, CarPlay, and Android Auto are deferred with no current target date, pending evidence of demand. The rationale is threefold. First, no persona has a wearable-relevant study context — revision requires sustained reading, free-text input, and multi-step question interactions that are fundamentally incompatible with a 44 mm watch display or a car infotainment screen. Second, the content served (authentic exam questions with diagrams, mark schemes, and contextual data tables) cannot be meaningfully presented on sub-100 px UI surfaces. Third, serving exam content to a user who is driving would constitute a foreseeable safety hazard, creating product liability exposure that is not proportionate to any conceivable commercial benefit.

---

## Constraints Carried Forward to Build

The following platform constraints are non-negotiable for the Build squad. They are not preferences or guidelines.

1. WCAG 2.2 AA conformance on every screen before promotion to preprod.
2. Performance budgets in `performance-budgets.md` enforced in CI on every PR.
3. All static assets self-hosted or served from UK-only CDN edge nodes.
4. No API response caching outside UK CDN points of presence (compliance C-012).
5. Service worker included from Sprint 1 — not a Sprint 6 retrofit.
6. `<html lang="en-GB">` (or `cy` when in Welsh locale) on every page — no exceptions.
7. Web push architecture included in v1 service worker; activation gated on compliance C-009(d) clearance.
8. PWA install prompt shown only after first session completion — not during onboarding or payment flow.

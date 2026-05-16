---
feature: 002-revizr
document: device-matrix
phase: 5
gate: platform-sign-off
squad: platform-strategy
authored_by: platform-strategy-lead
date: 2026-05-15
status: passed
prior-packs:
  - personas-pack/personas.md
  - compliance-pack/compliance-decision.md
  - spec.md
---

# Revizr — Device Matrix

## Platform Target Matrix

| Platform | Persona Segments | Distribution % | Required | Justification |
|---|---|---|---|---|
| Android mobile (mid-range, 720p, 4–6 GB RAM) | Jack (primary), Siobhan (primary) | 32% | YES — primary | Jack's Android phone is his only viable daily device. Siobhan's Samsung Galaxy is her primary browser. Combined, these represent the GCSE and secondary-parent segments — the highest-volume user class. Android holds ~52% of UK smartphone market share (2025). |
| Android tablet / Amazon Fire (low-end, 1–2 GB RAM, shared) | Amara (primary) | 8% | YES — must not degrade | Amara's shared family tablet is the canonical low-end constraint device. Fire OS and low-spec Android tablets define the performance floor for the entire product. This is the hardest target: lowest RAM, oldest CPU, potentially throttled by a parental control profile. |
| Chromebook (school-issued, low-end, Chrome OS) | Amara (secondary, school context) | 5% | YES — must not degrade | School Chromebooks are low-memory (typically 4 GB RAM, weak GPU). Used by Amara during permitted school sessions. Chrome OS is a full browser environment; no native app required. Same performance floor as low-end Android. |
| iOS mobile (iPhone, current to 2 generations old) | Priya (primary), Siobhan (secondary), Denise (personal) | 28% | YES — primary | Priya's iPhone 14, Siobhan's Samsung (browser parity required), Denise's iPhone 13. iPhone is ~48% of UK smartphone market. This is the dominant parent device. Apple-ecosystem parents are the subscription decision-makers — conversion UX must be polished on this platform. |
| iPadOS (tablet, mid-to-high-end) | Priya (secondary), Denise (school context) | 7% | YES — required | Priya checks Revizr on iPad alongside iPhone. Large-screen layout must respond correctly. iPadOS shares the iOS browser engine (WebKit/Safari); no separate implementation required. |
| macOS (Safari, Chrome) | Tariq (primary for study), Priya (work MacBook), Denise (personal MacBook Pro) | 12% | YES — primary for A-level | Tariq's primary study device is a MacBook Air. Denise's personal tutoring work happens on MacBook Pro. macOS represents the high-end desktop tier. Viewport width enables a richer layout for the question pack and parent dashboard. |
| Windows (Chrome, Edge) | Jack (home laptop, occasional), Siobhan (home laptop), Denise (school Windows laptop) | 8% | YES — required | Jack's school/home laptop, Siobhan's home laptop, Denise's school laptop. Windows laptops are the standard school-issued device for secondary and teacher populations. Chrome and Edge on Windows must be explicitly QA'd. |
| Native iOS app | None | 0% | NO — deferred to v2 | Won't-have per spec.md. Usage data from v1 web will determine native app priority. |
| Native Android app | None | 0% | NO — deferred to v2 | Won't-have per spec.md. Same rationale. |
| watchOS / WearOS | None | 0% | NO — deferred permanently unless evidence changes | No persona uses a wearable as a study device. Revision requires focused reading and written input — wearable form factor is incompatible with the core session flow. No study context in personas involves commuting or sport. |
| CarPlay / Android Auto | None | 0% | NO — deferred permanently | No driving-context JTBD exists across any persona. Revision questions served to a driver would be a safety hazard. |

**Total confirmed platform coverage: 100% of persona device distribution is served via web.**

Distribution estimates are modelled from UK market share data (Statcounter 2025) applied to the persona demographics. The 11+ parent cohort (Priya, Amara's household) skews strongly Apple. The secondary student cohort (Jack, Tariq) skews Android mobile and Mac. Northern Ireland/Wales parents (Siobhan) mirror the England parent distribution. Teachers (Denise) use institutional Windows with personal Apple.

---

## PWA Feature Decision Table

| PWA Feature | Decision | Rationale |
|---|---|---|
| Responsive web (breakpoints: 320px, 768px, 1024px, 1440px) | REQUIRED — v1 | All personas span mobile through desktop. The 320px breakpoint is mandatory to satisfy WCAG 2.2 AA criterion 1.4.10 (Reflow). Must pass WCAG reflow at 320px CSS width without horizontal scroll. |
| Service worker (caching of static assets) | REQUIRED — v1 | Amara's low-end Android tablet and school Chromebook operate on slow broadband (~5 Mbps). Service worker caching of the app shell, fonts, and question-pack CSS/JS assets directly reduces repeat-visit load time and satisfies the performance budget on the low-end tier. This is a performance requirement, not a UX enhancement. |
| Offline mode (full question-pack download and offline session) | OPTIONAL — v1 capability, v2 UX polish | F29 (offline mode) is scoped as a Could-Have. The service worker must be architected from v1 to support offline sync in v2. Basic offline graceful degradation (show a clear offline state rather than a broken page) is required in v1. Full offline session play is deferred. |
| Install prompt (Add to Home Screen / PWA install) | RECOMMENDED — v1, not mandatory | Relevant for Amara (shared tablet, reduces friction for a young user returning to the app) and Jack (Android phone, his primary device). Install prompt improves retention by giving the product a home-screen presence without requiring an app store submission. Must not trigger during the onboarding or payment flow — only after the user has completed their first session. |
| Push notifications (web push) | CONDITIONAL — deferred pending compliance clearance | F26 (inactivity alerts) and F16 (streak mechanic) depend on push notifications. Compliance Condition C-009(d) requires explicit parental consent before push notifications are sent to under-16 users. Web push for the parent account (Priya, Siobhan) is permissible with PECR-compliant opt-in. Web push to the student account for under-16 users must not be implemented until parental consent flow is confirmed compliant. Architecture must support web push in v1; activation is compliance-gated. |
| Background sync | RECOMMENDED — v1 architecture, v2 activation | Required for F25 (cross-device session continuity) and future F29 (offline sync). Service worker background sync API must be included in the v1 service worker architecture even if the full offline session feature is v2. |

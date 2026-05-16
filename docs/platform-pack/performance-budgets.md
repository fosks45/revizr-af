---
feature: 002-revizr
document: performance-budgets
phase: 5
gate: platform-sign-off
squad: platform-strategy
authored_by: platform-strategy-lead
date: 2026-05-15
status: passed
tiers:
  - low-end
  - standard
constraint-level: hard
prior-packs:
  - personas-pack/personas.md
  - spec.md
---

# Revizr — Performance Budgets

All limits below are HARD CONSTRAINTS. No build artefact may be promoted from dev to preprod until it passes every budget in its tier. Gatekeeper sign-off on the evidence pack requires passing WebPageTest and Lighthouse results attached for both tiers.

---

## Tier Definitions

**Low-End Tier** — Derived from Amara's shared Android tablet (7-inch, ~2 GB RAM, ARM Cortex-A53 or equivalent) and school Chromebook (4 GB RAM, Intel Celeron). Network: slow broadband / school WiFi, modelled at 5 Mbps down with 40 ms RTT. This tier defines the performance floor. Every user on a higher-spec device benefits automatically; failure on the low-end tier means Amara and the 11+ cohort cannot use the product.

**Standard Tier** — Derived from Priya's iPhone 14, Tariq's MacBook Air, Jack's mid-range Android phone (4–6 GB RAM). Network: home broadband / 4G, modelled at 50 Mbps down with 20 ms RTT.

---

## Performance Budget Table

| Platform Tier | Metric | Hard Limit | Measurement Condition | Basis |
|---|---|---|---|---|
| **Low-End** | First Contentful Paint (FCP) | **2,000 ms** | WebPageTest, 5 Mbps / 40 ms RTT, 4× CPU throttle, cold load | spec.md NFR: "first question visible within 3 seconds on mobile 4G." Low-end WiFi is slower than 4G; 2 s FCP leaves 1 s margin for LCP. Amara needs to see the page is loading immediately or she will assume the device has frozen. |
| **Low-End** | Largest Contentful Paint (LCP) | **3,000 ms** | WebPageTest, 5 Mbps / 40 ms RTT, 4× CPU throttle, cold load | Directly maps to the spec.md 3-second practice session NFR. LCP on the practice session view (the question card) is the measured element. |
| **Low-End** | Time to Interactive (TTI) | **5,000 ms** | Lighthouse, simulated slow 4G, 4× CPU throttle | Amara's tablet requires touch responsiveness before the question card is tapped. 5 s TTI with a 3 s LCP means the UI is usable within 2 s of first paint — acceptable for low-end hardware. |
| **Low-End** | Cumulative Layout Shift (CLS) | **0.05** | Lighthouse, full-page load including web fonts and question images | Stricter than WCAG 2.2 requirement but necessary for Amara's age group: layout jumping during reading is a comprehension barrier for young users. Below the "Good" CWV threshold of 0.1; no tolerance given the child audience. |
| **Low-End** | Initial JS bundle (gzipped) | **150 kB** | Webpack Bundle Analyzer / build artefact check | 5 Mbps = ~625 kB/s. A 150 kB JS bundle parses in ~240 ms on a 2 GB RAM ARM device at 4× throttle. Exceeding this pushes TTI beyond budget. Code-split everything beyond the critical path. |
| **Low-End** | Total initial page weight (gzipped, all resources) | **400 kB** | WebPageTest waterfall, cold load | Covers HTML + CSS + fonts + above-fold images + JS. At 5 Mbps this loads in ~640 ms transfer time, leaving adequate parse/render budget to meet FCP at 2,000 ms. |
| **Low-End** | API p95 response time — quiz question load | **800 ms** | Backend APM (server-to-server, excludes network), p95 over rolling 5-minute window | The practice session view depends on a question payload (text + metadata). 800 ms server-side leaves ~1,200 ms for network + render to meet the 3-second LCP on low-end. This is a backend SLO, not a browser metric. |
| **Low-End** | API p95 response time — diagnostic run (topic weakness map generation) | **60,000 ms (60 s)** | Backend APM, job-queue completion time, p95 | spec.md NFR requires the weakness map within 90 s. 60 s p95 leaves a 30 s buffer. A progress indicator must be shown from second 1. The API call is async (job-queue pattern); the browser poll or websocket must surface status every 5 s. |
| **Low-End** | Memory budget (renderer process peak) | **180 MB** | Chrome DevTools Memory tab, task-manager peak during active session | 2 GB RAM devices allocate ~300–400 MB to the Chrome renderer before OOM-killing the tab. 180 MB peak keeps the session tab alive even when the OS background-compresses other apps. Question images must be lazy-loaded and released from memory when scrolled off-screen. |
| **Standard** | First Contentful Paint (FCP) | **1,000 ms** | WebPageTest, broadband / 20 ms RTT, no CPU throttle, cold load | Priya's iPhone and Tariq's MacBook expect near-instant visual feedback. 1 s FCP is achievable with a properly cached app shell and server-side rendered (or static) initial HTML. |
| **Standard** | Largest Contentful Paint (LCP) | **1,800 ms** | WebPageTest, broadband / 20 ms RTT, no CPU throttle, cold load | Below the Core Web Vitals "Good" threshold of 2,500 ms. The practice session view must paint the question card within 1.8 s. LCP image must be preloaded or above-fold. |
| **Standard** | Time to Interactive (TTI) | **2,500 ms** | Lighthouse, no throttle | Tariq's MacBook and Priya's iPhone have sufficient CPU to hydrate a React/Vue app quickly. 2.5 s TTI ensures no perceived lag on the conversion flow — critical for the free-to-paid gate (F5). |
| **Standard** | Cumulative Layout Shift (CLS) | **0.05** | Lighthouse, full-page load | Same limit as low-end. CLS is a content quality constraint, not a hardware constraint. Layout stability is non-negotiable on both tiers. |
| **Standard** | Initial JS bundle (gzipped) | **250 kB** | Build artefact check | At 50 Mbps, 250 kB transfers in ~40 ms. The higher limit versus low-end reflects network headroom; parse-time on high-spec hardware is not the constraint. Still enforces aggressive code-splitting for routes beyond the critical path. |
| **Standard** | Total initial page weight (gzipped, all resources) | **700 kB** | WebPageTest waterfall, cold load | Covers app shell fully including hero images and font subsets. At 50 Mbps this is ~112 ms transfer, well within FCP budget. |
| **Standard** | API p95 response time — quiz question load | **400 ms** | Backend APM, p95 | Standard users on fast connections should experience near-instant question transitions. 400 ms server-side is achievable with a question-payload cache warmed for the user's current pack. |
| **Standard** | API p95 response time — diagnostic run (topic weakness map generation) | **45,000 ms (45 s)** | Backend APM, job-queue completion time, p95 | Tighter than the low-end budget because standard users on fast connections expect faster overall feedback loops. Still well within the 90 s spec.md NFR. |
| **Standard** | Memory budget (renderer process peak) | **400 MB** | Chrome DevTools Memory tab, task-manager peak during active session | Standard devices have 6–16 GB RAM; 400 MB is a generous but disciplined ceiling. Prevents the practice session from becoming a memory hog that degrades other open tabs, relevant for Denise using the teacher portal alongside school systems. |

---

## Additional Constraints

### Network Resilience (Both Tiers)

- **Offline graceful degradation** — HARD CONSTRAINT: if the network is unavailable, the app must show a clear, non-broken offline state within 2 s of connectivity loss. It must not display a blank white page or a browser-level error. This applies on all tiers. The service worker must intercept failed fetches and return a cached offline shell page.
- **Slow network loading states** — HARD CONSTRAINT: any API call expected to take >500 ms must show a skeleton or spinner state within 200 ms of initiation. No blank question area is ever shown to the user.

### Image Handling (Both Tiers)

- All question images (diagrams, graphs, data tables from authentic past papers) must be served in WebP format with a JPEG fallback. WebP is required to meet the low-end total page weight budget.
- Images must carry explicit `width` and `height` attributes to prevent CLS.
- Images below the fold must use `loading="lazy"`.

### Web Font Strategy (Both Tiers)

- Maximum two font families loaded. Use `font-display: swap` to prevent FOIT.
- Font subsets limited to Latin + Welsh Extended (to support cy locale). No full Unicode font load.
- Font files must be self-hosted (no third-party font CDN calls that could introduce GDPR third-party data transfer risk or add RTT).

### E2E Encryption Latency (School Report Upload)

- School report uploads transit E2E encrypted (compliance C-004, C-013). Encryption overhead adds ~50–100 ms to upload initiation on low-end devices. This is budgeted within the API response time; the upload progress indicator must appear immediately on click, before the encrypted upload begins, so the user receives immediate feedback regardless of encryption latency.

### UK Data Residency Impact on CDN Strategy

- Compliance C-012 prohibits C7 data in non-UK storage. Static assets (JS, CSS, images of past paper diagrams) do not contain personal data and may be served from a UK-only CDN edge. However, no CDN edge node outside the UK may cache any API response or user-specific content. The CDN configuration must explicitly geo-restrict API caching to UK points of presence only. This constraint may slightly increase CDN cache hit latency for Welsh and Northern Irish users compared to a globally distributed CDN — this is an accepted compliance trade-off and is not a performance budget exception.

---

## Budget Enforcement Protocol

1. Performance budgets are checked in CI on every PR against the main branch using Lighthouse CI with the budgets defined in `lighthouserc.json`.
2. The low-end tier is simulated using Lighthouse's "Slow 4G" preset with 4× CPU throttle applied.
3. The standard tier is simulated using Lighthouse's "desktop" preset with no throttle.
4. Any PR that causes a budget regression blocks merge — no exceptions. If a new feature requires exceeding a budget, the budget must be formally revised via a platform amendment with documented justification, not silently overridden.
5. WebPageTest runs against a staging URL are required in the evidence pack for every sprint release before promotion to preprod.

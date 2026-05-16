---
phase: 2
gate: market-viability
feature: 002-revizr
squad: market-research
authored_by: market-research-lead
date: 2026-05-15
status: proceed
tam_size_gbp: 3500000000
sam_size_gbp: 400000000
som_size_gbp: 10000000
saturation_index: 6
incumbent_count: 12
pricing_hypothesis: "£19.99/month or £179/year per student; limited diagnostic free tier; B2B school licence at £9/student/year"
recommendation: proceed
human-approval-required: false
evidence-pack: market-pack/
prior-phase-pack: discovery-pack/
workers:
  - tam-sam-som-analyst
  - competitor-intel-agent
  - saturation-index-agent
  - pricing-wtp-agent
  - trend-watcher
  - channel-analyst
---

# Market Research Decision: Revizr (002-revizr)

## Verdict: PROCEED

All six market research workers return findings that individually and collectively
support advancing Revizr to the Personas & Requirements phase. The market is proven,
real, and sufficiently large. Revizr occupies a defensible position within it. The
saturation score (6/10) is below the kill-or-escalate threshold of 7. No worker
finding meets the criteria for a kill or an escalation. The pricing hypothesis is
internally consistent and supported by comparable evidence.

---

## Market Size Synthesis

The UK private tutoring market — Revizr's primary addressable pool — is documented
at £4–5 billion per annum across England, Wales, Northern Ireland, and Scotland.
Adjusted to Revizr's in-scope geographies (England, Wales, NI) and restricted to
academic tutoring (excluding non-academic coaching), the addressable base is
approximately **£3.5 billion TAM**.

The Serviceable Addressable Market — households with children in exam-relevant years
(KS2 through A-level) who have both digital access and willingness to pay for
academic subscription products — is estimated at **£400M**, representing approximately
1.93 million qualifying households at a £200 average annual revenue per user. This
figure is derived bottom-up from JCQ and DfE census data on exam cohort size and
filtered through broadband penetration and willingness-to-pay estimates. The
willingness-to-pay filter (55% of digitally-accessible households) is the highest-
sensitivity assumption in the model and should be tested empirically once the D2C
acquisition funnel is live.

The Serviceable Obtainable Market at Year 3 under the base case (2.5% SAM
household penetration) is **£10M ARR**, consistent with the discovery-phase
ValueBench projection. The range across cases is £2.4M–£29M. These are Year 3
run-rate figures; Year 1 will be materially lower as the brand and acquisition
engine are established.

---

## Competitive Landscape Summary

Twelve competitors were assessed across the exam-prep and revision platform segment.
The market is real and proven — Seneca Learning, Tassomai, Atom Learning, and
GCSEPod collectively demonstrate sustained commercial activity and user engagement.
No competitor, however, has assembled the combination that Revizr offers:
authentic past-paper content at scale (30,000+ papers), AI-driven weakness
diagnosis from external evidence (school reports), and a parent dashboard that
treats visibility as a first-class product requirement.

The closest threats are Seneca Learning (massive free user base, strong brand, but
synthesised content and limited parent features) and Atom Learning (premium
positioning, parent dashboard, but 11+ only). Both can be differentiated against on
their specific structural gaps. The saturation index of 6/10 confirms that the
market is contested but not overcrowded, and that the authentic paper database
constitutes a moat with an estimated 18–36 month replication lead time.

A meaningful competitive risk is the "free goods" ecosystem: BBC Bitesize, Isaac
Physics, and exam board websites offer free revision content that sets user
expectations. Revizr's marketing must communicate clearly that the value is not the
papers themselves (freely available on exam board sites) but the AI-driven
personalisation, targeted pack assembly, and parent accountability layer. This is a
marketing challenge that the UX/Design and Growth squads must solve; it does not
invalidate the product.

---

## Pricing and Monetisation

The recommended price architecture — £19.99/month or £179/year per student, with
a limited diagnostic free tier — is validated by comparable evidence from Atom
Learning (£30/month for 11+ alone), Tassomai (£12–20/month for Science), and
the tutoring cost anchor (one tutoring session = £30–60). Revizr's broader subject
coverage and authentic content quality justify pricing above Tassomai and below
Atom. The diagnostic free tier is designed to generate demonstrated personalisation
value (the student's specific topic weakness map) before requiring payment — this
is the key conversion lever.

The free-to-paid conversion rate assumption (8%) is the single most commercially
sensitive variable in the financial model. The UX/Design squad should treat the
conversion flow as a primary design constraint from the first sprint. B2B school
pricing (£9/student/year) is flagged for Year 2 channel development.

---

## Trend and Macro Context

The Trend Watcher analysis identifies three macro tailwinds that support Revizr's
market timing:

1. **Tutoring cost pressure from cost-of-living squeeze.** UK household discretionary
   spending on tutoring has come under pressure since 2022. Families that previously
   paid for weekly sessions without scrutiny are now evaluating value for money. A
   subscription at "less than one tutoring session per month" arrives at precisely
   the right economic moment.

2. **Post-COVID attainment catch-up.** DfE and Ofsted data through 2024/25 continue
   to show grade attainment gaps versus pre-pandemic baselines, particularly in
   Maths and English at GCSE level. Parent anxiety about exam performance remains
   elevated, sustaining demand for supplemental educational support.

3. **AI credibility for educational applications.** AI-powered educational tools have
   crossed from "novelty" to "credible" in parent perception over 2024–2026. Products
   like Khanmigo (Khan Academy) and the emergence of AI tutoring in the US have
   primed the UK parent audience to accept AI-driven educational personalisation,
   reducing the educational trust barrier that new entrants faced in 2022–2023.

Policy risks are limited: EBacc policy focus on core academic subjects (English,
Maths, Science, Languages, Humanities) directly aligns with Revizr's subject
coverage. Ofsted inspection changes do not materially affect Revizr's D2C model.

---

## Channel and Customer Acquisition

The Channel Analyst confirms three viable D2C acquisition channels, with a
realistic composite CAC of approximately **£45–85** in Year 1:

- **SEO / content marketing** ("GCSE revision help", "11+ practice papers"): lowest
  CAC (estimated £15–35 per paid subscriber at scale) but 6–12 months to gain
  traction. Must start immediately. Revizr's authentic paper content is also
  inherently SEO-linkable (past paper topic guides, subject-specific revision
  content).

- **Paid social (Facebook/Instagram, parent audiences):** Fastest to market; CAC
  estimate £60–120 in Year 1, improving to £40–70 with creative optimisation. The
  parent demographic (35–50, UK, child in exam years) is accurately targetable on
  Meta platforms.

- **Referral / word-of-mouth:** Parent forums (Mumsnet, school Facebook groups) are
  highly active for exam-year advice. A structured referral programme (one month
  free for each referral) is estimated to contribute 15–20% of Year 2 acquisition
  at near-zero CAC. Mumsnet sponsorship (display + Blogger Network) is a
  channel-specific tactic to accelerate early credibility.

CAC at £65 composite against LTV of £800 (4-year household × £200/yr, conservative)
gives an LTV:CAC ratio of 12.3:1 — strong unit economics that support growth
investment.

---

## Open Items for Downstream Squads

Carried forward from discovery phase and updated:

1. **Copyright and licensing of the 30,000-paper database** (Compliance squad,
   blocking for any content serving to users). Revizr cannot serve exam questions
   to users until the legal status of the database is confirmed. This is the single
   hardest prerequisite and must be on the critical path.

2. **AI report-parsing accuracy validation** (Architecture squad technical spike).
   The entire value proposition hinges on the diagnosis engine. A spike is required
   before the build phase begins.

3. **Child data compliance** (Compliance squad, C7 classification). Student data is
   C7 under the constitution's data taxonomy. COPPA/UK Age-Appropriate Design Code
   implications must be resolved before any data model or consent flow is built.

4. **Conversion flow design** (UX/Design squad). The free-tier to paid-tier
   conversion flow is the highest commercially sensitive UX challenge in the product.
   It must be treated as a primary design constraint, not a post-launch optimisation.

5. **Engagement and habit mechanics** (Personas & UX/Design squads). The student
   motivation gap (identified in discovery) remains unresolved. Personas work should
   specifically investigate what motivates revision behaviour in the 11–18 age range
   and what gamification or accountability mechanics are appropriate and legally
   compliant under the Age-Appropriate Design Code.

---

## Decision

**Gate: MARKET-VIABILITY — PROCEED.**

The market is real, sized, and growing in the right direction. The competitive
position is defensible. The pricing model is validated. The saturation score is
within acceptable bounds. The five open items above are risk-managed delegations
to downstream squads, not blocking conditions at this gate. No new kill signal
has emerged from the market research phase.

Advance to: **Personas & Requirements** (Squad 3) and **Compliance** (Squad 4,
child data and copyright tracks) in parallel.

Human approval is not required at this gate under the constitution (§2). The
decision does not touch auth, payments, or production personal data systems.
The C7 child data compliance gate will require human approval when the data model
and consent flows are submitted.

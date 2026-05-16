---
feature: 002-revizr
document: pricing-hypothesis
phase: 2
squad: market-research
authored_by: pricing-wtp-agent
date: 2026-05-15
recommended_consumer_price_monthly: 19.99
recommended_consumer_price_annual: 179
recommended_free_tier: limited_diagnostic
b2b_school_price_per_student_annual: 9
sources:
  - Competitor pricing pages (May 2026; public)
  - Atom Learning pricing (confirmed App Store, May 2026)
  - Seneca Learning pricing (confirmed senecalearning.com, May 2026)
  - Tassomai pricing (confirmed tassomai.com, May 2026)
  - Duolingo S-1 (freemium EdTech conversion benchmarks)
  - HolonIQ EdTech Pricing Benchmark Report 2023
  - UK Consumer Subscription Benchmark, Recurly Research 2023
  - ONS Family Spending Survey 2022/23 (education category)
---

# Pricing Hypothesis — Revizr (002-revizr)

## 1. Comparables Table

The following products represent the pricing landscape relevant to Revizr. Prices
are per student per month unless otherwise noted.

| Product | Segment | Monthly Price | Annual Price | Free Tier? | Notes |
|---|---|---|---|---|---|
| Seneca Learning | GCSE/A-level adaptive quiz | £5.99–£7.99/mo | ~£59/yr | Yes — generous freemium | Premium adds ad-free, offline, advanced tracking |
| Tassomai | GCSE Science adaptive | £12.00–£20.00/mo | ~£144–180/yr | No (7-day trial) | School licences available at discount |
| Atom Learning | 11+ preparation | £27.50–£30.00/mo | ~£270/yr | No (1-week free trial) | Clearly premium; 11+ parents are highest WTP segment |
| GCSEPod | GCSE video revision | £5.00–£8.00/mo (D2C) | ~£60–80/yr | No (3 pods free) | School channel is primary; D2C is secondary |
| Koosha | GCSE AI chat | £9.99/mo | N/A listed | No | Early stage; pricing may not be optimised |
| Khan Academy | General (US primary but UK-used) | Free | Free | N/A | Not a paid subscription; free benchmark |
| Duolingo (analogous EdTech) | Language learning | £6.99–£9.99/mo | £59.99/yr | Yes — core product free | Best-in-class freemium EdTech; conversion benchmark |
| Mathway (US analogous) | Maths step-by-step | $9.99/mo | $39.99/yr | Yes (basic) | Different geography; for freemium conversion ref only |
| MyTutor / Tutorful | Live tutoring (not direct comp) | £25–60/session | N/A | No | Sets price anchor: "less than one tutoring session" |

**Key observation:** The UK consumer EdTech paid subscription market has a visible
band of £6–£9/month for broad freemium platforms (Seneca) and £12–£30/month for
specialist or premium-quality services (Tassomai, Atom). Revizr's authentic paper
database and AI diagnosis capabilities position it firmly in the specialist premium
tier.

---

## 2. Willingness-to-Pay Analysis

### The tutor-cost anchor

The most powerful pricing frame for Revizr is the tutoring cost anchor. UK families
paying for private tutors spend £30–60 per hour. At a typical weekly session:

| Weekly tutor cost | Monthly tutor cost | Revizr at £20/mo | Saving per month |
|---|---|---|---|
| £30/hr | £130/mo (4.33 sessions) | £20 | £110 (85% saving) |
| £40/hr | £173/mo | £20 | £153 (88% saving) |
| £50/hr | £217/mo | £20 | £197 (91% saving) |

Any subscription price below approximately £65/month (the cost of one tutoring
session) is defensible as "less than one hour of tutoring." This provides substantial
headroom above the recommended price point.

### Comparable buyer behaviour

**ONS Family Spending (2022/23):** UK households with dependent children in the
ABC1 socioeconomic group (the primary Revizr buyer) spend on average £38/month on
educational items beyond school fees (includes books, subscriptions, tutoring,
activities). At £20/month, Revizr represents approximately 53% of this education
discretionary budget line — high, but defensible if positioned as a tutor
replacement rather than an addition.

**Atom Learning at £30/month for 11+:** This is the strongest comparable. Atom has
demonstrated that parents of 11+ candidates will pay £30/month for a digital
preparation platform. Revizr covers the same 11+ segment plus GCSE and A-level —
a broader scope for a lower price. If Atom can charge £30, Revizr can charge £20
without leaving money on the table.

**Tassomai at £12–20/month for Science:** Tassomai has demonstrated that GCSE-
focused parents pay £12–20/month for a science-only adaptive platform. Revizr
covers all subjects — greater value — at the top of Tassomai's range (£20/month).

**Free-to-paid conversion benchmarks:**
- Duolingo (language learning EdTech): approximately 7–8% free-to-paid conversion
  rate (S-1 disclosure).
- EdTech sector average: HolonIQ estimates 5–12% freemium conversion for consumer
  EdTech with meaningful free tiers.
- UK-specific consumer subscription benchmark (Recurly 2023): 6.2% free-to-paid
  conversion for software subscriptions with free tiers.

**Working assumption for Revizr:** 8% free-to-paid conversion rate in Year 1–2,
improving to 12% as social proof and referral mechanics mature. This is an
assumption flagged as medium sensitivity.

---

## 3. Recommended Price Architecture

### Consumer (D2C) Pricing

**Monthly plan: £19.99/month per student**

Rationale:
- Sits between Tassomai (£12–20) and Atom Learning (£30) — correct premium
  positioning.
- Psychologically below £20 when stated as "£19.99."
- Frames as "less than half an hour of tutoring" in marketing copy.
- Competitor comparison: more than Seneca (justified by authentic papers + AI
  diagnosis), less than Atom (appropriate — Atom is a specialist 11+ product).

**Annual plan: £179/year per student**

Rationale:
- Represents a 25% discount on 12× monthly (12 × £19.99 = £239.88 → £179 = 25%
  off).
- Annual plan commits the family for the academic year; reduces churn significantly
  (industry benchmark: annual plans have 3–5× lower churn than monthly).
- Per-month effective rate: £14.92 — positions below Tassomai's £15 floor and well
  below Atom's equivalent.
- Family plan (2 children): £299/year (saving vs 2× individual = £59/year).
  Encourages household lock-in and increases LTV.

**Recommended ARPU blend assumption (updated):**
- 40% annual plan, 60% monthly plan uptake in first year (conservative; annual
  share will grow as referral and word-of-mouth matures).
- Blended ARPU: (0.40 × £179) + (0.60 × £19.99 × 10 months average tenure)
  = £71.60 + £119.94 = £191.54.
- Round to £192/year as planning ARPU (consistent with discovery's £200 estimate).

### Free Tier Scope

**Recommended:** Limited diagnostic free tier (not a content-access free tier).

The free tier should allow:
1. Upload of school report or completion of a diagnostic assessment.
2. Generation and **preview** of the personalised topic weakness map.
3. **Three sample questions** per identified weak topic (from the authentic paper
   database), enough to demonstrate product quality and authentic-paper value.
4. **Parent dashboard preview** (non-live; shows what the dashboard will look like
   with live data once subscribed).

The free tier should NOT provide:
- Full question packs.
- Ongoing session tracking.
- Score progression.
- Live parent dashboard with real data.

**Rationale for limited free tier:**
- Full freemium (Seneca model) commoditises the content and reduces conversion
  pressure. Revizr's authentic paper database is too valuable to give away freely.
- However, zero free access dramatically increases CAC — users cannot evaluate
  quality before paying. A diagnostic-and-preview free tier resolves this tension:
  it proves the product's diagnosis accuracy (the hardest thing to sell in copy) and
  creates a concrete, personalised reason to subscribe ("your child is weak in
  Algebra and Quadratics — here are 3 of the 47 authentic exam questions Revizr has
  identified for them").
- Conversion hook: the free tier generates a personalised topic map that the user
  can see but not act on without subscribing. The emotional investment in having
  "seen my child's weaknesses" is a strong conversion trigger.

**Alternative considered and rejected:** Full freemium with ads (Seneca/BBC model).
Rejected because: (a) it devalues the paper database; (b) advertising to children
is legally complex under COPPA / UK Age-Appropriate Design Code (C7 data class);
(c) ad revenue is insufficient to support the content and AI infrastructure costs.

### B2B School Pricing

**Per-student annual licence: £9/student/year**

Rationale:
- Set below Educake's school pricing (£199–499/school ÷ estimated 100–200 students
  = £2–5/student; however, Educake is a simpler product). Revizr's authentic paper
  content and AI layer justify a higher per-student price.
- Set below GCSEPod's institutional pricing (~£8–12/student/year via Tes; Revizr
  is comparable in quality if different in format).
- A secondary school with 200 GCSE students would pay approximately £1,800/year —
  a reasonable budget line for a Head of Year or Director of Learning.
- School licences should include teacher management dashboard and class-level
  analytics (not just parent/student dashboard) — adds B2B-specific value.

**Minimum school contract:** £1,500/year (approximately 167 students); reduces
administrative overhead on small-deal management.

**White-label / tutoring agency channel:** Custom pricing, typically 30–40% discount
on consumer list price in exchange for distribution. Not recommended before Year 2.

---

## 4. Sensitivity Analysis

| Pricing Scenario | Monthly Price | Annual Price | Implied 3-Yr ARR (Base SAM penetration) | Assessment |
|---|---|---|---|---|
| Aggressive (below Tassomai floor) | £12 | £110 | £6M | Under-monetises; competes on price rather than value; not recommended |
| Conservative (at Tassomai midpoint) | £15 | £135 | £7.5M | Leaves value on table given stronger product; not recommended |
| **Recommended** | **£19.99** | **£179** | **~£10M** | Correct market positioning; fully justified by authentic paper + AI value |
| Premium (Atom-style) | £25 | £220 | £12M | Defensible but narrows addressable market; re-evaluate once brand established |
| Premium-plus | £30 | £270 | £14M | Only sustainable if product proves strong outcome data; not recommended at launch |

---

## 5. Stated Assumptions and Risks

| Assumption | Sensitivity | Mitigation |
|---|---|---|
| 8% free-to-paid conversion | High | A/B test free tier depth vs conversion rate; conversion is the primary pricing risk |
| 40% annual plan uptake in Year 1 | Medium | Offer annual plan prominently; incentivise with free diagnostic for annual subscribers |
| £192 blended ARPU | Medium | Dependent on plan mix; track weekly and adjust promotions |
| School WTP at £9/student | Medium | Validate with 3–5 school pilots in Year 1 before setting contract prices |
| Tutor cost anchor remains valid | Low | Cost-of-living context supports this; tutoring rates are sticky |

**Key pricing risk:** The greatest pricing risk is the free tier being too generous,
which would suppress paid conversion. The recommended "diagnostic preview" free tier
is specifically designed to generate emotional investment and demonstrate value
without substituting for the paid product. The UX/Design squad should treat the
free-to-paid conversion flow as a primary design constraint, not an afterthought.

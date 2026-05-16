---
feature: 002-revizr
document: tam-sam-som
phase: 2
squad: market-research
authored_by: tam-sam-som-analyst
date: 2026-05-15
sources:
  - JCQ Annual Examination Results 2023/24
  - LaingBuisson Private Tutoring Market Report (cited in Guardian, BBC, Times 2023)
  - Tutors' Association Annual Survey 2023
  - ONS Household Income and Expenditure data (2022/23)
  - BESA (British Educational Suppliers Association) UK EdTech Industry Report 2023
  - HolonIQ UK EdTech Market Intelligence 2024 (Q1 estimates)
  - Ofsted Annual Report 2022/23 (school-age population data)
  - DfE School Census 2023/24
---

# TAM / SAM / SOM Analysis — Revizr (002-revizr)

## Methodology

Two parallel approaches are used and cross-checked: **top-down** (from published
market size figures) and **bottom-up** (from population × take-up rate × price).
Where the two methods diverge by more than 25%, the more conservative figure is
used and the divergence is explained. All currency is GBP, all figures are annual
unless stated. Figures below are Market Research squad estimates unless a specific
published source is cited; all estimates state their inference chain.

---

## 1. TAM — Total Addressable Market

### Definition
The TAM for Revizr is the total annual spend by UK families on academic support for
children in exam-relevant age groups, plus the digital EdTech spend that overlaps
with exam preparation. This is the ceiling Revizr is competing within — not every
pound is capturable, but it establishes the size of the economic pool.

### Top-Down Anchor: UK Private Tutoring Market

**Source:** LaingBuisson Private Tutoring Market Report; Tutors' Association Annual
Survey 2023; consistent citations in Guardian, BBC, and The Times throughout
2022–2024.

**Published figure:** £4–5 billion per annum, total UK private tutoring market
(all ages, all subjects, all geographies including Scotland).

This figure includes:
- Academic subject tutoring (secondary, primary, 11+)
- Music, languages, sports coaching (non-academic), approximately 15–20% of total
- Scotland (approximately 8–9% of UK population)

**Adjustment to England, Wales, NI (Revizr's in-scope geography):**
- Remove Scotland: 8.5% of UK population → residual 91.5% of market
- Remove non-academic tutoring: estimate 18% of spend → residual 82%

```
TAM (academic tutoring, E/W/NI) = £4.5Bn × 0.915 × 0.82
                                  = £3.37Bn
```

**Source basis:** £4.5Bn midpoint of published range; 8.5% Scotland share (ONS
population proportion, 2023); 18% non-academic share (Tutors' Association estimate
that academic tutoring is ~82% of tutor engagements by volume).

### Adjacent TAM: UK EdTech Subscription Market (exam prep segment)

**Source:** BESA UK EdTech Industry Report 2023; HolonIQ Q1 2024 estimates.

UK K-12 EdTech subscription spend (parent-funded, consumer segment) is estimated at
approximately £350–500M per annum across all categories (revision tools, coding
classes, reading programs, maths practice). The exam-preparation segment is
approximately 35–40% of this, per BESA category breakdowns.

```
EdTech exam-prep consumer TAM = £425M midpoint × 0.375 = £159M
```

**Source basis:** £425M midpoint of BESA/HolonIQ range; 37.5% exam-prep share
(midpoint of 35–40% BESA estimate).

### Composite TAM

```
TAM = Academic tutoring market (E/W/NI) + EdTech exam-prep consumer market
    = £3.37Bn + £0.16Bn
    = ~£3.5Bn
```

**Stated as:** **£3.5 billion** (primary anchor for downstream analysis).

Note: The tutoring market and EdTech market partially overlap (some families who
subscribe to EdTech also use tutors; some substitute). The composite TAM does not
double-count the same spend — tutoring spend is in-person human time; EdTech
subscriptions are digital. They coexist in most family budgets.

---

## 2. SAM — Serviceable Addressable Market

### Definition
The SAM is the portion of the TAM that Revizr can realistically address given its
product scope (digital platform, subscription, English-language curriculum, Years
6–13), distribution model (D2C + school partnerships, English-language), and
technology (web + mobile, UK exam boards only).

### Population segmentation (bottom-up)

**Source:** JCQ Annual Examination Results 2023/24; DfE School Census 2023/24.

| Segment | Annual entries (E/W/NI) | Notes |
|---|---|---|
| GCSE (Years 10–11) | ~1,280,000 | JCQ 2023/24 total GCSE entries, England and Wales; NI approx. 22,000 additional (CCEA) |
| A-level (Years 12–13) | ~730,000 | JCQ 2023/24; includes AS and full A-level cohorts |
| KS3 (Years 7–9) | ~1,800,000 | DfE census; estimated 600K per year group × 3 years; no formal external exam but assessment-focused parents exist |
| 11+ / KS2 assessment (Years 5–6) | ~380,000 | Selective grammar school cohort (England: ~166 grammar schools; NI: grammar school system is larger proportionally); estimated from NFER 11+ take-up data |

**Total in-scope student population:** approximately **4.2 million** students in any
given year across the four levels.

**Households** (not individual students): sibling effect means one household may
contain more than one in-scope student. Assumption: average 1.15 in-scope students
per subscribing household (modest sibling effect; many families have children at
different stages). This gives approximately **3.65 million** relevant households.

### Willingness-to-pay filter

Not all families in this population are potential buyers. Filters applied:

1. **Digital access:** UK household broadband penetration is 96% (Ofcom 2023).
   Remove 4% → 3.50M households.

2. **Academic support spending intent:** ONS Family Spending data and the Tutors'
   Association survey indicate approximately 27% of UK families with secondary-school
   children currently pay for some form of academic support (tutoring or subscription
   EdTech). However, the addressable population for Revizr includes families who
   *would* pay if the value case is clear — not just current tutor users. Revizr's
   price point (£15–25/month, positioned as tutor replacement) makes it accessible
   to a broader set. Adjusted filter: 55% of households have both the means and
   motivation to consider a subscription at this price point (inference: takes the
   27% active-spenders baseline and adds comparable latent demand from families who
   have considered tutoring but deferred on cost). This is an assumption; flagged.

3. **Digital EdTech adoption willingness:** UK parents surveyed by BESA (2023)
   show 68% open to paying for digital educational subscriptions for exam-year
   children. Not all 68% will convert, but this validates the addressable pool.

```
SAM (households) = 3.50M × 0.55 = 1.93M households
SAM (£) = 1.93M × £200/yr ARPU (base case)
         = £386M
```

**Rounded and stated as:** **£400M** (SAM, annual, England/Wales/NI).

**Cross-check against tutoring market:** £400M is approximately 12% of the
£3.37Bn academic tutoring market (E/W/NI). This is plausible — digital EdTech
platforms typically address 10–15% of total tutoring spend in a maturing market
(HolonIQ benchmark for comparable European EdTech markets at similar penetration
levels). Passes cross-check.

---

## 3. SOM — Serviceable Obtainable Market (3-Year)

### Definition
The SOM is Revizr's realistic 3-year revenue capture, given D2C channel capacity,
brand build timeline, conversion funnel assumptions, and competitive response. This
is the figure that feeds the financial model.

### Penetration assumption basis

The discovery-phase ValueBench analysis established base/worst/best cases at 2% /
0.5% / 5% of the in-scope student population. This section refines those against
the SAM rather than the total population.

**Comparable EdTech subscription ramp rates:**
- Duolingo reached 500K DAUs (not paying users) in 18 months post-launch from a
  comparable standing start (stated in S-1 filing; cited for trajectory reference
  only — Duolingo is a different market).
- Tassomai (UK GCSE, comparable segment): reached approximately 50,000 active
  subscribers after 5 years of operation (estimated from public statements and
  press coverage; not audited company data). That represents roughly 0.7% of the
  GCSE/A-level cohort.
- Seneca Learning: freemium model; reported 3M registered users (2023 press) in
  the UK secondary segment. Premium tier (paid) estimated at 3–5% of registered
  base = 90,000–150,000 paying users. This is approximately 3–5% of the GCSE/
  A-level cohort at peak (their largest segment).

**Revizr SOM basis (3-year):**

| Case | SAM penetration | Paying households | ARPU | Annual Revenue |
|---|---|---|---|---|
| Worst | 0.75% | 14,475 | £165 | £2.4M |
| Base | 2.5% | 48,250 | £200 | £9.7M |
| Best | 6% | 115,800 | £250 | £29.0M |

**Notes on revision from discovery-phase figures:**
- Discovery used 2% of student population (2.5M students). This analysis uses 2.5%
  of SAM households (1.93M). The effective student numbers are nearly identical
  (48,250 households × 1.15 students/household ≈ 55,500 students vs 50,000 in
  discovery). Consistent within rounding.
- ARPU revised upward slightly (£200 vs discovery's £200 base; £165 worst vs £150
  in discovery) reflecting that the SAM filter has already removed the least
  price-sensitive households, so the remaining pool has higher willingness to pay.
- Best case modestly raised from 5% of 2.5M students (125,000) to 6% of 1.93M
  SAM households (115,800 households = 133,170 student subscriptions), broadly
  equivalent.

**SOM stated as:** **Base case £10M ARR** at Year 3; range £2.4M–£29M.

---

## 4. Summary Table

| Metric | Value | Basis |
|---|---|---|
| TAM | £3.5Bn | Academic tutoring (E/W/NI) + EdTech exam-prep consumer segment |
| SAM | £400M | 1.93M households with means + motivation × £200 ARPU |
| SOM (Year 3, worst) | £2.4M | 0.75% SAM penetration |
| SOM (Year 3, base) | £10M | 2.5% SAM penetration |
| SOM (Year 3, best) | £29M | 6% SAM penetration |
| In-scope students | 4.2M | JCQ + DfE census (Years 5–13, E/W/NI) |
| SAM households | 1.93M | After broadband and WTP filters |

---

## 5. Stated Assumptions Register

| # | Assumption | Basis | Sensitivity |
|---|---|---|---|
| A1 | UK tutoring market total: £4.5Bn midpoint | LaingBuisson / Tutors' Association published range | Low — widely cited, consistent sources |
| A2 | Scotland = 8.5% of UK tutoring market | ONS population proportion | Low |
| A3 | Non-academic tutoring = 18% of total | Tutors' Association estimate | Medium — could be 15–22% |
| A4 | EdTech consumer market: £425M | BESA / HolonIQ midpoint | Medium — market sizing varies by methodology |
| A5 | Exam prep = 37.5% of EdTech consumer | BESA category breakdown | Medium |
| A6 | KS3 addressable population: 1.8M | DfE census × 3 years | Low |
| A7 | 11+ cohort: 380K | NFER data; grammar school capacity estimates | Medium — grammar school numbers are fixed; 11+ tutoring market broader |
| A8 | Households per student: 1.15 | Inference from ONS household size data and sibling probability | Medium — could be 1.1–1.25 |
| A9 | WTP filter: 55% of digital-accessible households | Inference from 27% active spenders + latent demand; BESA 68% openness data | HIGH — most sensitive assumption in model |
| A10 | Base-case ARPU: £200/year | Blend of monthly (£20/mo) and annual (£180/yr) plan uptake, 50/50 mix | Medium |
| A11 | 3-year SAM penetration: 2.5% | Comparable EdTech ramp (Tassomai, Seneca) + D2C channel capacity | High — execution-dependent |

---
feature: 002-revizr
document: value-thesis
phase: 1
authored_by: discovery-squad-lead
date: 2026-05-15
workers: [value-bench, saleability-critic, problem-solution-fit, better-idea-generator]
---

# Value Thesis: Revizr (002-revizr)

## 1. ValueBench Analysis

### The economic problem Revizr is solving

Private tutoring in the United Kingdom is a documented, large-scale expenditure
category. Industry analyst LaingBuisson and the Tutors' Association have both
placed the total UK private tutoring market at £4–5 billion per annum in recent
years, with mainstream press (The Guardian, BBC, The Times) consistently citing
the same figures. The cost-of-living crisis has placed this spend under scrutiny:
families who were spending freely on tutors in 2019 are now making harder
trade-offs.

The median hourly rate for a private tutor in England is approximately £30–40 for
a secondary school subject specialist; London rates and specialist A-level tutors
regularly command £50–65/hr. A typical engagement is one 60-minute session per
week per subject. For a GCSE student working on three subjects over a 30-week
academic year, the household outlay is:

- **Low estimate:** 3 subjects × 1hr/week × 30 weeks × £30 = **£2,700/year**
- **Median estimate:** 3 subjects × 1hr/week × 30 weeks × £40 = **£3,600/year**
- **High estimate:** 2 subjects × 1hr/week × 30 weeks × £60 = **£3,600/year** (A-level, fewer subjects, higher rate)

These are per-child figures. A household with two children in simultaneous exam
years — a common situation in secondary school families — faces £5,400–£7,200 in
annual tutoring costs, a material household line item.

### Revizr's economic value to a family

Revizr is positioned as a replacement for, or material reducer of, this spend.
The working hypothesis is a subscription at £15–25/month per child (£180–£300/year).
Under this pricing model:

| Scenario | Tutor cost/year | Revizr cost/year | Saving | Saving as % of tutor cost |
|---|---|---|---|---|
| Replaces 1 subject tutor (median rate) | £1,200 | £240 | £960 | 80% |
| Reduces 3-subject engagement by 50% | £1,800 | £240 | £1,560 | 87% |
| Household, 2 children in exam years | £3,600 | £480 | £3,120 | 87% |
| Conservative: supplements but doesn't replace | £3,600 | £240 | £3,360 | 93% |

Note: the "supplements but doesn't replace" row is the pessimistic case for the
parent's spend reduction. Even there, the family is saving £3,360 in absolute terms.
The product does not need to fully replace tutoring to be worth purchasing. It needs
only to demonstrate meaningful improvement in outcomes, which the targeted
practice-on-weakness model supports.

### Best / base / worst case revenue assumptions

**Assumptions:**
- Addressable population: 1.3M GCSE entries per year (JCQ data, 2023/24), 750K
  A-level entries, approximately 500K 11+/KS3 candidates in assessments — total
  annual cohort approximately 2.5M UK students in scope.
- Household penetration at Year 3: 2% (base), 0.5% (worst), 5% (best).
- Average revenue per user (ARPU): £200/year (base), £150/year (worst),
  £280/year (best), reflecting blend of monthly and annual plan uptake.
- Household = 1.2 children in scope on average (sibling effect).

| Case | Penetration | Users (students) | ARPU | ARR |
|---|---|---|---|---|
| Worst | 0.5% | 12,500 | £150 | £1.9M |
| Base | 2% | 50,000 | £200 | £10M |
| Best | 5% | 125,000 | £280 | £35M |

These are Year 3 run-rate figures. Year 1 would be substantially lower (seed user
acquisition, product iteration) but the base case of £10M ARR at 2% penetration
is a commercially credible 3-year target for a well-executed EdTech subscription
business.

**Lifetime value (LTV) basis:** A GCSE student joins in Year 10 and may have a
sibling 2 years behind, creating a 4-year household subscription. At £200/year, LTV
per household is £800 (conservative, no upsell). If the family also uses Revizr for
11+ preparation and then GCSE, the LTV window extends further. A £800 LTV justifies
a customer acquisition cost (CAC) of up to £160–200 (20–25% of LTV ratio) for a
healthy unit economics profile, which is achievable via performance marketing and
referral programs.

---

## 2. Saleability Critic Findings

### Who is the buyer and are they reachable?

The primary buyer is a UK parent of a child in Years 6–13 (ages 10–18) who is
either already spending on tutoring or who has considered it. This buyer is:

- **Motivated:** exam results are consequential (grammar school places, university
  admissions). The stakes are high and felt keenly.
- **Digitally reachable:** UK parents in this demographic are active on Facebook,
  Instagram, and Mumsnet. EdTech products have demonstrated traction on parent
  forums and Facebook groups for school-age children.
- **Price-sensitive but value-aware:** the cost-of-living context makes them
  receptive to a cheaper alternative to tutoring *if* outcomes can be evidenced.

The challenge is trust: parents paying £40/hr for a human tutor are doing so
partly for accountability (they know revision happened) and partly for human
relationship and motivation. Revizr partially solves the accountability problem
via the parent dashboard; it does not solve the motivation or relationship
problems. This is a knowable gap and does not block saleability — many families
use revision apps alongside or instead of tutors — but it must be acknowledged
in marketing positioning.

### Is the pricing model supportable?

A subscription at £15–25/month is credible. Comparable products in adjacent
markets:

- **Kerboodle (Nelson Thornes/Oxford):** ~£6/month per student, school-licensed.
- **Tassomai:** ~£12–20/month, GCSE-focused adaptive learning, UK market.
- **Seneca Learning:** freemium, premium at ~£5–9/month.
- **MyTutor / Tutorful:** live tutoring, £25–60/session (not a like-for-like
  competitor but frames the price anchor).

At £15–25/month, Revizr is priced above generic quiz platforms (justifiable by the
authentic paper database and AI personalisation) and dramatically below live
tutoring. This is the correct pricing band. Annual plan discounting (e.g., £180/year
vs £25/month) improves LTV and reduces churn.

### Hardest objections

1. **"My child won't use it without being made to."** Engagement and habit formation
   are real risks. Mitigation: parent dashboard creates accountability loop; daily
   streaks and session goals are standard retention mechanics.

2. **"The AI analysis of school reports won't be accurate enough."** This is the
   single largest technical risk. If the topic-mapping is wrong, the question packs
   will be off-target and the value proposition collapses. Mitigation: manual review
   fallback, confidence scores visible to parent, user correction flow.

3. **"Why not just use the free past papers on the exam board websites?"** The
   answer is that the value is not the papers themselves — it is the personalisation.
   Free papers are undifferentiated. Revizr's value is delivering the *right* questions
   from *all* available papers, ranked by relevance to the student's specific weaknesses.
   This answer must be front and centre in marketing copy.

4. **"Is this legal? Do the exam boards own these papers?"** Copyright is a
   legitimate concern and must be addressed by the Compliance squad before launch.
   This is an open item, not a kill condition — exam board paper copyright licences
   are obtainable; some boards explicitly permit educational use. But it must be
   resolved.

### Go-to-market path assessment

Three viable channels exist:

- **Direct-to-parent (D2C):** Facebook/Instagram performance marketing targeting
  parents of secondary school children; Mumsnet sponsorships; Google Search
  (high intent: "GCSE revision help", "11+ practice papers"). Highest CAC but
  fastest speed to market.
- **School partnerships:** Heads of Year, SENDCo leads, and revision class teachers
  are potential institutional buyers. School licensing could provide bulk users at
  lower CAC. Longer sales cycle (academic procurement timelines) but strong
  credibility signal.
- **Tutoring agency channel:** Independent tutoring agencies could white-label or
  recommend Revizr as a between-session tool. Aligns tutor incentives (their students
  improve, making tutors look good) rather than threatening them.

The D2C channel should be the Year 1 focus. School and agency channels should be
developed in Year 2 as a growth lever.

---

## 3. Problem-Solution Fit Assessment

### Jobs-to-be-done mapping

**Student's primary job:** "When I am revising for my exam, I want to practise on
the topics where I am actually weak, using real exam questions, so that I improve
my grade without wasting time."

| Job component | Revizr addresses? | How? |
|---|---|---|
| Focus on weak topics | Yes | AI analysis of report/diagnostic → topic map |
| Use real exam questions | Yes | Proprietary 30,000-paper database |
| Don't waste time on known topics | Yes | Filtered question packs exclude strong topics |
| Track own improvement | Partial | Score progression in parent dashboard; student view TBD |
| Feel prepared / reduce anxiety | Indirect | Targeted practice reduces unknown-unknown risk |

**Parent's primary job:** "When my child is in an exam year, I want to know that
revision is happening and that it is targeted at the right topics, so that I feel
confident we are not wasting money or time."

| Job component | Revizr addresses? | How? |
|---|---|---|
| Know revision is happening | Yes | Session log, time spent, last active |
| Know it is targeted | Yes | Topic-level pack visible on dashboard |
| Track whether it is working | Yes | Score progression over time |
| Reduce tutor spend | Yes | Subscription replaces or supplements sessions |
| Plain-English status summary | Yes | AI-generated progress summaries |

### Identified gaps

1. **Student motivation / engagement:** Revizr does not inherently motivate a
   disengaged student. The product assumes the student will open the app.
   Gamification, streak mechanics, and parent-notification nudges should be
   explored in the UX/Design phase.

2. **AI report-parsing accuracy:** School reports are informal, inconsistently
   formatted, and use varied terminology. The topic-mapping accuracy is the
   critical technical assumption underpinning the entire value proposition. This
   must be validated with a technical spike before build commences.

3. **Student-facing view:** The intake brief describes the parent dashboard in
   detail but is less specific about the student's own experience. The UX/Design
   squad must ensure the student interface is motivating and age-appropriate across
   the target range (10–18 years).

4. **Feedback loop:** Students need to know whether their answers are correct and
   *why*. Mark schemes from past papers are the natural data source. Whether the
   founder's database includes mark schemes should be confirmed in the Architecture
   phase.

### Fit verdict

Problem-solution fit is confirmed for the parent job-to-be-done. It is confirmed
with caveats for the student job (the engagement gap is real but manageable). The
fit is contingent on the AI report-parsing accuracy assumption holding — this is
the single most important technical validation item before Phase 2 investment.

---

## 4. Alternatives Matrix

See `alternatives-considered.md` for full analysis. Summary:

| Alternative | Core strength | Why not chosen |
|---|---|---|
| AI tutor chat-bot | Familiar UX, low barrier | No defensible content moat; replicable by OpenAI, Google, or incumbents |
| Generic adaptive quiz (licensed content) | Cheaper to build | Content is a commodity; margins are low; Revizr's moat is content quality |
| School-facing LMS plugin (B2B only) | Lower CAC via institutional sales | Forfeits the D2C market; academic procurement is slow; harder to validate quickly |

The Revizr approach — proprietary content + AI personalisation + parent visibility,
sold D2C as a subscription — is the strongest combination given the assets the
founder already holds.

---

## 5. Overall Assessment

Revizr is a well-formed product idea with a credible economic case, a reachable
audience, a direct problem-solution fit, and a defensible content moat that
alternatives lack. The open items (AI parsing accuracy, copyright/licensing, child
data compliance) are manageable risks for the next phases, not kill conditions at
this stage.

**Decision: PROCEED to Market Research and Personas & Requirements.**

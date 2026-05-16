---
phase: 1
gate: discovery-go-no-go
feature: 002-revizr
squad: discovery-and-validation
decision_date: 2026-05-15
decision_author: discovery-squad-lead
status: proceed
value-thesis: >
  Revizr delivers a £500–£2,000/year per-family saving over private tutoring costs
  while solving the root cause — unfocused revision and zero parent visibility —
  through a proprietary 30,000-paper content moat that no competitor can replicate
  at speed.
kill-reason: ~
pivot-direction: ~
alternatives-considered:
  - ai-tutor-chat-bot
  - generic-adaptive-quiz-platform
  - school-b2b-only-lms-plugin
better-idea: ~
human-approval-required: false
evidence-pack: discovery-pack/
---

# Discovery Decision: Revizr (002-revizr)

## Verdict: PROCEED

All four worker agents — ValueBench, Saleability Critic, Problem-Solution Fit, and
Better-Idea Generator — return findings that individually and collectively support
moving to Market Research and Personas & Requirements. No worker surfaced a
condition that meets the threshold for a kill, and no alternative approach was found
to be clearly superior to the proposed solution given the assets the founder already
holds.

## Summary of findings

### ValueBench

The economic case is robust. UK private tutoring expenditure is documented at
£4–5 billion per annum (LaingBuisson / Tutors' Association annual survey, cited
in mainstream press). A family spending £40/hr weekly for a 30-week school year
pays £1,200 per child, per subject. Families with two children in exam years
across two subjects each are spending £4,800 annually. A Revizr subscription at
£15–25/month (£180–£300/year) offers a tangible saving of £900–£4,500 per family
depending on current tutor usage. Even the conservative per-family saving is
substantial enough to justify the purchase decision without requiring the product to
completely replace tutoring. The addressable market across England, Wales, and
Northern Ireland — approximately 1.3 million GCSE entries per year plus 750,000
A-level entries — is large enough to support a commercially significant business at
even low single-digit percentage penetration.

### Saleability Critic

The product is saleable with identifiable go-to-market risks. UK parents with
children in exam years are highly motivated buyers; the tutoring market's scale
proves willingness to pay for academic support. The subscription pricing band
(£15–25/month) sits at a psychologically credible price point — less than one hour
of tutoring per month — which substantially reduces friction. The key challenges
are: (1) CAC will be elevated if the brand is unknown at launch, requiring
performance marketing or referral mechanics; (2) school and tutor channel
partnerships create distribution leverage but also a longer sales cycle; (3) the
free tier must convert at a rate that justifies the content access it provides.
None of these objections is fatal; all are manageable with standard product-led
growth and channel partnership tactics.

### Problem-Solution Fit

The solution maps directly to the two primary jobs-to-be-done: the student's job
("improve my exam grade without wasting time on topics I know") and the parent's
job ("know that revision is happening and that it is targeted"). The proprietary
past-paper database is not decorative — it is load-bearing for both fit and
defensibility. The AI analysis layer (report-to-topic mapping) is the second
critical component; it is the mechanism by which the product avoids becoming a
general question bank. The identified gap is that the analysis engine's accuracy
on parsing informal school reports is a technical risk that must be validated
before the build phase. This risk does not block proceeding but must be tabled
as a spike item for the Architecture squad.

### Better-Idea Generator

Three alternatives were evaluated: (1) a general AI tutor chat-bot (e.g.,
tutoring via LLM conversation), (2) a generic adaptive quiz platform using
licensed content, and (3) a school-facing LMS plugin with teacher-assigned
revision sets. None is superior given the founder's asset position. The
proprietary paper database makes alternatives (1) and (2) less defensible — they
would be easily replicated or undercut by incumbents. Alternative (3) has merit
as a channel but not as the primary product; it is recommended as a B2B growth
path, not a replacement thesis. No clearly superior alternative was identified.

## Decision rationale

- Value: established. Per-family savings are concrete and large relative to
  subscription price. Market size is confirmed.
- Saleability: credible. Pricing is supportable. Go-to-market paths exist.
- Fit: confirmed. Solution maps tightly to both primary jobs-to-be-done.
- No superior alternative: confirmed. Founder's content asset creates a moat
  that negates the primary advantage of each alternative approach.

## Next phase

Advance to **Market Research** (Squad 2) and **Personas & Requirements** (Squad 3)
in parallel. Flag the following as open items for Architecture squad:

1. Technical spike required: accuracy and robustness of AI report-parsing for
   informal/varied school report formats.
2. Compliance squad must engage early: child data (C7) and potential COPA/UK
   Age-Appropriate Design Code implications.
3. Copyright and licensing review of the 30,000-paper database must be completed
   before any content is served to users. This is a legal prerequisite, not a
   technical one.

Human approval is not required to proceed from this gate under the governance
rules in the constitution (§2). The decision does not touch auth, payments,
personal data production systems, or production deployment. The child-data
classification (C7) will engage the human-approval gate when the data model
and consent flows are submitted for compliance review in the Compliance squad
phase.

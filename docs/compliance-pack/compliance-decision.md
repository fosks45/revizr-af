---
phase: 4
gate: compliance-hard-stop
feature: 002-revizr
squad: compliance-risk-governance
authored_by: compliance-officer-agent
date: 2026-05-15
status: passed-with-conditions
risk-classification: high
regimes-cited:
  - UK GDPR (Data Protection Act 2018)
  - ICO Age-Appropriate Design Code (Children's Code) 2021
  - UK GDPR Article 8 (children's consent threshold)
  - PECR 2003 (Privacy and Electronic Communications Regulations)
  - Consumer Rights Act 2015
  - Copyright, Designs and Patents Act 1988
  - Equality Act 2010
  - Welsh Language (Wales) Measure 2011
  - CAP Code (ASA/CAP Committee of Advertising Practice)
  - DfE Data Sharing Guidance for Schools
  - ICO Data Sharing Code of Practice
dpia-status: full-dpia-required
special-category-data: true
data-residency-scope:
  - UK
human-co-sign-required: true
human-co-sign-rationale: >
  Mandatory on two independent grounds: (1) C7 child data — processing of personal
  data belonging to users as young as age 9 requires human DPO sign-off before any
  data model or consent flow is built; (2) exam board copyright — commercial
  distribution of 30,000+ papers under third-party copyright requires documented
  legal clearance from each rights holder before any content is served to users.
  Neither condition can be delegated to an agent.
prior-gates:
  discovery: proceed
  market-viability: proceed
  requirements-sign-off: passed
conditions:
  - C-001: Obtain verifiable parental consent (ICO-compliant mechanism confirmed by UK DP-qualified legal advisor) before activating any student account for a user under 13. Email-to-parent alone is not sufficient for under-13s; mechanism must be reviewed by human DPO before build.
  - C-002: Obtain parental/guardian consent before activating any student account for a user aged 13–15 (UK GDPR Art 8 threshold is 13; ICO Children's Code applies up to 18). Record consent with timestamp, IP, consent version, and consent text hash in an immutable audit log.
  - C-003: Obtain signed licensing agreements (or documented fair-dealing analysis confirmed by IP-qualified solicitor) for every exam board whose papers are served to paid subscribers before any content goes live. This applies to: AQA, Edexcel, OCR, CCEA, WJEC, and Cambridge Assessment International Education. No question from any board may be served to a subscriber until that board's clearance is on file.
  - C-004: Conduct and document a full Data Protection Impact Assessment (DPIA) for the school-report upload feature before build begins. The DPIA must address: special-category data extraction risk (SEN, mental health, disability mentioned in reports), data minimisation (only topic-weakness signals extracted and retained; raw document deleted after processing or at user request), retention period, and access controls.
  - C-005: Appoint or designate a UK-qualified Data Protection Officer (DPO) or external DPO service before public beta launch. DPO contact details must appear in the privacy policy and be registered with the ICO if legally required.
  - C-006: Register with the ICO as a data controller before processing any user data. Confirm ICO registration number in the compliance evidence pack before go-live.
  - C-007: Publish a privacy policy and terms of service reviewed and approved by a UK-qualified legal practitioner before any public-facing sign-up page goes live. The privacy policy must describe: lawful basis for each processing activity, data classes processed, retention periods, third-party processors (including Stripe, cloud infrastructure provider, AI model provider), data subject rights (access, erasure, rectification, portability), and the parental consent mechanism.
  - C-008: Implement PECR-compliant cookie consent (a genuine opt-in mechanism, not a pre-ticked box or implied consent) for all non-essential cookies before any public page is live. Analytics and marketing cookies require explicit opt-in. This applies on first visit and must be re-presented if cookie policy changes materially.
  - C-009: Implement Age-Appropriate Design Code compliance across all 15 standards before launch. Specific mandated requirements: (a) privacy-by-default settings for under-18 users; (b) no profiling of under-18 users for commercial or marketing purposes without explicit parental consent; (c) the streak mechanic (F16) must be reviewed and confirmed compliant with the AADC's prohibition on detrimental engagement design before UX finalisation; (d) push notifications to under-16 users require explicit parental consent (per F26 requirement); (e) geolocation must not be activated by default for under-18 users.
  - C-010: Establish and document the lawful basis under UK GDPR Article 6 for each processing activity before build. Specifically: (a) subscription contract (Art 6(1)(b)) for account and session data; (b) legitimate interest (Art 6(1)(f)) for product improvement analytics — LIA required; (c) consent (Art 6(1)(a)) for marketing communications; (d) legal obligation (Art 6(1)(c)) for financial record retention.
  - C-011: For the teacher/tutor read-only portal (F18): establish the lawful basis for sharing a child's session data with a third-party tutor before the feature is built. Options are explicit parental consent (preferred for C7 data) or legitimate interest (requires LIA and is weaker for child data). Human DPO must confirm the chosen basis before build specification is written.
  - C-012: All C7 data (student accounts under 16) must be stored in UK-resident infrastructure only. No C7 data may be processed by a sub-processor in a non-adequate jurisdiction unless standard contractual clauses (SCCs) are in place and a transfer impact assessment (TIA) is completed. Cloud provider and AI model provider must both be assessed.
  - C-013: The AI model provider used for school-report parsing must be assessed as a data processor under UK GDPR. A Data Processing Agreement (DPA) must be in place with the AI provider before any real user data (including school report content) is sent to the model. The DPA must confirm: UK data residency or SCCs, no training on customer data without consent, data retention limits.
  - C-014: Implement and document data subject rights fulfilment procedures before launch: right to access (respond within 30 days), right to erasure ("right to be forgotten"), right to rectification, right to data portability. For under-13 users, these rights are exercised by the parent/guardian. Erasure must cascade to all sub-processors including the AI provider.
  - C-015: Consumer Rights Act 2015 compliance for subscription: (a) cancellation terms must be clearly stated at point of sale; (b) the 14-day statutory cancellation right for digital services (Part 1, Chapter 2) must be addressed — note that the 14-day right does not apply once digital content delivery has begun if the consumer consented to immediate delivery, but this exception must be explicitly invoked and documented in terms; (c) automatic renewal must be clearly disclosed pre-purchase.
  - C-016: WCAG 2.2 Level AA compliance across all student-facing and parent-facing surfaces before launch. An accessibility audit by a qualified WCAG auditor (internal or external) must be documented in the evidence pack before go-live. This is an Equality Act 2010 obligation for a service likely to be accessed by persons with disabilities.
  - C-017: The B2B school licence feature (F24) requires a separate data processing agreement template for schools. Schools processing student data under a Revizr licence are data controllers; Revizr is a data processor for school-attributed data. The DPA template must address: data categories, processing purpose, sub-processors, international transfers, breach notification, and deletion on contract termination. DfE data sharing guidance for schools must be reviewed before the school licence product is sold.
  - C-018: Welsh Language Act applicability must be assessed by a Welsh-qualified legal advisor before the product is marketed in Wales. If Revizr intends to market directly to Welsh-medium schools or position the product as covering WJEC/Welsh-language qualifications, a Welsh language scheme may be required. Flags for human legal review; Build squad must not assume English-only interface is sufficient for the Welsh market.
  - C-019: Marketing of the product to consumers (paid social, referral programme, Mumsnet sponsorship) must comply with the CAP Code (non-broadcast advertising). Specific requirements: (a) pricing must be clearly stated including any conditions; (b) "authentic past papers" claims must be substantiated — available only after copyright licences are confirmed (C-003); (c) any testimonials must be genuine and not misleading; (d) ads targeting parents of children must not make unsubstantiated efficacy claims about educational outcomes.
  - C-020: The referral programme (F30) must comply with CAP Code rules on promotional offers and with UK GDPR requirements for referral data. Referral link mechanics must not expose referred users' personal data to the referring user.
evidence-pack: compliance-pack/
prior-packs:
  - discovery-pack/
  - market-pack/
  - personas-pack/
---

# Compliance Decision — Revizr (002-revizr)

## Gate: Compliance Hard-Stop — Phase 4

**Status: PASSED WITH CONDITIONS**
**Risk Classification: HIGH**
**Human Co-sign Required: YES — DPO/Legal sign-off mandatory before Phase 6 (Platform Strategy) and mandatory again before Build**

---

## Executive Summary

Revizr is a high-compliance-risk product. It processes personal data belonging to children as young as age 9, it aggregates educational data that may contain special-category information, and its commercial model depends on distributing content that is third-party copyrighted by examination boards. None of these facts is disqualifying — but all three require precise legal and operational conditions to be met before the product can be built or launched. This decision records those conditions with the specificity required to make them actionable.

**The product may proceed to Phase 5 (Platform Strategy). It may not proceed to Build until all conditions marked as pre-build are satisfied and confirmed by a human DPO or legal adviser.**

### Child Data (C7) — The Primary Compliance Trigger

The 11+ cohort (Amara Osei-Mensah, age 10; and similarly positioned users) places users as young as age 9 in scope. UK GDPR Article 8 sets the consent threshold for online services at age 13. Every user below 13 requires verifiable parental consent before any personal data is collected. The ICO's Age-Appropriate Design Code (Children's Code) applies to any online service "likely to be accessed by children" — Revizr plainly meets this test, which means all 15 standards of the Code apply to the entire product, not only to explicitly child-facing screens.

This is not a minor administrative requirement. The AADC prohibits profiling of under-18 users for commercial purposes, restricts certain engagement design patterns (directly affecting the streak mechanic at F16), and requires privacy-by-default settings for all under-18 accounts. The consent mechanism for under-13 users is a decision that requires a UK data-protection–qualified legal advisor, as identified in spec.md Open Question 1. That advisor decision is a pre-build blocker (Condition C-001).

### School Report Upload — Special-Category Data and DPIA Requirement

The diagnostic engine processes uploaded school reports. Real UK school reports frequently mention learning difficulties, SEN status, neurodivergence diagnoses, mental health observations, and educational health and care (EHC) plan references. These are special-category data under UK GDPR Article 9 (disability, health data). Processing special-category data requires both a lawful basis under Article 6 and an additional condition under Article 9 — typically explicit consent for this context. A full Data Protection Impact Assessment is required before this feature is built (Condition C-004, detailed in `dpia-screening.md`).

The AI model that parses the reports is a data processor: it receives raw document content that may include a child's name, school name, teacher observations, and special-category indicators. A Data Processing Agreement with the AI provider is mandatory before real data is sent to the model (Condition C-013).

### Exam Board Copyright — Single Largest Lead-Time Risk

The 30,000-paper database is the product's core asset and its primary compliance risk. Exam boards hold copyright in their question papers and mark schemes under the Copyright, Designs and Patents Act 1988. Commercial distribution of those papers — which is exactly what a subscription service does when it assembles personalised packs from them — requires either a licence from each rights holder or a defensible fair-dealing argument.

Fair dealing for educational purposes (CDPA s.35 and s.32) does not extend to commercial platforms distributing questions to individual subscribers for a fee. The commercial nature of Revizr's subscription model almost certainly takes it outside the scope of any statutory exception. Licence negotiations with six exam boards (AQA, Edexcel, OCR, CCEA, WJEC, Cambridge Assessment International Education) are the longest-lead-time item in the entire project. This process typically takes three to twelve months per board and may involve royalty structures that affect the unit economics. The Build squad must not build the content-serving pipeline until written licences are in place (Condition C-003, detailed in `copyright-analysis.md`).

### Regulatory Regime Summary

Twenty regimes and guidance frameworks apply to Revizr in full or in part. The full analysis is in `applicable-regimes.md`. The most operationally demanding are: UK GDPR and the Data Protection Act 2018 (foundational, affects the entire data model); the ICO Age-Appropriate Design Code (affects product design, not just policy); UK GDPR Article 8 (affects authentication architecture for under-13 accounts); the Copyright, Designs and Patents Act 1988 (affects the content pipeline entirely); and the Consumer Rights Act 2015 (affects subscription billing and cancellation flows).

### Conditions Summary

Twenty conditions are attached to this decision (C-001 through C-020). They are listed in full in the YAML frontmatter. The most critical pre-build blockers, in priority order, are:

1. **C-001** — Parental consent mechanism for under-13 users confirmed by human legal advisor.
2. **C-003** — Exam board licensing: written clearance from every board before any content is served.
3. **C-004** — Full DPIA for school-report upload feature completed and documented.
4. **C-005** — DPO appointed or designated before public beta.
5. **C-006** — ICO registration as data controller.
6. **C-007** — Privacy policy and terms reviewed by UK-qualified legal practitioner before any sign-up page goes live.
7. **C-013** — Data Processing Agreement with the AI model provider before real user data is sent to the model.

Conditions C-008 through C-020 address important but somewhat later-stage obligations (cookie consent, AADC design review, teacher portal lawful basis, Welsh language assessment, marketing compliance). These must nonetheless be resolved before the specified features are built or before launch, as documented per condition.

### Decision Rationale

This decision does not block the product. Revizr addresses a genuine market need, serves an underserved population (UK exam students and their parents, including the previously neglected NI/Wales CCEA/WJEC cohort), and its compliance risks are identifiable, bounded, and manageable through known legal and operational mechanisms. The conditions in this pack define exactly what must be done. A product that meets all twenty conditions will be legally sound in its target market.

The risk classification of HIGH reflects the combination of child data processing and third-party IP distribution — not a judgement that the product is unviable. It reflects the compliance workload required and the consequence of non-compliance: ICO enforcement action under UK GDPR can result in fines up to £17.5M or 4% of global annual turnover; AADC breaches are separately enforceable; copyright infringement at commercial scale carries injunctive risk and damages. These are real business risks, not theoretical ones. The conditions in this pack are the mechanism for managing them.

**The Phase 5 (Platform Strategy) squad may proceed. The Build squad must not begin until all pre-build conditions are confirmed as satisfied by a human DPO or legal adviser. Human co-sign is mandatory.**

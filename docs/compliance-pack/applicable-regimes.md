---
feature: 002-revizr
document: applicable-regimes
phase: 4
squad: compliance-risk-governance
authored_by: compliance-officer-agent
date: 2026-05-15
jurisdiction-primary: England, Wales, Northern Ireland
jurisdiction-secondary: UK-wide (UK GDPR, DPA 2018)
---

# Applicable Regulatory Regimes — Revizr (002-revizr)

This document enumerates every regulatory regime and statutory/guidance framework applicable to Revizr. For each regime, it states the jurisdiction, the relevant articles or sections, the applicability rationale, the hard constraints that flow from it, the recommended mitigations, and the exception or exemption process where one exists.

**Legend:**
- HARD CONSTRAINT — must be satisfied; cannot be waived by product decision
- CONDITION — attached to compliance-decision.md with a C-NNN reference
- NOTE — relevant but not generating a blocking constraint at this stage

---

## 1. UK General Data Protection Regulation (UK GDPR) and Data Protection Act 2018 (DPA 2018)

**Jurisdiction:** UK-wide (England, Wales, Northern Ireland, Scotland)
**Authority:** Information Commissioner's Office (ICO)
**Key instruments:** UK GDPR (retained EU law as amended by DPA 2018); DPA 2018 ss.6–21 (processing conditions), Sch.1 (special-category conditions), Sch.2 (controller/processor obligations)

**Applicability rationale:** Revizr is a data controller that collects, stores, and processes personal data of students and parents in the UK. It processes data of children under 16 (including under-13s), which triggers enhanced protections. It uses AI to process uploaded documents that may contain health and SEN data (special-category under UK GDPR Art 9). It shares data with sub-processors (cloud infrastructure, AI model provider, payment processor).

**Hard constraints:**

| Ref | Article/Section | Constraint |
|-----|----------------|------------|
| H-001 | Art 5(1)(a) | All processing must have a lawful basis. Each distinct processing activity requires a documented basis before processing begins. |
| H-002 | Art 5(1)(b) | Purpose limitation: data collected for the diagnostic must not be used for unrelated purposes (e.g., marketing analytics) without a separate basis. |
| H-003 | Art 5(1)(c) | Data minimisation: only data adequate and relevant to the specified purpose may be collected. This is operationally significant for the school-report upload (see dpia-screening.md). |
| H-004 | Art 5(1)(e) | Storage limitation: data must not be retained longer than necessary. Retention periods must be documented for each data class. |
| H-005 | Art 5(1)(f) | Integrity and confidentiality: appropriate technical measures required. C7 and C3 data requires encryption at rest and in transit. |
| H-006 | Art 6 | Lawful bases for processing must be established per activity. Likely bases: Art 6(1)(b) performance of contract (subscription); Art 6(1)(a) consent (marketing); Art 6(1)(f) legitimate interests (product analytics, with LIA required); Art 6(1)(c) legal obligation (financial records). |
| H-007 | Art 8 | Children under 13: processing of personal data requires verifiable parental consent. See Regime 2 below for the Children's Code interaction. Age threshold in UK is 13 (DPA 2018 s.9). |
| H-008 | Art 9 | Special-category data (health, disability, SEN indicators in school reports): requires both an Art 6 basis AND an Art 9 condition. For Revizr the likely Art 9 condition is explicit consent (Art 9(2)(a)) obtained from the parent at the point of upload. DPA 2018 Sch.1 may offer alternative conditions (substantial public interest — s.6 — but this is harder to sustain for a commercial product). |
| H-009 | Arts 13–14 | Privacy information must be provided at the point of data collection (transparency notices). The privacy policy must be layered for child users — written in age-appropriate language. |
| H-010 | Arts 15–22 | Data subject rights: access, rectification, erasure, restriction, portability, objection. For under-13 users, exercised by parent. Must be fulfilled within statutory timeframes (30 days for access, without undue delay for erasure). |
| H-011 | Art 25 | Data protection by design and by default: privacy-protective defaults required, especially for child users. This is also an AADC obligation (see Regime 2). |
| H-012 | Art 28 | Data Processing Agreements required with all sub-processors (cloud provider, AI model provider, payment processor, email service). DPAs must include the Art 28(3) mandatory terms. |
| H-013 | Art 30 | Records of Processing Activities (ROPA) must be maintained by Revizr as data controller before processing begins. |
| H-014 | Art 33 | Personal data breaches must be reported to ICO within 72 hours of awareness if likely to result in risk to individuals. C7 child data breaches carry elevated risk classification. |
| H-015 | Art 35 | DPIA required where processing is "likely to result in high risk" — school-report upload with special-category extraction plainly meets this threshold. |
| H-016 | Arts 44–49 | International data transfers: any transfer of personal data to a non-adequate third country requires appropriate safeguards (adequacy decision, SCCs, or binding corporate rules). AI model providers based outside the UK/EU require assessment. |

**Recommended mitigations:**
- Appoint a DPO or external DPO service before launch (Condition C-005).
- Register with the ICO (Condition C-006).
- Publish a layered privacy policy: adult version and child-accessible version (Condition C-007).
- Complete ROPA before any data processing begins.
- Conduct a full DPIA for the school-report upload (Condition C-004).
- Execute DPAs with all sub-processors before data is shared (Condition C-013 for AI provider; equivalent for cloud and email providers).

**Exception process:** ICO can issue enforcement notices, assessment notices, and fines. No general exception to the UK GDPR applies. Specific exemptions (DPA 2018 Sch.2) exist for legal professional privilege, journalism, and research but none is relevant to Revizr's core operations.

---

## 2. ICO Age-Appropriate Design Code (Children's Code) 2021

**Jurisdiction:** UK-wide
**Authority:** ICO
**Key instrument:** Children's Code (statutory code under DPA 2018 s.123). Not advisory — ICO takes Code compliance into account in enforcement decisions. Failure to comply is evidence of a UK GDPR breach.
**In force:** September 2021 (full enforcement). The Code applies to "information society services" (ISS) "likely to be accessed by children under 18." Revizr unambiguously meets this definition.

**Applicability rationale:** Revizr serves users from age 9 (11+ cohort). The AADC's 15 standards apply to the design of the entire product, not just child-specific screens. This means every UX decision, every data architecture choice, and every notification mechanic is subject to the Code.

**Hard constraints (15 AADC Standards):**

| Standard | Requirement | Revizr-specific impact |
|----------|-------------|----------------------|
| 1. Best interests of the child | Child wellbeing must be a primary consideration in design decisions. | Product must not prioritise engagement metrics over student wellbeing. |
| 2. Data protection impact assessments | DPIA required for high-risk processing affecting children. | Triggers Condition C-004. |
| 3. Age-appropriate application | Must either (a) establish age or (b) apply child-appropriate protections to all users. | Revizr must implement age verification or apply AADC protections to all users. Given that all student users are potentially under 18, AADC protections apply by default to all student accounts. |
| 4. Transparency | Privacy information must be in plain language appropriate to the child's age. | Privacy policy must have a child-readable version. For 11+ cohort (age 9–11), the language standard is significantly below adult legal text. |
| 5. Detrimental use of data | Data collected from children must not be used to their detriment. | Session and diagnostic data must not be used to profile children for non-educational commercial purposes. |
| 6. Policies and community standards | Terms must be age-appropriate and consistently enforced. | Terms of service must be written to be understandable to the youngest expected user cohort. |
| 7. Default settings | Privacy-by-default settings must be applied to children by default. | All data sharing, public visibility, and communications settings must default to the most protective option for under-18 accounts. Push notifications and streak mechanics (F16, F26) must be opt-in for under-16 users. |
| 8. Data minimisation | Only data necessary for the provision of the service may be collected from children. | Directly reinforces the school-report data minimisation requirement (dpia-screening.md). |
| 9. Data sharing | Children's data must not be shared (except to provide the service or with parental consent). | Teacher portal (F18) sharing requires explicit parental consent. Marketing/analytics use of child data requires explicit opt-in. |
| 10. Geolocation | Geolocation features must be off by default for child users. | Not a primary feature for Revizr, but location data (IP geolocation for compliance/residency) must be handled carefully. Explicit location tracking must not be active for under-18 users. |
| 11. Parental controls | Facilities for parental monitoring must not themselves infringe children's privacy. | The parent dashboard (F9, F10) must be designed so it does not give parents access to information that the child has a reasonable expectation of privacy over (e.g., individual answer text). Spec.md already restricts parent view to summary metrics, which is compliant. |
| 12. Profiling | Profiling of children (including behavioural profiling) for commercial purposes is prohibited unless there is demonstrably compelling reason and appropriate safeguards. Profiling for the service (diagnostic engine, weakness map) is legitimate; profiling for advertising is not. | The diagnostic engine's topic-profiling is service-delivery profiling, likely permissible. Any profiling for marketing segmentation, A/B testing on children, or advertiser targeting is prohibited. |
| 13. Nudge techniques | Design nudges that encourage children to provide unnecessary data, weaken privacy settings, or stay online longer in ways detrimental to wellbeing are prohibited. | **The streak mechanic (F16) is directly affected.** ICO guidance specifically cites streak mechanics as a design pattern warranting scrutiny. The streak must not create anxiety or compulsive engagement in ways detrimental to child wellbeing. This requires an explicit AADC review before UX finalisation (Condition C-009(c)). |
| 14. Connected toys and devices | Not applicable to Revizr. | — |
| 15. Online tools | If Revizr provides tools that enable children to access content (it does — the question pack), those tools must operate in a child-safe manner. | Content within question packs is exam material from regulated exam boards; content safety risk is low but must be considered if the question-flagging feature (F19) exposes any community-generated content. |

**Recommended mitigations:**
- Include AADC compliance review in every UX design sprint, not as a final gate.
- Conduct a dedicated AADC audit of the streak mechanic before any UX spec is locked.
- Build parental consent flows with AADC Standard 3 (age-appropriate application) and Standard 7 (privacy-by-default) as primary design constraints.
- Draft the privacy notice in three versions: adult, teenager (13–17), and child (under 13). Have the child version reviewed by a plain-English specialist.

**Exception process:** No product-level exception to the AADC. ICO enforcement. Reprimands, enforcement notices, and fines have been issued to major platforms for AADC non-compliance (e.g., TikTok, £12.7M fine, 2023). The ICO treats AADC non-compliance as a UK GDPR breach, applying the full fine scale.

---

## 3. UK GDPR Article 8 — Children's Consent (Standalone)

**Jurisdiction:** UK-wide
**Authority:** ICO
**Key instrument:** UK GDPR Art 8; DPA 2018 s.9 (sets UK threshold at 13)

**Applicability rationale:** Revizr's 11+ cohort means users as young as age 9. Every user under 13 is below the Article 8 threshold. The platform cannot obtain legally valid consent from these users directly; only a parent or guardian can consent on their behalf.

**Hard constraints:**
- **H-017:** For users under 13, consent must be obtained from the holder of parental responsibility. The platform must make reasonable efforts to verify that consent has been given by the parent (not the child impersonating the parent). ICO guidance acknowledges that "reasonable efforts" depends on context and risk level; for a commercial service targeting children, a higher standard than a simple email checkbox is expected.
- **H-018:** The consent mechanism must be "verifiable" — the ICO does not prescribe a specific technology, but the method must be proportionate to the risk. For a platform receiving school reports and building educational profiles of children from age 9, the risk level is elevated.
- **H-019:** The account creation flow must prevent collection of any personal data from an under-13 user until verifiable parental consent has been confirmed. Spec.md F1 already requires this (account not active until consent confirmed). This must be enforced technically, not just contractually.

**Recommended mitigations:**
- Consult a UK DP-qualified legal advisor on the specific consent mechanism before the authentication specification is written (this is Condition C-001 and Open Question 1 in spec.md).
- Consider options: (a) parent email confirmation with a time-delayed activation link (low friction, lower legal strength); (b) parent email confirmation with a credit card micro-transaction verification (higher strength, higher friction); (c) parent identity check via a third-party age-verification service. Each has different friction and legal robustness profiles.
- Document the consent mechanism chosen, the legal advice obtained, and the ICO guidance relied upon before build.
- The choice of mechanism must be confirmed by a human DPO, not by an agent.

**Exception process:** No exception to Art 8 for commercial services. ICO enforcement plus reputational risk if the platform is found to have processed children's data without verifiable parental consent.

---

## 4. Privacy and Electronic Communications Regulations 2003 (PECR)

**Jurisdiction:** UK-wide
**Authority:** ICO
**Key instruments:** PECR regs 5–6 (cookies and tracking technologies); regs 19–24 (electronic marketing — email, SMS, push notifications)

**Applicability rationale:** Revizr will use cookies and similar technologies (analytics, session management). It will send marketing emails (to parents at point of acquisition, during free-tier use), transactional emails (receipts, renewal notices), and operational communications (weekly email digest F17). Any marketing by electronic means to individuals requires compliance with PECR.

**Hard constraints:**
- **H-020 (PECR reg 6):** Non-essential cookies require prior, freely given, specific, and informed consent. This means a genuine opt-in cookie banner (not a dark-pattern "accept all" that appears to offer choice but doesn't). "Strictly necessary" cookies (session authentication, load balancing) are exempt.
- **H-021 (PECR reg 22):** Marketing emails require prior consent unless the "soft opt-in" applies. The soft opt-in applies only to existing customers in relation to similar products. For new leads (free-tier users who have not paid), prior consent is required before marketing emails are sent.
- **H-022 (PECR reg 22):** Marketing to children via email requires parental consent — children cannot give valid PECR consent.
- **H-023 (PECR reg 19):** Push notifications sent to users' devices are subject to PECR. Under-16 users must have parental consent before push notifications are enabled (Condition C-009(d), F26).

**Recommended mitigations:**
- Implement a PECR-compliant cookie consent mechanism on first visit (Condition C-008). Use a compliant consent management platform (CMP) rather than custom implementation. The ICO has published cookie consent guidance; follow it precisely.
- Distinguish marketing, transactional, and operational email in the consent model. The parent email digest (F17) is operational (account service); it should still have an opt-out. Marketing emails require opt-in.
- Do not send any email to under-18 users without parental consent. All email communications for student users should be routed to the parent account email.

**Exception process:** Soft opt-in exception (PECR reg 22(3)) allows marketing to existing customers without prior consent for similar products if the customer was given a clear opportunity to opt out at time of data collection. This can apply to parents who have provided an email address during signup — but only for marketing directly related to Revizr's services, and only if an unsubscribe mechanism was provided.

---

## 5. Consumer Rights Act 2015

**Jurisdiction:** England, Wales, Northern Ireland
**Authority:** Competition and Markets Authority (CMA); Trading Standards
**Key instruments:** CRA 2015 Part 1 Chapter 2 (digital content); s.34–42 (consumer rights for digital content); s.9–17 (goods); Sch.2 (unfair contract terms)

**Applicability rationale:** Revizr is a direct-to-consumer subscription service for digital content. The Consumer Rights Act applies to all business-to-consumer contracts. The subscription model (monthly/annual, with a free tier conversion) creates specific cancellation and refund obligations.

**Hard constraints:**
- **H-024 (s.36):** Digital content supplied to consumers must be of satisfactory quality and fit for purpose. If the diagnostic engine produces materially inaccurate results, this could constitute a breach of s.36.
- **H-025 (s.37):** Digital content must match its description. Claims about exam board coverage must be accurate — if CCEA or WJEC coverage is incomplete, selling a subscription on the basis of full coverage would breach s.37.
- **H-026 (Sch.2, Part 1):** Unfair contract terms (e.g., automatic annual renewal with no clear prior notice, terms that restrict consumer rights beyond what the Act permits) are not binding.
- **H-027 (CRA + Subscription guidance):** The 14-day right to cancel under the Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013 applies to subscriptions entered into at a distance. The right to cancel within 14 days without reason applies unless the consumer has consented to immediate supply of digital content and acknowledged that the right to cancel is lost upon commencement of delivery. This exception must be explicitly invoked and documented (Condition C-015).
- **H-028:** Automatic subscription renewal must be clearly disclosed at point of sale and at renewal. The CMA's 2021 subscription guidance (while not yet statutory, represents enforcement expectation) requires: a clear reminder before renewal at the end of a free trial; a simple cancellation mechanism; no barriers to cancellation.

**Recommended mitigations:**
- State cancellation terms prominently at checkout: "You can cancel any time. Your access continues until the end of the paid period. No refund for partial periods" (or whatever the actual policy is). The policy must be fair and compliant.
- If the 14-day cancellation right is waived on immediate digital access, the consumer must tick a box explicitly confirming this and acknowledging they lose the cancellation right. This must be logged.
- Implement a one-click (or very simple) cancellation mechanism in account settings. The CMA has taken enforcement action against services that make cancellation difficult.
- Ensure marketing materials accurately represent exam board coverage. Do not claim CCEA or WJEC coverage in marketing until C-003 (copyright clearance) confirms what can actually be served.

**Exception process:** CMA has powers to investigate and require changes to subscription practices under the CRA. Trading Standards can enforce at local level. Consumer redress is via courts or ADR.

---

## 6. Copyright, Designs and Patents Act 1988 (CDPA 1988)

**Jurisdiction:** England, Wales, Northern Ireland (UK-wide for copyright)
**Authority:** Intellectual Property Office (IPO); courts (civil litigation)
**Key instruments:** CDPA 1988 ss.1–16 (subsistence and ownership of copyright); ss.28–76 (permitted acts and exceptions); s.96–102 (remedies for infringement)

**Applicability rationale:** The 30,000-paper database contains works — examination questions and mark schemes — in which copyright subsists under CDPA 1988 ss.1 and 3. The exam boards (AQA, Edexcel/Pearson, OCR, CCEA, WJEC, Cambridge Assessment) are the authors or assignees of copyright in these works. Revizr's subscription model involves reproducing and distributing these works to paying subscribers, which is a restricted act under CDPA 1988 s.16(1)(a) and (b).

**Full analysis is in `copyright-analysis.md`. Summary of hard constraints:**

- **H-029:** Reproducing exam questions from a past paper and displaying them to a user is copying under CDPA 1988 s.17. Without a licence or a valid exception, this is infringement.
- **H-030:** Assembling personalised packs from multiple papers is a further restricted act (adaptation or compilation) under s.21.
- **H-031:** The educational copying exception (s.32) applies only where copying is done for the purposes of instruction or examination in a non-commercial context. It does not apply to a commercial subscription platform.
- **H-032:** The s.35 exception (lending/copying by educational establishments) applies only to educational establishments and does not extend to commercial third parties.
- **H-033:** No blanket fair-dealing exception covers commercial distribution of exam questions for a subscription fee.

**Recommended mitigations:**
- Begin licence negotiations with all six exam boards immediately. This is the longest-lead-time item in the project. Negotiations typically take months; CCEA and WJEC, as publicly funded bodies, may have different licensing models than commercial boards (AQA is a charity; Edexcel/Pearson is commercial). See `copyright-analysis.md` for board-specific analysis and recommended approach.
- Do not serve any question to any user (including free-tier users receiving "three sample questions") until the relevant board's licence is confirmed in writing.
- Condition C-003 is an absolute pre-launch blocker.

**Exception process:** Copyright infringement carries civil remedies (injunction, damages, account of profits) and potentially criminal liability for commercial-scale infringement under s.107 CDPA 1988. No product exception exists. The only path is negotiated licences.

---

## 7. Equality Act 2010

**Jurisdiction:** England, Wales, Northern Ireland (Disability Discrimination Act 1995 remains in force for some NI provisions; the Equality Act 2010 applies to England and Wales fully; DDA 1995 as amended applies in NI — the practical standard is equivalent)
**Authority:** Equality and Human Rights Commission (EHRC); courts
**Key instruments:** Equality Act 2010 ss.20–22 (duty to make reasonable adjustments for disabled persons); s.26 (harassment); Part 3 (provision of services to the public)

**Applicability rationale:** Revizr is a service provided to the public. It must not unlawfully discriminate against disabled users. Students with visual impairments, motor difficulties, dyslexia, autism, or other disabilities are part of the user base (the 11+ and GCSE cohorts include users with SEN). The WCAG 2.2 AA accessibility obligation in spec.md is directly connected to Equality Act compliance.

**Hard constraints:**
- **H-034:** A service provider has a duty to make "reasonable adjustments" to remove substantial disadvantage for disabled users. For a digital service, this means the platform must be accessible. Failure to meet WCAG 2.2 AA is evidence of failure to make reasonable adjustments.
- **H-035:** The student interface for the 11+ cohort (age 9–11) must be accessible to users with reading difficulties and limited fine motor skills. This is a design constraint, not just a policy one.

**Recommended mitigations:**
- Conduct a WCAG 2.2 AA accessibility audit before launch (Condition C-016).
- Include accessibility testing as part of every sprint's definition of done.
- Specifically test: screen reader compatibility (JAWS, NVDA, VoiceOver), keyboard navigation, colour contrast, text resize to 200%, and the mobile touch target size requirements.
- Consider commissioning an accessibility audit by a third party with experience in EdTech for the under-18 user cohort.

**Exception process:** The duty to make reasonable adjustments is qualified by "reasonableness" — a startup cannot be held to the same standard as a large platform, but a digital-native product has no reasonable excuse for failing basic WCAG 2.2 AA. EHRC enforcement; civil litigation by affected users.

---

## 8. Welsh Language (Wales) Measure 2011

**Jurisdiction:** Wales
**Authority:** Welsh Language Commissioner
**Key instruments:** Welsh Language (Wales) Measure 2011; Welsh Language Standards (Welsh public bodies)

**Applicability rationale:** Revizr covers WJEC exam board papers, which are used primarily in Wales, including Welsh-medium schools. If Revizr markets directly to schools in Wales or positions itself as covering Welsh-medium qualifications, Welsh language obligations may apply. The Welsh Language Standards apply primarily to Welsh public bodies, not private companies — however, companies working with Welsh public sector bodies (including schools) may face contractual Welsh language requirements.

**Hard constraints:**
- **H-036:** This regime does not automatically apply to a private company in its direct-to-consumer operations. However, if Revizr sells B2B to Welsh local authority schools, the school (as a public body subject to Welsh Language Standards) may require the supplier to provide Welsh language support.
- **H-037:** If marketing materials explicitly claim Welsh-language qualification support (WJEC Welsh Language GCSE/A-level), a Welsh-language version of those materials may be commercially necessary to credibly serve that market, even if not legally mandated.

**Recommended mitigations:**
- Before marketing in Wales or to Welsh schools, obtain a legal opinion on Welsh language obligations (Condition C-018). Do not assume English-only interface is sufficient.
- If WJEC Welsh-language subject coverage is included in the database (Welsh GCSE, Welsh Language A-level), assess whether in-product Welsh language interface is required.
- For B2B school sales in Wales, include Welsh language in the due diligence checklist for the school licence product (F24).

**Exception process:** The Welsh Language Commissioner issues compliance notices. Applicable to public bodies first; private companies face obligations primarily through contractual routes with public bodies.

---

## 9. CAP Code (Committee of Advertising Practice — UK Non-Broadcast Advertising Code)

**Jurisdiction:** UK-wide (non-broadcast advertising)
**Authority:** Advertising Standards Authority (ASA)
**Key instruments:** CAP Code sections 1–4 (general), section 3 (misleading advertising), section 5 (children), sections 8 (sales promotions)

**Applicability rationale:** Revizr will run paid social advertising (Facebook/Instagram targeting UK parents), content marketing, a referral programme (F30), and potentially Mumsnet sponsorship. All of these are subject to the CAP Code.

**Hard constraints:**
- **H-038 (CAP Code 3.1):** Advertisements must not mislead. Claims about exam board coverage, AI diagnostic accuracy, or educational outcomes must be substantiated. Specifically: "authentic past papers" can only be claimed when copyright licences are in place (Condition C-003 must precede any marketing that makes this claim).
- **H-039 (CAP Code 5):** Advertisements directed at children must not exploit children's inexperience or credulity. Ads targeting parents about an educational product are not caught by the same restrictions as ads directly targeting children, but the product interface itself (if gamified) must not constitute misleading advertising.
- **H-040 (CAP Code 8):** The referral programme (F30) is a sales promotion and must state its terms clearly, including the cap (six months' maximum credit), the conditions for earning the credit, and the expiry.
- **H-041:** Testimonials used in marketing must be genuine and accurately represent the experience of the user quoted. Using invented or composite testimonials is a CAP Code breach.

**Recommended mitigations:**
- Condition C-019: All marketing claims reviewed for CAP Code compliance before campaigns launch.
- Ensure pricing is always stated clearly (including VAT if applicable, and the renewal price after any introductory offer).
- Have the referral programme terms reviewed for CAP Code compliance before launch (Condition C-020).

**Exception process:** ASA adjudication is public and reputationally damaging. Clearance advice can be sought from CAP Copy Advice before campaigns launch (free service).

---

## 10. DfE Data Sharing Guidance for Schools and ICO Data Sharing Code of Practice

**Jurisdiction:** England and Wales (DfE guidance); UK-wide (ICO code)
**Authority:** Department for Education (DfE); ICO
**Key instruments:** DfE "Data Protection: a toolkit for schools" (2018, updated); ICO Data Sharing Code of Practice (2021); Keeping Children Safe in Education (KCSIE) statutory guidance

**Applicability rationale:** The B2B school licence product (F24) and the teacher portal (F18) both involve Revizr receiving and sharing data about students from or to school-connected parties. Schools have specific data protection obligations under KCSIE and DfE guidance; any platform they use must meet those standards before a school DPO will approve it.

**Hard constraints:**
- **H-042:** When Revizr operates as a data processor for a school (B2B school licence), it must have a DPA in place with each school. The DPA must meet DfE guidance requirements. Condition C-017.
- **H-043:** The teacher portal (F18) involves sharing a student's personal data with a tutor/teacher. This sharing requires the lawful basis to be established. For a private tutor (not employed by the school), the sharing is not covered by the school's data processing framework — it requires explicit parental consent (Condition C-011).
- **H-044:** KCSIE requires schools to carry out due diligence on any third-party platform handling student data. Revizr must produce a Data Protection and Security Statement that a school DPO can assess. This must be available before the B2B channel is activated.

**Recommended mitigations:**
- Prepare a school-facing Data Protection and Security Statement before any B2B sales activity.
- Produce a template DPA for school licences (Condition C-017).
- Do not begin B2B school sales until the DPA template is reviewed by a UK education sector DP lawyer.

---

## 11. Northern Ireland Data Protection — Post-Brexit Position

**Jurisdiction:** Northern Ireland
**Authority:** ICO (the ICO's remit extends to Northern Ireland for UK GDPR and DPA 2018)

**Applicability rationale:** Revizr targets Northern Ireland (CCEA exam board, Siobhan O'Neill persona). Data protection in Northern Ireland post-Brexit is governed by the same UK GDPR framework as England and Wales. The ICO is the supervisory authority. There is no separate NI data protection regime for Revizr's purposes.

**Hard constraints:**
- None additional beyond the UK GDPR regime (Regime 1). The UK GDPR applies uniformly.

**Note:** CCEA as a public body in Northern Ireland may have additional data handling requirements for any dataset it licenses to Revizr. These would be contractual conditions in the copyright licence negotiation, not regulatory constraints on Revizr directly.

---

## 12. Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013

**Jurisdiction:** UK-wide
**Authority:** Trading Standards; CMA
**Key instruments:** CCRs 2013 (implementing Consumer Rights Directive); regs 9–14 (pre-contractual information); regs 27–38 (right to cancel)

**Applicability rationale:** Revizr is a distance contract (online subscription). The CCRs require specific pre-contractual information to be provided before the consumer is bound, and establish the 14-day cancellation right.

**Hard constraints:**
- **H-045:** Before the consumer completes the subscription checkout, specific information must be displayed: price (including all taxes), duration of contract, right to cancel (or confirmation that the right is lost upon digital content delivery), trader identity and address. This is a pre-build requirement for the checkout flow.
- **H-046:** If the 14-day right to cancel is waived (on commencement of digital content delivery), the consumer must be shown clear confirmation of this and tick a box acknowledging it.

**Recommended mitigations:**
- Include a CCR-compliant checkout flow in the billing specification. This is integrated into Condition C-015.

---

## Summary Risk Matrix

| Regime | Risk Level | Pre-Build Blocker | Condition(s) |
|--------|-----------|-------------------|-------------|
| UK GDPR / DPA 2018 | HIGH | Yes | C-001, C-004, C-005, C-006, C-007, C-010, C-011, C-012, C-013, C-014 |
| AADC Children's Code | HIGH | Yes | C-001, C-002, C-009 |
| UK GDPR Art 8 (children's consent) | HIGH | Yes | C-001, C-002 |
| PECR | MEDIUM | Yes (before marketing) | C-008 |
| Consumer Rights Act 2015 | MEDIUM | Yes (before billing build) | C-015 |
| CDPA 1988 (copyright) | HIGH | Yes | C-003 |
| Equality Act 2010 | MEDIUM | Yes (before launch) | C-016 |
| Welsh Language Measure 2011 | LOW-MEDIUM | No (flag for Wales B2B) | C-018 |
| CAP Code | LOW | No (before marketing launch) | C-019, C-020 |
| DfE / ICO Data Sharing | MEDIUM | No (before B2B sales) | C-017 |
| NI Data Protection | LOW | No (covered by UK GDPR) | — |
| CCRs 2013 | MEDIUM | Yes (billing build) | C-015 |

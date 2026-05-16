---
feature: 002-revizr
document: dpia-screening
phase: 4
squad: compliance-risk-governance
authored_by: compliance-officer-agent
date: 2026-05-15
feature-under-assessment: F2 — School Report and Teacher Notes Upload for Diagnostic
data-classes-in-scope:
  - C3 (Customer PII)
  - C5 (Special Category — health, disability, SEN indicators)
  - C7 (Children's Data — student is a minor)
outcome: full-dpia-required
dpia-required-reason: >
  Processing involves systematic large-scale processing of personal data of children,
  combined with extraction of special-category data (health, disability/SEN indicators),
  using novel AI technology (automated parsing and profiling). Three independent
  criteria under UK GDPR Art 35 and ICO DPIA guidance are each individually sufficient
  to require a full DPIA. All three are present.
dpia-owner: human-DPO
dpia-must-precede: build-of-F2
---

# DPIA Screening — School Report Upload Feature (F2)

## Feature Under Assessment

**F2 — School Report and Teacher Notes Upload for Diagnostic**

A user (student or parent) uploads a PDF, image, or plain-text school report or teacher notes during onboarding. The diagnostic engine (AI model) analyses the uploaded document to identify topic-level weaknesses per subject and exam board. This upload is available in the free tier. The topic weakness map produced from the analysis is the central output driving the entire product experience.

---

## Step 1: Is Processing Likely to Result in High Risk?

UK GDPR Article 35(1) and the ICO's DPIA guidance require a DPIA when processing is "likely to result in a high risk to the rights and freedoms of natural persons." The ICO identifies nine types of processing that typically require a DPIA. This screening assesses each type against F2.

### 1.1 Evaluation or Scoring (Including Profiling)

**Present? YES.**

The diagnostic engine creates a profile of a child's academic weaknesses by parsing their school report. This is automated profiling of an individual that produces a structured output (the topic weakness map) used to determine what content the child receives. The individual is a child, which elevates the risk classification. Profiling of children using automated means is one of the ICO's explicitly high-risk categories.

### 1.2 Automated Decision-Making with Legal or Similarly Significant Effect

**Present? BORDERLINE — flag for full DPIA assessment.**

The topic weakness map directly determines which practice questions the child receives. This is not a "legal" decision, but it may have a "similarly significant effect" on the child's educational experience and exam preparation. An inaccurate weakness map (e.g., incorrectly flagging a topic as weak when it is not) could cause the child to over-practise irrelevant material and under-practise genuinely weak areas — with potential exam performance consequences. The ICO's guidance on what constitutes a "significant effect" includes decisions that affect access to educational opportunities. This warrants examination in a full DPIA.

### 1.3 Systematic Monitoring

**Not the primary trigger, but note:** the product systematically monitors students' revision behaviour (session logs, score progression, topic coverage). This is inherent to the product's value proposition. It is not the trigger for the DPIA at this screening, but it must be addressed within the full DPIA scope.

### 1.4 Sensitive Data or Data of a Highly Personal Nature

**Present? YES — and this is the most significant trigger.**

UK school reports frequently contain observations and assessments that constitute special-category data under UK GDPR Article 9. Specifically:

| Category (Art 9(1)) | How it appears in UK school reports |
|---------------------|-------------------------------------|
| **Health data** | References to absences due to illness, medical conditions affecting attendance or performance, anxiety, depression, eating disorders |
| **Disability data** | References to disability status, adaptations made (e.g., "extra time in exams"), mobility or sensory impairments |
| **SEN status** | SEND (Special Educational Needs and Disabilities) designations, EHC (Education, Health and Care) plan references, dyslexia, dyspraxia, autism spectrum diagnoses, ADHD assessments |
| **Mental health** | Teacher observations on wellbeing, counsellor referrals, pastoral concerns recorded in the report |

These categories are not theoretical. UK school reports — particularly those from secondary schools for GCSE students — routinely include these references, often in the body of teacher comments. A school report uploaded by a parent for a child with an EHC plan will almost certainly contain explicit special-category data.

The diagnostic AI model receives the raw document. It does not know in advance which documents will contain special-category data. It must be assumed that a material proportion of uploaded documents will contain special-category data. This means F2 involves systematic large-scale processing of special-category data of children. This is a high-risk category requiring a full DPIA.

### 1.5 Data Processed on a Large Scale

**Present? YES (at expected scale).**

Revizr's business model involves serving a national consumer market. At Year 1 targets, tens of thousands of school reports may be uploaded. Even at early-stage volumes, the combination of sensitive data class and child data classification means scale does not need to be large to trigger the DPIA requirement — the ICO's guidance notes that scale and sensitivity interact: high sensitivity requires a DPIA even at lower scale.

### 1.6 Matching or Combining Datasets

**Present? BORDERLINE.**

The diagnostic engine combines the school report content with: (a) the student's stated exam level and board; (b) the platform's question database. The output is a profile used to select content for the child. This combination of datasets to produce a personalised output is relevant to the DPIA assessment.

### 1.7 Data Concerning Vulnerable Individuals

**Present? YES.**

The data subjects are children, including children as young as age 9. Children are explicitly identified as vulnerable individuals in ICO guidance. Processing data of children using novel AI technology, where that data may include health or SEN indicators, is consistently treated as high-risk.

### 1.8 Innovative Use or Application of New Technological or Organisational Solutions

**Present? YES.**

The AI parsing of informal, varied-format school reports is an innovative use of technology. School reports are not structured data — they are free-text documents written by different teachers in different styles, varying in format across schools, year groups, and exam levels. Applying NLP/AI to extract topic-weakness signals from this unstructured corpus is technically novel and introduces model error risk that is difficult to bound in advance.

### 1.9 Data Transfer Across Borders or Between Organisations

**Present? POTENTIALLY YES.**

The AI model used for parsing is a third-party service (provider TBD). If that model runs on non-UK infrastructure, the school report content (including special-category data of children) would be transferred to a non-UK processor. A transfer impact assessment is required. This must be addressed in the DPA with the AI provider (Condition C-013).

---

## Step 2: Outcome — Full DPIA Required

**All three independent thresholds under UK GDPR Art 35 and ICO guidance are met:**

1. Automated profiling of children → high risk by category.
2. Systematic processing of special-category data (health, disability, SEN) at scale → high risk by data class.
3. Novel AI technology applied to unstructured documents from a vulnerable population → high risk by technology type.

**A full DPIA must be completed and documented before F2 is built.** The DPIA cannot be delegated to an agent. It requires human DPO review and sign-off.

The DPIA must be completed as a document in `.specify/memory/evidence/` (or equivalent immutable evidence store) before the Build squad receives any task touching F2. The Build squad must not begin work on the diagnostic engine's document-processing pipeline until the DPIA is complete and any mitigating measures identified in the DPIA are incorporated into the build specification.

---

## Step 3: DPIA Scope Definition

The full DPIA must address the following areas. This screening document does not constitute the DPIA — it defines the scope that the DPO must investigate.

### 3.1 Data Flow Mapping (Required in the DPIA)

The DPIA must map the following data flows for F2:

```
User (student or parent)
  → Uploads document (PDF/image/text)
  → Document transmitted to Revizr servers (TLS)
  → Document stored in Revizr document store (temporary or persistent — TBD)
  → Document transmitted to AI model API (TLS)
  → AI model parses document, returns structured output (topic weakness signals)
  → Structured output stored in Revizr database (persistent — topic weakness map)
  → Original document: retained or deleted? (policy TBD — data minimisation critical)
  → AI provider: does document content leave the API call? Is it logged? Retained for training?
```

Each step in the data flow must be assessed for:
- Data class (C3, C5, C7)
- Technical controls (encryption in transit and at rest, access controls)
- Retention (how long is data held at each step?)
- Third-party involvement (AI provider, cloud storage provider)
- Transfer risk (is data leaving the UK?)

### 3.2 Lawful Basis for Special-Category Data (Required in the DPIA)

UK GDPR Article 9 requires both an Article 6 basis and an Article 9 condition. For special-category data extracted from school reports, the DPIA must confirm:

**Proposed lawful basis (for the DPIA to validate or revise):**
- Art 6 basis: Consent (Art 6(1)(a)) — the parent explicitly uploads the document and consents to its processing.
- Art 9 condition: Explicit consent (Art 9(2)(a)) — the parent is informed, at the point of upload, that the document may contain sensitive information about their child (health, SEN, wellbeing), and explicitly consents to this data being processed by the AI diagnostic engine.

**The DPIA must assess whether this consent is freely given, specific, informed, and unambiguous given that:**
- The consent is for processing a document whose content the user may not fully anticipate (a school report written by a teacher may contain data the parent has not noticed).
- The user is consenting on behalf of a child — the consent must satisfy the elevated standard for child data.
- The consent must cover the third-party AI provider as a sub-processor.

**Alternative basis to consider (DPIA to assess):** DPA 2018 Sch.1 Part 2 para 6(2)(a) — processing for substantial public interest in education. This is a weaker basis for a commercial product and requires a senior responsible officer policy. The DPIA should assess and document whether this basis is viable as a fallback.

### 3.3 Data Minimisation Requirements (DPIA Must Address)

This is the single most operationally significant data minimisation question for F2:

**What data from the school report is retained after diagnostic processing?**

The DPIA must assess and produce a recommendation on each of the following options:

| Option | Description | Data Minimisation Assessment |
|--------|-------------|------------------------------|
| A | Raw document retained indefinitely | Fails data minimisation. Original document contains far more data than is necessary for the weakness map. Contains special-category data not needed after extraction. |
| B | Raw document retained for a defined period (e.g., 30 days) then deleted | Partial compliance. Must be assessed in DPIA — what legitimate purpose does retention serve? |
| C | Raw document deleted immediately after AI processing is complete | Best data minimisation outcome. The diagnostic output (topic weakness map) is retained; the source document is not. |
| D | User is given explicit control — document retained or deleted per user preference, with deletion available on demand | Satisfies Art 22 right to erasure and AADC Standard 8. Recommended as default-to-deletion with user option to retain. |

**Recommendation from this screening (for DPIA to confirm or revise):** Option D, with default-to-deletion at the end of processing. The topic weakness map (structured data only, no free-text from the report) is the legitimate output. The raw document should not be retained as a matter of default. The DPIA must formalise this recommendation and translate it into a build requirement.

**What data in the topic weakness map contains special-category indicators?**

If the AI diagnostic output includes any field that records "student has SEN support" or "student mentioned as having a disability," that field is itself special-category data and requires the same protections as the source document. The DPIA must specify:
- What the output schema of the diagnostic engine is.
- Which fields, if any, carry special-category data.
- Whether those fields can be eliminated by constraining the AI model's output to topic-weakness signals only (which do not in themselves constitute health data).

**Strong recommendation:** The diagnostic engine's output should be constrained to topic-level performance signals only. It must not output or store any field that records the presence of SEN, health conditions, or mental health indicators from the source document. If the AI model identifies that a document contains health-related language, it should extract only the topic-weakness implication (e.g., "extended absence affected French performance") without recording the health observation itself. This constraint must be built into the model's system prompt and output schema, and validated before go-live.

### 3.4 Risk Assessment (DPIA Must Complete)

The DPIA must assess the following risks at minimum:

| Risk ID | Risk Description | Likelihood | Severity | Required Mitigation |
|---------|-----------------|------------|----------|---------------------|
| R-F2-01 | AI model retains or trains on uploaded documents containing child health data | Medium | Critical | DPA with AI provider explicitly prohibiting training on customer data (Condition C-013) |
| R-F2-02 | AI model incorrectly extracts or misclassifies data, creating inaccurate profiles affecting exam preparation | Medium | High | Confidence score mechanism (F15); user ability to correct weakness map; DPIA to recommend testing protocol |
| R-F2-03 | Data breach of document store exposing children's health/SEN data | Low-Medium | Critical | Encryption at rest (AES-256 minimum), access controls, breach notification plan |
| R-F2-04 | Non-UK AI provider processes school report containing C7+C5 data without adequate safeguards | Medium | High | TIA and SCCs required before any real data sent to model (Condition C-013) |
| R-F2-05 | Parent uploads a school report containing another child's data (e.g., sibling in same class) | Low | Medium | User instruction to upload only own child's report; technical de-duplication not feasible; note in privacy notice |
| R-F2-06 | Third party gains access to uploaded document via account compromise | Low | Critical | C6 data (auth secrets) must be protected per constitution; MFA option for parent accounts |
| R-F2-07 | Subject access request requires retrieval and disclosure of raw document | Medium | Medium | If document is deleted post-processing (Option D), this risk is eliminated; this supports the Option D recommendation |

### 3.5 Measures to Address Risk (DPIA Must Define)

The DPIA must confirm or revise the following proposed measures:

1. **Default document deletion after processing:** Raw uploaded document deleted upon successful generation of the topic weakness map. User notified. User can re-upload at any time. (Addresses R-F2-03, R-F2-07.)

2. **Output schema constraint:** AI model output constrained to topic-weakness signals only. No special-category data in the output schema. Build requirement to be specified before AI model integration work begins. (Addresses R-F2-02 partially, R-F2-03 for stored output data.)

3. **AI provider DPA with explicit prohibitions:** DPA with the AI model provider must include: no training on Revizr customer data; no logging of input content beyond the current API call; data residency commitment (UK or adequate jurisdiction); deletion on request. (Addresses R-F2-01, R-F2-04.)

4. **Transfer Impact Assessment for AI provider:** If the AI provider is not UK-resident, a TIA must be completed and SCCs executed before any production data is processed. (Addresses R-F2-04.)

5. **Explicit consent for special-category data:** At point of document upload, the user is shown a specific consent statement: "Your school report may contain sensitive information about your child's health, wellbeing, or learning support needs. By uploading this document, you consent to Revizr's AI processing this information to identify topic-level revision priorities. The original document will be deleted after processing." Consent is recorded with timestamp and consent text hash. (Addresses lawful basis under Art 9(2)(a).)

6. **Confidence score for diagnostic output:** Where the AI's topic-weakness extraction is low-confidence (F15), the user is informed and directed to the alternative diagnostic test (F3). This reduces the risk of inaccurate profiling. (Addresses R-F2-02.)

---

## Step 4: Residual Risk Assessment

After all proposed mitigations are applied, the residual risk is assessed as follows:

| Risk Category | Residual Risk | Rationale |
|---------------|--------------|-----------|
| Data breach of raw document | LOW (if Option D implemented) | Document deleted post-processing; nothing to breach |
| AI model misuse of data | LOW-MEDIUM | Dependent on quality of DPA with AI provider and verification of compliance |
| Inaccurate diagnostic profile | MEDIUM | Cannot be eliminated; managed by confidence scores and user correction pathway |
| Special-category data in output | LOW (if output schema constrained) | Technical control + contractual prohibition on AI provider |
| Non-UK transfer | LOW (if TIA + SCCs executed) | Standard contractual mechanisms in place |

**Residual risk is acceptable provided all mitigating measures are confirmed in the full DPIA and incorporated as build requirements.**

---

## Step 5: DPIA Outcome and Recommendations

### Outcome
**Full DPIA is required.** This screening document establishes that all relevant thresholds under UK GDPR Art 35 and ICO guidance are met. The full DPIA must be completed and documented by a human DPO before F2 is built.

### Conditions Triggered
- **Condition C-004 (compliance-decision.md):** Full DPIA for school-report upload feature before build.
- **Condition C-013 (compliance-decision.md):** DPA with AI model provider before any real user data is sent to the model.

### Build Requirements Flowing from this Screening

The following build requirements must be incorporated into the F2 specification, pending confirmation or revision by the full DPIA:

| BR-ID | Requirement | Status |
|-------|------------|--------|
| BR-F2-01 | Raw uploaded document deleted from all Revizr systems upon successful generation of topic weakness map. Deletion is permanent and confirmed to the user. | Recommended — DPIA to confirm |
| BR-F2-02 | Diagnostic AI model output schema is constrained to topic-level signals only. No field in the output schema may record health, disability, SEN, or mental health indicators from the source document. | Required — DPIA to formalise |
| BR-F2-03 | At point of document upload, user is shown a specific Art 9 consent statement covering special-category data processing. Consent is recorded with timestamp, user identifier, and consent text hash in an immutable audit log. | Required |
| BR-F2-04 | Data Processing Agreement with AI model provider must include: prohibition on training on customer data; no logging of input content beyond current API call; data residency in UK or adequate jurisdiction (or SCCs executed); deletion on Revizr's request within 30 days. DPA must be executed before any production document is sent to the model. | Required (Condition C-013) |
| BR-F2-05 | Transfer Impact Assessment for AI model provider completed before any real user data is transmitted to the model. If provider is non-UK-resident, SCCs must be executed. | Required |
| BR-F2-06 | Confidence score (F15) is computed for every diagnostic output from a document upload. Where confidence is below the defined threshold, the user is shown a plain-language notice that the diagnosis is tentative and offered the in-product diagnostic test (F3) as a supplement. | Required |
| BR-F2-07 | The data retention schedule for all data classes produced by F2 must be defined in the ROPA and displayed to users in the privacy notice before any upload feature is live. | Required |

---

## Consultation and Sign-Off

This DPIA screening is produced by the Compliance Officer Agent. It must be reviewed and the full DPIA must be completed and signed off by:

1. **Human DPO or external DPO service** — mandatory. No agent can sign off a DPIA for processing of children's special-category data.
2. **UK DP-qualified legal advisor** — recommended for the lawful basis assessment (Art 9 condition) and the AI provider DPA review.
3. **Build squad technical lead** — to confirm that BR-F2-01 through BR-F2-07 are technically implementable as stated and to propose alternatives where they are not.

The signed DPIA must be filed in `.specify/memory/evidence/` as an immutable artefact before any build task for F2 is scheduled.

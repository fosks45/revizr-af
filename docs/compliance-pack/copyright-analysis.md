---
feature: 002-revizr
document: copyright-analysis
phase: 4
squad: compliance-risk-governance
authored_by: compliance-officer-agent
date: 2026-05-15
content-asset: 30,000+ exam board past papers (questions and mark schemes)
rights-holders:
  - AQA (Assessment and Qualifications Alliance)
  - Edexcel / Pearson
  - OCR (Oxford, Cambridge and RSA Examinations)
  - CCEA (Council for the Curriculum, Examinations and Assessment)
  - WJEC (Welsh Joint Education Committee / CBAC)
  - Cambridge Assessment International Education
outcome: commercial-licence-required-from-each-rights-holder
blocker: true
blocking-condition: C-003
human-legal-review-required: true
---

# Copyright Analysis — Exam Board Past Papers

## 1. Executive Summary

Revizr's core commercial model depends on distributing authentic past examination questions and mark schemes to subscribers. These works are protected by copyright under the Copyright, Designs and Patents Act 1988. The rights in them are held by the exam boards that created them. Displaying, reproducing, and distributing these works through a subscription service — which is what Revizr does when it assembles personalised question packs for paying subscribers — is a restricted act under the CDPA 1988. No applicable statutory exception covers commercial distribution.

**The conclusion is unambiguous: Revizr requires a commercial licence from each of the six exam boards before it may serve any question or mark scheme from that board to any user, including free-tier users.**

This is the single largest lead-time item in the project. Licence negotiations with examination bodies can take months to years. The Build squad must not build the content-serving pipeline for any board until that board's written licence is confirmed. This is Condition C-003 in the compliance decision.

This document does not constitute legal advice. It is a compliance analysis identifying the applicable law, the likely legal position, and the actions required. An IP-qualified solicitor must review the copyright clearance strategy before any licensing negotiations are initiated or any content is served to users. **This document is flagged for mandatory human legal review.**

---

## 2. Copyright Subsistence and Ownership

### 2.1 What Copyright Subsists in Exam Papers?

Under CDPA 1988:

- **Section 1(1)(a):** Copyright subsists in original literary works. Examination question text is a literary work under s.3(1).
- **Section 1(1)(b):** Copyright subsists in original dramatic, musical, or artistic works. Diagrams, graphs, maps, and images within exam papers are artistic works under s.4.
- **Section 3A:** Databases of exam questions (the question bank) may qualify as a database within the meaning of the Database Directive (implemented via the Copyright and Rights in Databases Regulations 1997). A database right may subsist in the structured collection of past papers, separately from the copyright in individual questions.

A single exam paper typically contains dozens of individual works: each question is an original literary work; each diagram or table is an original artistic work; the paper as a whole may be a compilation work. Each of these works attracts separate copyright protection.

### 2.2 Who Holds the Copyright?

Copyright in an exam paper vests in the first instance in the author(s) of the work (the examiners who wrote the questions). However, for employees working within the scope of their employment, copyright vests in the employer under CDPA 1988 s.11(2). Exam boards commission questions from chief examiners, assistant examiners, and item writers. Depending on the contractual arrangements, copyright may be:

- Held by the exam board as employer (most likely for staff examiners).
- Assigned to the exam board by freelance item writers under contract (most common for contracted authors).
- Retained by the item writer (less common, but possible if the contract did not include a copyright assignment — in practice this is rare for exam material).

**For practical purposes:** All six exam boards (AQA, Edexcel/Pearson, OCR, CCEA, WJEC, Cambridge Assessment) assert copyright ownership in their published past papers and mark schemes. Their websites include explicit copyright notices. Revizr should treat each exam board as the legal owner of the copyright in its papers for the purpose of licensing negotiations, unless an IP lawyer's investigation of specific contracts indicates otherwise. Challenging exam board copyright ownership would be expensive, uncertain, and likely to damage the licensing relationship.

### 2.3 Duration of Copyright

Literary and artistic works: copyright lasts for 70 years from the end of the calendar year of the author's death (CDPA 1988 s.12). For works of unknown authorship or computer-generated works: 50 years from creation. For Crown copyright (if any papers involve Crown authorship): 125 years.

**Practical implication:** Essentially all past exam papers in Revizr's database are still in copyright. Even papers from the 1970s and 1980s are protected if the author died within the last 70 years — which is highly likely for most living examiners. There is no shortcut via "old enough to be out of copyright" for papers from the last 50 years.

---

## 3. Restricted Acts Performed by Revizr

Revizr's model involves the following acts in relation to exam papers:

| Act | CDPA 1988 Reference | Applies to Revizr? |
|-----|--------------------|--------------------|
| Copying (reproduction) | s.16(1)(a), s.17 | YES — displaying a question to a user involves copying into the user's device and into Revizr's servers. |
| Issuing copies to the public | s.16(1)(b), s.18 | YES — distributing digital copies of questions to subscribers. |
| Communication to the public | s.16(1)(d), s.20 | YES — making questions available online for subscribers to access. |
| Making an adaptation (compilation) | s.16(1)(e), s.21 | YES — assembling personalised packs is an adaptation/compilation of multiple works. |
| Database extraction | Copyright and Rights in Databases Regulations 1997 | POSSIBLY — if the original papers constitute a database, extraction of substantial parts is a restricted act. |

Each of these acts requires authorisation from the copyright owner. Performing any of them without authorisation is copyright infringement under s.16(2) CDPA 1988.

---

## 4. Statutory Exceptions and Why They Do Not Apply

### 4.1 Fair Dealing for Research and Private Study (s.29)

Fair dealing with a literary or artistic work for the purposes of research for a non-commercial purpose does not infringe copyright. **This does not apply** because:
- Revizr is a commercial subscription service. The dealing is for a commercial purpose.
- The exception is for private study by the individual themselves, not for a platform distributing copies to many users for profit.

### 4.2 Fair Dealing for Education — Instruction and Examination (ss.32–36)

**Section 32:** Copying for the purposes of instruction or preparation for instruction does not infringe if done by or on behalf of an educational establishment and is not by means of a reprographic process. **This does not apply** because:
- Revizr is not an educational establishment within the meaning of the CDPA.
- The copying is by a commercial entity distributing to consumers, not within an educational establishment.

**Section 35:** Educational establishments may lend copies. **This does not apply** because Revizr is not an educational establishment and is not lending — it is distributing.

**Section 36:** Educational establishments may copy up to 1% of a published work per quarter. **This does not apply** for the same reasons as s.35.

**Section 33:** Anthologies for educational use — a short passage from a work may be included in a collection intended for use in educational establishments if the collection consists mainly of non-copyright material. **This does not apply** because:
- The collection (Revizr's question database) consists entirely of copyrighted material.
- Revizr is not an educational establishment.

### 4.3 Fair Dealing for Criticism, Review, or Reporting Current Events (s.30)

Quotation of a work for criticism or review is permitted if accompanied by sufficient acknowledgement. **This does not apply** because distributing exam questions to subscribers for practice purposes is not criticism or review of the works.

### 4.4 Incidental Inclusion (s.31)

Copyright is not infringed where a work is incidentally included. **This does not apply** because the exam questions are the deliberate and central content of the product.

### 4.5 The "Three Steps Test" and any remaining fair dealing argument

The UK fair dealing doctrine requires that any exception is (a) limited to certain special cases, (b) not in conflict with the normal exploitation of the work, and (c) not unreasonably prejudiced against the legitimate interests of the rights holder. Distributing 30,000 papers commercially through a subscription service directly competes with the exam boards' own paper distribution and any licensing revenue they would otherwise earn. It fails all three steps.

**Conclusion:** No statutory exception under the CDPA 1988 covers Revizr's intended use. A licence from each rights holder is required.

---

## 5. Exam Board-by-Board Analysis

### 5.1 AQA (Assessment and Qualifications Alliance)

**Corporate status:** Charitable company (registered charity). Not-for-profit. Headquartered in Manchester.
**Copyright position:** AQA's website states: "All rights reserved. Reproduction, distribution, display and use of the material on this website is governed by AQA's Terms & Conditions." Past papers are available for free download for educational use, but the terms state: "You may only use AQA past papers and mark schemes for your personal, non-commercial use." Commercial use requires a separate licence.
**Licensing history:** AQA has licensed content to third-party platforms before (for example, direct licensing to schools and educational publishers). A commercial content licence is feasible in principle but will require negotiation of royalty terms and scope.
**Recommended approach:** Initial contact with AQA's Rights & Permissions team. Frame the request as a bulk educational content licence for a subscription-based revision platform. AQA's charitable status may mean it is receptive to a deal that demonstrably benefits students. However, the commercial nature of Revizr means AQA will expect a royalty or licence fee that must be factored into unit economics.
**Risk level:** MEDIUM — AQA is experienced in licensing; the negotiation is tractable but may take several months.

### 5.2 Edexcel / Pearson

**Corporate status:** Commercial entity. Edexcel is a brand of Pearson Education Ltd (Pearson plc subsidiary). UK's largest awarding body by GCSE/A-level entry numbers.
**Copyright position:** Pearson explicitly asserts commercial copyright in all Edexcel papers. Pearson has an active IP protection programme. Pearson's terms for past papers downloaded from their website prohibit commercial use.
**Licensing history:** Pearson licenses content commercially (Pearson is itself a major educational publisher). However, Pearson may perceive a revision platform as competitive with its own revision product lines (Edexcel has published revision guides and online revision products). This creates a conflict of interest risk in licensing negotiations.
**Recommended approach:** Engage Pearson's Rights & Permissions team with a clear, professional licensing proposal. Be prepared for Pearson to be the most commercially demanding negotiating partner. Consider whether Pearson has a standard content licensing programme or requires a bespoke negotiation.
**Risk level:** MEDIUM-HIGH — Pearson is a sophisticated commercial rights holder that may seek high royalties or decline to license on competitive grounds. This is the highest-risk negotiation.
**Note for legal review:** If Pearson declines to license, legal advisor must assess whether there is any argument for compulsory licensing or competition law basis for access. This is unlikely to succeed but warrants assessment.

### 5.3 OCR (Oxford, Cambridge and RSA Examinations)

**Corporate status:** Regulated by Ofqual. A department of Cambridge Assessment, which is part of the University of Cambridge. Non-profit (surplus re-invested into education).
**Copyright position:** OCR asserts copyright in all examination materials. Past papers available for download under educational use terms; commercial use requires authorisation.
**Licensing history:** OCR/Cambridge Assessment has extensive experience licensing educational content. Cambridge Assessment is a large rights-management organisation with established commercial licensing processes.
**Recommended approach:** Contact Cambridge Assessment's IP licensing team (which handles both OCR and Cambridge Assessment International Education — see 5.6). A single negotiation may cover both OCR and Cambridge Assessment papers, which would reduce the total number of licensing relationships.
**Risk level:** LOW-MEDIUM — Cambridge Assessment is an experienced, professional licensor with established processes. Less likely to be adversarial than Pearson.

### 5.4 CCEA (Council for the Curriculum, Examinations and Assessment)

**Corporate status:** Non-departmental public body of the Northern Ireland Executive. Governed by the Qualifications, Curriculum and Examinations Authority Order 1990 (as amended).
**Copyright position:** CCEA asserts Crown copyright or CCEA copyright in all examination materials. As a public body, CCEA may have a different licensing framework than commercial awarding bodies. Open Government Licence (OGL) may apply to some CCEA materials — but the OGL requires attribution and does not automatically permit commercial use; it specifically requires that the materials are "not used in a way that suggests any official status or that CCEA endorses you or your use of the information."
**Licensing history:** CCEA is a relatively small organisation (compared to AQA or Pearson) with less commercial licensing experience. May require more time to negotiate and may not have a standard licence form ready.
**Recommended approach:** Early engagement is especially important given CCEA's smaller administrative capacity. Approach as a Northern Ireland-focused platform that is specifically trying to serve NI students (Siobhan O'Neill's JTBD is directly relevant here — a genuine NI focus may make CCEA receptive). Frame as supporting CCEA student access and outcomes.
**Risk level:** MEDIUM — CCEA is responsive to educational benefit arguments, but the commercial licensing process may be slower. OGL applicability must be assessed by an IP lawyer.
**Special note:** CCEA materials may be subject to devolved NI public body rules. Legal review should specifically assess whether Northern Ireland public body IP rules create any additional licensing obligations or opportunities.

### 5.5 WJEC (Welsh Joint Education Committee / CBAC)

**Corporate status:** Company limited by guarantee. Non-profit organisation. Headquartered in Cardiff.
**Copyright position:** WJEC asserts copyright in all examination materials. Website terms prohibit commercial use of past papers.
**Licensing history:** WJEC is a relatively compact organisation with limited commercial licensing infrastructure compared to AQA or Pearson.
**Recommended approach:** Similar to CCEA — early engagement emphasising the Wales-specific benefit. WJEC serves Welsh-medium and English-medium students; a platform that genuinely supports WJEC students (Siobhan O'Neill equivalent for Wales) may receive a positive reception.
**Risk level:** MEDIUM — similar to CCEA. Non-profit ethos may make WJEC receptive, but licensing process may be slower due to limited commercial licensing experience.
**Welsh Language note:** Any licence with WJEC for Welsh-language qualification papers may include conditions about Welsh-language interface requirements. This connects to Condition C-018 (Welsh Language Measure assessment).

### 5.6 Cambridge Assessment International Education (CAIE)

**Corporate status:** Part of Cambridge Assessment, which is part of the University of Cambridge. Non-profit.
**Scope for Revizr:** spec.md notes that CAIE is in scope for its UK GCSE/A-level papers (Cambridge IGCSEs, Cambridge International A Levels). International boards are out of scope in v1.
**Copyright position:** Cambridge Assessment has extensive IP rights management experience. CAIE past papers are explicitly copyright Cambridge Assessment.
**Licensing history:** Cambridge Assessment / CAIE has commercial licensing programmes and experience working with EdTech partners.
**Recommended approach:** Combined with OCR negotiation if OCR is also under Cambridge Assessment umbrella. CAIE may be willing to include UK-format GCSE/A-level paper licensing as part of an OCR/CAIE bundled agreement.
**Risk level:** LOW-MEDIUM — sophisticated, process-driven licensor. Most likely to have a clear licensing framework and process.

---

## 6. What Cannot Happen Without Licence Clearance

The Build squad must be explicitly and unambiguously blocked from the following activities until written licence confirmation is received from the relevant board:

| Activity | Block until... |
|----------|---------------|
| Serving any exam question to any user (free or paid) | Licence from that question's exam board is confirmed in writing |
| Displaying any mark scheme text to any user | Same condition as above |
| Assembling any personalised question pack | Licences from all boards in that pack are confirmed |
| Using exam board names or trademarks in marketing materials | Licence or separate trademark licence/approval confirmed |
| Claiming "30,000 authentic past papers" in marketing | Licence confirms the specific papers that are licensed for use |
| Running the free-tier "three sample questions" for any board | Same condition — free-tier access does not circumvent copyright |
| Any content ingestion pipeline that stores digitised questions | Licences confirmed for those boards before ingestion begins |

**There is no compliant path to serving content before licences are in place.** Serving unlicensed content in the free tier as a "sample" is not a lesser infringement — it is still infringement. The free tier does not constitute fair dealing.

---

## 7. Negotiating Strategy Recommendations

These recommendations are for the human Portfolio owner and legal advisor's consideration. They are not compliance requirements but commercial strategy suggestions.

### 7.1 Prioritisation

Begin negotiations in the following priority order based on risk, volume, and strategic importance:
1. **AQA and Edexcel/Pearson** — largest user base; England GCSE/A-level; highest volume demand. Failing to secure these would significantly impair the product's core value proposition.
2. **OCR/Cambridge Assessment** — second tier in England; CAIE bundling opportunity.
3. **CCEA** — required for Northern Ireland market; unique to Revizr (competitor gap); start early given CCEA's limited licensing capacity.
4. **WJEC** — required for Wales market; similar dynamic to CCEA.

### 7.2 Approach and Framing

- Frame all licensing requests as an educational benefit partnership, not a pure commercial transaction. All six exam boards have educational missions; aligning Revizr's pitch with student outcome improvement (exam preparation, revision quality, access equity) is more likely to succeed than a purely commercial pitch.
- Offer data-sharing arrangements (anonymised usage data showing which questions students find most challenging) as a value-added element — exam boards may find this useful for future paper development.
- Consider referencing Revizr's focus on underserved boards (CCEA, WJEC) as a differentiator that may make those boards more receptive.

### 7.3 Royalty Structure Considerations

The founder and legal advisor must model the financial impact of royalty structures before negotiations begin. If AQA charges £X per question served per user per year, and Revizr has Y subscribers accessing Z questions per year, the total royalty cost affects product margins. Possible structures:
- Flat annual licence fee (preferred for cost predictability).
- Per-question-served royalty (most common, variable cost).
- Revenue share (percentage of subscription revenue attributed to that board's questions).
- Per-subscriber annual fee.

Each structure has different implications for unit economics. The human Portfolio owner must model these scenarios before negotiations begin.

### 7.4 Interim Position

If any board refuses to grant a licence, Revizr has the following options (all to be assessed by an IP lawyer):
1. Exclude that board's content entirely and disclose this to users.
2. Replace unlicensed content with original questions written by Revizr (not covered by exam board copyright, but also not "authentic past paper" questions — the marketing claim changes).
3. Seek a compulsory licence (unlikely to succeed for this type of content).
4. Engage with a content aggregator that has existing exam board licences.

**Do not serve unlicensed content pending negotiation.** There is no "we're working on the licence" exception to copyright infringement.

---

## 8. Mark Schemes — Separate Copyright Assessment

Mark schemes are separate published works from the question papers. Each mark scheme is an independent literary work in which copyright subsists. The same analysis applies: reproducing and distributing mark schemes in a commercial subscription service requires a separate licence (or inclusion in the same licence that covers the questions).

**Practical note:** In most licence negotiations, question paper and mark scheme licences would be negotiated as a bundle (since displaying a mark scheme without the question, or a question without the mark scheme, is of limited value). The licence proposal should explicitly include mark scheme rights.

---

## 9. Chief Examiner Reports and Examiner Commentary

Some exam boards publish chief examiner reports and examiner commentary (reports on how students performed on specific questions in a given year). These are separate publications, separately copyrighted. If Revizr intends to include examiner commentary in mark scheme displays (F8), these must be included in the licensing scope.

**Action:** The licensing negotiation scope must explicitly include: question papers, mark schemes, and examiner reports/commentary for all boards and years in scope.

---

## 10. Database Right

The Copyright and Rights in Databases Regulations 1997 (implementing the EU Database Directive, retained in UK law post-Brexit) may grant the exam boards a separate database right in any systematic compilation of past papers. If the founder's database was assembled by substantial investment in obtaining, verifying, or presenting the contents, a separate database right may subsist.

However, the Revizr database of 30,000 papers is the founder's own compilation, not a copy of an exam board database. If the founder assembled the database by downloading papers from exam board websites, the database right in the original papers remains with the exam boards, but the founder's own compilation database (the structure, tagging, and organisation) would attract a separate database right owned by Revizr/the founder.

**For licensing purposes, this distinction does not change the outcome:** reproducing and distributing individual exam questions (the underlying works) still requires a licence from the copyright owner regardless of the database right position.

---

## 11. Trademark Considerations

Exam board names (AQA, Edexcel, OCR, CCEA, WJEC, Cambridge Assessment) are likely registered trademarks. Revizr's product features (F12 — multi-exam-board support) will necessarily display these names to users. General references to exam board names in a descriptive way (identifying the source of questions) are generally permissible under nominative fair use principles, but:
- Prominent display of exam board logos requires either a trademark licence or explicit permission.
- Marketing claims that imply endorsement by exam boards require confirmed endorsement or must be worded to avoid implying it.

**Recommendation:** The copyright licence negotiation should also address trademark use permissions (permission to identify questions as being from a specific board by name, and rules around logo use). This is typically a standard element of educational content licensing agreements.

---

## 12. Required Actions Before any Content is Served

| Action | Owner | Deadline |
|--------|-------|----------|
| Engage IP-qualified solicitor to review this analysis and advise on licensing strategy | Human Portfolio Owner | Before any licensing negotiations begin |
| Initiate licensing discussions with AQA and Edexcel/Pearson | Human Portfolio Owner + Legal Advisor | Immediately (longest lead time) |
| Initiate licensing discussions with OCR/CAIE | Human Portfolio Owner + Legal Advisor | Immediately (bundling opportunity) |
| Initiate licensing discussions with CCEA and WJEC | Human Portfolio Owner + Legal Advisor | Within 2 weeks of AQA/Edexcel initiation |
| Confirm which papers in the 30,000-paper database are from which boards and years | Content/Founder | Before negotiations (needed to scope the licence request accurately) |
| Model royalty cost scenarios for all likely fee structures | Human Portfolio Owner | Before negotiating royalty terms |
| Obtain written licences from each board | Human Portfolio Owner + Legal Advisor | Before any build of content-serving pipeline begins |
| Document licence confirmations in evidence pack | Compliance Agent | Upon receipt of each licence |

---

## 13. Disclaimer

This analysis is produced by the Compliance Officer Agent based on publicly available legal framework knowledge. It is not legal advice. The Copyright, Designs and Patents Act 1988 is a complex statute with significant case law. The specific facts of each exam board's copyright position, the content of their terms and conditions, and the strategic commercial considerations of each licensing negotiation require review by a UK-qualified IP solicitor with educational content licensing experience. **This document must be reviewed by a human legal advisor before any licensing negotiations are initiated and before any content is served to any user.**

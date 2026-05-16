---
feature: 002-revizr
document: jtbd-map
phase: 3
squad: personas-and-requirements
authored_by: jtbd-analyst-agent
date: 2026-05-15
worker: jtbd-analyst
persona_count: 6
jtbd_count: 18
format: christensen-strict
---

# Revizr — JTBD Map

All statements are in strict Christensen format:
"When [situation], I want to [motivation], so I can [outcome]."

Priority is assessed relative to commercial and product impact:
- **P1 — Core:** Must be solved for the product to have minimum viable value.
- **P2 — High:** Strongly drives retention, conversion, or market differentiation.
- **P3 — Medium:** Meaningful for a specific segment; second-wave priority.

---

| Persona | JTBD ID | Christensen Statement | Priority |
|---|---|---|---|
| **Amara Osei-Mensah** (Student, 11+) | J01 | When I sit down to practise 11+ papers, I want to be shown only the question types I find difficult, so I can improve my weak areas without wasting time on questions I can already do. | P1 |
| **Amara Osei-Mensah** (Student, 11+) | J02 | When I get a question wrong, I want to understand the correct method step by step, so I can learn from mistakes rather than just seeing the right answer. | P2 |
| **Amara Osei-Mensah** (Student, 11+) | J03 | When I feel anxious before an exam, I want to see that I have already practised questions like these and improved, so I can feel prepared and calm rather than overwhelmed. | P2 |
| **Priya Sharma** (Parent, 11+ context) | J04 | When I am managing my child's 11+ preparation, I want to see which specific question types are costing him marks, so I can direct our limited practice time at the right topics. | P1 |
| **Priya Sharma** (Parent, 11+ context) | J05 | When my child completes a practice session, I want to receive a plain-English summary of what he worked on and how he performed, so I can have an informed conversation with him about progress without interrogating him. | P1 |
| **Priya Sharma** (Parent, 11+ context) | J06 | When I am evaluating whether Revizr is worth £20/month, I want to see a personalised diagnosis based on my child's actual school report before I pay, so I can trust that the platform understands my child's situation rather than offering generic content. | P1 |
| **Jack Whitfield** (Student, GCSE) | J07 | When I sit down to revise and do not know where to start, I want to be told exactly which topics to focus on for my specific exam board, so I can start practising immediately without reading through the entire specification. | P1 |
| **Jack Whitfield** (Student, GCSE) | J08 | When I complete a set of practice questions, I want to see my score improve over time across sessions, so I feel like revision is working and stay motivated to continue. | P2 |
| **Jack Whitfield** (Student, GCSE) | J09 | When I am preparing for a Chemistry or History exam, I want to practise only on questions that have appeared in real AQA exams, so I understand the exact wording and format I will face on exam day. | P1 |
| **Siobhan O'Neill** (Parent, GCSE, NI) | J10 | When my child says she has been revising, I want to see a session log with the actual time spent and questions attempted, so I can know whether revision happened and hold an honest conversation with her. | P1 |
| **Siobhan O'Neill** (Parent, GCSE, NI) | J11 | When I am looking for GCSE revision support in Northern Ireland, I want to find a platform that genuinely covers CCEA past paper content, so my child practises on questions that match her actual examinations. | P1 |
| **Siobhan O'Neill** (Parent, GCSE, NI) | J12 | When I review my child's progress each week, I want a plain-English summary of whether she is on track for her target grade, so I can decide whether to increase tutoring frequency or whether she is managing the material. | P2 |
| **Tariq Hassan** (Student, A-level) | J13 | When I am preparing for an A-level exam, I want to practise questions drawn specifically from the topics the AI has identified as my weak areas, so I spend revision time where it will make the most difference to my grade. | P1 |
| **Tariq Hassan** (Student, A-level) | J14 | When I start a revision session, I want to see my personalised question pack ready to go without having to search exam board websites for topic-specific past paper questions, so I can begin focused practice immediately. | P1 |
| **Tariq Hassan** (Student, A-level) | J15 | When I complete a question, I want to see the official mark scheme explanation alongside my response, so I understand the examiner's expectations and close the gap between my answers and full-marks responses. | P2 |
| **Denise Okafor** (Teacher/Tutor) | J16 | When I assign between-session revision to a tutoring student, I want to see a report of which authentic AQA past paper questions they attempted and how they performed, so I can begin the next session at the point of actual difficulty rather than reviewing material they already know. | P2 |
| **Denise Okafor** (Teacher/Tutor) | J17 | When I recommend a revision platform to a student or parent, I want confidence that the questions are drawn from real past papers from the relevant exam board, so my professional credibility is not compromised by pointing them to inaccurate or off-specification content. | P2 |
| **Denise Okafor** (Teacher/Tutor) | J18 | When I am considering recommending a platform to students at my school, I want to review the data handling and privacy policies for under-18 students, so I can satisfy myself and the school's DPO that the platform meets UK data protection requirements. | P3 |

---

## JTBD Cluster Analysis

Grouping by functional theme to inform requirements synthesis:

### Cluster A — Targeted Content Delivery
J01, J07, J09, J11, J13, J14

These JTBDs are the core product promise: the right questions, from authentic past
papers, for the right topics, for the right exam board, served immediately. Every
one of these is P1. They are non-negotiable for product viability. Any failure to
satisfy them invalidates the value proposition.

### Cluster B — Diagnostic Entry Point
J04, J06, J07

The diagnosis of topic weaknesses — from school reports, teacher notes, or
diagnostic assessment — must happen at account creation, before the first question
is served. J06 specifically identifies that the diagnostic preview is the primary
conversion mechanism for parents. These JTBDs directly drive the free-tier design.

### Cluster C — Parent Accountability Layer
J04, J05, J10, J12

These are the parent-facing JTBDs. Four of the six are P1 or P2 and all point to
the same two functional needs: (1) real-time session log (time, questions, score),
and (2) plain-English progress summary. These are co-equal to the student experience
in terms of commercial impact because parents are the primary purchasing decision-
makers.

### Cluster D — Motivation and Progress Visibility
J02, J03, J08, J15

These JTBDs address the student motivation gap identified in the Discovery phase.
They are P2 — they are not the primary value proposition but they are critical for
retention. A student who cannot see improvement will churn. A student who cannot
understand why they got a question wrong will not improve. These JTBDs drive
requirements for mark scheme explanations, score progression charts, and session
history.

### Cluster E — Exam Board and Content Fidelity
J09, J11, J15, J17

These JTBDs are particularly important for trust and differentiation. J11 (CCEA
coverage) is a market signal that the NI/Wales exam boards must be genuinely
implemented, not cosmetically included. J17 (teacher confidence in content
authenticity) is the gateway to word-of-mouth and the school channel.

### Cluster F — B2B and Institutional Readiness
J16, J17, J18

These are the teacher/B2B JTBDs. P2–P3 for v1 but strategically important because
teachers are high-leverage recommenders. J18 specifically raises UK data protection
— the DPO approval pathway for schools should be designed into the product from the
outset, not retrofitted.

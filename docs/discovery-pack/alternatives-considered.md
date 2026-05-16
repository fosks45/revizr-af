---
feature: 002-revizr
document: alternatives-considered
phase: 1
authored_by: better-idea-generator (discovery-squad)
date: 2026-05-15
---

# Alternatives Considered: Revizr (002-revizr)

The Better-Idea Generator worker evaluated the following three alternative
approaches to solving the same underlying problem: unfocused student revision,
high private tutor costs, and zero parent visibility into revision quality. Each
alternative is described, its core strengths are acknowledged, and the reasons
for not choosing it over Revizr are set out.

---

## Alternative 1: AI Tutor Chat-Bot

### What it is

Rather than assembling question packs from past papers, this approach would deploy
a conversational AI tutor — similar to a fine-tuned LLM with educational guardrails
— that students interact with via chat. The student types a question, describes what
they are struggling with, and the AI explains, quizzes, and coaches in real time.
Products in this space include Khanmigo (Khan Academy), Socratic (Google), and
several startup entries.

### Why it was not chosen

This approach has no defensible moat in 2026. The conversational AI capability is a
commodity: OpenAI, Anthropic, Google, and Meta all provide the underlying model
capability that any team can wrap in a chat UI. The moment Revizr shipped a
chat-bot product, it would be replicable in weeks by a better-funded competitor with
an existing student user base. The proprietary past-paper database — which is the
founder's primary competitive asset — would be entirely irrelevant to a chat-based
product.

Additionally, the problem statement specifically calls out unfocused revision. A
chat-bot is reactive: the student has to know what they don't know and ask about it.
Revizr's value is that it diagnoses weakness from external evidence (a school report)
and then directs the student to the right questions without requiring self-diagnosis.
A chat-bot does not solve the root cause.

Finally, the parent visibility job-to-be-done is harder to serve with a chat
interface. Session logs from a chat are less interpretable than structured question
scores and topic maps.

**Verdict:** Not chosen. The proprietary content asset is unused, the moat is
absent, and the root-cause problem is not solved.

---

## Alternative 2: Generic Adaptive Quiz Platform with Licensed Content

### What it is

Instead of relying on authentic past papers, this approach would build an adaptive
quiz engine that licenses or generates its own question banks, applies spaced
repetition and item-response theory to surface the right questions, and presents
them to students. Products like GCSEPod, Seneca Learning, and (at the adaptive end)
Century Tech operate roughly in this space.

### Why it was not chosen

The market this alternative targets already has credible, well-funded, and
well-distributed incumbents. GCSEPod has multi-year school contracts. Seneca has a
large free user base and established brand recognition. Century Tech has raised
significant venture funding and has deep school relationships. A new entrant
building a generic adaptive quiz platform would need to compete on content quality,
pricing, marketing, and brand — all from a standing start — against these
incumbents, with no structural advantage.

Revizr's structural advantage is the authentic past-paper database. UK students and
parents have a strong preference for practising on *real* past papers over
synthesised or AI-generated questions — this is documented in tutoring community
discussions and consistent with exam coaching best practice. The reassurance that a
question has appeared on a real exam paper, written by the actual exam board, is
qualitatively different from an equivalent question written by a content team or an
LLM. Abandoning the authentic paper database to compete in the licensed-content
space means abandoning the one asset that makes Revizr different.

The licensing economics are also unfavourable: licensed content question banks come
with per-question or per-student royalty structures that compress margins. The
proprietary database, once assembled (which it already is), carries near-zero
marginal content cost.

**Verdict:** Not chosen. The incumbent landscape is mature, margins would be
compressed by licensing costs, and the founder's primary asset would be wasted.

---

## Alternative 3: School-Facing LMS Plugin (B2B-Only)

### What it is

Rather than selling directly to parents, this approach would build a teacher-facing
plugin that integrates with existing school Learning Management Systems (e.g.,
Firefly, SIMS, Google Classroom). Teachers would assign targeted past-paper question
sets to classes or individual students, and the platform would provide reporting back
to teachers. The product would be sold to schools on annual site licences.

### Why it was not chosen

This alternative has genuine merit as a *channel* and is explicitly recommended as
a Year 2 growth path in the discovery decision. It is not chosen as the primary
product thesis for three reasons.

First, UK school procurement is slow. A product positioned exclusively at
institutional buyers in the state sector faces 3–6 month sales cycles, budget
committee approvals, DPO sign-off for child data, and multi-stakeholder evaluation.
A startup needs faster feedback loops to iterate the product in Year 1. D2C
parent sales provide daily signal; school sales provide quarterly signal.

Second, the B2B-only model forfeits the entire private tutoring market — the
addressable population most motivated to pay, most engaged in their child's exam
outcomes, and most likely to become strong advocates. The parent who pays £40/hr for
a tutor is a far more motivated buyer than a Head of Department balancing ten
competing priorities. Starting with the most motivated buyer is correct sequencing.

Third, the B2B-only model compresses the unit economics: schools negotiate hard on
price, site licences reduce ARPU, and the teacher becomes a gatekeeper who may or
may not push students to actually use the product. The parent dashboard — Revizr's
second core differentiator after the paper database — is largely irrelevant in a
B2B model, which wastes a product feature that directly addresses one of the
primary jobs-to-be-done.

**Verdict:** Not chosen as primary model, but retained as a recommended Year 2 growth
channel. The product roadmap should include a school-licensing tier and LMS
integration once the D2C product has established proof of outcomes data that can be
used in school sales conversations.

---

## Summary

No alternative examined is superior to the Revizr approach given the assets the
founder holds and the market opportunity available. The proprietary paper database
creates a structural advantage that none of the alternatives can access. The
recommended path is to proceed with the Revizr thesis as stated, retain the school
B2B channel as a Year 2 growth layer, and treat AI-tutor chat as a potential
complementary feature (for explaining mark schemes or coaching on technique) rather
than a replacement product architecture.

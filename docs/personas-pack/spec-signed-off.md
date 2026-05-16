---
feature: 002-revizr
event: SpecSignedOff
signed_off_by: stu-fosks
signed_off_at: 2026-05-15T00:00:00Z
conductor: spec-sign-off-conductor v1.0.0
blocking_items_resolved: 7
tracked_items_open: 2
---

# Spec Sign-Off Record — Revizr (002-revizr)

All 7 blocking open questions from `spec.md` have been answered by the product
owner (stu-fosks). Answers are recorded verbatim in `spec.md § Open Questions —
RESOLVED`.

## Blocking items — all resolved

| # | Question | Answer summary | Document updated |
|---|----------|----------------|-----------------|
| Q1 | Parental consent mechanism | Parent-initiated only; no self-registration for under-17s | spec.md, ADR-0005.md |
| Q2 | Mark schemes in database | Confirmed included for all/almost all papers | spec.md |
| Q3 | CCEA/WJEC coverage | Full coverage confirmed | spec.md |
| Q4 | Teacher/tutor portal | Removed entirely — no teachers or tutors in any version | spec.md, ADR-0005.md |
| Q5 | AI marking scope (F31) | v1 all question types; technical spike T-032b gates Sprint 3 F31 tasks | spec.md, plan.md |
| Q6 | Streak mechanic (F16) | Built behind feature flag; AADC Standard 6 review pre-launch gate | spec.md |
| Q7 | Copyright clearance | In progress; content serving gated per-board | spec.md, manifest.yml |

## Tracked items still open (do not block Phase 8)

1. **Boards with active copyright conversations** — founder to specify board names
   in `compliance-pack/copyright-analysis.md` to enable per-board content gates.
2. **DPO sign-off on parent-initiated account model** — compliance condition C-001
   remains open; required before go-live, not before Build.

## Pipeline advancement

Phase 4 (Compliance) gate: PASSED-WITH-CONDITIONS ✓
Phase 8 (Build): **UNBLOCKED** — all blocking items resolved.

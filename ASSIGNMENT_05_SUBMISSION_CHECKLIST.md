# Assignment 05 submission checklist

Status refers to actual evidence, not a claim of teacher acceptance. The original teacher
handout/rubric was not attached; this mapping covers the requirements supplied in the two
user prompts. Confirm any additional LMS formatting/upload requirements yourself.
Deadline supplied by the user: **November 23, 2026, 23:59:59**; deadline timezone was not
specified. This work records dates in Asia/Qyzylorda, but confirm the LMS deadline zone.

| Requirement | Actual file / evidence | Status |
| --- | --- | --- |
| Existing repository/assignment branch and initial SHA | ASSIGNMENT_05_BASELINE.md; git history; initial `32622ca...` | COMPLETE |
| Repository/source/test inspection and map | Baseline + FINAL_REPORT; README/AGENTS inspected | COMPLETE |
| Setup and exact baseline checks | Baseline: npm ci, 135 tests/seven files and all four checks, observed exits | COMPLETE (AI-run) |
| 3–5 preservation acceptance criteria | Five criteria in baseline and final report, mapped to unchanged rules/tests | COMPLETE |
| Three evidenced baseline weaknesses | Baseline and RISK_REGISTER R05–R08, plus two reproduced code defects | COMPLETE |
| Customized AGENTS and loading disclosure | AGENTS Phase 1 change; baseline/AI_EVIDENCE; explicitly read | COMPLETE |
| One evidence-based pattern decision | Baseline and FINAL_REPORT: Adapter evaluated, no new pattern warranted | COMPLETE |
| Read-only audit before source fixes | RISK_REGISTER; audit JSON/production JSON, lock inspection, advisory references | COMPLETE |
| Five or more findings / three categories / classifications | RISK_REGISTER: nine candidates across five categories plus unsupported H01 | COMPLETE |
| L/I/score, owner, proposed fix and residual risk | RISK_REGISTER table and selection explanation | COMPLETE |
| Two selected confirmed safe mitigations | M1 fallback contract, M2 delayed lifecycle; two separate commits; red/green logs | COMPLETE (conditional timing disclosed) |
| Preserve original features/catalog/canBook/135 tests | Unchanged source/tests except additive mock tests; final checks and acceptance mapping | COMPLETE (AI evidence) |
| Agent readiness level with gaps | AGENT_READINESS: Level 2, missing enforcement/tooling/browser evidence | COMPLETE |
| Background-agent plan, limits, abort/recovery/rollback | AGENT_READINESS hypothetical plan; no paid runner needed | COMPLETE |
| Final automated test/lint/typecheck/build pass | FINAL_REPORT and assignment-05-evidence/final-*.txt | COMPLETE (AI-run; see recorded exits) |
| Scope, whitespace and final diff inspection | Git diff/check/status; FINAL_REPORT; no dependency or protected-branch edits | COMPLETE (AI-run) |
| Coherent final report and release decision | ASSIGNMENT_05_FINAL_REPORT.md | COMPLETE |
| 200–300 word first-person reflective draft | ASSIGNMENT_05_AI_REFLECTION.md, marker-delimited draft | COMPLETE draft; personalization PENDING |
| AI tool/model/prompt/output record | ASSIGNMENT_05_AI_EVIDENCE.md | COMPLETE |
| Clean commits and authorized publication | Two mitigation commits + documentation commit; external publication receipt gives final SHA and remote comparison | COMPLETE only when receipt confirms push |
| Human diff/check review | Steps below; no human approval asserted | PENDING |
| Browser/manual screenshots | Checklist below; no screenshots captured by AI | PENDING |
| Additional teacher rubric / submission upload | Original handout/LMS not provided or accessed | PENDING |

## Exact remaining manual steps

1. Open [the assignment branch](https://github.com/abnzrdev/smart-campus/tree/assignment-05),
   compare its head with the final publication receipt/assistant summary, and inspect commits.
   Review `git diff 32622ca9676b2f70c01e86b0ae5da0de5a4e8f3d..HEAD` and the two code fixes.
2. In your own checkout of assignment-05, run `node --version`, `npm --version`, `npm ci`,
   `npm run test`, `npm run lint`, `npm run typecheck`, and `npm run build`. Record actual
   outputs and your review date. npm audit findings and the separate config-typecheck
   limitation must not be mistaken for a clean security assessment.
3. Run `npm run dev` locally, open its localhost URL, complete the screenshots below,
   then stop the server. Do not expose a Vitest UI/API server or deploy for screenshots.
4. Read/personalize the reflection in your own voice, retaining 200–300 words; verify
   attribution and do not claim AI-run checks as your own. If editing tracked files,
   commit normally on assignment-05 and report the new SHA; do not rewrite history.
5. Confirm the teacher's actual rubric, required screenshot format, repository access,
   LMS upload contents and deadline timezone. Submit the branch link and required artifacts.
   Human acceptance of residual risks is still required before merge or deployment.

## Practical screenshot checklist (human; all pending)

- Default screen: A-101, 09:00 simulated time, 10:00–11:00 booking and five-room selector.
- 11:00–12:00 touching slot: Available; then labelled Mock AI explanation with status unchanged.
- 10:30–11:30 overlap: Unavailable, understandable reason, overlap explanation.
- Exactly 120 minutes accepted and 121 minutes rejected; 09:00 start rejected.
- Attendees/equipment filtering and no-match empty state; room switch shows its own bookings.
- Media Lab D-012 blocked state and room-specific unavailable/explanation text; test-mode switch.
- Change time/room after explanation and recheck: previous explanation is cleared.
- Blank minute hint/rejection and recovery after valid input.
- Terminal evidence: final test totals, lint/typecheck exit success, production build output.

The current UI has no control for timeout/error mock modes. Do not fake a failure-mode
screenshot: cite the focused unit logs instead. Controlled timing regressions are automated
tests, not manual screenshots or proof of a normal-browser race. Browser layout, keyboard
accessibility and real browser console/network behavior remain human checks.

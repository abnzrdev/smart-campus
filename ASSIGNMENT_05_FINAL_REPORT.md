# KBTU Software Engineering — Assignment 05 final report

Date: 2026-11-22 (Asia/Qyzylorda). Repository:
[smart-campus / assignment-05](https://github.com/abnzrdev/smart-campus/tree/assignment-05).
This report completes the two supplied prompts. Findings, fixes, reviews and command
results described as performed were performed by AI tools; **human verification remains pending**.

## Purpose, scope, and repository map

Smart Campus is a fictional five-room availability checker. Users filter by capacity
and equipment, select a room/time, check availability, and optionally request a deterministic
mock explanation. It never creates bookings, authenticates users, persists data, or calls
an external model. The original default A-101, simulated 09:00 time and 10:00–11:00 booking
are retained alongside the expanded room catalog.

`index.html` loads `src/main.tsx`, which mounts React StrictMode and `App`. `App` coordinates
time/result/explanation state and calls pure rules in `src/lib/canBook.ts`.
`useRoomFinder` manages filters/selection/local blocked state through `roomFilter.ts` and
the fixed `roomRules.ts` catalog. `timeInput.ts` handles field conversions. Components
render forms, room metadata, results, notes and explanation/error/loading text.
`explainTypes.ts`, `explainValidation.ts`, and `mockLLM.ts` define the explanation boundary.
React/React DOM and lucide-react are runtime dependencies; Vite/TypeScript, Tailwind/PostCSS,
ESLint, Vitest, Testing Library and jsdom support development and checks. The baseline
contains the full dependency/entry-point/command map; no project was scaffolded again.

## Baseline and commit provenance

| Milestone | Actual SHA / evidence |
| --- | --- |
| Initial assignment-05 / week-12 baseline | `32622ca9676b2f70c01e86b0ae5da0de5a4e8f3d` |
| Phase 1 baseline/instructions commit | `3639340b885692e5adc89b608fd83bc11df00b67` |
| M1 fallback contract fix | `767ba9826b02b0aaac5ca2ac860b51972643ec23` |
| M2 lifecycle fix / final executable-code commit | `3d7f20da44951278c91665493297a960a004dc91` |
| Final documentation/publication commit | The commit containing this report; exact SHA is reported in the final assistant response and external publication receipt after commit/push. Resolve with `git rev-parse HEAD` and compare `git ls-remote origin refs/heads/assignment-05`. |

The same local checkout was continued on assignment-05. Only named task files were staged;
no reset, force push, merge, rebase, or main/week-12 modification was performed. Remote main
was `c8865a6485c562418c05164ec1a7c4f9bab50a98`; remote week-12 remained the initial baseline.
A normal assignment-05 push is authorized by the final prompt; publication is not claimed
solely because commits exist locally. The post-push receipt records the actual outcome and
remote SHA without trying to embed a commit's own hash in its contents. No Bolt site was
redeployed, and publishing the Git branch is not a deployment of the application.

## Five acceptance criteria and preservation evidence

These are the Phase 1 criteria, with the final evidence and limits attached.

| Criterion | Preserved behavior / final evidence |
| --- | --- |
| 1. Availability rules | Original canBook signature, result shapes and validation order unchanged: integer, range, equal, reversed, past, duration, blocked, overlap. Whole minutes, same-day valid range, strictly future start, 120-minute maximum, blocked rejection, strict overlap with touching allowed, nonempty messages. Existing 63 canBook tests pass; its source and tests were not edited. |
| 2. Room behavior and purity | Five-room catalog/default retained; all-equipment/capacity filters, independent bookings, blocked status and no-match UI retained. Existing roomFilter (10), roomRules (4), timeInput (7), frozen-input and UI tests pass; catalog/filter/hook source unchanged. |
| 3. Explanation separation | Availability remains authoritative; success/blocked/overlap/unknown mock behavior retained. Existing 19 UI tests and original 32 mock tests remain; explanation completion cannot change canBook's result. |
| 4. Mock contracts/fallbacks | Request/response types, modes and errors retained; unavailable fallback wording now complies with the existing two-sentence contract. Seven added regressions cover both status values in all three failure modes plus rejected-output fallback. |
| 5. UI lifecycle | Results/explanations still clear on changes/new checks. Eight added delayed-provider cases cover stale success after room/time/attendees/equipment/blocked/recheck flows, stale rejection, and an older request finishing while a newer one is loading. UI layout and controls unchanged. |

Final passing tests support preservation, not an exhaustive guarantee. Input-change tests
also perform a new check, so they do not independently isolate input-only invalidation;
unmount and StrictMode cleanup are inspected but not explicitly regression-tested. No manual
browser execution, visual screenshot, network trace, or accessibility audit is claimed.

## Baseline weaknesses and read-only audit

At least three independently evidenced baseline gaps remain recorded: README's 98/six
test claim is stale; there is no tracked .github CI workflow; application typecheck omits
tooling configs; and reason-code lists repeat across types, UI mapping and validation.
The audit found two additional reproducible code defects and investigated the original
npm vulnerability report. See the risk register for all nine candidates across correctness,
maintainability, dependency/security, reproducibility, and agent operations, plus one
unsupported HTML-execution hypothesis. Each has evidence, classification, cause, consequence,
owner, proposed mitigation, likelihood/impact and residual score.

The security phase was non-mutating: full/production-only npm audits, locked dependency
ancestry and advisory inspection preceded mitigation code changes. Full audit exit 1
reported **20 affected package entries: 1 low, 7 moderate, 10 high, 2 critical**.
Production-only audit exit 0 reported **zero**. Only one flagged entry is direct
(`vitest@2.1.9`); the other 19 are transitive, including `tinypool@1.1.1`. All affected
lockfile paths are development dependencies. Nested Vite 5.4.21 is affected, while root
Vite 7.3.7 is a separate resolved version.

The critical Vitest issue requires UI/API/browser-server circumstances; our script is
`vitest run` with jsdom and no API exposure configured. Tinypool's critical advisories
require prototype-pollution preconditions that were not demonstrated. These facts constrain
exploitability conclusions without dismissing developer/CI exposure. The risk register
links the advisories and raw JSON. No dependency fixes, forced upgrades, exploit PoCs or
install-script approvals were run. npm's recommended Vitest 5.1.1 migration is a major
upgrade without compatibility proof, so **all 20 development findings remain open**.

An extra config-only compiler inspection found a real gap: `node node_modules/typescript/bin/tsc
--noEmit -p tsconfig.node.json` exits 2 with missing `node:url` types and `ImportMeta.url`.
The required `npm run typecheck` targets `src` and passes. Both results are reported;
one is not used to hide the other. Tooling dependency/config repairs were not added as a
third mitigation. AGENTS, README and the Phase 1 baseline are preserved in this final phase;
README corrections were not selected among the two fixes.

## Exactly two confirmed mitigations

**M1 — response contract (R01).** Before: false-status fallback text had three sentences
although output validation permits at most two. All three simulated failures and the
normal-output-validation failure path could emit that invalid fallback. The new tests
actually failed against unchanged production code: four failures reported the two-sentence
validation error. After: one punctuation change joins the final sentences, preserving
the unavailable meaning, helpful action, response shape and mode-specific errors. Six
failure-mode/status combinations and one rejected-output case validate; all **39 mock
tests pass**. Risk score moves from L3 x I2 = 6 to L1 x I2 = 2, with future wording drift
still possible and now guarded by tests.

**M2 — asynchronous explanation lifecycle (R02).** Before: cleared display state did not
invalidate pending work; async success/catch/finally always updated shared state. Controlled
deferred-provider tests showed old text/errors on a newer result, and loading state that
prevented starting a new explanation. Eight cases failed before source edits. After:
`explanationVersion` is incremented for new requests, invalidation, and unmount; success,
catch and finally update only the current generation. `clearExplanation` also resets
loading when a check/input invalidates a request. The real components and rules are used
in tests; only the provider promise is controlled to create the required timing.
All **27 focused UI tests across two files pass**. Contextual risk moves from L1 x I2 = 2
to L1 x I1 = 1. This confirms a conditional async defect, not a claim that normal user
interaction with the immediate default mock reproduces it. Ignored work is not cancelled.

These are the highest-priority confirmed code defects with safe local fixes. Advisory
severity alone did not justify a blind major upgrade. Documentation, tests, and hypothetical
runner safeguards are supporting evidence/planning, not additional claimed mitigations.

## Instructions, design pattern, and structure

Phase 1 improved root AGENTS with actual architecture and mock modules, setup/safe commands,
conventions, forbidden secrets/destructive commands/deployment/unreviewed dependencies,
branch/phase scope, and human review requirements. It was explicitly read, not automatically
supplied by the host in this chat. It provides instructions, not enforced permissions.

**No new Adapter pattern is warranted.** The application still has one mock provider and
one production provider call. Its `ExplainRequest`/`AdapterResult` boundary already keeps
text generation separate from availability. A class/interface layer would add wiring and
tests without solving the observed lifecycle or sentence defects. The generation guard
and tiny local clearing helper are lifecycle mechanics, not a new provider abstraction.
Before/after flow stays `App -> validateRequest -> mockExplain -> ResultCard/ExplanationPanel`;
`App -> canBook` remains independent. The only new source file is a focused test file.

Trade-offs: preserving dependencies avoids an unverified migration but retains development
advisories; keeping README/AGENTS/baseline intact preserves provenance but leaves documented
README drift; local generation checks are smaller than cancellation/provider redesign but
do not stop background work. Additional browser/tooling/CI verification is deferred, not
implied by passing unit tests.

## Verification evidence

Environment: Windows PowerShell, Node **v24.19.0**, npm **11.17.0**. Phase 1 used `npm ci`
successfully; package manifest/lockfile are unchanged and installation was not repeated.
The final prompt requested focused checks during development and one complete final pass;
that pass ran each required command once, concurrently, with individual outputs/exits read.

| Command | Before / development evidence | Final complete pass |
| --- | --- | --- |
| `npm run test` | Baseline 135/135, seven files, exit 0. New regressions before fixes: 12 failed / 35 passed / 47 total, two files, exit 1. Focused green runs: 39 mock tests and 27 UI tests. | **150 passed / 150, eight files, exit 0**, duration 15.37s. All original 135 retained plus 15 added. |
| `npm run lint` | Phase 1 exit 0. | **Exit 0**, no diagnostics. |
| `npm run typecheck` | Phase 1 exit 0; app scope only. | **Exit 0**, no diagnostics. Separate config check still fails as disclosed above. |
| `npm run build` | Baseline Vite 7.3.7, 1577 modules, exit 0. | **Exit 0**, 1577 modules; built in **13.29s**. |

Final assets: index.html **0.73 kB** (gzip 0.40), CSS index-BXk5hHuj.css **14.30 kB**
(gzip 3.41), JS index-DVb0OQhR.js **168.02 kB** (gzip 53.92). `dist/` is ignored and not
committed; build log preserves the output. Raw logs and command mapping are committed in
`assignment-05-evidence/`. Audits were not repeated as if dependencies had changed.

Reviewed named-file diffs, ran whitespace checks and verified no domain/catalog/historical/
configuration/manifest/lockfile modifications beyond scope. A separate read-only AI review
reported no blockers and disclosed the coverage limits above. Final staged diff/status
were checked before the documentation commit, with clean working status checked afterward.
The exact final publication head is verified after push. No AI review counts as human review.
The initial staged whitespace check found log formatting only (exit 2); trailing spaces
and blank EOF lines were removed from text evidence copies, preserving original captures
outside the repository and leaving command content/results unchanged.

## Readiness, residual risks, and release decision

**Level 2 — Documented**, per the explicit rubric in AGENT_READINESS. Missing Level 3
evidence includes enforced CI/human gates, exact runtime pinning, clean tooling/config
checks, reviewed dependency maintenance and tested unattended recovery. The requested
hypothetical agent plan defines isolated worktree/branch, file/command allowlists, resource
limits, forbidden operations, artifacts, abort/recovery and human-controlled rollback.
No real asynchronous coding service or autonomous deployment was configured.

**Release decision: CONDITIONAL for a supervised fictional classroom demonstration.**
The required automated checks pass and two defects have regression evidence. Human diff
review, rerun checks, practical browser screenshots, reflection personalization and
acceptance of disclosed tooling risks are still required. This is not approval for a
production booking service or unattended release. Before any broader release, the owner
must address development advisories, configuration typing and enforcement gaps under a
separate reviewed change. Retained risks and hypotheses are detailed in RISK_REGISTER.

The assignment's practical code/audit/documentation work is complete subject to the actual
push outcome in the publication receipt. Submission still requires the student's manual
items in SUBMISSION_CHECKLIST, and the original teacher handout was not available for
independent rubric matching. The reflection is a 200–300 word first-person draft for
personalization; AI_EVIDENCE identifies supplied context, decisions, tools and limits.

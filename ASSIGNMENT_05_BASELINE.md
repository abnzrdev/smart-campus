# Assignment 05 — Phase 1 baseline

Date: 2026-11-22 (Asia/Qyzylorda). Repository: https://github.com/abnzrdev/smart-campus.
This is Prompt 1 only: baseline inspection, acceptance criteria, repository instructions,
and one pattern evaluation. No Prompt 2 risk review or Prompt 3 mitigation was performed.

## Provenance and branch

- The chat workspace initially had no checkout. Used the existing repository with
  `git clone --branch assignment-05 --single-branch https://github.com/abnzrdev/smart-campus.git work/smart-campus`
  (exit 0), selecting the already existing branch. No project was rebuilt or scaffolded.
- Initial `git status --short --branch`: `## assignment-05...origin/assignment-05`, clean.
- Initial `git rev-parse HEAD`: `32622ca9676b2f70c01e86b0ae5da0de5a4e8f3d`.
- Explicit `git checkout assignment-05` later confirmed `Already on 'assignment-05'`;
  HEAD remained the initial SHA before the Phase 1 commit.
- Read-only `git ls-remote origin refs/heads/main refs/heads/week-12 refs/heads/assignment-05`
  reported main `c8865a6485c562418c05164ec1a7c4f9bab50a98`, week-12 and assignment-05
  both `32622ca9676b2f70c01e86b0ae5da0de5a4e8f3d`. No write to remote refs was made.
- Root `AGENTS.md` was **read explicitly using Get-Content**, not automatically supplied
  in this chat. `git ls-files '*AGENTS.md'` found only the root instructions.

## Concise repository map

| Area | Entry points, dependencies, and responsibility |
| --- | --- |
| Browser | `index.html` loads `src/main.tsx`, which mounts `App` in React StrictMode and imports Tailwind CSS. |
| Orchestration | `src/App.tsx` owns time, checked result, explanation/loading/error state; invokes `canBook`, `validateRequest`, and `mockExplain`. |
| Room state | `src/hooks/useRoomFinder.ts` uses `roomFilter.ts` and the five-room catalog in `roomRules.ts`; selection, attendees, equipment, local blocked toggles. |
| Domain | `src/lib/canBook.ts` contains pure rules and `fmt`; `roomRules.ts` supplies constants/catalog; `timeInput.ts` parses and converts selections. No booking creation or persistence. |
| Explanation | `explainTypes.ts` defines contracts; `explainValidation.ts` validates; `mockLLM.ts` provides deterministic local explanations and simulated failure modes. No external model/API. |
| Components | `RoomFinder`, `RoomCard`, `AvailabilityForm`, `AvailabilityNotes`, `ResultCard`, and `ExplanationPanel` render inputs/results and delegate events. |
| Tests | `canBook.spec.ts` (47), `canBook.boundaries.spec.ts` (16), `roomFilter.spec.ts` (10), `roomRules.spec.ts` (4), `timeInput.spec.ts` (7), `mockLLM.spec.ts` (32), `App.spec.tsx` (19). Vitest/jsdom with jest-dom setup in `src/test/setup.ts`. |
| Tooling | Vite React plugin; TypeScript strict mode; ESLint with React hooks/refresh; Tailwind/PostCSS/autoprefixer. `@/` maps to `src` in TS, Vite, and Vitest. |
| Historical material | `src/lib/canBook.bug-*.ts` are practice variants, not application entry points; practice/assignment reports retained unchanged. `.checkpoints/` was mentioned in AGENTS but no tracked files were found there. |

Read README, root AGENTS, package manifest, configuration files, all current source modules
and seven test files, plus the three historical canBook variants. File discovery used `rg --files`.
An initial combined source dump was truncated; subsequent focused reads covered the modules
and tests omitted from that output.

Runtime dependencies declared in `package.json`: React/React DOM `^18.3.1` and
lucide-react `^0.446.0`. Development dependencies: Vite `^7.3.7`, plugin-react `^5.1.1`,
TypeScript `^5.5.3`, Vitest `^2.1.9`, jsdom `^25.0.1`, Testing Library React/user-event/jest-dom,
React type packages, ESLint 9/typescript-eslint/React plugins/globals, Tailwind 3,
PostCSS and autoprefixer. These are manifest ranges, not claims about every resolved version.

| Command | Actual script / purpose |
| --- | --- |
| `npm ci` | Install committed lockfile; chosen because `package-lock.json` exists. |
| `npm run dev` | `vite` local development server (not run). |
| `npm run preview` | `vite preview` local production preview (not run). |
| `npm run test` | `vitest run` |
| `npm run lint` | `eslint .` |
| `npm run typecheck` | `tsc --noEmit -p tsconfig.app.json` |
| `npm run build` | `vite build`, output ignored `dist/` |

## Acceptance criteria to preserve

1. **Availability rules:** retain integer/range/equal/reversed/past/duration/blocked/overlap
   validation order and unchanged signature/result shape. Require whole minutes,
   `0 <= start < end <= 1440`, start strictly after now, duration at most 120;
   blocked rooms reject, overlap rejects, touching endpoints remain valid. Rejections retain
   nonempty messages. Evidence: both canBook test files (63 tests).
2. **Room behavior and purity:** retain the five-room catalog/default A-101, capacity and
   all-equipment filtering, room-specific bookings/blocked state, and empty state; do not
   mutate domain inputs or create bookings. Evidence: roomFilter, roomRules, frozen-input
   canBook tests, and App room selection/filtering tests.
3. **Explanation separation:** after a check, Explain produces a labelled mock explanation
   without changing availability; available, overlap, blocked, and unknown reason behavior
   remains status-consistent. Evidence: `App.spec.tsx:150` onward and mockLLM tests.
4. **Mock contracts/fallbacks:** retain request validation and output limits (nonempty,
   at most 300 characters/two sentences); preserve `ok`, `timeout`, `error`, and
   `unavailable` modes, result shape, and status-aware fallbacks. Evidence: 32 tests in
   `mockLLM.spec.ts`. This records existing coverage, not exhaustive input validation.
5. **UI lifecycle:** retain clearing of displayed results/explanations on relevant input
   changes and new checks, with existing layout/copy/controls. Evidence: App handlers and
   UI clearing tests; complete asynchronous transition coverage is not claimed.

All five are preservation criteria, not new features. The Phase 1 diff changes no executable
source, tests, configuration, manifest, or lockfile; existing checks provide regression evidence.

## Baseline weaknesses / missing checks

These are bounded baseline observations, not a risk register, threat model, severity ranking,
dependency investigation, or mitigation plan. Source line references refer to the initial SHA.

| Classification | Evidence | Observation and limit |
| --- | --- | --- |
| Observed documentation drift | `README.md:38` says 98 tests/six files; actual `npm run test` reports 135/seven. | Historical count is stale. README retained unchanged; current evidence recorded here. |
| Observed missing automation | `git ls-files .github .checkpoints` returned no files; original AGENTS review section also says no CI pipeline. | No tracked GitHub workflow. External checks/branch protection were not inspected and are unknown. |
| Observed limited typecheck scope | `package.json:12`, `tsconfig.app.json:29` include only `src`; `tsconfig.node.json:21` includes only `vite.config.ts`; build script at `package.json:8` is only `vite build`. | Required typecheck does not cover Vite/Vitest config; successful build is not proof of config type checking. No extra compiler checks added. |
| Observed maintainability duplication | `src/App.tsx:21-34`, `src/lib/explainTypes.ts:1-12`, `src/lib/explainValidation.ts:39-52`. | Reason codes are repeated in union, UI mapping, and validator; adding a reason requires coordinated edits. Future drift is a possibility, not an observed runtime failure. |
| Observed incomplete UI failure-mode coverage | `src/App.spec.tsx:150-210` exercises explanation success and clearing; `src/App.tsx:98` calls the default mock mode. | Timeout/error/unavailable are tested at module level, not as injected UI scenarios in these tests. No claim that these UI paths fail. |

Assumptions: the existing fictional-data prototype and mock-only explanation feature remain
the intended scope; user-provided branch provenance is accepted (remote week-12 equality
supports it). No assertion about production readiness or uninspected external settings.

## One pattern evaluation: Adapter

Maintainability issue: App directly knows the explanation provider and maps duplicated
reason codes at its boundary. An Adapter could accept `ExplainRequest` and return
`AdapterResult`, translating a future provider into the existing UI contract, isolating
provider changes and allowing failure-mode injection. Costs: another abstraction, wiring,
and tests while the app has only one production provider call (`src/App.tsx:98`).

Decision: **no new pattern and no refactor warranted in Phase 1**. `mockExplain` already
acts as a small functional boundary, types are separate, and the reason-to-text table is
compact. There is no second provider or second production caller requiring adaptation;
an Adapter would not itself eliminate the duplicated reason-code lists. Existing AGENTS
also requires a concrete need with at least two call sites before adding patterns/classes.
Reconsider only when actual provider integration or reuse requires contract translation.
No alternative pattern was evaluated or introduced.

## Before / after

- `AGENTS.md`: retained domain invariants and human review gate; added entry flow and mock
  architecture, corrected historical-file location, documented setup/command limits and
  conventions, defined allowed actions and prohibitions covering secrets, destructive
  commands, deployments/pushing, unreviewed dependencies, and phase boundaries. Clarified
  automatic loading versus explicit reading and required honest AI/human attribution.
- `ASSIGNMENT_05_BASELINE.md`: new repository map, acceptance criteria, observations,
  pattern decision, execution evidence, and AI-use record.
- No application behavior, test, dependency, lockfile, historical evidence, or other branch changed.

## Exact verification commands and observed results

Environment: Windows PowerShell; `node --version` -> `v24.19.0` (exit 0),
`npm --version` -> `11.17.0` (exit 0). Commands ran from the cloned repository root.
All four baseline checks ran after installation and before edits; all four were rerun
after the AGENTS change. Independent checks ran concurrently; each exit was inspected.

| Command | Baseline | After AGENTS edit |
| --- | --- | --- |
| `npm ci` | Exit 0; added 384 packages, audited 385 in 24s. | Not repeated; manifest and lockfile unchanged. |
| `npm run test` | Exit 0; 7 files passed, 135 tests passed; duration 9.33s. | Exit 0; 7 files passed, 135 tests passed; duration 9.16s. |
| `npm run lint` | Exit 0; no diagnostics. | Exit 0; no diagnostics. |
| `npm run typecheck` | Exit 0; no diagnostics. | Exit 0; no diagnostics. |
| `npm run build` | Exit 0; Vite 7.3.7, 1577 modules, built in 6.96s. | Exit 0; same module count/assets, built in 7.14s. |

Both builds emitted `dist/index.html` 0.73 kB (gzip 0.40),
`dist/assets/index-BXk5hHuj.css` 14.30 kB (gzip 3.41), and
`dist/assets/index-CPYfj8eK.js` 167.85 kB (gzip 53.85).

Installation warnings, recorded without investigation:

```text
npm warn deprecated whatwg-encoding@3.1.1: Use @exodus/bytes instead for a more spec-conformant and faster implementation
20 vulnerabilities (1 low, 7 moderate, 10 high, 2 critical)
npm warn allow-scripts 3 packages have install scripts not yet covered by allowScripts:
esbuild@0.28.2 (postinstall: node install.js)
esbuild@0.21.5 (postinstall: node install.js)
esbuild@0.21.5 (postinstall: node install.js)
```

npm suggested `npm audit fix`, `npm audit fix --force`, `npm audit`, and script approval
commands. None were run; no install-script approval was added. These counts are npm's
reported output, not an independently assessed security conclusion.

No required check failed. One ancillary search used the literal Windows path glob
`tsconfig*.json` with rg and printed OS error 123; repeated successfully using
`rg -n 'noUnused|include' -g 'tsconfig*.json'`. This was a search syntax issue, not a
lint/typecheck failure.

Diff review: inspected `git diff -- AGENTS.md` and the new report; checked named-file
scope, source/config/manifest/lockfile preservation, and `git diff --check` before commit.
Final staging is limited to the two documentation files. Generated `node_modules/` and
`dist/` remain ignored. The commit containing this report is the Phase 1 commit; retrieve
its SHA with `git log -1 --format=%H` (reported separately to avoid a self-referential hash).

## AI-use and human verification record

Codex performed file inspection, command execution, evidence synthesis, documentation
editing, diff review, and the explicitly requested local commit. Used using-superpowers,
Ponytail, and verification-before-completion skills. No subagents, external model calls
from the app, deployments, pushes, dependency changes, or risk-review/mitigation steps.

All results above are **AI-reported, tool-observed** results. Human verification is
**pending**: no person is claimed to have run checks, reviewed the diff, or accepted the
changes. A human must inspect the two-file diff and rerun the four required commands
before accepting/merging, per AGENTS. No manual browser session, production testing,
coverage measurement, additional runtime matrix, or external CI/settings review was run.

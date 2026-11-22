# Assignment 05 risk register

Audit date: 2026-11-22, Asia/Qyzylorda. Read-only audit started at Phase 1 commit
`3639340b885692e5adc89b608fd83bc11df00b67`, before mitigation source edits.
Initial baseline: `32622ca9676b2f70c01e86b0ae5da0de5a4e8f3d`.
All findings and ratings are AI assessments requiring human review, not security certification.

## Method, classification, and scoring

Read the baseline, AGENTS, README, manifest, lockfile, source and tests. Used non-mutating
`npm audit --json` (exit 1), `npm audit --omit=dev --json` (exit 0), `npm ls ... --all`
(exit 0), file/line inspection, and controlled regressions. No exploit payload, server exposure,
dependency update, `npm audit fix`, force upgrade, or secret access was used.

CONFIRMED means the specific stated condition was observed in code or reproduced; it does
not imply an exploit was demonstrated. PLAUSIBLE-UNVERIFIED needs an unproven precondition.
UNSUPPORTED means the available evidence does not support the proposed defect.
Likelihood L: 1 conditional/unlikely, 2 possible in normal maintenance, 3 directly repeatable.
Impact I: 1 localized inconvenience, 2 wrong information/failed quality gate, 3 host/data compromise.
Score = L x I, 1–9. These are project-context estimates, separate from advisory severity.
Residual scores reflect this checkout after the two fixes; deferred risks retain their scores.

## Register and ranked candidates

Priority reflects score, exposure, practical effect, and safe fix feasibility. Security
advisory rank does not automatically authorize an incompatible tooling migration.
Source lines below are pre-fix unless explicitly labelled after.

| Priority / ID | Category / severity / classification | Cause, evidence, possible consequence | Before L/I/score | Owner / proposed minimal fix | Verification and residual L/I/score |
| --- | --- | --- | --- | --- | --- |
| 1 / R01 | Correctness; medium; **CONFIRMED** | `src/lib/mockLLM.ts:9` returned three sentences for unavailable status; failure branches at 54–73 bypass normal output validation. `explainValidation.ts:5,74–79` permits two. Failure fallback violates its own contract. | 3/2/**6** | Frontend maintainer; join the last two sentences, retain status and errors. **Selected mitigation M1.** | Four red contract cases before; all 39 mock tests green after. Static fallback now validates; future wording can regress. **1/2/2**. |
| 2 / R03 | Dependency/security; advisory critical; **CONFIRMED vulnerable versions**, exploitability unverified | Audit flags direct dev `vitest@2.1.9` and transitive `tinypool@1.1.1`. Test/UI server or upstream prototype pollution could expose developer/CI host. See audit analysis below. | 1/3/**3** | Tooling maintainer; separately review a compatible Vitest/toolchain migration and rerun suite/audit; keep test API/UI unexposed meanwhile. **Deferred**, not counted as fixed. | Raw audit and dependency tree confirm paths, not exploitability. npm proposes major Vitest 5.1.1; not a verified safe drop-in change. **1/3/3**. |
| 3 / R02 | Correctness; medium, conditional timing; **CONFIRMED under delayed-provider test** | Pre-fix `App.tsx:47–71` clears text but leaves in-flight work/loading; `98–109` unconditionally publishes old success/error/finally. A new result can receive an old explanation or remain unable to explain. | 1/2/**2** | Frontend maintainer; generation ref, invalidation on changes/check/unmount, guard all completion paths. **Selected mitigation M2.** | Eight controlled regressions red before, eight green after; original 19 UI tests green. Default mock is immediate, so normal-browser race exposure is not established. Remaining work is ignored, not cancelled; StrictMode/unmount lack explicit tests. **1/1/1**. |
| 4 / R05 | Reproducibility/tooling; medium; **CONFIRMED** | `package.json:12` checks only `src`; `tsconfig.node.json:21` covers Vite config but is not run. Extra `node node_modules/typescript/bin/tsc --noEmit -p tsconfig.node.json` exits 2: missing `node:url` types and `ImportMeta.url`. Green required checks omit an actual config error. | 2/1/**2** | Tooling maintainer; explicitly declare/review Node typings, then add config coverage including Vitest with version compatibility checked. Deferred; no ad hoc shims or dependency changes. | `assignment-05-evidence/config-typecheck.txt` preserves errors. Required app typecheck is a different command and may pass. **2/1/2**. |
| 5 / R06 | Reproducibility/CI; medium; **CONFIRMED repository gap** | `git ls-files .github` returns no tracked workflow. AGENTS relies on a person to run checks; regressions can be accepted without recorded automated results. External branch protections are unknown. | 2/1/**2** | Repository owner; review a least-privilege CI workflow for four checks before adopting it. Deferred. | File inventory and AGENTS; no external CI/protection inspection. **2/1/2**. |
| 6 / R04 | Dependency/security; advisory high/moderate/low; **CONFIRMED vulnerable versions**, exploitability unverified | Other flagged dev paths include nested Vite 5/esbuild, lint parsers/glob libraries and jsdom/ws. Malicious source/config/network inputs could cause DoS, data access, or tool misuse under advisory-specific conditions. | 1/2/**2** | Tooling maintainer; review narrowly scoped upgrades and parent compatibility rather than force overrides. Deferred. | All 20 flagged node paths are dev-marked; production-only audit zero. No proof these attacks are reachable here. **1/2/2**. |
| 7 / R07 | Maintainability; low; **CONFIRMED duplication** | `App.tsx:21–34`, `explainTypes.ts:1–12`, `explainValidation.ts:39–52` repeat reason-code lists. A future addition could drift. No present reason mismatch demonstrated. | 2/1/**2** | Frontend maintainer; consolidate only when changing reasons, with contract tests. Deferred; no new pattern. | Source comparison confirms duplication; 135 original tests constrain current behavior. **2/1/2**. |
| 8 / R08 | Documentation/reproducibility; low; **CONFIRMED** | `README.md:38` says 98 tests/six files versus baseline 135/seven. It documents `npm install` rather than locked `npm ci`, though AGENTS is more precise. A contributor could trust stale evidence or resolve new versions. | 2/1/**2** | Documentation maintainer; refresh README separately with verified commands/count or avoid fixed counts. Not selected; README preserved as requested. | Baseline/final logs and lockfile; current instructions and checklist explicitly use `npm ci`. **2/1/2**. |
| 9 / R09 | Agent operations; medium if realized; **PLAUSIBLE-UNVERIFIED** | AGENTS says instructions do not enforce permissions; no evidence a future unattended runner implements its human-review gate. Assuming markdown constrains an autonomous tool could allow unauthorized pushes/deployment. | 1/2/**2** | Repository owner/operator; enforce allowlists, isolated worktree, short-lived minimum credentials and approval outside agent text. Preventive plan only. | AGENTS read explicitly; no real background runner or deployment was created/tested. **1/2/2** (plan is not enforcement). |
| Excluded / H01 | Security hypothesis; high if real; **UNSUPPORTED** | Hypothesis: room labels/explanation text execute HTML in the browser. `ExplanationPanel.tsx:46` renders `{explanation}` as React text; searches found no `dangerouslySetInnerHTML` in `src`. Catalog labels are fixed. No HTML execution sink established. | Screening only 1/2/2 | Frontend reviewer; keep text rendering; no mitigation justified. | Static inspection only, no browser exploit test. Excluded from confirmed ranking; **1/2/2**, not an accepted vulnerability. |

## Selection and exactly two confirmed mitigations

**M1 / R01** and **M2 / R02** are the two highest-priority confirmed *code defects with
safe local fixes*, chosen after reproducing their failures. R03 remains a higher-severity
dependency concern, but its recommended remediation is a major toolchain upgrade without
compatibility proof; it is not represented as fixed. R05 needs explicit Node typing and
config/toolchain decisions, while R06–R09 are documentation, automation or future concerns.
No dependency, CI, permission, or pattern change is counted as a third mitigation.

Before proof: `npm run test -- src/lib/mockLLM.spec.ts src/App.explanation.spec.tsx`
exited 1, **12 failed / 35 passed / 47 total**, two failed files. These comprise four
contract failures and eight lifecycle failures. See `assignment-05-evidence/regression-before.txt`.
M1 commit: `767ba9826b02b0aaac5ca2ac860b51972643ec23`.
M2 commit: `3d7f20da44951278c91665493297a960a004dc91`.
Focused after logs: `fallback-after.txt` (39/39, exit 0), `lifecycle-after.txt`
(27/27 across two files, exit 0), inside the evidence directory.

## Dependency audit: exposure, not just counts

Full audit reports **20 affected package entries**: 1 low, 7 moderate, 10 high, 2 critical.
This is not 20 distinct exploit demonstrations; entries may aggregate several advisories
and propagated dependency effects. Exactly one flagged entry is direct (`vitest`); the
other 19 are transitive. All flagged lockfile nodes have `dev: true`.

| Flagged package | Locked affected version(s) | Audit severity |
| --- | --- | --- |
| @eslint/plugin-kit | 0.2.0 | low |
| @humanfs/node | 0.16.5 | moderate |
| @vitest/mocker (under vitest) | 2.1.9 | moderate |
| ajv | 6.12.6 | moderate |
| brace-expansion | 1.1.11, 2.0.1 | high |
| browserslist | 4.24.0 | high |
| cross-spawn | 7.0.3 | high |
| esbuild (under vite-node/vitest) | 0.21.5 | moderate |
| flatted | 3.3.1 | high |
| glob | 10.4.5 | high |
| js-yaml | 4.1.0 | high |
| minimatch | 3.1.2, 9.0.5 | high |
| picomatch | 2.3.1 | high |
| postcss-selector-parser | 6.1.2 | moderate |
| tinypool | 1.1.1 | critical |
| vite (nested under vite-node/vitest) | 5.4.21 | high |
| vite-node | 2.1.9 | moderate |
| vitest (direct dev dependency) | 2.1.9 | critical |
| ws | 8.18.3 | high |
| yaml | 2.5.1 | moderate |

Root Vite is **7.3.7**, with esbuild 0.28.2; the affected Vite/esbuild entries are nested
under Vitest 2.1.9/vite-node. jsdom's form-data resolves to 4.0.6 and is not flagged in
this audit; no form-data critical issue is inferred from generic package reputation.

The critical Vitest advisory concerns listening UI/API/browser-mode capabilities, including
Windows file access and execution. Our script is `vitest run` with jsdom, not a UI/browser
server, and no API/network exposure is configured or was started. Vulnerable version
presence is confirmed; a usable external exploit path here was not established.
[Vitest advisory](https://github.com/advisories/GHSA-5xrq-8626-4rwp).

Tinypool's two critical advisories require an upstream prototype-pollution primitive and
worker-option lookup; the run-options case also requires a supplied options object.
No attacker-controlled prototype-pollution chain was demonstrated in this repository.
This remains relevant to developer/CI privileges, not a confirmed browser-app RCE.
[Worker-options advisory](https://github.com/advisories/GHSA-5gmw-xhrv-c9v3),
[run-options advisory](https://github.com/advisories/GHSA-85c8-ppgw-ccpr).

`npm audit --omit=dev --json` reports **zero vulnerabilities**, exit 0. This supports
limited runtime-package exposure, not a universal safety guarantee: build tools execute
with host privileges and can affect artifacts. Registry audits are time-dependent and
do not cover unknown vulnerabilities or prove that a deployed artifact is trustworthy.
No package/lockfile change was made, so all 20 development findings remain.

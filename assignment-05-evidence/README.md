# Assignment 05 command evidence

AI-run on 2026-11-22 in the same local assignment-05 checkout, Windows PowerShell,
Node v24.19.0, npm 11.17.0. Raw captures include absolute checkout paths; no credentials
or private environment data were requested or included. Logs are original command output;
exit codes below were captured from each process, not inferred from summary wording.
Text captures are whitespace-normalized copies: trailing spaces/blank EOF lines were removed
and line endings normalized after the first staged diff check flagged those log-formatting
issues (exit 2). Output content/results were not changed; original captures remain in the
chat workspace outside the repository. Audit JSON is unmodified.

| Artifact | Exact command | Exit / observed result |
| --- | --- | --- |
| npm-audit.json | `npm audit --json` | 1; 20 package entries, 1 low/7 moderate/10 high/2 critical |
| npm-audit-production.json | `npm audit --omit=dev --json` | 0; zero vulnerabilities |
| dependency-tree.txt | `npm ls vite vitest tinypool esbuild minimatch glob form-data @types/node --all` | 0; installed dependency paths |
| config-typecheck.txt | `node node_modules/typescript/bin/tsc --noEmit -p tsconfig.node.json` | 2; TS2307 node:url, TS2339 ImportMeta.url |
| regression-before.txt | `npm run test -- src/lib/mockLLM.spec.ts src/App.explanation.spec.tsx` | 1; 12 failed/35 passed/47 total, two failed files, before source fixes |
| fallback-after.txt | `npm run test -- src/lib/mockLLM.spec.ts` | 0; 39 passed, one file |
| lifecycle-after.txt | `npm run test -- src/App.explanation.spec.tsx src/App.spec.tsx` | 0; 27 passed, two files |
| final-test.txt | `npm run test` | 0; 150 passed, eight files, 15.37s |
| final-lint.txt | `npm run lint` | 0; no diagnostics |
| final-typecheck.txt | `npm run typecheck` | 0; no diagnostics, app scope only |
| final-build.txt | `npm run build` | 0; Vite 7.3.7, 1577 modules, 13.29s |

The final four commands are one complete pass after both mitigation commits, each run
once. Their raw output was redirected to these files and inspected alongside process
exit codes. Documentation was finalized afterward; no executable code changed after
that pass. Baseline checks belong to the preserved ASSIGNMENT_05_BASELINE.md; historical
counts there describe that earlier state, not the current suite.

Regression failures are intentionally preserved proof, not current failures. The separate
config check is an actual **unresolved** failure; it is not the required application
typecheck. Production-only audit zero is not a claim of absence of all security risks.
No audit fix, package upgrade, force operation, exploit test or manual browser check was run.

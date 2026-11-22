# Assignment 05 agent readiness

Assessment: **Level 2 — Documented** (AI assessment, 2026-11-22).
Level 1 means a working baseline with ad hoc operation; Level 2 adds repository-specific
instructions and repeatable documented checks; Level 3 requires stronger evidence of
automated enforcement, isolation, and reliable unattended recovery. This is an explicit
working rubric, not a claim about an unseen teacher rubric.

## Evidence checklist

| Area | Assessment and evidence | Gap / consequence |
| --- | --- | --- |
| README | Purpose, local setup, run/build/check commands and five-room structure documented. | Stale 98/six test claim; npm install rather than preferred locked ci. Current evidence is in baseline/final report. |
| Architecture | Pure rules in lib, state in App/hook, presentation components; mock contracts separate. | App coordinates multiple state lifecycles; reason lists duplicate. No new provider abstraction warranted. |
| Reproducible setup | Committed npm lockfile v3 with exact resolved versions/integrities; npm ci succeeded in Phase 1. | Manifest uses ranges, Node/npm not pinned to an exact runtime; one Windows/Node24 environment tested. Lockfile is preserved. |
| Tests | 135 baseline tests retained; seven fallback and eight lifecycle regressions added. | jsdom is not browser/manual verification; input-change tests pair change with recheck; no explicit StrictMode/unmount or exhaustive property tests. |
| Lint / app typing / build | Separate scripts documented and run, with logs in evidence directory. | Build is Vite only; typecheck excludes tooling configs. Extra config check actually fails for Node typings. |
| Logging | UI displays understandable result/error/fallback messages; raw command logs committed for this assignment. | No structured runtime telemetry or centralized logs; unnecessary to add for this fixed local prototype. No claim of operational observability. |
| Security boundaries | No booking persistence, backend, auth, credentials, or external AI request; explanation rendered as React text. | Development tool advisories remain, including two critical package entries; future external provider needs a new boundary review. |
| CI | No tracked .github workflow; AGENTS mandates human checks before merge. | No demonstrated CI enforcement or protected-branch review configuration. |
| Agent instructions | Root AGENTS has architecture, setup, safe commands, conventions, forbidden actions and human-review gate. | Markdown is advisory, not technical permission enforcement; host auto-loading varies. |

Level 3 is **not** claimed: there is no verified CI/review enforcement, exact runtime pin,
clean tooling audit/config typecheck, or tested unattended runner/rollback. Existing code
and documentation are sufficient for supervised local work, not autonomous production release.

## Repository instructions and permissions

Root `AGENTS.md` was read explicitly in both turns, not automatically supplied in this chat.
The code-review agent also explicitly read it. Phase 1 customized it with the actual entry
flow, mock modules, fixture locations, npm ci setup, command limitations, readonly rule
conventions, status authority, phase scope, and human review requirements. It remains
unchanged during the final prompt; the user now explicitly authorized the remaining
audit/fixes and a normal push of assignment-05, satisfying its phase/push gates.

Allowed work: read repository files/history, run approved local checks, make minimal scoped
edits, stage named files, and commit/push only within the explicit request. Forbidden:
secrets/private data, destructive commands/history rewrites, force pushes, changes to main
or week-12, autonomous deployment/merge, unrelated features, and unreviewed dependencies.
No permission to send messages to other people or grant services new credentials is implied.
Human review before merge/deploy remains mandatory even when an AI reviewer finds no blockers.

## Hypothetical asynchronous coding-agent workflow

This is a proposed operating plan, **not a running background agent or paid service**.
One read-only AI code review in this chat is separately disclosed; it does not implement
this hypothetical coding workflow or constitute human approval.

1. **Isolate and establish scope.** A human records assignment-05's SHA and clean status,
   then creates a disposable local branch/worktree such as `agent/assignment05-task` from
   that SHA. Never work in the user's active checkout or main/week-12. Read AGENTS explicitly
   and report loading. Record the worktree's resolved absolute path before any cleanup.
2. **Enforce permissions outside the prompt.** Give the worker only its worktree; exclude
   user home, .env variants, tokens, SSH/cloud credentials and private data. Use a host
   command allowlist. No Git push/merge/deploy token; network off except an approved
   registry read during a separately approved locked install. No package scripts beyond
   the approved lockfile policy; no new package or script approval without human review.
3. **Allowlist files.** For this task, only `src/App.tsx`, `src/lib/mockLLM.ts`, their
   focused tests, `ASSIGNMENT_05_*.md`, and `assignment-05-evidence/*`. Treat canBook,
   catalog, historical evidence, manifest/lockfile, configuration and AGENTS as read-only
   unless the human explicitly changes scope. A runner rejects paths outside this list.
4. **Allowlist commands.** Read-only git status/diff/log/show and rg/file reads;
   npm run test with explicit files, lint, typecheck, build; git add of named allowed
   files and local commits. npm ci only in the disposable worktree with approved lockfile.
   Block arbitrary shell execution, recursive deletion, reset/clean, rebase, force operations,
   deployment commands, audit fix, dependency installation/upgrades, and outbound messaging.
5. **Bound resources.** Maximum 30 minutes total, one retry per failing command, each
   command at most 5 minutes; at most two test workers, 4 GB memory and 2 GB generated
   files where supported by the runner. No persistent servers; any approved preview
   binds localhost, has a 10-minute lifetime, and is stopped on success or failure.
6. **Require artifacts.** Original SHA, named-file diff/stat, code summary, red/green test
   logs with exit codes, final lint/typecheck/build logs and asset sizes, risk notes,
   assumptions, dependency diff (normally empty), and a proposed commit SHA. Never substitute
   a passing summary for missing command output. Missing artifacts mean incomplete work.
7. **Abort safely.** Stop on scope violation, secret discovery, protected branch, lockfile
   change, failing regression after one diagnosis cycle, unexpected network/permission
   request, resource/time overrun, or unexplained baseline drift. Kill only recorded child
   process IDs; preserve the diff/logs. Notify the human of the condition; do not auto-fix
   a failed guard by broadening permissions.
8. **Recover and review.** Keep failed work isolated for inspection. Resume from its ledger
   and verified commit, not memory; do not repeat completed steps. Human reviews the full
   diff and artifacts and reruns checks. Only a separate human-controlled step can merge
   or deploy; a worker's own tests or AI review do not grant approval.
9. **Rollback.** Before acceptance, retain the base ref and commit receipt. If an accepted
   change must be undone, a human authorizes a normal `git revert <mitigation-SHA>` on a
   new review branch and reruns all four checks. Revert dependent commits in reverse order
   when needed. No reset/force push of shared history. If deployed separately, use that
   platform's last known artifact rollback only with human approval; no deployment was
   performed here. Remove the disposable worktree only after its exact path, clean status,
   retained commits and human acceptance are verified; never recursively delete a computed path.

Residual limitation: these controls are not effective merely because they appear in a
document. Their enforcement and failure recovery require a real runner test before Level 3.

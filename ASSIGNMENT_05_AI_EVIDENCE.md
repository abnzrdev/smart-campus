# Assignment 05 AI-use evidence

Date: 2026-11-22, Asia/Qyzylorda. Tool: **Codex desktop**; actual model:
**not independently verified**. Shell: PowerShell; Node v24.19.0, npm 11.17.0.
All execution evidence is AI-run unless explicitly marked pending human verification.

## Prompt and output record

| Input | Supplied context / instructions | Outputs used |
| --- | --- | --- |
| Prompt 1 of the originally planned three | Existing GitHub repo, existing assignment-05 from week-12, baseline inspection/checks, acceptance criteria, AGENTS improvements, one justified pattern evaluation, evidence and local commit; explicitly defer risk review/mitigations. | Local clone of the same repository, baseline report, AGENTS changes, commit `3639340b885692e5adc89b608fd83bc11df00b67`. No push in that phase. |
| Final prompt 2 of 2 (supersedes waiting for a third prompt) | Continue same local checkout; baseline/Phase 1 SHAs supplied; finish read-only audit, readiness, exactly two safe confirmed mitigations, hypothetical agent safeguards, six deliverables, final verification and normal assignment-05 push. | Risk register, readiness report, two mitigation commits and tests, final report, reflective draft, this evidence record, submission checklist, raw audit/regression/verification artifacts. |

Root AGENTS was read explicitly rather than automatically supplied in the chat. The
final prompt explicitly authorized the later phases and push, while retaining its human
review requirement before merge/deploy. The initial Phase 1 commit records what happened
then; its report was preserved without retroactively rewriting its scope or results.

## Problems, decisions, and changes

- Confirmed fallback response contract violation with four failing cases; changed only
  sentence punctuation, with seven added tests covering all failure-mode/status combinations
  and rejected-output fallback. Commit `767ba9826b02b0aaac5ca2ac860b51972643ec23`.
- Confirmed asynchronous lifecycle defect under controlled deferred provider promises;
  added version invalidation/guards and eight UI regressions. No production provider
  injection or new pattern. Commit `3d7f20da44951278c91665493297a960a004dc91`.
- Investigated full/production audits and locked paths. No dependencies updated, no audit
  fix or script-approval command run. Major tooling upgrades were not treated as safe fixes.
- Identified stale README counts, absent tracked CI, repeated reason lists, and actual
  tooling config type errors; retained them as explicit limitations rather than silently
  expanding the implementation scope.
- Rejected unsupported HTML-execution hypothesis based on text rendering, without
  claiming exhaustive security testing. Preserved no-Adapter decision: one provider/call
  and existing functional contract do not justify another layer.
- Only two code risks are mitigated. Reports and hypothetical safeguards are evidence and
  preventive planning, not proof of new security enforcement.

## Verification sources and exact attribution

`assignment-05-evidence/README.md` maps commands, exit codes and original artifacts.
Full audit JSON preserves advisory URLs/ranges/paths; production JSON preserves zero
findings. `dependency-tree.txt` records installed ancestry, and `config-typecheck.txt`
records the extra failing compiler check. Critical advisories were read on GitHub:
[Vitest](https://github.com/advisories/GHSA-5xrq-8626-4rwp),
[Tinypool worker options](https://github.com/advisories/GHSA-5gmw-xhrv-c9v3),
[Tinypool run options](https://github.com/advisories/GHSA-85c8-ppgw-ccpr).
No exploit proof-of-concept was executed.

The controlled pre-fix regression run exited 1: 12 failed, 35 passed, 47 total across two
files. Focused after runs exited 0: 39 mock tests, then 27 UI tests across two files.
One complete final verification pass ran test, lint, app typecheck and build; the final
report records the observed results. Original 135 baseline cases were not deleted or relaxed.

One separate **read-only AI reviewer** inspected the four mitigation files and surrounding
code after the two code commits, explicitly read AGENTS, and ran git diff --check. It made
no edits and did not rerun tests. It reported no blocking findings, while noting that
input-change tests also recheck, StrictMode/unmount lack explicit regression tests, and
the timing defect is demonstrated only using deferred provider responses. The author
also reviewed the final diff and scope. Neither review is human approval.

Applied skills: using-superpowers, Ponytail, systematic-debugging, test-driven-development
(including writing-good-tests), brainstorming/writing-plans/executing-plans adapted to
the user's explicit instruction to finish without another approval prompt, requesting-code-review,
and verification-before-completion. A small plan/ledger was kept outside the repository
in `work/assignment05-evidence/plan.md`. The code review is the only delegated work; no
real asynchronous coding service was configured.

Limitations and tool problems: an auxiliary PowerShell ConvertFrom-Json lockfile read failed
because the root package key is empty; rerunning with -AsHashtable succeeded. Truncated
combined reads were followed by focused reads. Those are inspection problems, not failing
application tests. The separately recorded config compiler failure remains unresolved.
The first staged whitespace check exited 2 for trailing whitespace/blank EOF lines in
captured test output; text evidence copies were normalized without changing diagnostic
content, with originals retained outside the repo. This did not change code or require
rerunning the final suite.

**Human verification: pending.** No student command execution, screenshot capture, browser
session, rubric approval, merge, Bolt redeployment, or production behavior verification
is claimed. The student must personalize the reflection and complete the checklist.
Git publication status is verified separately by normal push and remote SHA comparison;
the publication receipt is delivered outside the commit so it can contain the final SHA.

# AI Evidence: Assignment #04

## Tool and model

- **Tool:** Bolt, an AI coding assistant that edits this project directly in build mode.
- **Model:** Claude, made by Anthropic. The exact model version is **not identifiable** from the session. When asked, the assistant said it could not confirm its version, and no version was recorded in the environment.
- **Dates:** The first analysis session was recorded as 2026-11-05. Later sessions were recorded as 2026-11-08. The saved test run is timestamped 2026-11-08T07:48:39Z in `TEST_RESULTS.txt`.

## Prompts (condensed summaries)

These are short summaries of the user's messages. The full text is in the conversation transcript.

| # | Summary of the prompt | Output |
|---|---|---|
| P0 | Asked which model the assistant is. | Said it is Claude by Anthropic and could not confirm the exact version. |
| P1 | Task #01: read-only analysis of the codebase. Required a repository map, at least three risks with file and function references, a prioritized plan, a Mermaid BEFORE diagram, one rejected AI suggestion, and a test inventory. No code changes. | Repository map, six risks, a prioritized plan, a BEFORE diagram, a rejected Supabase suggestion, and a baseline of 67 tests counted by inspection. |
| P2 | Approved the plan with two changes: keep `canBook()` unchanged, and keep room filtering separate from availability. Asked for Task #02: four or more rooms, attendee and equipment filters, a room selector, an empty state, and room switching. | Five rooms, `filterRooms`, a `RoomFinder` component, room-specific blocked wording in the UI, and 24 new tests. |
| P3 | Asked for Task #03: refactor the architecture as planned, without rewriting the app. | A `useRoomFinder` hook, components split out of `App.tsx`, a `timeInput` module, and two test titles reworded. |
| P4 | Asked for the assignment documentation: verification, test evidence, the report, this file, README, AGENTS.md file map, and a submission checklist. No deployment. | This document set. |

## Outputs and changes made by the AI

- Source changes: `src/lib/roomRules.ts`, `src/lib/roomFilter.ts`, `src/lib/timeInput.ts`, `src/hooks/useRoomFinder.ts`, `src/components/*.tsx`, `src/App.tsx`, and their tests.
- Test changes: 24 tests added; two misleading test titles in `canBook.spec.ts` reworded. No assertion was changed and no test was removed.
- Documentation: `ASSIGNMENT_04_REPORT.md`, `AI_EVIDENCE.md`, `SUBMISSION_CHECKLIST.md`, `TEST_RESULTS.txt`, `README.md`, and the file-map section of `AGENTS.md`.
- Build output: `dist/` was created by production builds. It is listed in `.gitignore`.

## Problems found during the work

1. **Test title with an apostrophe.** The first test run after Task #02 failed with a syntax error in `App.spec.tsx`. Fixed by changing the quotes. Caught by running the tests.
2. **Missing helper reference.** In the Task #03 refactor, the first draft of `AvailabilityForm.tsx` imported a helper name that did not exist. Caught by re-reading the edit before running the checks.
3. **Files reported as changed on disk.** Several edits returned notices that a file had changed since it was last read (`App.spec.tsx`, `canBook.spec.ts`, `AvailabilityForm.tsx`). The assistant re-checked the files. The later test runs passed, but the cause of the external change was not investigated.
4. **Metrics from recall.** The "before" values for the original `App.tsx` (418 lines, 6 state hooks) and the original file-size total come from the assistant's reading earlier in the session. The original file is not saved in the project, so they cannot be re-run.

## Human verification status

- **Not performed by any human.** No person has reviewed the code, run the app in a browser, or checked the layout on mobile or desktop.
- **Not performed by the AI.** No browser or screenshot tool was available, so no visual or interactive testing was done.
- **Approvals on record.** The user approved the Task #01 plan with two changes, and gave instructions for Tasks #02, #03, and this documentation step. These approvals cover the plan and scope only. They are not a review of the result.

## Limitations

- The model version is not verifiable from the session.
- Test results cover only the automated tests in `src`. They do not show that the interface works in a browser or on a phone.
- The original baseline test results were never run on the original code. The count of 67 comes from reading the files.
- The metrics comparison (Task #05) uses source line counts and test counts. It does not measure speed, accessibility, or usability.
- AI output was checked by reading the code and running the commands listed in `TEST_RESULTS.txt`. Those checks are described in the report and are not a substitute for a human review.

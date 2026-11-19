# Submission Checklist: Assignment #04

Status key:
- **Done (AI-verified)**: produced in this environment and checked by running a command or reading the source.
- **Done (not human-verified)**: produced, but no person has reviewed or run it.
- **Missing**: required evidence that does not exist yet.
- **Not done**: work intentionally left out.

## Deliverables

| # | Deliverable | Status | Where / notes |
|---|---|---|---|
| 1 | Task #01: repository analysis, risks, plan, BEFORE diagram, rejected suggestion | Done (AI-verified) | `ASSIGNMENT_04_REPORT.md` section 1 |
| 2 | Task #02: four or more rooms, capacity and equipment filters, room selector, empty state, room switching | Done (AI-verified) | Source files listed in report section 2.1; 91 tests pass |
| 3 | Task #03: architecture refactor | Done (AI-verified) | Report section 3 with BEFORE and AFTER diagrams |
| 4 | Test, typecheck, and build results saved from real command output | Done (AI-verified) | `TEST_RESULTS.txt` |
| 5 | `ASSIGNMENT_04_REPORT.md` with all required sections | Done (not human-verified) | Sections 1 to 6 |
| 6 | `AI_EVIDENCE.md` | Done (not human-verified) | Model version not identifiable; see the file |
| 7 | `README.md` with install, run, build, and test commands | Done (partly verified) | Test, typecheck, lint, and build commands were run. `npm install` and `npm run dev` were not run in this environment. |
| 8 | `AGENTS.md` file map updated; engineering constraints unchanged | Done (AI-verified) | Only the file-map section was edited |
| 9 | This checklist | Done | |
| 10 | Original (baseline) source for before/after comparison | **Missing** | The original `App.tsx` was not saved as a file in this project. An earlier version may be available in Version History (the clock icon in the header). |
| 11 | Before and after screenshots | **Missing** | No screenshot tool was available. Needs to be captured by a person. |
| 12 | Browser testing of the interface | **Missing** | Not performed. |
| 13 | Original test results (run on the original code) | **Missing** | The 67 original tests were counted by reading the files and were never run in the original state. The current run includes all of them and they pass. Running the original state would need the Version History copy. |
| 14 | Mobile and desktop layout check | **Missing** | Not performed. Layout changes use responsive classes, but this is not verified visually. |
| 15 | Human review of code and documentation | **Missing** | Not performed. |
| 16 | Deployment or publication | Not done | Intentionally not done, per the assignment instructions. |

## Unresolved issues

1. Clearing a minute field immediately resets it to `00`, so users cannot type a new value after clearing it (`clampMinute` in `src/lib/timeInput.ts`, used by `AvailabilityForm.tsx`). Carried over from the original code.
2. `canBook`'s blocked message still names Study Room A-101. The UI shows the correct room name, but the library message is wrong for other rooms.
3. `@supabase/supabase-js` is listed in `package.json` but not used. It was left in place.
4. `roomRules.ts` and `canBook.ts` import types from each other (a circular import).
5. Two test helpers are duplicated (`frozenRoom` and `room()`), and some boundary cases repeat across two spec files.
6. The footer still reads "Assignment 03". It was kept because the copy was to be preserved unless asked to change.
7. Blocked-status changes from "Test mode" are not saved and reset on reload.

## Remaining actions before submission

1. Run the app locally (`npm install`, then `npm run dev`) and check each requirement by hand.
2. Capture before and after screenshots, including mobile widths.
3. Recover the original `App.tsx` from Version History, then run the original tests against it and save the output.
4. Decide whether to change the footer text and remove the unused Supabase dependency.
5. Have a human review the report and the AI evidence file, and update the "Human verification status" in `AI_EVIDENCE.md` only after that review actually happens.

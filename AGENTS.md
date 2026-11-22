# AGENTS.md

Constraints for anyone (human or AI assistant) changing this repository.
These are repository instructions for humans and AI assistants. They do not execute code or
enforce permissions. Whether an assistant loads them automatically depends on its host; disclose
whether they were supplied automatically or read explicitly in the AI-use record.

## Project purpose

Smart Campus Room Availability Checker. It answers one question for a set of fictional campus
rooms (five rooms in the catalog defined in `src/lib/roomRules.ts`): is a requested time interval
available for the selected room? It does not create bookings.

### Known difference from the original assignment scope

The original assignment (Assignment 03) specified a single room ("Study Room A-101"). The current
codebase extends this to a five-room catalog with capacity and equipment filtering. This
functionality is intentionally retained; do not remove it. The original single-room behavior is
preserved as the default selected room (`DEFAULT_ROOM` / Study Room A-101).

## File structure

- `index.html` -> `src/main.tsx` -> `src/App.tsx`: Vite entry, React StrictMode mount, page orchestration.
- `src/App.tsx`: page composition; holds the time selection and the latest availability result, and clears the result on any change.
- `src/components/RoomFinder.tsx`: attendees input, equipment checkboxes, room selector, and the no-match empty state.
- `src/components/RoomCard.tsx`: selected room name, capacity, equipment, blocked status, test-mode switch, and its own bookings.
- `src/components/AvailabilityForm.tsx`: start and end time fields, requested-interval text, check button, and quick scenarios.
- `src/components/ResultCard.tsx`: Available or Unavailable result with room-specific blocked wording.
- `src/components/AvailabilityNotes.tsx`: the "How availability is judged" panel.
- `src/hooks/useRoomFinder.ts`: room search state (attendees, equipment, matching rooms, selected room, blocked toggle).
- `src/lib/canBook.ts`: pure availability check (`canBook`) and time formatter (`fmt`). Its signature and validation order must not change.
- `src/lib/roomFilter.ts`: pure capacity and equipment filter (`filterRooms`) and attendee parsing (`parseAttendees`).
- `src/lib/roomRules.ts`: shared constants, equipment list, the fictional room catalog (`ROOMS`), and `DEFAULT_ROOM` (Study Room A-101).
- `src/lib/timeInput.ts`: time selection helpers for the start and end fields.
- `src/lib/explainTypes.ts`: explanation request/response contracts and mock modes.
- `src/lib/explainValidation.ts`: request and response validation; explanations are limited to 300 characters and two sentences.
- `src/lib/mockLLM.ts`: local deterministic explanation adapter and status-aware fallbacks; no external AI service.
- `src/components/ExplanationPanel.tsx`: loading, explanation, and fallback/error display through `ResultCard`.
- `src/lib/mockLLM.spec.ts`: explanation contract, validation, mock-mode, and fallback regression tests.
- `src/lib/canBook.spec.ts`: unit tests for `canBook` and `fmt`, one describe block per acceptance criterion.
- `src/lib/canBook.boundaries.spec.ts`: boundary tests for `canBook`.
- `src/lib/roomFilter.spec.ts`, `src/lib/roomRules.spec.ts`, `src/lib/timeInput.spec.ts`: tests for filtering, the room catalog, and time helpers.
- `src/App.spec.tsx`: UI tests for the full screen.
- `src/test/setup.ts`: test environment setup.
- `src/lib/canBook.bug-*.ts`: saved buggy and backup copies used for practice exercises. Do not edit or import into production. Leave `.checkpoints/` untouched if present (not tracked at the Assignment 05 baseline).
- `practice08-*.md`, `bugdeetector/`: practice evidence and skill notes. Do not edit.
- `ASSIGNMENT_04_REPORT.md`, `AI_EVIDENCE.md`, `SUBMISSION_CHECKLIST.md`, `TEST_RESULTS.txt`, `README.md`: assignment documentation.

## Acceptance criteria

- **AC1**: Start and end are whole minutes; `0 <= start < end <= 1440`; start must be strictly after the simulated current time.
- **AC2**: Maximum duration is 120 minutes; exactly 120 is allowed, 121 is rejected.
- **AC3**: If the room is blocked, every request is rejected.
- **AC4**: Overlap is `start < bookedEnd && bookedStart < end`. Touching endpoints are allowed.
- **AC5**: The result is unambiguous (`ok: true` with reason `available`, or `ok: false` with a reason). Bookings and room objects are never mutated.
- **AC6**: Every rejection has a non-empty, understandable message.

## Rules for changes

- Keep `canBook` a pure function: no mutation of inputs, no side effects, no I/O.
- Keep the public `canBook` signature and result shape unchanged.
- Preserve the validation order in `canBook`: integer, range, equal, reversed, past, duration, blocked, overlap.
- Availability is decided only by `canBook`; explanation generation must never change that result.
- Preserve mock `ok`, `timeout`, `error`, and `unavailable` modes and their status-aware fallbacks.
- Clear displayed results/explanations on changed inputs or a new check; preserve existing behavior.
- Use TypeScript, function components, hooks, readonly domain inputs, and `@/` imports as in adjacent code. Keep pure rules in `src/lib`, state in hooks/App, and rendering in components.
- Make minimal changes. Do not add design patterns (Strategy, Adapter, Factory, Singleton) or classes unless there is a concrete need with at least two call sites.
- Preserve the existing UI layout, copy, and controls unless the user asks for a change.
- Do not add a backend, login, database, or booking creation. The room, bookings, and time are fixed fictional data.
- Do not edit tests to make them pass. Add tests when behavior is added or clarified.

## Commands

- Setup: use the README Node requirement (20.19+ or 22.12+); run `node --version` and `npm --version` and record the actual versions. With the committed `package-lock.json`, use `npm ci`; use `npm install` only for an explicitly authorized dependency change and review both manifest and lockfile.
- Local development: `npm run dev`; local build preview: `npm run preview`. Stop servers when finished; these commands do not authorize deployment.
- Test: `npm run test`
- Build: `npm run build`
- Typecheck: `npm run typecheck`
- Lint: `npm run lint`

`npm run build` runs Vite only; it is not a substitute for typecheck. The current typecheck
targets `tsconfig.app.json` (`src`), not the Vite/Vitest configuration files. Vitest uses jsdom
and `src/test/setup.ts`; the `@/` alias is configured in TypeScript, Vite, and Vitest.
Run all four checks for behavior changes and record exit codes, test totals, and warnings.
For documentation-only changes, review the diff and run `git diff --check`; disclose any checks
not rerun. Do not replace current evidence with historical counts from README or reports.

## Allowed and forbidden actions

- Allowed within the requested scope: inspect files/history, run the commands above, make minimal local edits, and add relevant tests and evidence. Stage only named, reviewed files; commit only when requested.
- Assignment 05 work belongs on `assignment-05`. Record the initial SHA and check branch/status before edits and commits. Never modify `main` or `week-12`; do not merge, rebase, or rewrite their history.
- Do not read, print, commit, or transmit secrets, credentials, tokens, or private environment files. Use fictional data; never add credentials or real student data to examples.
- Do not run destructive commands such as `git reset --hard`, `git clean -fd`, force pushes, recursive deletion, or commands that discard unrelated work.
- Do not deploy, publish, merge, or push without explicit user authorization. A request to commit alone does not authorize pushing.
- Do not add or upgrade dependencies, approve pending install scripts, run `npm audit fix` (especially `--force`), or regenerate the lockfile as incidental cleanup. Dependency changes require explicit scope and human review of package provenance, scripts, manifest, and lockfile.
- Keep Assignment 05 phases separate: Prompt 1 establishes this baseline; do not perform Prompt 2's risk review or Prompt 3's risk mitigations until requested.

## Review requirement

All changes require human review before merge or deploy. No automated CI pipeline is configured,
so a person must run the four commands above, read the output, and confirm the results before
accepting changes. Do not merge or deploy based on AI-verified checks alone.
AI reports must distinguish tool-observed results, assumptions, checks not run, and human
verification (pending until a person actually performs it). Human review includes the complete
diff, unchanged availability/mock behavior, dependency changes if any, and phase boundaries.

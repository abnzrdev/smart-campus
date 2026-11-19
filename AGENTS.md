# AGENTS.md

Constraints for anyone (human or AI assistant) changing this repository.
This file is documentation only. It does not enable any automatic agent behavior.

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
- `src/lib/canBook.spec.ts`: unit tests for `canBook` and `fmt`, one describe block per acceptance criterion.
- `src/lib/canBook.boundaries.spec.ts`: boundary tests for `canBook`.
- `src/lib/roomFilter.spec.ts`, `src/lib/roomRules.spec.ts`, `src/lib/timeInput.spec.ts`: tests for filtering, the room catalog, and time helpers.
- `src/App.spec.tsx`: UI tests for the full screen.
- `src/test/setup.ts`: test environment setup.
- `.checkpoints/`: saved buggy and backup copies of `canBook.ts` used for practice exercises. Do not edit.
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
- Make minimal changes. Do not add design patterns (Strategy, Adapter, Factory, Singleton) or classes unless there is a concrete need with at least two call sites.
- Preserve the existing UI layout, copy, and controls unless the user asks for a change.
- Do not add a backend, login, database, or booking creation. The room, bookings, and time are fixed fictional data.
- Do not edit tests to make them pass. Add tests when behavior is added or clarified.

## Commands

- Test: `npm run test`
- Build: `npm run build`
- Typecheck: `npm run typecheck`
- Lint: `npm run lint`

## Review requirement

All changes require human review before merge or deploy. No automated CI pipeline is configured,
so a person must run the four commands above, read the output, and confirm the results before
accepting changes. Do not merge or deploy based on AI-verified checks alone.

# Smart Campus Room Availability Checker

A single-page web app that answers one question for a set of fictional campus rooms: is a requested time interval free? It filters rooms by attendee capacity and required equipment, then checks availability for the selected room. It does not create or change bookings.

## Requirements

- Node.js 20.19 or newer (or 22.12 or newer), which Vite 7 requires
- npm (installed with Node.js)

## Install

```bash
npm install
```

## Run the app locally

```bash
npm run dev
```

Open the local address printed in the terminal.

## Build for production

```bash
npm run build
```

The output is written to `dist/`. To preview that build locally, run `npm run preview`.

## Run the tests

```bash
npm run test
```

Runs the Vitest suite (98 tests across six files).

## Other checks

```bash
npm run typecheck   # TypeScript check
npm run lint        # ESLint
```

## Project layout

- `src/App.tsx`: page composition and the availability check state
- `src/components/`: RoomFinder, RoomCard, AvailabilityForm, ResultCard, AvailabilityNotes
- `src/hooks/useRoomFinder.ts`: room search state (attendees, equipment, selected room, blocked toggle)
- `src/lib/canBook.ts`: availability rules (pure function)
- `src/lib/roomFilter.ts`: capacity and equipment filtering
- `src/lib/roomRules.ts`: fictional room catalog and constants
- `src/lib/timeInput.ts`: time selection helpers
- `src/lib/*.spec.ts`, `src/App.spec.tsx`: automated tests

See `AGENTS.md` for the engineering rules and `ASSIGNMENT_04_REPORT.md` for the design notes and evidence.

## Notes

- All rooms, bookings, and the simulated current time (09:00) are fixed fictional data in the source code.
- There is no database, login, or live data source.

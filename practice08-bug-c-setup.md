# Practice 08 — BUG-C Setup Record

## Starting state

- **Date:** 2026-10-29
- **BUG-A:** Repaired (evidence in `practice08-bug-a-evidence.md`)
- **BUG-B:** Repaired (evidence in `practice08-bug-b-skill-evidence.md`)

## Pre-bug verification

All 51 tests passed before introducing BUG-C.

```
 Test Files  2 passed (2)
      Tests  51 passed (51)
```

## BUG-C introduction

- **Changed file:** `src/lib/canBook.ts`
- **Snapshot of buggy state:** `.checkpoints/canBook.bug-c-buggy.ts`
- **Number of lines changed:** 1

## Post-bug test results

```
 Test Files  2 failed (2)
      Tests  7 failed | 44 passed (51)
```

### Failing tests (7)

1. `canBook > AC1 — integer minutes, range, ordering, start > now > accepts the required touching case 11:00–12:00 (660–720) => Available`
2. `canBook > AC2 — max duration 120, exactly 120 valid > accepts 119 minutes`
3. `canBook > AC4 — overlap; touching endpoints are NOT overlap > treats touching at end endpoint [660,661] as available`
4. `canBook > AC4 — overlap; touching endpoints are NOT overlap > multiple existing bookings > a gap between first and second booking is available (660–720, touching both)`
5. `canBook > AC4 — overlap; touching endpoints are NOT overlap > multiple existing bookings > a gap between second and third booking is available (780–900, touching both)`
6. `canBook > AC5 — unambiguous result; no mutation of bookings > returns ok=true for an available slot`
7. `App (smoke) > reports Available for the touching 11:00–12:00 slot`

### Passing tests (44)

All other tests continue to pass, including:
- Integer validation, range, ordering checks
- Start > now checks
- Duration limit checks (119, 120, 121, too-long)
- Blocked room checks
- Overlap detection for genuinely overlapping intervals
- Mutation checks
- Message content checks
- `fmt` utility tests
- Constant tests

## Git

Git is not available in this environment. The exact buggy state is preserved as a restorable snapshot at `.checkpoints/canBook.bug-c-buggy.ts`.

## Notes

- BUG-C is distinct from BUG-A and BUG-B.
- No test files or unrelated application code were modified.
- BUG-C remains present in `src/lib/canBook.ts`.
- No diagnosis, root cause, or fix is recorded in this file.

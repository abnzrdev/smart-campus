# Practice #08 — BUG-B Experiment Baseline

## Experiment

**BUG-B:** An off-by-one error in the maximum-duration check that rejects exactly-120-minute bookings, which AC2 defines as valid.

## Command used

```
npm run test
```

## Affected code

File: `src/lib/canBook.ts`, line 102 (inside `canBook`, the AC2 duration check).

### Before (correct)
```ts
if (duration > MAX_DURATION) {
```

### After (BUG-B)
```ts
if (duration >= MAX_DURATION) {
```

## Expected behavior

AC2 states the maximum booking length is 120 minutes and that **exactly 120 minutes is allowed**. With the correct strict `>` comparison, a 120-minute booking (e.g. 12:00–14:00, or 22:00–24:00) passes the duration check and proceeds to the blocked/overlap checks.

## Actual behavior (under BUG-B)

Changing `>` to `>=` makes the condition trigger when `duration === 120`, so any booking of exactly 120 minutes is wrongly rejected with reason `too-long`. Bookings of 119 minutes or less still pass. Bookings of 121+ minutes are still correctly rejected. The boundary case flipped from valid to invalid.

## Root cause

This is a classic off-by-one / boundary-condition bug. The business rule is "max 120, exactly 120 is allowed," which requires a strict greater-than (`>`) comparison so that equality falls on the *valid* side. Using `>=` moves the boundary value into the *invalid* side, rejecting the one case the spec explicitly permits.

## Proposed fix (not yet implemented)

Restore the strict comparison on line 102:

```ts
if (duration > MAX_DURATION) {
```

This is the smallest possible fix — a single operator change reverting `>=` back to `>`.

## Test results under BUG-B

```
 ❯ src/lib/canBook.spec.ts (46 tests | 3 failed) 104ms
 ❯ src/App.spec.tsx (5 tests) (all passed)

 Test Files  1 failed | 1 passed (2)
      Tests  3 failed | 48 passed (51)
```

**3 failed, 48 passed (total 51).**

## Names of failed tests

1. `canBook > AC1 — integer minutes, range, ordering, start > now > accepts end = 1440 boundary with valid future start and <=120 duration`
   - Input: `canBook(room(), 1320, 1440)` → duration = 120 min
   - Expected: `ok = true` (Available)
   - Actual: `ok = false` (reason `too-long`)

2. `canBook > AC2 — max duration 120, exactly 120 valid > accepts exactly 120 minutes (12:00–14:00)`
   - Input: `canBook(room(), 720, 840)` → duration = 120 min
   - Expected: `ok = true` (Available)
   - Actual: `ok = false` (reason `too-long`)

3. `canBook > AC4 — overlap; touching endpoints are NOT overlap > multiple existing bookings > a gap between second and third booking is available (780–900, touching both)`
   - Input: `canBook(multi, 780, 900)` → duration = 120 min
   - Expected: `ok = true` (Available)
   - Actual: `ok = false` (reason `too-long`)

## Expected vs. actual (representative)

```
AssertionError: expected false to be true
- Expected
+ Received
- true
+ false
```

All three failures share the same pattern: a 120-minute slot that should be Available is rejected as `too-long`.

## Tests still passing under BUG-B (48)

All tests covering: non-integer rejection, out-of-range, start-equals-end, reversed times, past-start, 119-minute acceptance, 121-minute rejection, blocked rooms, overlap detection, touching endpoints (non-120-min cases), immutability, message content, `fmt` formatting, and constants. The App smoke tests also all pass because none of them use exactly-120-minute slots.

## Checkpoints

- Original correct version: `.checkpoints/canBook.bug-a-backup.ts` (unchanged from BUG-A restoration)
- BUG-B buggy snapshot: `.checkpoints/canBook.bug-b-buggy.ts`

## Status

BUG-B remains in place. No fix has been applied. No test files or unrelated code were modified.

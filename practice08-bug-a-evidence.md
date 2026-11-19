# Practice #08 — BUG-A Experiment Evidence

## Experiment

**BUG-A:** Change the overlap comparison so that bookings touching at their endpoints are incorrectly considered overlapping.

## Command used

```
npm run test
```

## Before / after code difference

File: `src/lib/canBook.ts`, line 122 (inside the AC4 overlap loop)

**Before (correct):**
```ts
if (start < be && bs < end) {
```

**After (BUG-A):**
```ts
if (start <= be && bs <= end) {
```

## Root cause

The strict `<` operators were changed to `<=`. This makes intervals that merely touch at an endpoint (e.g. `[541,600]` vs booking `[600,660]`, or `[660,720]` vs `[600,660]`) satisfy the overlap condition, so they are wrongly rejected. This violates AC4: "touching at an endpoint is NOT an overlap."

## Test results under BUG-A

```
 ❯ src/lib/canBook.spec.ts (46 tests | 9 failed) 205ms
 ❯ src/App.spec.tsx (5 tests | 1 failed) 1901ms

 Test Files  2 failed (2)
      Tests  10 failed | 41 passed (51)
```

**10 failed, 41 passed (total 51).**

## Names of failed tests

1. `App (smoke) > reports Available for the touching 11:00–12:00 slot`
2. `canBook > AC1 — integer minutes, range, ordering, start > now > accepts start = now + 1 (strictly after)`
3. `canBook > AC1 — integer minutes, range, ordering, start > now > accepts the required touching case 11:00–12:00 (660–720) => Available`
4. `canBook > AC2 — max duration 120, exactly 120 valid > accepts 119 minutes`
5. `canBook > AC4 — overlap; touching endpoints are NOT overlap > treats touching at start endpoint [599,600] as available`
6. `canBook > AC4 — overlap; touching endpoints are NOT overlap > treats touching at end endpoint [660,661] as available`
7. `canBook > AC4 — overlap; touching endpoints are NOT overlap > multiple existing bookings > a gap between first and second booking is available (660–720, touching both)`
8. `canBook > AC4 — overlap; touching endpoints are NOT overlap > multiple existing bookings > a gap between second and third booking is available (780–900, touching both)`
9. `canBook > AC4 — overlap; touching endpoints are NOT overlap > multiple existing bookings > a short slot before the first booking is available (541–600, touching)`
10. `canBook > AC5 — unambiguous result; no mutation of bookings > returns ok=true for an available slot`

## Expected vs. actual (representative)

Each failing test expected `ok` to be `true` (Available), but BUG-A returned `false` (Unavailable, reason `overlap`):

```
AssertionError: expected false to be true
- Expected
+ Received
- true
+ false
```

## Tests still passing under BUG-A (41)

All tests covering genuine overlaps, blocked rooms, maximum duration rejections (121 min, much-too-long), integer/range/ordering rejections, past-start rejections, and booking-data immutability continued to pass. Only the "touching endpoints are available" and "available slot" assertions flipped to failing.

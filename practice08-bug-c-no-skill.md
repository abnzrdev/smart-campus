# Practice 08 — BUG-C Experiment A (WITHOUT SKILL)

## Investigation report

**Date:** 2026-10-29
**Approach:** Independent investigation without using the Bug Detector skill.

---

## 1. Initial state — reproducing the failure

Ran `npm run test` on the unmodified BUG-C codebase. Results:

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

All other tests passed, including:
- Integer validation, range checks, ordering checks
- Start > now checks (past time, exactly now)
- Duration limit checks (120 accepted, 121 rejected, too-long rejected)
- Blocked room checks
- Genuine overlap detection (intervals that truly overlap are still rejected)
- Mutation checks
- Message content checks
- `fmt` utility tests
- Constant tests

---

## 2. Debugging process

### Step 1: Identify the pattern in failures

All 7 failing tests share a common characteristic: they involve a booking interval that **touches** an existing booking at an endpoint but does not overlap it. Specifically:

- Test 1: `660–720` touches existing booking `[600, 660]` at its endpoint (start = bookedEnd = 660).
- Test 2: `660–779` touches the same booking at start = 660.
- Test 3: `660–661` touches the booking at start = 660.
- Tests 4–5: Gaps between multiple bookings that touch at both endpoints.
- Test 6: `660–720` again, touching at start = 660.
- Test 7: The UI smoke test checks the `660–720` slot.

All failing cases have the new interval's **start equal to an existing booking's end** (start === be). The test suite's acceptance criteria explicitly state that touching at endpoints should be allowed (AC4: "touching endpoints are NOT overlap").

### Step 2: Inspect the overlap logic

Read `src/lib/canBook.ts`, focusing on the overlap detection loop (AC4):

```typescript
// AC4: overlap using start < bookedEnd && bookedStart < end (touching OK)
for (const [bs, be] of room.bookings) {
    if (start <= be && bs < end) {   // ← BUG: uses <= instead of <
```

The comment says "touching OK" and describes the correct condition as `start < bookedEnd && bookedStart < end`. But the actual code uses `start <= be` (less-than-or-equal) instead of `start < be` (strict less-than).

### Step 3: Confirm genuine overlaps still work

Tests for actual overlapping intervals (e.g., `630–690` against `[600, 660]`, `610–650`, `590–670`, `730–760` against `[720, 780]`) all still **pass** — they are correctly rejected. This confirms the bug only affects the boundary condition, not the general overlap logic.

### Step 4: Root cause

**Root cause:** The overlap condition on line 122 uses `<=` instead of `<` for the first operand. The condition `start <= be` incorrectly treats a new booking starting exactly when an existing booking ends as an overlap. Per the acceptance criteria (AC4), two intervals that share only an endpoint (touching) should be considered non-overlapping and bookable.

The correct half-open interval overlap test is: `start < be && bs < end`. This uses strict inequality on both sides, meaning intervals like `[600, 660]` and `[660, 720]` do not overlap because 660 is the exclusive end of the first and the inclusive start of the second.

---

## 3. Code change

**File:** `src/lib/canBook.ts`
**Line:** 122
**Change:** `start <= be` → `start < be`

```diff
-    if (start <= be && bs < end) {
+    if (start < be && bs < end) {
```

This is the smallest possible fix — a single operator change restoring the correct strict-inequality condition described in the code's own comment.

---

## 4. Final verification

### Tests

```
 ✓ src/lib/canBook.spec.ts (46 tests) 93ms
 ✓ src/App.spec.tsx (5 tests) 708ms

 Test Files  2 passed (2)
      Tests  51 passed (51)
```

All 51 tests pass.

### Production build

```
vite v7.3.7 building client environment for production...
✓ 1565 modules transformed.
dist/index.html                   0.71 kB │ gzip:  0.39 kB
dist/assets/index-Dd6ofPCo.css   12.96 kB │ gzip:  3.14 kB │ gzip: 50.17 kB
✓ built in 10.81s
```

Build succeeds with no errors.

---

## 5. Summary

| Item | Value |
|---|---|
| Bug location | `src/lib/canBook.ts`, line 122 |
| Root cause | Overlap check used `<=` instead of `<`, causing touching intervals to be falsely rejected |
| Fix | Changed `start <= be` to `start < be` |
| Tests before fix | 7 failed, 44 passed (51 total) |
| Tests after fix | 0 failed, 51 passed (51 total) |
| Build after fix | Success |
| Files modified | 1 (`src/lib/canBook.ts`) |
| Test files modified | 0 |
| Checkpoint preserved | `.checkpoints/canBook.bug-c-buggy.ts` unchanged |

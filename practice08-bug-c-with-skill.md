# Practice 08 — BUG-C Experiment B (WITH Bug Detector Skill)

## Investigation report

**Date:** 2026-10-29
**Approach:** Independent investigation using the Bug Detector skill (`bugdeetector/skill.md`).

---

## The Bug Detector Skill

The skill defines a 7-step procedure:

1. Read acceptance criteria, code, and observed failure.
2. Reproduce with the smallest deterministic input.
3. Identify the likely root cause and relevant lines.
4. Separate confirmed defects from hypotheses.
5. Suggest a minimal fix, but do not edit code yet.
6. Propose a regression test and expected result.
7. Output: defect | evidence | root cause | fix | test.

Each step is applied below.

---

## Step 1 — Read acceptance criteria, code, and observed failure

### Acceptance criteria (from test suite and UI documentation)

The Smart Campus Booking application checks whether Study Room A-101 is available for a requested time interval. The acceptance criteria are:

- **AC1:** Times must be whole-number integers; `0 <= start < end <= 1440`; start must be strictly after the simulated current time (`now`).
- **AC2:** Maximum booking duration is 120 minutes; exactly 120 is allowed.
- **AC3:** If the room is blocked, every request is rejected.
- **AC4:** Overlap detection uses `start < bookedEnd && bookedStart < end` — intervals that merely touch at an endpoint do NOT count as overlap.
- **AC5:** The result is unambiguous (ok or not); no mutation of bookings.
- **AC6:** Every error has a non-empty, understandable message.

The AC4 criterion is explicitly stated in the test suite's describe block: "overlap; touching endpoints are NOT overlap". The UI's "How availability is judged" section also states: "Overlap uses start < bookedEnd && bookedStart < end — touching endpoints do not count as overlap."

### Code inspected

- `src/lib/canBook.ts` — the `canBook` function containing all validation logic.
- `src/lib/canBook.spec.ts` — 46 unit tests covering all acceptance criteria.
- `src/App.tsx` — the React UI that calls `canBook` and displays results.
- `src/App.spec.tsx` — 5 smoke tests for the UI.

### Observed failure

7 of 51 tests failed, all involving time intervals that touch an existing booking's endpoint without actually overlapping it.

---

## Step 2 — Reproduce with the smallest deterministic input

Ran `npm run test`. Initial results:

```
 Test Files  2 failed (2)
      Tests  7 failed | 44 passed (51)
```

### Failing tests (7)

1. `canBook > AC1 > accepts the required touching case 11:00–12:00 (660–720) => Available`
2. `canBook > AC2 > accepts 119 minutes` (660–779, touches booking end at 660)
3. `canBook > AC4 > treats touching at end endpoint [660,661] as available`
4. `canBook > AC4 > multiple existing bookings > a gap between first and second booking is available (660–720, touching both)`
5. `canBook > AC4 > multiple existing bookings > a gap between second and third booking is available (780–900, touching both)`
6. `canBook > AC5 > returns ok=true for an available slot` (660–720)
7. `App (smoke) > reports Available for the touching 11:00–12:00 slot`

### Smallest deterministic input

The base test room has `now: 540`, `blocked: false`, `bookings: [[600, 660]]`.

The smallest failing case: `canBook(room, 660, 661)` — a 1-minute interval starting exactly when the existing booking ends. Expected: `ok: true`. Actual: `ok: false, reason: 'overlap'`.

All 7 failures share the pattern: the requested interval's **start equals an existing booking's end** (e.g., start=660, bookedEnd=660). These should be allowed per AC4 but are being rejected.

---

## Step 3 — Identify the likely root cause and relevant lines

The overlap detection loop in `src/lib/canBook.ts` (AC4 section, line 120–130):

```typescript
// AC4: overlap using start < bookedEnd && bookedStart < end (touching OK)
for (const [bs, be] of room.bookings) {
    if (start <= be && bs < end) {   // line 122
```

The comment states the correct condition: `start < bookedEnd && bookedStart < end`. But the code uses `start <= be` (less-than-or-equal) instead of `start < be` (strict less-than).

When `start === be` (the new booking starts exactly when an existing one ends), `start <= be` evaluates to `true`, causing a false overlap rejection. With strict `<`, this boundary case correctly evaluates to `false` — no overlap.

### Expected vs actual behavior

| Input | Expected (AC4) | Actual (buggy) |
|---|---|---|
| `canBook(room, 660, 720)` with booking `[600, 660]` | `ok: true` (touching, no overlap) | `ok: false, reason: 'overlap'` |
| `canBook(room, 660, 661)` with booking `[600, 660]` | `ok: true` (touching, no overlap) | `ok: false, reason: 'overlap'` |
| `canBook(room, 630, 690)` with booking `[600, 660]` | `ok: false, reason: 'overlap'` (genuine overlap) | `ok: false, reason: 'overlap'` (correct) |

Genuine overlaps (where `start < be` is already true) are unaffected — they still get rejected correctly.

---

## Step 4 — Separate confirmed defects from hypotheses

### Confirmed defect

- **Line 122:** `start <= be` uses `<=` instead of `<`. This is confirmed by:
  1. The code comment on line 120 explicitly says the condition should be `start < bookedEnd`.
  2. The test suite's AC4 describe block says "touching endpoints are NOT overlap".
  3. The UI's documentation section says "touching endpoints do not count as overlap".
  4. All 7 failing tests involve exactly the `start === be` boundary.
  5. All 44 passing tests do not involve this boundary (or involve genuine overlaps where `start < be` is already true).

### Hypotheses ruled out

- **Duration check (AC2):** Although test 2 ("accepts 119 minutes") fails, this is a downstream effect — the interval 660–779 touches the booking at 660 and gets rejected as overlap before duration matters. The duration logic itself (`duration > MAX_DURATION`) is correct.
- **Time validation (AC1):** Test 1 fails for the same downstream reason — 660–720 is rejected as overlap, not for a time rule violation. Time validation logic is correct.
- **Blocked check (AC3):** No blocked-related tests fail. The blocked logic is correct.
- **`fmt` function:** All fmt tests pass. Not involved.

---

## Step 5 — Suggest a minimal fix, but do not edit code yet

**Proposed fix:** Change `<=` to `<` on line 122 of `src/lib/canBook.ts`.

```diff
-    if (start <= be && bs < end) {
+    if (start < be && bs < end) {
```

This restores the strict-inequality condition described in the code's own comment and the acceptance criteria. It is a single-operator change — the smallest possible fix.

---

## Step 6 — Propose a regression test and expected result

A regression test for this specific defect:

```typescript
it('does not reject a booking starting exactly when an existing booking ends', () => {
  // Existing booking [600, 660]; new booking starts at 660 (touching)
  expect(canBook(room(), 660, 661).ok).toBe(true);
});
```

**Expected result:** `ok: true` — the interval touches but does not overlap the existing booking.

This test already exists in the test suite as "treats touching at end endpoint [660,661] as available" (line 116–118 of the spec), confirming the test suite already covers this case. No new test needs to be added — the existing tests are sufficient to catch this regression.

---

## Step 7 — Output: defect | evidence | root cause | fix | test

| Field | Value |
|---|---|
| **Defect** | Overlap check falsely rejects intervals that touch an existing booking's end endpoint |
| **Evidence** | 7 failing tests, all with `start === bookedEnd`; smallest case: `canBook(room, 660, 661)` returns `overlap` instead of `available` |
| **Root cause** | `src/lib/canBook.ts` line 122: `start <= be` uses `<=` instead of `<`, violating AC4's "touching endpoints are NOT overlap" rule |
| **Fix** | Changed `start <= be` to `start < be` (single operator change) |
| **Regression test** | Already covered by existing test: "treats touching at end endpoint [660,661] as available" |

---

## Code change applied

**File:** `src/lib/canBook.ts`
**Line:** 122
**Change:** `start <= be` → `start < be`

```diff
-    if (start <= be && bs < end) {
+    if (start < be && bs < end) {
```

---

## Final test results

```
 ✓ src/lib/canBook.spec.ts (46 tests) 16ms
 ✓ src/App.spec.tsx (5 tests) 766ms

 Test Files  2 passed (2)
      Tests  51 passed (51)
```

All 51 tests pass.

---

## Build verification

```
vite v7.3.7 building client environment for production...
✓ 1565 modules transformed.
dist/index.html                   0.71 kB │ gzip:  0.39 kB
dist/assets/index-Dd6ofPCo.css   12.96 kB │ gzip:  3.14 kB | gzip: 50.17 kB
✓ built in 7.88s
```

Build succeeds with no errors.

---

## How the skill guided the investigation

The Bug Detector skill's 7-step procedure provided a structured debugging workflow:

1. **Step 1** ensured I read the acceptance criteria first — the AC4 rule ("touching endpoints are NOT overlap") and the code comment (`start < bookedEnd`) immediately established the expected behavior, giving me a reference point before examining failures.
2. **Step 2** prompted me to identify the smallest failing case (`660–661`), which isolated the boundary condition rather than getting lost in the larger failing intervals.
3. **Step 3** directed me to the specific lines — the overlap loop — and the mismatch between the comment's stated condition and the actual code.
4. **Step 4** was critical: it forced me to verify that the duration, time validation, and blocked checks were NOT the root cause, and that their test failures were downstream effects of the overlap false-positive. This prevented a misdiagnosis.
5. **Step 5** ensured I proposed the fix before editing, confirming it was a single-operator change.
6. **Step 6** confirmed the existing test suite already covers this regression case, so no new tests were needed.
7. **Step 7** produced the structured summary table for the report.

The skill's emphasis on separating confirmed defects from hypotheses (Step 4) was particularly valuable — without it, the AC2 and AC1 test failures could have led to investigating the duration or time-validation logic instead of the overlap boundary.

---

## Summary

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

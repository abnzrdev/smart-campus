# Practice #08 — BUG-B Skill-Guided Evidence

## Skill used

**Bug Detector** (`bugdeetector/skill.md`)

The skill defines a 7-step procedure:

1. Read acceptance criteria, code, and observed failure.
2. Reproduce with the smallest deterministic input.
3. Identify the likely root cause and relevant lines.
4. Separate confirmed defects from hypotheses.
5. Suggest a minimal fix, but do not edit code yet.
6. Propose a regression test and expected result.
7. Output: defect | evidence | root cause | fix | test.

## Steps followed

### Step 1 — Read acceptance criteria, code, and observed failure

I read `src/lib/canBook.ts` (the implementation) and `src/lib/canBook.spec.ts` (the acceptance-criteria tests). The code comment on line 100 states the AC2 rule: "max duration 120, exactly 120 valid." The constant `MAX_DURATION` is set to 120.

I ran `npm run test` and observed:

```
 ❯ src/lib/canBook.spec.ts (46 tests | 3 failed) 104ms
 ❯ src/App.spec.tsx (5 tests) (all passed)

 Test Files  1 failed | 1 passed (2)
      Tests  3 failed | 48 passed (51)
```

**3 failed, 48 passed (total 51).**

Failed tests:
1. `canBook > AC1 — integer minutes, range, ordering, start > now > accepts end = 1440 boundary with valid future start and <=120 duration`
2. `canBook > AC2 — max duration 120, exactly 120 valid > accepts exactly 120 minutes (12:00–14:00)`
3. `canBook > AC4 — overlap; touching endpoints are NOT overlap > multiple existing bookings > a gap between second and third booking is available (780–900, touching both)`

### Step 2 — Reproduce with the smallest deterministic input

All three failing tests share a common factor: the requested booking duration is exactly 120 minutes.

- Test 1: `canBook(room(), 1320, 1440)` → duration = 1440 − 1320 = 120
- Test 2: `canBook(room(), 720, 840)` → duration = 840 − 720 = 120
- Test 3: `canBook(multi, 780, 900)` → duration = 900 − 780 = 120

The smallest reproduction is: `canBook({ now: 540, blocked: false, bookings: [] }, 720, 840)` — a clean room with no bookings and a 120-minute request. This returns `{ ok: false, reason: 'too-long' }` instead of `{ ok: true, reason: 'available' }`.

### Step 3 — Identify the likely root cause and relevant lines

Line 102 of `src/lib/canBook.ts`:

```ts
if (duration >= MAX_DURATION) {
```

The comparison uses `>=` (greater-than-or-equal). When `duration` equals `MAX_DURATION` (120), the condition is true and the booking is rejected. But AC2 says exactly 120 is valid — the boundary value should pass.

### Step 4 — Separate confirmed defects from hypotheses

**Confirmed defect:** The `>=` operator on line 102 rejects `duration === 120`, which contradicts AC2 ("exactly 120 valid"). All three failing tests confirm this: each has a 120-minute duration and each receives `reason: 'too-long'`.

**Hypotheses ruled out:**
- Not an overlap bug: the overlap comparison on line 122 (`start < be && bs < end`) is correct and unchanged.
- Not a range/ordering bug: 119-minute bookings still pass; 121-minute bookings still fail.
- Not a blocked-room bug: none of the failing tests involve a blocked room.
- The only common factor across all three failures is `duration === 120`, and the only code path that rejects based on duration is line 102.

### Step 5 — Suggest a minimal fix (not yet implemented)

Change `>=` to `>` on line 102:

```ts
if (duration > MAX_DURATION) {
```

This makes the condition false when `duration === 120`, allowing exactly-120-minute bookings to pass. Durations of 121+ are still rejected.

### Step 6 — Propose a regression test and expected result

The existing test suite already contains the ideal regression test:

```ts
it('accepts exactly 120 minutes (12:00–14:00)', () => {
  expect(canBook(room(), 720, 840).ok).toBe(true);
});
```

Expected result after fix: `ok === true` (Available). This test was failing before the fix and should pass after.

### Step 7 — Output

## Defect

| Field | Value |
|---|---|
| **Defect** | Off-by-one boundary error in the maximum-duration check |
| **Affected code** | `src/lib/canBook.ts`, line 102 |
| **Expected behavior** | A booking of exactly 120 minutes is valid (AC2: "max duration 120, exactly 120 valid") |
| **Actual behavior** | A booking of exactly 120 minutes is rejected with `reason: 'too-long'` |
| **Root cause** | The comparison `duration >= MAX_DURATION` uses `>=` instead of `>`, so the boundary value 120 falls on the invalid side |
| **Evidence** | 3 tests fail, all involving 120-minute durations; 48 tests pass (including 119-min acceptance and 121-min rejection) |
| **Fix** | Change `>=` to `>` on line 102: `if (duration > MAX_DURATION) {` |
| **Regression test** | `canBook > AC2 — accepts exactly 120 minutes (12:00–14:00)` — already in the suite, was failing, now passes |

## Test results before fix

```
 Test Files  1 failed | 1 passed (2)
      Tests  3 failed | 48 passed (51)
```

## Test results after fix

```
 ✓ src/lib/canBook.spec.ts (46 tests) 93ms
 ✓ src/App.spec.tsx (5 tests) 889ms

 Test Files  2 passed (2)
      Tests  51 passed (51)
```

**51 passed, 0 failed.**

## Build verification after fix

```
 ✓ 1565 modules transformed.
 dist/index.html                   0.71 kB │ gzip:  0.39 kB
 dist/assets/index-Dd6ofPCo.css   12.96 kB │ gzip:  3.14 kB
 dist/assets/index-C2sgVpji.js   156.09 kB │ gzip: 50.17 kB
 ✓ built in 10.30s
```

Build passes with no errors.

## How the skill guided the investigation

The Bug Detector skill's structured 7-step procedure drove the investigation methodically:

1. **Step 1** directed me to read the acceptance criteria (code comments and test names) alongside the implementation, which immediately surfaced the AC2 rule: "exactly 120 valid."
2. **Step 2** pushed me to find the smallest reproduction. Recognizing that all three failures shared `duration === 120` narrowed the problem from three seemingly unrelated test failures to a single boundary condition.
3. **Step 3** pointed me to the exact line: the duration comparison on line 102.
4. **Step 4** enforced separating the confirmed defect from hypotheses — I verified that overlap, range, ordering, and blocked-room logic were all unaffected, confirming the duration check as the sole defect.
5. **Step 5** ensured I proposed the fix before implementing it, keeping the diagnosis and fix distinct.
6. **Step 6** confirmed the existing test suite already covers the regression case.

The skill's emphasis on smallest reproduction and separating confirmed defects from hypotheses prevented me from chasing red herrings (e.g., the AC1 and AC4 test categories that also failed but for the same underlying reason).

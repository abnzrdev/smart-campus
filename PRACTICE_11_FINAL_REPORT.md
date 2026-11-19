# Practice #11 Final Report: Mock LLM Availability Explanation

## 1. Test Count Summary

| Stage | Tests | Files |
|---|---|---|
| Baseline (before Practice #11) | 98 | 6 |
| Implementation (Prompt 1) | 123 | 7 |
| Final (after Prompt 3 fixes) | 135 | 7 |

12 new tests were added in Prompt 3: 12 in `mockLLM.spec.ts` (was 20, now 32). The `App.spec.tsx` count remains 19. No existing tests were modified to pass.

## 2. Feature User Story

**As a** KBTU student,
**I want** to see a plain-language explanation of why a room is available or unavailable,
**so that** I can understand the result without reading technical error messages.

The "Explain availability" button appears after any deterministic availability check. Clicking it generates a short, mock explanation in a violet panel labeled "Mock AI explanation." The confirmed Available/Unavailable status is never changed by the explanation.

## 3. Input/Output Contract

**Input** (`ExplainRequest`):
```
{
  roomLabel: string,       // non-empty, max 100 chars
  startTime: number,       // non-negative integer
  endTime: number,         // non-negative integer
  isAvailable: boolean,    // from canBook result, never overridden
  reasonCode: ReasonCode,  // one of 11 recognized values (including 'unknown')
  now: number              // current simulated time (SIMULATED_NOW = 540)
}
```

**Output** (`ExplainResponse`):
```
{ explanation: string }    // non-empty, max 300 chars, max 2 sentences
```

**Authority**: `canBook()` is the only authority for available/unavailable. The explanation text never changes the result.

**Mock note**: This is a MOCK adapter using template strings — not a real model, API, or inference. No API key, network call, or paid service is involved.

## 4. Architecture Flow

```
User clicks "Check availability"
  -> App.handleCheck()
    -> canBook(selectedRoom, startMin, endMin)   [rule engine, unchanged]
    -> CheckResult stored with roomId
    -> UI shows ResultCard with Available/Unavailable

User clicks "Explain availability"
  -> App.handleExplain()
    -> validateRequest(req)                       [input validation]
    -> if validation fails: show error, stop
    -> mockExplain(req, mode='ok')                [mock adapter]
       - builds explanation from reasonCode template
       - validates output (nonempty, <=300 chars, <=2 sentences)
       - on timeout/error/unavailable: returns status-aware fallback
    -> UI shows ExplanationPanel inside ResultCard
       - labeled "Mock AI explanation"
       - violet border/background, visually separated
       - does not alter the Available/Unavailable status
```

## 5. Three Mock Prompt Variants and Comparison

| Variant | Style | Example (overlap) | Clarity | Consistency | Factual agreement |
|---|---|---|---|---|---|
| A (concise) | One short sentence | "This time overlaps an existing booking." | High | High | Matches canBook |
| B (recommended) | One-two sentences, fact + action | "The requested time overlaps an existing booking in Study Room A-101. Try a slot that starts after the conflicting booking ends." | High | High | Matches canBook, references room name |
| C (detailed) | Two sentences with time details | "Your request from 10:30 to 11:30 overlaps a booking. Consider starting at 11:00 or later." | Medium | Low | Risk of inventing incorrect times |

**Recommendation: Variant B.** Used in the implementation. Clear, consistent, does not invent booking details, stays within two sentences.

## 6. Test Cases — Expected vs Observed (8+ cases)

| # | Test | Expected | Observed |
|---|---|---|---|
| 1 | validateRequest accepts well-formed request with `now` field | No errors | Pass — no errors |
| 2 | validateRequest rejects empty roomLabel | Error on roomLabel | Pass |
| 3 | validateRequest rejects long roomLabel (>100) | Error on roomLabel | Pass |
| 4 | validateResponse rejects >300 chars | Error on explanation | Pass |
| 5 | mockExplain returns explanation for available slot | ok=true, contains "free" | Pass |
| 6 | mockExplain returns explanation for overlap | ok=true, contains "overlaps" | Pass |
| 7 | F1: past-time explanation references current time (start < now, start=480) | Contains "09:00", not "08:00" | Pass |
| 8 | F1: past-time explanation references current time (start === now, start=540) | Contains "09:00" | Pass |
| 9 | F2: fallback for available result (timeout) | Contains "available", not "not available", mentions "explanation service is unavailable" | Pass |
| 10 | F2: fallback for unavailable result (timeout) | Contains "not available", mentions "explanation service is unavailable" | Pass |
| 11 | F2: fallback for available result (error mode) | Contains "available", not "not available" | Pass |
| 12 | F2: fallback for unavailable result (error mode) | Contains "not available" | Pass |
| 13 | F2: fallback for available result (unavailable mode) | Contains "available", not "not available" | Pass |
| 14 | F2: fallback for unavailable result (unavailable mode) | Contains "not available" | Pass |
| 15 | F3: unknown reason with isAvailable=false does not say "free from" | Contains "not available", not "free from" | Pass |
| 16 | F3: unknown reason with isAvailable=true says available but uncertain | Contains "available" and "could not be confirmed" | Pass |
| 17 | All 11 reason codes pass output validation | No validation errors | Pass |
| 18 | App: Explain button appears after result, shows mock explanation | "Mock AI explanation" and "free from" appear | Pass |
| 19 | App: availability status unchanged when explanation shown | "Available" still present | Pass |
| 20 | App: explanation clears when new check is run | "Mock AI explanation" disappears | Pass |

## 7. Read-Only Agentic Review Findings (F1–F5)

### F1 — Past-time explanation gives incorrect advice
- **Severity**: Medium
- **Classification**: CONFIRMED
- **File**: `src/lib/mockLLM.ts`, line 26 (before fix)
- **Evidence**: Template said `Pick a start later than ${fmt(req.startTime)}` — referencing the rejected start time, not the current time.
- **Reproduction**: start=480 (08:00), now=540 (09:00). Advice said "later than 08:00" — 08:30 still fails.
- **Fix applied**: Added `now` field to `ExplainRequest`, populated from `SIMULATED_NOW` in App.tsx. Template changed to `Pick a start later than ${fmt(req.now)}`. Added 2 regression tests.

### F2 — Fallback explanation contradicts Available status
- **Severity**: Low
- **Classification**: CONFIRMED (unreachable from UI at time of review, confirmed at unit level)
- **File**: `src/lib/mockLLM.ts`, lines 5–6 (before fix)
- **Evidence**: Static `FALLBACK_EXPLANATION` said "This room is not available" regardless of `isAvailable`.
- **Fix applied**: Replaced with `fallbackFor(req)` function that checks `req.isAvailable`. Available fallback says "The room is shown as available — please rely on the confirmed status above." Unavailable fallback says "The room is not available for the requested time." Both mention "The explanation service is unavailable." Added 6 regression tests (Available + Unavailable in all 3 failure modes).

### F3 — reasonToCode defaults to 'available' for unrecognized reasons
- **Severity**: Low
- **Classification**: PLAUSIBLE/UNVERIFIED (maintainability trap, no current trigger)
- **File**: `src/App.tsx`, line 34 (before fix)
- **Evidence**: `return codes.includes(reason) ? reason : 'available'` — an unknown error reason would produce an "available" explanation.
- **Fix applied**: Changed default to `'unknown'`. Added `'unknown'` to `ReasonCode` type and template map. Unknown reason with `isAvailable=false` says "not available, but the specific reason could not be determined." With `isAvailable=true` says "appears to be available, but the reason could not be confirmed." Added 2 regression tests.

### F4 — validateRequest missing upper-bound check on times
- **Severity**: Low
- **Classification**: PLAUSIBLE/UNVERIFIED
- **File**: `src/lib/explainValidation.ts`, lines 24–29
- **Evidence**: No upper bound (e.g., `<= 1440`) on startTime/endTime.
- **Status**: Not fixed in Prompt 3. Times are UI-bounded in the current app; not exploitable. Low risk.

### F5 — Sentence-count validator fragile with abbreviations
- **Severity**: Informational
- **Classification**: UNSUPPORTED
- **File**: `src/lib/explainValidation.ts`, line 69
- **Evidence**: Splitting on `[.!?]+` miscounts abbreviations like "Dr." as sentence boundaries.
- **Status**: Not fixed. No template uses abbreviations with periods. Latent fragility only.

## 8. Exactly Which Two Confirmed Issues Were Fixed

1. **F1 (Medium, CONFIRMED)**: Fixed by adding `now: number` to `ExplainRequest`, passing `SIMULATED_NOW` from `App.tsx`, and changing the past-time template from `fmt(req.startTime)` to `fmt(req.now)`. The explanation now correctly says "Pick a start later than 09:00" regardless of what the rejected start time was. Two regression tests added: `start < now` (480) and `start === now` (540).

2. **F2 (Low, CONFIRMED)**: Fixed by replacing the static `FALLBACK_EXPLANATION` constant with a `fallbackFor(req)` function that branches on `req.isAvailable`. Available fallbacks say "available" and tell the user to rely on the confirmed status. Unavailable fallbacks say "not available." Both explicitly state "The explanation service is unavailable." Six regression tests added covering both statuses in all three failure modes (timeout, error, unavailable).

Additionally, the safety fix for F3 was applied: `reasonToCode`'s default changed from `'available'` to `'unknown'`, with a new `'unknown'` reason code and template that never invents an available explanation for an unknown error. Two regression tests added.

## 9. Remaining Risks and Release Recommendation

| ID | Severity | Risk | Status |
|---|---|---|---|
| F4 | Low | Large time values pass validation | Not fixed — UI-bounded, not exploitable |
| F5 | Info | Abbreviation breaks sentence count | Not fixed — no current templates affected |
| — | Info | No browser testing performed | jsdom only — layout not verified in real browser |
| — | Info | No persistence | Explanation clears on any input change |

**Release recommendation**: Safe to release. F1 and F2 are fixed. F3 safety fix applied. All 135 tests pass, typecheck/lint/build clean. F4 and F5 are low-risk latent issues with no current impact.

## 10. Exact Commands and Results

| Command | Result |
|---|---|
| `npm run test` | 135 passed in 7 files (exit 0) |
| `npm run typecheck` | Pass (exit 0) |
| `npm run lint` | Pass (exit 0) |
| `npm run build` | Pass — JS 167.85 kB / 53.85 kB gzip |

## 11. Changed Files

| File | Change |
|---|---|
| `src/lib/explainTypes.ts` | Added `now: number` to `ExplainRequest`; added `'unknown'` to `ReasonCode` |
| `src/lib/explainValidation.ts` | Added `now` validation; added `'unknown'` to valid reasons |
| `src/lib/mockLLM.ts` | Fixed past-time template (F1); replaced static fallback with `fallbackFor(req)` (F2); added `'unknown'` template; changed `buildExplanation` default to `'unknown'` (F3) |
| `src/App.tsx` | Pass `now: SIMULATED_NOW` in request (F1); changed `reasonToCode` default to `'unknown'` (F3) |
| `src/lib/mockLLM.spec.ts` | Added `now` to all fixtures; 12 new tests for F1/F2/F3 regressions |

## 12. Manual Screenshot Checklist

- [ ] Default screen shows Study Room A-101, simulated time 09:00
- [ ] Check availability for 11:00–12:00 shows Available
- [ ] Click "Explain availability" — violet panel appears with "Mock AI explanation" label
- [ ] Explanation says "free from 11:00 to 12:00"
- [ ] Availability status remains "Available" after explanation shown
- [ ] Check availability for 10:30–11:30 shows Unavailable
- [ ] Explanation for overlap says "overlaps an existing booking"
- [ ] Select Media Lab D-012, check availability — Unavailable with blocked message
- [ ] Explanation for blocked says "is blocked and cannot be booked"
- [ ] Explanation clears when a new check is run
- [ ] Page is responsive on mobile and desktop viewports

## 13. AI Tools and Models

- **Bolt.new**: Used for project creation, development environment, and publishing
- **ChatGPT**: Used for code review and implementation guidance
- **Model reported by student**: GPT-6.1

## 14. Mock Adapter Note

This is a **MOCK adapter**, not a real model or API. The "explanations" are deterministic template strings selected by `reasonCode`. No API key, network call, model inference, or paid service is involved. The "Mock AI explanation" label in the UI makes this explicit to the user.

## 15. Reflection

**What AI generated**: The initial Practice #11 implementation (Prompt 1) — all new source files, test files, and the implementation report — was AI-generated. The read-only review (Prompt 2) was AI-conducted. The final fixes (Prompt 3) — F1, F2, F3 code changes, regression tests, and this report — were AI-generated.

**What was verified**: All 135 automated tests pass. TypeScript typecheck, ESLint, and production build all pass with exit code 0. The 98 baseline tests remain green and unchanged, confirming no regression in existing booking rules. No browser testing was performed — UI behavior was verified through jsdom-based tests only.

**What changed in Prompt 3**: Three targeted fixes — past-time advice now references the current simulated time (F1), fallback messages are status-aware (F2), and unrecognized reasons no longer default to an "available" explanation (F3). No booking rules, fictional data, or five-room behavior were modified.

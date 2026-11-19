# Practice #11 Implementation: Mock LLM Availability Explanation

## 1. Changed Files

| File | Status | Purpose |
|---|---|---|
| `src/lib/explainTypes.ts` | Created | Type definitions: `ExplainRequest`, `ExplainResponse`, `ReasonCode`, `AdapterMode` |
| `src/lib/explainValidation.ts` | Created | Input and output validation with bounded length and sentence count |
| `src/lib/mockLLM.ts` | Created | Mock LLM adapter with deterministic explanations and fallback handling |
| `src/lib/mockLLM.spec.ts` | Created | 20 tests covering validation, all reason codes, timeout, error, unavailable modes |
| `src/components/ExplanationPanel.tsx` | Created | UI panel labeled "Mock AI explanation", visually separated from result |
| `src/components/ResultCard.tsx` | Modified | Added Explain button, explanation state props, and ExplanationPanel rendering |
| `src/App.tsx` | Modified | Added explain state, handleExplain handler, wiring to ResultCard |
| `src/App.spec.tsx` | Modified | Added 5 UI tests for explain feature (19 total, was 14) |

No existing files were deleted. `canBook.ts`, `roomRules.ts`, `roomFilter.ts`, `timeInput.ts`, and their tests are unchanged.

## 2. Feature Contract

**Input** (`ExplainRequest`):
```
{
  roomLabel: string,      // non-empty, max 100 chars
  startTime: number,      // non-negative integer
  endTime: number,        // non-negative integer
  isAvailable: boolean,   // from canBook result, never overridden
  reasonCode: ReasonCode  // one of 10 recognized values
}
```

**Output** (`ExplainResponse`):
```
{ explanation: string }   // non-empty, max 300 chars, max 2 sentences
```

**Authority**: `canBook()` is the only authority for available/unavailable. The explanation text never changes the result. The `isAvailable` and `reasonCode` fields are passed from the `canBook()` result and used only to select which explanation template to use.

**Safety**: User-supplied text (roomLabel) is treated as data, not instructions. The mock adapter contains no prompt injection surface because it uses template strings, not LLM inference.

## 3. Architecture

```
User clicks "Check availability"
  -> App.handleCheck()
    -> canBook(selectedRoom, startMin, endMin)   [rule engine, unchanged]
    -> CheckResult stored with roomId
    -> UI shows ResultCard with Available/Unavailable

User clicks "Explain availability"
  -> App.handleExplain()
    -> validateRequest(req)                        [input validation]
       - empty roomLabel rejected
       - excessively long roomLabel rejected
       - non-integer times rejected
       - invalid reasonCode rejected
    -> if validation fails: show error, stop
    -> mockExplain(req, mode)                      [mock adapter]
       - builds explanation from reasonCode template
       - validates output (nonempty, <=300 chars, <=2 sentences)
       - on timeout/error/unavailable: returns FALLBACK_EXPLANATION
    -> validateResponse(response)                  [output validation]
    -> UI shows ExplanationPanel inside ResultCard
       - labeled "Mock AI explanation"
       - visually separated (violet border/background)
       - does not alter the Available/Unavailable status
```

## 4. Prompt Variant Comparison

Three template styles were compared for generating explanations. No real model was queried. These are mock template strings inside `mockLLM.ts`.

| Variant | Style | Example (overlap) | Clarity | Consistency | Factual agreement |
|---|---|---|---|---|---|
| A (concise) | One short sentence, states the fact | "This time overlaps an existing booking." | High | High across all reasons | Matches canBook result |
| B (recommended) | One-two sentences, states fact + suggests action | "The requested time overlaps an existing booking in Study Room A-101. Try a slot that starts after the conflicting booking ends." | High | High across all reasons | Matches canBook result, references room name |
| C (detailed) | Two sentences, includes time details | "Your request from 10:30 to 11:30 overlaps a booking in Study Room A-101. Consider starting at 11:00 or later." | Medium | Low (time details vary) | Risk of inventing specific times not guaranteed correct |

**Recommendation: Variant B.** It is clear, consistent across all reason codes, does not invent booking details, and stays within two sentences. Variant C risks factual errors by suggesting specific times that may not account for all bookings. Variant A is too terse to help a student understand the decision.

## 5. Test Matrix

### mockLLM.spec.ts (20 tests)

| # | Test | Expected | Observed |
|---|---|---|---|
| 1 | validateRequest accepts well-formed request | No errors | Pass |
| 2 | validateRequest rejects empty roomLabel | Error on roomLabel | Pass |
| 3 | validateRequest rejects long roomLabel (>100) | Error on roomLabel | Pass |
| 4 | validateRequest rejects NaN startTime | Error on startTime | Pass |
| 5 | validateRequest rejects invalid reasonCode | Error on reasonCode | Pass |
| 6 | validateResponse accepts one-sentence | No errors | Pass |
| 7 | validateResponse accepts two-sentence | No errors | Pass |
| 8 | validateResponse rejects empty | Error on explanation | Pass |
| 9 | validateResponse rejects >300 chars | Error on explanation | Pass |
| 10 | validateResponse rejects three sentences | Error on explanation | Pass |
| 11 | mockExplain returns explanation for available | ok=true, contains "free" | Pass |
| 12 | mockExplain returns explanation for overlap | ok=true, contains "overlaps" | Pass |
| 13 | mockExplain returns explanation for blocked | ok=true, contains "blocked" | Pass |
| 14 | mockExplain returns explanation for invalid time | ok=true, contains "whole number" | Pass |
| 15 | mockExplain returns explanation for past time | ok=true, contains "current" | Pass |
| 16 | mockExplain returns fallback on timeout | ok=false, fallback text, error contains "timeout" | Pass |
| 17 | mockExplain returns fallback on API error | ok=false, fallback text, error contains "API error" | Pass |
| 18 | mockExplain returns fallback when unavailable | ok=false, fallback text, error contains "unavailable" | Pass |
| 19 | mockExplain never references bookings not in request | No "14:00" or "17:00" in overlap explanation | Pass |
| 20 | All 10 reason codes pass output validation | No validation errors for any reason | Pass |

### App.spec.tsx explain tests (5 new, 19 total)

| # | Test | Expected | Observed |
|---|---|---|---|
| 15 | Explain button appears after result; clicking shows mock explanation | Button visible, "Mock AI explanation" and "free from" text appear | Pass |
| 16 | Availability status does not change when explanation shown | "Available" still present after explanation | Pass |
| 17 | Overlap result shows explanation with overlap text | "Mock AI explanation" panel contains "overlaps an existing booking" | Pass |
| 18 | Blocked room shows explanation with blocked text | "Mock AI explanation" panel contains "is blocked and cannot be booked" | Pass |
| 19 | Explanation clears when a new check is run | "Mock AI explanation" disappears after second check | Pass |

### Coverage of required test cases

| Required case | Test(s) |
|---|---|
| Available | mockLLM #11, App #15 |
| Overlap | mockLLM #12, App #17 |
| Blocked | mockLLM #13, App #18 |
| Invalid time | mockLLM #14, validateRequest #4 |
| Past time | mockLLM #15 |
| Empty input | validateRequest #2 |
| Overly long input | validateRequest #3, validateResponse #9 |
| Timeout | mockLLM #16 |
| Simulated API failure | mockLLM #17 |
| Status immutability | App #16 (status unchanged after explanation) |

## 6. Baseline vs Final Results

| Check | Baseline (before) | Final (after) |
|---|---|---|
| Tests | 98 passed in 6 files | 123 passed in 7 files |
| Typecheck | Pass (exit 0) | Pass (exit 0) |
| Lint | Pass (exit 0) | Pass (exit 0) |
| Build | Pass, JS 160.77 kB / 51.80 kB gzip | Pass, JS 167.26 kB / 53.67 kB gzip |
| Date | 2026-11-19T10:30:57Z | 2026-11-19T10:34:01Z |

All 98 baseline tests still pass unchanged. 25 new tests were added (20 in mockLLM.spec.ts, 5 in App.spec.tsx).

## 7. Scope Difference: Original Assignment vs Current

The original assignment (Assignment 03) specified one fictional room ("Study Room A-101"). The current project has five rooms in `src/lib/roomRules.ts` (added in Assignment 04). This Practice #11 preserves the five-room behavior. The mock LLM adapter works with any room because it receives `roomLabel` as an input field, not a hardcoded constant.

## 8. Remaining Limitations

1. **No real LLM**: The adapter is a mock with template strings. No API key, network call, or model inference occurs.
2. **No browser testing**: UI layout and accessibility were not verified in a browser. Tests use jsdom only.
3. **Fallback is generic**: The `FALLBACK_EXPLANATION` says "not available" even when the room is available, because it is used only in error/timeout/unavailable modes where the adapter could not build a specific response. The confirmed Available/Unavailable status in the ResultCard is unaffected.
4. **No persistence**: Explanation state is not saved; it clears on any change to room, time, or filter.
5. **Explain button is always available** after any deterministic result, including for invalid time inputs. The explanation for invalid inputs is a generic message about correcting the input.
6. **No independent code review** has been performed yet, per the instructions.

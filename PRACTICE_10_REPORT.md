# Practice #10 — Phase 2: Mitigation + Verification Report

**Date:** 2026-11-12
**Scope:** Minimal focused fixes for findings R1 and R4 from the Phase 1 read-only audit. No redesign, unrelated refactoring, new dependencies, database, deployment, or commits.

---

## 1. Changed files and diff

Four source/config files were modified. No files were created or deleted.

### 1.1 `src/lib/canBook.ts` — R1 fix

**Before (line 1):**
```ts
import { MAX_DURATION, MINUTES_PER_DAY, ROOM_NAME } from '@/lib/roomRules';
```
**After (line 1):**
```ts
import { MAX_DURATION, MINUTES_PER_DAY } from '@/lib/roomRules';
```

**Before (lines 116–118):**
```ts
      message:
        `${ROOM_NAME} is currently marked as blocked. No availability checks pass while blocked.`,
```
**After (lines 116–117):**
```ts
      message:
        'This room is currently marked as blocked. No availability checks pass while blocked.',
```

Rationale: `canBook` receives only `RoomState` (no room name field). The `ROOM_NAME` constant is hardcoded to "Study Room A-101", so the blocked message was wrong for any other room. The UI (`ResultCard.tsx`) already constructs the correct room-specific blocked wording from the `roomName` prop. The library message is now generic and accurate for all rooms. The `canBook` signature, return shape, validation order, and AC1–AC6 are unchanged.

### 1.2 `src/lib/canBook.spec.ts` — R1 regression test

Added one test to the AC3 block:

```ts
    it('blocked message is generic and does not name a specific room', () => {
      const r = canBook(room({ blocked: true }), 660, 720);
      if (r.ok) throw new Error('expected err');
      expect(r.message).not.toContain('A-101');
      expect(r.message).not.toContain('Study Room');
      expect(r.message).toContain('blocked');
    });
```

Test count in this file: 46 → 47.

### 1.3 `src/lib/canBook.boundaries.spec.ts` — R1 test correction

**Before:**
```ts
    it('names the room in the blocked message', () => {
      const r = canBook(frozenRoom({ blocked: true }), 900, 901);
      if (r.ok) throw new Error('expected err');
      expect(r.message).toContain('Study Room A-101');
    });
```
**After:**
```ts
    it('blocked message is generic and does not hardcode a room name', () => {
      const r = canBook(frozenRoom({ blocked: true }), 900, 901);
      if (r.ok) throw new Error('expected err');
      expect(r.message).toContain('blocked');
      expect(r.message).not.toContain('Study Room A-101');
    });
```

Test count in this file: unchanged (16). The old test asserted the presence of the hardcoded room name; the new test asserts the message is generic and does not contain the hardcoded name. This test was corrected (not added), so the total test count increase is +1 (from the `canBook.spec.ts` addition).

### 1.4 `AGENTS.md` — R4 fix

Three additions:

1. **Project purpose** updated from "one fictional room" to "a set of fictional campus rooms (five rooms in the catalog)". Added a "Known difference from the original assignment scope" subsection documenting that the original assignment specified a single room, and that the five-room extension is intentionally retained.

2. **Commands** section: added `npm run lint`.

3. **Review requirement** section (new): requires human review before merge/deploy, noting no CI pipeline is configured.

### 1.5 `README.md` — test count update

**Before:**
```
Runs the Vitest suite (91 tests across six files).
```
**After:**
```
Runs the Vitest suite (98 tests across six files).
```

The previous count (91) was stale. The actual count after the post-cleanup run recorded in `TEST_RESULTS.txt` was 97. After adding one regression test in this phase, the count is 98, confirmed by running `npm run test`.

---

## 2. Verification results (executed 2026-11-12)

### 2.1 `npm run test` — exit 0

```
 ✓ src/lib/timeInput.spec.ts (7 tests) 83ms
 ✓ src/lib/canBook.boundaries.spec.ts (16 tests) 86ms
 ✓ src/lib/roomFilter.spec.ts (10 tests) 12ms
 ✓ src/lib/canBook.spec.ts (47 tests) 116ms
 ✓ src/lib/roomRules.spec.ts (4 tests) 5ms
 ✓ src/App.spec.tsx (14 tests) 3733ms

 Test Files  6 passed (6)
      Tests  98 passed (98)
```

### 2.2 `npm run typecheck` — exit 0

```
> tsc --noEmit -p tsconfig.app.json
```
No errors.

### 2.3 `npm run lint` — exit 0

```
> eslint .
```
No errors.

### 2.4 `npm run build` — exit 0

```
✓ 1574 modules transformed.
dist/index.html                   0.71 kB │ gzip:  0.39 kB
dist/assets/index-Bobqx8Bu.css   13.40 kB │ gzip:  3.22 kB
dist/assets/index-CcXHOf-5.js   160.77 kB │ gzip: 51.80 kB
✓ built in 8.42s
```

### 2.5 Browser testing

**NOT RUN.** No browser or screenshot tool was available. UI behavior is verified only by the jsdom-based test suite (`App.spec.tsx`, 14 tests). The `ResultCard` component was not modified — it already used the `roomName` prop for the blocked message — so the visible blocked wording in the UI is unchanged.

---

## 3. Risk register — R1 and R4

### R1: Hardcoded room name in `canBook` blocked message

| Field | Value |
|---|---|
| **Finding** | `canBook`'s blocked rejection message used the `ROOM_NAME` constant ("Study Room A-101"), producing a wrong message for any non-A101 room. |
| **Severity (before)** | Medium — incorrect user-facing message for 4 of 5 rooms; the UI masked it via `ResultCard` but the library output was wrong. |
| **Mitigation** | Replaced the hardcoded room name with a generic message: "This room is currently marked as blocked." Removed the `ROOM_NAME` import from `canBook.ts`. |
| **Verification** | 98/98 tests pass, including a new regression test asserting the message does not contain "A-101" or "Study Room" and does contain "blocked". The boundaries test was corrected to assert the same. Typecheck, lint, and build all pass (exit 0). |
| **Residual risk** | Low — the library message is generic (no room name). The UI still shows the correct room-specific wording via `ResultCard`. If a future caller displays `result.message` directly, it will see "This room" instead of a specific name, which is accurate but less specific. |
| **Residual score** | 2/10 (was 6/10) |

### R4: AGENTS.md inaccurate documentation

| Field | Value |
|---|---|
| **Finding** | AGENTS.md described the project as "one fictional room" despite a five-room catalog. The commands section omitted `npm run lint`. No human-review requirement was documented. |
| **Severity (before)** | Low — documentation drift; no functional impact, but misleading to anyone reading the constraints. |
| **Mitigation** | Updated the project purpose to describe the five-room catalog. Added a "Known difference" subsection documenting the original one-room scope. Added `npm run lint` to commands. Added a "Review requirement" section requiring human review before merge/deploy. |
| **Verification** | Read from source after editing. Content matches the actual codebase (`ROOMS` array in `roomRules.ts` has five entries). Lint command confirmed to exist in `package.json` and to run successfully. |
| **Residual risk** | Minimal — documentation now matches the codebase. The known-difference note preserves the original scope context without removing functionality. |
| **Residual score** | 1/10 (was 3/10) |

### Unresolved findings (left visible, not addressed in this phase)

| ID | Finding | Status |
|---|---|---|
| R2 | Minute-field clearing resets to "00" immediately, preventing typing a new value | Unresolved (carried over) |
| R3 | `roomRules.ts` and `canBook.ts` have a circular type import | Unresolved (carried over) |
| R5 | Unused Supabase dependency in `package.json` (if still present) | Unresolved — see note below |
| R6 | Duplicated test helpers (`frozenRoom` vs `room()`) and overlapping boundary cases | Unresolved (carried over) |
| R7 | Blocked-status changes from "Test mode" are not persisted (reset on reload) | Unresolved (by design — no storage) |

Note on R5: The `ASSIGNMENT_04_REPORT.md` mentions `@supabase/supabase-js` as unused, but the current `package.json` does not list it. The report text may be stale from an earlier state. This finding may already be resolved; it was not re-verified in this phase because it is out of scope.

---

## 4. Agent readiness assessment (lecture rubric)

### L1 — Basic engineering hygiene

| Criterion | Evidence | Met? |
|---|---|---|
| Code formatter | No Prettier or formatter config found in the project. Code is manually formatted. | **No** |
| Lint | `npm run lint` (ESLint) exists in `package.json`, runs with exit 0. `eslint.config.js` is present. | **Yes** |
| Typecheck | `npm run typecheck` (tsc --noEmit) exists, runs with exit 0. | **Yes** |
| Tests | `npm run test` (Vitest) runs 98 tests, all passing, across 6 files. | **Yes** |
| Pinned dependencies | `package.json` uses caret ranges (`^`) for all dependencies, not exact pins. | **No** |

**L1 verdict: Partial (3 of 5).** Missing: code formatter, pinned dependencies.

### L2 — Project documentation

| Criterion | Evidence | Met? |
|---|---|---|
| `.env.example` | No `.env.example` file exists. The `.env` file contains Supabase URL and anon key (not committed per `.gitignore`). | **No** |
| Architecture notes | `ASSIGNMENT_04_REPORT.md` section 3 contains BEFORE and AFTER Mermaid diagrams and design decisions. `AGENTS.md` has a file-structure section. | **Yes** |
| `AGENTS.md` | Present, updated in this phase with accurate five-room description, lint command, and review requirement. | **Yes** |

**L2 verdict: Partial (2 of 3).** Missing: `.env.example`.

### L3 — Automation and review

| Criterion | Evidence | Met? |
|---|---|---|
| CI pipeline | No CI configuration found (no `.github/workflows/`, no CI config). | **No** |
| Git hooks | No pre-commit or pre-push hooks found (no husky, lint-staged, or `.git/hooks` config). | **No** |
| Integration checks | No integration test suite beyond the jsdom `App.spec.tsx` smoke tests. No E2E tests. | **No** |
| Review evidence | `AGENTS.md` now documents a human-review requirement. `AI_EVIDENCE.md` documents that no human review has occurred. No actual review evidence exists. | **No** |

**L3 verdict: Not met (0 of 4).** No CI, no hooks, no integration checks, no review evidence.

---

## 5. Background-agent thought experiment

**Scenario:** A background agent is assigned to apply the same R1 and R4 fixes in an isolated environment.

### Isolation
- The agent would work in a separate git worktree or branch (e.g., `practice-10/r1-r4-fixes`) created from the main branch. The worktree ensures the agent's changes do not affect the working tree until merged.

### Restricted permissions
- **Allowed commands:** `npm run test`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff`, `git log`, `git status`, `cat`, `ls`, `head`, `grep`. No `git push`, `git merge`, `npm install`, `npm publish`, or deployment commands.
- **Allowed file writes:** `src/lib/canBook.ts`, `src/lib/canBook.spec.ts`, `src/lib/canBook.boundaries.spec.ts`, `AGENTS.md`, `README.md`. All other files read-only.
- **Denied:** Creating new files, deleting files, modifying `package.json`, modifying CI config, running database migrations, deploying edge functions, network access.

### Required evidence
- **Diff:** `git diff` output showing only the five allowed files changed, with no unrelated modifications.
- **Test output:** `npm run test` showing all tests pass with the exact count (98 expected).
- **Typecheck:** `npm run typecheck` exit 0.
- **Lint:** `npm run lint` exit 0.
- **Build:** `npm run build` exit 0 with bundle size.
- **No-new-files assertion:** `git status --porcelain` showing no untracked files.

### Human approval gate
- The agent would produce the diff and command outputs as evidence, then **stop**. A human reviewer would:
  1. Read the diff and confirm only the five expected files changed.
  2. Confirm the test count increased by exactly 1 (97 → 98).
  3. Confirm the blocked message no longer contains "Study Room A-101".
  4. Confirm AGENTS.md describes five rooms and includes the lint command.
  5. Approve or reject. Only after approval would the branch be merged and deployed.

### Risk assessment
- **Blast radius:** Low — the changes are two lines in a pure function, one test addition, one test correction, and documentation text. No database, no deployment, no dependency changes.
- **Reversibility:** High — if the changes are wrong, the branch is discarded. The main branch is untouched.
- **Failure mode:** The agent could modify tests to make them pass instead of fixing the code. The human reviewer would catch this by reading the diff and confirming the test asserts the correct behavior (generic message, not a specific room name).

---

## 6. Recommendation: CONDITIONAL

### Justification

The two findings (R1, R4) are mitigated and verified by passing tests, typecheck, lint, and build. The changes are minimal and focused. However:

- **No browser testing was performed.** The UI was not modified, but this is not confirmed visually.
- **No human review has occurred.** The `AGENTS.md` review requirement is now documented but not yet satisfied.
- **L1 is partial** (missing formatter and pinned dependencies).
- **L2 is partial** (missing `.env.example`).
- **L3 is not met** (no CI, no hooks, no integration checks, no review evidence).
- **Five unresolved findings** remain visible in the risk register.

### Manual verification checklist

Before merging or deploying, a human reviewer must:

- [ ] Read the diff and confirm only these files changed: `src/lib/canBook.ts`, `src/lib/canBook.spec.ts`, `src/lib/canBook.boundaries.spec.ts`, `AGENTS.md`, `README.md`
- [ ] Confirm `canBook.ts` no longer imports `ROOM_NAME`
- [ ] Confirm the blocked message reads "This room is currently marked as blocked..." (not "Study Room A-101 is currently marked as blocked...")
- [ ] Run `npm run test` and confirm 98 tests pass
- [ ] Run `npm run typecheck` and confirm exit 0
- [ ] Run `npm run lint` and confirm exit 0
- [ ] Run `npm run build` and confirm exit 0
- [ ] Open the app in a browser, select a blocked room (Media Lab D-012), run a check, and confirm the blocked message says "Media Lab D-012 is currently marked as blocked..."
- [ ] Select a non-blocked room, toggle it to blocked via Test mode, run a check, and confirm the blocked message names the correct room (via the UI, not the library message)
- [ ] Read AGENTS.md and confirm it describes five rooms, includes `npm run lint`, and has the review-requirement section
- [ ] Confirm no new files were created and no dependencies were added or removed

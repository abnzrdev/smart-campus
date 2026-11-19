# Project memory

## Product intent & audience

- Smart Campus Room Availability Checker for KBTU Software Engineering Practice #11.
- Audience: students checking classroom availability at KBTU.
- No login, database, or real booking system; fictional bookings only.
- Existing scope: 5 rooms with deterministic availability rules (original assignment mentions 1 room — documented as intentional scope difference).

## Brand personality & voice

- Academic, clear, trustworthy.
- Explanations labeled explicitly as "Mock AI explanation" — never imply real AI inference.
- User-provided text is treated as data, not instructions.

## Visual design & UX direction

- Vite + React (JSX), Tailwind CSS, Lucide React icons; `@/` alias maps to `src/`.
- Simple, accessible, responsive UI consistent with existing design.
- Mock AI explanation displayed in a violet-colored panel, visually separated from confirmed availability status.
- "Explain availability" button is optional and appears only after a deterministic booking result.
- Availability checker output is the sole authority; explanation never overrides status.

## Decisions, constraints & rationale

- Mock LLM adapter only: no API key, network call, paid service, or actual inference.
- Feature contract: input `{ roomLabel, startTime, endTime, isAvailable, reasonCode }`; output `{ explanation: string }`.
- Validation: reject empty/malformed/overly long input; output must be nonempty, ≤300 chars, ≤2 sentences.
- Safe deterministic fallbacks for simulated timeout, API error, and unavailable adapter modes.
- Test framework: Vitest (`.spec.ts`/`.spec.tsx` files).
- Independent code review and publishing intentionally deferred (not yet performed).
- Practice #11 feature is complete; baseline checks all green.

## Open questions & assumptions

- Practice #11 implementation report exists at `PRACTICE_11_IMPLEMENTATION.md` with full architecture, prompt comparison, and test matrix.
- Baseline before Practice #11: 98 tests in 6 files. Final: 123 tests in 7 files (25 new tests).
- All checks pass: test (123), typecheck, lint, build (JS bundle 167.26 kB / 53.67 kB gzip).
- Key files: `src/lib/explainTypes.ts`, `src/lib/explainValidation.ts`, `src/lib/mockLLM.ts`, `src/lib/mockLLM.spec.ts`, `src/components/ExplanationPanel.tsx`, `src/components/ResultCard.tsx`, `src/App.tsx`, `src/App.spec.tsx`.
- Next steps pending: independent agentic code review and publishing.
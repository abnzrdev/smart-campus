import type { ExplainRequest, ExplainResponse, AdapterMode, ReasonCode } from '@/lib/explainTypes';
import { fmt } from '@/lib/canBook';
import { validateResponse, isSafeFallback } from '@/lib/explainValidation';

function fallbackFor(req: ExplainRequest): string {
  if (req.isAvailable) {
    return 'The explanation service is unavailable. The room is shown as available — please rely on the confirmed status above.';
  }
  return 'The explanation service is unavailable. The room is not available for the requested time; please try a different time or room.';
}

const explanations: Record<ReasonCode, (req: ExplainRequest) => string> = {
  available: (req) =>
    `This room is free from ${fmt(req.startTime)} to ${fmt(req.endTime)}. You may proceed with your booking.`,
  blocked: (req) =>
    `${req.roomLabel} is blocked and cannot be booked. No availability check passes while the room is blocked.`,
  overlap: (req) =>
    `The requested time overlaps an existing booking in ${req.roomLabel}. Try a slot that starts after the conflicting booking ends.`,
  'start-not-integer': () =>
    'The start time must be a whole number of minutes. Please correct the input.',
  'end-not-integer': () =>
    'The end time must be a whole number of minutes. Please correct the input.',
  'out-of-range': () =>
    'Times must be within the same day (00:00 to 24:00). Please adjust your selection.',
  'start-after-end': () =>
    'The start time is later than the end time. Please reverse them or pick a valid range.',
  'start-equals-end': () =>
    'Start and end times are the same. The end time must be later than the start.',
  'start-must-be-after-now': (req) =>
    `The start time is at or before the current simulated time. Pick a start later than ${fmt(req.now)}.`,
  'too-long': () =>
    'The requested duration exceeds the 120-minute maximum. Shorten the interval and try again.',
  unknown: (req) =>
    req.isAvailable
      ? 'This room appears to be available, but the reason could not be confirmed. Please rely on the confirmed status above.'
      : 'This room is not available, but the specific reason could not be determined. Please check your time selection and try again.',
};

function buildExplanation(req: ExplainRequest): ExplainResponse {
  const builder = explanations[req.reasonCode] ?? explanations['unknown'];
  return { explanation: builder(req) };
}

export interface AdapterResult {
  readonly ok: boolean;
  readonly response: ExplainResponse | null;
  readonly error: string | null;
}

export async function mockExplain(
  req: ExplainRequest,
  mode: AdapterMode = 'ok'
): Promise<AdapterResult> {
  if (mode === 'unavailable') {
    const fallback: ExplainResponse = { explanation: fallbackFor(req) };
    return { ok: false, response: fallback, error: 'Adapter unavailable.' };
  }

  if (mode === 'timeout') {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const fallback: ExplainResponse = { explanation: fallbackFor(req) };
    return { ok: false, response: fallback, error: 'Simulated timeout.' };
  }

  if (mode === 'error') {
    const fallback: ExplainResponse = { explanation: fallbackFor(req) };
    return { ok: false, response: fallback, error: 'Simulated API error.' };
  }

  const response = buildExplanation(req);
  if (!isSafeFallback(response)) {
    const fallback: ExplainResponse = { explanation: fallbackFor(req) };
    return { ok: false, response: fallback, error: 'Response failed validation.' };
  }

  return { ok: true, response, error: null };
}

export { validateResponse };

import { describe, it, expect } from 'vitest';
import { mockExplain } from '@/lib/mockLLM';
import {
  validateRequest,
  validateResponse,
  MAX_ROOM_LABEL_LEN,
  MAX_EXPLANATION_LEN,
} from '@/lib/explainValidation';
import type { ExplainRequest } from '@/lib/explainTypes';

const NOW = 540;

const validReq: ExplainRequest = {
  roomLabel: 'Study Room A-101',
  startTime: 660,
  endTime: 720,
  isAvailable: true,
  reasonCode: 'available',
  now: NOW,
};

const overlapReq: ExplainRequest = {
  roomLabel: 'Study Room A-101',
  startTime: 630,
  endTime: 690,
  isAvailable: false,
  reasonCode: 'overlap',
  now: NOW,
};

const blockedReq: ExplainRequest = {
  roomLabel: 'Media Lab D-012',
  startTime: 660,
  endTime: 720,
  isAvailable: false,
  reasonCode: 'blocked',
  now: NOW,
};

const invalidTimeReq: ExplainRequest = {
  roomLabel: 'Study Room A-101',
  startTime: NaN,
  endTime: 720,
  isAvailable: false,
  reasonCode: 'start-not-integer',
  now: NOW,
};

const pastTimeReq: ExplainRequest = {
  roomLabel: 'Study Room A-101',
  startTime: 540,
  endTime: 570,
  isAvailable: false,
  reasonCode: 'start-must-be-after-now',
  now: NOW,
};

const pastTimeBeforeNowReq: ExplainRequest = {
  roomLabel: 'Study Room A-101',
  startTime: 480,
  endTime: 570,
  isAvailable: false,
  reasonCode: 'start-must-be-after-now',
  now: NOW,
};

describe('validateRequest', () => {
  it('accepts a well-formed request', () => {
    expect(validateRequest(validReq)).toEqual([]);
  });

  it('rejects an empty roomLabel', () => {
    expect(validateRequest({ ...validReq, roomLabel: '' })).toContainEqual({
      field: 'roomLabel',
      message: 'roomLabel must not be empty.',
    });
  });

  it('rejects an excessively long roomLabel', () => {
    const long = 'A'.repeat(MAX_ROOM_LABEL_LEN + 1);
    const errors = validateRequest({ ...validReq, roomLabel: long });
    expect(errors.some((e) => e.field === 'roomLabel')).toBe(true);
  });

  it('rejects NaN startTime', () => {
    const errors = validateRequest(invalidTimeReq);
    expect(errors.some((e) => e.field === 'startTime')).toBe(true);
  });

  it('rejects an invalid reasonCode', () => {
    const errors = validateRequest({ ...validReq, reasonCode: 'bogus' as never });
    expect(errors.some((e) => e.field === 'reasonCode')).toBe(true);
  });

  it('rejects a non-integer now', () => {
    const errors = validateRequest({ ...validReq, now: NaN });
    expect(errors.some((e) => e.field === 'now')).toBe(true);
  });

  it('rejects a negative now', () => {
    const errors = validateRequest({ ...validReq, now: -1 });
    expect(errors.some((e) => e.field === 'now')).toBe(true);
  });
});

describe('validateResponse', () => {
  it('accepts a nonempty, short, one-sentence response', () => {
    expect(validateResponse({ explanation: 'This room is available.' })).toEqual([]);
  });

  it('accepts a two-sentence response', () => {
    expect(
      validateResponse({ explanation: 'This room is free. You may book it now.' })
    ).toEqual([]);
  });

  it('rejects an empty explanation', () => {
    expect(validateResponse({ explanation: '' })).toContainEqual({
      field: 'explanation',
      message: 'explanation must not be empty.',
    });
  });

  it('rejects an excessively long explanation', () => {
    const long = 'A'.repeat(MAX_EXPLANATION_LEN + 1);
    const errors = validateResponse({ explanation: long });
    expect(errors.some((e) => e.field === 'explanation')).toBe(true);
  });

  it('rejects a three-sentence explanation', () => {
    const errors = validateResponse({
      explanation: 'One. Two. Three.',
    });
    expect(errors.some((e) => e.field === 'explanation')).toBe(true);
  });
});

describe('mockExplain', () => {
  it('returns an explanation for an available slot', async () => {
    const result = await mockExplain(validReq);
    expect(result.ok).toBe(true);
    expect(result.response).not.toBeNull();
    expect(result.response!.explanation).toContain('free');
    expect(result.response!.explanation.length).toBeLessThanOrEqual(MAX_EXPLANATION_LEN);
  });

  it('returns an explanation for an overlap rejection', async () => {
    const result = await mockExplain(overlapReq);
    expect(result.ok).toBe(true);
    expect(result.response!.explanation).toContain('overlaps');
  });

  it('returns an explanation for a blocked room', async () => {
    const result = await mockExplain(blockedReq);
    expect(result.ok).toBe(true);
    expect(result.response!.explanation).toContain('blocked');
  });

  it('returns an explanation for invalid time (NaN start)', async () => {
    const result = await mockExplain(invalidTimeReq);
    expect(result.ok).toBe(true);
    expect(result.response!.explanation).toContain('whole number');
  });

  it('returns an explanation for a past-time rejection (start === now)', async () => {
    const result = await mockExplain(pastTimeReq);
    expect(result.ok).toBe(true);
    expect(result.response!.explanation).toContain('current');
    expect(result.response!.explanation).toContain('09:00');
  });

  it('F1 regression: past-time explanation references current time, not rejected start (start < now)', async () => {
    const result = await mockExplain(pastTimeBeforeNowReq);
    expect(result.ok).toBe(true);
    expect(result.response!.explanation).toContain('09:00');
    expect(result.response!.explanation).not.toContain('08:00');
  });

  it('F1 regression: past-time explanation references current time (start === now)', async () => {
    const result = await mockExplain(pastTimeReq);
    expect(result.ok).toBe(true);
    expect(result.response!.explanation).toContain('09:00');
    expect(result.response!.explanation).not.toContain('09:00 is at or before');
  });

  it('returns a fallback on simulated timeout (unavailable result)', async () => {
    const result = await mockExplain(overlapReq, 'timeout');
    expect(result.ok).toBe(false);
    expect(result.response!.explanation).toContain('not available');
    expect(result.response!.explanation).toContain('explanation service is unavailable');
    expect(result.error).toContain('timeout');
  });

  it('returns a fallback on simulated API error (unavailable result)', async () => {
    const result = await mockExplain(overlapReq, 'error');
    expect(result.ok).toBe(false);
    expect(result.response!.explanation).toContain('not available');
    expect(result.response!.explanation).toContain('explanation service is unavailable');
    expect(result.error).toContain('API error');
  });

  it('returns a fallback when adapter is unavailable (unavailable result)', async () => {
    const result = await mockExplain(overlapReq, 'unavailable');
    expect(result.ok).toBe(false);
    expect(result.response!.explanation).toContain('not available');
    expect(result.response!.explanation).toContain('explanation service is unavailable');
    expect(result.error).toContain('unavailable');
  });

  it('F2 regression: fallback for available result says available, not unavailable (timeout)', async () => {
    const result = await mockExplain(validReq, 'timeout');
    expect(result.ok).toBe(false);
    expect(result.response!.explanation).toContain('available');
    expect(result.response!.explanation).not.toContain('not available');
    expect(result.response!.explanation).toContain('explanation service is unavailable');
  });

  it('F2 regression: fallback for available result says available, not unavailable (error)', async () => {
    const result = await mockExplain(validReq, 'error');
    expect(result.ok).toBe(false);
    expect(result.response!.explanation).toContain('available');
    expect(result.response!.explanation).not.toContain('not available');
    expect(result.response!.explanation).toContain('explanation service is unavailable');
  });

  it('F2 regression: fallback for available result says available, not unavailable (unavailable mode)', async () => {
    const result = await mockExplain(validReq, 'unavailable');
    expect(result.ok).toBe(false);
    expect(result.response!.explanation).toContain('available');
    expect(result.response!.explanation).not.toContain('not available');
    expect(result.response!.explanation).toContain('explanation service is unavailable');
  });

  it('F2 regression: fallback for unavailable result says not available (timeout)', async () => {
    const result = await mockExplain(blockedReq, 'timeout');
    expect(result.ok).toBe(false);
    expect(result.response!.explanation).toContain('not available');
    expect(result.response!.explanation).toContain('explanation service is unavailable');
  });

  it('F2 regression: fallback for unavailable result says not available (error)', async () => {
    const result = await mockExplain(blockedReq, 'error');
    expect(result.ok).toBe(false);
    expect(result.response!.explanation).toContain('not available');
    expect(result.response!.explanation).toContain('explanation service is unavailable');
  });

  it('F2 regression: fallback for unavailable result says not available (unavailable mode)', async () => {
    const result = await mockExplain(blockedReq, 'unavailable');
    expect(result.ok).toBe(false);
    expect(result.response!.explanation).toContain('not available');
    expect(result.response!.explanation).toContain('explanation service is unavailable');
  });

  it('never references a booking that was not in the request', async () => {
    const result = await mockExplain(overlapReq);
    expect(result.response!.explanation).not.toContain('14:00');
    expect(result.response!.explanation).not.toContain('17:00');
  });

  it('all explanations pass output validation', async () => {
    const allReasons: ExplainRequest['reasonCode'][] = [
      'available',
      'blocked',
      'overlap',
      'start-not-integer',
      'end-not-integer',
      'out-of-range',
      'start-after-end',
      'start-equals-end',
      'start-must-be-after-now',
      'too-long',
      'unknown',
    ];
    for (const reasonCode of allReasons) {
      const result = await mockExplain({ ...validReq, reasonCode });
      expect(result.response).not.toBeNull();
      const errors = validateResponse(result.response!);
      expect(errors).toEqual([]);
    }
  });

  it('F3 regression: unknown reason with isAvailable=false does not produce an available explanation', async () => {
    const result = await mockExplain({ ...overlapReq, reasonCode: 'unknown' });
    expect(result.ok).toBe(true);
    expect(result.response!.explanation).toContain('not available');
    expect(result.response!.explanation).not.toContain('free from');
  });

  it('F3 regression: unknown reason with isAvailable=true says available but uncertain', async () => {
    const result = await mockExplain({ ...validReq, reasonCode: 'unknown' });
    expect(result.ok).toBe(true);
    expect(result.response!.explanation).toContain('available');
    expect(result.response!.explanation).toContain('could not be confirmed');
  });
});

import type { ExplainRequest, ExplainResponse, ReasonCode } from '@/lib/explainTypes';

export const MAX_ROOM_LABEL_LEN = 100;
export const MAX_EXPLANATION_LEN = 300;
export const MAX_SENTENCES = 2;

export interface ValidationError {
  readonly field: string;
  readonly message: string;
}

export function validateRequest(req: ExplainRequest): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!req.roomLabel || req.roomLabel.trim().length === 0) {
    errors.push({ field: 'roomLabel', message: 'roomLabel must not be empty.' });
  } else if (req.roomLabel.length > MAX_ROOM_LABEL_LEN) {
    errors.push({
      field: 'roomLabel',
      message: `roomLabel must be at most ${MAX_ROOM_LABEL_LEN} characters.`,
    });
  }

  if (!Number.isInteger(req.startTime) || req.startTime < 0) {
    errors.push({ field: 'startTime', message: 'startTime must be a non-negative integer.' });
  }
  if (!Number.isInteger(req.endTime) || req.endTime < 0) {
    errors.push({ field: 'endTime', message: 'endTime must be a non-negative integer.' });
  }

  if (!Number.isInteger(req.now) || req.now < 0) {
    errors.push({ field: 'now', message: 'now must be a non-negative integer.' });
  }

  if (typeof req.isAvailable !== 'boolean') {
    errors.push({ field: 'isAvailable', message: 'isAvailable must be a boolean.' });
  }

  const validReasons: ReasonCode[] = [
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
  if (!validReasons.includes(req.reasonCode)) {
    errors.push({ field: 'reasonCode', message: 'reasonCode is not a recognized value.' });
  }

  return errors;
}

export function validateResponse(res: ExplainResponse): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!res.explanation || res.explanation.trim().length === 0) {
    errors.push({ field: 'explanation', message: 'explanation must not be empty.' });
    return errors;
  }

  if (res.explanation.length > MAX_EXPLANATION_LEN) {
    errors.push({
      field: 'explanation',
      message: `explanation must be at most ${MAX_EXPLANATION_LEN} characters.`,
    });
  }

  const sentenceCount = res.explanation.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
  if (sentenceCount > MAX_SENTENCES) {
    errors.push({
      field: 'explanation',
      message: `explanation must be at most ${MAX_SENTENCES} sentences.`,
    });
  }

  return errors;
}

export function isSafeFallback(res: ExplainResponse): boolean {
  return validateResponse(res).length === 0;
}

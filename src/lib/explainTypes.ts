export type ReasonCode =
  | 'available'
  | 'blocked'
  | 'overlap'
  | 'start-not-integer'
  | 'end-not-integer'
  | 'out-of-range'
  | 'start-after-end'
  | 'start-equals-end'
  | 'start-must-be-after-now'
  | 'too-long'
  | 'unknown';

export interface ExplainRequest {
  readonly roomLabel: string;
  readonly startTime: number;
  readonly endTime: number;
  readonly isAvailable: boolean;
  readonly reasonCode: ReasonCode;
  readonly now: number;
}

export interface ExplainResponse {
  readonly explanation: string;
}

export type AdapterMode = 'ok' | 'timeout' | 'error' | 'unavailable';

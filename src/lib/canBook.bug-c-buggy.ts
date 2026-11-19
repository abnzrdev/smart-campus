export type Interval = readonly [number, number];
export type Booking = readonly Interval[];

export interface RoomState {
  readonly now: number;
  readonly blocked: boolean;
  readonly bookings: Booking;
}

export interface CheckOk {
  ok: true;
  reason: 'available';
}

export interface CheckErr {
  ok: false;
  reason:
    | 'blocked'
    | 'start-not-integer'
    | 'end-not-integer'
    | 'out-of-range'
    | 'start-after-end'
    | 'start-equals-end'
    | 'start-must-be-after-now'
    | 'too-long'
    | 'overlap';
  message: string;
  overlap?: Interval;
}

export type CheckResult = CheckOk | CheckErr;

export const MINUTES_PER_DAY = 1440;
export const MAX_DURATION = 120;

const isInteger = (n: number): boolean => Number.isInteger(n);

export function canBook(
  room: RoomState,
  start: number,
  end: number
): CheckResult {
  if (!isInteger(start)) {
    return {
      ok: false,
      reason: 'start-not-integer',
      message: 'Start time must be a whole number of minutes (integer).',
    };
  }
  if (!isInteger(end)) {
    return {
      ok: false,
      reason: 'end-not-integer',
      message: 'End time must be a whole number of minutes (integer).',
    };
  }

  // AC1: 0 <= start < end <= 1440
  if (start < 0 || end > MINUTES_PER_DAY) {
    return {
      ok: false,
      reason: 'out-of-range',
      message:
        'Times must be within the same day: 0 <= start < end <= 1440 minutes (00:00–24:00).',
    };
  }

  if (start === end) {
    return {
      ok: false,
      reason: 'start-equals-end',
      message: 'Start and end cannot be the same time. End must be later than start.',
    };
  }

  if (start > end) {
    return {
      ok: false,
      reason: 'start-after-end',
      message: 'Start time must be earlier than end time. The times look reversed.',
    };
  }

  // AC1 strict: start > now
  if (start < room.now) {
    return {
      ok: false,
      reason: 'start-must-be-after-now',
      message: `Start time (${fmt(start)}) is before the current time (${fmt(room.now)}). Pick a start time later than now.`,
    };
  }
  if (start === room.now) {
    return {
      ok: false,
      reason: 'start-must-be-after-now',
      message: `Start time must be strictly after the current time (${fmt(room.now)}). Starting exactly now is not allowed.`,
    };
  }

  // AC2: max duration 120, exactly 120 valid
  const duration = end - start;
  if (duration > MAX_DURATION) {
    return {
      ok: false,
      reason: 'too-long',
      message: `Booking length is ${duration} minutes. The maximum is ${MAX_DURATION} minutes (exactly ${MAX_DURATION} is allowed).`,
    };
  }

  // AC3: blocked room => always reject
  if (room.blocked) {
    return {
      ok: false,
      reason: 'blocked',
      message:
        'Study Room A-101 is currently marked as blocked. No availability checks pass while blocked.',
    };
  }

  // AC4: overlap using start < bookedEnd && bookedStart < end (touching OK)
  for (const [bs, be] of room.bookings) {
    if (start <= be && bs < end) {
      return {
        ok: false,
        reason: 'overlap',
        message: `This overlaps an existing booking from ${fmt(bs)} to ${fmt(be)}. Touching at an endpoint is fine, but this interval overlaps it.`,
        overlap: [bs, be] as Interval,
      };
    }
  }

  return { ok: true, reason: 'available' };
}

export function fmt(minutes: number): string {
  const m = ((minutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

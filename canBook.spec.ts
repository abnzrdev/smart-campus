import { describe, it, expect } from 'vitest';
import { canBook, fmt, MAX_DURATION, MINUTES_PER_DAY } from '@/lib/canBook';
import type { RoomState } from '@/lib/canBook';

const baseRoom: RoomState = {
  now: 540,
  blocked: false,
  bookings: [[600, 660]],
};

function room(overrides: Partial<RoomState> = {}): RoomState {
  return { ...baseRoom, ...overrides };
}

function expectErr(
  r: ReturnType<typeof canBook>,
  reason: string
): asserts r is Exclude<typeof r, { ok: true }> {
  expect(r.ok).toBe(false);
  if (r.ok) throw new Error('expected error');
  expect(r.reason).toBe(reason);
  expect(typeof r.message).toBe('string');
  expect(r.message.length).toBeGreaterThan(0);
}

describe('canBook', () => {
  describe('AC1 — integer minutes, range, ordering, start > now', () => {
    it('rejects non-integer start', () => {
      expectErr(canBook(room(), 540.5, 600), 'start-not-integer');
    });
    it('rejects non-integer end', () => {
      expectErr(canBook(room(), 600, 720.5), 'end-not-integer');
    });
    it('rejects NaN as non-integer', () => {
      expectErr(canBook(room(), NaN, 600), 'start-not-integer');
      expectErr(canBook(room(), 600, NaN), 'end-not-integer');
    });
    it('rejects negative start (out of range)', () => {
      expectErr(canBook(room(), -1, 600), 'out-of-range');
    });
    it('rejects end beyond 1440', () => {
      expectErr(canBook(room(), 600, 1441), 'out-of-range');
    });
    it('rejects start=0 as past when simulated now is 540', () => {
      // start=0 is in range but <= now(540) => past-time rejection (AC1 start>now)
      expectErr(canBook(room(), 0, 60), 'start-must-be-after-now');
    });
    it('accepts end = 1440 boundary with valid future start and <=120 duration', () => {
      // 1320..1440 = 120 min, future, no overlap
      const r = canBook(room(), 1320, 1440);
      expect(r.ok).toBe(true);
    });
    it('rejects start === end', () => {
      expectErr(canBook(room(), 700, 700), 'start-equals-end');
    });
    it('rejects reversed start > end', () => {
      expectErr(canBook(room(), 720, 660), 'start-after-end');
    });
    it('rejects start === now (strictly after now)', () => {
      expectErr(canBook(room(), 540, 600), 'start-must-be-after-now');
    });
    it('rejects start < now (in the past)', () => {
      expectErr(canBook(room(), 480, 540), 'start-must-be-after-now');
    });
    it('accepts start = now + 1 (strictly after)', () => {
      const r = canBook(room(), 541, 600);
      expect(r.ok).toBe(true);
    });
    it('accepts the required touching case 11:00–12:00 (660–720) => Available', () => {
      expect(canBook(room(), 660, 720).ok).toBe(true);
    });
  });

  describe('AC2 — max duration 120, exactly 120 valid', () => {
    it('accepts 119 minutes', () => {
      expect(canBook(room(), 660, 779).ok).toBe(true);
    });
    it('accepts exactly 120 minutes (12:00–14:00)', () => {
      expect(canBook(room(), 720, 840).ok).toBe(true);
    });
    it('rejects 121 minutes (12:00–14:01)', () => {
      expectErr(canBook(room(), 720, 841), 'too-long');
    });
    it('rejects a much-too-long interval', () => {
      expectErr(canBook(room(), 541, 1000), 'too-long');
    });
  });

  describe('AC3 — blocked room rejects everything', () => {
    it('rejects an otherwise-valid slot when blocked', () => {
      expectErr(canBook(room({ blocked: true }), 660, 720), 'blocked');
    });
    it('returns blocked (not overlap) even when times overlap a booking', () => {
      expectErr(canBook(room({ blocked: true }), 610, 650), 'blocked');
    });
    it('returns blocked for an otherwise-valid future slot', () => {
      // Time rules run before the blocked check, so a valid future slot reaches it.
      const r = canBook(room({ blocked: true }), 660, 720);
      expectErr(r, 'blocked');
    });
    it('blocked message is generic and does not name a specific room', () => {
      const r = canBook(room({ blocked: true }), 660, 720);
      if (r.ok) throw new Error('expected err');
      expect(r.message).not.toContain('A-101');
      expect(r.message).not.toContain('Study Room');
      expect(r.message).toContain('blocked');
    });
  });

  describe('AC4 — overlap; touching endpoints are NOT overlap', () => {
    it('rejects 10:30–11:30 (630–690) as overlap', () => {
      expectErr(canBook(room(), 630, 690), 'overlap');
    });
    it('reports the overlapping booking interval', () => {
      const r = canBook(room(), 630, 690);
      if (r.ok) throw new Error('expected err');
      expect(r.overlap).toEqual([600, 660]);
    });
    it('treats touching at start endpoint [599,600] as available', () => {
      expect(canBook(room(), 541, 600).ok).toBe(true);
    });
    it('treats touching at end endpoint [660,661] as available', () => {
      expect(canBook(room(), 660, 661).ok).toBe(true);
    });
    it('rejects an interval exactly equal to a booking', () => {
      expectErr(canBook(room(), 600, 660), 'overlap');
    });
    it('rejects an interval fully inside a booking', () => {
      expectErr(canBook(room(), 610, 650), 'overlap');
    });
    it('rejects an interval fully containing a booking', () => {
      expectErr(canBook(room(), 590, 670), 'overlap');
    });

    describe('multiple existing bookings', () => {
      const multi: RoomState = {
        now: 540,
        blocked: false,
        bookings: [[600, 660], [720, 780], [900, 960]],
      };
      it('a gap between first and second booking is available (660–720, touching both)', () => {
        expect(canBook(multi, 660, 720).ok).toBe(true);
      });
      it('a gap between second and third booking is available (780–900, touching both)', () => {
        expect(canBook(multi, 780, 900).ok).toBe(true);
      });
      it('detects overlap with the second booking (730–760)', () => {
        const r = canBook(multi, 730, 760);
        expectErr(r, 'overlap');
        if (r.ok) throw new Error('err');
        expect(r.overlap).toEqual([720, 780]);
      });
      it('detects overlap with the third booking (910–950)', () => {
        const r = canBook(multi, 910, 950);
        expectErr(r, 'overlap');
        if (r.ok) throw new Error('err');
        expect(r.overlap).toEqual([900, 960]);
      });
      it('a short slot before the first booking is available (541–600, touching)', () => {
        expect(canBook(multi, 541, 600).ok).toBe(true);
      });
    });
  });

  describe('AC5 — unambiguous result; no mutation of bookings', () => {
    it('returns ok=true for an available slot', () => {
      const r = canBook(room(), 660, 720);
      expect(r.ok).toBe(true);
      if (!r.ok) throw new Error('should be ok');
      expect(r.reason).toBe('available');
    });
    it('returns ok=false for an unavailable slot', () => {
      expect(canBook(room(), 630, 690).ok).toBe(false);
    });
    it('does not mutate the bookings array reference', () => {
      const bookings = [[600, 660]] as const;
      const r1: RoomState = { now: 540, blocked: false, bookings };
      const snapshot = [...bookings.map((b) => [...b] as const)];
      for (const [s, e] of [
        [660, 720],
        [630, 690],
        [600, 660],
        [541, 600],
      ] as const) {
        canBook(r1, s, e);
      }
      expect(r1.bookings).toBe(bookings);
      expect(r1.bookings.map((b) => [...b])).toEqual(snapshot.map((b) => [...b]));
    });
    it('does not mutate bookings across many calls including blocked + overlap', () => {
      const bookings = [[600, 660], [720, 780]] as const;
      const r1: RoomState = { now: 540, blocked: false, bookings };
      const before = JSON.stringify(bookings);
      for (let i = 0; i < 20; i++) {
        canBook(r1, 610, 650);
        canBook({ ...r1, blocked: true }, 660, 720);
        canBook(r1, 730, 760);
      }
      expect(JSON.stringify(bookings)).toBe(before);
    });
    it('does not mutate the room object passed in', () => {
      const r1: RoomState = { now: 540, blocked: false, bookings: [[600, 660]] };
      const before = JSON.stringify(r1);
      canBook(r1, 630, 690);
      canBook({ ...r1, blocked: true }, 660, 720);
      expect(JSON.stringify(r1)).toBe(before);
    });
  });

  describe('AC6 — understandable messages', () => {
    it('every error has a non-empty message', () => {
      const cases: Array<[number, number]> = [
        [540.5, 600],
        [600, 720.5],
        [-1, 600],
        [600, 1441],
        [700, 700],
        [720, 660],
        [540, 600],
        [480, 540],
        [720, 841],
        [630, 690],
      ];
      for (const [s, e] of cases) {
        const r = canBook(room(), s, e);
        if (r.ok) throw new Error(`expected err for ${s}-${e}`);
        expect(r.message.length).toBeGreaterThan(5);
      }
    });
    it('past-time message mentions the chosen start time', () => {
      const r = canBook(room(), 480, 540);
      if (r.ok) throw new Error('err');
      expect(r.message).toContain('08:00');
      expect(r.message).toContain('09:00');
    });
    it('starts-now message says "exactly now"', () => {
      const r = canBook(room(), 540, 600);
      if (r.ok) throw new Error('err');
      expect(r.message.toLowerCase()).toContain('exactly now');
    });
  });

  describe('fmt', () => {
    it('formats midnight', () => {
      expect(fmt(0)).toBe('00:00');
    });
    it('formats 09:00', () => {
      expect(fmt(540)).toBe('09:00');
    });
    it('formats 24:00 (1440) as 00:00 via wrap', () => {
      expect(fmt(1440)).toBe('00:00');
    });
    it('pads single-digit minutes', () => {
      expect(fmt(601)).toBe('10:01');
    });
  });

  describe('constants', () => {
    it('MAX_DURATION is 120', () => {
      expect(MAX_DURATION).toBe(120);
    });
    it('MINUTES_PER_DAY is 1440', () => {
      expect(MINUTES_PER_DAY).toBe(1440);
    });
  });
});

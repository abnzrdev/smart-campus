import { describe, it, expect } from 'vitest';
import { canBook } from '@/lib/canBook';
import type { RoomState } from '@/lib/canBook';
import { DEFAULT_ROOM, MAX_DURATION, MINUTES_PER_DAY } from '@/lib/roomRules';

function frozenRoom(overrides: Partial<RoomState> = {}): RoomState {
  const bookings = Object.freeze(
    (overrides.bookings ?? [[600, 660]]).map((b) => Object.freeze([...b]) as readonly [number, number])
  ) as RoomState['bookings'];
  return Object.freeze({
    now: overrides.now ?? DEFAULT_ROOM.now,
    blocked: overrides.blocked ?? DEFAULT_ROOM.blocked,
    bookings,
  });
}

describe('canBook boundaries and rules', () => {
  describe('AC1 — time range and ordering', () => {
    it('accepts the whole-day maximum end of 1440 when start is in the future', () => {
      expect(canBook(frozenRoom(), 1380, MINUTES_PER_DAY).ok).toBe(true);
    });
    it('rejects end one minute past the day', () => {
      expect(canBook(frozenRoom(), 1380, MINUTES_PER_DAY + 1).ok).toBe(false);
    });
    it('rejects start exactly one minute before now', () => {
      expect(canBook(frozenRoom(), 539, 600).ok).toBe(false);
    });
    it('reports start-after-end before the past-time rule for reversed input', () => {
      const r = canBook(frozenRoom(), 500, 400);
      if (r.ok) throw new Error('expected err');
      expect(r.reason).toBe('start-after-end');
    });
  });

  describe('AC2 — duration boundaries', () => {
    it('accepts exactly MAX_DURATION minutes', () => {
      expect(canBook(frozenRoom(), 700, 700 + MAX_DURATION).ok).toBe(true);
    });
    it('rejects MAX_DURATION + 1 minutes', () => {
      const r = canBook(frozenRoom(), 700, 700 + MAX_DURATION + 1);
      if (r.ok) throw new Error('expected err');
      expect(r.reason).toBe('too-long');
    });
    it('rejects a 121-minute slot that is otherwise free', () => {
      const r = canBook(frozenRoom(), 720, 841);
      if (r.ok) throw new Error('expected err');
      expect(r.reason).toBe('too-long');
    });
  });

  describe('AC3 — blocked', () => {
    it('rejects a blocked room even for a 1-minute slot far from bookings', () => {
      const r = canBook(frozenRoom({ blocked: true }), 900, 901);
      if (r.ok) throw new Error('expected err');
      expect(r.reason).toBe('blocked');
    });
    it('blocked message is generic and does not hardcode a room name', () => {
      const r = canBook(frozenRoom({ blocked: true }), 900, 901);
      if (r.ok) throw new Error('expected err');
      expect(r.message).toContain('blocked');
      expect(r.message).not.toContain('Study Room A-101');
    });
  });

  describe('AC4 — overlap and touching endpoints', () => {
    it('allows a slot ending exactly where a booking starts', () => {
      expect(canBook(frozenRoom(), 541, 600).ok).toBe(true);
    });
    it('allows a slot starting exactly where a booking ends', () => {
      expect(canBook(frozenRoom(), 660, 661).ok).toBe(true);
    });
    it('rejects a slot that overlaps by one minute at the start', () => {
      expect(canBook(frozenRoom(), 659, 700).ok).toBe(false);
    });
    it('rejects a slot that overlaps by one minute at the end', () => {
      expect(canBook(frozenRoom(), 550, 601).ok).toBe(false);
    });
    it('allows a 120-minute slot that touches a booking on both sides', () => {
      const room = frozenRoom({ bookings: [[540 + 1, 600], [720, 780]] });
      expect(canBook(room, 600, 720).ok).toBe(true);
    });
  });

  describe('AC5 — no mutation of inputs', () => {
    it('does not mutate frozen room and bookings and returns a result', () => {
      const room = frozenRoom({ bookings: [[600, 660], [720, 780]] });
      const before = JSON.stringify(room);
      expect(() => canBook(room, 660, 720)).not.toThrow();
      expect(() => canBook(room, 630, 690)).not.toThrow();
      expect(JSON.stringify(room)).toBe(before);
    });
  });

  describe('AC6 — messages', () => {
    it('every rejection carries a non-empty message', () => {
      const room = frozenRoom();
      const cases: Array<[number, number]> = [
        [659, 700],
        [0, 60],
        [1380, 1441],
        [720, 720 + MAX_DURATION + 1],
      ];
      for (const [s, e] of cases) {
        const r = canBook(room, s, e);
        if (r.ok) continue;
        expect(r.message.length).toBeGreaterThan(0);
      }
    });
  });
});

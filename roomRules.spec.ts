import { describe, it, expect } from 'vitest';
import { DEFAULT_ROOM, ROOMS } from '@/lib/roomRules';

describe('room catalog', () => {
  it('contains at least four rooms with unique IDs', () => {
    expect(ROOMS.length).toBeGreaterThanOrEqual(4);
    const ids = ROOMS.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every room a name, capacity, equipment list, and blocked status', () => {
    for (const room of ROOMS) {
      expect(room.name.length).toBeGreaterThan(0);
      expect(room.capacity).toBeGreaterThan(0);
      expect(room.equipment.length).toBeGreaterThan(0);
      expect(typeof room.blocked).toBe('boolean');
    }
  });

  it('preserves Study Room A-101 with its 10:00–11:00 booking and 09:00 simulated time', () => {
    const a101 = ROOMS.find((r) => r.name === 'Study Room A-101');
    expect(a101).toBeDefined();
    expect(a101?.bookings).toEqual([[600, 660]]);
    expect(a101?.now).toBe(540);
    expect(a101?.blocked).toBe(false);
    expect(DEFAULT_ROOM.bookings).toEqual([[600, 660]]);
  });

  it('does not share booking arrays between rooms', () => {
    const arrays = ROOMS.map((r) => r.bookings);
    expect(new Set(arrays).size).toBe(arrays.length);
  });
});

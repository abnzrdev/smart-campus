import { describe, it, expect } from 'vitest';
import { filterRooms, parseAttendees } from '@/lib/roomFilter';
import { ROOMS } from '@/lib/roomRules';

describe('filterRooms', () => {
  it('returns every room when there are no equipment requirements and one attendee', () => {
    expect(filterRooms(ROOMS, { attendees: 1, equipment: [] })).toHaveLength(ROOMS.length);
  });

  it('F1: keeps rooms whose capacity is greater than or equal to attendees', () => {
    const ids = filterRooms(ROOMS, { attendees: 10, equipment: [] }).map((r) => r.id);
    expect(ids).toEqual(['b-204', 'd-012', 'e-105']);
  });

  it('F1: includes a room whose capacity equals the requested attendees exactly', () => {
    const ids = filterRooms(ROOMS, { attendees: 6, equipment: [] }).map((r) => r.id);
    expect(ids).toContain('a-101');
  });

  it('F2: requires ALL selected equipment items, not just one', () => {
    const ids = filterRooms(ROOMS, {
      attendees: 1,
      equipment: ['projector', 'video-conference'],
    }).map((r) => r.id);
    expect(ids).toEqual(['b-204', 'e-105']);
  });

  it('F2: excludes a room that has only some of the selected equipment', () => {
    const ids = filterRooms(ROOMS, {
      attendees: 1,
      equipment: ['whiteboard', 'tv-screen'],
    }).map((r) => r.id);
    expect(ids).toEqual([]);
  });

  it('F4: returns an empty list when no room matches', () => {
    expect(filterRooms(ROOMS, { attendees: 50, equipment: [] })).toEqual([]);
  });

  it('does not hide blocked rooms; availability checks handle blocked status (F3)', () => {
    const ids = filterRooms(ROOMS, { attendees: 10, equipment: ['tv-screen'] }).map((r) => r.id);
    expect(ids).toEqual(['d-012', 'e-105']);
    expect(ROOMS.find((r) => r.id === 'd-012')?.blocked).toBe(true);
  });

  it('does not mutate the rooms array', () => {
    const before = JSON.stringify(ROOMS);
    filterRooms(ROOMS, { attendees: 3, equipment: ['projector'] });
    expect(JSON.stringify(ROOMS)).toBe(before);
  });
});

describe('parseAttendees', () => {
  it('accepts whole numbers of at least 1', () => {
    expect(parseAttendees('1')).toBe(1);
    expect(parseAttendees(' 12 ')).toBe(12);
  });

  it('rejects zero, negatives, fractions, empty, and non-numeric input', () => {
    expect(parseAttendees('0')).toBeNull();
    expect(parseAttendees('-3')).toBeNull();
    expect(parseAttendees('2.5')).toBeNull();
    expect(parseAttendees('')).toBeNull();
    expect(parseAttendees('abc')).toBeNull();
  });
});

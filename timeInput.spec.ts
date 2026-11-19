import { describe, it, expect } from 'vitest';
import {
  hhmmToMinutes,
  minutesToSelection,
  normalizeMinute,
  parseMinute,
  selectionToMinutes,
  DEFAULT_TIME_SELECTION,
} from '@/lib/timeInput';

describe('timeInput', () => {
  it('accepts whole minutes from 0 to 59 with or without a leading zero', () => {
    expect(parseMinute('0')).toBe(0);
    expect(parseMinute('07')).toBe(7);
    expect(parseMinute(' 59 ')).toBe(59);
  });

  it('rejects blank, out-of-range, fractional, and non-numeric minutes', () => {
    expect(parseMinute('')).toBeNaN();
    expect(parseMinute('60')).toBeNaN();
    expect(parseMinute('-1')).toBeNaN();
    expect(parseMinute('1.5')).toBeNaN();
    expect(parseMinute('abc')).toBeNaN();
  });

  it('pads a valid minute to two digits and leaves invalid text unchanged', () => {
    expect(normalizeMinute('5')).toBe('05');
    expect(normalizeMinute('30')).toBe('30');
    expect(normalizeMinute('')).toBe('');
    expect(normalizeMinute('99')).toBe('99');
  });

  it('converts hour and minute strings to minutes after midnight', () => {
    expect(hhmmToMinutes('09', '30')).toBe(570);
  });

  it('yields NaN for a blank minute so the rule check rejects it', () => {
    expect(hhmmToMinutes('09', '')).toBeNaN();
  });

  it('builds minutes for the default selection as 11:00–12:00', () => {
    expect(selectionToMinutes(DEFAULT_TIME_SELECTION)).toEqual({ startMin: 660, endMin: 720 });
  });

  it('round-trips an interval into a selection', () => {
    const selection = minutesToSelection(720, 841);
    expect(selection).toEqual({ startHH: '12', startMM: '00', endHH: '14', endMM: '01' });
    expect(selectionToMinutes(selection)).toEqual({ startMin: 720, endMin: 841 });
  });
});

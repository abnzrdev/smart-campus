import { MINUTES_PER_DAY } from '@/lib/roomRules';

export interface TimeSelection {
  readonly startHH: string;
  readonly startMM: string;
  readonly endHH: string;
  readonly endMM: string;
}

export const DEFAULT_TIME_SELECTION: TimeSelection = {
  startHH: '11',
  startMM: '00',
  endHH: '12',
  endMM: '00',
};

export const HOURS = Array.from({ length: 25 }, (_, i) =>
  String(i).padStart(2, '0')
);

export function parseMinute(raw: string): number {
  const trimmed = raw.trim();
  if (!/^\d{1,2}$/.test(trimmed)) return NaN;
  const n = Number(trimmed);
  return n <= 59 ? n : NaN;
}

export function normalizeMinute(raw: string): string {
  const n = parseMinute(raw);
  return Number.isNaN(n) ? raw : String(n).padStart(2, '0');
}

export function hhmmToMinutes(hh: string, mm: string): number {
  return Number(hh) * 60 + parseMinute(mm);
}

function minutesToHHMM(minutes: number): { hh: string; mm: string } {
  const m = Math.max(0, Math.min(MINUTES_PER_DAY, minutes));
  return {
    hh: String(Math.floor(m / 60)).padStart(2, '0'),
    mm: String(m % 60).padStart(2, '0'),
  };
}

export function selectionToMinutes(selection: TimeSelection): {
  startMin: number;
  endMin: number;
} {
  return {
    startMin: hhmmToMinutes(selection.startHH, selection.startMM),
    endMin: hhmmToMinutes(selection.endHH, selection.endMM),
  };
}

export function minutesToSelection(start: number, end: number): TimeSelection {
  const s = minutesToHHMM(start);
  const e = minutesToHHMM(end);
  return { startHH: s.hh, startMM: s.mm, endHH: e.hh, endMM: e.mm };
}

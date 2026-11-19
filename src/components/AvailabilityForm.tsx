import {
  HOURS,
  minutesToSelection,
  normalizeMinute,
  parseMinute,
  selectionToMinutes,
} from '@/lib/timeInput';
import type { TimeSelection } from '@/lib/timeInput';
import { fmt } from '@/lib/canBook';
import { MAX_DURATION, SIMULATED_NOW } from '@/lib/roomRules';

interface AvailabilityFormProps {
  time: TimeSelection;
  onTimeChange: (patch: Partial<TimeSelection>) => void;
  onCheck: () => void;
}

const QUICK_SCENARIOS = [
  { label: '11:00–12:00', s: 660, e: 720 },
  { label: '10:30–11:30', s: 630, e: 690 },
  { label: '12:00–14:00 (120)', s: 720, e: 840 },
  { label: '12:00–14:01 (121)', s: 720, e: 841 },
  { label: '09:00–09:30', s: 540, e: 570 },
];

const selectClass =
  'w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

export default function AvailabilityForm({
  time,
  onTimeChange,
  onCheck,
}: AvailabilityFormProps) {
  const { startMin, endMin } = selectionToMinutes(time);
  const minutesValid =
    !Number.isNaN(parseMinute(time.startMM)) &&
    !Number.isNaN(parseMinute(time.endMM));

  return (
    <section
      aria-labelledby="check-heading"
      className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h2 id="check-heading" className="text-lg font-semibold">
        Check availability
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Pick a start and end time, then check. Start must be after{' '}
        {fmt(SIMULATED_NOW)}; max length {MAX_DURATION} minutes.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <TimeField
          idPrefix="start"
          legend="Start time"
          label="Start"
          hour={time.startHH}
          minute={time.startMM}
          onHourChange={(hh) => onTimeChange({ startHH: hh })}
          onMinuteChange={(mm) => onTimeChange({ startMM: mm })}
        />
        <TimeField
          idPrefix="end"
          legend="End time"
          label="End"
          hour={time.endHH}
          minute={time.endMM}
          onHourChange={(hh) => onTimeChange({ endHH: hh })}
          onMinuteChange={(mm) => onTimeChange({ endMM: mm })}
        />
      </div>

      {!minutesValid ? (
        <p className="mt-2 text-xs font-medium text-red-600">
          Minutes must be whole numbers from 00 to 59.
        </p>
      ) : endMin > startMin ? (
        <p className="mt-2 text-xs text-slate-500">
          Requested interval: {fmt(startMin)} – {fmt(endMin)} ({endMin - startMin} min)
        </p>
      ) : (
        <p className="mt-2 text-xs font-medium text-red-600">
          Requested interval: {fmt(startMin)} – {fmt(endMin)} — invalid (end must be later than start)
        </p>
      )}

      <button
        type="button"
        onClick={onCheck}
        className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      >
        Check availability
      </button>

      <div className="mt-4">
        <p className="text-xs font-medium text-slate-500">Quick test scenarios</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {QUICK_SCENARIOS.map((q) => (
            <button
              key={q.label}
              type="button"
              onClick={() => onTimeChange(minutesToSelection(q.s, q.e))}
              className="rounded-full border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

interface TimeFieldProps {
  idPrefix: string;
  legend: string;
  label: string;
  hour: string;
  minute: string;
  onHourChange: (hh: string) => void;
  onMinuteChange: (mm: string) => void;
}

function TimeField({
  idPrefix,
  legend,
  label,
  hour,
  minute,
  onHourChange,
  onMinuteChange,
}: TimeFieldProps) {
  return (
    <fieldset className="rounded-xl border border-slate-200 p-3">
      <legend className="px-1 text-sm font-semibold text-slate-700">{legend}</legend>
      <div className="mt-1 flex items-center gap-1">
        <label className="sr-only" htmlFor={`${idPrefix}-hh`}>
          {label} hour
        </label>
        <select
          id={`${idPrefix}-hh`}
          value={hour}
          onChange={(e) => onHourChange(e.target.value)}
          className={selectClass}
        >
          {HOURS.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
        <span className="text-slate-400" aria-hidden>:</span>
        <label className="sr-only" htmlFor={`${idPrefix}-mm`}>
          {label} minute
        </label>
        <input
          id={`${idPrefix}-mm`}
          type="number"
          inputMode="numeric"
          min={0}
          max={59}
          value={minute}
          aria-invalid={Number.isNaN(parseMinute(minute))}
          onChange={(e) => onMinuteChange(e.target.value)}
          onBlur={() => {
            const normalized = normalizeMinute(minute);
            if (normalized !== minute) onMinuteChange(normalized);
          }}
          className={selectClass}
        />
      </div>
    </fieldset>
  );
}

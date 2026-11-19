import { Info } from 'lucide-react';
import { MAX_DURATION, MINUTES_PER_DAY } from '@/lib/roomRules';

export default function AvailabilityNotes() {
  return (
    <section
      aria-label="How availability is judged"
      className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm"
    >
      <div className="flex items-center gap-1.5 font-semibold text-slate-700">
        <Info className="h-4 w-4" aria-hidden />
        How availability is judged
      </div>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>Rooms are listed only if they seat the attendees and contain every selected equipment item.</li>
        <li>Times are whole minutes after midnight; 0 ≤ start &lt; end ≤ {MINUTES_PER_DAY}.</li>
        <li>Start must be strictly after the simulated current time.</li>
        <li>Maximum length is {MAX_DURATION} minutes; exactly {MAX_DURATION} is allowed.</li>
        <li>If the room is blocked, every request is rejected.</li>
        <li>
          Overlap uses start &lt; bookedEnd &amp;&amp; bookedStart &lt; end —
          touching endpoints do not count as overlap.
        </li>
        <li>No bookings are ever created or changed by this tool.</li>
      </ul>
    </section>
  );
}

import { Clock, DoorClosed } from 'lucide-react';
import { fmt } from '@/lib/canBook';
import { EQUIPMENT_LABELS } from '@/lib/roomRules';
import type { Room } from '@/lib/roomRules';

interface RoomCardProps {
  room: Room;
  onToggleBlocked: () => void;
}

export default function RoomCard({ room, onToggleBlocked }: RoomCardProps) {
  const bookedList = [...room.bookings].sort((a, b) => a[0] - b[0]);

  return (
    <section
      aria-labelledby="room-heading"
      className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="room-heading" className="text-lg font-semibold leading-tight">
            {room.name}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Seats {room.capacity} ·{' '}
            {room.equipment.map((id) => EQUIPMENT_LABELS[id]).join(', ')}
          </p>
          <span
            className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
              room.blocked
                ? 'bg-red-100 text-red-700'
                : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            <DoorClosed className="h-3.5 w-3.5" aria-hidden />
            {room.blocked ? 'Blocked' : 'Open'}
          </span>
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <span className="font-medium text-slate-700">Test mode</span>
          <button
            type="button"
            role="switch"
            aria-checked={room.blocked}
            onClick={onToggleBlocked}
            className={`relative h-6 w-11 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
              room.blocked ? 'bg-red-500' : 'bg-slate-300'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                room.blocked ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
            <span className="sr-only">Toggle room blocked status</span>
          </button>
          <span className="text-slate-500">{room.blocked ? 'On' : 'Off'}</span>
        </label>
      </div>

      <div className="mt-5">
        <h3 className="text-sm font-semibold text-slate-700">
          Existing bookings
        </h3>
        {bookedList.length === 0 ? (
          <p className="mt-1 text-sm text-slate-500">
            No existing bookings for this room.
          </p>
        ) : (
          <ul className="mt-2 space-y-1.5">
            {bookedList.map(([bs, be], i) => (
              <li
                key={`${bs}-${be}-${i}`}
                className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm"
              >
                <Clock className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                <span className="font-medium">
                  {fmt(bs)} – {fmt(be)}
                </span>
                <span className="text-slate-400">({be - bs} min)</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

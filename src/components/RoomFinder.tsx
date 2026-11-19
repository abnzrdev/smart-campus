import { EQUIPMENT_IDS, EQUIPMENT_LABELS } from '@/lib/roomRules';
import type { EquipmentId, Room } from '@/lib/roomRules';

interface RoomFinderProps {
  attendeesInput: string;
  attendeesValid: boolean;
  onAttendeesChange: (value: string) => void;
  requiredEquipment: readonly EquipmentId[];
  onToggleEquipment: (id: EquipmentId) => void;
  matchingRooms: readonly Room[];
  selectedRoomId: string | null;
  onSelectRoom: (id: string) => void;
}

const inputClass =
  'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

export default function RoomFinder({
  attendeesInput,
  attendeesValid,
  onAttendeesChange,
  requiredEquipment,
  onToggleEquipment,
  matchingRooms,
  selectedRoomId,
  onSelectRoom,
}: RoomFinderProps) {
  return (
    <section
      aria-labelledby="finder-heading"
      className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h2 id="finder-heading" className="text-lg font-semibold">
        Find a room
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Enter how many people need the room and any equipment you must have.
      </p>

      <div className="mt-4">
        <label htmlFor="attendees" className="text-sm font-semibold text-slate-700">
          Attendees
        </label>
        <input
          id="attendees"
          type="number"
          inputMode="numeric"
          min={1}
          value={attendeesInput}
          onChange={(e) => onAttendeesChange(e.target.value)}
          aria-invalid={!attendeesValid}
          aria-describedby={attendeesValid ? undefined : 'attendees-error'}
          className={inputClass}
        />
        {!attendeesValid && (
          <p id="attendees-error" className="mt-1 text-xs font-medium text-red-600">
            Enter a whole number of at least 1.
          </p>
        )}
      </div>

      <fieldset className="mt-4">
        <legend className="text-sm font-semibold text-slate-700">
          Required equipment
        </legend>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {EQUIPMENT_IDS.map((id) => (
            <label
              key={id}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50"
            >
              <input
                type="checkbox"
                checked={requiredEquipment.includes(id)}
                onChange={() => onToggleEquipment(id)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              {EQUIPMENT_LABELS[id]}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-4">
        {matchingRooms.length > 0 ? (
          <>
            <label htmlFor="room-select" className="text-sm font-semibold text-slate-700">
              Room
            </label>
            <select
              id="room-select"
              value={selectedRoomId ?? ''}
              onChange={(e) => onSelectRoom(e.target.value)}
              className={inputClass}
            >
              {matchingRooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name} · {room.capacity} seats
                  {room.blocked ? ' (blocked)' : ''}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500">
              {matchingRooms.length === 1
                ? '1 room matches your requirements.'
                : `${matchingRooms.length} rooms match your requirements.`}
            </p>
          </>
        ) : (
          attendeesValid && (
            <div
              role="status"
              className="rounded-xl border border-amber-200 bg-amber-50 p-4"
            >
              <p className="text-sm font-semibold text-amber-800">
                No rooms match these requirements.
              </p>
              <p className="mt-1 text-sm text-amber-700">
                Try a smaller number of attendees or remove an equipment item.
              </p>
            </div>
          )
        )}
      </div>
    </section>
  );
}

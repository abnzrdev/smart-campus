import { useState } from 'react';
import { filterRooms, parseAttendees } from '@/lib/roomFilter';
import { ROOMS } from '@/lib/roomRules';
import type { EquipmentId, Room } from '@/lib/roomRules';

export function useRoomFinder(onChange: () => void) {
  const [rooms, setRooms] = useState<readonly Room[]>(ROOMS);
  const [attendeesInput, setAttendeesInput] = useState('1');
  const [requiredEquipment, setRequiredEquipment] = useState<
    readonly EquipmentId[]
  >([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const attendees = parseAttendees(attendeesInput);
  const matchingRooms =
    attendees === null
      ? []
      : filterRooms(rooms, { attendees, equipment: requiredEquipment });
  const selectedRoom =
    matchingRooms.find((r) => r.id === selectedRoomId) ??
    matchingRooms[0] ??
    null;

  return {
    attendeesInput,
    attendeesValid: attendees !== null,
    requiredEquipment,
    matchingRooms,
    selectedRoom,
    setAttendees(value: string) {
      setAttendeesInput(value);
      onChange();
    },
    toggleEquipment(id: EquipmentId) {
      setRequiredEquipment((current) =>
        current.includes(id)
          ? current.filter((item) => item !== id)
          : [...current, id]
      );
      onChange();
    },
    selectRoom(id: string) {
      setSelectedRoomId(id);
      onChange();
    },
    toggleSelectedBlocked() {
      if (!selectedRoom) return;
      const roomId = selectedRoom.id;
      setRooms((current) =>
        current.map((r) =>
          r.id === roomId ? { ...r, blocked: !r.blocked } : r
        )
      );
      onChange();
    },
  };
}

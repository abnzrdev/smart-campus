import type { EquipmentId, Room } from '@/lib/roomRules';

export interface RoomRequirements {
  readonly attendees: number;
  readonly equipment: readonly EquipmentId[];
}

export function parseAttendees(input: string): number | null {
  const n = Number(input.trim());
  return Number.isInteger(n) && n >= 1 ? n : null;
}

export function filterRooms(
  rooms: readonly Room[],
  requirements: RoomRequirements
): Room[] {
  return rooms.filter(
    (room) =>
      room.capacity >= requirements.attendees &&
      requirements.equipment.every((item) => room.equipment.includes(item))
  );
}

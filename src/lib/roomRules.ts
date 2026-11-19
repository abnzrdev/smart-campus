import type { RoomState } from '@/lib/canBook';

export const ROOM_NAME = 'Study Room A-101';
export const MINUTES_PER_DAY = 1440;
export const MAX_DURATION = 120;
export const SIMULATED_NOW = 540;

export const EQUIPMENT_LABELS = {
  projector: 'Projector',
  whiteboard: 'Whiteboard',
  'video-conference': 'Video conferencing',
  'tv-screen': 'TV screen',
} as const;

export type EquipmentId = keyof typeof EQUIPMENT_LABELS;

export const EQUIPMENT_IDS = Object.keys(EQUIPMENT_LABELS) as EquipmentId[];

export interface Room extends RoomState {
  readonly id: string;
  readonly name: string;
  readonly capacity: number;
  readonly equipment: readonly EquipmentId[];
}

export const DEFAULT_ROOM: RoomState = {
  now: SIMULATED_NOW,
  blocked: false,
  bookings: [[600, 660]],
};

export const ROOMS: readonly Room[] = [
  {
    ...DEFAULT_ROOM,
    id: 'a-101',
    name: ROOM_NAME,
    capacity: 6,
    equipment: ['whiteboard', 'projector'],
  },
  {
    id: 'b-204',
    name: 'Seminar Room B-204',
    capacity: 20,
    equipment: ['projector', 'video-conference', 'whiteboard'],
    now: SIMULATED_NOW,
    blocked: false,
    bookings: [
      [660, 780],
      [840, 900],
    ],
  },
  {
    id: 'c-310',
    name: 'Focus Pod C-310',
    capacity: 2,
    equipment: ['whiteboard'],
    now: SIMULATED_NOW,
    blocked: false,
    bookings: [],
  },
  {
    id: 'd-012',
    name: 'Media Lab D-012',
    capacity: 10,
    equipment: ['tv-screen', 'video-conference'],
    now: SIMULATED_NOW,
    blocked: true,
    bookings: [[720, 780]],
  },
  {
    id: 'e-105',
    name: 'Boardroom E-105',
    capacity: 12,
    equipment: ['projector', 'video-conference', 'tv-screen'],
    now: SIMULATED_NOW,
    blocked: false,
    bookings: [[1020, 1080]],
  },
];

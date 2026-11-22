import { useEffect, useRef, useState } from 'react';
import { Clock } from 'lucide-react';
import { canBook, fmt } from '@/lib/canBook';
import type { CheckResult } from '@/lib/canBook';
import { useRoomFinder } from '@/hooks/useRoomFinder';
import { SIMULATED_NOW } from '@/lib/roomRules';
import {
  DEFAULT_TIME_SELECTION,
  selectionToMinutes,
} from '@/lib/timeInput';
import type { TimeSelection } from '@/lib/timeInput';
import { mockExplain } from '@/lib/mockLLM';
import type { ExplainRequest, ReasonCode } from '@/lib/explainTypes';
import { validateRequest } from '@/lib/explainValidation';
import AvailabilityForm from '@/components/AvailabilityForm';
import AvailabilityNotes from '@/components/AvailabilityNotes';
import ResultCard from '@/components/ResultCard';
import RoomCard from '@/components/RoomCard';
import RoomFinder from '@/components/RoomFinder';

function reasonToCode(reason: string): ReasonCode {
  const codes: ReasonCode[] = [
    'available',
    'blocked',
    'overlap',
    'start-not-integer',
    'end-not-integer',
    'out-of-range',
    'start-after-end',
    'start-equals-end',
    'start-must-be-after-now',
    'too-long',
  ];
  return codes.includes(reason as ReasonCode) ? (reason as ReasonCode) : 'unknown';
}

export default function App() {
  const [time, setTime] = useState<TimeSelection>(DEFAULT_TIME_SELECTION);
  const [checked, setChecked] = useState<{
    roomId: string;
    result: CheckResult;
  } | null>(null);
  const [explaining, setExplaining] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [explanationError, setExplanationError] = useState<string | null>(null);
  const explanationVersion = useRef(0);

  useEffect(() => () => {
    explanationVersion.current += 1;
  }, []);

  function clearExplanation() {
    // Invalidate pending responses as well as the text already on screen.
    explanationVersion.current += 1;
    setExplaining(false);
    setExplanation(null);
    setExplanationError(null);
  }

  const finder = useRoomFinder(() => {
    setChecked(null);
    clearExplanation();
  });
  const { selectedRoom } = finder;
  const shownResult =
    selectedRoom && checked?.roomId === selectedRoom.id ? checked.result : null;

  function updateTime(patch: Partial<TimeSelection>) {
    setTime((current) => ({ ...current, ...patch }));
    setChecked(null);
    clearExplanation();
  }

  function handleCheck() {
    if (!selectedRoom) return;
    const { startMin, endMin } = selectionToMinutes(time);
    setChecked({
      roomId: selectedRoom.id,
      result: canBook(selectedRoom, startMin, endMin),
    });
    clearExplanation();
  }

  async function handleExplain() {
    if (!selectedRoom || !shownResult) return;
    const { startMin, endMin } = selectionToMinutes(time);
    const req: ExplainRequest = {
      roomLabel: selectedRoom.name,
      startTime: startMin,
      endTime: endMin,
      isAvailable: shownResult.ok,
      reasonCode: reasonToCode(shownResult.reason),
      now: SIMULATED_NOW,
    };

    const errors = validateRequest(req);
    if (errors.length > 0) {
      setExplanation(null);
      setExplanationError('Invalid request: ' + errors[0].message);
      return;
    }

    const version = ++explanationVersion.current;
    setExplaining(true);
    setExplanation(null);
    setExplanationError(null);

    try {
      const result = await mockExplain(req);
      if (version !== explanationVersion.current) return;
      if (result.response) {
        setExplanation(result.response.explanation);
      }
      if (result.error) {
        setExplanationError(result.error);
      }
    } catch {
      if (version !== explanationVersion.current) return;
      setExplanation(null);
      setExplanationError('Unexpected error while generating explanation.');
    } finally {
      if (version === explanationVersion.current) setExplaining(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto w-full max-w-xl px-4 py-6 sm:py-10">
        <header className="mb-6">
          <div className="flex items-center gap-2 text-slate-500">
            <Clock className="h-4 w-4" aria-hidden />
            <span className="text-sm font-medium">
              Simulated current time: {fmt(SIMULATED_NOW)}
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            Smart Campus Room Availability Checker
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Check whether a room is free for a chosen time. This tool does not
            make bookings — it only reports availability.
          </p>
        </header>

        <RoomFinder
          attendeesInput={finder.attendeesInput}
          attendeesValid={finder.attendeesValid}
          onAttendeesChange={finder.setAttendees}
          requiredEquipment={finder.requiredEquipment}
          onToggleEquipment={finder.toggleEquipment}
          matchingRooms={finder.matchingRooms}
          selectedRoomId={selectedRoom?.id ?? null}
          onSelectRoom={finder.selectRoom}
        />

        {selectedRoom && (
          <>
            <RoomCard
              room={selectedRoom}
              onToggleBlocked={finder.toggleSelectedBlocked}
            />
            <AvailabilityForm
              time={time}
              onTimeChange={updateTime}
              onCheck={handleCheck}
            />
            {shownResult && (
              <ResultCard
                result={shownResult}
                roomName={selectedRoom.name}
                canExplain={!explaining}
                explaining={explaining}
                explanation={explanation}
                explanationError={explanationError}
                onExplain={handleExplain}
              />
            )}
          </>
        )}

        <AvailabilityNotes />

        <footer className="mt-6 text-center text-xs text-slate-400">
          Fictional prototype data · Assignment 04 · No real bookings
        </footer>
      </div>
    </div>
  );
}

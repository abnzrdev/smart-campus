import { CheckCircle2, ShieldAlert, XCircle, Lightbulb } from 'lucide-react';
import type { CheckResult } from '@/lib/canBook';
import ExplanationPanel from '@/components/ExplanationPanel';

interface ResultCardProps {
  result: CheckResult;
  roomName: string;
  canExplain: boolean;
  explaining: boolean;
  explanation: string | null;
  explanationError: string | null;
  onExplain: () => void;
}

export default function ResultCard({
  result,
  roomName,
  canExplain,
  explaining,
  explanation,
  explanationError,
  onExplain,
}: ResultCardProps) {
  const isBlocked = !result.ok && result.reason === 'blocked';

  return (
    <section
      role="status"
      aria-live="polite"
      className={`mt-4 rounded-2xl border p-5 shadow-sm ${
        result.ok
          ? 'border-emerald-200 bg-emerald-50'
          : isBlocked
            ? 'border-amber-200 bg-amber-50'
            : 'border-red-200 bg-red-50'
      }`}
    >
      <div className="flex items-start gap-3">
        {result.ok ? (
          <CheckCircle2 className="mt-0.5 h-6 w-6 flex-shrink-0 text-emerald-600" aria-hidden />
        ) : isBlocked ? (
          <ShieldAlert className="mt-0.5 h-6 w-6 flex-shrink-0 text-amber-600" aria-hidden />
        ) : (
          <XCircle className="mt-0.5 h-6 w-6 flex-shrink-0 text-red-600" aria-hidden />
        )}
        <div className="flex-1">
          <p
            className={`text-lg font-bold ${
              result.ok
                ? 'text-emerald-800'
                : isBlocked
                  ? 'text-amber-800'
                  : 'text-red-800'
            }`}
          >
            {result.ok ? 'Available' : 'Unavailable'}
          </p>
          <p
            className={`mt-1 text-sm ${
              result.ok
                ? 'text-emerald-700'
                : isBlocked
                  ? 'text-amber-700'
                  : 'text-red-700'
            }`}
          >
            {isBlocked
              ? `${roomName} is currently marked as blocked. No availability checks pass while blocked.`
              : result.ok
                ? 'This time slot is free and passes all rules. You may proceed to book it through your usual booking system — this checker does not create bookings.'
                : result.message}
          </p>

          {canExplain && !explaining && !explanation && (
            <button
              type="button"
              onClick={onExplain}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Lightbulb className="h-4 w-4 text-amber-500" aria-hidden />
              Explain availability
            </button>
          )}
        </div>
      </div>

      {(explaining || explanation || explanationError) && (
        <div className="mt-1 border-t border-slate-200 pt-3">
          <ExplanationPanel
            loading={explaining}
            explanation={explanation}
            error={explanationError}
          />
        </div>
      )}
    </section>
  );
}

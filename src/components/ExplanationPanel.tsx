import { Sparkles, Loader2, AlertCircle } from 'lucide-react';

interface ExplanationPanelProps {
  loading: boolean;
  explanation: string | null;
  error: string | null;
}

export default function ExplanationPanel({
  loading,
  explanation,
  error,
}: ExplanationPanelProps) {
  if (loading) {
    return (
      <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <Loader2 className="h-4 w-4 animate-spin text-slate-400" aria-hidden />
        <span className="text-sm text-slate-500">Generating mock explanation…</span>
      </div>
    );
  }

  if (error && !explanation) {
    return (
      <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
        <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" aria-hidden />
        <span className="text-sm text-red-600">{error}</span>
      </div>
    );
  }

  if (!explanation) return null;

  return (
    <div
      className="mt-3 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3"
      role="status"
      aria-label="Mock AI explanation"
    >
      <div className="flex items-start gap-2">
        <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-violet-500" aria-hidden />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">
            Mock AI explanation
          </p>
          <p className="mt-1 text-sm text-violet-900">{explanation}</p>
          {error && (
            <p className="mt-1 text-xs text-violet-500">
              Fallback used: {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

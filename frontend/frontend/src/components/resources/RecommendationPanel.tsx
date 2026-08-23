import { useState } from "react";
import type { RecommendationResult } from "../../types/dashboard";
import Button from "../common/Button";

interface RecommendationPanelProps {
  result: RecommendationResult | null;
  loading: boolean;
  onRequestRecommendation: () => void;
  onAllocate: (resourceId: number) => void;
  allocating: boolean;
  disabled: boolean;
}

export default function RecommendationPanel({
  result,
  loading,
  onRequestRecommendation,
  onAllocate,
  allocating,
  disabled,
}: RecommendationPanelProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      <Button onClick={onRequestRecommendation} isLoading={loading} disabled={disabled}>
        🎯 Recommend Resource
      </Button>

      {result && !result.recommendation && (
        <p className="rounded-md border border-orange-200 bg-orange-50 px-3 py-2 text-sm text-orange-800">
          {result.reason || "No suitable available team was found for this incident."}
        </p>
      )}

      {result && result.recommendation && (
        <div className="space-y-3">
          <div className="rounded-md border border-brand-accent/30 bg-sky-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
              Top Recommendation
            </p>
            <p className="mt-1 text-lg font-bold text-slate-900">
              {result.recommendation.resource_name}
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-slate-700">
              <span>Distance: {result.recommendation.distance_km} km</span>
              <span>Score: {result.recommendation.score} / 100</span>
            </div>
            {result.recommendation.reason && (
              <p className="mt-2 text-sm text-slate-600">{result.recommendation.reason}</p>
            )}
            <Button
              variant="danger"
              className="mt-3"
              onClick={() => setSelectedId(result.recommendation!.resource_id)}
            >
              Select for Allocation
            </Button>
          </div>

          {result.candidates.length > 1 && (
            <details className="text-sm">
              <summary className="cursor-pointer text-slate-600">
                View all {result.candidates.length} ranked candidates
              </summary>
              <ul className="mt-2 space-y-1">
                {result.candidates.map((c) => (
                  <li
                    key={c.resource_id}
                    className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-1.5 text-xs"
                  >
                    <span>
                      {c.resource_name} — {c.distance_km} km — score {c.score}
                    </span>
                    <button
                      type="button"
                      className="text-brand-accent hover:underline"
                      onClick={() => setSelectedId(c.resource_id)}
                    >
                      Select
                    </button>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}

      {selectedId !== null && (
        <ConfirmAllocation
          onCancel={() => setSelectedId(null)}
          onConfirm={() => {
            onAllocate(selectedId);
            setSelectedId(null);
          }}
          isLoading={allocating}
        />
      )}
    </div>
  );
}

function ConfirmAllocation({
  onCancel,
  onConfirm,
  isLoading,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl">
        <h3 className="text-base font-semibold text-slate-900">Confirm Allocation</h3>
        <p className="mt-2 text-sm text-slate-600">
          This will dispatch the selected team to this incident and mark it as ASSIGNED. This
          action represents a real decision by an authority — it cannot be undone automatically.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} isLoading={isLoading}>
            Allocate Team
          </Button>
        </div>
      </div>
    </div>
  );
}

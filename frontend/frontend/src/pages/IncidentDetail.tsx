import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getIncident, recommendResource, allocateResource } from "../services/incidents";
import type { Incident } from "../types/incident";
import type { RecommendationResult } from "../types/dashboard";
import SeverityBadge from "../components/common/SeverityBadge";
import StatusBadge from "../components/common/StatusBadge";
import LoadingState from "../components/common/LoadingState";
import ErrorState from "../components/common/ErrorState";
import RecommendationPanel from "../components/resources/RecommendationPanel";
import { INCIDENT_STATUS_CLASSES, formatDateTime, formatLabel } from "../utils/status";
import { ApiError } from "../types/api";
import { useSocketEvent } from "../hooks/useSocket";

const NON_ALLOCATABLE_STATUSES = ["ASSIGNED", "IN_PROGRESS", "RESOLVED", "REJECTED"];

export default function IncidentDetail() {
  const { id } = useParams<{ id: string }>();
  const incidentId = Number(id);

  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [recommendation, setRecommendation] = useState<RecommendationResult | null>(null);
  const [recommending, setRecommending] = useState(false);
  const [allocating, setAllocating] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getIncident(incidentId);
      setIncident(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load incident.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incidentId]);

  useSocketEvent("incident_updated", (updated) => {
    if (updated.id === incidentId) setIncident(updated);
  });

  useSocketEvent("team_assigned", (payload) => {
    if (payload.incident_id === incidentId) {
      setIncident(payload.incident);
      setActionMessage(`${payload.resource_name} has been allocated to this incident.`);
    }
  });

  async function handleRecommend() {
    setRecommending(true);
    setActionError(null);
    try {
      const result = await recommendResource(incidentId);
      setRecommendation(result);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Failed to get a recommendation.");
    } finally {
      setRecommending(false);
    }
  }

  async function handleAllocate(resourceId: number) {
    setAllocating(true);
    setActionError(null);
    try {
      const result = await allocateResource(incidentId, resourceId);
      setIncident(result.incident);
      setActionMessage(result.message);
      setRecommendation(null);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Failed to allocate resource.");
    } finally {
      setAllocating(false);
    }
  }

  if (loading) return <LoadingState label="Loading incident..." />;
  if (error || !incident) return <ErrorState message={error ?? "Incident not found."} onRetry={load} />;

  const alreadyHandled = NON_ALLOCATABLE_STATUSES.includes(incident.status);

  return (
    <div className="max-w-2xl space-y-6">
      <Link to="/dashboard" className="text-sm text-brand-accent hover:underline">
        ← Back to overview
      </Link>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              #{incident.id} · {formatLabel(incident.incident_type)}
            </h1>
            <p className="text-xs text-slate-500">{formatDateTime(incident.created_at)}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <SeverityBadge severity={incident.severity} />
            <StatusBadge status={incident.status} classMap={INCIDENT_STATUS_CLASSES} />
          </div>
        </div>

        {incident.description && (
          <p className="mt-3 text-sm text-slate-700">{incident.description}</p>
        )}

        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600">
          <div>
            <dt className="text-xs uppercase text-slate-400">Location</dt>
            <dd>
              {incident.latitude.toFixed(5)}, {incident.longitude.toFixed(5)}
            </dd>
          </div>
          {incident.reporter_name && (
            <div>
              <dt className="text-xs uppercase text-slate-400">Reporter</dt>
              <dd>{incident.reporter_name}</dd>
            </div>
          )}
          {incident.phone && (
            <div>
              <dt className="text-xs uppercase text-slate-400">Phone</dt>
              <dd>{incident.phone}</dd>
            </div>
          )}
        </dl>

        {incident.photo_path && (
          <p className="mt-3 text-xs text-slate-400">
            A photo was attached to this report. (Photo preview is unavailable — the backend does
            not yet expose a route to fetch uploaded files.)
          </p>
        )}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-800">Resource Allocation</h2>
        <p className="mt-1 text-xs text-slate-500">
          The allocation engine only recommends — an authority must approve before any team is
          dispatched.
        </p>

        {actionMessage && (
          <p className="mt-3 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            {actionMessage}
          </p>
        )}
        {actionError && (
          <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {actionError}
          </p>
        )}

        {alreadyHandled ? (
          <p className="mt-3 text-sm text-slate-600">
            This incident is already {formatLabel(incident.status).toLowerCase()} — no further
            allocation action is available.
          </p>
        ) : (
          <div className="mt-4">
            <RecommendationPanel
              result={recommendation}
              loading={recommending}
              onRequestRecommendation={handleRecommend}
              onAllocate={handleAllocate}
              allocating={allocating}
              disabled={alreadyHandled}
            />
          </div>
        )}
      </div>
    </div>
  );
}

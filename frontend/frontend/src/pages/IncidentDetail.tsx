import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getIncident, recommendResource, allocateResource, updateIncident } from "../services/incidents";
import type { Incident, IncidentStatus } from "../types/incident";
import type { RecommendationResult } from "../types/dashboard";
import SeverityBadge from "../components/common/SeverityBadge";
import StatusBadge from "../components/common/StatusBadge";
import LoadingState from "../components/common/LoadingState";
import ErrorState from "../components/common/ErrorState";
import RecommendationPanel from "../components/resources/RecommendationPanel";
import Button from "../components/common/Button";
import { INCIDENT_STATUS_CLASSES, formatDateTime, formatLabel } from "../utils/status";
import { ApiError } from "../types/api";
import { useSocketEvent } from "../hooks/useSocket";
import { API_BASE_URL } from "../services/api";

const NON_ALLOCATABLE_STATUSES = ["ASSIGNED", "IN_PROGRESS", "RESOLVED", "REJECTED"];

/** Allowed status transitions from each state */
const STATUS_TRANSITIONS: Record<string, IncidentStatus[]> = {
  REPORTED: ["VERIFIED", "REJECTED"],
  VERIFIED: ["IN_PROGRESS", "REJECTED"],
  ASSIGNED: ["IN_PROGRESS", "RESOLVED", "REJECTED"],
  IN_PROGRESS: ["RESOLVED", "REJECTED"],
  RESOLVED: [],
  REJECTED: [],
};

const STATUS_LABELS: Record<string, string> = {
  VERIFIED: "✓ Mark Verified",
  IN_PROGRESS: "▶ Mark In Progress",
  RESOLVED: "✅ Mark Resolved",
  REJECTED: "✕ Reject",
};

const STATUS_VARIANTS: Record<string, "primary" | "secondary" | "danger" | "ghost"> = {
  VERIFIED: "primary",
  IN_PROGRESS: "primary",
  RESOLVED: "secondary",
  REJECTED: "danger",
};

/** Status progression bar steps */
const STATUS_STEPS: IncidentStatus[] = ["REPORTED", "VERIFIED", "ASSIGNED", "IN_PROGRESS", "RESOLVED"];

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
  const [updatingStatus, setUpdatingStatus] = useState(false);

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

  async function handleStatusChange(newStatus: IncidentStatus) {
    setUpdatingStatus(true);
    setActionError(null);
    setActionMessage(null);
    try {
      const updated = await updateIncident(incidentId, { status: newStatus });
      setIncident(updated);
      setActionMessage(`Status updated to ${formatLabel(newStatus)}.`);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Failed to update status.");
    } finally {
      setUpdatingStatus(false);
    }
  }

  if (loading) return <LoadingState label="Loading incident..." />;
  if (error || !incident) return <ErrorState message={error ?? "Incident not found."} onRetry={load} />;

  const alreadyHandled = NON_ALLOCATABLE_STATUSES.includes(incident.status);
  const nextStatuses = STATUS_TRANSITIONS[incident.status] ?? [];
  const currentStepIndex = STATUS_STEPS.indexOf(incident.status as IncidentStatus);

  return (
    <div className="max-w-2xl space-y-6">
      <Link to="/dashboard" className="text-sm text-brand-accent hover:underline">
        ← Back to overview
      </Link>

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
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

        {incident.status !== "REJECTED" && (
          <div className="mt-4">
            <div className="flex items-center gap-1">
              {STATUS_STEPS.map((step, i) => (
                <div key={step} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className={`h-2 w-full rounded-full transition-colors ${
                      i <= currentStepIndex ? "bg-brand-accent" : "bg-slate-200"
                    }`}
                  />
                  <span className="hidden text-[10px] text-slate-400 sm:block">
                    {formatLabel(step)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        {incident.status === "REJECTED" && (
          <p className="mt-2 text-xs font-medium text-red-600">⚠ This incident has been rejected.</p>
        )}

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
          <div className="mt-4">
            <p className="mb-1 text-xs uppercase text-slate-400">Attached Photo</p>
            <img
              src={`${API_BASE_URL}/uploads/${incident.photo_path.replace(/^.*[\\/]/, "")}`}
              alt="Incident photo"
              className="max-h-64 w-auto rounded-md border border-slate-200 object-cover shadow-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}
      </div>

      {nextStatuses.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800">Update Incident Status</h2>
          <p className="mt-1 text-xs text-slate-500">
            As the authority, you can advance this incident through the response workflow.
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

          <div className="mt-4 flex flex-wrap gap-2">
            {nextStatuses.map((status) => (
              <Button
                id={`status-btn-${status.toLowerCase()}`}
                key={status}
                variant={STATUS_VARIANTS[status] ?? "secondary"}
                isLoading={updatingStatus}
                disabled={updatingStatus}
                onClick={() => handleStatusChange(status)}
              >
                {STATUS_LABELS[status] ?? formatLabel(status)}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-800">Resource Allocation</h2>
        <p className="mt-1 text-xs text-slate-500">
          The allocation engine only recommends — an authority must approve before any team is
          dispatched.
        </p>

        {actionMessage && !nextStatuses.length && (
          <p className="mt-3 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            {actionMessage}
          </p>
        )}
        {actionError && !nextStatuses.length && (
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

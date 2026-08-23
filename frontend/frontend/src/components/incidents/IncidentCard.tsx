import { Link } from "react-router-dom";
import type { Incident } from "../../types/incident";
import SeverityBadge from "../common/SeverityBadge";
import StatusBadge from "../common/StatusBadge";
import { INCIDENT_STATUS_CLASSES, formatDateTime, formatLabel } from "../../utils/status";

export default function IncidentCard({ incident }: { incident: Incident }) {
  return (
    <Link
      to={`/dashboard/incidents/${incident.id}`}
      className="block rounded-md border border-slate-200 bg-white p-3 transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-800">
            #{incident.id} · {formatLabel(incident.incident_type)}
          </p>
          <p className="text-xs text-slate-500">{formatDateTime(incident.created_at)}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <SeverityBadge severity={incident.severity} />
          <StatusBadge status={incident.status} classMap={INCIDENT_STATUS_CLASSES} />
        </div>
      </div>
      {incident.description && (
        <p className="mt-2 line-clamp-2 text-sm text-slate-600">{incident.description}</p>
      )}
      <p className="mt-2 text-xs text-slate-400">
        {incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}
      </p>
    </Link>
  );
}

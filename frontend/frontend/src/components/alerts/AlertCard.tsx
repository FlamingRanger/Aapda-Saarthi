import type { DisasterAlert } from "../../types/alert";
import SeverityBadge from "../common/SeverityBadge";
import StatusBadge from "../common/StatusBadge";
import { ALERT_STATUS_CLASSES, formatDateTime, formatLabel } from "../../utils/status";

export default function AlertCard({ alert }: { alert: DisasterAlert }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-slate-800">{formatLabel(alert.alert_type)}</p>
        <div className="flex flex-col items-end gap-1">
          <SeverityBadge severity={alert.severity} />
          <StatusBadge status={alert.status} classMap={ALERT_STATUS_CLASSES} />
        </div>
      </div>
      <p className="mt-2 text-sm text-slate-600">{alert.message}</p>
      <p className="mt-2 text-xs text-slate-400">
        Source: {alert.source} · {formatDateTime(alert.created_at)}
      </p>
    </div>
  );
}

import { Link, useLocation } from "react-router-dom";
import type { Incident } from "../types/incident";
import SeverityBadge from "../components/common/SeverityBadge";

interface LocationState {
  incident?: Incident;
  queued?: boolean;
}

export default function ReportSuccess() {
  const location = useLocation();
  const state = (location.state as LocationState) || {};

  if (state.queued) {
    return (
      <div className="rounded-md border border-yellow-300 bg-yellow-50 p-6 text-center">
        <p className="text-2xl">📥</p>
        <h1 className="mt-2 text-lg font-bold text-slate-900">Report saved on your device</h1>
        <p className="mt-1 text-sm text-slate-600">
          You were offline, so this report is queued and will be sent automatically once your
          connection is restored.
        </p>
        <Link to="/report" className="mt-4 inline-block text-sm font-semibold text-brand-accent">
          Report another emergency
        </Link>
      </div>
    );
  }

  if (!state.incident) {
    return (
      <div className="text-center">
        <p className="text-sm text-slate-500">No report information available.</p>
        <Link to="/report" className="mt-2 inline-block text-sm font-semibold text-brand-accent">
          Submit a report
        </Link>
      </div>
    );
  }

  const incident = state.incident;

  return (
    <div className="rounded-md border border-green-300 bg-green-50 p-6 text-center">
      <p className="text-2xl">✅</p>
      <h1 className="mt-2 text-lg font-bold text-slate-900">Report received</h1>
      <p className="mt-1 text-sm text-slate-600">
        Incident <span className="font-semibold">#{incident.id}</span> has been logged and sent to
        authorities.
      </p>
      <div className="mt-3 flex justify-center gap-2">
        <SeverityBadge severity={incident.severity} />
      </div>
      <p className="mt-2 text-xs text-slate-500">Status: {incident.status}</p>
      <Link to="/report" className="mt-4 inline-block text-sm font-semibold text-brand-accent">
        Report another emergency
      </Link>
    </div>
  );
}

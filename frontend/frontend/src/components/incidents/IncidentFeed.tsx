import type { Incident } from "../../types/incident";
import IncidentCard from "./IncidentCard";
import EmptyState from "../common/EmptyState";

export default function IncidentFeed({ incidents }: { incidents: Incident[] }) {
  if (incidents.length === 0) {
    return <EmptyState message="No incidents reported yet." />;
  }
  return (
    <div className="max-h-[70vh] space-y-2 overflow-y-auto pr-1">
      {incidents.map((incident) => (
        <IncidentCard key={incident.id} incident={incident} />
      ))}
    </div>
  );
}

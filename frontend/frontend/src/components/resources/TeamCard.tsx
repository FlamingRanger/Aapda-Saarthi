import type { RescueTeam } from "../../types/team";
import StatusBadge from "../common/StatusBadge";
import { TEAM_STATUS_CLASSES, formatLabel } from "../../utils/status";

export default function TeamCard({ team }: { team: RescueTeam }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-800">{team.team_name}</p>
          <p className="text-xs text-slate-500">{formatLabel(team.team_type)}</p>
        </div>
        <StatusBadge status={team.status} classMap={TEAM_STATUS_CLASSES} />
      </div>
      <div className="mt-2 grid grid-cols-2 gap-1 text-xs text-slate-600">
        <span>Members: {team.members}</span>
        {team.vehicle_type && <span>Vehicle: {team.vehicle_type}</span>}
        <span>
          Location: {team.latitude.toFixed(3)}, {team.longitude.toFixed(3)}
        </span>
        {team.current_assignment && <span>Assigned to incident #{team.current_assignment}</span>}
      </div>
    </div>
  );
}

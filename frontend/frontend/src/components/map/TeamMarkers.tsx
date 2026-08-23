import { Marker, Popup } from "react-leaflet";
import type { RescueTeam } from "../../types/team";
import { teamIcon } from "./markerIcons";
import { formatLabel } from "../../utils/status";

export default function TeamMarkers({ teams }: { teams: RescueTeam[] }) {
  return (
    <>
      {teams.map((team) => (
        <Marker
          key={`team-${team.id}`}
          position={[team.latitude, team.longitude]}
          icon={teamIcon(team.status)}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{team.team_name}</p>
              <p>Type: {formatLabel(team.team_type)}</p>
              <p>Status: {formatLabel(team.status)}</p>
              <p>Members: {team.members}</p>
              {team.vehicle_type && <p>Vehicle: {team.vehicle_type}</p>}
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

import { Marker, Popup } from "react-leaflet";
import type { Incident } from "../../types/incident";
import { incidentIcon } from "./markerIcons";
import { formatLabel } from "../../utils/status";

export default function IncidentMarkers({ incidents }: { incidents: Incident[] }) {
  return (
    <>
      {incidents.map((incident) => (
        <Marker
          key={`incident-${incident.id}`}
          position={[incident.latitude, incident.longitude]}
          icon={incidentIcon(incident.severity)}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">
                #{incident.id} · {formatLabel(incident.incident_type)}
              </p>
              <p>Severity: {incident.severity}</p>
              <p>Status: {formatLabel(incident.status)}</p>
              {incident.description && <p className="mt-1">{incident.description}</p>}
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

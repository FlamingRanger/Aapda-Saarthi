import { Marker, Popup } from "react-leaflet";
import type { DisasterAlert } from "../../types/alert";
import { alertIcon } from "./markerIcons";
import { formatLabel } from "../../utils/status";

export default function AlertMarkers({ alerts }: { alerts: DisasterAlert[] }) {
  const geoAlerts = alerts.filter((a) => a.latitude != null && a.longitude != null);
  return (
    <>
      {geoAlerts.map((alert) => (
        <Marker
          key={`alert-${alert.id}`}
          position={[alert.latitude as number, alert.longitude as number]}
          icon={alertIcon()}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{formatLabel(alert.alert_type)}</p>
              <p>Severity: {alert.severity}</p>
              <p className="mt-1">{alert.message}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

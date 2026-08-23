import L from "leaflet";
import { severityColor } from "../../utils/severity";

function dotIcon(color: string, size = 22): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${color};border:2px solid white;
      box-shadow:0 0 0 1px rgba(0,0,0,0.25);
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export function incidentIcon(severity: string): L.DivIcon {
  return dotIcon(severityColor(severity), 24);
}

export const teamIcon = (status: string) =>
  dotIcon(status === "AVAILABLE" ? "#0ea5e9" : "#64748b", 20);

export const shelterIcon = () => dotIcon("#7c3aed", 20);
export const supplyIcon = () => dotIcon("#0d9488", 20);
export const alertIcon = () => dotIcon("#f59e0b", 18);

import { useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import type { MapData } from "../../types/dashboard";
import IncidentMarkers from "./IncidentMarkers";
import TeamMarkers from "./TeamMarkers";
import ShelterMarkers from "./ShelterMarkers";
import SupplyMarkers from "./SupplyMarkers";
import AlertMarkers from "./AlertMarkers";
import HeatmapLayer from "./HeatmapLayer";

interface DisasterMapProps {
  data: MapData;
  height?: string;
  center?: [number, number];
}

type LayerKey = "incidents" | "teams" | "shelters" | "supplies" | "alerts" | "heatmap";

const DEFAULT_CENTER: [number, number] = [22.26, 84.85];

export default function DisasterMap({ data, height = "600px", center }: DisasterMapProps) {
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({
    incidents: true,
    teams: true,
    shelters: true,
    supplies: true,
    alerts: true,
    heatmap: false,
  });

  function toggle(key: LayerKey) {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const mapCenter = center ?? inferCenter(data) ?? DEFAULT_CENTER;

  return (
    <div className="relative" style={{ height }}>
      <div className="absolute right-2 top-2 z-[1000] flex flex-col gap-1 rounded-md border border-slate-200 bg-white/95 p-2 text-xs shadow">
        {(
          [
            ["incidents", "Incidents"],
            ["teams", "Teams"],
            ["shelters", "Shelters"],
            ["supplies", "Supplies"],
            ["alerts", "Alerts"],
            ["heatmap", "Heatmap"],
          ] as [LayerKey, string][]
        ).map(([key, label]) => (
          <label key={key} className="flex items-center gap-1.5">
            <input type="checkbox" checked={layers[key]} onChange={() => toggle(key)} />
            {label}
          </label>
        ))}
      </div>

      <MapContainer center={mapCenter} zoom={12} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {layers.heatmap && <HeatmapLayer points={data.heatmap} />}
        {layers.incidents && <IncidentMarkers incidents={data.incidents} />}
        {layers.teams && <TeamMarkers teams={data.teams} />}
        {layers.shelters && <ShelterMarkers shelters={data.shelters} />}
        {layers.supplies && <SupplyMarkers supplies={data.supplies} />}
        {layers.alerts && <AlertMarkers alerts={data.alerts} />}
      </MapContainer>
    </div>
  );
}

function inferCenter(data: MapData): [number, number] | null {
  const points = [
    ...data.incidents.map((i) => [i.latitude, i.longitude] as [number, number]),
    ...data.teams.map((t) => [t.latitude, t.longitude] as [number, number]),
  ];
  if (points.length === 0) return null;
  const lat = points.reduce((sum, p) => sum + p[0], 0) / points.length;
  const lon = points.reduce((sum, p) => sum + p[1], 0) / points.length;
  return [lat, lon];
}

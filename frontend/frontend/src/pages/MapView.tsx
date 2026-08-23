import { useEffect, useState } from "react";
import DisasterMap from "../components/map/DisasterMap";
import LoadingState from "../components/common/LoadingState";
import ErrorState from "../components/common/ErrorState";
import { getMapData } from "../services/dashboard";
import type { MapData } from "../types/dashboard";
import { ApiError } from "../types/api";
import { useSocketEvent } from "../hooks/useSocket";
import { severityColor } from "../utils/severity";

export default function MapView() {
  const [data, setData] = useState<MapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const mapData = await getMapData();
      setData(mapData);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load map data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useSocketEvent("new_incident", (incident) => {
    setData((prev) =>
      prev
        ? {
            ...prev,
            incidents: [incident, ...prev.incidents.filter((i) => i.id !== incident.id)],
            heatmap: [
              ...prev.heatmap,
              {
                latitude: incident.latitude,
                longitude: incident.longitude,
                weight:
                  { LOW: 0.25, MEDIUM: 0.5, HIGH: 0.75, CRITICAL: 1.0 }[incident.severity] ?? 0.25,
              },
            ],
          }
        : prev
    );
  });

  useSocketEvent("incident_updated", (incident) => {
    setData((prev) =>
      prev
        ? { ...prev, incidents: prev.incidents.map((i) => (i.id === incident.id ? incident : i)) }
        : prev
    );
  });

  useSocketEvent("team_status_changed", (team) => {
    setData((prev) =>
      prev ? { ...prev, teams: prev.teams.map((t) => (t.id === team.id ? team : t)) } : prev
    );
  });

  useSocketEvent("shelter_updated", (shelter) => {
    setData((prev) =>
      prev
        ? { ...prev, shelters: prev.shelters.map((s) => (s.id === shelter.id ? shelter : s)) }
        : prev
    );
  });

  useSocketEvent("supply_updated", (supply) => {
    setData((prev) =>
      prev ? { ...prev, supplies: prev.supplies.map((s) => (s.id === supply.id ? supply : s)) } : prev
    );
  });

  useSocketEvent("weather_alert", (alert) => {
    setData((prev) =>
      prev
        ? { ...prev, alerts: [alert, ...prev.alerts.filter((a) => a.id !== alert.id)] }
        : prev
    );
  });

  if (loading) return <LoadingState label="Loading map data..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return null;

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold text-slate-900">Disaster Map</h1>
      <div className="flex flex-wrap gap-3 text-xs text-slate-600">
        {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((s) => (
          <span key={s} className="flex items-center gap-1">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: severityColor(s) }}
            />
            {s}
          </span>
        ))}
      </div>
      <div className="overflow-hidden rounded-lg border border-slate-200">
        <DisasterMap data={data} height="70vh" />
      </div>
    </div>
  );
}

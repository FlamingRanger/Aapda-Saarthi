import { useEffect, useState } from "react";
import StatCard from "../components/dashboard/StatCard";
import IncidentFeed from "../components/incidents/IncidentFeed";
import LoadingState from "../components/common/LoadingState";
import ErrorState from "../components/common/ErrorState";
import { getDashboardStats } from "../services/dashboard";
import { listIncidents } from "../services/incidents";
import type { DashboardStats } from "../types/dashboard";
import type { Incident } from "../types/incident";
import { ApiError } from "../types/api";
import { useSocketEvent } from "../hooks/useSocket";

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [statsData, incidentsData] = await Promise.all([
        getDashboardStats(),
        listIncidents(),
      ]);
      setStats(statsData);
      setIncidents(incidentsData);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useSocketEvent("new_incident", (incident) => {
    setIncidents((prev) => [incident, ...prev.filter((i) => i.id !== incident.id)]);
    setStats((prev) =>
      prev
        ? {
            ...prev,
            total_incidents: prev.total_incidents + 1,
            active_incidents: prev.active_incidents + 1,
            critical_incidents:
              incident.severity === "CRITICAL"
                ? prev.critical_incidents + 1
                : prev.critical_incidents,
          }
        : prev
    );
  });

  useSocketEvent("incident_updated", (incident) => {
    setIncidents((prev) => prev.map((i) => (i.id === incident.id ? incident : i)));
  });

  useSocketEvent("team_status_changed", () => {
    // Team availability affects stats — simplest correct approach is a
    // lightweight refetch rather than trying to reconstruct counts locally.
    getDashboardStats().then(setStats).catch(() => undefined);
  });

  if (loading) return <LoadingState label="Loading dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Command Overview</h1>
        <p className="text-sm text-slate-500">Live situational awareness across the district.</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard label="Critical" value={stats.critical_incidents} accent="text-red-600" />
          <StatCard label="Active" value={stats.active_incidents} />
          <StatCard label="Total" value={stats.total_incidents} />
          <StatCard
            label="Teams Available"
            value={stats.teams_available}
            accent="text-green-600"
          />
          <StatCard label="Teams Busy" value={stats.teams_busy} accent="text-orange-600" />
          <StatCard label="Active Alerts" value={stats.active_alerts} accent="text-amber-600" />
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <StatCard
            label="Shelter Capacity Available"
            value={`${stats.shelter_available_capacity} / ${stats.shelter_capacity_total}`}
          />
          <StatCard label="Supply Centers" value={stats.supply_centers_total} />
        </div>
      )}

      <div>
        <h2 className="mb-2 text-sm font-semibold text-slate-700">Incident Feed</h2>
        <IncidentFeed incidents={incidents} />
      </div>
    </div>
  );
}

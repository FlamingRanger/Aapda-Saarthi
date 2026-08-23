import { useEffect, useState } from "react";
import { listTeams } from "../services/teams";
import type { RescueTeam } from "../types/team";
import TeamCard from "../components/resources/TeamCard";
import LoadingState from "../components/common/LoadingState";
import ErrorState from "../components/common/ErrorState";
import EmptyState from "../components/common/EmptyState";
import { ApiError } from "../types/api";
import { useSocketEvent } from "../hooks/useSocket";
import { TEAM_STATUSES } from "../types/team";

export default function TeamsPage() {
  const [teams, setTeams] = useState<RescueTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await listTeams(statusFilter ? { status: statusFilter } : {});
      setTeams(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load teams.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  useSocketEvent("team_status_changed", (team) => {
    setTeams((prev) => {
      const exists = prev.some((t) => t.id === team.id);
      const updated = exists ? prev.map((t) => (t.id === team.id ? team : t)) : [...prev, team];
      return statusFilter ? updated.filter((t) => t.status === statusFilter) : updated;
    });
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Rescue Teams</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        >
          <option value="">All statuses</option>
          {TEAM_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {loading && <LoadingState label="Loading teams..." />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && teams.length === 0 && (
        <EmptyState message="No rescue teams match this filter." />
      )}
      {!loading && !error && teams.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}
    </div>
  );
}

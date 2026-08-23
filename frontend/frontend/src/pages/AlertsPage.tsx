import { useEffect, useState } from "react";
import { listAlerts } from "../services/alerts";
import type { DisasterAlert } from "../types/alert";
import AlertCard from "../components/alerts/AlertCard";
import LoadingState from "../components/common/LoadingState";
import ErrorState from "../components/common/ErrorState";
import EmptyState from "../components/common/EmptyState";
import { ApiError } from "../types/api";
import { useSocketEvent } from "../hooks/useSocket";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<DisasterAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setAlerts(await listAlerts());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load alerts.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useSocketEvent("weather_alert", (alert) => {
    setAlerts((prev) => {
      const exists = prev.some((a) => a.id === alert.id);
      return exists ? prev.map((a) => (a.id === alert.id ? alert : a)) : [alert, ...prev];
    });
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-900">Weather &amp; Disaster Alerts</h1>
      {loading && <LoadingState label="Loading alerts..." />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && alerts.length === 0 && (
        <EmptyState message="No active alerts." />
      )}
      {!loading && !error && alerts.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {alerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { listSupplies } from "../services/supplies";
import type { SupplyCenter } from "../types/supply";
import SupplyCard from "../components/supplies/SupplyCard";
import LoadingState from "../components/common/LoadingState";
import ErrorState from "../components/common/ErrorState";
import EmptyState from "../components/common/EmptyState";
import { ApiError } from "../types/api";
import { useSocketEvent } from "../hooks/useSocket";

export default function SuppliesPage() {
  const [supplies, setSupplies] = useState<SupplyCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setSupplies(await listSupplies());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load supply centers.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useSocketEvent("supply_updated", (supply) => {
    setSupplies((prev) => {
      const exists = prev.some((s) => s.id === supply.id);
      return exists ? prev.map((s) => (s.id === supply.id ? supply : s)) : [...prev, supply];
    });
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-900">Supply Centers</h1>
      {loading && <LoadingState label="Loading supply centers..." />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && supplies.length === 0 && (
        <EmptyState message="No supply centers registered yet." />
      )}
      {!loading && !error && supplies.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {supplies.map((supply) => (
            <SupplyCard key={supply.id} supply={supply} />
          ))}
        </div>
      )}
    </div>
  );
}

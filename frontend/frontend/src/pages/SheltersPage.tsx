import { useEffect, useState } from "react";
import { listShelters } from "../services/shelters";
import type { Shelter } from "../types/shelter";
import ShelterCard from "../components/shelters/ShelterCard";
import LoadingState from "../components/common/LoadingState";
import ErrorState from "../components/common/ErrorState";
import EmptyState from "../components/common/EmptyState";
import { ApiError } from "../types/api";
import { useSocketEvent } from "../hooks/useSocket";

export default function SheltersPage() {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setShelters(await listShelters());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load shelters.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useSocketEvent("shelter_updated", (shelter) => {
    setShelters((prev) => {
      const exists = prev.some((s) => s.id === shelter.id);
      return exists ? prev.map((s) => (s.id === shelter.id ? shelter : s)) : [...prev, shelter];
    });
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-900">Shelters</h1>
      {loading && <LoadingState label="Loading shelters..." />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && shelters.length === 0 && (
        <EmptyState message="No shelters registered yet." />
      )}
      {!loading && !error && shelters.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shelters.map((shelter) => (
            <ShelterCard key={shelter.id} shelter={shelter} />
          ))}
        </div>
      )}
    </div>
  );
}

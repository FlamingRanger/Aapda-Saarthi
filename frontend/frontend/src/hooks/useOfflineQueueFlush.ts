import { useEffect } from "react";
import { useOnlineStatus } from "./useOnlineStatus";
import { getQueuedIncidents, removeQueuedIncident } from "../utils/offlineQueue";
import { createIncident } from "../services/incidents";

/**
 * Watches connectivity and retries any queued citizen reports once the
 * browser comes back online. Mounted once near the app root.
 */
export function useOfflineQueueFlush() {
  const isOnline = useOnlineStatus();

  useEffect(() => {
    if (!isOnline) return;

    let cancelled = false;

    async function flush() {
      const queued = getQueuedIncidents();
      for (const item of queued) {
        if (cancelled) return;
        try {
          await createIncident({ ...item.payload, photo: null });
          removeQueuedIncident(item.localId);
        } catch {
          // Leave it queued — will retry on the next reconnect.
        }
      }
    }

    flush();
    return () => {
      cancelled = true;
    };
  }, [isOnline]);
}

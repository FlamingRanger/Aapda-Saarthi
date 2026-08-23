/**
 * Minimal offline queue for citizen incident reports.
 *
 * This is intentionally self-contained: no backend/integrations
 * "offline sync" service currently exists in the repo, so this queue
 * lives entirely in the browser (localStorage) and retries submission
 * itself once connectivity returns. If a real offline-sync mechanism
 * is added under Integrations/ later, this module is the seam to
 * replace with a call into that service.
 *
 * Note: photos are NOT persisted in the queue (File objects cannot be
 * reliably serialized to localStorage) — a queued report is submitted
 * without its photo if the browser was closed and reopened.
 */
import type { CreateIncidentPayload } from "../types/incident";

const STORAGE_KEY = "aapdasaarthi.offline_incident_queue.v1";

export interface QueuedIncident {
  localId: string;
  payload: Omit<CreateIncidentPayload, "photo">;
  queuedAt: string;
}

function readQueue(): QueuedIncident[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as QueuedIncident[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(queue: QueuedIncident[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch {
    // Storage full or unavailable — degrade silently, nothing else we can do.
  }
}

export function enqueueIncident(payload: Omit<CreateIncidentPayload, "photo">): QueuedIncident {
  const queue = readQueue();
  const item: QueuedIncident = {
    localId: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    payload,
    queuedAt: new Date().toISOString(),
  };
  queue.push(item);
  writeQueue(queue);
  return item;
}

export function getQueuedIncidents(): QueuedIncident[] {
  return readQueue();
}

export function removeQueuedIncident(localId: string): void {
  writeQueue(readQueue().filter((q) => q.localId !== localId));
}

export function queueLength(): number {
  return readQueue().length;
}

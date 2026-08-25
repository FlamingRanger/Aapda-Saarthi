# Sync Logic — Retry & Reconnect Behavior

**Owner:** Developer 3 (Integrations) — `integrations/offline/`
**Related:** `offline_queue.md` (data model & lifecycle), root spec §17.3, §23, §25

## Connectivity detection

Connectivity is treated as "restored" when a lightweight health check
succeeds:

```
GET /api/health   →   { "status": "ok" }
```

(This endpoint already exists per root spec §11.1 — this module does not
invent a new one.) A short timeout (a few seconds) is used so a single
check never blocks the UI or another sync attempt for long. Failure to
reach `/api/health` is treated identically to failure to reach
`POST /api/incidents` — both mean "still offline," not an error to
surface to the user beyond the existing "pending upload" state.

## Retry policy

- Retries use **exponential backoff** rather than constant-interval
  polling, to avoid hammering a backend that's slowly recovering and to
  respect the low-bandwidth design goal in root spec §23 ("use
  event-driven updates rather than excessive polling").
- Default backoff schedule (configurable): `5s, 15s, 60s, 300s` between
  attempts 1→2, 2→3, 3→4, 4→5.
- `MAX_RETRY_ATTEMPTS` default: **5**. After the 5th failed attempt, the
  entry moves to `FAILED_RETAINED` (see `offline_queue.md`) rather than
  being retried indefinitely or discarded.
- A `FAILED_RETAINED` entry is not permanently abandoned — it can still
  be retried manually (e.g. a "retry now" action in the UI, or a fresh
  `attempt_sync_all()` call), it simply no longer retries *automatically*
  in the background.

## Sync algorithm (per attempt)

```
for each entry in queue where status == PENDING_UPLOAD:
    if not is_backend_reachable():
        stop — still offline, try again later
    try:
        POST /api/incidents  with entry.incident
        on 2xx response:
            entry.status = UPLOADED
        on non-2xx / network error:
            entry.attempts += 1
            entry.last_error = <error message>
            entry.last_attempt_at = now()
            if entry.attempts >= MAX_RETRY_ATTEMPTS:
                entry.status = FAILED_RETAINED
    persist queue to local storage after EVERY entry processed
    (not just at the end) — a crash mid-sync must not lose progress
    already made on other entries
```

## Reconnect trigger

Two trigger mechanisms are supported conceptually (a browser
implementation would typically use both):

1. **Passive/periodic:** call `attempt_sync_all()` on an interval timer
   (e.g. every 30–60 seconds) whenever the queue is non-empty.
2. **Active/event-driven:** call `attempt_sync_all()` immediately when
   the client detects a network-state change (e.g. the browser's
   `online` event), rather than waiting for the next timer tick.

Integrations' reference implementation (`offline_sync.py`) exposes
`attempt_sync_all()` as a single callable specifically so either trigger
mechanism can call it without needing to know about the other.

## What this does NOT cover (explicitly out of scope here)

- Conflict resolution for editing/updating an already-uploaded report
  offline (root spec's incident model doesn't require offline *edits*,
  only offline *creation*).
- Real browser storage APIs (IndexedDB/localStorage) — that's
  Developer 2's implementation detail when porting this lifecycle to
  the frontend; this document defines the *behavior*, not the browser
  storage mechanism.
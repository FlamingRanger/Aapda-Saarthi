# Offline Queue — Concept & Data Model

**Owner:** Developer 3 (Integrations) — `integrations/offline/`
**Related:** `sync_logic.md` (retry/reconnect behavior), root spec §17.3, §23 (low-bandwidth design), §25 (error states)

## Why this exists

A citizen may submit an incident report while genuinely offline, or while
connectivity is too poor for the request to complete. Per root spec §17.3
and §23, **a report must never be silently lost** just because the network
failed at submission time. This document defines the queue concept; the
retry/reconnect behavior itself is documented in `sync_logic.md`, and a
Python reference implementation is provided in `offline_sync.py` to make
this concrete and testable rather than purely descriptive.

Note on where this actually runs: for the real citizen-facing web app,
this queue lives in the **browser** (e.g. IndexedDB/localStorage), owned
by Developer 2 (Frontend). The reference implementation here is the
**definitive behavior spec** — the state machine, field names, and
lifecycle Developer 2 should port into the frontend, plus a runnable
Python version integrations can use to demonstrate and test the concept
independently (e.g. for the SMS/IVR channels, which really do run
server-side and can use this queue as-is when the backend is briefly
unreachable).

## Lifecycle (root spec §17.3, steps 1–7)

```
1. Detect offline state
        |
        v
2. Save report locally  --------------------> queued entry created
        |                                      status = PENDING_UPLOAD
        v
3. Mark report "Pending Upload"
        |
        v
4. Restore connectivity  (detected by periodic health check)
        |
        v
5. Retry upload
        |
   +----+----+
   |         |
 SUCCESS   FAILURE (repeated)
   |         |
   v         v
6. Mark    7. Preserve the report and show its
"Uploaded"    state to the user (status = FAILED_RETAINED)
              — never silently discard it
```

## Queue entry data model

Each queued report is stored as one entry with the following fields
(this is the exact shape `offline_sync.py` uses, and what a browser
implementation should mirror):

```json
{
  "queue_id": "q-3f9a1c",
  "incident": {
    "incident_type": "FLOOD",
    "severity": "HIGH",
    "latitude": 20.2961,
    "longitude": 85.8245,
    "description": "Water rising near the market",
    "source": "web"
  },
  "status": "PENDING_UPLOAD",
  "attempts": 0,
  "created_at": "2026-08-22T10:00:00Z",
  "last_attempt_at": null,
  "last_error": null
}
```

## Status values

| Status | Meaning |
|---|---|
| `PENDING_UPLOAD` | Saved locally, not yet successfully submitted to the backend |
| `UPLOADED` | Successfully submitted; kept in the local queue record for audit/visibility, not deleted outright, until the client chooses to clear its history |
| `FAILED_RETAINED` | Repeated retry attempts exhausted (see `sync_logic.md` for the retry policy); the report is **kept, not discarded**, and the UI must show the user that this specific report still needs attention |

## Non-negotiable rule

Per root spec §23/§25: **do not lose a citizen report silently.** A
report only ever leaves `PENDING_UPLOAD` by moving to `UPLOADED` or
`FAILED_RETAINED` — never by being deleted while still unsent.
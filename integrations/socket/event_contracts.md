# Socket.IO Event Contracts — Aapda-Saarthi (PS-05)

**Owner:** Developer 3 — Integrations (`integrations/socket/event_contracts.md`)
**Consumers:** Developer 1 (Backend — emits most events), Developer 2 (Frontend — listens to all events)
**Status:** DRAFT v1 — proposed before backend/frontend implementation exists. Any change to event name, payload shape, or trigger condition must be re-negotiated through a change request (see root spec §8), not edited unilaterally by the consuming side.

## Conventions used in every event below

- **Namespace:** all events are emitted on the default Socket.IO namespace (`/`) for MVP. A dedicated namespace can be introduced later without breaking this contract if needed — that would itself require a change request.
- **Room strategy (MVP):** no rooms for MVP — broadcast to all connected authority dashboard clients. Citizen clients do not subscribe to any of these events. Room-based scoping (e.g. per-district) is a post-MVP optimization.
- **Payload format:** JSON object, field names and types must match the backend model fields defined in root spec §10 exactly. No event should invent a field name that isn't already part of a REST resource — sockets mirror REST state changes, they don't define new state.
- **Timestamps:** ISO 8601 UTC strings (e.g. `"2026-08-22T10:15:00Z"`).
- **Versioning:** if a breaking payload change is ever required, bump to `new_incident_v2` etc. rather than silently changing `new_incident`'s shape.

---

## 1. `new_incident`

| Field | Value |
|---|---|
| **Sender** | Backend (`incident_service.py`, after a successful `POST /api/incidents`) |
| **Receiver** | Authority Dashboard (all connected clients) |
| **Trigger** | A new incident row is committed to the database with status `REPORTED` |

**Payload:**
```json
{
  "id": 124,
  "incident_type": "TRAPPED_PERSON",
  "severity": "CRITICAL",
  "description": "People are trapped inside houses",
  "latitude": 22.5726,
  "longitude": 88.3639,
  "photo_path": "/uploads/incident_124.jpg",
  "status": "REPORTED",
  "created_at": "2026-08-22T10:15:00Z"
}
```

**Expected UI behavior:**
- Incident feed prepends the new incident without a manual refresh.
- A new marker appears on the map, colored by severity (CRITICAL = red, HIGH = orange, MEDIUM = yellow, LOW = green).
- Heatmap intensity recalculates to include the new point.
- If severity is `CRITICAL`, the dashboard should visually call attention to it (e.g. toast/banner), but must not auto-open any panel or take over the authority's screen.

**Error behavior:**
- If a client receives a payload missing a required field (e.g. no `latitude`/`longitude`), the frontend should skip placing a map marker but still show the incident in the feed with a "location unavailable" indicator, rather than crashing the map render.
- If the socket connection drops before this event arrives, the frontend must reconcile on reconnect via `GET /api/incidents` (REST is the source of truth; sockets are a live-update convenience, not the only path to consistent state).

---

## 2. `incident_updated`

| Field | Value |
|---|---|
| **Sender** | Backend (any `PUT /api/incidents/<id>`, or as a side effect of allocation) |
| **Receiver** | Authority Dashboard |
| **Trigger** | An existing incident's `status` or other mutable field changes (e.g. `REPORTED` → `VERIFIED` → `ASSIGNED` → `IN_PROGRESS` → `RESOLVED`/`REJECTED`) |

**Payload:**
```json
{
  "id": 124,
  "status": "ASSIGNED",
  "updated_at": "2026-08-22T10:22:00Z"
}
```

**Expected UI behavior:**
- Incident feed entry and map marker for this `id` update in place (status badge, marker style) — the incident is not re-added as a new entry.
- If the incident details panel is currently open for this `id`, it reflects the change live.

**Error behavior:**
- If the frontend has no local record of this `id` (e.g. it connected after the incident was created and missed `new_incident`), it should fetch `GET /api/incidents/<id>` once to backfill rather than silently dropping the update.
- Unknown `status` values should be rendered as a neutral/generic badge rather than breaking status-based styling logic.

---

## 3. `team_assigned`

| Field | Value |
|---|---|
| **Sender** | Backend (`POST /api/incidents/<id>/allocate`, after authority approval) |
| **Receiver** | Authority Dashboard |
| **Trigger** | An authority approves an allocation recommendation, linking a team to an incident |

**Payload:**
```json
{
  "incident_id": 124,
  "team_id": 7,
  "team_name": "Team-04",
  "status": "ASSIGNED",
  "distance_km": 2.1,
  "score": 91,
  "reason": "Nearest suitable available team with adequate response capacity",
  "assigned_at": "2026-08-22T10:25:00Z"
}
```

**Expected UI behavior:**
- Allocation panel for the incident shows the confirmed assignment (not just the earlier recommendation).
- Team marker on the map updates to reflect its new `current_assignment` and status.
- Incident marker/feed entry reflects that a resource has been committed.

**Error behavior:**
- This event must never be emitted without a prior human approval action on the backend (no automatic dispatch — root spec §2, §14.4). If the frontend ever receives `team_assigned` without the authority having clicked Approve in that session, treat it as a reconciliation update from another authority user/session, not an error — but this must not happen without any human approval having occurred somewhere.
- If `team_id` doesn't correspond to a known team, backend should fetch `GET /api/teams/<id>` to backfill and log a contract warning locally rather than failing the whole event render.

---

## 4. `team_status_changed`

| Field | Value |
|---|---|
| **Sender** | Backend (any team status mutation: `PUT /api/teams/<id>`, or lifecycle progression `ASSIGNED` → `EN_ROUTE` → `ON_SITE` → `COMPLETED`) |
| **Receiver** | Authority Dashboard |
| **Trigger** | A team's `status` field changes |

**Payload:**
```json
{
  "team_id": 7,
  "status": "EN_ROUTE",
  "latitude": 22.5800,
  "longitude": 88.3700,
  "updated_at": "2026-08-22T10:30:00Z"
}
```

**Expected UI behavior:**
- Team marker moves/updates icon and color per status.
- Resource panel's team list updates the row in place.
- If this team is linked to a currently-open incident's allocation panel, that panel's "current resource status" field updates live.

**Error behavior:**
- `latitude`/`longitude` are optional in this payload (a status change doesn't always come with a location update). Frontend must not assume both are always present, and should retain the last known position if omitted.

---

## 5. `shelter_updated`

| Field | Value |
|---|---|
| **Sender** | Backend (`PUT /api/shelters/<id>`) |
| **Receiver** | Authority Dashboard |
| **Trigger** | A shelter's `occupied`, `available_capacity`, or `status` changes |

**Payload:**
```json
{
  "shelter_id": 3,
  "occupied": 42,
  "available_capacity": 58,
  "status": "OPEN",
  "updated_at": "2026-08-22T10:18:00Z"
}
```

**Expected UI behavior:**
- Shelter marker and resource management view update capacity numbers in place.
- If `available_capacity` reaches 0, marker/UI should visually flag the shelter as full.

**Error behavior:**
- `available_capacity` must never render as negative in the UI even if a malformed payload contains a negative number — clamp to 0 and treat as a data-integrity signal, not a crash.

---

## 6. `supply_updated`

| Field | Value |
|---|---|
| **Sender** | Backend (`PUT /api/supplies/<id>`) |
| **Receiver** | Authority Dashboard |
| **Trigger** | Any supply quantity field (`food_packets`, `water_units`, `medical_kits`, `blankets`) or `status` changes |

**Payload:**
```json
{
  "supply_id": 5,
  "food_packets": 120,
  "water_units": 300,
  "medical_kits": 40,
  "blankets": 80,
  "status": "AVAILABLE",
  "updated_at": "2026-08-22T10:20:00Z"
}
```

**Expected UI behavior:**
- Supply marker/indicator and resource management view update in place.
- Only the fields present in the payload need to be re-rendered; omitted fields keep their last known value (partial updates are allowed).

**Error behavior:**
- Missing/omitted quantity fields are not errors — treat as "unchanged," not "zero."

---

## 7. `weather_alert`

| Field | Value |
|---|---|
| **Sender** | Integrations (`weather_service.py` / `weather_adapter.py`) — this is the one event NOT sent by Developer 1's backend directly; it originates from the integrations layer, which writes/normalizes the alert and then triggers the emit (implementation detail of who calls `socketio.emit` is a backend/integrations coordination point — see note below) |
| **Receiver** | Authority Dashboard (and optionally a citizen-facing alert banner, post-MVP) |
| **Trigger** | A new alert is normalized from the live feed or sample fallback data, matching the Alert model in root spec §10.5 |

**Payload:**
```json
{
  "id": 9,
  "alert_type": "FLOOD_WARNING",
  "severity": "HIGH",
  "message": "Heavy rainfall expected in the next 6 hours",
  "latitude": 22.57,
  "longitude": 88.36,
  "source": "sample_fallback",
  "start_time": "2026-08-22T12:00:00Z",
  "end_time": "2026-08-22T18:00:00Z",
  "status": "ACTIVE"
}
```

**Expected UI behavior:**
- Alert banner area on the dashboard shows/updates the active alert.
- Weather alert layer on the map renders the affected area.
- `source` field ("sample_fallback" vs a real provider name) is not shown as an error to the authority — it may optionally be shown as a small provenance label, since the system must work identically whether live or sample data is in use.

**Error behavior:**
- If the live weather provider is unreachable, the integrations adapter must emit from `sample_alerts.json` instead of failing to emit at all. The dashboard should never show "no weather data" purely because an external API was down — that is exactly the fallback this event contract exists to guarantee.

**Coordination note (flagged, not resolved unilaterally):** Whether `integrations/weather/weather_service.py` calls `socketio.emit` directly (requiring it to import/share the backend's SocketIO instance) or instead writes to a queue/DB row that the backend picks up and emits is an open interface question between Developer 1 and Developer 3. Proposed default for MVP: **integrations calls a thin backend-exposed function `emit_weather_alert(payload)` that the backend defines and integrations imports** — this keeps the SocketIO server instance owned by backend/`app.py` (single source of truth for the socket server) while integrations owns the data normalization. This is a request to Developer 1, not an assumption already implemented.

---

## Summary table

| Event | Sender | Trigger |
|---|---|---|
| `new_incident` | Backend | New incident created |
| `incident_updated` | Backend | Incident status/field changed |
| `team_assigned` | Backend | Authority approves allocation |
| `team_status_changed` | Backend | Team status/location changed |
| `shelter_updated` | Backend | Shelter capacity/status changed |
| `supply_updated` | Backend | Supply quantities/status changed |
| `weather_alert` | Integrations (via backend emit function) | New/updated alert normalized from feed or fallback |

## Open items for other developers

1. **To Developer 1 (Backend):** Please confirm or counter-propose the `emit_weather_alert(payload)` interface above so Integrations can build `weather_service.py` against a stable call signature.
2. **To Developer 1 (Backend):** Confirm event names above match what `app.py` / `Flask-SocketIO` will actually emit — this doc is authored first since no backend code exists yet, so backend should treat this as the target contract, not the other way around, unless there's a stated conflict (per root spec §1: "If a requirement conflicts with the architecture, explain the conflict before making a structural change").
3. **To Developer 2 (Frontend):** `integrations/socket/socket_client_helpers/` will provide a typed wrapper for these events once backend confirms the above — until then, frontend can safely stub against this contract.
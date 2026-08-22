# Backend — disaster-response-platform

**Branch:** `dev/backend`
**Owned directory:** `backend/` (this directory only — see repo-root `README.md` for the no-overlap rule)

Flask + SQLAlchemy + Flask-SocketIO backend for the PS-05 Real-Time
Disaster Early-Warning & Resource Coordination Platform. Owns the
authoritative data model, REST API, allocation engine, and real-time
event emission.

---

## Status

| Area | Status |
|---|---|
| Models (Incident, Team, Shelter, Supply, Alert) | ✅ Done |
| REST API (incidents, teams, shelters, supplies, alerts, dashboard) | ✅ Done |
| Allocation engine (Haversine + weighted score) | ✅ Done |
| Socket.IO event emission | ✅ Done |
| Sample data + seed script | ✅ Done |
| Tests (31 tests, pytest) | ✅ All passing |
| Photo upload (multipart/form-data) | ✅ Done |
| Weather alert ingestion hook (`alert_service.ingest_normalized_alerts`) | ✅ Ready — awaiting Developer 3's adapter |

_Update this table as work progresses. This is the live status README referenced by section 3 of the master prompt._

---

## Setup

```bash
cd backend
python3 -m venv venv          # optional but recommended
source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env          # edit values if needed; never commit .env
python seed.py                # populates database/disaster.db with sample data
python app.py                 # starts the API + Socket.IO server on :5000
```

Health check: `GET http://localhost:5000/api/health` → `{"status": "ok"}`

## Running tests

```bash
cd backend
python -m pytest tests/ -v
```

All 31 tests should pass. Coverage includes:
- `test_incidents.py` — incident CRUD + validation
- `test_allocation.py` — Haversine distance properties + allocation engine ranking
- `test_resources.py` — teams/shelters/supplies CRUD + shelter capacity invariants
- `test_alerts.py` — alert CRUD + dashboard aggregation endpoints

---

## Project layout

```
backend/
├── app.py                  # app factory + entrypoint
├── config.py                # env-driven configuration
├── extensions.py            # shared SocketIO instance + typed emit_* helpers
├── seed.py                  # loads data/*.csv (+ integrations/weather/sample_alerts.json) into the DB
├── requirements.txt
├── .env.example
├── database/                 # disaster.db lives here (gitignored)
├── models/                   # SQLAlchemy models + shared enum constants
├── routes/                   # Flask blueprints (one per resource)
├── services/                 # validation + business logic, incl. allocation_service.py
├── data/                     # sample CSVs used by seed.py
└── tests/                    # pytest suite
```

---

## API summary

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | Liveness check |
| POST | `/api/incidents` | Create incident (JSON or multipart with `photo`) |
| GET | `/api/incidents` | List incidents (filter by `status`, `severity`, `incident_type`) |
| GET | `/api/incidents/<id>` | Get one incident |
| PUT | `/api/incidents/<id>` | Update incident |
| POST | `/api/incidents/<id>/recommend-resource` | Run allocation engine, return ranked candidates |
| POST | `/api/incidents/<id>/allocate` | Confirm allocation (`{"resource_id": <team_id>}`) — human-triggered only |
| GET/POST/PUT | `/api/teams[/<id>]` | Rescue team CRUD |
| GET/POST/PUT | `/api/shelters[/<id>]` | Shelter CRUD |
| GET/POST/PUT | `/api/supplies[/<id>]` | Supply center CRUD |
| GET/PUT | `/api/alerts[/<id>]` | Weather/official alert read + status update |
| GET | `/api/dashboard/stats` | Aggregate counts for KPI cards |
| GET | `/api/dashboard/map-data` | Bundled incidents/teams/shelters/supplies/alerts/heatmap for the map |

Full field-level contracts (models, enums, request/response shapes) are
defined in the master prompt document, sections 10–13 and 19.

## Socket.IO events emitted

`new_incident`, `incident_updated`, `team_assigned`, `team_status_changed`,
`shelter_updated`, `supply_updated`, `weather_alert` — payload shapes match
`integrations/socket/event_contracts.md` (owned by Developer 3).

## Allocation engine

`services/allocation_service.py` implements the 10-step deterministic
process from the master prompt: filters by availability and suitability
(`models/__init__.py: INCIDENT_TO_TEAM_TYPE`), computes Haversine
distance (`services/geo_utils.py`), and scores candidates as:

```
score = 0.40 * proximity + 0.20 * availability + 0.15 * capacity + 0.25 * incident_priority
```

The engine only recommends — `POST /api/incidents/<id>/allocate` is the
sole write path, and it requires an explicit `resource_id` chosen by a
human authority.

## Notes for Developer 2 (frontend) and Developer 3 (integrations)

- Do not modify anything under `backend/` — read-only if you need to
  understand a contract. File a change request per the no-overlap rule
  in the master prompt (section 8) if something needs to change here.
- CORS origins are configured via `CORS_ORIGINS` in `.env` — add your
  dev server's origin there if requests are being blocked.
- The weather alert *ingestion* hook is `services/alert_service.py:
  ingest_normalized_alerts(list_of_normalized_alert_dicts)`. Developer
  3's `integrations/weather/weather_adapter.py` should call this (or an
  endpoint wrapping it) once it produces a normalized alert list — not
  write to the `alerts` table directly.

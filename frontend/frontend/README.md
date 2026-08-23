# Frontend — disaster-response-platform

**Branch:** `dev/frontend`
**Owned directory:** `frontend/` (this directory only — see repo-root `README.md` for the no-overlap rule)

## Developer

Name: Developer 2 (AI-assisted build)
Branch: `dev/frontend`

## Current Status

🔵 IN PROGRESS

## Overall Progress

Frontend Progress: ~70% (Priority 1 MUST HAVE items implemented; Priority 2/3 items partial or stubbed — see below)

## Completed

- [x] Vite + React + TypeScript setup
- [x] Tailwind CSS setup
- [x] Routing (citizen flow + authority command flow)
- [x] Citizen incident report form (type, severity, description, GPS, optional photo)
- [x] GPS capture with permission-denied / unavailable / manual-entry fallback
- [x] Client-side photo compression before upload
- [x] Report submission via `POST /api/incidents` (JSON or multipart)
- [x] Report confirmation screen (incident id + status)
- [x] Authority dashboard: `GET /api/dashboard/stats` + incident feed (`GET /api/incidents`)
- [x] Disaster map (Leaflet + OpenStreetMap) using `GET /api/dashboard/map-data`
- [x] Incident / team / shelter / supply / alert markers with severity/status colors
- [x] Optional heatmap layer (severity-weighted, toggleable)
- [x] Rescue team panel (`GET /api/teams`, status filter)
- [x] Shelter panel with capacity bars (`GET /api/shelters`)
- [x] Supply center panel (`GET /api/supplies`)
- [x] Alerts panel (`GET /api/alerts`)
- [x] Incident detail page: resource recommendation (`POST /api/incidents/<id>/recommend-resource`)
- [x] Human-in-the-loop allocation with explicit confirm dialog (`POST /api/incidents/<id>/allocate`)
- [x] Socket.IO client wired to all 7 backend events (`new_incident`, `incident_updated`,
      `team_assigned`, `team_status_changed`, `shelter_updated`, `supply_updated`, `weather_alert`)
- [x] Connection status indicator (browser online/offline + socket connect state)
- [x] Basic offline queue for citizen reports (localStorage-based, auto-retries on reconnect)
- [x] Loading / error / empty states on every API-driven view
- [x] TypeScript types for all backend resources + socket payloads
- [x] Axios API client, base URL from `VITE_API_BASE_URL` (never hardcoded)
- [x] Unit tests (Vitest + Testing Library) for badges, formatting utils, and form validation logic

## Currently Working On

- Polish pass on responsive layout for the authority dashboard on tablet widths.

## Next Tasks

- [ ] SMS / IVR simulator UI — **blocked**, see "Known Problems" below.
- [ ] DBSCAN cluster visualization — intentionally deferred (Nice to Have, backend does not compute clusters).
- [ ] Road-based routing on the map — Nice to Have, not started.
- [ ] E2E/integration test pass once a live backend instance is available for local testing.

## UI Status

All Priority 1 (MUST HAVE) pages are implemented and functional against the documented backend
contracts: Landing, Citizen Report + Success, Authority Overview, Map, Incident Detail
(recommend/allocate), Teams, Shelters, Supplies, Alerts.

## API Integration Status

| API | Used by | Status |
|---|---|---|
| `GET /api/health` | — (not surfaced in UI; available for ops checks) | Available, unused in UI |
| `POST /api/incidents` | Citizen report form | Integrated |
| `GET /api/incidents` | Dashboard feed | Integrated |
| `GET /api/incidents/<id>` | Incident detail | Integrated |
| `PUT /api/incidents/<id>` | Not yet exposed in UI (no status-change control built) | Not used yet |
| `POST /api/incidents/<id>/recommend-resource` | Incident detail | Integrated |
| `POST /api/incidents/<id>/allocate` | Incident detail | Integrated |
| `GET /api/teams` | Teams page | Integrated |
| `GET /api/teams/<id>` | Service exists, not yet called from a page | Not used yet |
| `POST /api/teams`, `PUT /api/teams/<id>` | Service exists (`updateTeam`), no admin UI built yet | Not used yet |
| `GET /api/shelters`, `PUT /api/shelters/<id>` | Shelters page (read), update service exists but no edit UI yet | Partially used |
| `GET /api/supplies`, `PUT /api/supplies/<id>` | Supplies page (read), update service exists but no edit UI yet | Partially used |
| `GET /api/alerts`, `PUT /api/alerts/<id>` | Alerts page (read), update service exists but no edit UI yet | Partially used |
| `GET /api/dashboard/stats` | Dashboard overview | Integrated |
| `GET /api/dashboard/map-data` | Map view | Integrated |

## Socket Event Status

All 7 events emitted by `backend/extensions.py` are wired up and update the UI without a page
refresh: `new_incident`, `incident_updated`, `team_assigned`, `team_status_changed`,
`shelter_updated`, `supply_updated`, `weather_alert`.

## Dependencies Required From Other Developers

1. **Backend (Developer 1):** There is currently no route to serve uploaded incident photos
   back to the client (`UPLOAD_FOLDER` is not registered as a static/served path in `app.py`).
   The incident detail page currently shows a note instead of an image when a photo was
   attached. Please expose something like `GET /uploads/<filename>` (or return an absolute URL
   in `Incident.to_dict()`), and the frontend will render it.
2. **Integrations (Developer 3):** No socket event-contract doc, weather adapter, offline-sync
   service, SMS simulator, or IVR simulator were available in `Integrations/` at the time this
   was built — only two copies of `sample_alerts.json`. The socket payload shapes used here were
   inferred directly from `backend/extensions.py`'s `emit_*` call sites. SMS/IVR UI has not been
   built since there is nothing to integrate with yet; the offline queue for citizen reports is a
   self-contained frontend implementation (localStorage) rather than a shared integration, and
   should be treated as a placeholder if a real offline-sync mechanism is added later.

## Requests To Other Developers

- Developer 1: please confirm the intended way to retrieve uploaded incident photos (see above).
- Developer 3: please publish `integrations/socket/event_contracts.md` and clarify whether a
  weather adapter / offline-sync / SMS / IVR simulator will be added, so the corresponding UI can
  be un-stubbed.

## Recent Changes

- Initial frontend build: full Priority 1 MVP (citizen reporting, authority dashboard, map,
  resources, recommendation + allocation, real-time updates) plus a self-contained offline queue
  and basic test coverage.

## Known Problems

- Uploaded incident photos cannot be previewed after submission (backend gap, see above).
- SMS and IVR simulators are not implemented — no corresponding backend/integration exists yet.
- `seed.py` (backend) looks for `../integrations/weather/sample_alerts.json` (lowercase), but the
  actual folder in this repo is `Integrations/` (capitalized). Not a frontend issue, but flagged
  here since it affects whether sample alerts appear when demoing.
- The offline queue does not persist an attached photo — a report queued while offline will be
  submitted without its photo when connectivity returns.

## Integration Readiness

Backend → Frontend: **PARTIAL** — all documented, implemented backend endpoints are integrated;
blocked only on the photo-serving gap above.
Frontend → Integrations: **NO** — no integration layer exists yet to connect to (Socket.IO
events are consumed directly from the backend, not via `Integrations/`).

## Ready For Merge

NO — pending your review, `npm install` + local run against a live backend, and resolution of the
photo-serving dependency above.

## Setup

```bash
cd frontend
npm install
cp .env.example .env      # point VITE_API_BASE_URL / VITE_SOCKET_URL at your backend
npm run dev                # starts Vite dev server on :5173
```

## Running tests

```bash
cd frontend
npm run test
```

## Project layout

```
frontend/
├── src/
│   ├── components/   # common/, incidents/, map/, resources/, shelters/, supplies/, alerts/, dashboard/
│   ├── pages/         # one file per route
│   ├── layouts/        # CitizenLayout, AuthorityLayout
│   ├── services/        # axios API client + one module per resource
│   ├── sockets/          # Socket.IO client wrapper
│   ├── hooks/             # useGeolocation, useOnlineStatus, useSocket, useOfflineQueueFlush
│   ├── types/              # TypeScript types mirroring backend models + socket payloads
│   ├── utils/               # severity/status formatting, image compression, offline queue
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── .env.example
```

# 🚨 AapdaSetu

> **Repository overview:** This README explains what AapdaSetu is, how the system works, its architecture, technology stack, project organization, development ownership, and current status. It is intended for anyone visiting or evaluating the repository.


## Real-Time Disaster Early-Warning & Resource Coordination Platform

> **Bridging the gap between disaster information and disaster response.**

---

## 📌 Project Overview

**AapdaSetu** is a real-time disaster management and emergency resource coordination platform designed to improve how disaster-related information is collected, visualized, and acted upon.

During disasters such as floods, cyclones, landslides, fires, road blockages, and medical emergencies, authorities often receive information from multiple disconnected sources.

These sources may include:

- Citizens
- Weather and disaster alert systems
- Rescue teams
- Shelters
- Relief-supply centers
- Local administration
- Emergency response organizations

The problem is not always the lack of information.

The bigger problem is:

> **How quickly can all this information be brought together and converted into an actionable response?**

AapdaSetu provides a unified platform where:

```text
Citizen reports an incident
        ↓
Location + severity + description + photo
        ↓
Backend receives and stores the report
        ↓
Authority dashboard receives the report in real time
        ↓
Incident appears on the live map
        ↓
System checks available resources
        ↓
Resources are ranked based on suitability
        ↓
Best resource is recommended
        ↓
Authority reviews the recommendation
        ↓
Authority approves allocation
        ↓
Resource status is updated
        ↓
Dashboard updates in real time
```

AapdaSetu is designed as a **decision-support platform**.

It assists authorities in making faster and more informed decisions but does **not automatically dispatch real emergency resources**.

---

# 🎯 Problem Statement

## PS-05 — Real-Time Disaster Early-Warning & Resource Coordination Platform

**Category:** Software  
**Theme:** Disaster Management

During floods, cyclones, landslides and other disasters, delayed information flow between citizens, emergency response teams, NDRF/local rescue teams, shelters, relief organizations, local administration and disaster management authorities can result in:

- Delayed rescue operations
- Poor resource allocation
- Resources being sent to unsuitable locations
- Lack of visibility into available rescue teams
- Lack of shelter-capacity information
- Uneven distribution of relief supplies
- Important citizen reports being missed
- Difficulty identifying areas with high incident concentration
- Poor communication in low-internet areas

AapdaSetu creates a **single real-time coordination layer** connecting disaster incidents with available emergency resources.

---

# ❓ Why Does This Problem Matter?

During a disaster:

> **Time is one of the most important resources.**

For example:

```text
Team A → 2 km away → AVAILABLE
Team B → 1 km away → BUSY
Team C → 5 km away → AVAILABLE
Team D → 3 km away → AVAILABLE
```

Simply choosing the closest team would be incorrect because Team B is already busy.

Authorities need to consider:

- Distance
- Availability
- Team type
- Capacity
- Incident severity
- Current assignments

AapdaSetu brings these factors together into one decision-support workflow.

---

# 💡 Proposed Solution

## 1. Citizen Reporting

Citizens can report an emergency by providing:

- Incident type
- Severity
- Description
- GPS location
- Optional photograph

## 2. Authority Command Dashboard

Authorities receive:

- Live incident map
- Incident list
- Critical incident count
- Rescue-team availability
- Shelter capacity
- Relief-supply status
- Weather/disaster alerts
- Incident heatmap
- Resource allocation recommendations

## 3. Resource Coordination

The system maintains:

- Rescue teams
- Shelters
- Supply centers
- Locations
- Availability
- Capacity
- Current assignments

## 4. Intelligent Resource Recommendation

Example:

```text
Incident:
FLOOD
Severity: CRITICAL
Location: 20.2961, 85.8245

Available Resources:

Team 01 → 7.2 km → AVAILABLE
Team 02 → 2.1 km → AVAILABLE
Team 03 → 3.5 km → BUSY
Team 04 → 5.8 km → AVAILABLE
```

Possible recommendation:

```text
Recommended Resource:
Team 02

Distance:
2.1 km

Score:
91 / 100

Reason:
Nearest suitable available team with adequate response capacity.
```

The authority makes the final decision.

---

# 🔄 Core System Workflow

```text
                         CITIZEN
                            │
                            ▼
                  Submit Disaster Report
                            │
             ┌──────────────┴──────────────┐
             │                             │
          GPS Location                 Incident Data
             │                             │
             └──────────────┬──────────────┘
                            │
                            ▼
                     FRONTEND APP
                            │
                            ▼
                      BACKEND API
                            │
                            ▼
                       VALIDATION
                            │
                            ▼
                        DATABASE
                            │
                            ▼
                   REAL-TIME EVENT
                            │
                            ▼
                AUTHORITY DASHBOARD
                            │
              ┌─────────────┴─────────────┐
              │                           │
              ▼                           ▼
        Incident Map                 Incident Feed
              │
              ▼
       ALLOCATION ENGINE
              │
              ▼
      Available Resources
              │
              ▼
   Distance + Availability
   + Capacity + Suitability
   + Incident Severity
              │
              ▼
        Recommendation
              │
              ▼
       HUMAN AUTHORITY
          APPROVAL
              │
              ▼
      RESOURCE ASSIGNED
              │
              ▼
       STATUS UPDATED
              │
              ▼
      REAL-TIME DASHBOARD
```

---

# ⭐ What Makes AapdaSetu Different?

AapdaSetu is not just a disaster map.

A normal dashboard might only show:

```text
🔴 Flood
🔴 Flood
🟠 Landslide
🔴 Flood
```

AapdaSetu goes one step further:

```text
Incident
   ↓
Understand severity
   ↓
Find available resources
   ↓
Calculate distance
   ↓
Check resource suitability
   ↓
Check capacity
   ↓
Rank resources
   ↓
Recommend best resource
   ↓
Authority approval
   ↓
Resource allocation
   ↓
Real-time status tracking
```

The core idea is:

> **Incident → Decision → Resource → Response**

---

# 🏛️ Public Benefit

AapdaSetu is designed to provide:

### Faster Emergency Reporting
Citizens can report emergencies directly with their location.

### Faster Information Flow
Authorities can receive reports without waiting for manual information transfer.

### Better Resource Allocation
The system can identify nearby available resources.

### Better Situational Awareness
Authorities can see incidents, alerts and resources on one map.

### Better Shelter Management
Authorities can monitor shelter capacity.

### Better Relief Coordination
Authorities can monitor basic supply availability.

### Connectivity Resilience
Offline, SMS and IVR concepts provide fallback mechanisms for poor-connectivity areas.

### Human-Centered Decision Making
The system recommends resources while keeping final control with trained authorities.

---

# 🧑‍💻 Technology Stack

## Frontend

| Technology | Purpose |
|---|---|
| React | User interface |
| Vite | Frontend development/build tool |
| TypeScript | Type-safe frontend development |
| Tailwind CSS | UI styling |
| Axios | REST API communication |
| Leaflet | Interactive maps |
| React-Leaflet | React integration for Leaflet |
| Socket.IO Client | Real-time updates |

## Backend

| Technology | Purpose |
|---|---|
| Python | Backend programming |
| Flask | REST API framework |
| Flask-SQLAlchemy | Database ORM |
| Flask-CORS | Frontend/backend communication |
| Flask-SocketIO | Real-time communication |
| Requests | External API communication |
| python-dotenv | Environment variables |
| NumPy | Numerical calculations |
| pytest | Backend testing |

## Database

### SQLite

SQLite will be used for the hackathon MVP.

It stores:

- Incidents
- Rescue teams
- Shelters
- Supplies
- Alerts

PostgreSQL/PostGIS can be considered later for production.

## Mapping

### Leaflet + OpenStreetMap

The map will display:

- Disaster incidents
- Rescue teams
- Shelters
- Supply centers
- Weather alerts
- Heatmaps
- Optional resource routes

A 2D map is sufficient for the MVP.

## Real-Time Communication

### Flask-SocketIO + Socket.IO Client

```text
Citizen submits report
        ↓
Backend stores report
        ↓
Socket.IO event
        ↓
Authority dashboard
        ↓
New incident appears immediately
```

---

# 🗄️ Database Structure

## Incident

```text
id
reporter_name
phone
incident_type
description
latitude
longitude
severity
photo_path
status
created_at
updated_at
```

### Incident Types

```text
FLOOD
LANDSLIDE
CYCLONE
FIRE
ROAD_BLOCK
MEDICAL
TRAPPED_PERSON
BUILDING_DAMAGE
OTHER
```

### Severity

```text
LOW
MEDIUM
HIGH
CRITICAL
```

### Incident Status

```text
REPORTED
VERIFIED
ASSIGNED
IN_PROGRESS
RESOLVED
REJECTED
```

## Rescue Team

```text
id
team_name
team_type
latitude
longitude
members
vehicle_type
status
current_assignment
```

### Team Status

```text
AVAILABLE
BUSY
EN_ROUTE
ON_SITE
OFFLINE
```

## Shelter

```text
id
name
latitude
longitude
capacity
occupied
available_capacity
status
contact
```

## Supply Center

```text
id
location
latitude
longitude
food_packets
water_units
medical_kits
blankets
status
```

## Disaster Alert

```text
id
alert_type
severity
message
latitude
longitude
source
start_time
end_time
status
created_at
```

---

# 🔌 REST API Structure

## Health

```http
GET /api/health
```

## Incidents

```http
POST /api/incidents
GET /api/incidents
GET /api/incidents/<id>
PUT /api/incidents/<id>
```

## Resource Allocation

```http
POST /api/incidents/<id>/recommend-resource
POST /api/incidents/<id>/allocate
```

## Rescue Teams

```http
GET /api/teams
GET /api/teams/<id>
POST /api/teams
PUT /api/teams/<id>
```

## Shelters

```http
GET /api/shelters
GET /api/shelters/<id>
POST /api/shelters
PUT /api/shelters/<id>
```

## Supplies

```http
GET /api/supplies
PUT /api/supplies/<id>
```

## Alerts

```http
GET /api/alerts
GET /api/alerts/<id>
PUT /api/alerts/<id>
```

## Dashboard

```http
GET /api/dashboard/stats
GET /api/dashboard/map-data
```

---

# ⚡ Real-Time Socket Events

```text
new_incident
incident_updated
team_assigned
team_status_changed
shelter_updated
supply_updated
weather_alert
```

Example:

```text
Citizen
   ↓
POST /api/incidents
   ↓
Backend
   ↓
Database
   ↓
new_incident
   ↓
Authority Dashboard
```

---

# 🧠 Resource Allocation Engine

The allocation engine evaluates:

- Distance
- Availability
- Suitability
- Capacity
- Incident severity
- Resource status

## Allocation Process

```text
Incident Received
        ↓
Determine Required Resource
        ↓
Find Available Resources
        ↓
Remove Busy/Offline Resources
        ↓
Check Resource Suitability
        ↓
Check Capacity
        ↓
Calculate Distance
        ↓
Calculate Score
        ↓
Rank Resources
        ↓
Return Recommendation
        ↓
Authority Approval
```

## Haversine Distance

The system calculates geographic distance between an incident and resource using the Haversine formula.

Example:

```text
Incident:
20.2961, 85.8245

Team:
20.3100, 85.8200

Distance:
~2.1 km
```

## Allocation Score

```text
Allocation Score =
40% Proximity
+
20% Availability
+
15% Capacity
+
25% Incident Priority
```

Incident priority:

```text
CRITICAL = 100
HIGH     = 75
MEDIUM   = 50
LOW      = 25
```

Example:

```json
{
  "incident_id": 124,
  "resource_id": 7,
  "resource_name": "Team-04",
  "distance_km": 2.1,
  "score": 91,
  "reason": "Nearest suitable available team with adequate capacity"
}
```

The algorithm should remain explainable, deterministic and easy for authorities to understand.

---

# 👤 Human-in-the-Loop

AapdaSetu must not automatically dispatch real emergency resources.

Correct workflow:

```text
Algorithm
    ↓
Recommendation
    ↓
Authority Review
    ↓
Authority Approval
    ↓
Resource Allocation
```

---

# 🌦️ Weather & Early Warning

The platform can integrate:

```text
HEAVY_RAIN
CYCLONE
STRONG_WIND
EXTREME_RAINFALL
FLOOD_WARNING
```

Normalized alert example:

```json
{
  "event_type": "HEAVY_RAIN",
  "severity": "HIGH",
  "district": "Puri",
  "latitude": 19.81,
  "longitude": 85.83,
  "description": "Heavy rainfall expected",
  "source": "official_feed"
}
```

External services must use an adapter.

If an external service fails:

```text
External API
     ↓
   FAILED
     ↓
Sample/Fallback Data
     ↓
Application continues
```

---

# 📡 Low-Bandwidth Support

The system should support:

- Image compression
- Small API payloads
- Cached information
- Offline incident queue
- Automatic retry
- Connection-status indicators
- SMS fallback
- IVR simulation

---

# 📱 SMS Fallback

Example:

```text
FLOOD,HIGH,20.2961,85.8245,PEOPLE TRAPPED
```

Converted into:

```json
{
  "incident_type": "FLOOD",
  "severity": "HIGH",
  "latitude": 20.2961,
  "longitude": 85.8245,
  "description": "PEOPLE TRAPPED"
}
```

For the hackathon MVP, an SMS simulator is sufficient.

---

# ☎️ IVR Fallback

```text
CALL
  ↓
Select Disaster Type
  ↓
Select Severity
  ↓
Provide Location
  ↓
Describe Emergency
  ↓
Create Incident
```

Real telecom infrastructure is outside the MVP scope.

---

# 🗺️ Map & Heatmap

The authority dashboard will display:

- 🔴 Critical incidents
- 🟠 High-severity incidents
- 🟡 Medium-severity incidents
- 🟢 Low-severity incidents
- Rescue teams
- Shelters
- Supply centers
- Weather alerts

## Heatmap

Suggested severity weights:

```text
LOW       = 0.25
MEDIUM    = 0.50
HIGH      = 0.75
CRITICAL  = 1.00
```

---

# 🧮 Optional DBSCAN

DBSCAN can optionally identify incident clusters.

```text
Incident 1 ─┐
Incident 2 ─┼── Cluster A
Incident 3 ─┘

Incident 4 ─┐
Incident 5 ─┼── Cluster B
Incident 6 ─┘
```

Clusters can provide:

- Cluster ID
- Incident count
- Average severity
- Dominant incident type
- Geographic center

DBSCAN is optional and must **not block the MVP**.

---

# 📂 Project Structure

```text
disaster-response-platform/
│
├── backend/
│   ├── README.md
│   ├── app.py
│   ├── config.py
│   ├── requirements.txt
│   ├── database/
│   │   └── disaster.db
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── data/
│   └── tests/
│
├── frontend/
│   ├── README.md
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── index.css
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── sockets/
│       ├── types/
│       └── utils/
│
├── integrations/
│   ├── README.md
│   ├── socket/
│   ├── weather/
│   ├── offline/
│   ├── sms/
│   └── ivr/
│
├── README.md
├── .gitignore
└── .env.example
```

---

# 👥 Three-Developer Architecture

The project is divided into three independent development areas.

## 👨‍💻 Developer 1 — Backend

**Branch:** `dev/backend`  
**Directory:** `backend/`

### Responsibilities

- Flask backend
- Database
- SQLAlchemy models
- REST APIs
- Validation
- Incident management
- Resource management
- Allocation engine
- Shelter management
- Supply management
- Alert management
- Backend testing
- `backend/README.md`

### Must NOT modify

```text
frontend/
integrations/
```

---

## 👨‍💻 Developer 2 — Frontend

**Branch:** `dev/frontend`  
**Directory:** `frontend/`

### Responsibilities

- React application
- Citizen reporting
- Authority dashboard
- Map
- Incident markers
- Resource markers
- Shelter visualization
- Supply visualization
- Heatmap
- Allocation UI
- Dashboard statistics
- Frontend API client
- Frontend testing
- `frontend/README.md`

### Must NOT modify

```text
backend/
integrations/
```

---

## 👨‍💻 Developer 3 — Integrations

**Branch:** `dev/integrations`  
**Directory:** `integrations/`

### Responsibilities

- Socket.IO event definitions
- Real-time integration
- Weather adapters
- Alert normalization
- Offline synchronization
- SMS parser
- SMS simulator
- IVR simulator
- Integration testing
- `integrations/README.md`

### Must NOT modify

```text
backend/
frontend/
```

---

# 🚫 No-Overlap Rule

> **Never modify another developer's directory.**

Developers communicate through:

- REST API contracts
- JSON structures
- Socket.IO event contracts
- Documentation
- GitHub issues/tasks

---

# 🌿 Git Branch Strategy

```text
                    main
                     │
          ┌──────────┼──────────┐
          │          │          │
          ▼          ▼          ▼
    dev/backend  dev/frontend  dev/integrations
```

`main` always represents the stable integrated version.

---

# 🔀 Merge Strategy

```text
dev/backend
      ↓
    main
      ↓
Run full tests
      ↓
dev/frontend
      ↓
    main
      ↓
Run full tests
      ↓
dev/integrations
      ↓
    main
      ↓
Run full system tests
```

Because each developer owns a separate directory, merge conflicts should be extremely unlikely.

If a conflict occurs:

> **Do not blindly overwrite another developer's work.**

---

# 📝 Git Commit Convention

### Features

```text
feat: add incident creation API
feat: implement allocation engine
feat: add authority dashboard
feat: add disaster map
feat: add weather alert adapter
```

### Bug Fixes

```text
fix: validate incident coordinates
fix: correct allocation score
fix: handle socket disconnect
```

### Tests

```text
test: add incident API tests
test: add allocation engine tests
```

### Documentation

```text
docs: update backend development status
docs: update API contract
```

Avoid:

```text
changes
final
updated
stuff
new code
working
```

---

# 📖 Live Developer README System

Each developer must maintain:

```text
backend/README.md
frontend/README.md
integrations/README.md
```

These are **live development-status documents**.

They must show:

- Completed work
- Current work
- Remaining work
- Blockers
- API status
- Dependencies
- Recent changes
- Integration readiness

---

# 🔵 Backend Live README

Location: `backend/README.md`

```text
# Backend Development Status

## Developer
Name:
Branch: dev/backend

## Current Status
🟢 COMPLETE / 🔵 IN PROGRESS / 🟡 PARTIAL / 🔴 BLOCKED / ⚪ NOT STARTED

## Overall Progress
Backend Progress: XX%

## Completed
- [x] Flask setup
- [x] Database
- [x] Models
- [ ] Incident API
- [ ] Team API
- [ ] Shelter API
- [ ] Supply API
- [ ] Alert API
- [ ] Allocation engine
- [ ] Dashboard APIs
- [ ] Tests

## Currently Working On
...

## Next Tasks
...

## API Status
...

## Database Status
...

## Tests
Tests written:
Tests passing:
Tests failing:

## Dependencies Required From Other Developers
...

## Requests To Other Developers
...

## Recent Changes
...

## Known Problems
...

## Integration Readiness
Backend → Frontend: YES / NO / PARTIAL
Backend → Integrations: YES / NO / PARTIAL

## Ready For Merge
YES / NO
```

---

# 🔵 Frontend Live README

Location: `frontend/README.md`

```text
# Frontend Development Status

## Developer
Name:
Branch: dev/frontend

## Current Status
🟢 COMPLETE / 🔵 IN PROGRESS / 🟡 PARTIAL / 🔴 BLOCKED / ⚪ NOT STARTED

## Overall Progress
Frontend Progress: XX%

## Completed
- [x] React/Vite setup
- [x] Tailwind
- [ ] Citizen report
- [ ] Authority dashboard
- [ ] Map
- [ ] Heatmap
- [ ] Resource panel
- [ ] Allocation UI
- [ ] Real-time UI
- [ ] Responsive design

## Currently Working On
...

## Next Tasks
...

## UI Status
...

## API Integration Status
...

## Socket Event Status
...

## Dependencies Required From Other Developers
...

## Requests To Other Developers
...

## Recent Changes
...

## Known Problems
...

## Integration Readiness
Backend: YES / NO / PARTIAL
Real-time: YES / NO / PARTIAL

## Ready For Merge
YES / NO
```

---

# 🔵 Integrations Live README

Location: `integrations/README.md`

```text
# Integrations Development Status

## Developer
Name:
Branch: dev/integrations

## Current Status
🟢 COMPLETE / 🔵 IN PROGRESS / 🟡 PARTIAL / 🔴 BLOCKED / ⚪ NOT STARTED

## Overall Progress
Integrations Progress: XX%

## Completed
- [x] Socket definitions
- [x] Weather adapter
- [ ] Live weather feed
- [ ] Weather fallback
- [ ] Offline queue
- [ ] Retry/sync
- [ ] SMS parser
- [ ] SMS simulator
- [ ] IVR simulator

## Currently Working On
...

## Next Tasks
...

## Socket.IO Status
...

## Weather Status
...

## SMS Status
...

## IVR Status
...

## Offline Status
...

## Dependencies Required From Other Developers
...

## Requests To Other Developers
...

## Recent Changes
...

## Known Problems
...

## Integration Readiness
Backend: YES / NO / PARTIAL
Frontend: YES / NO / PARTIAL

## Ready For Merge
YES / NO
```

---

# 📊 README Status Convention

```text
[ ] = Not Started
[~] = In Progress
[x] = Completed
[!] = Blocked
```

Status indicators:

```text
🟢 COMPLETE / READY
🔵 IN PROGRESS
🟡 PARTIAL / WAITING
🔴 BLOCKED
⚪ NOT STARTED
```

Example:

```text
Backend Progress: 72%
Frontend Progress: 61%
Integrations Progress: 45%
```

---

# 🔄 README Update Rules

A developer MUST update their README when:

1. A feature is started.
2. A feature is completed.
3. An API is completed.
4. An API contract changes.
5. A dependency is added.
6. A test is added.
7. A test fails.
8. A blocker appears.
9. A blocker is resolved.
10. A major integration milestone is completed.
11. A development session ends.
12. The branch becomes ready for merge.

---

# 🛑 Pre-Merge Checklist

```text
[ ] All changes are inside the owned directory.
[ ] Tests have been run.
[ ] Tests pass.
[ ] README is updated.
[ ] Progress percentage is updated.
[ ] Known limitations are documented.
[ ] Dependencies are documented.
[ ] API changes are documented.
[ ] Integration readiness is documented.
[ ] No secrets are committed.
[ ] No unnecessary files were changed.
[ ] Ready For Merge = YES
```

---

# 🧪 Testing Philosophy

Testing should happen continuously.

Each developer tests their own module.

After branches are merged, the integrated system is tested again.

---

# 🚀 MVP Priority

## MUST HAVE

```text
[ ] Backend
[ ] Database
[ ] Citizen reporting
[ ] GPS
[ ] Photo
[ ] Severity
[ ] Authority dashboard
[ ] Live map
[ ] Incident markers
[ ] Resource markers
[ ] Rescue team availability
[ ] Allocation engine
[ ] Haversine distance
[ ] Resource recommendation
[ ] Authority approval
[ ] Resource assignment
[ ] Real-time updates
[ ] Shelter capacity
[ ] Basic disaster/weather alerts
```

## SHOULD HAVE

```text
[ ] Heatmap
[ ] Offline queue
[ ] Image compression
[ ] SMS simulator
[ ] IVR simulator
[ ] Dashboard analytics
[ ] Supply optimization
```

## NICE TO HAVE

```text
[ ] DBSCAN
[ ] Predictive hotspots
[ ] Resource pre-positioning
[ ] Road routing
[ ] Multi-resource optimization
[ ] Advanced forecasting
[ ] Real SMS integration
[ ] Real IVR integration
```

Advanced features must never delay the MVP.

---

# 🎬 Final Hackathon Demo

The final demo should demonstrate one complete real-world scenario.

## Scenario

A severe flood occurs in the selected demonstration region.

### Step 1 — Citizen Report

Citizen selects:

```text
Incident:
FLOOD

Severity:
CRITICAL
```

Description:

```text
People are trapped inside houses.
```

The citizen:

- Allows GPS access
- Uploads a photograph
- Submits the report

### Step 2 — Backend

```text
Receives report
      ↓
Validates report
      ↓
Stores report
      ↓
Creates incident ID
      ↓
Emits real-time event
```

### Step 3 — Authority Dashboard

The dashboard immediately receives:

```text
NEW CRITICAL INCIDENT
```

without refreshing the page.

### Step 4 — Resource Search

```text
Team 01 → 7.2 km → AVAILABLE
Team 02 → 2.1 km → AVAILABLE
Team 03 → 3.5 km → BUSY
Team 04 → 5.8 km → AVAILABLE
```

Team 03 is excluded because it is busy.

### Step 5 — Recommendation

```text
TEAM 02

Distance:
2.1 km

Score:
91/100

Reason:
Nearest suitable available team with adequate capacity.
```

### Step 6 — Human Approval

Authority clicks:

```text
ALLOCATE TEAM
```

### Step 7 — Real-Time Update

```text
AVAILABLE
     ↓
ASSIGNED
     ↓
EN_ROUTE
```

### Step 8 — Incident Update

```text
REPORTED
     ↓
VERIFIED
     ↓
ASSIGNED
     ↓
IN_PROGRESS
```

### Step 9 — Additional Intelligence

Demonstrate:

- Incident heatmap
- Weather warning
- Shelter capacity
- Supply availability
- Optional SMS fallback

---

# 🏁 Definition of Done

```text
[ ] Backend starts successfully
[ ] Frontend starts successfully
[ ] Database initializes
[ ] Citizen can create an incident
[ ] GPS location is captured
[ ] Photo can be uploaded
[ ] Backend stores the incident
[ ] Authority receives incident in real time
[ ] Incident appears on map
[ ] Incident appears in feed
[ ] Severity is visible
[ ] Resources are displayed
[ ] Resource availability is tracked
[ ] Allocation algorithm works
[ ] Haversine distance works
[ ] Suitable resources are ranked
[ ] Recommendation includes explanation
[ ] Authority can approve allocation
[ ] Resource status changes
[ ] Dashboard updates in real time
[ ] Shelter capacity is visible
[ ] Weather alert is visible
[ ] Fallback data works
[ ] Error handling works
[ ] Backend tests pass
[ ] Integration tests pass
[ ] No secrets are committed
[ ] Developer READMEs are updated
[ ] All branches are merge-ready
[ ] Complete demo works end-to-end
```

---

# 🌍 Long-Term Vision

Future versions could include:

- AI-based disaster prediction
- Satellite imagery
- Advanced weather forecasting
- Road-network optimization
- Drone integration
- IoT flood sensors
- Government emergency systems
- Real SMS gateways
- Real IVR systems
- Multi-agency coordination
- Historical disaster analytics
- Predictive resource positioning
- Automated hotspot detection

The hackathon MVP focuses on building the foundation for these capabilities.

---

# 🧠 Project Vision

```text
EARLY WARNINGS
       +
CITIZEN REPORTS
       +
REAL-TIME LOCATION
       +
RESOURCE AVAILABILITY
       +
INTELLIGENT ANALYSIS
       +
HUMAN DECISION-MAKING
       ↓
FASTER & BETTER DISASTER RESPONSE
```

AapdaSetu is not just a disaster map.

It is a **coordination layer between information and action**.

---

# 💬 One-Line Project Explanation

> **AapdaSetu is a real-time disaster coordination platform that connects citizen emergency reports with authorities and available rescue resources, using live maps, alerts and an explainable resource-allocation engine to help authorities respond faster.**

---

# ❤️ Final Goal

> **When an emergency happens, the right information should reach the right authority, and the right resource should reach the right location as quickly as possible.**

---

# 👥 Development Team

| Developer | Role | Branch | Directory |
|---|---|---|---|
| Developer 1 | Backend | `dev/backend` | `backend/` |
| Developer 2 | Frontend | `dev/frontend` | `frontend/` |
| Developer 3 | Integrations | `dev/integrations` | `integrations/` |

---

# 📌 Current Project Status

> Update this section as the project progresses.

| Module | Developer | Branch | Status | Progress |
|---|---|---|---|---:|
| Backend | Developer 1 | `dev/backend` | ⚪ Not Started | 0% |
| Frontend | Developer 2 | `dev/frontend` | ⚪ Not Started | 0% |
| Integrations | Developer 3 | `dev/integrations` | ⚪ Not Started | 0% |
| Integration | Project Lead | `main` | ⚪ Not Started | 0% |

### Current Blockers

```text
None
```

### Latest Integration Test

```text
Not Started
```

### Last Updated

```text
YYYY-MM-DD
```

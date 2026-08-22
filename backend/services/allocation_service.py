"""
Allocation engine.

Deterministic, explainable resource-recommendation logic. Given an
incident and the pool of rescue teams, produces a ranked list of
candidate teams with a transparent score breakdown. The engine never
allocates on its own — it only recommends; a human authority must call
POST /api/incidents/<id>/allocate to confirm.
"""

from models import INCIDENT_TO_TEAM_TYPE, SEVERITY_PRIORITY
from services.geo_utils import haversine_distance_km

# Weights for the final allocation score. Must sum to 1.0.
WEIGHT_PROXIMITY = 0.40
WEIGHT_AVAILABILITY = 0.20
WEIGHT_CAPACITY = 0.15
WEIGHT_PRIORITY = 0.25

# Proximity score decays to 0 at this distance (km). Tune per demo region.
MAX_RELEVANT_DISTANCE_KM = 25.0

# A team is considered "adequate capacity" once it has at least this many
# members; scaled linearly up to a cap for the capacity sub-score.
CAPACITY_REFERENCE_MEMBERS = 6


def _suitable_team_types(incident_type: str) -> set:
    return INCIDENT_TO_TEAM_TYPE.get(incident_type, {"GENERAL_RESCUE"})


def _proximity_score(distance_km: float) -> float:
    """Linear decay from 100 (0 km) to 0 (>= MAX_RELEVANT_DISTANCE_KM)."""
    if distance_km <= 0:
        return 100.0
    if distance_km >= MAX_RELEVANT_DISTANCE_KM:
        return 0.0
    return 100.0 * (1 - (distance_km / MAX_RELEVANT_DISTANCE_KM))


def _availability_score(status: str) -> float:
    # Only AVAILABLE teams reach this point (filtered earlier), but keep
    # this explicit and extensible in case partially-available states
    # (e.g. returning-to-base) are introduced later.
    return 100.0 if status == "AVAILABLE" else 0.0


def _capacity_score(members: int) -> float:
    if members is None or members <= 0:
        return 0.0
    return min(100.0, 100.0 * (members / CAPACITY_REFERENCE_MEMBERS))


def _priority_score(severity: str) -> float:
    return float(SEVERITY_PRIORITY.get(severity, 25))


def recommend_resource(incident, teams):
    """
    Rank available teams for a given incident.

    Args:
        incident: an Incident model instance (or object with
            incident_type, latitude, longitude, severity attributes).
        teams: iterable of Team model instances (candidate pool — callers
            typically pass all teams; filtering happens here).

    Returns:
        dict with the top recommendation and the full ranked list, or
        a dict with "candidates": [] and an explanatory "reason" if no
        suitable team is available.
    """
    suitable_types = _suitable_team_types(incident.incident_type)

    # Step 2 + Step 3: only AVAILABLE and type-suitable teams.
    candidates = [
        t for t in teams if t.status == "AVAILABLE" and t.team_type in suitable_types
    ]

    # Step 4: verify capacity (must have at least one member).
    candidates = [t for t in candidates if (t.members or 0) > 0]

    if not candidates:
        return {
            "incident_id": incident.id,
            "candidates": [],
            "recommendation": None,
            "reason": "No available and suitable rescue team was found for this incident type.",
        }

    priority = _priority_score(incident.severity)
    scored = []

    for team in candidates:
        # Step 5: Haversine distance.
        distance_km = haversine_distance_km(
            incident.latitude, incident.longitude, team.latitude, team.longitude
        )

        # Step 6-8: sub-scores and weighted final score.
        proximity = _proximity_score(distance_km)
        availability = _availability_score(team.status)
        capacity = _capacity_score(team.members)

        score = (
            WEIGHT_PROXIMITY * proximity
            + WEIGHT_AVAILABILITY * availability
            + WEIGHT_CAPACITY * capacity
            + WEIGHT_PRIORITY * priority
        )

        scored.append(
            {
                "resource_id": team.id,
                "resource_name": team.team_name,
                "team_type": team.team_type,
                "distance_km": round(distance_km, 2),
                "proximity_score": round(proximity, 1),
                "availability_score": round(availability, 1),
                "capacity_score": round(capacity, 1),
                "priority_score": round(priority, 1),
                "score": round(score, 1),
            }
        )

    # Step 9: rank descending by score; ties broken by shorter distance.
    scored.sort(key=lambda c: (-c["score"], c["distance_km"]))

    top = scored[0]
    top["reason"] = (
        f"Nearest suitable available team ({top['distance_km']} km) with "
        f"adequate response capacity for a {incident.severity} severity "
        f"{incident.incident_type} incident."
    )

    return {
        "incident_id": incident.id,
        "recommendation": top,
        "candidates": scored,
    }

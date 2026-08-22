import pytest

from services.allocation_service import recommend_resource
from services.geo_utils import haversine_distance_km


class FakeIncident:
    def __init__(self, id, incident_type, severity, latitude, longitude):
        self.id = id
        self.incident_type = incident_type
        self.severity = severity
        self.latitude = latitude
        self.longitude = longitude


class FakeTeam:
    def __init__(self, id, team_name, team_type, latitude, longitude, members, status):
        self.id = id
        self.team_name = team_name
        self.team_type = team_type
        self.latitude = latitude
        self.longitude = longitude
        self.members = members
        self.status = status


# ---------------------------------------------------------------------------
# Haversine distance
# ---------------------------------------------------------------------------

def test_haversine_same_point_is_zero():
    d = haversine_distance_km(22.26, 84.85, 22.26, 84.85)
    assert d == pytest.approx(0.0, abs=1e-6)


def test_haversine_known_distance():
    # Roughly 2 km apart along latitude at this location.
    d = haversine_distance_km(22.2600, 84.8500, 22.2780, 84.8500)
    assert 1.5 < d < 2.5


def test_haversine_symmetric():
    d1 = haversine_distance_km(22.26, 84.85, 22.30, 84.90)
    d2 = haversine_distance_km(22.30, 84.90, 22.26, 84.85)
    assert d1 == pytest.approx(d2, abs=1e-9)


def test_haversine_no_invalid_output():
    d = haversine_distance_km(-90, -180, 90, 180)
    assert d == d  # not NaN
    assert d >= 0


# ---------------------------------------------------------------------------
# Allocation engine
# ---------------------------------------------------------------------------

def test_recommend_picks_nearest_suitable_available_team():
    incident = FakeIncident(1, "FLOOD", "CRITICAL", 22.2600, 84.8500)
    teams = [
        FakeTeam(1, "Team-Near", "FLOOD_RESCUE", 22.2610, 84.8510, 6, "AVAILABLE"),
        FakeTeam(2, "Team-Far", "FLOOD_RESCUE", 22.4000, 85.0000, 6, "AVAILABLE"),
    ]
    result = recommend_resource(incident, teams)
    assert result["recommendation"]["resource_id"] == 1


def test_recommend_ignores_busy_teams():
    incident = FakeIncident(1, "FLOOD", "HIGH", 22.2600, 84.8500)
    teams = [
        FakeTeam(1, "Team-Busy", "FLOOD_RESCUE", 22.2601, 84.8501, 6, "BUSY"),
        FakeTeam(2, "Team-Available", "FLOOD_RESCUE", 22.3000, 84.9000, 6, "AVAILABLE"),
    ]
    result = recommend_resource(incident, teams)
    assert result["recommendation"]["resource_id"] == 2


def test_recommend_ignores_unsuitable_type():
    incident = FakeIncident(1, "MEDICAL", "HIGH", 22.2600, 84.8500)
    teams = [
        FakeTeam(1, "Team-Fire", "FIRE", 22.2601, 84.8501, 6, "AVAILABLE"),
    ]
    result = recommend_resource(incident, teams)
    assert result["candidates"] == []
    assert result["recommendation"] is None


def test_recommend_no_candidates_returns_reason():
    incident = FakeIncident(1, "FIRE", "LOW", 22.2600, 84.8500)
    result = recommend_resource(incident, [])
    assert result["recommendation"] is None
    assert "reason" in result


def test_recommend_output_contains_explanation():
    incident = FakeIncident(1, "TRAPPED_PERSON", "CRITICAL", 22.2600, 84.8500)
    teams = [FakeTeam(1, "Team-04", "GENERAL_RESCUE", 22.2610, 84.8510, 8, "AVAILABLE")]
    result = recommend_resource(incident, teams)
    assert "reason" in result["recommendation"]
    assert result["recommendation"]["score"] > 0

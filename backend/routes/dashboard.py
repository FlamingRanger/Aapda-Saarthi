"""Aggregate dashboard endpoints: stats summary and map data bundle."""

from flask import Blueprint, jsonify

from models import SEVERITY_HEATMAP_WEIGHT
from models.alert import Alert
from models.incident import Incident
from models.shelter import Shelter
from models.supply import Supply
from models.team import Team

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/api/dashboard")


@dashboard_bp.get("/stats")
def stats():
    incidents = Incident.query.all()
    teams = Team.query.all()
    shelters = Shelter.query.all()
    supplies = Supply.query.all()

    active_statuses = {"REPORTED", "VERIFIED", "ASSIGNED", "IN_PROGRESS"}
    active_incidents = [i for i in incidents if i.status in active_statuses]
    critical_incidents = [i for i in active_incidents if i.severity == "CRITICAL"]

    severity_breakdown = {"LOW": 0, "MEDIUM": 0, "HIGH": 0, "CRITICAL": 0}
    for i in active_incidents:
        severity_breakdown[i.severity] = severity_breakdown.get(i.severity, 0) + 1

    type_breakdown = {}
    for i in active_incidents:
        type_breakdown[i.incident_type] = type_breakdown.get(i.incident_type, 0) + 1

    return (
        jsonify(
            {
                "total_incidents": len(incidents),
                "active_incidents": len(active_incidents),
                "critical_incidents": len(critical_incidents),
                "resolved_incidents": len([i for i in incidents if i.status == "RESOLVED"]),
                "severity_breakdown": severity_breakdown,
                "type_breakdown": type_breakdown,
                "teams_total": len(teams),
                "teams_available": len([t for t in teams if t.status == "AVAILABLE"]),
                "teams_busy": len([t for t in teams if t.status in ("BUSY", "EN_ROUTE", "ON_SITE")]),
                "shelters_total": len(shelters),
                "shelter_capacity_total": sum(s.capacity for s in shelters),
                "shelter_available_capacity": sum(s.available_capacity for s in shelters),
                "supply_centers_total": len(supplies),
                "active_alerts": Alert.query.filter_by(status="ACTIVE").count(),
            }
        ),
        200,
    )


@dashboard_bp.get("/map-data")
def map_data():
    incidents = Incident.query.all()
    teams = Team.query.all()
    shelters = Shelter.query.all()
    supplies = Supply.query.all()
    alerts = Alert.query.filter_by(status="ACTIVE").all()

    heatmap_points = [
        {
            "latitude": i.latitude,
            "longitude": i.longitude,
            "weight": SEVERITY_HEATMAP_WEIGHT.get(i.severity, 0.25),
        }
        for i in incidents
    ]

    return (
        jsonify(
            {
                "incidents": [i.to_dict() for i in incidents],
                "teams": [t.to_dict() for t in teams],
                "shelters": [s.to_dict() for s in shelters],
                "supplies": [s.to_dict() for s in supplies],
                "alerts": [a.to_dict() for a in alerts],
                "heatmap": heatmap_points,
            }
        ),
        200,
    )

"""
Incident endpoints: create, list, retrieve, update, plus the two
allocation endpoints (recommend-resource / allocate) since they are
scoped under a specific incident.
"""

from flask import Blueprint, current_app, jsonify, request

from extensions import (
    emit_incident_updated,
    emit_new_incident,
    emit_team_assigned,
    emit_team_status_changed,
)
from models import db
from models.incident import Incident
from models.team import Team
from services.allocation_service import recommend_resource
from services.incident_service import (
    ValidationError,
    create_incident,
    save_photo,
    update_incident,
    validate_incident_payload,
)

incidents_bp = Blueprint("incidents", __name__, url_prefix="/api/incidents")


def _incoming_payload():
    """Support both JSON and multipart/form-data (photo upload) bodies."""
    if request.content_type and "multipart/form-data" in request.content_type:
        return request.form.to_dict()
    return request.get_json(silent=True) or {}


@incidents_bp.post("")
def create():
    data = _incoming_payload()

    try:
        validate_incident_payload(data, partial=False)
    except ValidationError as exc:
        return jsonify({"error": str(exc)}), 400

    photo_path = None
    if "photo" in request.files:
        photo = request.files["photo"]
        if photo and photo.filename:
            try:
                photo_path = save_photo(
                    photo,
                    current_app.config["UPLOAD_FOLDER"],
                    current_app.config["ALLOWED_IMAGE_EXTENSIONS"],
                )
            except ValidationError as exc:
                return jsonify({"error": str(exc)}), 400

    incident = create_incident(data, photo_path=photo_path)
    emit_new_incident(incident.to_dict())

    return jsonify({"id": incident.id, "incident": incident.to_dict()}), 201


@incidents_bp.get("")
def list_incidents():
    status = request.args.get("status")
    severity = request.args.get("severity")
    incident_type = request.args.get("incident_type")

    query = Incident.query
    if status:
        query = query.filter_by(status=status)
    if severity:
        query = query.filter_by(severity=severity)
    if incident_type:
        query = query.filter_by(incident_type=incident_type)

    incidents = query.order_by(Incident.created_at.desc()).all()
    return jsonify([i.to_dict() for i in incidents]), 200


@incidents_bp.get("/<int:incident_id>")
def get_incident(incident_id):
    incident = Incident.query.get(incident_id)
    if not incident:
        return jsonify({"error": "Incident not found."}), 404
    return jsonify(incident.to_dict()), 200


@incidents_bp.put("/<int:incident_id>")
def update(incident_id):
    incident = Incident.query.get(incident_id)
    if not incident:
        return jsonify({"error": "Incident not found."}), 404

    data = _incoming_payload()

    try:
        validate_incident_payload(data, partial=True)
    except ValidationError as exc:
        return jsonify({"error": str(exc)}), 400

    incident = update_incident(incident, data)
    emit_incident_updated(incident.to_dict())

    return jsonify(incident.to_dict()), 200


@incidents_bp.post("/<int:incident_id>/recommend-resource")
def recommend(incident_id):
    incident = Incident.query.get(incident_id)
    if not incident:
        return jsonify({"error": "Incident not found."}), 404

    teams = Team.query.all()
    result = recommend_resource(incident, teams)

    return jsonify(result), 200


@incidents_bp.post("/<int:incident_id>/allocate")
def allocate(incident_id):
    incident = Incident.query.get(incident_id)
    if not incident:
        return jsonify({"error": "Incident not found."}), 404

    data = request.get_json(silent=True) or {}
    resource_id = data.get("resource_id")
    if not resource_id:
        return jsonify({"error": "'resource_id' is required."}), 400

    team = Team.query.get(resource_id)
    if not team:
        return jsonify({"error": "Team not found."}), 404

    if team.status != "AVAILABLE":
        return jsonify({"error": f"Team {team.id} is not AVAILABLE (status={team.status})."}), 409

    # This endpoint represents a human authority's confirmed decision —
    # the recommendation itself never writes to the database.
    team.status = "BUSY"
    team.current_assignment = incident.id
    incident.status = "ASSIGNED"

    db.session.commit()

    emit_team_status_changed(team.to_dict())
    emit_incident_updated(incident.to_dict())
    emit_team_assigned(
        {
            "incident_id": incident.id,
            "resource_id": team.id,
            "resource_name": team.team_name,
            "incident": incident.to_dict(),
            "team": team.to_dict(),
        }
    )

    return (
        jsonify(
            {
                "incident": incident.to_dict(),
                "team": team.to_dict(),
                "message": "Resource allocated and status propagated.",
            }
        ),
        200,
    )

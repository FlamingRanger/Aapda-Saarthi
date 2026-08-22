"""Rescue team endpoints."""

from flask import Blueprint, jsonify, request

from extensions import emit_team_status_changed
from models.team import Team
from services.incident_service import ValidationError
from services.resource_service import create_team, update_team, validate_team_payload

teams_bp = Blueprint("teams", __name__, url_prefix="/api/teams")


@teams_bp.get("")
def list_teams():
    status = request.args.get("status")
    team_type = request.args.get("team_type")

    query = Team.query
    if status:
        query = query.filter_by(status=status)
    if team_type:
        query = query.filter_by(team_type=team_type)

    teams = query.order_by(Team.id).all()
    return jsonify([t.to_dict() for t in teams]), 200


@teams_bp.get("/<int:team_id>")
def get_team(team_id):
    team = Team.query.get(team_id)
    if not team:
        return jsonify({"error": "Team not found."}), 404
    return jsonify(team.to_dict()), 200


@teams_bp.post("")
def create():
    data = request.get_json(silent=True) or {}
    try:
        validate_team_payload(data, partial=False)
    except ValidationError as exc:
        return jsonify({"error": str(exc)}), 400

    team = create_team(data)
    return jsonify(team.to_dict()), 201


@teams_bp.put("/<int:team_id>")
def update(team_id):
    team = Team.query.get(team_id)
    if not team:
        return jsonify({"error": "Team not found."}), 404

    data = request.get_json(silent=True) or {}
    try:
        validate_team_payload(data, partial=True)
    except ValidationError as exc:
        return jsonify({"error": str(exc)}), 400

    team = update_team(team, data)
    emit_team_status_changed(team.to_dict())

    return jsonify(team.to_dict()), 200

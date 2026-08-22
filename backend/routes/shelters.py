"""Shelter endpoints."""

from flask import Blueprint, jsonify, request

from extensions import emit_shelter_updated
from models.shelter import Shelter
from services.incident_service import ValidationError
from services.resource_service import create_shelter, update_shelter, validate_shelter_payload

shelters_bp = Blueprint("shelters", __name__, url_prefix="/api/shelters")


@shelters_bp.get("")
def list_shelters():
    status = request.args.get("status")
    query = Shelter.query
    if status:
        query = query.filter_by(status=status)
    shelters = query.order_by(Shelter.id).all()
    return jsonify([s.to_dict() for s in shelters]), 200


@shelters_bp.get("/<int:shelter_id>")
def get_shelter(shelter_id):
    shelter = Shelter.query.get(shelter_id)
    if not shelter:
        return jsonify({"error": "Shelter not found."}), 404
    return jsonify(shelter.to_dict()), 200


@shelters_bp.post("")
def create():
    data = request.get_json(silent=True) or {}
    try:
        validate_shelter_payload(data, partial=False)
    except ValidationError as exc:
        return jsonify({"error": str(exc)}), 400

    shelter = create_shelter(data)
    return jsonify(shelter.to_dict()), 201


@shelters_bp.put("/<int:shelter_id>")
def update(shelter_id):
    shelter = Shelter.query.get(shelter_id)
    if not shelter:
        return jsonify({"error": "Shelter not found."}), 404

    data = request.get_json(silent=True) or {}
    try:
        validate_shelter_payload(data, partial=True)
    except ValidationError as exc:
        return jsonify({"error": str(exc)}), 400

    shelter = update_shelter(shelter, data)
    emit_shelter_updated(shelter.to_dict())

    return jsonify(shelter.to_dict()), 200

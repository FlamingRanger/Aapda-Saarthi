"""Supply center endpoints."""

from flask import Blueprint, jsonify, request

from extensions import emit_supply_updated
from models.supply import Supply
from services.incident_service import ValidationError
from services.resource_service import create_supply, update_supply, validate_supply_payload

supplies_bp = Blueprint("supplies", __name__, url_prefix="/api/supplies")


@supplies_bp.get("")
def list_supplies():
    status = request.args.get("status")
    query = Supply.query
    if status:
        query = query.filter_by(status=status)
    supplies = query.order_by(Supply.id).all()
    return jsonify([s.to_dict() for s in supplies]), 200


@supplies_bp.get("/<int:supply_id>")
def get_supply(supply_id):
    supply = Supply.query.get(supply_id)
    if not supply:
        return jsonify({"error": "Supply center not found."}), 404
    return jsonify(supply.to_dict()), 200


@supplies_bp.post("")
def create():
    data = request.get_json(silent=True) or {}
    try:
        validate_supply_payload(data, partial=False)
    except ValidationError as exc:
        return jsonify({"error": str(exc)}), 400

    supply = create_supply(data)
    return jsonify(supply.to_dict()), 201


@supplies_bp.put("/<int:supply_id>")
def update(supply_id):
    supply = Supply.query.get(supply_id)
    if not supply:
        return jsonify({"error": "Supply center not found."}), 404

    data = request.get_json(silent=True) or {}
    try:
        validate_supply_payload(data, partial=True)
    except ValidationError as exc:
        return jsonify({"error": str(exc)}), 400

    supply = update_supply(supply, data)
    emit_supply_updated(supply.to_dict())

    return jsonify(supply.to_dict()), 200

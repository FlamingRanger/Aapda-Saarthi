"""Weather / official early-warning alert endpoints."""

from flask import Blueprint, jsonify, request

from extensions import emit_weather_alert
from models.alert import Alert
from services.alert_service import ValidationError, update_alert, validate_alert_payload

alerts_bp = Blueprint("alerts", __name__, url_prefix="/api/alerts")


@alerts_bp.get("")
def list_alerts():
    status = request.args.get("status")
    query = Alert.query
    if status:
        query = query.filter_by(status=status)
    alerts = query.order_by(Alert.created_at.desc()).all()
    return jsonify([a.to_dict() for a in alerts]), 200


@alerts_bp.get("/<int:alert_id>")
def get_alert(alert_id):
    alert = Alert.query.get(alert_id)
    if not alert:
        return jsonify({"error": "Alert not found."}), 404
    return jsonify(alert.to_dict()), 200


@alerts_bp.put("/<int:alert_id>")
def update(alert_id):
    alert = Alert.query.get(alert_id)
    if not alert:
        return jsonify({"error": "Alert not found."}), 404

    data = request.get_json(silent=True) or {}
    try:
        validate_alert_payload(data, partial=True)
    except ValidationError as exc:
        return jsonify({"error": str(exc)}), 400

    alert = update_alert(alert, data)
    emit_weather_alert(alert.to_dict())

    return jsonify(alert.to_dict()), 200

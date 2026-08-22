"""
Alert service.

Provides weather/official early-warning alerts. This module owns the
*persistence and query* side of alerts. The actual external-feed
adapter with sample-data fallback lives in integrations/weather/ and is
owned by Developer 3 — this service only exposes a `sync_from_adapter`
hook that the integrations layer (or a scheduled job) can call to push
normalized alerts into the database.
"""

from models import ALERT_STATUSES, ALERT_TYPES, SEVERITY_LEVELS, db
from models.alert import Alert
from services.incident_service import ValidationError


def validate_alert_payload(data: dict, partial: bool = False):
    required = ["alert_type", "severity", "message"]
    if not partial:
        for field in required:
            if data.get(field) in (None, ""):
                raise ValidationError(f"'{field}' is required.")

    if "alert_type" in data and data["alert_type"] not in (None, ""):
        if data["alert_type"] not in ALERT_TYPES:
            raise ValidationError(f"'alert_type' must be one of {sorted(ALERT_TYPES)}.")

    if "severity" in data and data["severity"] not in (None, ""):
        if data["severity"] not in SEVERITY_LEVELS:
            raise ValidationError(f"'severity' must be one of {sorted(SEVERITY_LEVELS)}.")

    if "status" in data and data["status"] not in (None, ""):
        if data["status"] not in ALERT_STATUSES:
            raise ValidationError(f"'status' must be one of {sorted(ALERT_STATUSES)}.")


def get_active_alerts():
    return Alert.query.filter_by(status="ACTIVE").order_by(Alert.created_at.desc()).all()


def update_alert(alert: Alert, data: dict) -> Alert:
    fields = ["alert_type", "severity", "message", "latitude", "longitude", "status"]
    for field in fields:
        if field in data and data[field] not in (None, ""):
            value = data[field]
            if field in ("latitude", "longitude"):
                value = float(value)
            setattr(alert, field, value)
    db.session.commit()
    return alert


def ingest_normalized_alerts(normalized_alerts: list) -> list:
    """
    Persist a batch of normalized alert dicts (as produced by
    integrations/weather/weather_adapter.py) that are not already
    stored (matched by alert_type + message + source).

    Returns the list of newly created Alert instances.
    """
    created = []
    for item in normalized_alerts:
        exists = Alert.query.filter_by(
            alert_type=item.get("alert_type"),
            message=item.get("message"),
            source=item.get("source", "SAMPLE"),
        ).first()
        if exists:
            continue

        alert = Alert(
            alert_type=item.get("alert_type"),
            severity=item.get("severity", "MEDIUM"),
            message=item.get("message", ""),
            latitude=item.get("latitude"),
            longitude=item.get("longitude"),
            source=item.get("source", "SAMPLE"),
            start_time=item.get("start_time"),
            end_time=item.get("end_time"),
            status=item.get("status", "ACTIVE"),
        )
        db.session.add(alert)
        created.append(alert)

    if created:
        db.session.commit()
    return created

"""Business logic for creating, validating, and updating incidents."""

import os
import uuid

from werkzeug.utils import secure_filename

from models import INCIDENT_STATUSES, INCIDENT_TYPES, SEVERITY_LEVELS, db
from models.incident import Incident
from services.geo_utils import is_valid_latitude, is_valid_longitude


class ValidationError(Exception):
    """Raised when incoming incident data fails validation."""


def validate_incident_payload(data: dict, partial: bool = False):
    """
    Validate incident fields.

    Args:
        data: raw dict of incoming fields (from JSON or multipart form).
        partial: if True, only validate fields that are present (used for
            PUT updates); if False, required fields must be present
            (used for POST creation).

    Raises:
        ValidationError: with a human-readable message describing the
        first problem found.
    """
    required = ["incident_type", "severity", "latitude", "longitude"]
    if not partial:
        for field in required:
            if data.get(field) in (None, ""):
                raise ValidationError(f"'{field}' is required.")

    if "incident_type" in data and data["incident_type"] not in (None, ""):
        if data["incident_type"] not in INCIDENT_TYPES:
            raise ValidationError(
                f"'incident_type' must be one of {sorted(INCIDENT_TYPES)}."
            )

    if "severity" in data and data["severity"] not in (None, ""):
        if data["severity"] not in SEVERITY_LEVELS:
            raise ValidationError(f"'severity' must be one of {sorted(SEVERITY_LEVELS)}.")

    if "status" in data and data["status"] not in (None, ""):
        if data["status"] not in INCIDENT_STATUSES:
            raise ValidationError(f"'status' must be one of {sorted(INCIDENT_STATUSES)}.")

    if "latitude" in data and data["latitude"] not in (None, ""):
        if not is_valid_latitude(data["latitude"]):
            raise ValidationError("'latitude' must be a number between -90 and 90.")

    if "longitude" in data and data["longitude"] not in (None, ""):
        if not is_valid_longitude(data["longitude"]):
            raise ValidationError("'longitude' must be a number between -180 and 180.")


def save_photo(file_storage, upload_folder: str, allowed_extensions: set) -> str:
    """
    Persist an uploaded photo to disk with a safe, unique filename.

    Returns the relative path (to be stored on Incident.photo_path).
    Raises ValidationError if the extension is not allowed.
    """
    filename = secure_filename(file_storage.filename or "")
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

    if ext not in allowed_extensions:
        raise ValidationError(
            f"Unsupported photo type '.{ext}'. Allowed: {sorted(allowed_extensions)}."
        )

    os.makedirs(upload_folder, exist_ok=True)
    unique_name = f"{uuid.uuid4().hex}.{ext}"
    full_path = os.path.join(upload_folder, unique_name)
    file_storage.save(full_path)

    return os.path.join("uploads", unique_name)


def create_incident(data: dict, photo_path: str = None) -> Incident:
    """Create and persist a new Incident from validated data."""
    incident = Incident(
        reporter_name=data.get("reporter_name"),
        phone=data.get("phone"),
        incident_type=data["incident_type"],
        description=data.get("description"),
        latitude=float(data["latitude"]),
        longitude=float(data["longitude"]),
        severity=data["severity"],
        photo_path=photo_path,
        status=data.get("status", "REPORTED"),
    )
    db.session.add(incident)
    db.session.commit()
    return incident


def update_incident(incident: Incident, data: dict) -> Incident:
    """Apply a partial update to an existing Incident."""
    updatable_fields = [
        "reporter_name",
        "phone",
        "incident_type",
        "description",
        "latitude",
        "longitude",
        "severity",
        "status",
    ]
    for field in updatable_fields:
        if field in data and data[field] not in (None, ""):
            value = data[field]
            if field in ("latitude", "longitude"):
                value = float(value)
            setattr(incident, field, value)

    db.session.commit()
    return incident

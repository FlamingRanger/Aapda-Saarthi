"""
sms_parser.py
-------------
Owner: Developer 3 (Integrations) — integrations/sms/

Purpose:
    Parses a low-bandwidth SMS-format citizen report and normalizes it
    into the exact same INCIDENT shape used everywhere else in the
    platform (root spec section 18, shared JSON contracts). This is the
    "citizen reports via SMS instead of the app" fallback channel — see
    root spec section 17.4 and section 23 (low-bandwidth design).

Expected raw SMS format (comma-separated, fixed field order):

    INCIDENT_TYPE,SEVERITY,LATITUDE,LONGITUDE,DESCRIPTION

    Example:
    FLOOD,HIGH,20.2961,85.8245,PEOPLE TRAPPED

    The DESCRIPTION field may itself contain commas (e.g. "PEOPLE
    TRAPPED, SEND HELP") — this parser only splits on the first 4
    commas and treats everything after as the description, so citizen
    phrasing isn't cut off.

Output shape (matches root spec section 18 INCIDENT contract, with two
additive fields the backend can choose to use or ignore):

    {
        "incident_type": "FLOOD",
        "severity": "HIGH",
        "latitude": 20.2961,
        "longitude": 85.8245,
        "description": "PEOPLE TRAPPED",
        "source": "sms",
        "reporter_phone": "+91XXXXXXXXXX"   # optional, from gateway metadata, not the body
    }

This module does NOT talk to the backend directly — see sms_simulator.py
for the demo flow that takes a parsed incident and POSTs it to
POST /api/incidents (the backend's existing, unmodified contract).
"""

from __future__ import annotations


# Mirrors backend's Incident model enums exactly (root spec section 10.1).
# Kept as a local copy rather than an import, per the strict no-overlap
# rule (root spec section 8) — integrations must not import backend
# internals. If backend's enum ever changes, this list needs a matching
# change request/update on this side.
ALLOWED_INCIDENT_TYPES = {
    "FLOOD",
    "LANDSLIDE",
    "CYCLONE",
    "FIRE",
    "ROAD_BLOCK",
    "MEDICAL",
    "TRAPPED_PERSON",
    "BUILDING_DAMAGE",
    "OTHER",
}

ALLOWED_SEVERITIES = {"LOW", "MEDIUM", "HIGH", "CRITICAL"}

EXPECTED_FIELD_COUNT = 5  # type, severity, lat, lon, description


class SMSParseError(ValueError):
    """Raised when a raw SMS body cannot be safely normalized into an incident."""


def parse_sms(raw_text: str, reporter_phone: str | None = None) -> dict:
    """
    Parses one raw SMS body into a normalized incident dict.

    Raises SMSParseError with a human-readable reason on any malformed
    input — callers (sms_simulator.py, or eventually a real gateway
    webhook) should catch this and surface/log the reason rather than
    silently dropping the report. Per root spec section 17.3/23: never
    lose a citizen report silently, even a malformed one — the caller
    is expected to at least log/queue the raw text for manual review
    when parsing fails.
    """
    if not raw_text or not raw_text.strip():
        raise SMSParseError("Empty SMS body")

    parts = raw_text.strip().split(",", EXPECTED_FIELD_COUNT - 1)

    if len(parts) < EXPECTED_FIELD_COUNT:
        raise SMSParseError(
            f"Expected {EXPECTED_FIELD_COUNT} comma-separated fields "
            f"(TYPE,SEVERITY,LAT,LON,DESCRIPTION), got {len(parts)}: {raw_text!r}"
        )

    incident_type_raw, severity_raw, lat_raw, lon_raw, description = parts

    incident_type = incident_type_raw.strip().upper()
    severity = severity_raw.strip().upper()
    description = description.strip()

    if incident_type not in ALLOWED_INCIDENT_TYPES:
        raise SMSParseError(
            f"Unknown incident type {incident_type_raw.strip()!r}, "
            f"expected one of {sorted(ALLOWED_INCIDENT_TYPES)}"
        )

    if severity not in ALLOWED_SEVERITIES:
        raise SMSParseError(
            f"Unknown severity {severity_raw.strip()!r}, "
            f"expected one of {sorted(ALLOWED_SEVERITIES)}"
        )

    try:
        latitude = float(lat_raw.strip())
        longitude = float(lon_raw.strip())
    except ValueError as exc:
        raise SMSParseError(f"Latitude/longitude must be numeric: {lat_raw!r}, {lon_raw!r}") from exc

    if not (-90 <= latitude <= 90):
        raise SMSParseError(f"Latitude out of range: {latitude}")
    if not (-180 <= longitude <= 180):
        raise SMSParseError(f"Longitude out of range: {longitude}")

    if not description:
        raise SMSParseError("Description field is empty")

    incident = {
        "incident_type": incident_type,
        "severity": severity,
        "latitude": latitude,
        "longitude": longitude,
        "description": description,
        "source": "sms",
    }

    if reporter_phone:
        incident["reporter_phone"] = reporter_phone

    return incident
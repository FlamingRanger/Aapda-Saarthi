"""
weather_adapter.py
------------------
Owner: Developer 3 (Integrations) — integrations/weather/

Purpose:
    Normalizes ANY external weather/official-alert provider's response shape
    into the single stable alert format the rest of the platform depends on.

    Nothing outside this file should need to know what a raw provider
    response looks like. If the live provider is swapped for a different
    one, only the corresponding adapter function in this file changes —
    weather_service.py, the backend, and the frontend are untouched.

Normalized alert shape (this is the contract — see
integrations/socket/event_contracts.md, event `weather_alert`, and root
spec section 10.5 / 17.2):

    {
        "id": str,                 # stable unique id for this alert
        "alert_type": str,         # one of ALLOWED_ALERT_TYPES
        "severity": str,           # one of ALLOWED_SEVERITIES
        "area": str,               # district / area name, human readable
        "latitude": float,
        "longitude": float,
        "description": str,
        "source": str,             # provider name, or "sample_fallback"
        "start_time": str,         # ISO 8601 UTC
        "end_time": str,           # ISO 8601 UTC
    }

Note on field naming vs. backend's Alert model (root spec 10.5):
    Backend's Alert model uses "message" for the human-readable text and
    "source"/"status" fields that this adapter does not set (status is a
    backend-owned lifecycle field, e.g. ACTIVE/EXPIRED). This adapter
    intentionally uses "description" to stay provider-agnostic; the
    backend integration point (see weather_service.py) is responsible
    for mapping "description" -> "message" when persisting to the
    Alert table. This mapping is called out explicitly so backend and
    integrations don't silently diverge on field names.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any


ALLOWED_ALERT_TYPES = {
    "HEAVY_RAIN",
    "CYCLONE",
    "STRONG_WIND",
    "EXTREME_RAINFALL",
    "FLOOD_WARNING",
}

ALLOWED_SEVERITIES = {"LOW", "MEDIUM", "HIGH", "CRITICAL"}


class AdapterValidationError(ValueError):
    """Raised when a raw provider payload cannot be normalized safely."""


def _require(condition: bool, message: str) -> None:
    if not condition:
        raise AdapterValidationError(message)


def _to_iso_utc(value: Any) -> str:
    """
    Best-effort conversion of a provider's timestamp representation into
    an ISO 8601 UTC string. Accepts already-ISO strings, epoch seconds,
    or datetime objects.
    """
    if isinstance(value, datetime):
        dt = value if value.tzinfo else value.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")

    if isinstance(value, (int, float)):
        dt = datetime.fromtimestamp(value, tz=timezone.utc)
        return dt.isoformat().replace("+00:00", "Z")

    if isinstance(value, str):
        # Assume caller already supplied a reasonable ISO-ish string.
        # We do not attempt exhaustive parsing here to keep the adapter
        # dependency-free; providers with exotic formats get their own
        # adapter function that pre-normalizes before calling validate().
        return value

    raise AdapterValidationError(f"Unrecognized timestamp value: {value!r}")


def normalize_generic(raw: dict) -> dict:
    """
    Normalizes a raw alert dict that ALREADY uses roughly the right field
    names (e.g. our own sample_alerts.json, or a provider we've mapped
    upstream) into the validated, guaranteed-shape normalized alert.

    This is the function sample_alerts.json flows through, and the
    function any new provider-specific adapter should call at the end
    of its own field-mapping step.
    """
    normalized = {
        "id": str(raw["id"]),
        "alert_type": raw["alert_type"],
        "severity": raw["severity"],
        "area": raw.get("area", "Unknown area"),
        "latitude": float(raw["latitude"]),
        "longitude": float(raw["longitude"]),
        "description": raw.get("description", ""),
        "source": raw.get("source", "unknown"),
        "start_time": _to_iso_utc(raw["start_time"]),
        "end_time": _to_iso_utc(raw["end_time"]),
    }
    validate(normalized)
    return normalized


def validate(alert: dict) -> None:
    """
    Guards against a malformed alert ever reaching the socket layer or
    the backend Alert table. Raises AdapterValidationError on failure —
    callers (weather_service.py) should catch this and skip the single
    bad alert rather than failing the entire fetch/fallback cycle.
    """
    _require(isinstance(alert.get("id"), str) and alert["id"], "alert.id must be a non-empty string")
    _require(alert.get("alert_type") in ALLOWED_ALERT_TYPES,
              f"alert_type must be one of {sorted(ALLOWED_ALERT_TYPES)}, got {alert.get('alert_type')!r}")
    _require(alert.get("severity") in ALLOWED_SEVERITIES,
              f"severity must be one of {sorted(ALLOWED_SEVERITIES)}, got {alert.get('severity')!r}")

    lat = alert.get("latitude")
    lon = alert.get("longitude")
    _require(isinstance(lat, (int, float)) and -90 <= lat <= 90, f"invalid latitude: {lat!r}")
    _require(isinstance(lon, (int, float)) and -180 <= lon <= 180, f"invalid longitude: {lon!r}")

    _require(isinstance(alert.get("description"), str), "description must be a string")
    _require(isinstance(alert.get("source"), str) and alert["source"], "source must be a non-empty string")
    _require(isinstance(alert.get("start_time"), str), "start_time must be an ISO 8601 string")
    _require(isinstance(alert.get("end_time"), str), "end_time must be an ISO 8601 string")


# ---------------------------------------------------------------------------
# Example of a provider-specific adapter. This is a PLACEHOLDER shape for
# whichever live provider is eventually wired in (e.g. a government IMD
# feed, or a commercial weather API). It exists to demonstrate the pattern:
# translate provider-specific keys -> normalize_generic()'s expected keys,
# then delegate to normalize_generic for validation.
#
# Nothing else in the codebase should call a provider's raw API shape
# directly. If/when a real provider is chosen, only this function (or a
# sibling one) needs to be written or swapped.
# ---------------------------------------------------------------------------

def normalize_example_provider(raw: dict) -> dict:
    """
    Placeholder mapping for a hypothetical provider payload shaped like:
        {
            "warning_id": "IMD-2026-0817",
            "type": "flood_warning",
            "severity_level": "critical",
            "district": "Puri",
            "lat": 19.81,
            "lon": 85.83,
            "text": "...",
            "issued_at": "2026-08-22T06:00:00Z",
            "valid_until": "2026-08-22T18:00:00Z",
        }
    This is illustrative only until a real provider is selected — see the
    open item at the bottom of this file.
    """
    type_map = {
        "flood_warning": "FLOOD_WARNING",
        "cyclone": "CYCLONE",
        "heavy_rain": "HEAVY_RAIN",
        "strong_wind": "STRONG_WIND",
        "extreme_rainfall": "EXTREME_RAINFALL",
    }
    severity_map = {
        "critical": "CRITICAL",
        "high": "HIGH",
        "medium": "MEDIUM",
        "low": "LOW",
    }

    mapped = {
        "id": raw["warning_id"],
        "alert_type": type_map.get(str(raw.get("type", "")).lower(), "HEAVY_RAIN"),
        "severity": severity_map.get(str(raw.get("severity_level", "")).lower(), "MEDIUM"),
        "area": raw.get("district", "Unknown area"),
        "latitude": raw["lat"],
        "longitude": raw["lon"],
        "description": raw.get("text", ""),
        "source": "example_provider",
        "start_time": raw["issued_at"],
        "end_time": raw["valid_until"],
    }
    return normalize_generic(mapped)


# ---------------------------------------------------------------------------
# OPEN ITEM: no live provider has been selected/confirmed yet. Until one
# is, weather_service.py relies entirely on sample_alerts.json via
# normalize_generic(). This is intentional per root spec section 6/17.2 —
# "External feeds must have adapters and fallback sample data. The demo
# must continue to function when an external service is unavailable" —
# and is NOT a blocker for the rest of the team.
# ---------------------------------------------------------------------------
"""
Models package.

Exposes a single shared SQLAlchemy `db` instance used by every model,
plus the enum-like constant sets used for validation across the app.
Import `db` from here (not from app.py) to avoid circular imports.
"""

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# ---------------------------------------------------------------------------
# Enum-like constants (SQLite has no native ENUM type, so we validate
# against these sets in the model layer / route layer instead).
# ---------------------------------------------------------------------------

INCIDENT_TYPES = {
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

SEVERITY_LEVELS = {"LOW", "MEDIUM", "HIGH", "CRITICAL"}

SEVERITY_PRIORITY = {"CRITICAL": 100, "HIGH": 75, "MEDIUM": 50, "LOW": 25}

SEVERITY_HEATMAP_WEIGHT = {"LOW": 0.25, "MEDIUM": 0.50, "HIGH": 0.75, "CRITICAL": 1.00}

INCIDENT_STATUSES = {
    "REPORTED",
    "VERIFIED",
    "ASSIGNED",
    "IN_PROGRESS",
    "RESOLVED",
    "REJECTED",
}

TEAM_STATUSES = {"AVAILABLE", "BUSY", "EN_ROUTE", "ON_SITE", "OFFLINE"}

TEAM_TYPES = {
    "FLOOD_RESCUE",
    "MEDICAL",
    "FIRE",
    "GENERAL_RESCUE",
    "ROAD_CLEARANCE",
    "LANDSLIDE_RESCUE",
}

SHELTER_STATUSES = {"OPEN", "FULL", "CLOSED"}

SUPPLY_STATUSES = {"AVAILABLE", "LOW", "DEPLETED"}

ALERT_TYPES = {
    "HEAVY_RAIN",
    "CYCLONE",
    "STRONG_WIND",
    "EXTREME_RAINFALL",
    "FLOOD_WARNING",
}

ALERT_STATUSES = {"ACTIVE", "EXPIRED", "CANCELLED"}

# Maps an incident type to the team type(s) considered suitable for it.
# Used by the allocation engine (services/allocation_service.py).
INCIDENT_TO_TEAM_TYPE = {
    "FLOOD": {"FLOOD_RESCUE", "GENERAL_RESCUE"},
    "TRAPPED_PERSON": {"FLOOD_RESCUE", "GENERAL_RESCUE", "LANDSLIDE_RESCUE"},
    "LANDSLIDE": {"LANDSLIDE_RESCUE", "GENERAL_RESCUE"},
    "CYCLONE": {"GENERAL_RESCUE", "FLOOD_RESCUE"},
    "FIRE": {"FIRE", "GENERAL_RESCUE"},
    "ROAD_BLOCK": {"ROAD_CLEARANCE", "GENERAL_RESCUE"},
    "MEDICAL": {"MEDICAL"},
    "BUILDING_DAMAGE": {"GENERAL_RESCUE", "FIRE"},
    "OTHER": {"GENERAL_RESCUE"},
}

# Import models so `db.create_all()` (called from app.py) can discover them
# via the shared metadata. Imported at the bottom to avoid circular imports.
from models.incident import Incident  # noqa: E402,F401
from models.team import Team  # noqa: E402,F401
from models.shelter import Shelter  # noqa: E402,F401
from models.supply import Supply  # noqa: E402,F401
from models.alert import Alert  # noqa: E402,F401

"""Business logic for rescue teams, shelters, and supply centers."""

from models import SHELTER_STATUSES, SUPPLY_STATUSES, TEAM_STATUSES, TEAM_TYPES, db
from models.shelter import Shelter
from models.supply import Supply
from models.team import Team
from services.geo_utils import is_valid_latitude, is_valid_longitude
from services.incident_service import ValidationError


# ---------------------------------------------------------------------------
# Teams
# ---------------------------------------------------------------------------

def validate_team_payload(data: dict, partial: bool = False):
    required = ["team_name", "team_type", "latitude", "longitude"]
    if not partial:
        for field in required:
            if data.get(field) in (None, ""):
                raise ValidationError(f"'{field}' is required.")

    if "team_type" in data and data["team_type"] not in (None, ""):
        if data["team_type"] not in TEAM_TYPES:
            raise ValidationError(f"'team_type' must be one of {sorted(TEAM_TYPES)}.")

    if "status" in data and data["status"] not in (None, ""):
        if data["status"] not in TEAM_STATUSES:
            raise ValidationError(f"'status' must be one of {sorted(TEAM_STATUSES)}.")

    if "latitude" in data and data["latitude"] not in (None, ""):
        if not is_valid_latitude(data["latitude"]):
            raise ValidationError("'latitude' must be a number between -90 and 90.")

    if "longitude" in data and data["longitude"] not in (None, ""):
        if not is_valid_longitude(data["longitude"]):
            raise ValidationError("'longitude' must be a number between -180 and 180.")

    if "members" in data and data["members"] not in (None, ""):
        try:
            if int(data["members"]) < 0:
                raise ValidationError("'members' must be a non-negative integer.")
        except (TypeError, ValueError):
            raise ValidationError("'members' must be a non-negative integer.")


def create_team(data: dict) -> Team:
    team = Team(
        team_name=data["team_name"],
        team_type=data["team_type"],
        latitude=float(data["latitude"]),
        longitude=float(data["longitude"]),
        members=int(data.get("members", 1)),
        vehicle_type=data.get("vehicle_type"),
        status=data.get("status", "AVAILABLE"),
    )
    db.session.add(team)
    db.session.commit()
    return team


def update_team(team: Team, data: dict) -> Team:
    fields = [
        "team_name",
        "team_type",
        "latitude",
        "longitude",
        "members",
        "vehicle_type",
        "status",
        "current_assignment",
    ]
    for field in fields:
        if field in data and data[field] not in (None, ""):
            value = data[field]
            if field in ("latitude", "longitude"):
                value = float(value)
            if field == "members":
                value = int(value)
            if field == "current_assignment":
                value = int(value)
            setattr(team, field, value)
    db.session.commit()
    return team


# ---------------------------------------------------------------------------
# Shelters
# ---------------------------------------------------------------------------

def validate_shelter_payload(data: dict, partial: bool = False):
    required = ["name", "latitude", "longitude", "capacity"]
    if not partial:
        for field in required:
            if data.get(field) in (None, ""):
                raise ValidationError(f"'{field}' is required.")

    if "status" in data and data["status"] not in (None, ""):
        if data["status"] not in SHELTER_STATUSES:
            raise ValidationError(f"'status' must be one of {sorted(SHELTER_STATUSES)}.")

    if "latitude" in data and data["latitude"] not in (None, ""):
        if not is_valid_latitude(data["latitude"]):
            raise ValidationError("'latitude' must be a number between -90 and 90.")

    if "longitude" in data and data["longitude"] not in (None, ""):
        if not is_valid_longitude(data["longitude"]):
            raise ValidationError("'longitude' must be a number between -180 and 180.")

    for field in ("capacity", "occupied"):
        if field in data and data[field] not in (None, ""):
            try:
                if int(data[field]) < 0:
                    raise ValidationError(f"'{field}' must be a non-negative integer.")
            except (TypeError, ValueError):
                raise ValidationError(f"'{field}' must be a non-negative integer.")


def create_shelter(data: dict) -> Shelter:
    capacity = int(data.get("capacity", 0))
    occupied = int(data.get("occupied", 0))
    # Keep internally consistent: occupied can never exceed capacity.
    occupied = min(occupied, capacity)

    shelter = Shelter(
        name=data["name"],
        latitude=float(data["latitude"]),
        longitude=float(data["longitude"]),
        capacity=capacity,
        occupied=occupied,
        status=data.get("status", "OPEN"),
        contact=data.get("contact"),
    )
    db.session.add(shelter)
    db.session.commit()
    return shelter


def update_shelter(shelter: Shelter, data: dict) -> Shelter:
    fields = ["name", "latitude", "longitude", "capacity", "occupied", "status", "contact"]
    for field in fields:
        if field in data and data[field] not in (None, ""):
            value = data[field]
            if field in ("latitude", "longitude"):
                value = float(value)
            if field in ("capacity", "occupied"):
                value = int(value)
            setattr(shelter, field, value)

    # Re-clamp for internal consistency after any update.
    shelter.occupied = max(0, min(shelter.occupied, shelter.capacity))
    if shelter.available_capacity == 0 and shelter.status == "OPEN":
        shelter.status = "FULL"

    db.session.commit()
    return shelter


# ---------------------------------------------------------------------------
# Supplies
# ---------------------------------------------------------------------------

def validate_supply_payload(data: dict, partial: bool = False):
    required = ["location", "latitude", "longitude"]
    if not partial:
        for field in required:
            if data.get(field) in (None, ""):
                raise ValidationError(f"'{field}' is required.")

    if "status" in data and data["status"] not in (None, ""):
        if data["status"] not in SUPPLY_STATUSES:
            raise ValidationError(f"'status' must be one of {sorted(SUPPLY_STATUSES)}.")

    if "latitude" in data and data["latitude"] not in (None, ""):
        if not is_valid_latitude(data["latitude"]):
            raise ValidationError("'latitude' must be a number between -90 and 90.")

    if "longitude" in data and data["longitude"] not in (None, ""):
        if not is_valid_longitude(data["longitude"]):
            raise ValidationError("'longitude' must be a number between -180 and 180.")

    for field in ("food_packets", "water_units", "medical_kits", "blankets"):
        if field in data and data[field] not in (None, ""):
            try:
                if int(data[field]) < 0:
                    raise ValidationError(f"'{field}' must be a non-negative integer.")
            except (TypeError, ValueError):
                raise ValidationError(f"'{field}' must be a non-negative integer.")


def create_supply(data: dict) -> Supply:
    supply = Supply(
        location=data["location"],
        latitude=float(data["latitude"]),
        longitude=float(data["longitude"]),
        food_packets=int(data.get("food_packets", 0)),
        water_units=int(data.get("water_units", 0)),
        medical_kits=int(data.get("medical_kits", 0)),
        blankets=int(data.get("blankets", 0)),
        status=data.get("status", "AVAILABLE"),
    )
    db.session.add(supply)
    db.session.commit()
    return supply


def update_supply(supply: Supply, data: dict) -> Supply:
    fields = [
        "location",
        "latitude",
        "longitude",
        "food_packets",
        "water_units",
        "medical_kits",
        "blankets",
        "status",
    ]
    for field in fields:
        if field in data and data[field] not in (None, ""):
            value = data[field]
            if field in ("latitude", "longitude"):
                value = float(value)
            if field in ("food_packets", "water_units", "medical_kits", "blankets"):
                value = int(value)
            setattr(supply, field, value)
    db.session.commit()
    return supply

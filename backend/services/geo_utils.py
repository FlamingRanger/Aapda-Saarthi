"""Geospatial helper functions shared by services."""

import math


def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Great-circle distance between two points on Earth, in kilometres.

    Standard Haversine formula. Returns 0.0 for identical points.
    """
    R = 6371.0088  # mean Earth radius in km

    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(d_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    )
    a = min(1.0, max(0.0, a))  # clamp for floating point safety
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c


def is_valid_latitude(lat) -> bool:
    try:
        return -90.0 <= float(lat) <= 90.0
    except (TypeError, ValueError):
        return False


def is_valid_longitude(lon) -> bool:
    try:
        return -180.0 <= float(lon) <= 180.0
    except (TypeError, ValueError):
        return False

"""
Tests for integrations/weather/weather_adapter.py
Run from repo root: python -m pytest integrations/tests/ -v
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "weather"))

import pytest
from weather_adapter import normalize_generic, AdapterValidationError

# A complete valid alert matching normalize_generic's required fields.
VALID_ALERT = {
    "id": "test-001",
    "alert_type": "FLOOD_WARNING",
    "severity": "HIGH",
    "description": "River levels rising rapidly",
    "area": "Bhubaneswar",
    "latitude": 20.2961,
    "longitude": 85.8245,
    "source": "test",
    "start_time": "2026-08-25T10:00:00Z",
    "end_time": "2026-08-26T10:00:00Z",
}


class TestWeatherAdapter:
    def test_valid_alert_normalizes(self):
        result = normalize_generic(VALID_ALERT)
        assert result["alert_type"] == "FLOOD_WARNING"
        assert result["severity"] == "HIGH"
        assert "description" in result

    def test_output_has_required_fields(self):
        result = normalize_generic(VALID_ALERT)
        for field in ["id", "alert_type", "severity", "latitude", "longitude", "description"]:
            assert field in result, f"Missing field: {field}"

    def test_missing_id_raises(self):
        bad = {k: v for k, v in VALID_ALERT.items() if k != "id"}
        with pytest.raises((AdapterValidationError, KeyError, Exception)):
            normalize_generic(bad)

    def test_missing_alert_type_raises(self):
        bad = {k: v for k, v in VALID_ALERT.items() if k != "alert_type"}
        with pytest.raises((AdapterValidationError, KeyError, Exception)):
            normalize_generic(bad)

    def test_missing_severity_raises(self):
        bad = {k: v for k, v in VALID_ALERT.items() if k != "severity"}
        with pytest.raises((AdapterValidationError, KeyError, Exception)):
            normalize_generic(bad)

    def test_latitude_out_of_range_raises(self):
        bad = {**VALID_ALERT, "latitude": 999}
        with pytest.raises((AdapterValidationError, ValueError, Exception)):
            normalize_generic(bad)

    def test_longitude_out_of_range_raises(self):
        bad = {**VALID_ALERT, "longitude": -999}
        with pytest.raises((AdapterValidationError, ValueError, Exception)):
            normalize_generic(bad)

    def test_sample_alerts_all_normalize(self):
        """All 5 sample alerts in sample_alerts.json must normalize without error."""
        import json
        sample_path = os.path.join(os.path.dirname(__file__), "..", "weather", "sample_alerts.json")
        with open(sample_path) as f:
            alerts = json.load(f)
        assert len(alerts) > 0, "sample_alerts.json must not be empty"
        for alert in alerts:
            result = normalize_generic(alert)
            assert "alert_type" in result
            assert "severity" in result

    def test_area_defaults_to_unknown(self):
        no_area = {k: v for k, v in VALID_ALERT.items() if k != "area"}
        result = normalize_generic(no_area)
        assert result["area"] == "Unknown area"

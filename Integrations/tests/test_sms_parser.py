"""
Tests for integrations/sms/sms_parser.py
Run from repo root: python -m pytest integrations/tests/ -v
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "sms"))

import pytest
from sms_parser import parse_sms, SMSParseError


class TestSmsParsing:
    def test_valid_minimal(self):
        result = parse_sms("FLOOD,HIGH,20.2961,85.8245,people trapped")
        assert isinstance(result, dict)
        assert result["incident_type"] == "FLOOD"
        assert result["severity"] == "HIGH"
        assert abs(result["latitude"] - 20.2961) < 0.0001
        assert abs(result["longitude"] - 85.8245) < 0.0001
        assert "trapped" in result["description"].lower()

    def test_case_normalization(self):
        result = parse_sms("flood,critical,20.0,85.0,test desc")
        assert result["incident_type"] == "FLOOD"
        assert result["severity"] == "CRITICAL"

    def test_description_with_commas(self):
        result = parse_sms("FIRE,MEDIUM,20.0,85.0,building on fire, people inside, send help")
        assert "," in result["description"]

    def test_invalid_type_raises(self):
        with pytest.raises(SMSParseError):
            parse_sms("EARTHQUAKE,HIGH,20.0,85.0,big quake")

    def test_invalid_severity_raises(self):
        with pytest.raises(SMSParseError):
            parse_sms("FLOOD,EXTREME,20.0,85.0,test")

    def test_invalid_latitude_raises(self):
        with pytest.raises(SMSParseError):
            parse_sms("FLOOD,HIGH,999.0,85.0,test")

    def test_invalid_longitude_raises(self):
        with pytest.raises(SMSParseError):
            parse_sms("FLOOD,HIGH,20.0,999.0,test")

    def test_missing_fields_raises(self):
        with pytest.raises((SMSParseError, Exception)):
            parse_sms("FLOOD,HIGH,20.0")

    def test_all_valid_types(self):
        for t in ["FLOOD","LANDSLIDE","CYCLONE","FIRE","ROAD_BLOCK","MEDICAL","TRAPPED_PERSON","BUILDING_DAMAGE","OTHER"]:
            result = parse_sms(f"{t},LOW,20.0,85.0,test")
            assert result["incident_type"] == t

    def test_all_severity_levels(self):
        for s in ["LOW","MEDIUM","HIGH","CRITICAL"]:
            result = parse_sms(f"FLOOD,{s},20.0,85.0,test")
            assert result["severity"] == s

    def test_reporter_phone_kwarg_accepted(self):
        # parse_sms accepts reporter_phone as a keyword arg (may or may not embed it in result)
        result = parse_sms("FLOOD,HIGH,20.0,85.0,test", reporter_phone="9876543210")
        assert isinstance(result, dict)

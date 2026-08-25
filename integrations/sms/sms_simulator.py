"""
sms_simulator.py
-----------------
Owner: Developer 3 (Integrations) — integrations/sms/

Purpose:
    Judge-demo simulator for the SMS fallback channel (root spec section
    17.4). Real telecom/SMS-gateway integration is explicitly out of MVP
    scope (root spec section 39, "SMS gateway integration" is listed
    under optional advanced features) — this simulates receiving SMS
    text and feeding it through the same pipeline a real gateway
    webhook eventually would.

Flow:
    1. Take a raw SMS body (from CLI arg, or one of the built-in demo
       messages if run with no args) + an optional sender phone number.
    2. Parse it with sms_parser.parse_sms().
    3. POST the normalized incident to the backend's EXISTING,
       unmodified endpoint: POST /api/incidents (root spec section 11.2).
       This is the same endpoint the citizen web app uses — SMS is just
       a different front door into the same contract, not a new one.
    4. If the backend is unreachable (e.g. not running yet, or during
       standalone integrations-branch development), print what WOULD
       have been submitted instead of crashing. This mirrors the same
       "external dependency down -> graceful fallback, never lose the
       report silently" principle used in weather_service.py and
       required by root spec section 23/25.

Configuration:
    BACKEND_API_BASE_URL   default: http://localhost:5000
"""

from __future__ import annotations

import json
import os
import sys

try:
    import requests
except ImportError:  # pragma: no cover
    requests = None  # type: ignore

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:  # pragma: no cover
    pass

from sms_parser import parse_sms, SMSParseError


BACKEND_API_BASE_URL = os.getenv("BACKEND_API_BASE_URL", "http://localhost:5000")
INCIDENTS_ENDPOINT = f"{BACKEND_API_BASE_URL}/api/incidents"

# Built-in demo messages for judge demonstration when run with no args.
DEMO_MESSAGES = [
    ("FLOOD,CRITICAL,20.2961,85.8245,PEOPLE TRAPPED INSIDE HOUSES", "+919876543210"),
    ("LANDSLIDE,HIGH,20.3100,85.8500,ROAD BLOCKED NEAR HILLSIDE VILLAGE", "+919876500000"),
    ("MEDICAL,CRITICAL,20.2800,85.8100,PREGNANT WOMAN NEEDS EVACUATION", "+919812345678"),
]


def submit_incident(incident: dict) -> None:
    """
    Submits a normalized incident to the backend's existing
    POST /api/incidents endpoint. Falls back to printing the payload if
    the backend is unreachable — never raises up to the caller, since a
    down backend during a demo/dev session is an expected, handled case.
    """
    if requests is None:
        print("[sms_simulator] 'requests' package not installed — printing payload instead:")
        print(json.dumps(incident, indent=2))
        return

    try:
        response = requests.post(INCIDENTS_ENDPOINT, json=incident, timeout=5)
        response.raise_for_status()
        print(f"[sms_simulator] Submitted successfully -> {INCIDENTS_ENDPOINT}")
        print(f"[sms_simulator] Backend response: {response.status_code} {response.text}")
    except Exception as exc:  # noqa: BLE001 - any network/backend failure -> fallback, not a crash
        print(f"[sms_simulator] Backend unreachable ({exc}). "
              f"Incident NOT lost — here is what would have been submitted:")
        print(json.dumps(incident, indent=2))


def process_sms(raw_text: str, reporter_phone: str | None = None) -> None:
    """Parses one raw SMS body and attempts to submit it, logging failures clearly."""
    print(f"\n[sms_simulator] Incoming SMS from {reporter_phone or 'unknown number'}: {raw_text!r}")
    try:
        incident = parse_sms(raw_text, reporter_phone=reporter_phone)
    except SMSParseError as exc:
        # Per root spec section 17.3/23: never lose a report silently, even
        # a malformed one. In a real gateway this would be queued for
        # manual review; here we just make the failure loud and visible.
        print(f"[sms_simulator] FAILED TO PARSE — report preserved for manual review: {exc}")
        return

    print(f"[sms_simulator] Parsed normalized incident: {json.dumps(incident, indent=2)}")
    submit_incident(incident)


if __name__ == "__main__":
    if len(sys.argv) > 1:
        # Usage: python sms_simulator.py "FLOOD,HIGH,20.29,85.82,PEOPLE TRAPPED" "+91XXXXXXXXXX"
        sms_body = sys.argv[1]
        phone = sys.argv[2] if len(sys.argv) > 2 else None
        process_sms(sms_body, phone)
    else:
        print("No SMS body provided as argument — running built-in demo messages...")
        for body, phone in DEMO_MESSAGES:
            process_sms(body, phone)
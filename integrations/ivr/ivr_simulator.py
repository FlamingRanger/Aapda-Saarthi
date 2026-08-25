"""
ivr_simulator.py
-----------------
Owner: Developer 3 (Integrations) — integrations/ivr/

Purpose:
    Simulates the IVR ("press 1 for...") fallback reporting channel
    described in root spec section 17.5. Real telecom/IVR infrastructure
    is explicitly out of MVP scope (root spec section 39, "Real IVR
    integration" is listed under optional advanced features) — this
    simulates the CALL flow end-to-end as an interactive CLI session,
    producing the exact same normalized incident shape used by the
    citizen web app and the SMS channel (root spec section 18).

Call flow (root spec 17.5):
    CALL
    -> choose disaster
    -> choose severity
    -> provide/resolve location
    -> enter description
    -> create normalized incident

Design notes:
    - Reuses the same allowed incident_type/severity enums as
      sms_parser.py (kept as a local, intentionally duplicated copy per
      the strict no-overlap rule in root spec section 8 — integrations
      does not import backend internals).
    - Location step offers BOTH a preset menu of demo locations (fast,
      reliable for a judge demo where typing GPS decimals live is
      error-prone) AND a manual lat/lon entry option (closer to how a
      real DTMF/GPS-relay IVR flow might work). This mirrors how a real
      caller might either pick "closest landmark" from a voice menu or
      have their location resolved by carrier/cell-tower data.
    - Ends by submitting to the backend's existing POST /api/incidents
      endpoint, with the same graceful "print instead of crash" fallback
      used in sms_simulator.py.

This module can be run interactively (python ivr_simulator.py) or
driven non-interactively for automated demo scripts via
run_ivr_flow(choices=[...]) — see bottom of file.
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


# Mirrors backend's Incident model enums (root spec section 10.1).
# Kept as a local copy intentionally — see sms_parser.py for the same
# note on why this isn't imported from backend/.
INCIDENT_TYPE_MENU = [
    ("1", "FLOOD"),
    ("2", "LANDSLIDE"),
    ("3", "CYCLONE"),
    ("4", "FIRE"),
    ("5", "ROAD_BLOCK"),
    ("6", "MEDICAL"),
    ("7", "TRAPPED_PERSON"),
    ("8", "BUILDING_DAMAGE"),
    ("9", "OTHER"),
]

SEVERITY_MENU = [
    ("1", "LOW"),
    ("2", "MEDIUM"),
    ("3", "HIGH"),
    ("4", "CRITICAL"),
]

# Preset demo locations spread across the same demo region used in
# sample_alerts.json (Odisha coast) so a judge demo stays internally
# consistent with the weather alerts already shown on the map.
LOCATION_MENU = [
    ("1", "Puri town centre", 19.8135, 85.8312),
    ("2", "Cuttack riverside colony", 20.4625, 85.8830),
    ("3", "Bhubaneswar low-lying ward", 20.2961, 85.8245),
    ("4", "Konark coastal village", 19.8876, 86.0945),
    ("5", "Khordha rural settlement", 20.1830, 85.6132),
]

BACKEND_API_BASE_URL = os.getenv("BACKEND_API_BASE_URL", "http://localhost:5000")
INCIDENTS_ENDPOINT = f"{BACKEND_API_BASE_URL}/api/incidents"


def _prompt_menu(prompt_text: str, menu: list[tuple[str, str]]) -> str:
    """Prints a numbered voice-menu-style prompt and returns the chosen value."""
    print(f"\n{prompt_text}")
    for key, label in menu:
        print(f"  Press {key} for {label.replace('_', ' ').title()}")

    valid_keys = {key for key, _ in menu}
    while True:
        choice = input("Your choice: ").strip()
        for key, label in menu:
            if choice == key:
                return label
        print(f"Invalid choice {choice!r}. Please enter one of: {sorted(valid_keys)}")


def _prompt_location() -> tuple[float, float]:
    print("\nHow would you like to provide your location?")
    print("  Press 1 to choose from a list of nearby known areas")
    print("  Press 2 to enter GPS coordinates manually")

    while True:
        choice = input("Your choice: ").strip()
        if choice == "1":
            print("\nSelect the area closest to you:")
            for key, label, _, _ in LOCATION_MENU:
                print(f"  Press {key} for {label}")
            while True:
                area_choice = input("Your choice: ").strip()
                for key, label, lat, lon in LOCATION_MENU:
                    if area_choice == key:
                        print(f"Location resolved to {label} ({lat}, {lon})")
                        return lat, lon
                print(f"Invalid choice {area_choice!r}.")
        elif choice == "2":
            while True:
                try:
                    lat = float(input("Enter latitude: ").strip())
                    lon = float(input("Enter longitude: ").strip())
                except ValueError:
                    print("Latitude/longitude must be numeric. Try again.")
                    continue
                if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
                    print("Latitude/longitude out of valid range. Try again.")
                    continue
                return lat, lon
        else:
            print(f"Invalid choice {choice!r}. Please press 1 or 2.")


def submit_incident(incident: dict) -> None:
    """
    Submits to backend's existing POST /api/incidents endpoint, same
    graceful-fallback pattern as sms_simulator.py: never crash, never
    silently lose the report if the backend is unreachable.
    """
    if requests is None:
        print("[ivr_simulator] 'requests' package not installed — printing payload instead:")
        print(json.dumps(incident, indent=2))
        return

    try:
        response = requests.post(INCIDENTS_ENDPOINT, json=incident, timeout=5)
        response.raise_for_status()
        print(f"[ivr_simulator] Submitted successfully -> {INCIDENTS_ENDPOINT}")
        print(f"[ivr_simulator] Backend response: {response.status_code} {response.text}")
    except Exception as exc:  # noqa: BLE001 - any network/backend failure -> fallback, not a crash
        print(f"[ivr_simulator] Backend unreachable ({exc}). "
              f"Incident NOT lost — here is what would have been submitted:")
        print(json.dumps(incident, indent=2))


def run_ivr_flow(choices: list[str] | None = None) -> dict:
    """
    Runs the full simulated call flow. If `choices` is provided, uses it
    as a pre-scripted sequence of inputs (for non-interactive/automated
    demo runs) instead of blocking on real input() calls — each element
    is fed to input() in order via a simple stdin-replacement shim.

    Interactive mode (choices=None) is the default judge-demo experience.
    """
    if choices is not None:
        return _run_scripted(choices)

    print("=" * 50)
    print("INCOMING CALL — Disaster Reporting IVR (SIMULATED)")
    print("=" * 50)

    incident_type = _prompt_menu("Please describe the disaster you are reporting:", INCIDENT_TYPE_MENU)
    severity = _prompt_menu("How severe is the situation?", SEVERITY_MENU)
    latitude, longitude = _prompt_location()

    print("\nPlease describe the situation briefly (you can type freely):")
    description = input("Description: ").strip()
    while not description:
        print("Description cannot be empty.")
        description = input("Description: ").strip()

    incident = {
        "incident_type": incident_type,
        "severity": severity,
        "latitude": latitude,
        "longitude": longitude,
        "description": description,
        "source": "ivr",
    }

    print("\n" + "=" * 50)
    print("CALL COMPLETE — Normalized incident created:")
    print(json.dumps(incident, indent=2))
    print("=" * 50)

    submit_incident(incident)
    return incident


def _run_scripted(choices: list[str]) -> dict:
    """
    Non-interactive variant for automated demo scripts / testing. Feeds
    a fixed sequence of answers through the same prompts by monkeypatching
    input() for the duration of the call, so the exact same prompt logic
    (and its validation) is exercised as the real interactive flow.
    """
    it = iter(choices)
    original_input = __builtins__["input"] if isinstance(__builtins__, dict) else __builtins__.input

    def fake_input(prompt: str = "") -> str:
        try:
            value = next(it)
        except StopIteration as exc:
            raise RuntimeError("Scripted IVR flow ran out of pre-supplied answers") from exc
        print(f"{prompt}{value}")
        return value

    import builtins
    builtins.input = fake_input
    try:
        return run_ivr_flow(choices=None)
    finally:
        builtins.input = original_input


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--demo":
        # Non-interactive scripted demo run, useful for a quick judge
        # walkthrough without live typing:
        # FLOOD -> CRITICAL -> preset location 1 (Puri) -> description
        run_ivr_flow(choices=["1", "4", "1", "1", "People are trapped inside houses"])
    else:
        run_ivr_flow()
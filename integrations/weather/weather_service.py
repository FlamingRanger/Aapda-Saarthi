"""
weather_service.py
-------------------
Owner: Developer 3 (Integrations) — integrations/weather/

Purpose:
    Provides normalized weather/official alert data to the rest of the
    platform, using a live provider when available and falling back to
    integrations/weather/sample_alerts.json when it is not. The rest of
    the system (backend, frontend) must behave identically either way —
    per root spec section 6 and 17.2, the demo must never break just
    because an external feed is unreachable.

Interface this module exposes (this IS the contract other developers
should code against):

    fetch_alerts() -> list[dict]
        Returns a list of normalized alert dicts (see weather_adapter.py
        for the exact shape). Always returns a list, even on total
        provider failure (falls back to sample data). Never raises for
        "provider unavailable" — that is an expected, handled case, not
        an exception path.

    register_emit_callback(fn)
        Backend (app.py, at startup, once Flask-SocketIO is initialized)
        calls this once to hand this module a function with signature
        fn(alert: dict) -> None that performs the actual
        `socketio.emit("weather_alert", alert)` call. This keeps the
        SocketIO server instance owned entirely by backend, while
        integrations owns fetching/normalizing the data — see the
        coordination note in integrations/socket/event_contracts.md.

    poll_and_emit_once()
        Fetches current alerts and, for any not already emitted this
        process lifetime, calls the registered emit callback. Intended
        to be run on a scheduler/interval by whichever process embeds
        this module (backend's app.py, or a standalone integrations
        worker process — that hosting decision is for backend+integrations
        to agree on, not something this module assumes).

Configuration (via .env / environment, never hard-coded — root spec
section 24):
    WEATHER_PROVIDER_API_URL   - base URL of the live provider (optional)
    WEATHER_PROVIDER_API_KEY   - API key for the live provider (optional)
    WEATHER_POLL_INTERVAL_SEC  - suggested poll interval, default 300

If WEATHER_PROVIDER_API_URL or WEATHER_PROVIDER_API_KEY are unset, this
module skips the live call entirely and uses sample data — this is a
deliberate, silent, non-error fallback for local/demo development.
"""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Callable, Optional

try:
    import requests
except ImportError:  # pragma: no cover - requests is in requirements.txt
    requests = None  # type: ignore

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:  # pragma: no cover - python-dotenv is in requirements.txt
    pass

from weather_adapter import (
    normalize_generic,
    normalize_example_provider,  # noqa: F401  (kept available for when a real provider is chosen)
    AdapterValidationError,
)


SAMPLE_ALERTS_PATH = Path(__file__).parent / "sample_alerts.json"

_emit_callback: Optional[Callable[[dict], None]] = None
_already_emitted_ids: set[str] = set()


def register_emit_callback(fn: Callable[[dict], None]) -> None:
    """Called once by backend at startup. See module docstring."""
    global _emit_callback
    _emit_callback = fn


def _load_sample_alerts() -> list[dict]:
    with open(SAMPLE_ALERTS_PATH, "r", encoding="utf-8") as f:
        raw_alerts = json.load(f)

    normalized = []
    for raw in raw_alerts:
        try:
            normalized.append(normalize_generic(raw))
        except AdapterValidationError as exc:
            # A single malformed sample alert must not break the whole
            # fallback path — skip it and keep going.
            print(f"[weather_service] Skipping invalid sample alert {raw.get('id')!r}: {exc}")
    return normalized


def _fetch_from_live_provider() -> Optional[list[dict]]:
    """
    Attempts to fetch from a live provider if configured. Returns None
    (not an empty list) if the provider is unconfigured or unreachable,
    so the caller can distinguish "no live provider" from "live provider
    returned zero alerts."
    """
    api_url = os.getenv("WEATHER_PROVIDER_API_URL")
    api_key = os.getenv("WEATHER_PROVIDER_API_KEY")

    if not api_url or not api_key or requests is None:
        return None

    try:
        response = requests.get(
            api_url,
            headers={"Authorization": f"Bearer {api_key}"},
            timeout=5,
        )
        response.raise_for_status()
        raw_alerts = response.json()
    except Exception as exc:  # noqa: BLE001 - any provider failure -> fallback, not a crash
        print(f"[weather_service] Live weather provider unavailable, falling back to sample data: {exc}")
        return None

    normalized = []
    for raw in raw_alerts:
        try:
            # NOTE: swap normalize_generic for a provider-specific adapter
            # function (see normalize_example_provider in weather_adapter.py)
            # once a real provider's raw payload shape is confirmed.
            normalized.append(normalize_generic(raw))
        except AdapterValidationError as exc:
            print(f"[weather_service] Skipping invalid live alert {raw.get('id')!r}: {exc}")

    return normalized


def fetch_alerts() -> list[dict]:
    """
    Public entry point. Always returns a list of normalized alerts.
    Tries the live provider first; falls back to sample data if the
    live provider is unconfigured, unreachable, or returns nothing.
    """
    live_alerts = _fetch_from_live_provider()
    if live_alerts is not None:
        return live_alerts

    return _load_sample_alerts()


def poll_and_emit_once() -> list[dict]:
    """
    Fetches current alerts and emits any not yet emitted this process
    lifetime via the registered callback. Returns the full current
    alert list regardless of what was newly emitted, so a caller can
    also use this for a REST-style "give me current alerts" need.
    """
    alerts = fetch_alerts()

    if _emit_callback is None:
        print("[weather_service] No emit callback registered yet — "
              "backend must call register_emit_callback() at startup. "
              "Skipping emit, returning fetched alerts only.")
        return alerts

    for alert in alerts:
        if alert["id"] not in _already_emitted_ids:
            _emit_callback(alert)
            _already_emitted_ids.add(alert["id"])

    return alerts


if __name__ == "__main__":
    # Standalone simulator mode for local testing / judge demo, independent
    # of whether backend is running. Prints what WOULD be emitted.
    def _print_emit(alert: dict) -> None:
        print(f"[SIMULATED EMIT] weather_alert -> {json.dumps(alert, indent=2)}")

    register_emit_callback(_print_emit)
    print("Running weather_service in standalone simulator mode...\n")
    poll_and_emit_once()
"""
offline_sync.py
-----------------
Owner: Developer 3 (Integrations) — integrations/offline/

Purpose:
    Runnable reference implementation of the offline queue + retry/sync
    behavior documented in offline_queue.md and sync_logic.md (root spec
    section 17.3). This is the definitive lifecycle/state machine other
    developers should port (e.g. Developer 2 into browser storage for
    the citizen web app) — see the "where this actually runs" note in
    offline_queue.md.

Also directly usable as-is by the SMS/IVR channels (which run
server-side), so a report captured via sms_simulator.py or
ivr_simulator.py during a backend outage can be queued here instead of
just being printed and forgotten.

Public interface:
    enqueue_report(incident: dict) -> dict
        Saves a report locally with status PENDING_UPLOAD. Returns the
        full queue entry (including its queue_id).

    attempt_sync_all() -> dict
        Attempts to upload every PENDING_UPLOAD entry. Returns a summary
        dict: {"uploaded": [...], "still_pending": [...], "failed_retained": [...]}.
        Safe to call repeatedly/on a timer — see sync_logic.md for the
        two trigger mechanisms this is designed to support.

    get_queue_status() -> dict
        Returns counts by status, for a UI to display e.g.
        "3 reports pending upload".

    is_backend_reachable() -> bool
        Health-check helper, exposed separately so callers (or tests)
        can check connectivity without attempting a full sync.

Configuration:
    BACKEND_API_BASE_URL   default: http://localhost:5000
    OFFLINE_QUEUE_FILE     default: <this dir>/queue.json
"""

from __future__ import annotations

import json
import os
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path

try:
    import requests
except ImportError:  # pragma: no cover
    requests = None  # type: ignore

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:  # pragma: no cover
    pass


BACKEND_API_BASE_URL = os.getenv("BACKEND_API_BASE_URL", "http://localhost:5000")
HEALTH_ENDPOINT = f"{BACKEND_API_BASE_URL}/api/health"
INCIDENTS_ENDPOINT = f"{BACKEND_API_BASE_URL}/api/incidents"

QUEUE_FILE = Path(os.getenv("OFFLINE_QUEUE_FILE", str(Path(__file__).parent / "queue.json")))

MAX_RETRY_ATTEMPTS = 5
# Exponential-ish backoff schedule between attempts, per sync_logic.md.
# Not enforced with real sleeps in attempt_sync_all() (a demo/CLI run
# should not block for 5 minutes) — exposed here so a real scheduler
# (cron/timer loop) can consult it to decide when to call
# attempt_sync_all() again.
RETRY_BACKOFF_SECONDS = [5, 15, 60, 300]


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _load_queue() -> list[dict]:
    if not QUEUE_FILE.exists():
        return []
    with open(QUEUE_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def _save_queue(queue: list[dict]) -> None:
    QUEUE_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(QUEUE_FILE, "w", encoding="utf-8") as f:
        json.dump(queue, f, indent=2)


def enqueue_report(incident: dict) -> dict:
    """
    Saves a report locally with status PENDING_UPLOAD. This is the
    "detect offline -> save report locally -> mark Pending Upload" path
    (offline_queue.md steps 1-3) collapsed into one call — the caller
    (a citizen form, or sms/ivr simulator) is responsible for deciding
    *when* to call this (i.e. after a submission attempt has already
    failed), not this function.
    """
    entry = {
        "queue_id": f"q-{uuid.uuid4().hex[:8]}",
        "incident": incident,
        "status": "PENDING_UPLOAD",
        "attempts": 0,
        "created_at": _now_iso(),
        "last_attempt_at": None,
        "last_error": None,
    }
    queue = _load_queue()
    queue.append(entry)
    _save_queue(queue)
    print(f"[offline_sync] Report queued locally as {entry['queue_id']} (status: PENDING_UPLOAD)")
    return entry


def is_backend_reachable() -> bool:
    if requests is None:
        return False
    try:
        response = requests.get(HEALTH_ENDPOINT, timeout=3)
        return response.status_code == 200
    except Exception:  # noqa: BLE001 - any failure means "not reachable"
        return False


def attempt_sync_all() -> dict:
    """
    Attempts to upload every PENDING_UPLOAD entry once. See sync_logic.md
    for the full algorithm this implements, including why the queue is
    persisted after every entry rather than only at the end.
    """
    queue = _load_queue()
    result = {"uploaded": [], "still_pending": [], "failed_retained": []}

    if not is_backend_reachable():
        print("[offline_sync] Backend still unreachable — skipping sync attempt, queue unchanged.")
        result["still_pending"] = [e["queue_id"] for e in queue if e["status"] == "PENDING_UPLOAD"]
        return result

    for entry in queue:
        if entry["status"] != "PENDING_UPLOAD":
            continue

        try:
            response = requests.post(INCIDENTS_ENDPOINT, json=entry["incident"], timeout=5)
            response.raise_for_status()
            entry["status"] = "UPLOADED"
            entry["last_attempt_at"] = _now_iso()
            entry["last_error"] = None
            result["uploaded"].append(entry["queue_id"])
            print(f"[offline_sync] {entry['queue_id']} uploaded successfully.")
        except Exception as exc:  # noqa: BLE001 - any submission failure -> retry bookkeeping, not a crash
            entry["attempts"] += 1
            entry["last_attempt_at"] = _now_iso()
            entry["last_error"] = str(exc)

            if entry["attempts"] >= MAX_RETRY_ATTEMPTS:
                entry["status"] = "FAILED_RETAINED"
                result["failed_retained"].append(entry["queue_id"])
                print(f"[offline_sync] {entry['queue_id']} FAILED_RETAINED after "
                      f"{entry['attempts']} attempts — report preserved, not discarded.")
            else:
                result["still_pending"].append(entry["queue_id"])
                print(f"[offline_sync] {entry['queue_id']} attempt {entry['attempts']} failed, "
                      f"still PENDING_UPLOAD: {exc}")

        # Persist after every entry, not just at the end — see sync_logic.md.
        _save_queue(queue)

    return result


def get_queue_status() -> dict:
    queue = _load_queue()
    counts = {"PENDING_UPLOAD": 0, "UPLOADED": 0, "FAILED_RETAINED": 0}
    for entry in queue:
        counts[entry["status"]] = counts.get(entry["status"], 0) + 1
    return counts


if __name__ == "__main__":
    print("=== Offline Queue Demo ===\n")

    print("1. Simulating a citizen report submitted while offline...")
    demo_incident = {
        "incident_type": "FLOOD",
        "severity": "HIGH",
        "latitude": 20.2961,
        "longitude": 85.8245,
        "description": "Water rising near the market, submitted while offline",
        "source": "web",
    }
    enqueue_report(demo_incident)

    print(f"\n2. Current queue status: {get_queue_status()}")

    print("\n3. Attempting sync (backend expected to be unreachable in this demo)...")
    summary = attempt_sync_all()
    print(f"\nSync summary: {summary}")

    print(f"\n4. Final queue status: {get_queue_status()}")
    print(f"\nQueue persisted at: {QUEUE_FILE}")
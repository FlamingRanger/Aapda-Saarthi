"""
Seed the database with sample data for a demo.

Run with:
    python seed.py

Re-running is safe: it clears existing rows in these tables first, then
reloads from the CSV files in data/. Sample alerts come from
integrations/weather/sample_alerts.json when present, so the alert feed
has realistic content even without a live weather API key.
"""

import csv
import json
import os

from app import create_app
from models import db
from models.alert import Alert
from models.incident import Incident
from models.shelter import Shelter
from models.supply import Supply
from models.team import Team

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
SAMPLE_ALERTS_PATH = os.path.join(
    BASE_DIR, "..", "integrations", "weather", "sample_alerts.json"
)


def _read_csv(filename):
    path = os.path.join(DATA_DIR, filename)
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def seed_incidents():
    for row in _read_csv("sample_incidents.csv"):
        db.session.add(
            Incident(
                reporter_name=row["reporter_name"] or None,
                phone=row["phone"] or None,
                incident_type=row["incident_type"],
                description=row["description"] or None,
                latitude=float(row["latitude"]),
                longitude=float(row["longitude"]),
                severity=row["severity"],
                status=row.get("status") or "REPORTED",
            )
        )


def seed_teams():
    for row in _read_csv("sample_teams.csv"):
        db.session.add(
            Team(
                team_name=row["team_name"],
                team_type=row["team_type"],
                latitude=float(row["latitude"]),
                longitude=float(row["longitude"]),
                members=int(row["members"]),
                vehicle_type=row["vehicle_type"] or None,
                status=row.get("status") or "AVAILABLE",
            )
        )


def seed_shelters():
    for row in _read_csv("sample_shelters.csv"):
        db.session.add(
            Shelter(
                name=row["name"],
                latitude=float(row["latitude"]),
                longitude=float(row["longitude"]),
                capacity=int(row["capacity"]),
                occupied=int(row["occupied"]),
                status=row.get("status") or "OPEN",
                contact=row["contact"] or None,
            )
        )


def seed_supplies():
    for row in _read_csv("sample_supplies.csv"):
        db.session.add(
            Supply(
                location=row["location"],
                latitude=float(row["latitude"]),
                longitude=float(row["longitude"]),
                food_packets=int(row["food_packets"]),
                water_units=int(row["water_units"]),
                medical_kits=int(row["medical_kits"]),
                blankets=int(row["blankets"]),
                status=row.get("status") or "AVAILABLE",
            )
        )


def seed_alerts():
    if not os.path.exists(SAMPLE_ALERTS_PATH):
        print(f"No sample_alerts.json found at {SAMPLE_ALERTS_PATH}, skipping alerts.")
        return
    with open(SAMPLE_ALERTS_PATH, encoding="utf-8") as f:
        alerts = json.load(f)
    for item in alerts:
        db.session.add(
            Alert(
                alert_type=item["alert_type"],
                severity=item["severity"],
                message=item["message"],
                latitude=item.get("latitude"),
                longitude=item.get("longitude"),
                source=item.get("source", "SAMPLE"),
                status=item.get("status", "ACTIVE"),
            )
        )


def main():
    app = create_app()
    with app.app_context():
        print("Clearing existing sample-seedable tables...")
        Incident.query.delete()
        Team.query.delete()
        Shelter.query.delete()
        Supply.query.delete()
        Alert.query.delete()
        db.session.commit()

        print("Seeding incidents...")
        seed_incidents()
        print("Seeding teams...")
        seed_teams()
        print("Seeding shelters...")
        seed_shelters()
        print("Seeding supplies...")
        seed_supplies()
        print("Seeding alerts...")
        seed_alerts()

        db.session.commit()
        print("Done.")


if __name__ == "__main__":
    main()

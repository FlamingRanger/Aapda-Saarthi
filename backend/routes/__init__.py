"""Routes package — collects all blueprints for registration in app.py."""

from routes.alerts import alerts_bp
from routes.dashboard import dashboard_bp
from routes.health import health_bp
from routes.incidents import incidents_bp
from routes.shelters import shelters_bp
from routes.supplies import supplies_bp
from routes.teams import teams_bp

all_blueprints = [
    health_bp,
    incidents_bp,
    teams_bp,
    shelters_bp,
    supplies_bp,
    alerts_bp,
    dashboard_bp,
]

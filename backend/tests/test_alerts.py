from models import db
from models.alert import Alert


def _seed_alert(app):
    with app.app_context():
        alert = Alert(
            alert_type="HEAVY_RAIN",
            severity="HIGH",
            message="Heavy rain expected.",
            latitude=22.26,
            longitude=84.85,
            source="SAMPLE",
            status="ACTIVE",
        )
        db.session.add(alert)
        db.session.commit()
        return alert.id


def test_list_alerts(app, client):
    _seed_alert(app)
    resp = client.get("/api/alerts")
    assert resp.status_code == 200
    assert len(resp.get_json()) == 1


def test_get_alert_not_found(client):
    resp = client.get("/api/alerts/9999")
    assert resp.status_code == 404


def test_update_alert_status(app, client):
    alert_id = _seed_alert(app)
    resp = client.put(f"/api/alerts/{alert_id}", json={"status": "EXPIRED"})
    assert resp.status_code == 200
    assert resp.get_json()["status"] == "EXPIRED"


def test_update_alert_invalid_status(app, client):
    alert_id = _seed_alert(app)
    resp = client.put(f"/api/alerts/{alert_id}", json={"status": "NOT_VALID"})
    assert resp.status_code == 400


def test_dashboard_stats(client):
    resp = client.get("/api/dashboard/stats")
    assert resp.status_code == 200
    body = resp.get_json()
    assert "total_incidents" in body
    assert "teams_available" in body


def test_dashboard_map_data(client):
    resp = client.get("/api/dashboard/map-data")
    assert resp.status_code == 200
    body = resp.get_json()
    for key in ("incidents", "teams", "shelters", "supplies", "alerts", "heatmap"):
        assert key in body

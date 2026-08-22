def test_health(client):
    resp = client.get("/api/health")
    assert resp.status_code == 200
    assert resp.get_json()["status"] == "ok"


def test_create_incident_success(client):
    payload = {
        "incident_type": "FLOOD",
        "severity": "HIGH",
        "latitude": 22.26,
        "longitude": 84.85,
        "description": "Water rising fast",
        "reporter_name": "Test User",
        "phone": "9999999999",
    }
    resp = client.post("/api/incidents", json=payload)
    assert resp.status_code == 201
    body = resp.get_json()
    assert "id" in body
    assert body["incident"]["status"] == "REPORTED"
    assert body["incident"]["incident_type"] == "FLOOD"


def test_create_incident_missing_required_field(client):
    payload = {"severity": "HIGH", "latitude": 22.26, "longitude": 84.85}
    resp = client.post("/api/incidents", json=payload)
    assert resp.status_code == 400
    assert "error" in resp.get_json()


def test_create_incident_invalid_type(client):
    payload = {
        "incident_type": "NOT_A_TYPE",
        "severity": "HIGH",
        "latitude": 22.26,
        "longitude": 84.85,
    }
    resp = client.post("/api/incidents", json=payload)
    assert resp.status_code == 400


def test_create_incident_invalid_latitude(client):
    payload = {
        "incident_type": "FLOOD",
        "severity": "HIGH",
        "latitude": 999,
        "longitude": 84.85,
    }
    resp = client.post("/api/incidents", json=payload)
    assert resp.status_code == 400


def test_list_and_get_incident(client):
    payload = {
        "incident_type": "MEDICAL",
        "severity": "CRITICAL",
        "latitude": 22.25,
        "longitude": 84.84,
    }
    create_resp = client.post("/api/incidents", json=payload)
    incident_id = create_resp.get_json()["id"]

    list_resp = client.get("/api/incidents")
    assert list_resp.status_code == 200
    assert any(i["id"] == incident_id for i in list_resp.get_json())

    get_resp = client.get(f"/api/incidents/{incident_id}")
    assert get_resp.status_code == 200
    assert get_resp.get_json()["id"] == incident_id


def test_get_incident_not_found(client):
    resp = client.get("/api/incidents/99999")
    assert resp.status_code == 404


def test_update_incident_status(client):
    payload = {
        "incident_type": "FIRE",
        "severity": "MEDIUM",
        "latitude": 22.25,
        "longitude": 84.84,
    }
    create_resp = client.post("/api/incidents", json=payload)
    incident_id = create_resp.get_json()["id"]

    update_resp = client.put(f"/api/incidents/{incident_id}", json={"status": "VERIFIED"})
    assert update_resp.status_code == 200
    assert update_resp.get_json()["status"] == "VERIFIED"


def test_update_incident_invalid_status(client):
    payload = {
        "incident_type": "FIRE",
        "severity": "MEDIUM",
        "latitude": 22.25,
        "longitude": 84.84,
    }
    create_resp = client.post("/api/incidents", json=payload)
    incident_id = create_resp.get_json()["id"]

    update_resp = client.put(f"/api/incidents/{incident_id}", json={"status": "NOT_A_STATUS"})
    assert update_resp.status_code == 400

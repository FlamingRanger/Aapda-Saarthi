def _create_team(client, **overrides):
    payload = {
        "team_name": "Team-Test",
        "team_type": "GENERAL_RESCUE",
        "latitude": 22.26,
        "longitude": 84.85,
        "members": 5,
        "vehicle_type": "Truck",
    }
    payload.update(overrides)
    return client.post("/api/teams", json=payload)


def test_create_and_list_team(client):
    resp = _create_team(client)
    assert resp.status_code == 201
    team_id = resp.get_json()["id"]

    list_resp = client.get("/api/teams")
    assert list_resp.status_code == 200
    assert any(t["id"] == team_id for t in list_resp.get_json())


def test_create_team_invalid_type(client):
    resp = _create_team(client, team_type="NOT_A_TYPE")
    assert resp.status_code == 400


def test_update_team_status(client):
    team_id = _create_team(client).get_json()["id"]
    resp = client.put(f"/api/teams/{team_id}", json={"status": "BUSY"})
    assert resp.status_code == 200
    assert resp.get_json()["status"] == "BUSY"


def test_shelter_available_capacity_never_negative(client):
    payload = {
        "name": "Test Shelter",
        "latitude": 22.26,
        "longitude": 84.85,
        "capacity": 50,
        "occupied": 200,  # deliberately over capacity
    }
    resp = client.post("/api/shelters", json=payload)
    assert resp.status_code == 201
    body = resp.get_json()
    assert body["available_capacity"] >= 0


def test_shelter_update_marks_full_when_at_capacity(client):
    payload = {"name": "S1", "latitude": 22.26, "longitude": 84.85, "capacity": 10, "occupied": 0}
    shelter_id = client.post("/api/shelters", json=payload).get_json()["id"]

    resp = client.put(f"/api/shelters/{shelter_id}", json={"occupied": 10})
    assert resp.status_code == 200
    body = resp.get_json()
    assert body["available_capacity"] == 0
    assert body["status"] == "FULL"


def test_create_supply_and_get(client):
    payload = {
        "location": "Depot A",
        "latitude": 22.26,
        "longitude": 84.85,
        "food_packets": 100,
        "water_units": 50,
        "medical_kits": 10,
        "blankets": 20,
    }
    resp = client.post("/api/supplies", json=payload)
    assert resp.status_code == 201
    supply_id = resp.get_json()["id"]

    get_resp = client.get(f"/api/supplies/{supply_id}")
    assert get_resp.status_code == 200
    assert get_resp.get_json()["food_packets"] == 100


def test_create_supply_negative_quantity_rejected(client):
    payload = {
        "location": "Depot B",
        "latitude": 22.26,
        "longitude": 84.85,
        "food_packets": -5,
    }
    resp = client.post("/api/supplies", json=payload)
    assert resp.status_code == 400

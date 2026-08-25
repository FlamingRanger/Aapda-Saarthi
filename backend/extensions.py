"""
Shared extension instances (SocketIO) and typed real-time emit helpers.

Routes/services import `socketio` and the `emit_*` helpers from here
instead of constructing ad-hoc emit() calls, so every event payload
stays consistent with integrations/socket/event_contracts.md.
"""

from flask_socketio import SocketIO

socketio = SocketIO(cors_allowed_origins="*", async_mode="threading")



def emit_new_incident(incident_dict: dict):
    socketio.emit("new_incident", incident_dict)


def emit_incident_updated(incident_dict: dict):
    socketio.emit("incident_updated", incident_dict)


def emit_team_assigned(payload: dict):
    socketio.emit("team_assigned", payload)


def emit_team_status_changed(team_dict: dict):
    socketio.emit("team_status_changed", team_dict)


def emit_shelter_updated(shelter_dict: dict):
    socketio.emit("shelter_updated", shelter_dict)


def emit_supply_updated(supply_dict: dict):
    socketio.emit("supply_updated", supply_dict)


def emit_weather_alert(alert_dict: dict):
    socketio.emit("weather_alert", alert_dict)

"""Rescue Team model."""

from models import db


class Team(db.Model):
    __tablename__ = "teams"

    id = db.Column(db.Integer, primary_key=True)
    team_name = db.Column(db.String(80), nullable=False)
    team_type = db.Column(db.String(30), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    members = db.Column(db.Integer, nullable=False, default=1)
    vehicle_type = db.Column(db.String(50), nullable=True)
    status = db.Column(db.String(20), nullable=False, default="AVAILABLE")
    current_assignment = db.Column(db.Integer, db.ForeignKey("incidents.id"), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "team_name": self.team_name,
            "team_type": self.team_type,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "members": self.members,
            "vehicle_type": self.vehicle_type,
            "status": self.status,
            "current_assignment": self.current_assignment,
        }

    def __repr__(self):
        return f"<Team {self.id} {self.team_name} {self.status}>"

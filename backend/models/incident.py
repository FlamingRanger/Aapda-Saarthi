"""Incident model — citizen disaster reports."""

from datetime import datetime, timezone

from models import db


def utcnow():
    return datetime.now(timezone.utc)


class Incident(db.Model):
    __tablename__ = "incidents"

    id = db.Column(db.Integer, primary_key=True)
    reporter_name = db.Column(db.String(120), nullable=True)
    phone = db.Column(db.String(20), nullable=True)
    incident_type = db.Column(db.String(30), nullable=False)
    description = db.Column(db.Text, nullable=True)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    severity = db.Column(db.String(10), nullable=False)
    photo_path = db.Column(db.String(255), nullable=True)
    status = db.Column(db.String(20), nullable=False, default="REPORTED")
    created_at = db.Column(db.DateTime, default=utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=utcnow, onupdate=utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "reporter_name": self.reporter_name,
            "phone": self.phone,
            "incident_type": self.incident_type,
            "description": self.description,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "severity": self.severity,
            "photo_path": self.photo_path,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self):
        return f"<Incident {self.id} {self.incident_type} {self.severity}>"

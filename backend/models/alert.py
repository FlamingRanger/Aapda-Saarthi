"""Weather / official early-warning Alert model."""

from datetime import datetime, timezone

from models import db


def utcnow():
    return datetime.now(timezone.utc)


class Alert(db.Model):
    __tablename__ = "alerts"

    id = db.Column(db.Integer, primary_key=True)
    alert_type = db.Column(db.String(30), nullable=False)
    severity = db.Column(db.String(10), nullable=False)
    message = db.Column(db.Text, nullable=False)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    source = db.Column(db.String(50), nullable=False, default="SAMPLE")
    start_time = db.Column(db.DateTime, nullable=True)
    end_time = db.Column(db.DateTime, nullable=True)
    status = db.Column(db.String(20), nullable=False, default="ACTIVE")
    created_at = db.Column(db.DateTime, default=utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "alert_type": self.alert_type,
            "severity": self.severity,
            "message": self.message,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "source": self.source,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "end_time": self.end_time.isoformat() if self.end_time else None,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f"<Alert {self.id} {self.alert_type} {self.severity}>"

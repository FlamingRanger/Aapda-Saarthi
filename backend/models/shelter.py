"""Shelter model."""

from models import db


class Shelter(db.Model):
    __tablename__ = "shelters"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    capacity = db.Column(db.Integer, nullable=False, default=0)
    occupied = db.Column(db.Integer, nullable=False, default=0)
    status = db.Column(db.String(20), nullable=False, default="OPEN")
    contact = db.Column(db.String(50), nullable=True)

    @property
    def available_capacity(self):
        # Never negative — clamp defensively even if data is inconsistent.
        return max(self.capacity - self.occupied, 0)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "capacity": self.capacity,
            "occupied": self.occupied,
            "available_capacity": self.available_capacity,
            "status": self.status,
            "contact": self.contact,
        }

    def __repr__(self):
        return f"<Shelter {self.id} {self.name}>"

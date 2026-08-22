"""Supply center model."""

from models import db


class Supply(db.Model):
    __tablename__ = "supplies"

    id = db.Column(db.Integer, primary_key=True)
    location = db.Column(db.String(120), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    food_packets = db.Column(db.Integer, nullable=False, default=0)
    water_units = db.Column(db.Integer, nullable=False, default=0)
    medical_kits = db.Column(db.Integer, nullable=False, default=0)
    blankets = db.Column(db.Integer, nullable=False, default=0)
    status = db.Column(db.String(20), nullable=False, default="AVAILABLE")

    def to_dict(self):
        return {
            "id": self.id,
            "location": self.location,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "food_packets": self.food_packets,
            "water_units": self.water_units,
            "medical_kits": self.medical_kits,
            "blankets": self.blankets,
            "status": self.status,
        }

    def __repr__(self):
        return f"<Supply {self.id} {self.location}>"

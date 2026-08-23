import { Marker, Popup } from "react-leaflet";
import type { Shelter } from "../../types/shelter";
import { shelterIcon } from "./markerIcons";

export default function ShelterMarkers({ shelters }: { shelters: Shelter[] }) {
  return (
    <>
      {shelters.map((shelter) => (
        <Marker
          key={`shelter-${shelter.id}`}
          position={[shelter.latitude, shelter.longitude]}
          icon={shelterIcon()}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{shelter.name}</p>
              <p>Status: {shelter.status}</p>
              <p>
                Occupied: {shelter.occupied}/{shelter.capacity}
              </p>
              <p>Available: {shelter.available_capacity}</p>
              {shelter.contact && <p>Contact: {shelter.contact}</p>}
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

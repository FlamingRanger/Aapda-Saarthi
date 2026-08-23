import { Marker, Popup } from "react-leaflet";
import type { SupplyCenter } from "../../types/supply";
import { supplyIcon } from "./markerIcons";

export default function SupplyMarkers({ supplies }: { supplies: SupplyCenter[] }) {
  return (
    <>
      {supplies.map((supply) => (
        <Marker
          key={`supply-${supply.id}`}
          position={[supply.latitude, supply.longitude]}
          icon={supplyIcon()}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{supply.location}</p>
              <p>Status: {supply.status}</p>
              <p>Food packets: {supply.food_packets}</p>
              <p>Water units: {supply.water_units}</p>
              <p>Medical kits: {supply.medical_kits}</p>
              <p>Blankets: {supply.blankets}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

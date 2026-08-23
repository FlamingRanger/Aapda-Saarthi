import type { Shelter } from "../../types/shelter";
import StatusBadge from "../common/StatusBadge";
import CapacityBar from "./CapacityBar";
import { SHELTER_STATUS_CLASSES } from "../../utils/status";

export default function ShelterCard({ shelter }: { shelter: Shelter }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-slate-800">{shelter.name}</p>
        <StatusBadge status={shelter.status} classMap={SHELTER_STATUS_CLASSES} />
      </div>
      <div className="mt-2">
        <CapacityBar occupied={shelter.occupied} capacity={shelter.capacity} />
      </div>
      <div className="mt-2 grid grid-cols-3 gap-1 text-xs text-slate-600">
        <span>Occupied: {shelter.occupied}</span>
        <span>Available: {shelter.available_capacity}</span>
        <span>Capacity: {shelter.capacity}</span>
      </div>
      {shelter.contact && <p className="mt-1 text-xs text-slate-400">Contact: {shelter.contact}</p>}
    </div>
  );
}

import type { SupplyCenter } from "../../types/supply";
import StatusBadge from "../common/StatusBadge";
import { SUPPLY_STATUS_CLASSES } from "../../utils/status";

export default function SupplyCard({ supply }: { supply: SupplyCenter }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-slate-800">{supply.location}</p>
        <StatusBadge status={supply.status} classMap={SUPPLY_STATUS_CLASSES} />
      </div>
      <div className="mt-2 grid grid-cols-2 gap-1 text-xs text-slate-600">
        <span>🍚 Food: {supply.food_packets}</span>
        <span>💧 Water: {supply.water_units}</span>
        <span>🩹 Medical: {supply.medical_kits}</span>
        <span>🧣 Blankets: {supply.blankets}</span>
      </div>
    </div>
  );
}

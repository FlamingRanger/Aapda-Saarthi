export const SUPPLY_STATUSES = ["AVAILABLE", "LOW", "DEPLETED"] as const;
export type SupplyStatus = (typeof SUPPLY_STATUSES)[number];

export interface SupplyCenter {
  id: number;
  location: string;
  latitude: number;
  longitude: number;
  food_packets: number;
  water_units: number;
  medical_kits: number;
  blankets: number;
  status: SupplyStatus | string;
}

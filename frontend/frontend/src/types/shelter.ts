export const SHELTER_STATUSES = ["OPEN", "FULL", "CLOSED"] as const;
export type ShelterStatus = (typeof SHELTER_STATUSES)[number];

export interface Shelter {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  capacity: number;
  occupied: number;
  available_capacity: number;
  status: ShelterStatus | string;
  contact: string | null;
}

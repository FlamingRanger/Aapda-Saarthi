export const TEAM_TYPES = [
  "FLOOD_RESCUE",
  "MEDICAL",
  "FIRE",
  "GENERAL_RESCUE",
  "ROAD_CLEARANCE",
  "LANDSLIDE_RESCUE",
] as const;
export type TeamType = (typeof TEAM_TYPES)[number];

export const TEAM_STATUSES = [
  "AVAILABLE",
  "BUSY",
  "EN_ROUTE",
  "ON_SITE",
  "OFFLINE",
] as const;
export type TeamStatus = (typeof TEAM_STATUSES)[number];

export interface RescueTeam {
  id: number;
  team_name: string;
  team_type: TeamType | string;
  latitude: number;
  longitude: number;
  members: number;
  vehicle_type: string | null;
  status: TeamStatus | string;
  current_assignment: number | null;
}

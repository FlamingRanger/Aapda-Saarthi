import type { Incident } from "./incident";
import type { RescueTeam } from "./team";
import type { Shelter } from "./shelter";
import type { SupplyCenter } from "./supply";
import type { DisasterAlert } from "./alert";

export interface TeamAssignedPayload {
  incident_id: number;
  resource_id: number;
  resource_name: string;
  incident: Incident;
  team: RescueTeam;
}

export interface SocketEventMap {
  new_incident: Incident;
  incident_updated: Incident;
  team_assigned: TeamAssignedPayload;
  team_status_changed: RescueTeam;
  shelter_updated: Shelter;
  supply_updated: SupplyCenter;
  weather_alert: DisasterAlert;
}

export type SocketEventName = keyof SocketEventMap;

export type ConnectionState = "ONLINE" | "OFFLINE" | "RECONNECTING";

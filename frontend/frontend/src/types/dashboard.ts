import type { Incident } from "./incident";
import type { RescueTeam } from "./team";
import type { Shelter } from "./shelter";
import type { SupplyCenter } from "./supply";
import type { DisasterAlert } from "./alert";

export interface DashboardStats {
  total_incidents: number;
  active_incidents: number;
  critical_incidents: number;
  resolved_incidents: number;
  severity_breakdown: Record<string, number>;
  type_breakdown: Record<string, number>;
  teams_total: number;
  teams_available: number;
  teams_busy: number;
  shelters_total: number;
  shelter_capacity_total: number;
  shelter_available_capacity: number;
  supply_centers_total: number;
  active_alerts: number;
}

export interface HeatmapPoint {
  latitude: number;
  longitude: number;
  weight: number;
}

export interface MapData {
  incidents: Incident[];
  teams: RescueTeam[];
  shelters: Shelter[];
  supplies: SupplyCenter[];
  alerts: DisasterAlert[];
  heatmap: HeatmapPoint[];
}

export interface ResourceCandidate {
  resource_id: number;
  resource_name: string;
  team_type: string;
  distance_km: number;
  proximity_score: number;
  availability_score: number;
  capacity_score: number;
  priority_score: number;
  score: number;
  reason?: string;
}

export interface RecommendationResult {
  incident_id: number;
  recommendation: ResourceCandidate | null;
  candidates: ResourceCandidate[];
  reason?: string;
}

export interface AllocateResponse {
  incident: Incident;
  team: RescueTeam;
  message: string;
}

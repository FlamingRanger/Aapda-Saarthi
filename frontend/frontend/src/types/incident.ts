export const INCIDENT_TYPES = [
  "FLOOD",
  "LANDSLIDE",
  "CYCLONE",
  "FIRE",
  "ROAD_BLOCK",
  "MEDICAL",
  "TRAPPED_PERSON",
  "BUILDING_DAMAGE",
  "OTHER",
] as const;
export type IncidentType = (typeof INCIDENT_TYPES)[number];

export const SEVERITY_LEVELS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export type Severity = (typeof SEVERITY_LEVELS)[number];

export const INCIDENT_STATUSES = [
  "REPORTED",
  "VERIFIED",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
  "REJECTED",
] as const;
export type IncidentStatus = (typeof INCIDENT_STATUSES)[number];

export interface Incident {
  id: number;
  reporter_name: string | null;
  phone: string | null;
  incident_type: IncidentType | string;
  description: string | null;
  latitude: number;
  longitude: number;
  severity: Severity | string;
  photo_path: string | null;
  status: IncidentStatus | string;
  created_at: string | null;
  updated_at: string | null;
}

export interface CreateIncidentPayload {
  reporter_name?: string;
  phone?: string;
  incident_type: IncidentType;
  description?: string;
  latitude: number;
  longitude: number;
  severity: Severity;
  photo?: File | null;
}

export interface CreateIncidentResponse {
  id: number;
  incident: Incident;
}

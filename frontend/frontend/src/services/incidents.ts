import { apiClient } from "./api";
import type {
  CreateIncidentPayload,
  CreateIncidentResponse,
  Incident,
} from "../types/incident";
import type { RecommendationResult, AllocateResponse } from "../types/dashboard";

export interface IncidentFilters {
  status?: string;
  severity?: string;
  incident_type?: string;
}

export async function listIncidents(filters: IncidentFilters = {}): Promise<Incident[]> {
  const { data } = await apiClient.get<Incident[]>("/incidents", { params: filters });
  return data;
}

export async function getIncident(id: number): Promise<Incident> {
  const { data } = await apiClient.get<Incident>(`/incidents/${id}`);
  return data;
}

export async function createIncident(
  payload: CreateIncidentPayload
): Promise<CreateIncidentResponse> {
  if (payload.photo) {
    const form = new FormData();
    form.append("incident_type", payload.incident_type);
    form.append("severity", payload.severity);
    form.append("latitude", String(payload.latitude));
    form.append("longitude", String(payload.longitude));
    if (payload.description) form.append("description", payload.description);
    if (payload.reporter_name) form.append("reporter_name", payload.reporter_name);
    if (payload.phone) form.append("phone", payload.phone);
    form.append("photo", payload.photo);

    const { data } = await apiClient.post<CreateIncidentResponse>("/incidents", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  }

  const { data } = await apiClient.post<CreateIncidentResponse>("/incidents", {
    incident_type: payload.incident_type,
    severity: payload.severity,
    latitude: payload.latitude,
    longitude: payload.longitude,
    description: payload.description,
    reporter_name: payload.reporter_name,
    phone: payload.phone,
  });
  return data;
}

export async function updateIncident(
  id: number,
  data: Partial<Pick<Incident, "status" | "severity" | "description">>
): Promise<Incident> {
  const { data: updated } = await apiClient.put<Incident>(`/incidents/${id}`, data);
  return updated;
}

export async function recommendResource(incidentId: number): Promise<RecommendationResult> {
  const { data } = await apiClient.post<RecommendationResult>(
    `/incidents/${incidentId}/recommend-resource`
  );
  return data;
}

export async function allocateResource(
  incidentId: number,
  resourceId: number
): Promise<AllocateResponse> {
  const { data } = await apiClient.post<AllocateResponse>(`/incidents/${incidentId}/allocate`, {
    resource_id: resourceId,
  });
  return data;
}

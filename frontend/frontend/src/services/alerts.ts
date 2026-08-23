import { apiClient } from "./api";
import type { DisasterAlert } from "../types/alert";

export async function listAlerts(status?: string): Promise<DisasterAlert[]> {
  const { data } = await apiClient.get<DisasterAlert[]>("/alerts", {
    params: status ? { status } : {},
  });
  return data;
}

export async function updateAlert(
  id: number,
  updates: Partial<DisasterAlert>
): Promise<DisasterAlert> {
  const { data } = await apiClient.put<DisasterAlert>(`/alerts/${id}`, updates);
  return data;
}

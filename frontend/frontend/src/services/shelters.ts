import { apiClient } from "./api";
import type { Shelter } from "../types/shelter";

export async function listShelters(status?: string): Promise<Shelter[]> {
  const { data } = await apiClient.get<Shelter[]>("/shelters", {
    params: status ? { status } : {},
  });
  return data;
}

export async function updateShelter(id: number, updates: Partial<Shelter>): Promise<Shelter> {
  const { data } = await apiClient.put<Shelter>(`/shelters/${id}`, updates);
  return data;
}

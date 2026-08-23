import { apiClient } from "./api";
import type { RescueTeam } from "../types/team";

export interface TeamFilters {
  status?: string;
  team_type?: string;
}

export async function listTeams(filters: TeamFilters = {}): Promise<RescueTeam[]> {
  const { data } = await apiClient.get<RescueTeam[]>("/teams", { params: filters });
  return data;
}

export async function getTeam(id: number): Promise<RescueTeam> {
  const { data } = await apiClient.get<RescueTeam>(`/teams/${id}`);
  return data;
}

export async function updateTeam(
  id: number,
  updates: Partial<RescueTeam>
): Promise<RescueTeam> {
  const { data } = await apiClient.put<RescueTeam>(`/teams/${id}`, updates);
  return data;
}

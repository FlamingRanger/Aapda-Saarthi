import { apiClient } from "./api";
import type { DashboardStats, MapData } from "../types/dashboard";

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await apiClient.get<DashboardStats>("/dashboard/stats");
  return data;
}

export async function getMapData(): Promise<MapData> {
  const { data } = await apiClient.get<MapData>("/dashboard/map-data");
  return data;
}

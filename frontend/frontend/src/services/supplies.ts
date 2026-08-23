import { apiClient } from "./api";
import type { SupplyCenter } from "../types/supply";

export async function listSupplies(status?: string): Promise<SupplyCenter[]> {
  const { data } = await apiClient.get<SupplyCenter[]>("/supplies", {
    params: status ? { status } : {},
  });
  return data;
}

export async function updateSupply(
  id: number,
  updates: Partial<SupplyCenter>
): Promise<SupplyCenter> {
  const { data } = await apiClient.put<SupplyCenter>(`/supplies/${id}`, updates);
  return data;
}

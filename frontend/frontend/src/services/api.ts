/**
 * Central Axios instance. The backend base URL comes from
 * VITE_API_BASE_URL (see .env.example) — never hardcode it.
 */
import axios, { AxiosError } from "axios";
import { ApiError } from "../types/api";

export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 15000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string }>) => {
    const status = error.response?.status ?? 0;
    const message =
      error.response?.data?.error ||
      (status === 0
        ? "Could not reach the server. Check your connection."
        : "Something went wrong. Please try again.");
    return Promise.reject(new ApiError(message, status));
  }
);

/** Resolve a backend-relative path (e.g. an uploaded photo) to an absolute URL. */
export function resolveBackendUrl(relativePath: string): string {
  const cleaned = relativePath.replace(/^\/+/, "");
  return `${API_BASE_URL}/${cleaned}`;
}

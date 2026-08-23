import type { Severity } from "../types/incident";

export const SEVERITY_COLORS: Record<string, string> = {
  LOW: "#16a34a",
  MEDIUM: "#ca8a04",
  HIGH: "#ea580c",
  CRITICAL: "#dc2626",
};

export const SEVERITY_BADGE_CLASSES: Record<string, string> = {
  LOW: "bg-green-100 text-green-800 border-green-300",
  MEDIUM: "bg-yellow-100 text-yellow-800 border-yellow-300",
  HIGH: "bg-orange-100 text-orange-800 border-orange-300",
  CRITICAL: "bg-red-100 text-red-800 border-red-300",
};

export const SEVERITY_HEATMAP_WEIGHT: Record<string, number> = {
  LOW: 0.25,
  MEDIUM: 0.5,
  HIGH: 0.75,
  CRITICAL: 1.0,
};

export function severityColor(severity: string): string {
  return SEVERITY_COLORS[severity] ?? "#64748b";
}

export function severityBadgeClass(severity: string): string {
  return SEVERITY_BADGE_CLASSES[severity] ?? "bg-slate-100 text-slate-800 border-slate-300";
}

export function severityRank(severity: Severity | string): number {
  const order = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
  return order.indexOf(severity as string);
}

export const INCIDENT_STATUS_CLASSES: Record<string, string> = {
  REPORTED: "bg-slate-100 text-slate-700 border-slate-300",
  VERIFIED: "bg-blue-100 text-blue-700 border-blue-300",
  ASSIGNED: "bg-indigo-100 text-indigo-700 border-indigo-300",
  IN_PROGRESS: "bg-purple-100 text-purple-700 border-purple-300",
  RESOLVED: "bg-green-100 text-green-700 border-green-300",
  REJECTED: "bg-red-100 text-red-700 border-red-300",
};

export const TEAM_STATUS_CLASSES: Record<string, string> = {
  AVAILABLE: "bg-green-100 text-green-700 border-green-300",
  BUSY: "bg-orange-100 text-orange-700 border-orange-300",
  EN_ROUTE: "bg-blue-100 text-blue-700 border-blue-300",
  ON_SITE: "bg-purple-100 text-purple-700 border-purple-300",
  OFFLINE: "bg-slate-200 text-slate-600 border-slate-300",
};

export const SHELTER_STATUS_CLASSES: Record<string, string> = {
  OPEN: "bg-green-100 text-green-700 border-green-300",
  FULL: "bg-orange-100 text-orange-700 border-orange-300",
  CLOSED: "bg-slate-200 text-slate-600 border-slate-300",
};

export const SUPPLY_STATUS_CLASSES: Record<string, string> = {
  AVAILABLE: "bg-green-100 text-green-700 border-green-300",
  LOW: "bg-orange-100 text-orange-700 border-orange-300",
  DEPLETED: "bg-red-100 text-red-700 border-red-300",
};

export const ALERT_STATUS_CLASSES: Record<string, string> = {
  ACTIVE: "bg-red-100 text-red-700 border-red-300",
  EXPIRED: "bg-slate-200 text-slate-600 border-slate-300",
  CANCELLED: "bg-slate-200 text-slate-600 border-slate-300",
};

export function classForStatus(map: Record<string, string>, status: string): string {
  return map[status] ?? "bg-slate-100 text-slate-700 border-slate-300";
}

export function formatDateTime(iso: string | null): string {
  if (!iso) return "Unknown time";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Unknown time";
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function formatLabel(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

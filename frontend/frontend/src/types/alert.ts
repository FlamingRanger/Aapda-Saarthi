export const ALERT_TYPES = [
  "HEAVY_RAIN",
  "CYCLONE",
  "STRONG_WIND",
  "EXTREME_RAINFALL",
  "FLOOD_WARNING",
] as const;
export type AlertType = (typeof ALERT_TYPES)[number];

export const ALERT_STATUSES = ["ACTIVE", "EXPIRED", "CANCELLED"] as const;
export type AlertStatus = (typeof ALERT_STATUSES)[number];

export interface DisasterAlert {
  id: number;
  alert_type: AlertType | string;
  severity: string;
  message: string;
  latitude: number | null;
  longitude: number | null;
  source: string;
  start_time: string | null;
  end_time: string | null;
  status: AlertStatus | string;
  created_at: string | null;
}

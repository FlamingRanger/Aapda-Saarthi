import Badge from "./Badge";
import { classForStatus, formatLabel } from "../../utils/status";

interface StatusBadgeProps {
  status: string;
  classMap: Record<string, string>;
}

export default function StatusBadge({ status, classMap }: StatusBadgeProps) {
  return <Badge label={formatLabel(status)} className={classForStatus(classMap, status)} />;
}

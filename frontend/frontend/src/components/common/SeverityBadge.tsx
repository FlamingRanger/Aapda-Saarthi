import Badge from "./Badge";
import { severityBadgeClass } from "../../utils/severity";

export default function SeverityBadge({ severity }: { severity: string }) {
  return <Badge label={severity} className={severityBadgeClass(severity)} />;
}

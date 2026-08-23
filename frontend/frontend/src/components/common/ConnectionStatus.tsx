import { useOnlineStatus } from "../../hooks/useOnlineStatus";
import { useSocketConnectionState } from "../../hooks/useSocket";

export default function ConnectionStatus() {
  const isBrowserOnline = useOnlineStatus();
  const socketState = useSocketConnectionState();

  if (!isBrowserOnline) {
    return <Pill label="OFFLINE" dotClass="bg-red-500" textClass="text-red-700 bg-red-50" />;
  }
  if (socketState === "ONLINE") {
    return <Pill label="LIVE" dotClass="bg-green-500" textClass="text-green-700 bg-green-50" />;
  }
  if (socketState === "RECONNECTING") {
    return (
      <Pill
        label="RECONNECTING"
        dotClass="bg-yellow-500 animate-pulse"
        textClass="text-yellow-800 bg-yellow-50"
      />
    );
  }
  return <Pill label="OFFLINE" dotClass="bg-red-500" textClass="text-red-700 bg-red-50" />;
}

function Pill({
  label,
  dotClass,
  textClass,
}: {
  label: string;
  dotClass: string;
  textClass: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${textClass}`}
    >
      <span className={`h-2 w-2 rounded-full ${dotClass}`} />
      {label}
    </span>
  );
}

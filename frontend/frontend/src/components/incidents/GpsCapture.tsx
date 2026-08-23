import { useEffect } from "react";
import Button from "../common/Button";
import { useGeolocation } from "../../hooks/useGeolocation";

interface GpsCaptureProps {
  onCaptured: (lat: number, lon: number) => void;
  manualLat: string;
  manualLon: string;
  onManualChange: (lat: string, lon: string) => void;
}

export default function GpsCapture({
  onCaptured,
  manualLat,
  manualLon,
  onManualChange,
}: GpsCaptureProps) {
  const { position, status, error, requestLocation } = useGeolocation();

  useEffect(() => {
    if (position) {
      onCaptured(position.latitude, position.longitude);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={requestLocation}
          isLoading={status === "loading"}
        >
          📍 Use my current location
        </Button>
        {status === "success" && position && (
          <span className="text-xs text-green-700">
            Captured ({position.latitude.toFixed(5)}, {position.longitude.toFixed(5)}) — accuracy ~
            {Math.round(position.accuracy)}m
          </span>
        )}
      </div>

      {(status === "denied" || status === "unavailable" || status === "error") && error && (
        <p className="text-xs text-orange-700">{error} Enter coordinates manually below.</p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <label className="text-xs font-medium text-slate-600">
          Latitude
          <input
            type="number"
            step="any"
            value={manualLat}
            onChange={(e) => onManualChange(e.target.value, manualLon)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="e.g. 22.2604"
          />
        </label>
        <label className="text-xs font-medium text-slate-600">
          Longitude
          <input
            type="number"
            step="any"
            value={manualLon}
            onChange={(e) => onManualChange(manualLat, e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="e.g. 84.8536"
          />
        </label>
      </div>
    </div>
  );
}

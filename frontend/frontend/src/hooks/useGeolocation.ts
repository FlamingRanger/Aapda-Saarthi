import { useCallback, useState } from "react";

export interface GeoPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export type GeoStatus = "idle" | "loading" | "success" | "denied" | "unavailable" | "error";

interface UseGeolocationResult {
  position: GeoPosition | null;
  status: GeoStatus;
  error: string | null;
  requestLocation: () => void;
}

export function useGeolocation(): UseGeolocationResult {
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [status, setStatus] = useState<GeoStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setStatus("unavailable");
      setError("Location services are not supported on this device.");
      return;
    }

    setStatus("loading");
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setStatus("success");
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setStatus("denied");
          setError("Location permission was denied. You can enter coordinates manually.");
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setStatus("unavailable");
          setError("Your location could not be determined.");
        } else {
          setStatus("error");
          setError("Timed out while getting your location. Try again.");
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  }, []);

  return { position, status, error, requestLocation };
}

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";
import type { HeatmapPoint } from "../../types/dashboard";

// leaflet.heat augments the L namespace at runtime without shipping types;
// this narrow local type keeps us out of `any` everywhere else.
type HeatLayerFactory = (
  points: Array<[number, number, number]>,
  options?: Record<string, unknown>
) => L.Layer;

export default function HeatmapLayer({ points }: { points: HeatmapPoint[] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) return;
    const heatFactory = (L as unknown as { heatLayer: HeatLayerFactory }).heatLayer;
    if (!heatFactory) return;

    const layer = heatFactory(
      points.map((p) => [p.latitude, p.longitude, p.weight]),
      { radius: 30, blur: 20, maxZoom: 15 }
    );
    layer.addTo(map);

    return () => {
      map.removeLayer(layer);
    };
  }, [map, points]);

  return null;
}

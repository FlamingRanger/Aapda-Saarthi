export default function CapacityBar({ occupied, capacity }: { occupied: number; capacity: number }) {
  const pct = capacity > 0 ? Math.min(100, Math.round((occupied / capacity) * 100)) : 0;
  const color = pct >= 100 ? "bg-red-500" : pct >= 75 ? "bg-orange-500" : "bg-green-500";
  return (
    <div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1 text-xs text-slate-500">{pct}% occupied</p>
    </div>
  );
}

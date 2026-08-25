import { NavLink, Outlet } from "react-router-dom";
import ConnectionStatus from "../components/common/ConnectionStatus";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Overview", end: true },
  { to: "/dashboard/map", label: "Map" },
  { to: "/dashboard/teams", label: "Teams" },
  { to: "/dashboard/shelters", label: "Shelters" },
  { to: "/dashboard/supplies", label: "Supplies" },
  { to: "/dashboard/alerts", label: "Alerts" },
  { to: "/dashboard/sms-simulator", label: "📱 SMS" },
  { to: "/dashboard/ivr-simulator", label: "☎️ IVR" },
];

export default function AuthorityLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-brand px-4 py-3 text-white shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-6">
            <span className="text-base font-bold">🚨 AapdaSaarthi Command</span>
            <nav className="flex flex-wrap gap-1">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      isActive ? "bg-white/15 text-white" : "text-slate-300 hover:bg-white/10"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <ConnectionStatus />
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}

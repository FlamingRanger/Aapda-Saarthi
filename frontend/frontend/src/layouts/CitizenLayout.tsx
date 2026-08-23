import { Outlet, Link } from "react-router-dom";
import ConnectionStatus from "../components/common/ConnectionStatus";

export default function CitizenLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <Link to="/" className="text-base font-bold text-brand">
            🚨 AapdaSaarthi
          </Link>
          <ConnectionStatus />
        </div>
      </header>
      <main className="mx-auto max-w-lg px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}

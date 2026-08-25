import { Routes, Route } from "react-router-dom";
import CitizenLayout from "./layouts/CitizenLayout";
import AuthorityLayout from "./layouts/AuthorityLayout";
import Landing from "./pages/Landing";
import ReportForm from "./pages/ReportForm";
import ReportSuccess from "./pages/ReportSuccess";
import Dashboard from "./pages/Dashboard";
import MapView from "./pages/MapView";
import IncidentDetail from "./pages/IncidentDetail";
import TeamsPage from "./pages/TeamsPage";
import SheltersPage from "./pages/SheltersPage";
import SuppliesPage from "./pages/SuppliesPage";
import AlertsPage from "./pages/AlertsPage";
import SmsSimulatorPage from "./pages/SmsSimulatorPage";
import IvrSimulatorPage from "./pages/IvrSimulatorPage";
import { useOfflineQueueFlush } from "./hooks/useOfflineQueueFlush";

export default function App() {
  useOfflineQueueFlush();

  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route element={<CitizenLayout />}>
        <Route path="/report" element={<ReportForm />} />
        <Route path="/report/success" element={<ReportSuccess />} />
      </Route>

      <Route element={<AuthorityLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/map" element={<MapView />} />
        <Route path="/dashboard/incidents/:id" element={<IncidentDetail />} />
        <Route path="/dashboard/teams" element={<TeamsPage />} />
        <Route path="/dashboard/shelters" element={<SheltersPage />} />
        <Route path="/dashboard/supplies" element={<SuppliesPage />} />
        <Route path="/dashboard/alerts" element={<AlertsPage />} />
        <Route path="/dashboard/sms-simulator" element={<SmsSimulatorPage />} />
        <Route path="/dashboard/ivr-simulator" element={<IvrSimulatorPage />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-slate-500">Page not found.</p>
    </div>
  );
}

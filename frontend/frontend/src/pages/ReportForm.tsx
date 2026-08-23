import IncidentForm from "../components/incidents/IncidentForm";

export default function ReportForm() {
  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">Report an Emergency</h1>
      <p className="mt-1 text-sm text-slate-500">
        Fill in as much detail as you can. Location is required so responders can find you.
      </p>
      <div className="mt-6">
        <IncidentForm />
      </div>
    </div>
  );
}

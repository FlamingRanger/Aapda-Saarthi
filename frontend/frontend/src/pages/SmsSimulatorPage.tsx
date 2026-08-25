import { useState } from "react";
import { createIncident } from "../services/incidents";
import type { IncidentType, Severity } from "../types/incident";
import { INCIDENT_TYPES, SEVERITY_LEVELS } from "../types/incident";
import { ApiError } from "../types/api";
import Button from "../components/common/Button";

const EXAMPLE_MESSAGES = [
  "FLOOD,CRITICAL,20.2961,85.8245,People trapped inside houses near river bank",
  "LANDSLIDE,HIGH,20.3500,85.7800,Road blocked by landslide near highway junction",
  "FIRE,HIGH,20.1200,85.6500,Building fire at market area requires immediate response",
  "MEDICAL,MEDIUM,20.4000,85.9000,Multiple injured in road accident need ambulance",
  "TRAPPED_PERSON,CRITICAL,20.2500,85.8100,Family trapped on rooftop due to flooding",
];

interface ParseResult {
  incident_type: IncidentType;
  severity: Severity;
  latitude: number;
  longitude: number;
  description: string;
}

type ParseError = { field: string; message: string };

function parseSms(raw: string): { result?: ParseResult; errors: ParseError[] } {
  const errors: ParseError[] = [];
  const parts = raw.trim().split(",");
  if (parts.length < 5) {
    return { errors: [{ field: "message", message: `Expected at least 5 comma-separated fields, got ${parts.length}.` }] };
  }
  const [typeRaw, severityRaw, latRaw, lonRaw, ...descParts] = parts;
  const incident_type = typeRaw.trim().toUpperCase() as IncidentType;
  const severity = severityRaw.trim().toUpperCase() as Severity;
  const latitude = parseFloat(latRaw.trim());
  const longitude = parseFloat(lonRaw.trim());
  const description = descParts.join(",").trim();
  if (!INCIDENT_TYPES.includes(incident_type)) errors.push({ field: "type", message: `Unknown type "${incident_type}". Valid: ${INCIDENT_TYPES.join(", ")}` });
  if (!SEVERITY_LEVELS.includes(severity)) errors.push({ field: "severity", message: `Unknown severity "${severity}". Valid: ${SEVERITY_LEVELS.join(", ")}` });
  if (isNaN(latitude) || latitude < -90 || latitude > 90) errors.push({ field: "latitude", message: `Invalid latitude "${latRaw.trim()}".` });
  if (isNaN(longitude) || longitude < -180 || longitude > 180) errors.push({ field: "longitude", message: `Invalid longitude "${lonRaw.trim()}".` });
  if (!description) errors.push({ field: "description", message: "Description is required." });
  if (errors.length > 0) return { errors };
  return { result: { incident_type, severity, latitude, longitude, description }, errors: [] };
}

export default function SmsSimulatorPage() {
  const [message, setMessage] = useState("");
  const [parsed, setParsed] = useState<ParseResult | null>(null);
  const [parseErrors, setParseErrors] = useState<ParseError[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function handleParse() {
    const { result, errors } = parseSms(message);
    setParsed(result ?? null); setParseErrors(errors); setSuccessId(null); setSubmitError(null);
  }
  function loadExample(msg: string) {
    setMessage(msg);
    const { result, errors } = parseSms(msg);
    setParsed(result ?? null); setParseErrors(errors); setSuccessId(null); setSubmitError(null);
  }
  async function handleSubmit() {
    if (!parsed) return;
    setSubmitting(true); setSubmitError(null);
    try {
      const response = await createIncident(parsed);
      setSuccessId(response.id); setMessage(""); setParsed(null);
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Failed to submit incident.");
    } finally { setSubmitting(false); }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">?? SMS Fallback Simulator</h1>
        <p className="mt-1 text-sm text-slate-500">Simulates how a citizen with no internet can report an emergency via SMS. Paste an SMS-formatted message to parse and submit it as an incident.</p>
      </div>
      <div className="rounded-lg border border-sky-200 bg-sky-50 p-4">
        <p className="text-xs font-semibold uppercase text-sky-700">SMS Format</p>
        <code className="mt-1 block font-mono text-sm text-sky-900">TYPE,SEVERITY,LATITUDE,LONGITUDE,DESCRIPTION</code>
        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-sky-700">
          <span><strong>TYPE:</strong> {INCIDENT_TYPES.join(" | ")}</span>
          <span><strong>SEVERITY:</strong> {SEVERITY_LEVELS.join(" | ")}</span>
        </div>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase text-slate-500">Example Messages (click to load)</p>
        <div className="mt-2 space-y-2">
          {EXAMPLE_MESSAGES.map((msg, i) => (
            <button key={i} id={`sms-example-${i}`} onClick={() => loadExample(msg)}
              className="block w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-left font-mono text-xs text-slate-700 transition-colors hover:border-sky-300 hover:bg-sky-50">
              {msg}
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <label className="text-sm font-semibold text-slate-800" htmlFor="sms-input">SMS Message</label>
        <textarea id="sms-input" value={message}
          onChange={(e) => { setMessage(e.target.value); setParsed(null); setParseErrors([]); setSuccessId(null); setSubmitError(null); }}
          placeholder="FLOOD,HIGH,20.2961,85.8245,People trapped near river bank"
          rows={3} className="mt-2 w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 font-mono text-sm text-slate-900 placeholder-slate-400 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400" />
        <div className="mt-3 flex gap-2">
          <Button id="sms-parse-btn" variant="secondary" onClick={handleParse} disabled={!message.trim()}>Parse</Button>
          {parsed && <Button id="sms-submit-btn" onClick={handleSubmit} isLoading={submitting}>Submit as Incident</Button>}
        </div>
      </div>
      {parseErrors.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-700">Parse Errors</p>
          <ul className="mt-2 space-y-1">{parseErrors.map((e, i) => <li key={i} className="text-sm text-red-600"><strong>{e.field}:</strong> {e.message}</li>)}</ul>
        </div>
      )}
      {parsed && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-semibold text-green-700">Parsed Successfully</p>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm text-green-800">
            <div><dt className="text-xs uppercase text-green-600">Type</dt><dd className="font-medium">{parsed.incident_type}</dd></div>
            <div><dt className="text-xs uppercase text-green-600">Severity</dt><dd className="font-medium">{parsed.severity}</dd></div>
            <div><dt className="text-xs uppercase text-green-600">Latitude</dt><dd className="font-medium">{parsed.latitude}</dd></div>
            <div><dt className="text-xs uppercase text-green-600">Longitude</dt><dd className="font-medium">{parsed.longitude}</dd></div>
            <div className="col-span-2"><dt className="text-xs uppercase text-green-600">Description</dt><dd className="font-medium">{parsed.description}</dd></div>
          </dl>
        </div>
      )}
      {successId && <div className="rounded-lg border border-green-300 bg-green-100 p-4"><p className="text-sm font-semibold text-green-800">Incident #{successId} created and broadcast to the dashboard in real time.</p></div>}
      {submitError && <div className="rounded-lg border border-red-200 bg-red-50 p-4"><p className="text-sm text-red-700">{submitError}</p></div>}
    </div>
  );
}

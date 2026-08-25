import { useState } from "react";
import { createIncident } from "../services/incidents";
import type { IncidentType, Severity } from "../types/incident";
import { INCIDENT_TYPES, SEVERITY_LEVELS } from "../types/incident";
import { ApiError } from "../types/api";
import Button from "../components/common/Button";
import { formatLabel } from "../utils/status";

type Step = "type" | "severity" | "location" | "description" | "confirm" | "done";

const PRESET_LOCATIONS = [
  { label: "Bhubaneswar Urban", lat: 20.2961, lon: 85.8245 },
  { label: "Puri District", lat: 19.8135, lon: 85.8312 },
  { label: "Cuttack District", lat: 20.4625, lon: 85.883 },
  { label: "Konark Coastal Belt", lat: 19.8876, lon: 86.0945 },
  { label: "Khordha District", lat: 20.183, lon: 85.6132 },
  { label: "Manual Entry", lat: 0, lon: 0 },
];

export default function IvrSimulatorPage() {
  const [step, setStep] = useState<Step>("type");
  const [incidentType, setIncidentType] = useState<IncidentType | null>(null);
  const [severity, setSeverity] = useState<Severity | null>(null);
  const [locationIndex, setLocationIndex] = useState<number | null>(null);
  const [manualLat, setManualLat] = useState("");
  const [manualLon, setManualLon] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function reset() {
    setStep("type"); setIncidentType(null); setSeverity(null); setLocationIndex(null);
    setManualLat(""); setManualLon(""); setDescription(""); setSuccessId(null); setSubmitError(null);
  }

  function getLatLon(): { lat: number; lon: number } | null {
    if (locationIndex === null) return null;
    const loc = PRESET_LOCATIONS[locationIndex];
    if (loc.label === "Manual Entry") {
      const lat = parseFloat(manualLat); const lon = parseFloat(manualLon);
      if (isNaN(lat) || isNaN(lon)) return null;
      return { lat, lon };
    }
    return { lat: loc.lat, lon: loc.lon };
  }

  async function handleSubmit() {
    if (!incidentType || !severity || !description) return;
    const coords = getLatLon();
    if (!coords) return;
    setSubmitting(true); setSubmitError(null);
    try {
      const response = await createIncident({ incident_type: incidentType, severity, latitude: coords.lat, longitude: coords.lon, description });
      setSuccessId(response.id); setStep("done");
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Failed to submit incident.");
    } finally { setSubmitting(false); }
  }

  const selectedLoc = locationIndex !== null ? PRESET_LOCATIONS[locationIndex] : null;
  const isManual = selectedLoc?.label === "Manual Entry";

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">IVR Fallback Simulator</h1>
        <p className="mt-1 text-sm text-slate-500">Simulates a citizen reporting an emergency via a phone IVR system. Follow the step-by-step flow below.</p>
      </div>

      {/* Step progress */}
      <div className="flex items-center gap-2">
        {(["type","severity","location","description","confirm"] as Step[]).map((s, i) => (
          <div key={s} className="flex flex-1 flex-col items-center gap-1">
            <div className={`h-2 w-full rounded-full ${["type","severity","location","description","confirm","done"].indexOf(step) >= i ? "bg-brand-accent" : "bg-slate-200"}`} />
            <span className="hidden text-[10px] text-slate-400 sm:block capitalize">{s}</span>
          </div>
        ))}
      </div>

      {/* STEP 1: Type */}
      {step === "type" && (
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">Step 1 of 5</p>
          <h2 className="mt-1 text-base font-bold text-slate-800">Select the type of emergency</h2>
          <p className="mt-1 text-xs text-slate-500">Press the number corresponding to your emergency type.</p>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {INCIDENT_TYPES.map((t, i) => (
              <button key={t} id={`ivr-type-${t.toLowerCase()}`} onClick={() => { setIncidentType(t); setStep("severity"); }}
                className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm transition-colors hover:border-sky-400 hover:bg-sky-50 text-left">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-white text-xs font-bold">{i + 1}</span>
                {formatLabel(t)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: Severity */}
      {step === "severity" && (
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">Step 2 of 5 � Type: {incidentType}</p>
          <h2 className="mt-1 text-base font-bold text-slate-800">How severe is the emergency?</h2>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {SEVERITY_LEVELS.map((s, i) => {
              const colors: Record<string,string> = { LOW:"border-green-300 hover:bg-green-50", MEDIUM:"border-amber-300 hover:bg-amber-50", HIGH:"border-orange-300 hover:bg-orange-50", CRITICAL:"border-red-300 hover:bg-red-50" };
              return (
                <button key={s} id={`ivr-severity-${s.toLowerCase()}`} onClick={() => { setSeverity(s); setStep("location"); }}
                  className={`rounded-md border-2 px-4 py-3 text-sm font-semibold transition-colors ${colors[s]}`}>
                  <span className="mr-2">{i + 1}.</span>{s}
                </button>
              );
            })}
          </div>
          <button onClick={() => setStep("type")} className="mt-4 text-xs text-slate-400 hover:underline">Back</button>
        </div>
      )}

      {/* STEP 3: Location */}
      {step === "location" && (
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">Step 3 of 5 � {incidentType} � {severity}</p>
          <h2 className="mt-1 text-base font-bold text-slate-800">Select your location</h2>
          <div className="mt-4 space-y-2">
            {PRESET_LOCATIONS.map((loc, i) => (
              <button key={i} id={`ivr-loc-${i}`} onClick={() => setLocationIndex(i)}
                className={`flex w-full items-center gap-3 rounded-md border px-4 py-3 text-left text-sm transition-colors ${locationIndex === i ? "border-sky-400 bg-sky-50 font-semibold text-sky-800" : "border-slate-200 bg-slate-50 hover:border-sky-300 hover:bg-sky-50"}`}>
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-300 text-xs font-bold text-slate-700">{i + 1}</span>
                <span>{loc.label}</span>
                {loc.label !== "Manual Entry" && <span className="ml-auto text-xs text-slate-400">{loc.lat}, {loc.lon}</span>}
              </button>
            ))}
          </div>
          {isManual && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500" htmlFor="ivr-lat">Latitude</label>
                <input id="ivr-lat" type="number" value={manualLat} onChange={e => setManualLat(e.target.value)} placeholder="e.g. 20.2961"
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-slate-500" htmlFor="ivr-lon">Longitude</label>
                <input id="ivr-lon" type="number" value={manualLon} onChange={e => setManualLon(e.target.value)} placeholder="e.g. 85.8245"
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none" />
              </div>
            </div>
          )}
          <div className="mt-4 flex gap-2">
            <Button id="ivr-loc-next" disabled={locationIndex === null || (isManual && (!manualLat || !manualLon))} onClick={() => setStep("description")}>Next</Button>
            <Button variant="ghost" onClick={() => setStep("severity")}>Back</Button>
          </div>
        </div>
      )}

      {/* STEP 4: Description */}
      {step === "description" && (
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">Step 4 of 5 � {incidentType} � {severity} � {selectedLoc?.label}</p>
          <h2 className="mt-1 text-base font-bold text-slate-800">Describe the emergency</h2>
          <p className="mt-1 text-xs text-slate-500">After the tone, please describe your emergency in 1-2 sentences.</p>
          <textarea id="ivr-description" value={description} onChange={e => setDescription(e.target.value)}
            placeholder="e.g. People are trapped on the second floor of the building. Water level is rising rapidly."
            rows={4} className="mt-3 w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400" />
          <div className="mt-3 flex gap-2">
            <Button id="ivr-desc-next" disabled={!description.trim()} onClick={() => setStep("confirm")}>Review & Submit</Button>
            <Button variant="ghost" onClick={() => setStep("location")}>Back</Button>
          </div>
        </div>
      )}

      {/* STEP 5: Confirm */}
      {step === "confirm" && (
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">Step 5 of 5 � Review</p>
          <h2 className="mt-1 text-base font-bold text-slate-800">Confirm your report</h2>
          <dl className="mt-4 space-y-3 text-sm text-slate-700">
            <div><dt className="text-xs uppercase text-slate-400">Emergency Type</dt><dd className="font-semibold">{formatLabel(incidentType!)}</dd></div>
            <div><dt className="text-xs uppercase text-slate-400">Severity</dt><dd className="font-semibold">{severity}</dd></div>
            <div><dt className="text-xs uppercase text-slate-400">Location</dt><dd className="font-semibold">{selectedLoc?.label}{isManual ? ` (${manualLat}, ${manualLon})` : ` (${selectedLoc?.lat}, ${selectedLoc?.lon})`}</dd></div>
            <div><dt className="text-xs uppercase text-slate-400">Description</dt><dd className="font-semibold">{description}</dd></div>
          </dl>
          {submitError && <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{submitError}</p>}
          <div className="mt-5 flex gap-2">
            <Button id="ivr-submit-btn" onClick={handleSubmit} isLoading={submitting}>Submit Emergency Report</Button>
            <Button variant="ghost" onClick={() => setStep("description")}>Back</Button>
          </div>
        </div>
      )}

      {/* Done */}
      {step === "done" && (
        <div className="rounded-lg border border-green-300 bg-green-50 p-6 text-center shadow-sm">
          <p className="text-4xl">?</p>
          <h2 className="mt-3 text-lg font-bold text-green-800">Emergency Reported</h2>
          <p className="mt-1 text-sm text-green-700">Incident #{successId} has been created and broadcast to the authority dashboard in real time.</p>
          <Button id="ivr-reset-btn" variant="secondary" className="mt-4" onClick={reset}>Start New Report</Button>
        </div>
      )}
    </div>
  );
}

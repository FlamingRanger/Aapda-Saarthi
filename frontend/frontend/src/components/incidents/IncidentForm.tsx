import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../common/Button";
import GpsCapture from "./GpsCapture";
import PhotoUpload from "./PhotoUpload";
import { INCIDENT_TYPES, SEVERITY_LEVELS } from "../../types/incident";
import type { Severity, IncidentType } from "../../types/incident";
import { createIncident } from "../../services/incidents";
import { ApiError } from "../../types/api";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";
import { enqueueIncident } from "../../utils/offlineQueue";
import { formatLabel } from "../../utils/status";

export default function IncidentForm() {
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();

  const [incidentType, setIncidentType] = useState<IncidentType | "">("");
  const [severity, setSeverity] = useState<Severity | "">("");
  const [description, setDescription] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [phone, setPhone] = useState("");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function validate(): string | null {
    if (!incidentType) return "Please select an incident type.";
    if (!severity) return "Please select a severity level.";
    if (!lat || !lon) return "Location is required — use GPS or enter coordinates.";
    const latNum = Number(lat);
    const lonNum = Number(lon);
    if (Number.isNaN(latNum) || latNum < -90 || latNum > 90) {
      return "Latitude must be a number between -90 and 90.";
    }
    if (Number.isNaN(lonNum) || lonNum < -180 || lonNum > 180) {
      return "Longitude must be a number between -180 and 180.";
    }
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setFormError(validationError);
      return;
    }
    setFormError(null);
    setSubmitting(true);

    const payload = {
      incident_type: incidentType as IncidentType,
      severity: severity as Severity,
      latitude: Number(lat),
      longitude: Number(lon),
      description: description || undefined,
      reporter_name: reporterName || undefined,
      phone: phone || undefined,
    };

    if (!isOnline) {
      enqueueIncident(payload);
      setSubmitting(false);
      navigate("/report/success", { state: { queued: true } });
      return;
    }

    try {
      const result = await createIncident({ ...payload, photo });
      navigate("/report/success", { state: { incident: result.incident } });
    } catch (err) {
      if (!navigator.onLine) {
        enqueueIncident(payload);
        navigate("/report/success", { state: { queued: true } });
        return;
      }
      setFormError(err instanceof ApiError ? err.message : "Failed to submit report.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {!isOnline && (
        <div className="rounded-md border border-yellow-300 bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
          You're offline. This report will be saved on your device and sent automatically once
          you're back online.
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Incident type *</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {INCIDENT_TYPES.map((type) => (
            <button
              type="button"
              key={type}
              onClick={() => setIncidentType(type)}
              className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                incidentType === type
                  ? "border-brand-accent bg-sky-50 text-brand-accent"
                  : "border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {formatLabel(type)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Severity *</label>
        <div className="grid grid-cols-4 gap-2">
          {SEVERITY_LEVELS.map((level) => (
            <button
              type="button"
              key={level}
              onClick={() => setSeverity(level)}
              className={`rounded-md border px-2 py-2 text-xs font-semibold uppercase transition-colors ${
                severity === level
                  ? "border-brand-accent bg-sky-50 text-brand-accent"
                  : "border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="What is happening? Who needs help?"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Location *</label>
        <GpsCapture
          manualLat={lat}
          manualLon={lon}
          onCaptured={(la, lo) => {
            setLat(String(la));
            setLon(String(lo));
          }}
          onManualChange={(la, lo) => {
            setLat(la);
            setLon(lo);
          }}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Photo (optional)</label>
        <PhotoUpload onChange={setPhoto} />
        {photo && !isOnline && (
          <p className="mt-1 text-xs text-orange-600">
            Photos can't be queued offline — this photo will be dropped if sent while offline.
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="text-xs font-medium text-slate-600">
          Your name (optional)
          <input
            value={reporterName}
            onChange={(e) => setReporterName(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-xs font-medium text-slate-600">
          Phone (optional)
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
      </div>

      {formError && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {formError}
        </p>
      )}

      <Button type="submit" variant="danger" className="w-full py-3 text-base" isLoading={submitting}>
        🚨 Submit Emergency Report
      </Button>
    </form>
  );
}

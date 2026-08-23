import { describe, it, expect } from "vitest";

/**
 * These mirror the client-side validation rules used in IncidentForm
 * (kept here as pure logic so they're testable without mounting the
 * full form/DOM). If the validation logic in IncidentForm changes,
 * update this alongside it.
 */
function validateCoordinates(lat: string, lon: string): string | null {
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

describe("incident coordinate validation", () => {
  it("rejects missing coordinates", () => {
    expect(validateCoordinates("", "")).toMatch(/required/);
  });

  it("rejects out-of-range latitude", () => {
    expect(validateCoordinates("999", "84.85")).toMatch(/Latitude/);
  });

  it("rejects out-of-range longitude", () => {
    expect(validateCoordinates("22.26", "999")).toMatch(/Longitude/);
  });

  it("accepts valid coordinates", () => {
    expect(validateCoordinates("22.26", "84.85")).toBeNull();
  });
});

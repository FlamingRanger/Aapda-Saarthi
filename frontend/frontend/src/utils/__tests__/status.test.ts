import { describe, it, expect } from "vitest";
import { formatLabel, formatDateTime, classForStatus, TEAM_STATUS_CLASSES } from "../status";

describe("formatLabel", () => {
  it("converts SCREAMING_SNAKE_CASE to Title Case", () => {
    expect(formatLabel("TRAPPED_PERSON")).toBe("Trapped Person");
    expect(formatLabel("FLOOD")).toBe("Flood");
  });
});

describe("formatDateTime", () => {
  it("returns a fallback for null input", () => {
    expect(formatDateTime(null)).toBe("Unknown time");
  });

  it("returns a fallback for invalid date strings", () => {
    expect(formatDateTime("not-a-date")).toBe("Unknown time");
  });

  it("formats a valid ISO string", () => {
    const result = formatDateTime("2026-01-01T10:00:00Z");
    expect(result).not.toBe("Unknown time");
  });
});

describe("classForStatus", () => {
  it("returns the mapped class for a known status", () => {
    expect(classForStatus(TEAM_STATUS_CLASSES, "AVAILABLE")).toContain("green");
  });

  it("returns a default class for an unknown status", () => {
    expect(classForStatus(TEAM_STATUS_CLASSES, "NOT_A_STATUS")).toContain("slate");
  });
});

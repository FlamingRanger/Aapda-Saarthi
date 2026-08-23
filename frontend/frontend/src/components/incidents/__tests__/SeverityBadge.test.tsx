import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SeverityBadge from "../../common/SeverityBadge";

describe("SeverityBadge", () => {
  it("renders the severity label", () => {
    render(<SeverityBadge severity="CRITICAL" />);
    expect(screen.getByText("CRITICAL")).toBeInTheDocument();
  });

  it("applies the correct color class for HIGH severity", () => {
    render(<SeverityBadge severity="HIGH" />);
    const badge = screen.getByText("HIGH");
    expect(badge.className).toContain("orange");
  });

  it("falls back gracefully for unknown severities", () => {
    render(<SeverityBadge severity="UNKNOWN" />);
    const badge = screen.getByText("UNKNOWN");
    expect(badge.className).toContain("slate");
  });
});

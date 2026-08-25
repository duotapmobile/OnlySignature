import { describe, expect, it } from "vitest";
import {
  assertDiagnosticSafe,
  renderDiagnostic,
} from "../../packages/core/src/index";

describe("local diagnostics", () => {
  it("contains only allowlisted categories", () => {
    const text = renderDiagnostic({
      appVersion: "1.0.0",
      buildNumber: "1",
      deviceModel: "iPhone",
      osVersion: "26.0",
      category: "export_failed",
      exportFormat: "png-transparent",
    });
    expect(() => assertDiagnosticSafe(text)).not.toThrow();
    expect(text).not.toContain("Jordan");
  });

  it("rejects sensitive diagnostic strings", () => {
    expect(() => assertDiagnosticSafe("transactionId: 123")).toThrow(
      /prohibited/,
    );
  });
});

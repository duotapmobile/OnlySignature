import { describe, expect, it } from "vitest";
import {
  assertTransparencyTruth,
  formatById,
  safeExportFilename,
} from "../../packages/core/src/index";

describe("export truth", () => {
  it("only claims transparency for transparent PNG", () => {
    expect(formatById("png-transparent").transparent).toBe(true);
    expect(formatById("png-white").transparent).toBe(false);
    expect(formatById("jpeg-white").transparent).toBe(false);
    expect(() => assertTransparencyTruth("jpeg-white", true)).toThrow(
      /does not support/,
    );
  });

  it("creates simple non-personal unique filenames", () => {
    const used = new Set(["signature.png", "signature-2.png"]);
    expect(safeExportFilename("signature", "png-transparent", used)).toBe(
      "signature-3.png",
    );
    expect(safeExportFilename("initials", "jpeg-white", new Set())).toBe(
      "initials.jpg",
    );
  });
});

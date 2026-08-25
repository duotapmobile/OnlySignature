import { describe, expect, it } from "vitest";
import {
  developmentConfig,
  validateReleaseConfig,
} from "../../packages/config/src/index";

describe("release config", () => {
  it("permits safe development placeholders", () => {
    expect(validateReleaseConfig(developmentConfig)).toEqual([]);
  });

  it("fails production closed on placeholders and mock StoreKit", () => {
    const errors = validateReleaseConfig({
      ...developmentConfig,
      releaseMode: "production",
    });
    expect(errors.some((error) => error.includes("placeholder"))).toBe(true);
    expect(errors).toContain("production requires real StoreKit mode");
    expect(errors).toContain("production requires a DSA trader decision");
  });
});

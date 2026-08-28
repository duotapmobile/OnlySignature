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
      supportEmail: "PLACEHOLDER_SUPPORT_EMAIL",
      releaseMode: "production",
    });
    expect(errors.some((error) => error.includes("placeholder"))).toBe(true);
    expect(errors).toContain("production requires real StoreKit mode");
    expect(errors).not.toContain("production requires a DSA trader decision");
  });

  it("requires a DSA decision only when an EU territory is enabled", () => {
    const errors = validateReleaseConfig({
      ...developmentConfig,
      releaseMode: "production",
      storeKitMode: "real",
      territories: ["US", "DE"],
    });

    expect(errors).toContain("production requires a DSA trader decision");
  });

  it("rejects Apple-invalid StoreKit product identifier characters", () => {
    const errors = validateReleaseConfig({
      ...developmentConfig,
      storeKitProductId: "com.duotap.onlysignature.transparent-set-v1",
    });

    expect(errors).toContain(
      "storeKitProductId may contain only letters, numbers, underscores, and periods",
    );
  });

  it("rejects expansion beyond the locked U.S.-only release", () => {
    const errors = validateReleaseConfig({
      ...developmentConfig,
      territories: ["US", "CA"],
    });

    expect(errors).toContain("release distribution is locked to U.S. only");
  });
});

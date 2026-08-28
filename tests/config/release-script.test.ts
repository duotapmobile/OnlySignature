import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

const baseProductionEnv = {
  EAS_PROJECT_ID: "00000000-0000-4000-8000-000000000000",
  EXPO_PUBLIC_APP_DISPLAY_NAME: "Only Signature",
  EXPO_PUBLIC_APP_SLUG: "onlysignature",
  EXPO_PUBLIC_BUNDLE_IDENTIFIER: "com.duotap.onlysignature",
  EXPO_PUBLIC_APPLE_TEAM_ID: "JWXC66G9Z5",
  EXPO_PUBLIC_STOREKIT_PRODUCT_ID:
    "com.duotap.onlysignature.transparent_set_v1",
  EXPO_PUBLIC_PRIVACY_URL: "https://onlysignature.app/privacy/",
  EXPO_PUBLIC_TERMS_URL: "https://onlysignature.app/terms/",
  EXPO_PUBLIC_SUPPORT_URL: "https://onlysignature.app/support/",
  EXPO_PUBLIC_MARKETING_URL: "https://onlysignature.app/",
  EXPO_PUBLIC_SUPPORT_EMAIL: "admin@onlysignature.app",
  EXPO_PUBLIC_LEGAL_OPERATOR: "DuoTap LLC",
  EXPO_PUBLIC_DSA_TRADER_STATUS: "not-applicable",
  EXPO_PUBLIC_APP_STORE_TERRITORIES: "US",
  EXPO_PUBLIC_STOREKIT_MODE: "real",
  EXPO_PUBLIC_RELEASE_MODE: "production",
};

function runReleaseGate(overrides: Record<string, string> = {}) {
  return spawnSync(
    process.execPath,
    ["scripts/check-release-config.mjs", "--production"],
    {
      cwd: process.cwd(),
      encoding: "utf8",
      env: { ...process.env, ...baseProductionEnv, ...overrides },
    },
  );
}

describe("root production release gate", () => {
  it("accepts not-applicable DSA status for U.S.-only distribution", () => {
    const result = runReleaseGate();

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Production release configuration passed");
  });

  it("requires a DSA decision when an EU territory is enabled", () => {
    const result = runReleaseGate({
      EXPO_PUBLIC_APP_STORE_TERRITORIES: "US,DE",
    });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      "EU distribution requires a DSA trader-status decision",
    );
  });

  it("rejects screenshot fixture mode in production", () => {
    const result = runReleaseGate({
      EXPO_PUBLIC_SCREENSHOT_FIXTURE_MODE: "1",
    });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      "EXPO_PUBLIC_SCREENSHOT_FIXTURE_MODE must be disabled",
    );
  });

  it("rejects an Apple-invalid StoreKit product identifier", () => {
    const result = runReleaseGate({
      EXPO_PUBLIC_STOREKIT_PRODUCT_ID:
        "com.duotap.onlysignature.transparent-set-v1",
    });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      "may contain only letters, numbers, underscores, and periods",
    );
  });

  it("rejects expansion beyond the locked U.S.-only release", () => {
    const result = runReleaseGate({
      EXPO_PUBLIC_APP_STORE_TERRITORIES: "US,CA",
    });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("must be exactly US for this release");
  });
});

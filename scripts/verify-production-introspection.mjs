import { execFileSync, spawnSync } from "node:child_process";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const expected = {
  owner: "duotap",
  slug: "onlysignature",
  bundleIdentifier: "com.duotap.onlysignature",
  teamId: "JWXC66G9Z5",
  projectId: "954b1a21-89e9-41af-8021-d7c8e66d74c8",
  productId: "com.duotap.onlysignature.transparent_set_v1",
};
const sourceRevision = execFileSync("git", ["rev-parse", "HEAD"], {
  encoding: "utf8",
}).trim();
const productionEnv = {
  ...process.env,
  APP_VARIANT: "production",
  EXPO_PUBLIC_RELEASE_MODE: "production",
  EXPO_PUBLIC_STOREKIT_MODE: "real",
  EXPO_PUBLIC_SCREENSHOT_FIXTURE_MODE: "0",
  EXPO_PUBLIC_APP_DISPLAY_NAME: "Only Signature",
  EXPO_PUBLIC_APP_SLUG: expected.slug,
  EXPO_PUBLIC_BUNDLE_IDENTIFIER: expected.bundleIdentifier,
  EXPO_PUBLIC_APPLE_TEAM_ID: expected.teamId,
  EXPO_PUBLIC_STOREKIT_PRODUCT_ID: expected.productId,
  EXPO_PUBLIC_PRIVACY_URL: "https://onlysignature.app/privacy/",
  EXPO_PUBLIC_TERMS_URL: "https://onlysignature.app/terms/",
  EXPO_PUBLIC_SUPPORT_URL: "https://onlysignature.app/support/",
  EXPO_PUBLIC_MARKETING_URL: "https://onlysignature.app/",
  EXPO_PUBLIC_SUPPORT_EMAIL: "admin@onlysignature.app",
  EXPO_PUBLIC_LEGAL_OPERATOR: "DuoTap LLC",
  EXPO_PUBLIC_DSA_TRADER_STATUS: "not-applicable",
  EXPO_PUBLIC_APP_STORE_TERRITORIES: "US",
  EAS_PROJECT_ID: expected.projectId,
  ONLY_SIGNATURE_SOURCE_REVISION: sourceRevision,
};
const command = process.platform === "win32" ? "npx.cmd" : "npx";
const result = spawnSync(
  command,
  ["expo", "config", "--type", "introspect", "--json"],
  {
    cwd: path.join(process.cwd(), "apps", "mobile"),
    encoding: "utf8",
    env: productionEnv,
    maxBuffer: 64 * 1024 * 1024,
    shell: process.platform === "win32",
  },
);
if (result.status !== 0)
  throw new Error(
    `Production Expo introspection command failed: ${(
      result.stderr ||
      result.stdout ||
      result.error?.message ||
      "unknown process error"
    ).trim()}`,
  );
const config = JSON.parse(result.stdout);
const modResults = config._internal?.modResults?.ios;
const infoPlist = modResults?.infoPlist ?? {};
const expoPlist = modResults?.expoPlist ?? {};
const nativeModules = config._internal?.autolinkedModules ?? [];
const assertions = {
  owner: config.owner === expected.owner,
  slug: config.slug === expected.slug,
  bundleIdentifier: config.ios?.bundleIdentifier === expected.bundleIdentifier,
  teamId: config.ios?.appleTeamId === expected.teamId,
  projectId: config.extra?.eas?.projectId === expected.projectId,
  productId: config.extra?.storeKitProductId === expected.productId,
  storeKitReal: config.extra?.storeKitMode === "real",
  fixtureDisabled: config.extra?.screenshotFixtureMode === false,
  usOnly: JSON.stringify(config.extra?.territories) === JSON.stringify(["US"]),
  otaConfigDisabled:
    config.updates?.enabled === false &&
    config.updates?.checkAutomatically === "NEVER",
  otaNativeDisabled:
    expoPlist.EXUpdatesEnabled === false &&
    expoPlist.EXUpdatesCheckOnLaunch === "NEVER",
  otaModuleAbsent: !nativeModules.includes("expo-updates"),
  arbitraryLoadsDisabled:
    infoPlist.NSAppTransportSecurity?.NSAllowsArbitraryLoads === false &&
    infoPlist.NSAppTransportSecurity?.NSAllowsLocalNetworking === false,
  completeDataProtection:
    config.ios?.entitlements?.[
      "com.apple.developer.default-data-protection"
    ] === "NSFileProtectionComplete",
  noTracking:
    config.ios?.privacyManifests?.NSPrivacyTracking === false &&
    !config.ios?.privacyManifests?.NSPrivacyTrackingDomains?.length,
  releaseStamp:
    infoPlist.OnlySignatureReleaseMode === "production" &&
    infoPlist.OnlySignatureStoreKitMode === "real" &&
    infoPlist.OnlySignatureScreenshotFixtureMode === false &&
    infoPlist.OnlySignatureTerritories === "US" &&
    infoPlist.OnlySignatureEASProjectId === expected.projectId &&
    infoPlist.OnlySignatureStoreKitProductId === expected.productId &&
    infoPlist.OnlySignatureSourceRevision === sourceRevision,
};
const failures = Object.entries(assertions)
  .filter(([, passed]) => !passed)
  .map(([name]) => name);
if (failures.length)
  throw new Error(
    `Production Expo introspection failed: ${failures.join(", ")}`,
  );

const evidence = {
  schemaVersion: 2,
  sourceCommand: "expo config --type introspect --json",
  identity: expected,
  release: {
    mode: config.extra.releaseChannel,
    storeKitMode: config.extra.storeKitMode,
    screenshotFixtureMode: config.extra.screenshotFixtureMode,
    territories: config.extra.territories,
    updates: config.updates,
  },
  ios: {
    dataProtection:
      config.ios.entitlements["com.apple.developer.default-data-protection"],
    appTransportSecurity: infoPlist.NSAppTransportSecurity,
    releaseStamp: {
      mode: infoPlist.OnlySignatureReleaseMode,
      storeKitMode: infoPlist.OnlySignatureStoreKitMode,
      screenshotFixtureMode: infoPlist.OnlySignatureScreenshotFixtureMode,
      territories: infoPlist.OnlySignatureTerritories,
      projectId: infoPlist.OnlySignatureEASProjectId,
      productId: infoPlist.OnlySignatureStoreKitProductId,
      sourceRevision: infoPlist.OnlySignatureSourceRevision,
    },
    expoUpdates: {
      enabled: expoPlist.EXUpdatesEnabled,
      checkOnLaunch: expoPlist.EXUpdatesCheckOnLaunch,
    },
    privacyManifest: config.ios.privacyManifests,
    nativeModules,
  },
  assertions,
  result: "PASS",
};
await writeFile(
  path.join("artifacts", "expo-production-introspect.json"),
  `${JSON.stringify(evidence, null, 2)}\n`,
  "utf8",
);
process.stdout.write(
  "Production Expo introspection passed and refreshed its canonical evidence.\n",
);

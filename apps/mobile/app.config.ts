import type { ExpoConfig, ConfigContext } from "expo/config";

const PLACEHOLDER = "REPLACE_BEFORE_RELEASE";

const EU_DSA_TERRITORIES = new Set([
  "AT",
  "BE",
  "BG",
  "HR",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "HU",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PL",
  "PT",
  "RO",
  "SK",
  "SI",
  "ES",
  "SE",
]);
const requiresDsaTraderStatus = (territories: string) =>
  territories
    .split(",")
    .some((territory) =>
      EU_DSA_TERRITORIES.has(territory.trim().toUpperCase()),
    );
export default ({ config }: ConfigContext): ExpoConfig => {
  const releaseChannel =
    process.env.EXPO_PUBLIC_RELEASE_MODE ??
    process.env.APP_VARIANT ??
    "development";
  const production = releaseChannel === "production";
  const bundleIdentifier =
    process.env.EXPO_PUBLIC_BUNDLE_IDENTIFIER ?? "com.duotap.onlysignature";
  const required = {
    bundleIdentifier,
    teamId: process.env.EXPO_PUBLIC_APPLE_TEAM_ID ?? "JWXC66G9Z5",
    supportUrl:
      process.env.EXPO_PUBLIC_SUPPORT_URL ??
      "https://onlysignature.app/support/",
    privacyUrl:
      process.env.EXPO_PUBLIC_PRIVACY_URL ??
      "https://onlysignature.app/privacy/",
    termsUrl:
      process.env.EXPO_PUBLIC_TERMS_URL ?? "https://onlysignature.app/terms/",
    supportEmail:
      process.env.EXPO_PUBLIC_SUPPORT_EMAIL ?? "admin@onlysignature.app",
    marketingUrl:
      process.env.EXPO_PUBLIC_MARKETING_URL ?? "https://onlysignature.app/",
    legalOperator: process.env.EXPO_PUBLIC_LEGAL_OPERATOR ?? "DuoTap LLC",
    legalAddress: process.env.EXPO_PUBLIC_LEGAL_ADDRESS ?? PLACEHOLDER,
    dsaTraderStatus:
      process.env.EXPO_PUBLIC_DSA_TRADER_STATUS ?? "not-applicable",
    territories: process.env.EXPO_PUBLIC_APP_STORE_TERRITORIES ?? "US",
    productId:
      process.env.EXPO_PUBLIC_STOREKIT_PRODUCT_ID ??
      "com.duotap.onlysignature.transparent-set-v1",
    easProjectId: process.env.EAS_PROJECT_ID ?? PLACEHOLDER,
  };

  if (production) {
    const invalid = Object.entries(required).filter(
      ([, value]) =>
        value.includes(PLACEHOLDER) ||
        value.includes("example.invalid") ||
        value.includes(".preview"),
    );
    if (invalid.length > 0) {
      throw new Error(
        `Production configuration is incomplete: ${invalid.map(([key]) => key).join(", ")}`,
      );
    }
    if ((process.env.EXPO_PUBLIC_STOREKIT_MODE ?? "") !== "real")
      throw new Error("Production StoreKit mode must be real.");
    if (process.env.EXPO_PUBLIC_SCREENSHOT_FIXTURE_MODE === "1")
      throw new Error(
        "Screenshot fixture mode cannot be enabled in production.",
      );
    if (!required.productId.startsWith(`${bundleIdentifier}.`))
      throw new Error(
        "The StoreKit product identifier must derive from the production bundle identifier.",
      );
    if (
      requiresDsaTraderStatus(required.territories) &&
      (required.dsaTraderStatus === "undecided" ||
        required.dsaTraderStatus === "not-applicable")
    )
      throw new Error("Production requires a DSA trader-status decision.");
  }

  return {
    ...config,
    name: "Only Signature",
    slug: "only-signature",
    version: "1.0.0",
    scheme: "onlysignature",
    orientation: "default",
    userInterfaceStyle: "light",
    icon: "./assets/icon.png",
    runtimeVersion: { policy: "appVersion" },
    updates: {
      enabled: false,
      checkAutomatically: "NEVER",
      fallbackToCacheTimeout: 0,
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier,
      buildNumber: process.env.IOS_BUILD_NUMBER ?? "1",
      ...(required.teamId === PLACEHOLDER
        ? {}
        : { appleTeamId: required.teamId }),
      requireFullScreen: false,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: false,
          NSAllowsLocalNetworking: false,
        },
        UIFileSharingEnabled: false,
        LSSupportsOpeningDocumentsInPlace: false,
      },
      entitlements: {
        "com.apple.developer.default-data-protection":
          "NSFileProtectionComplete",
      },
      privacyManifests: {
        NSPrivacyTracking: false,
        NSPrivacyCollectedDataTypes: [],
        NSPrivacyAccessedAPITypes: [
          {
            NSPrivacyAccessedAPIType:
              "NSPrivacyAccessedAPICategoryUserDefaults",
            NSPrivacyAccessedAPITypeReasons: ["CA92.1"],
          },
          {
            NSPrivacyAccessedAPIType:
              "NSPrivacyAccessedAPICategoryFileTimestamp",
            NSPrivacyAccessedAPITypeReasons: ["C617.1"],
          },
          {
            NSPrivacyAccessedAPIType: "NSPrivacyAccessedAPICategoryDiskSpace",
            NSPrivacyAccessedAPITypeReasons: ["E174.1"],
          },
          {
            NSPrivacyAccessedAPIType:
              "NSPrivacyAccessedAPICategorySystemBootTime",
            NSPrivacyAccessedAPITypeReasons: ["35F9.1"],
          },
        ],
      },
    },
    android: {
      package: "com.duotap.onlysignature",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#133A50",
      },
    },
    web: { output: "static", favicon: "./assets/icon.png" },
    plugins: [
      "expo-router",
      ["./plugins/withOnlySignatureIos"],
      [
        "expo-splash-screen",
        {
          backgroundColor: "#133A50",
          image: "./assets/icon.png",
          imageWidth: 120,
        },
      ],
    ],
    experiments: { typedRoutes: true, reactCompiler: true },
    extra: {
      releaseChannel,
      storeKitMode:
        process.env.EXPO_PUBLIC_STOREKIT_MODE ?? (production ? "real" : "mock"),
      supportUrl: required.supportUrl,
      privacyUrl: required.privacyUrl,
      termsUrl: required.termsUrl,
      supportEmail: required.supportEmail,
      marketingUrl: required.marketingUrl,
      legalOperator: required.legalOperator,
      legalAddress: required.legalAddress,
      dsaTraderStatus: required.dsaTraderStatus,
      territories: required.territories
        .split(",")
        .map((value: string) => value.trim()),
      storeKitProductId: required.productId,
      screenshotFixtureMode:
        process.env.EXPO_PUBLIC_SCREENSHOT_FIXTURE_MODE === "1",
      eas: { projectId: required.easProjectId },
    },
  };
};

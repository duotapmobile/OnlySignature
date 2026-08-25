export type ReleaseMode = "development" | "preview" | "production";
export type StoreKitMode = "mock" | "real";

export interface ReleaseConfig {
  appDisplayName: string;
  appSlug: string;
  bundleIdentifier: string;
  appleTeamId: string;
  storeKitProductId: string;
  privacyUrl: string;
  termsUrl: string;
  supportUrl: string;
  marketingUrl: string;
  supportEmail: string;
  legalOperator: string;
  legalAddress: string;
  dsaTraderStatus: "trader" | "non-trader" | "undecided";
  territories: readonly string[];
  releaseMode: ReleaseMode;
  storeKitMode: StoreKitMode;
}

const unsafeTokens = [
  "placeholder",
  "example.invalid",
  "example.com",
  "changeme",
  "todo",
  "tbd",
];

function hasPlaceholder(value: string): boolean {
  return unsafeTokens.some((token) => value.toLowerCase().includes(token));
}

export function validateReleaseConfig(config: ReleaseConfig): string[] {
  const errors: string[] = [];
  const required: Array<[keyof ReleaseConfig, string | readonly string[]]> =
    Object.entries(config) as Array<
      [keyof ReleaseConfig, string | readonly string[]]
    >;
  for (const [key, raw] of required) {
    const value = Array.isArray(raw) ? raw.join(",") : String(raw);
    if (!value.trim()) errors.push(`${key} is required`);
  }
  if (!/^[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/.test(config.bundleIdentifier))
    errors.push("bundleIdentifier must be reverse-DNS format");
  if (!config.storeKitProductId.startsWith(`${config.bundleIdentifier}.`))
    errors.push("storeKitProductId must derive from bundleIdentifier");
  for (const [key, url] of [
    ["privacyUrl", config.privacyUrl],
    ["termsUrl", config.termsUrl],
    ["supportUrl", config.supportUrl],
    ["marketingUrl", config.marketingUrl],
  ] as const) {
    if (!url.startsWith("https://")) errors.push(`${key} must use HTTPS`);
  }
  if (config.releaseMode === "production") {
    for (const [key, raw] of required) {
      const value = Array.isArray(raw) ? raw.join(",") : String(raw);
      if (hasPlaceholder(value))
        errors.push(`${key} contains a production placeholder`);
    }
    if (config.storeKitMode !== "real")
      errors.push("production requires real StoreKit mode");
    if (config.dsaTraderStatus === "undecided")
      errors.push("production requires a DSA trader decision");
    if (config.territories.length === 0)
      errors.push("production requires explicit territories");
  }
  return [...new Set(errors)];
}

export function assertReleaseConfig(config: ReleaseConfig): ReleaseConfig {
  const errors = validateReleaseConfig(config);
  if (errors.length)
    throw new Error(`Invalid release configuration: ${errors.join("; ")}`);
  return config;
}

export const developmentConfig: ReleaseConfig = {
  appDisplayName: "Only Signature",
  appSlug: "only-signature",
  bundleIdentifier: "com.example.onlysignature",
  appleTeamId: "PLACEHOLDER_APPLE_TEAM_ID",
  storeKitProductId: "com.example.onlysignature.transparent-set-v1",
  privacyUrl: "https://example.invalid/privacy/",
  termsUrl: "https://example.invalid/terms/",
  supportUrl: "https://example.invalid/support/",
  marketingUrl: "https://example.invalid/",
  supportEmail: "support@example.invalid",
  legalOperator: "PLACEHOLDER_LEGAL_OPERATOR",
  legalAddress: "PLACEHOLDER_LEGAL_ADDRESS",
  dsaTraderStatus: "undecided",
  territories: ["US"],
  releaseMode: "development",
  storeKitMode: "mock",
};

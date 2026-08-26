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
  dsaTraderStatus: "trader" | "non-trader" | "undecided" | "not-applicable";
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

export const requiresDsaTraderStatus = (territories: readonly string[]) =>
  territories.some((territory) =>
    EU_DSA_TERRITORIES.has(territory.toUpperCase()),
  );

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
    if (
      requiresDsaTraderStatus(config.territories) &&
      (config.dsaTraderStatus === "undecided" ||
        config.dsaTraderStatus === "not-applicable")
    )
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
  bundleIdentifier: "com.duotap.onlysignature",
  appleTeamId: "JWXC66G9Z5",
  storeKitProductId: "com.duotap.onlysignature.transparent-set-v1",
  privacyUrl: "https://onlysignature.app/privacy/",
  termsUrl: "https://onlysignature.app/terms/",
  supportUrl: "https://onlysignature.app/support/",
  marketingUrl: "https://onlysignature.app/",
  supportEmail: "admin@onlysignature.app",
  legalOperator: "DuoTap LLC",
  legalAddress: "PLACEHOLDER_LEGAL_ADDRESS",
  dsaTraderStatus: "not-applicable",
  territories: ["US"],
  releaseMode: "development",
  storeKitMode: "mock",
};

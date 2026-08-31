const production =
  process.argv.includes("--production") ||
  (process.argv.includes("--if-production") &&
    process.env.EXPO_PUBLIC_RELEASE_MODE === "production");
const env = process.env;
const required = [
  "EAS_PROJECT_ID",
  "EXPO_PUBLIC_APP_DISPLAY_NAME",
  "EXPO_PUBLIC_APP_SLUG",
  "EXPO_PUBLIC_BUNDLE_IDENTIFIER",
  "EXPO_PUBLIC_APPLE_TEAM_ID",
  "EXPO_PUBLIC_STOREKIT_PRODUCT_ID",
  "EXPO_PUBLIC_PRIVACY_URL",
  "EXPO_PUBLIC_TERMS_URL",
  "EXPO_PUBLIC_SUPPORT_URL",
  "EXPO_PUBLIC_MARKETING_URL",
  "EXPO_PUBLIC_SUPPORT_EMAIL",
  "EXPO_PUBLIC_LEGAL_OPERATOR",
  "EXPO_PUBLIC_DSA_TRADER_STATUS",
  "EXPO_PUBLIC_APP_STORE_TERRITORIES",
];
const unsafe = /placeholder|example\.(invalid|com)|changeme|\btodo\b|\btbd\b/i;
const euDsaTerritories = new Set([
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
const errors = [];
if (production) {
  for (const key of required) {
    const value = env[key] ?? "";
    if (!value) errors.push(`${key} is missing`);
    else if (unsafe.test(value)) errors.push(`${key} contains a placeholder`);
  }
  if (env.EXPO_PUBLIC_STOREKIT_MODE !== "real")
    errors.push("EXPO_PUBLIC_STOREKIT_MODE must be real");
  if (env.EXPO_PUBLIC_RELEASE_MODE !== "production")
    errors.push("EXPO_PUBLIC_RELEASE_MODE must be production");
  if (env.EXPO_PUBLIC_SCREENSHOT_FIXTURE_MODE === "1")
    errors.push("EXPO_PUBLIC_SCREENSHOT_FIXTURE_MODE must be disabled");
  if (!/^[A-Za-z0-9_.]+$/.test(env.EXPO_PUBLIC_STOREKIT_PRODUCT_ID ?? ""))
    errors.push(
      "EXPO_PUBLIC_STOREKIT_PRODUCT_ID may contain only letters, numbers, underscores, and periods",
    );
  if (
    !(env.EXPO_PUBLIC_STOREKIT_PRODUCT_ID ?? "").startsWith(
      `${env.EXPO_PUBLIC_BUNDLE_IDENTIFIER ?? ""}.`,
    )
  )
    errors.push(
      "EXPO_PUBLIC_STOREKIT_PRODUCT_ID must derive from EXPO_PUBLIC_BUNDLE_IDENTIFIER",
    );
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      env.EAS_PROJECT_ID ?? "",
    )
  )
    errors.push("EAS_PROJECT_ID must be a valid version 4 UUID");
  const territories = (env.EXPO_PUBLIC_APP_STORE_TERRITORIES ?? "")
    .split(",")
    .map((territory) => territory.trim().toUpperCase())
    .filter(Boolean);
  if (territories.length !== 1 || territories[0] !== "US")
    errors.push(
      "EXPO_PUBLIC_APP_STORE_TERRITORIES must be exactly US for this release",
    );
  const requiresDsaDecision = territories.some((territory) =>
    euDsaTerritories.has(territory),
  );
  if (
    requiresDsaDecision &&
    ["undecided", "not-applicable"].includes(
      (env.EXPO_PUBLIC_DSA_TRADER_STATUS ?? "").toLowerCase(),
    )
  )
    errors.push("EU distribution requires a DSA trader-status decision");
  for (const key of [
    "EXPO_PUBLIC_PRIVACY_URL",
    "EXPO_PUBLIC_TERMS_URL",
    "EXPO_PUBLIC_SUPPORT_URL",
    "EXPO_PUBLIC_MARKETING_URL",
  ]) {
    if (!(env[key] ?? "").startsWith("https://"))
      errors.push(`${key} must use HTTPS`);
  }
}
if (errors.length) {
  process.stderr.write(`${errors.join("\n")}\n`);
  process.exit(1);
}
process.stdout.write(
  production
    ? "Production release configuration passed.\n"
    : "Development configuration does not claim production readiness.\n",
);

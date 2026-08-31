import { createPrivateKey, sign } from "node:crypto";
import { readFile } from "node:fs/promises";

const requiredEnv = [
  "ASC_KEY_ID",
  "ASC_ISSUER_ID",
  "ASC_PRIVATE_KEY_PATH",
  "ASC_APP_ID",
  "ASC_IAP_ID",
];
const missing = requiredEnv.filter((name) => !(process.env[name] ?? "").trim());
if (missing.length)
  throw new Error(`Missing required environment: ${missing.join(", ")}`);

const encode = (value) =>
  Buffer.from(
    typeof value === "string" ? value : JSON.stringify(value),
    "utf8",
  ).toString("base64url");
const now = Math.floor(Date.now() / 1000);
const unsigned = `${encode({
  alg: "ES256",
  kid: process.env.ASC_KEY_ID,
  typ: "JWT",
})}.${encode({
  iss: process.env.ASC_ISSUER_ID,
  iat: now,
  exp: now + 15 * 60,
  aud: "appstoreconnect-v1",
})}`;
const privateKey = createPrivateKey(
  await readFile(process.env.ASC_PRIVATE_KEY_PATH, "utf8"),
);
const signature = sign(null, Buffer.from(unsigned), {
  key: privateKey,
  dsaEncoding: "ieee-p1363",
}).toString("base64url");
const token = `${unsigned}.${signature}`;

const get = async (resource) => {
  const response = await fetch(
    `https://api.appstoreconnect.apple.com${resource}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!response.ok)
    throw new Error(
      `App Store Connect GET ${resource} returned ${response.status}.`,
    );
  return response.json();
};

const appId = process.env.ASC_APP_ID;
const iapId = process.env.ASC_IAP_ID;
const expectedTerritory = "USA";
const expectedGroup = "Only Signature Internal";

const [
  app,
  availability,
  appTerritoryAvailability,
  iap,
  iapAvailability,
  iapTerritoryAvailability,
  groups,
] = await Promise.all([
  get(`/v1/apps/${appId}`),
  get(`/v1/apps/${appId}/appAvailabilityV2`),
  get(
    `/v2/appAvailabilities/${appId}/territoryAvailabilities?include=territory&limit=200`,
  ),
  get(`/v2/inAppPurchases/${iapId}`),
  get(`/v2/inAppPurchases/${iapId}/inAppPurchaseAvailability`),
  get(
    `/v1/inAppPurchaseAvailabilities/${iapId}/availableTerritories?limit=200`,
  ),
  get(`/v1/apps/${appId}/betaGroups?limit=200`),
]);

const appTerritories = (appTerritoryAvailability.data ?? [])
  .filter((item) => item.attributes?.available)
  .map(
    (item) =>
      item.relationships?.territory?.data?.id ??
      item.attributes?.territory ??
      item.id,
  )
  .sort();
const iapTerritories = (iapTerritoryAvailability.data ?? [])
  .map((item) => item.id)
  .sort();
const internalGroups = (groups.data ?? [])
  .filter((group) => group.attributes?.isInternalGroup)
  .map((group) => group.attributes?.name)
  .sort();

const errors = [];
if (app.data?.attributes?.bundleId !== "com.duotap.onlysignature")
  errors.push("live app bundle identifier mismatch");
if (app.data?.attributes?.sku !== "DUOTAP-ONLYSIGNATURE-IOS-001")
  errors.push("live app SKU mismatch");
if (availability.data?.attributes?.availableInNewTerritories !== false)
  errors.push("live app would become available in new territories");
if (appTerritories.length !== 1 || appTerritories[0] !== expectedTerritory)
  errors.push(
    `live app territories are not exactly ${expectedTerritory}: ${appTerritories.join(",") || "none"}`,
  );
if (
  iap.data?.attributes?.productId !==
  "com.duotap.onlysignature.transparent_set_v1"
)
  errors.push("live IAP product identifier mismatch");
if (iap.data?.attributes?.inAppPurchaseType !== "CONSUMABLE")
  errors.push("live IAP is not consumable");
if (iapAvailability.data?.attributes?.availableInNewTerritories !== false)
  errors.push("live IAP would become available in new territories");
if (iapTerritories.length !== 1 || iapTerritories[0] !== expectedTerritory)
  errors.push(
    `live IAP territories are not exactly ${expectedTerritory}: ${iapTerritories.join(",") || "none"}`,
  );
if (!internalGroups.includes(expectedGroup))
  errors.push(`missing internal TestFlight group: ${expectedGroup}`);

const safeResult = {
  app: {
    id: app.data?.id,
    name: app.data?.attributes?.name,
    bundleId: app.data?.attributes?.bundleId,
    sku: app.data?.attributes?.sku,
    territories: appTerritories,
    availableInNewTerritories:
      availability.data?.attributes?.availableInNewTerritories,
  },
  iap: {
    id: iap.data?.id,
    name: iap.data?.attributes?.name,
    productId: iap.data?.attributes?.productId,
    type: iap.data?.attributes?.inAppPurchaseType,
    state: iap.data?.attributes?.state,
    territories: iapTerritories,
    availableInNewTerritories:
      iapAvailability.data?.attributes?.availableInNewTerritories,
  },
  internalGroups,
};

if (errors.length) {
  process.stderr.write(`${JSON.stringify(safeResult, null, 2)}\n`);
  throw new Error(errors.join("; "));
}
process.stdout.write(`${JSON.stringify(safeResult, null, 2)}\n`);
process.stdout.write(
  "Live App Store Connect identity and availability passed.\n",
);

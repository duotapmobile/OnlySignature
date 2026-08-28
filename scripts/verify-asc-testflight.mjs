import { createPrivateKey, sign } from "node:crypto";
import { readFile } from "node:fs/promises";

const requiredEnv = [
  "ASC_KEY_ID",
  "ASC_ISSUER_ID",
  "ASC_PRIVATE_KEY_PATH",
  "ASC_APP_ID",
  "ASC_EXPECTED_BUILD_NUMBER",
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
const buildNumber = process.env.ASC_EXPECTED_BUILD_NUMBER;
const expectedVersion = process.env.ASC_EXPECTED_VERSION ?? "1.0.0";
const groupName = "Only Signature Internal";
const query = new URLSearchParams({
  "filter[app]": appId,
  "filter[version]": buildNumber,
  include: "betaGroups,preReleaseVersion",
  limit: "10",
});
const [builds, groups] = await Promise.all([
  get(`/v1/builds?${query}`),
  get(`/v1/apps/${appId}/betaGroups?limit=200`),
]);
const group = (groups.data ?? []).find(
  (candidate) =>
    candidate.attributes?.isInternalGroup &&
    candidate.attributes?.name === groupName,
);
if (!group) throw new Error(`Missing internal TestFlight group: ${groupName}`);
const matching = (builds.data ?? []).filter(
  (build) => build.attributes?.version === buildNumber,
);
if (matching.length !== 1)
  throw new Error(
    `Expected one processed TestFlight build ${buildNumber}; found ${matching.length}.`,
  );
const build = matching[0];
const relationshipGroups = new Set(
  (build.relationships?.betaGroups?.data ?? []).map((item) => item.id),
);
const includedVersion = (builds.included ?? []).find(
  (item) =>
    item.type === "preReleaseVersions" &&
    item.id === build.relationships?.preReleaseVersion?.data?.id,
);
const localizations = await get(
  `/v1/builds/${build.id}/betaBuildLocalizations?limit=20`,
);
const enUs = (localizations.data ?? []).find(
  (item) => item.attributes?.locale === "en-US",
);
const errors = [];
if (build.attributes?.processingState !== "VALID")
  errors.push(`build processing state is ${build.attributes?.processingState}`);
if (build.attributes?.expired === true) errors.push("build is expired");
if (!relationshipGroups.has(group.id))
  errors.push(`build is not assigned to ${groupName}`);
if (includedVersion?.attributes?.version !== expectedVersion)
  errors.push(
    `pre-release version is not ${expectedVersion}: ${includedVersion?.attributes?.version ?? "missing"}`,
  );
if (!(enUs?.attributes?.whatsNew ?? "").trim())
  errors.push("en-US What to Test is missing");

const safeResult = {
  appId,
  build: {
    id: build.id,
    buildNumber: build.attributes?.version,
    processingState: build.attributes?.processingState,
    expired: build.attributes?.expired,
    uploadedDate: build.attributes?.uploadedDate,
    version: includedVersion?.attributes?.version,
  },
  internalGroup: { id: group.id, name: groupName },
  enUsWhatToTestPresent: Boolean((enUs?.attributes?.whatsNew ?? "").trim()),
};
if (errors.length) {
  process.stderr.write(`${JSON.stringify(safeResult, null, 2)}\n`);
  throw new Error(errors.join("; "));
}
process.stdout.write(`${JSON.stringify(safeResult, null, 2)}\n`);
process.stdout.write(
  "Processed internal TestFlight build and group assignment passed.\n",
);

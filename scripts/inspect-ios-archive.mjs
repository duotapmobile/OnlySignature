import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import {
  access,
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const EXPECTED = {
  bundleIdentifier: "com.duotap.onlysignature",
  teamId: "JWXC66G9Z5",
  productIdentifier: "com.duotap.onlysignature.transparent_set_v1",
  displayName: "Only Signature",
  easProjectId: "954b1a21-89e9-41af-8021-d7c8e66d74c8",
};
const EXPECTED_REQUIRED_REASONS = new Map([
  ["NSPrivacyAccessedAPICategoryUserDefaults", ["CA92.1"]],
  ["NSPrivacyAccessedAPICategoryFileTimestamp", ["C617.1"]],
  ["NSPrivacyAccessedAPICategoryDiskSpace", ["E174.1"]],
  ["NSPrivacyAccessedAPICategorySystemBootTime", ["35F9.1"]],
]);
const fail = (message) => {
  throw new Error(message);
};
const argument = (name) => {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
};
const run = (command, args, options = {}) => {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    ...options,
  });
  if (result.status !== 0)
    fail(`${command} failed while inspecting the signed archive.`);
  return `${result.stdout ?? ""}${result.stderr ?? ""}`;
};
const hashFile = async (file) =>
  createHash("sha256")
    .update(await readFile(file))
    .digest("hex");
const walk = async (directory) => {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(target)));
    else files.push(target);
  }
  return files;
};
const readPlistJson = (file) =>
  JSON.parse(run("/usr/bin/plutil", ["-convert", "json", "-o", "-", file]));
const plistFromCommand = async (contents, directory, filename) => {
  const xmlStart = contents.indexOf("<?xml");
  const plistEnd = contents.lastIndexOf("</plist>");
  if (xmlStart === -1 || plistEnd === -1)
    fail(`No property list was returned for ${filename}.`);
  const file = path.join(directory, filename);
  await writeFile(file, contents.slice(xmlStart, plistEnd + 8), "utf8");
  return readPlistJson(file);
};

if (process.platform !== "darwin")
  fail("Signed iOS archive inspection must run on the EAS macOS worker.");
const ipaArgument = argument("--ipa");
const reportArgument = argument("--report");
if (!ipaArgument || !reportArgument)
  fail("Usage: --ipa <archive.ipa> --report <report.json>");
const ipaPath = path.resolve(ipaArgument);
const reportPath = path.resolve(reportArgument);
const expectedSourceRevision = run("git", ["rev-parse", "HEAD"]).trim();
const archiveBuildId = process.env.ARCHIVE_BUILD_ID;
const archiveWorkflowId = process.env.ARCHIVE_WORKFLOW_ID;
if (!/^[0-9a-f]{40}$/i.test(expectedSourceRevision))
  fail("The workflow checkout does not have a valid source revision.");
if (!archiveBuildId || !archiveWorkflowId)
  fail("EAS build and workflow IDs are required for archive provenance.");
await access(ipaPath);
if (!(await stat(ipaPath)).isFile() || path.extname(ipaPath) !== ".ipa")
  fail("The inspected artifact must be an IPA file.");

const temp = await mkdtemp(path.join(os.tmpdir(), "only-signature-ipa-"));
try {
  execFileSync("/usr/bin/ditto", ["-x", "-k", ipaPath, temp], {
    stdio: "ignore",
  });
  const payload = path.join(temp, "Payload");
  const apps = (await readdir(payload)).filter((name) => name.endsWith(".app"));
  if (apps.length !== 1)
    fail(`Expected one application in the IPA; found ${apps.length}.`);
  const appPath = path.join(payload, apps[0]);
  const info = readPlistJson(path.join(appPath, "Info.plist"));
  if (info.CFBundleIdentifier !== EXPECTED.bundleIdentifier)
    fail("The signed archive bundle identifier is incorrect.");
  if (info.CFBundleDisplayName !== EXPECTED.displayName)
    fail("The signed archive display name is incorrect.");
  if (!info.CFBundleShortVersionString || !info.CFBundleVersion)
    fail("The signed archive is missing version/build metadata.");
  if (info.ITSAppUsesNonExemptEncryption !== false)
    fail(
      "Export-compliance metadata is not fail-closed to no exempt encryption.",
    );
  const releaseStamp = {
    mode: info.OnlySignatureReleaseMode,
    storeKitMode: info.OnlySignatureStoreKitMode,
    screenshotFixtureMode: info.OnlySignatureScreenshotFixtureMode,
    territories: info.OnlySignatureTerritories,
    projectId: info.OnlySignatureEASProjectId,
    productId: info.OnlySignatureStoreKitProductId,
    sourceRevision: info.OnlySignatureSourceRevision,
  };
  if (
    releaseStamp.mode !== "production" ||
    releaseStamp.storeKitMode !== "real" ||
    releaseStamp.screenshotFixtureMode !== false ||
    releaseStamp.territories !== "US" ||
    releaseStamp.projectId !== EXPECTED.easProjectId ||
    releaseStamp.productId !== EXPECTED.productIdentifier ||
    releaseStamp.sourceRevision !== expectedSourceRevision
  )
    fail("The signed archive release-authority stamp is invalid.");

  const sensitiveUsageKeys = Object.keys(info).filter((key) =>
    /NSUserTrackingUsageDescription|NSCameraUsageDescription|NSMicrophoneUsageDescription|NSLocation.*UsageDescription|NSContactsUsageDescription/.test(
      key,
    ),
  );
  if (sensitiveUsageKeys.length)
    fail("The archive declares an unauthorized sensitive permission.");

  const entitlementOutput = run("/usr/bin/codesign", [
    "-d",
    "--entitlements",
    ":-",
    appPath,
  ]);
  const entitlements = await plistFromCommand(
    entitlementOutput,
    temp,
    "entitlements.plist",
  );
  run("/usr/bin/codesign", ["--verify", "--deep", "--strict", appPath]);
  if (entitlements["com.apple.developer.team-identifier"] !== EXPECTED.teamId)
    fail("The archive is signed for the wrong Apple team.");
  if (
    entitlements["com.apple.developer.default-data-protection"] !==
    "NSFileProtectionComplete"
  )
    fail("Complete Data Protection is missing from the signed entitlements.");
  if (
    entitlements["application-identifier"] !==
    `${EXPECTED.teamId}.${EXPECTED.bundleIdentifier}`
  )
    fail("The signed application identifier does not match the bundle.");
  if (entitlements["get-task-allow"] !== false)
    fail(
      "The archive permits debugger attachment and is not distribution-safe.",
    );

  const profileOutput = run("/usr/bin/security", [
    "cms",
    "-D",
    "-i",
    path.join(appPath, "embedded.mobileprovision"),
  ]);
  const profile = await plistFromCommand(profileOutput, temp, "profile.plist");
  if (!profile.TeamIdentifier?.includes(EXPECTED.teamId))
    fail("The provisioning profile belongs to the wrong Apple team.");
  if (
    profile.ProvisionedDevices?.length ||
    profile.ProvisionsAllDevices === true
  )
    fail("The provisioning profile is not an App Store distribution profile.");
  if (profile.Entitlements?.["get-task-allow"] !== false)
    fail("The provisioning profile permits debugger attachment.");
  if (
    profile.Entitlements?.["application-identifier"] !==
    `${EXPECTED.teamId}.${EXPECTED.bundleIdentifier}`
  )
    fail("The provisioning profile application identifier is incorrect.");
  const profileExpiration = new Date(profile.ExpirationDate);
  if (
    Number.isNaN(profileExpiration.getTime()) ||
    profileExpiration.getTime() <= Date.now()
  )
    fail("The provisioning profile is expired or has no valid expiration.");

  const files = await walk(appPath);
  const privacyManifests = files.filter(
    (file) => path.basename(file) === "PrivacyInfo.xcprivacy",
  );
  if (!privacyManifests.length)
    fail("The signed archive contains no privacy manifest.");
  for (const manifest of privacyManifests)
    run("/usr/bin/plutil", ["-lint", manifest]);
  const appPrivacyManifest = path.join(appPath, "PrivacyInfo.xcprivacy");
  await access(appPrivacyManifest);
  const appPrivacy = readPlistJson(appPrivacyManifest);
  if (appPrivacy.NSPrivacyTracking !== false)
    fail(
      "The application privacy manifest does not explicitly disable tracking.",
    );
  if (appPrivacy.NSPrivacyTrackingDomains?.length)
    fail("The application privacy manifest declares tracking domains.");
  if (appPrivacy.NSPrivacyCollectedDataTypes?.length)
    fail("The application privacy manifest declares collected data.");
  const requiredReasonEntries = new Map(
    (appPrivacy.NSPrivacyAccessedAPITypes ?? []).map((entry) => [
      entry.NSPrivacyAccessedAPIType,
      [...(entry.NSPrivacyAccessedAPITypeReasons ?? [])].sort(),
    ]),
  );
  for (const [category, reasons] of EXPECTED_REQUIRED_REASONS) {
    if (!requiredReasonEntries.has(category))
      fail(`The application privacy manifest is missing ${category}.`);
    if (
      JSON.stringify(requiredReasonEntries.get(category)) !==
      JSON.stringify([...reasons].sort())
    )
      fail(
        `The application privacy manifest has unexpected reasons for ${category}.`,
      );
  }
  for (const manifest of privacyManifests) {
    const privacy = readPlistJson(manifest);
    if (privacy.NSPrivacyTracking === true)
      fail("A bundled privacy manifest declares tracking.");
    if (privacy.NSPrivacyTrackingDomains?.length)
      fail("A bundled privacy manifest declares tracking domains.");
    if (privacy.NSPrivacyCollectedDataTypes?.length)
      fail("A bundled privacy manifest declares collected data.");
  }
  const otaModuleFiles = files.filter((file) =>
    /(?:^|[/\\])(?:EXUpdates|expo-updates)(?:[/\\.]|$)/i.test(file),
  );
  if (otaModuleFiles.length)
    fail("Expo over-the-air update code is present in the production archive.");

  const binaryFiles = files.filter((file) => {
    const extension = path.extname(file).toLowerCase();
    return !new Set([
      ".png",
      ".jpg",
      ".jpeg",
      ".car",
      ".ttf",
      ".otf",
      ".metallib",
    ]).has(extension);
  });
  let productIdentifierPresent = false;
  let secretMarkerPresent = false;
  for (const file of binaryFiles) {
    let contents;
    try {
      contents = await readFile(file);
    } catch {
      continue;
    }
    if (contents.includes(Buffer.from(EXPECTED.productIdentifier)))
      productIdentifierPresent = true;
    if (
      /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|sk_live_[A-Za-z0-9]{16,}|AKIA[0-9A-Z]{16}/.test(
        contents.toString("latin1"),
      )
    )
      secretMarkerPresent = true;
  }
  if (!productIdentifierPresent)
    fail("The production StoreKit product identifier was not embedded.");
  if (secretMarkerPresent)
    fail("A private-key or production-secret marker was found in the archive.");

  const frameworks = files
    .filter((file) => file.includes(".framework"))
    .map((file) => file.slice(0, file.indexOf(".framework") + 10))
    .map((file) => path.relative(appPath, file).replaceAll("\\", "/"));
  const report = {
    schemaVersion: 1,
    inspectedAt: new Date().toISOString(),
    ipaSha256: await hashFile(ipaPath),
    identity: {
      bundleIdentifier: info.CFBundleIdentifier,
      displayName: info.CFBundleDisplayName,
      version: info.CFBundleShortVersionString,
      buildNumber: info.CFBundleVersion,
      teamId: EXPECTED.teamId,
    },
    configuration: {
      productIdentifier: EXPECTED.productIdentifier,
      productIdentifierPresent,
      releaseStamp,
      otaUpdatesEnabled: false,
      otaModuleFileCount: otaModuleFiles.length,
      buildTimeValidator: "eas-build-post-install",
      usesNonExemptEncryption: info.ITSAppUsesNonExemptEncryption,
    },
    security: {
      dataProtection:
        entitlements["com.apple.developer.default-data-protection"],
      getTaskAllow: entitlements["get-task-allow"],
      distributionProfile:
        !profile.ProvisionedDevices?.length &&
        profile.ProvisionsAllDevices !== true,
      profileExpiration: profileExpiration.toISOString(),
      sensitiveUsageKeys,
      secretMarkerPresent,
      privacyManifestCount: privacyManifests.length,
      trackingDeclared: false,
      trackingDomainCount: 0,
    },
    privacyManifests: privacyManifests.map((file) =>
      path.relative(appPath, file).replaceAll("\\", "/"),
    ),
    frameworks: [...new Set(frameworks)].sort(),
    result: "PASS",
    provenance: {
      easBuildId: archiveBuildId,
      easWorkflowId: archiveWorkflowId,
      sourceRevision: releaseStamp.sourceRevision,
    },
  };
  await mkdir(path.dirname(reportPath), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  process.stdout.write(
    `Signed archive inspection passed; report: ${reportPath}\n`,
  );
} finally {
  await rm(temp, { recursive: true, force: true });
}

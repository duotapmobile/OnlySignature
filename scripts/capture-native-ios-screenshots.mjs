import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import {
  mkdtemp,
  mkdir,
  cp,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import {
  buildScreenshotMaestroFlow,
  iosOpenConfirmationPattern,
  screenshotAppId,
  screenshotColdLaunchPlan,
} from "./native-screenshot-flow.mjs";

const fail = (message) => {
  throw new Error(message);
};
const argument = (name) => {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
};
const run = (command, args, options = {}) =>
  execFileSync(command, args, { stdio: "inherit", ...options });
const output = (command, args) =>
  execFileSync(command, args, { encoding: "utf8" }).trim();
const diagnosticCommand = async (directory, name, command, args) => {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });
  const record = {
    command,
    args,
    status: result.status,
    signal: result.signal,
    error: result.error?.message ?? null,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
  await writeFile(
    path.join(directory, `${name}.json`),
    `${JSON.stringify(record, null, 2)}\n`,
    "utf8",
  );
  return record;
};
const hashFile = async (file) =>
  createHash("sha256")
    .update(await readFile(file))
    .digest("hex");
const commitSha = output("git", ["rev-parse", "HEAD"]);
const verifyNativeExportFile = async (file, mode) => {
  const image = sharp(file);
  const metadata = await image.metadata();
  const { data, info } = await image.ensureAlpha().raw().toBuffer({
    resolveWithObject: true,
  });
  let transparentPixels = 0;
  let visiblePixels = 0;
  let minX = info.width;
  let minY = info.height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const index = (y * info.width + x) * 4;
      const alpha = data[index + 3];
      if (alpha === 0) transparentPixels += 1;
      if (alpha > 20 && data[index] < 180 && data[index + 1] < 180) {
        visiblePixels += 1;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }
  if (!visiblePixels) fail(`${mode} contains no visible signature pixels.`);
  const margins = [minX, minY, info.width - 1 - maxX, info.height - 1 - maxY];
  if (margins.some((margin) => margin < 1))
    fail(`${mode} has no proportional export padding.`);
  if (mode === "transparent" && transparentPixels === 0)
    fail("The runtime transparent PNG has no transparent pixels.");
  if (mode !== "transparent" && transparentPixels > 0)
    fail(`The runtime ${mode} export is not fully opaque.`);
  if (mode === "jpeg" && metadata.hasAlpha)
    fail("The runtime JPEG unexpectedly declares alpha.");
  return {
    width: metadata.width,
    height: metadata.height,
    hasAlpha: Boolean(metadata.hasAlpha),
    transparentPixels,
    visiblePixels,
    margins,
    sha256: await hashFile(file),
  };
};

if (process.platform !== "darwin")
  fail("Native iOS screenshot capture requires an EAS macOS worker.");

const appArgument = argument("--app");
const appPath = appArgument ? path.resolve(appArgument) : undefined;
const device = argument("--device");
if (!appPath || !device) fail("Usage: --app <path.app> --device iphone|ipad");
if (!new Set(["iphone", "ipad"]).has(device))
  fail("Device must be iphone or ipad.");
if (path.extname(appPath) !== ".app" || !(await stat(appPath)).isDirectory())
  fail("The downloaded simulator artifact must be an extracted .app bundle.");
const plistValue = (key) =>
  output("/usr/bin/plutil", [
    "-extract",
    key,
    "raw",
    "-o",
    "-",
    path.join(appPath, "Info.plist"),
  ]);
const urlTypes = JSON.parse(
  output("/usr/bin/plutil", [
    "-extract",
    "CFBundleURLTypes",
    "json",
    "-o",
    "-",
    path.join(appPath, "Info.plist"),
  ]),
);
const registeredSchemes = urlTypes.flatMap(
  (entry) => entry.CFBundleURLSchemes ?? [],
);
if (!registeredSchemes.includes("onlysignature"))
  fail("The simulator app does not register the onlysignature URL scheme.");
if (
  plistValue("CFBundleIdentifier") !== "com.duotap.onlysignature" ||
  plistValue("OnlySignatureReleaseMode") !== "preview" ||
  plistValue("OnlySignatureStoreKitMode") !== "mock" ||
  plistValue("OnlySignatureScreenshotFixtureMode") !== "true" ||
  plistValue("OnlySignatureTerritories") !== "US" ||
  plistValue("OnlySignatureEASProjectId") !==
    "954b1a21-89e9-41af-8021-d7c8e66d74c8" ||
  plistValue("OnlySignatureStoreKitProductId") !==
    "com.duotap.onlysignature.transparent_set_v1" ||
  plistValue("OnlySignatureSourceRevision") !== commitSha
)
  fail("The simulator app release-authority stamp is invalid.");

const manifestPath =
  process.env.SCREENSHOT_MANIFEST_PATH ??
  "store-assets/screenshots/manifest.json";
if (
  ![
    "store-assets/screenshots/manifest.json",
    "apps/mobile/e2e/native-actual-flow-manifest.json",
  ].includes(manifestPath)
)
  fail("The screenshot manifest path is not allowlisted.");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const expected = manifest.outputs[device];
const requestedModel =
  device === "iphone" ? "iPhone 15 Pro Max" : "iPad Pro 13-inch (M4)";
const deviceTypes = JSON.parse(
  output("xcrun", ["simctl", "list", "devicetypes", "--json"]),
).devicetypes;
const selectedType = deviceTypes.find((entry) => entry.name === requestedModel);
if (!selectedType)
  fail(`Required simulator device type is unavailable: ${requestedModel}`);
const runtimes = JSON.parse(
  output("xcrun", ["simctl", "list", "runtimes", "--json"]),
).runtimes.filter(
  (entry) =>
    entry.isAvailable &&
    entry.identifier.includes("iOS") &&
    Number.parseInt(entry.version, 10) >= 26,
);
const runtime = runtimes
  .sort((left, right) =>
    left.version.localeCompare(right.version, undefined, { numeric: true }),
  )
  .at(-1);
if (!runtime) fail("No available iOS Simulator runtime was found.");

const buildId = process.env.SCREENSHOT_BUILD_ID;
const workflowId = process.env.SCREENSHOT_WORKFLOW_ID;
const workflowUrl = process.env.SCREENSHOT_WORKFLOW_URL;
if (!buildId || !workflowId || !workflowUrl)
  fail("EAS build, workflow ID, and workflow URL provenance are required.");

const rawDir = path.join(
  "store-assets",
  "screenshots",
  "native",
  "raw",
  device,
);
await rm(rawDir, { recursive: true, force: true });
await mkdir(rawDir, { recursive: true });
const diagnosticsDir = path.join(
  "artifacts",
  "native-screenshot-diagnostics",
  device,
);
await rm(diagnosticsDir, { recursive: true, force: true });
await mkdir(diagnosticsDir, { recursive: true });
await writeFile(
  path.join(diagnosticsDir, "app-authority.json"),
  `${JSON.stringify(
    {
      bundleIdentifier: plistValue("CFBundleIdentifier"),
      registeredSchemes,
      releaseMode: plistValue("OnlySignatureReleaseMode"),
      storeKitMode: plistValue("OnlySignatureStoreKitMode"),
      screenshotFixtureMode: plistValue("OnlySignatureScreenshotFixtureMode"),
      sourceRevision: plistValue("OnlySignatureSourceRevision"),
    },
    null,
    2,
  )}\n`,
  "utf8",
);
const tempDir = await mkdtemp(
  path.join(os.tmpdir(), "only-signature-maestro-"),
);
const simulatorName = `Only Signature ${device} ${workflowId.slice(0, 8)}`;
const udid = output("xcrun", [
  "simctl",
  "create",
  simulatorName,
  selectedType.identifier,
  runtime.identifier,
]);

const captures = [];
const coldLaunch = async (route, diagnosticName) => {
  const coldLaunchPlan = screenshotColdLaunchPlan(udid, route);
  const openUrlStep = coldLaunchPlan.find((step) => step.args[1] === "openurl");
  if (!openUrlStep)
    fail("The screenshot cold-launch plan does not contain an openurl step.");
  const directory = path.join(diagnosticsDir, diagnosticName);
  await mkdir(directory, { recursive: true });
  await writeFile(
    path.join(directory, "route.json"),
    `${JSON.stringify(
      {
        route,
        deepLink: openUrlStep.args.at(-1),
        capturedAt: new Date().toISOString(),
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  for (const step of coldLaunchPlan) {
    const name = step.args[1] === "terminate" ? "terminate" : "openurl";
    const result = await diagnosticCommand(
      directory,
      name,
      step.command,
      step.args,
    );
    if (!step.allowFailure && result.status !== 0)
      fail(
        `${step.command} ${step.args.join(" ")} failed with status ${result.status}.`,
      );
  }
  await diagnosticCommand(directory, "post-open-screenshot", "xcrun", [
    "simctl",
    "io",
    udid,
    "screenshot",
    path.join(directory, "post-open.png"),
  ]);
  await diagnosticCommand(directory, "accessibility-hierarchy", "maestro", [
    "--device",
    udid,
    "hierarchy",
  ]);
  await diagnosticCommand(directory, "process-state", "xcrun", [
    "simctl",
    "spawn",
    udid,
    "ps",
    "-A",
    "-o",
    "pid=,comm=",
  ]);
  await diagnosticCommand(directory, "frontmost-application", "xcrun", [
    "simctl",
    "spawn",
    udid,
    "defaults",
    "read",
    "com.apple.springboard",
    "FrontmostApplicationDisplayIdentifier",
  ]);
  await diagnosticCommand(directory, "launch-log", "xcrun", [
    "simctl",
    "spawn",
    udid,
    "log",
    "show",
    "--style",
    "compact",
    "--last",
    "2m",
    "--predicate",
    'process == "OnlySignature" OR eventMessage CONTAINS[c] "com.duotap.onlysignature"',
  ]);
  return directory;
};
try {
  run("xcrun", ["simctl", "boot", udid]);
  run("xcrun", ["simctl", "bootstatus", udid, "-b"]);
  run("xcrun", ["simctl", "ui", udid, "appearance", "light"]);
  run("xcrun", [
    "simctl",
    "spawn",
    udid,
    "defaults",
    "write",
    ".GlobalPreferences",
    "AppleLanguages",
    "-array",
    "en-US",
  ]);
  run("xcrun", [
    "simctl",
    "spawn",
    udid,
    "defaults",
    "write",
    ".GlobalPreferences",
    "AppleLocale",
    "en_US",
  ]);
  run("xcrun", [
    "simctl",
    "status_bar",
    udid,
    "override",
    "--time",
    "9:41",
    "--batteryState",
    "charged",
    "--batteryLevel",
    "100",
  ]);
  run("xcrun", ["simctl", "install", udid, appPath]);

  for (const shot of manifest.screenshots) {
    const flowPath = path.join(tempDir, `${shot.id}.yml`);
    const flow = buildScreenshotMaestroFlow(shot);
    await writeFile(flowPath, flow, "utf8");
    const diagnosticDirectory = await coldLaunch(shot.route, shot.id);
    run("maestro", [
      "--device",
      udid,
      "test",
      `--test-output-dir=${path.join(diagnosticDirectory, "maestro")}`,
      flowPath,
    ]);

    const rawPath = path.join(rawDir, `${shot.id}.png`);
    run("xcrun", ["simctl", "io", udid, "screenshot", rawPath]);
    const metadata = await sharp(rawPath).metadata();
    if (
      metadata.width !== expected.width ||
      metadata.height !== expected.height
    )
      fail(
        `${shot.id} captured at ${metadata.width}x${metadata.height}; expected ${expected.width}x${expected.height}.`,
      );
    captures.push({
      id: shot.id,
      route: shot.route,
      assertions: shot.assertions,
      rawPath: rawPath.replaceAll("\\", "/"),
      rawSha256: await hashFile(rawPath),
      width: metadata.width,
      height: metadata.height,
    });
  }
  if (device === "iphone") {
    const exportFlowPath = path.join(tempDir, "native-export-test.yml");
    await writeFile(
      exportFlowPath,
      [
        `appId: ${screenshotAppId}`,
        "---",
        "- runFlow:",
        "    when:",
        `      visible: ${JSON.stringify(iosOpenConfirmationPattern)}`,
        "    commands:",
        `      - tapOn: ${JSON.stringify("Open")}`,
        "- extendedWaitUntil:",
        "    visible:",
        `      id: ${JSON.stringify("app-ready")}`,
        "    timeout: 30000",
        "- extendedWaitUntil:",
        '    visible: "Native export verification files ready"',
        "    timeout: 30000",
        "",
      ].join("\n"),
      "utf8",
    );
    const exportDiagnosticDirectory = await coldLaunch(
      "/native-export-test?fixture=native-export",
      "native-export-test",
    );
    run("maestro", [
      "--device",
      udid,
      "test",
      `--test-output-dir=${path.join(exportDiagnosticDirectory, "maestro")}`,
      exportFlowPath,
    ]);
    const dataContainer = output("xcrun", [
      "simctl",
      "get_app_container",
      udid,
      "com.duotap.onlysignature",
      "data",
    ]);
    const sourceDirectory = path.join(
      dataContainer,
      "Library",
      "Caches",
      "only-signature-exports",
      "native-export-verification",
    );
    const nativeExportDirectory = path.join(
      "artifacts",
      "native-export-verification",
    );
    await rm(nativeExportDirectory, { recursive: true, force: true });
    await mkdir(nativeExportDirectory, { recursive: true });
    await cp(sourceDirectory, nativeExportDirectory, { recursive: true });
    const transparentPath = path.join(
      nativeExportDirectory,
      "signature-transparent.png",
    );
    const whitePath = path.join(nativeExportDirectory, "signature-white.png");
    const jpegPath = path.join(nativeExportDirectory, "signature-white.jpg");
    const exportReport = {
      schemaVersion: 1,
      source: "native-react-native-view-shot-ios-simulator",
      commitSha,
      easBuildId: buildId,
      easWorkflowId: workflowId,
      transparent: await verifyNativeExportFile(transparentPath, "transparent"),
      whitePng: await verifyNativeExportFile(whitePath, "white PNG"),
      jpeg: await verifyNativeExportFile(jpegPath, "jpeg"),
      result: "PASS",
    };
    await writeFile(
      path.join(nativeExportDirectory, "verification.json"),
      `${JSON.stringify(exportReport, null, 2)}\n`,
      "utf8",
    );
  }
} finally {
  try {
    run("xcrun", ["simctl", "shutdown", udid]);
  } catch {}
  try {
    run("xcrun", ["simctl", "delete", udid]);
  } catch {}
  await rm(tempDir, { recursive: true, force: true });
}

await writeFile(
  path.join(rawDir, "capture-provenance.json"),
  `${JSON.stringify(
    {
      schemaVersion: 1,
      source: "native-react-native-ios-simulator",
      commitSha,
      easBuildId: buildId,
      easWorkflowId: workflowId,
      easWorkflowUrl: workflowUrl,
      simulatorModel: selectedType.name,
      simulatorDeviceTypeIdentifier: selectedType.identifier,
      iosRuntime: runtime.name,
      iosRuntimeIdentifier: runtime.identifier,
      capturedAt: new Date().toISOString(),
      captures,
    },
    null,
    2,
  )}\n`,
  "utf8",
);
process.stdout.write(
  `Captured ${captures.length} asserted native ${device} screenshots on ${selectedType.name}.\n`,
);

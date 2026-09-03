import { createHash } from "node:crypto";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { readImageOpacity } from "./image-opacity.mjs";
import {
  buildScreenshotMaestroFlow,
  iosOpenConfirmationPattern,
  screenshotAppReadyTestId,
  screenshotColdLaunchPlan,
  screenshotDeepLink,
} from "./native-screenshot-flow.mjs";

const manifest = JSON.parse(
  await readFile("store-assets/screenshots/manifest.json", "utf8"),
);
const requireNative = process.argv.includes("--require-native");
const digest = async (file) =>
  createHash("sha256")
    .update(await readFile(file))
    .digest("hex");
const exists = async (file) => {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
};
const expectedStory = [
  [
    "01-signature-initials",
    "/preview?fixture=both",
    "Your Signature and Initials",
  ],
  [
    "02-remove-white-box",
    "/clear-background?fixture=both",
    "Remove the White Box",
  ],
  ["03-no-editing", "/purchase?fixture=both", "No Editing or Cropping"],
  [
    "04-any-document",
    "/purchase?fixture=signature",
    "Place It on Any Document",
  ],
  ["05-no-login", "/?fixture=landing", "No Login. No Subscription."],
  [
    "06-no-upload",
    "/privacy?fixture=privacy",
    "We Do Not Upload Your Signature",
  ],
  ["07-formats", "/export?fixture=purchased", "Choose the Format You Need"],
  ["08-one-purchase", "/saved?fixture=purchased", "One Purchase for This Set"],
];
if (manifest.screenshots.length !== 8)
  throw new Error(
    "The en-US screenshot story must contain exactly eight frames.",
  );
for (const [index, expected] of expectedStory.entries()) {
  const shot = manifest.screenshots[index];
  if (
    shot.id !== expected[0] ||
    shot.route !== expected[1] ||
    shot.headline !== expected[2]
  )
    throw new Error(`Screenshot story drift at frame ${index + 1}.`);
  if (!Array.isArray(shot.assertions) || shot.assertions.length < 2)
    throw new Error(`${shot.id} does not assert its exact visible state.`);
  const flow = buildScreenshotMaestroFlow(shot);
  const coldLaunch = screenshotColdLaunchPlan("TEST-UDID", shot.route);
  const appReady = flow.indexOf(`id: "${screenshotAppReadyTestId}"`);
  const confirmation = flow.indexOf(JSON.stringify(iosOpenConfirmationPattern));
  const routeReady = flow.indexOf(
    `visible: ${JSON.stringify(shot.assertions[0])}`,
  );
  if (
    coldLaunch.length !== 2 ||
    coldLaunch[0]?.args?.[1] !== "terminate" ||
    coldLaunch[1]?.args?.[1] !== "openurl" ||
    coldLaunch[1]?.args?.at(-1) !== screenshotDeepLink(shot.route) ||
    confirmation < 0 ||
    appReady <= confirmation ||
    routeReady <= appReady ||
    flow.includes("openLink:") ||
    flow.includes("launchApp:")
  )
    throw new Error(
      `${shot.id} must cold-launch its fixture URL, handle iOS confirmation, prove hydration, and prove route-ready copy before capture.`,
    );
}
if (
  manifest.outputs.iphone.width !== 1290 ||
  manifest.outputs.iphone.height !== 2796 ||
  manifest.outputs.ipad.width !== 2064 ||
  manifest.outputs.ipad.height !== 2752
)
  throw new Error(
    "Screenshot dimensions are not accepted 6.9-inch/13-inch sizes.",
  );

let compositionCount = 0;
for (const device of ["iphone", "ipad"]) {
  const expected = manifest.outputs[device];
  for (const shot of manifest.screenshots) {
    const file = path.join(
      "store-assets",
      "screenshots",
      "composition-evidence",
      "final",
      device,
      "en-US",
      `${shot.id}.png`,
    );
    const metadata = await sharp(file).metadata();
    if (
      metadata.format !== "png" ||
      metadata.width !== expected.width ||
      metadata.height !== expected.height ||
      metadata.hasAlpha
    )
      throw new Error(`Invalid web-rendered composition evidence: ${file}`);
    compositionCount += 1;
  }
}

const nativeRoot = path.join("store-assets", "screenshots", "native");
const nativePresent = await exists(nativeRoot);
if (!nativePresent && !requireNative) {
  process.stdout.write(
    `Composition evidence verified: ${compositionCount} web-rendered frames. Native App Store captures remain an EAS workflow gate.\n`,
  );
  process.exit(0);
}
if (!nativePresent)
  throw new Error(
    "Native screenshot directory is absent; run the EAS workflow.",
  );

let nativeCount = 0;
const allFinalHashes = new Set();
for (const device of ["iphone", "ipad"]) {
  const expected = manifest.outputs[device];
  const provenance = JSON.parse(
    await readFile(
      path.join(nativeRoot, "provenance", `${device}.json`),
      "utf8",
    ),
  );
  if (
    provenance.source !== "native-react-native-ios-simulator" ||
    !provenance.commitSha ||
    !provenance.easBuildId ||
    !provenance.easWorkflowId ||
    !provenance.easWorkflowUrl ||
    !provenance.simulatorModel ||
    !provenance.iosRuntime
  )
    throw new Error(`Incomplete native provenance for ${device}.`);
  if (provenance.finalCaptures?.length !== 8)
    throw new Error(`Expected eight final provenance entries for ${device}.`);
  if (provenance.captures?.length !== 8)
    throw new Error(`Expected eight asserted raw captures for ${device}.`);

  for (const shot of manifest.screenshots) {
    const rawPath = path.join(nativeRoot, "raw", device, `${shot.id}.png`);
    const finalPath = path.join(
      nativeRoot,
      "final",
      device,
      "en-US",
      `${shot.id}.png`,
    );
    const record = provenance.finalCaptures.find(
      (capture) => capture.id === shot.id && capture.route === shot.route,
    );
    const rawRecord = provenance.captures.find(
      (capture) => capture.id === shot.id && capture.route === shot.route,
    );
    if (!record) throw new Error(`Missing ${device}/${shot.id} provenance.`);
    if (
      !rawRecord ||
      JSON.stringify(rawRecord.assertions) !== JSON.stringify(shot.assertions)
    )
      throw new Error(`Assertion provenance drift for ${device}/${shot.id}.`);
    const rawHash = await digest(rawPath);
    const finalHash = await digest(finalPath);
    if (
      rawRecord.rawSha256 !== rawHash ||
      record.rawSha256 !== rawHash ||
      record.finalSha256 !== finalHash
    )
      throw new Error(`Hash mismatch for ${device}/${shot.id}.`);
    allFinalHashes.add(finalHash);
    const { metadata: rawMetadata, fullyOpaque: rawIsFullyOpaque } =
      await readImageOpacity(rawPath);
    if (
      rawMetadata.format !== "png" ||
      rawMetadata.width !== expected.width ||
      rawMetadata.height !== expected.height ||
      !rawIsFullyOpaque
    )
      throw new Error(`Invalid native raw screenshot: ${rawPath}`);
    const metadata = await sharp(finalPath).metadata();
    if (
      metadata.format !== "png" ||
      metadata.width !== expected.width ||
      metadata.height !== expected.height ||
      metadata.hasAlpha
    )
      throw new Error(`Invalid native App Store screenshot: ${finalPath}`);
    nativeCount += 1;
  }
}
if (allFinalHashes.size !== 16)
  throw new Error(
    "Native final screenshots are not distinct across both devices.",
  );
const iapPath = path.join(
  "store-assets",
  "app-review",
  "native",
  "iap-review-1024.png",
);
const iapProvenance = JSON.parse(
  await readFile(
    path.join("store-assets", "app-review", "native", "provenance.json"),
    "utf8",
  ),
);
const iap = await sharp(iapPath).metadata();
if (
  iap.format !== "png" ||
  iap.width !== 1024 ||
  iap.height !== 1024 ||
  iap.hasAlpha
)
  throw new Error("Invalid native-derived IAP review screenshot.");
const iapSource = path.join(nativeRoot, "raw", "iphone", "03-no-editing.png");
if (
  iapProvenance.sourceFrameId !== "03-no-editing" ||
  iapProvenance.sourceRoute !== "/purchase?fixture=both" ||
  iapProvenance.sourceSha256 !== (await digest(iapSource)) ||
  iapProvenance.outputSha256 !== (await digest(iapPath)) ||
  iapProvenance.easBuildId !==
    JSON.parse(
      await readFile(
        path.join(nativeRoot, "provenance", "iphone.json"),
        "utf8",
      ),
    ).easBuildId
)
  throw new Error("Native-derived IAP review provenance is incomplete.");
process.stdout.write(
  `Native store assets verified: ${nativeCount} asserted, distinct, opaque screenshots plus native-derived IAP review image.\n`,
);

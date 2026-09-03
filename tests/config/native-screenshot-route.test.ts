import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import {
  buildScreenshotMaestroFlow,
  iosOpenConfirmationPattern,
  screenshotAppReadyTestId,
  screenshotColdLaunchPlan,
  screenshotDeepLink,
} from "../../scripts/native-screenshot-flow.mjs";
import { readImageOpacity } from "../../scripts/image-opacity.mjs";
import { formatControlAccessibilityLabel } from "../../apps/mobile/src/domain/models";
import { privacyFixtureCopy } from "../../packages/content/src/copy/index";

describe("native screenshot deep-link readiness", () => {
  const shot = {
    id: "01-signature-initials",
    route: "/preview?fixture=both",
    assertions: ["Confirm Your Signing Set", "Signature", "Initials"],
  };

  it("preserves the exact Expo Router fixture route", () => {
    expect(screenshotDeepLink(shot.route)).toBe(
      "onlysignature:///preview?fixture=both",
    );
  });

  it("cold-launches the fixture route while the app is stopped", () => {
    const plan = screenshotColdLaunchPlan("SIMULATOR-UDID", shot.route);

    expect(plan).toEqual([
      {
        command: "xcrun",
        args: [
          "simctl",
          "terminate",
          "SIMULATOR-UDID",
          "com.duotap.onlysignature",
        ],
        allowFailure: true,
      },
      {
        command: "xcrun",
        args: [
          "simctl",
          "openurl",
          "SIMULATOR-UDID",
          "onlysignature:///preview?fixture=both",
        ],
        allowFailure: false,
      },
    ]);
  });

  it("handles iOS confirmation before proving hydration and route copy", () => {
    const flow = buildScreenshotMaestroFlow(shot);
    const confirmation = flow.indexOf(
      JSON.stringify(iosOpenConfirmationPattern),
    );
    const appReady = flow.indexOf(`id: "${screenshotAppReadyTestId}"`);
    const routeReady = flow.indexOf('visible: "Confirm Your Signing Set"');
    const finalAssertion = flow.indexOf(
      '- assertVisible: "Confirm Your Signing Set"',
    );

    expect(confirmation).toBeGreaterThan(-1);
    expect(appReady).toBeGreaterThan(confirmation);
    expect(routeReady).toBeGreaterThan(appReady);
    expect(finalAssertion).toBeGreaterThan(routeReady);
    expect(flow).not.toContain("waitForAnimationToEnd");
    expect(flow).not.toContain("openLink:");
    expect(flow).not.toContain("launchApp:");
  });

  it("matches the evidenced iOS 26 confirmation and the legacy quote form", () => {
    const confirmation = new RegExp(iosOpenConfirmationPattern);

    expect(confirmation.test("Open in \u201cOnly Signature\u201d?")).toBe(true);
    expect(confirmation.test('Open in "Only Signature"?')).toBe(true);
    expect(confirmation.test("Open in Another App?")).toBe(false);
  });

  it("asserts the current Clear Background comparison and decline action", () => {
    const manifest = JSON.parse(
      readFileSync("store-assets/screenshots/manifest.json", "utf8"),
    );
    const comparison = manifest.screenshots.find(
      (candidate: { id: string }) => candidate.id === "02-remove-white-box",
    );

    expect(comparison.assertions).toEqual([
      "Clear Background",
      "Looks natural on any document.",
      "White box",
      "No Thanks",
    ]);
    const flow = buildScreenshotMaestroFlow(comparison);
    expect(flow).toContain('- assertVisible: "White box"');
    expect(flow).toContain('- assertVisible: "No Thanks"');
  });

  it("asserts the current background choices and U.S. fixture price", () => {
    const manifest = JSON.parse(
      readFileSync("store-assets/screenshots/manifest.json", "utf8"),
    );
    const purchase = manifest.screenshots.find(
      (candidate: { id: string }) => candidate.id === "03-no-editing",
    );

    expect(purchase.assertions).toEqual([
      "Choose Your Background",
      "Transparent Background",
      "White Background",
      "^Unlock Transparent Set · \\$1\\.99$",
    ]);
  });

  it("asserts the exact centralized privacy sentence including punctuation", () => {
    const manifest = JSON.parse(
      readFileSync("store-assets/screenshots/manifest.json", "utf8"),
    );
    const privacy = manifest.screenshots.find(
      (candidate: { id: string }) => candidate.id === "06-no-upload",
    );

    expect(privacy.assertions).toEqual([
      "Privacy Policy",
      privacyFixtureCopy.operatorStatement,
    ]);
    expect(buildScreenshotMaestroFlow(privacy)).toContain(
      `- assertVisible: ${JSON.stringify(privacyFixtureCopy.operatorStatement)}`,
    );
  });

  it("asserts purchased formats through the combined accessible control labels", () => {
    const manifest = JSON.parse(
      readFileSync("store-assets/screenshots/manifest.json", "utf8"),
    );
    const formats = manifest.screenshots.find(
      (candidate: { id: string }) => candidate.id === "07-formats",
    );
    const signatureLabel = formatControlAccessibilityLabel(
      "Signature",
      "png-transparent",
    );
    const initialsLabel = formatControlAccessibilityLabel(
      "Initials",
      "png-transparent",
    );

    expect(formats.assertions).toEqual([
      "Export Transparent Set",
      "Choose your export format.",
      signatureLabel,
      initialsLabel,
    ]);
    const flow = buildScreenshotMaestroFlow(formats);
    expect(flow).toContain(
      `- assertVisible: ${JSON.stringify(signatureLabel)}`,
    );
    expect(flow).toContain(`- assertVisible: ${JSON.stringify(initialsLabel)}`);
    expect(flow).not.toContain('- assertVisible: "PNG, Transparent"');
  });

  it("uses the cold-launch plan before Maestro for screenshots and export", () => {
    const source = readFileSync(
      "scripts/capture-native-ios-screenshots.mjs",
      "utf8",
    );
    const screenshotLaunch = source.indexOf(
      "await coldLaunch(shot.route, shot.id)",
    );
    const screenshotMaestro = source.indexOf(
      '`--test-output-dir=${path.join(diagnosticDirectory, "maestro")}`',
    );
    const exportLaunch = source.indexOf(
      '"/native-export-test?fixture=native-export",',
    );
    const exportMaestro = source.indexOf(
      '`--test-output-dir=${path.join(exportDiagnosticDirectory, "maestro")}`',
    );

    expect(screenshotLaunch).toBeGreaterThan(-1);
    expect(screenshotMaestro).toBeGreaterThan(screenshotLaunch);
    expect(exportLaunch).toBeGreaterThan(screenshotMaestro);
    expect(exportMaestro).toBeGreaterThan(exportLaunch);
    expect(source).toContain('registeredSchemes.includes("onlysignature")');
    expect(source).toContain(
      "const coldLaunchPlan = screenshotColdLaunchPlan(udid, route)",
    );
    expect(source).toContain("deepLink: openUrlStep.args.at(-1)");
    expect(source).not.toContain("screenshotDeepLink(route)");
  });

  it("copies verification exports from the native protected cache directory", () => {
    const captureSource = readFileSync(
      "scripts/capture-native-ios-screenshots.mjs",
      "utf8",
    );
    const storageSource = readFileSync(
      "apps/mobile/modules/only-signature-native/ios/OnlySignatureStorageModule.swift",
      "utf8",
    );
    const exportDirectory = storageSource.match(
      /private func exportDirectory\(\) throws -> URL \{([\s\S]*?)\n  \}/,
    )?.[1];
    const nativeCacheFolder = exportDirectory?.match(
      /appendingPathComponent\("([^"]+)", isDirectory: true\)/,
    )?.[1];

    expect(nativeCacheFolder).toBe("OnlySignatureExports");
    expect(captureSource).toContain(`"${nativeCacheFolder}",`);
    expect(captureSource).not.toContain('"only-signature-exports",');
  });

  it("preserves post-open launch diagnostics and uploads them on failure", () => {
    const source = readFileSync(
      "scripts/capture-native-ios-screenshots.mjs",
      "utf8",
    );
    const workflow = readFileSync(
      "apps/mobile/.eas/workflows/native-ios-screenshots.yml",
      "utf8",
    );
    const openUrl = source.indexOf("name,\n      step.command,");
    const screenshot = source.indexOf('"post-open-screenshot"');
    const hierarchy = source.indexOf('"accessibility-hierarchy"');
    const confirmationMatch = source.indexOf(
      "new RegExp(iosOpenConfirmationPattern).test(hierarchy.stdout)",
    );
    const confirmationFlow = source.indexOf('"maestro-open-confirmation"');
    const processState = source.indexOf('"process-state"');
    const frontmost = source.indexOf('"frontmost-application"');
    const launchLog = source.indexOf('"launch-log"');

    expect(openUrl).toBeGreaterThan(-1);
    expect(screenshot).toBeGreaterThan(openUrl);
    expect(hierarchy).toBeGreaterThan(screenshot);
    expect(confirmationMatch).toBeGreaterThan(hierarchy);
    expect(confirmationFlow).toBeGreaterThan(confirmationMatch);
    expect(processState).toBeGreaterThan(confirmationFlow);
    expect(frontmost).toBeGreaterThan(processState);
    expect(launchLog).toBeGreaterThan(frontmost);
    expect(workflow).toContain("if: ${{ always() }}");
    expect(workflow).toContain("artifacts/native-screenshot-diagnostics/**/*");
  });

  it("accepts fully opaque simulator PNGs even when they retain an alpha channel", async () => {
    const directory = await mkdtemp(
      path.join(os.tmpdir(), "only-signature-opacity-"),
    );
    const opaqueRgba = path.join(directory, "opaque-rgba.png");
    const translucentRgba = path.join(directory, "translucent-rgba.png");

    try {
      await sharp(Buffer.from([10, 20, 30, 255]), {
        raw: { width: 1, height: 1, channels: 4 },
      })
        .png()
        .toFile(opaqueRgba);
      await sharp(Buffer.from([10, 20, 30, 254]), {
        raw: { width: 1, height: 1, channels: 4 },
      })
        .png()
        .toFile(translucentRgba);

      expect((await readImageOpacity(opaqueRgba)).fullyOpaque).toBe(true);
      expect((await readImageOpacity(translucentRgba)).fullyOpaque).toBe(false);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it("enforces uniqueness on flattened store images rather than reusable raw app states", () => {
    const verifier = readFileSync("scripts/verify-store-assets.mjs", "utf8");

    expect(verifier).toContain("allFinalHashes.size !== 16");
    expect(verifier).not.toContain(
      "native frames are not all visually distinct",
    );
    expect(verifier).not.toContain("perceptually indistinguishable");
  });
});

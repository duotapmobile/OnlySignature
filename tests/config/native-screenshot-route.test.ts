import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  buildScreenshotMaestroFlow,
  iosOpenConfirmationPattern,
  screenshotAppReadyTestId,
  screenshotColdLaunchPlan,
  screenshotDeepLink,
} from "../../scripts/native-screenshot-flow.mjs";
import { documentComparisonAccessibilityLabel } from "../../apps/mobile/src/domain/documentComparison";
import { privacyFixtureCopy } from "../../packages/content/src/copy/index";

describe("native screenshot deep-link readiness", () => {
  const shot = {
    id: "01-signature-initials",
    route: "/draw?fixture=both",
    assertions: ["Draw Your Signature", "Signature", "Initials"],
  };

  it("preserves the exact Expo Router fixture route", () => {
    expect(screenshotDeepLink(shot.route)).toBe(
      "onlysignature:///draw?fixture=both",
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
          "onlysignature:///draw?fixture=both",
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
    const routeReady = flow.indexOf('visible: "Draw Your Signature"');
    const finalAssertion = flow.indexOf(
      '- assertVisible: "Draw Your Signature"',
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

  it("asserts the document comparison through its combined VoiceOver label", () => {
    const manifest = JSON.parse(
      readFileSync("store-assets/screenshots/manifest.json", "utf8"),
    );
    const comparison = manifest.screenshots.find(
      (candidate: { id: string }) => candidate.id === "02-remove-white-box",
    );

    expect(comparison.assertions).toEqual([
      "Preview on Document",
      documentComparisonAccessibilityLabel,
    ]);
    const flow = buildScreenshotMaestroFlow(comparison);
    expect(flow).toContain(
      `- assertVisible: ${JSON.stringify(documentComparisonAccessibilityLabel)}`,
    );
    expect(flow).not.toContain('- assertVisible: "White Background"');
    expect(flow).not.toContain('- assertVisible: "Professional Export"');
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
    const processState = source.indexOf('"process-state"');
    const frontmost = source.indexOf('"frontmost-application"');
    const launchLog = source.indexOf('"launch-log"');

    expect(openUrl).toBeGreaterThan(-1);
    expect(screenshot).toBeGreaterThan(openUrl);
    expect(hierarchy).toBeGreaterThan(screenshot);
    expect(processState).toBeGreaterThan(hierarchy);
    expect(frontmost).toBeGreaterThan(processState);
    expect(launchLog).toBeGreaterThan(frontmost);
    expect(workflow).toContain("if: ${{ always() }}");
    expect(workflow).toContain("artifacts/native-screenshot-diagnostics/**/*");
  });
});

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  buildScreenshotMaestroFlow,
  screenshotAppReadyTestId,
  screenshotColdLaunchPlan,
  screenshotDeepLink,
} from "../../scripts/native-screenshot-flow.mjs";

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
    const confirmation = flow.indexOf('Open in \\"Only Signature\\"');
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

  it("uses the cold-launch plan before Maestro for screenshots and export", () => {
    const source = readFileSync(
      "scripts/capture-native-ios-screenshots.mjs",
      "utf8",
    );
    const screenshotLaunch = source.indexOf("coldLaunch(shot.route)");
    const screenshotMaestro = source.indexOf(
      'run("maestro", ["--device", udid, "test", flowPath])',
    );
    const exportLaunch = source.indexOf(
      'coldLaunch("/native-export-test?fixture=native-export")',
    );
    const exportMaestro = source.indexOf(
      'run("maestro", ["--device", udid, "test", exportFlowPath])',
    );

    expect(screenshotLaunch).toBeGreaterThan(-1);
    expect(screenshotMaestro).toBeGreaterThan(screenshotLaunch);
    expect(exportLaunch).toBeGreaterThan(screenshotMaestro);
    expect(exportMaestro).toBeGreaterThan(exportLaunch);
    expect(source).toContain('registeredSchemes.includes("onlysignature")');
  });
});

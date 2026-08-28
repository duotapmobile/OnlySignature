import { describe, expect, it } from "vitest";
import {
  buildScreenshotMaestroFlow,
  screenshotAppReadyTestId,
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

  it("waits for fixture hydration before linking and route copy before capture", () => {
    const flow = buildScreenshotMaestroFlow(shot);
    const appReady = flow.indexOf(`id: "${screenshotAppReadyTestId}"`);
    const openLink = flow.indexOf(
      '- openLink: "onlysignature:///draw?fixture=both"',
    );
    const routeReady = flow.indexOf('visible: "Draw Your Signature"');
    const finalAssertion = flow.indexOf(
      '- assertVisible: "Draw Your Signature"',
    );

    expect(appReady).toBeGreaterThan(-1);
    expect(openLink).toBeGreaterThan(appReady);
    expect(routeReady).toBeGreaterThan(openLink);
    expect(finalAssertion).toBeGreaterThan(routeReady);
    expect(flow).not.toContain("waitForAnimationToEnd");
  });
});

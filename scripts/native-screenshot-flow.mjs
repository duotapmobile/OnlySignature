export const screenshotAppReadyTestId = "saved-screen";

export function screenshotDeepLink(route) {
  if (typeof route !== "string" || !route.startsWith("/"))
    throw new Error("Native screenshot routes must start with a slash.");
  if (!route.includes("fixture="))
    throw new Error(
      "Native screenshot routes must select an authorized fixture.",
    );
  return `onlysignature://${route}`;
}

export function buildScreenshotMaestroFlow(shot) {
  if (!Array.isArray(shot.assertions) || shot.assertions.length < 2)
    throw new Error(
      `Screenshot ${shot.id} needs at least two visible-state assertions.`,
    );
  const routeReadyCopy = shot.assertions[0];
  return [
    "appId: com.duotap.onlysignature",
    "---",
    "- launchApp:",
    "    clearState: true",
    "- setOrientation: PORTRAIT",
    "- extendedWaitUntil:",
    "    visible:",
    `      id: ${JSON.stringify(screenshotAppReadyTestId)}`,
    "    timeout: 30000",
    `- openLink: ${JSON.stringify(screenshotDeepLink(shot.route))}`,
    "- extendedWaitUntil:",
    `    visible: ${JSON.stringify(routeReadyCopy)}`,
    "    timeout: 30000",
    ...shot.assertions.map(
      (assertion) => `- assertVisible: ${JSON.stringify(assertion)}`,
    ),
    "",
  ].join("\n");
}

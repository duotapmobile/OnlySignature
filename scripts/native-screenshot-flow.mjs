export const screenshotAppReadyTestId = "app-ready";
export const screenshotAppId = "com.duotap.onlysignature";
export const iosOpenConfirmationPattern =
  'Open in [\u201c"]Only Signature[\u201d"]\\?';

// Manifest copy is literal content; Maestro treats text selectors as regex.
export function literalMaestroText(copy) {
  if (typeof copy !== "string" || !copy.trim())
    throw new Error("A native screenshot assertion must be nonempty text.");
  return copy.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function screenshotDeepLink(route) {
  if (typeof route !== "string" || !route.startsWith("/"))
    throw new Error("Native screenshot routes must start with a slash.");
  if (!route.includes("fixture="))
    throw new Error(
      "Native screenshot routes must select an authorized fixture.",
    );
  return `onlysignature://${route}`;
}

export function screenshotColdLaunchPlan(udid, route) {
  if (typeof udid !== "string" || !udid.trim())
    throw new Error("A simulator UDID is required for cold launch.");
  return [
    {
      command: "xcrun",
      args: ["simctl", "terminate", udid, screenshotAppId],
      allowFailure: true,
    },
    {
      command: "xcrun",
      args: ["simctl", "openurl", udid, screenshotDeepLink(route)],
      allowFailure: false,
    },
  ];
}

const iosOpenConfirmation = [
  "- runFlow:",
  "    when:",
  `      visible: ${JSON.stringify(iosOpenConfirmationPattern)}`,
  "    commands:",
  `      - tapOn: ${JSON.stringify("Open")}`,
];

export function buildScreenshotMaestroFlow(shot) {
  const assertionIds = shot.assertionIds ?? [];
  if (
    !Array.isArray(shot.assertions) ||
    !Array.isArray(assertionIds) ||
    shot.assertions.length < 1 ||
    shot.assertions.length + assertionIds.length < 2
  )
    throw new Error(
      `Screenshot ${shot.id} needs at least two visible-state assertions.`,
    );
  const routeReadyCopy = literalMaestroText(shot.assertions[0]);
  return [
    `appId: ${screenshotAppId}`,
    "---",
    ...iosOpenConfirmation,
    "- extendedWaitUntil:",
    "    visible:",
    `      id: ${JSON.stringify(screenshotAppReadyTestId)}`,
    "    timeout: 30000",
    "- extendedWaitUntil:",
    `    visible: ${JSON.stringify(routeReadyCopy)}`,
    "    timeout: 30000",
    ...shot.assertions.map(
      (assertion) =>
        `- assertVisible: ${JSON.stringify(literalMaestroText(assertion))}`,
    ),
    ...assertionIds.flatMap((id) => [
      "- assertVisible:",
      `    id: ${JSON.stringify(literalMaestroText(id))}`,
    ]),
    "",
  ].join("\n");
}

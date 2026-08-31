import Constants from "expo-constants";
import { isAuthorizedFixture } from "@/domain/screenshotFixtureAuthorization";

export const screenshotFixtureMode = Boolean(
  (
    Constants.expoConfig?.extra as
      | { screenshotFixtureMode?: boolean }
      | undefined
  )?.screenshotFixtureMode,
);

export function isAuthorizedScreenshotFixture(
  fixture: string | undefined,
  expected?: string | readonly string[],
  enabled = screenshotFixtureMode,
): boolean {
  return isAuthorizedFixture(fixture, expected, enabled);
}

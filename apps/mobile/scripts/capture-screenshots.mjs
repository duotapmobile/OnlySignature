import { spawnSync } from "node:child_process";

if (process.platform !== "darwin") {
  console.error(
    "Final iOS screenshot capture requires macOS with Xcode Simulator. Fixture data and capture commands are ready.",
  );
  process.exit(2);
}

const device = process.env.IOS_SCREENSHOT_DEVICE ?? "iPhone 17 Pro Max";
const bundleId = process.env.EXPO_PUBLIC_BUNDLE_IDENTIFIER;
if (!bundleId) throw new Error("EXPO_PUBLIC_BUNDLE_IDENTIFIER is required.");

const boot = spawnSync("xcrun", ["simctl", "boot", device], {
  stdio: "inherit",
});
if (boot.status !== 0)
  console.log("Simulator may already be booted; continuing.");
const launch = spawnSync("xcrun", ["simctl", "launch", "booted", bundleId], {
  stdio: "inherit",
});
if (launch.status !== 0) process.exit(launch.status ?? 1);
console.log(
  "Run e2e/screenshot-flow.yml with Maestro, then capture each named frame with xcrun simctl io booted screenshot <path>.png",
);

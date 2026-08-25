import { execFileSync } from "node:child_process";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";

if (process.platform !== "darwin") {
  process.stderr.write(
    "Final iOS screenshot capture requires macOS with Xcode Simulator. Composition can run on Windows after raw captures are copied into store-assets/screenshots/raw/<device>.\n",
  );
  process.exit(2);
}
const manifest = JSON.parse(
  await readFile("store-assets/screenshots/manifest.json", "utf8"),
);
const device = process.argv[2] ?? "iphone";
const rawDir = path.join("store-assets", "screenshots", "raw", device);
await mkdir(rawDir, { recursive: true });
if (process.env.SKIP_MAESTRO_ASSERTIONS !== "1") {
  process.stdout.write(
    "Running deterministic route and visible-state assertions before raw capture.\n",
  );
  execFileSync("maestro", ["test", "apps/mobile/e2e/screenshot-flow.yml"], {
    stdio: "inherit",
  });
}
for (const shot of manifest.screenshots) {
  const deepLink = `onlysignature://${shot.route.replace(/^\//, "")}`;
  process.stdout.write(`OPEN ${deepLink}\n`);
  execFileSync("xcrun", ["simctl", "openurl", "booted", deepLink], {
    stdio: "inherit",
  });
  await new Promise((resolve) => setTimeout(resolve, 1500));
  execFileSync(
    "xcrun",
    [
      "simctl",
      "io",
      "booted",
      "screenshot",
      path.join(rawDir, `${shot.id}.png`),
    ],
    { stdio: "inherit" },
  );
}

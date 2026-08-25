import { execFile, execFileSync } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";

if (process.platform !== "darwin") {
  process.stderr.write(
    "Final App Preview capture requires macOS with Xcode Simulator and the deterministic fixture build installed.\n",
  );
  process.exit(2);
}

await mkdir("store-assets/app-preview/raw", { recursive: true });
const destination = path.resolve(
  "store-assets/app-preview/raw/app-preview.mov",
);
const recorder = execFile("xcrun", [
  "simctl",
  "io",
  "booted",
  "recordVideo",
  "--codec=h264",
  "--force",
  destination,
]);
const wait = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));
const open = async (route, milliseconds) => {
  execFileSync("xcrun", [
    "simctl",
    "openurl",
    "booted",
    `onlysignature:///${route}`,
  ]);
  await wait(milliseconds);
};

try {
  await wait(1000);
  await open("draw?fixture=both", 4000);
  await open("preview?fixture=comparison", 4000);
  await open("purchase?fixture=both", 4000);
  await open("export?fixture=purchased", 4000);
  await open("success?fixture=purchased", 3000);
} finally {
  recorder.kill("SIGINT");
}

await new Promise((resolve, reject) => {
  recorder.once("exit", (code) =>
    code === 0 || code === 130
      ? resolve()
      : reject(new Error(`recordVideo exited ${code}`)),
  );
  recorder.once("error", reject);
});
process.stdout.write(`WROTE ${destination}\n`);

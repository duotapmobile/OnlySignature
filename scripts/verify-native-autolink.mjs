import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const root = fileURLToPath(new URL("..", import.meta.url));
const cli = resolve(
  root,
  "node_modules/expo-modules-autolinking/bin/expo-modules-autolinking.js",
);

const output = execFileSync(
  process.execPath,
  [cli, "resolve", "--platform", "ios"],
  {
    cwd: resolve(root, "apps/mobile"),
    encoding: "utf8",
  },
);

if (!output.includes("OnlySignatureNative")) {
  throw new Error(
    "OnlySignatureNative is missing from Expo's resolved iOS native dependencies.",
  );
}

console.log(
  "Native autolink check passed: OnlySignatureNative resolves for iOS.",
);

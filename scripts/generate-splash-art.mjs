import { readFile } from "node:fs/promises";
import path from "node:path";
import { renderSplash, splashOutputPath } from "./splash-layout.mjs";

const repoRoot = path.resolve(import.meta.dirname, "..");
const valuesPath = path.join(
  repoRoot,
  "apps",
  "mobile",
  "src",
  "design",
  "layout-studio-values.json",
);
let profiles = { iphone: {}, ipad: {} };
try {
  profiles = JSON.parse(await readFile(valuesPath, "utf8"));
} catch {
  // The generator also works before the editor has created its values file.
}

await renderSplash(profiles);
process.stdout.write(`Created ${path.relative(repoRoot, splashOutputPath)}\n`);

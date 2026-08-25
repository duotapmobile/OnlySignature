import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const roots = ["apps", "packages", "legal", "store-assets/metadata"];
const extensions = new Set([
  ".ts",
  ".tsx",
  ".astro",
  ".md",
  ".txt",
  ".json",
  ".csv",
]);
const forbidden = [
  [/100% private/gi, "Absolute privacy claim"],
  [/never leaves your device/gi, "False destination-wide privacy claim"],
  [
    /lifetime pro|premium forever|unlock the app forever|unlimited forever/gi,
    "Ambiguous lifetime unlock",
  ],
  [
    /jpeg\s*,?\s*transparent|transparent\s+jpe?g|jpe?g\s+(?:supports?|preserves?)\s+transparen|(?:any|all|every)\s+formats?[^\n]{0,24}transparen/gi,
    "JPEG transparency contradiction",
  ],
  [/maybe later/gi, "Disallowed success/paywall copy"],
  [/onlyfans/gi, "Unrelated famous brand reference"],
];
const files = [];
async function walk(root) {
  try {
    for (const entry of await readdir(root, { withFileTypes: true })) {
      const full = path.join(root, entry.name);
      if (
        entry.isDirectory() &&
        ["node_modules", "dist", ".expo", ".astro", "coverage"].includes(
          entry.name,
        )
      )
        continue;
      if (entry.isDirectory()) await walk(full);
      else if (extensions.has(path.extname(entry.name).toLowerCase()))
        files.push(full);
    }
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}
for (const root of roots) await walk(root);
const findings = [];
for (const file of files) {
  const text = await readFile(file, "utf8");
  for (const [pattern, description] of forbidden) {
    pattern.lastIndex = 0;
    if (pattern.test(text)) findings.push(`${file}: ${description}`);
  }
  for (const line of text.split(/\r?\n/)) {
    if (!/restore purchases?/i.test(line)) continue;
    if (
      /\b(?:no|not|without|does not|do not|cannot|can't|isn't|never)\b[^.]{0,80}restore purchases?/i.test(
        line,
      )
    )
      continue;
    if (
      /restore purchases?[^.]{0,80}\b(?:no|not|cannot|can't|does not|do not)\b/i.test(
        line,
      )
    )
      continue;
    findings.push(`${file}: Misleading consumable artwork restore`);
    break;
  }
}
if (findings.length) {
  process.stderr.write(`${findings.join("\n")}\n`);
  process.exit(1);
}
process.stdout.write(
  `Content drift check passed across ${files.length} files.\n`,
);

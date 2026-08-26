import { readFile, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";

const distRoot = resolve(import.meta.dirname, "..", "dist");

async function collectHtml(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await collectHtml(path)));
    else if (
      entry.name.endsWith(".html") ||
      entry.name.endsWith(".xml") ||
      entry.name.endsWith(".txt")
    )
      files.push(path);
  }
  return files;
}

const files = await collectHtml(distRoot);
const output = (
  await Promise.all(files.map((file) => readFile(file, "utf8")))
).join("\n");
const blockers = [
  ["placeholder domain", /onlysignature\.invalid|example\.com/i],
  ["legal operator", /\[LEGAL_OPERATOR_NAME\]/],
  ["support identity", /(?:\[SUPPORT_EMAIL\]|support@onlysignature\.invalid)/i],
  ["public URL", /\[PUBLIC_SITE_URL\]/],
  ["governing law", /\[GOVERNING_LAW_JURISDICTION\]/],
];

const found = blockers
  .filter(([, pattern]) => pattern.test(output))
  .map(([label]) => label);
if (found.length) {
  console.error(`Release check blocked: ${found.join(", ")}.`);
  console.error(
    "Complete only the listed release fields before public deployment.",
  );
  process.exit(1);
}

console.log(
  "Release check passed: no known founder placeholders in public outputs.",
);

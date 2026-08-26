import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const roots = ["apps/mobile", "packages"];
const forbidden = [
  /firebase/i,
  /segment\.io/i,
  /amplitude/i,
  /mixpanel/i,
  /sentry/i,
  /posthog/i,
  /appcenter/i,
  /revenuecat/i,
  /websocket/i,
  /fetch\s*\(/,
  /axios/i,
  /XMLHttpRequest/,
];
const allowedUrl =
  /^https:\/\/(example\.invalid|onlysignature\.app|apps\.apple\.com|support\.apple\.com|reportaproblem\.apple\.com)/i;
const findings = [];
async function walk(root) {
  try {
    for (const entry of await readdir(root, { withFileTypes: true })) {
      const full = path.join(root, entry.name);
      if (
        entry.name === "node_modules" ||
        entry.name === "ios" ||
        entry.name === "android" ||
        entry.name.startsWith("dist-") ||
        entry.name === ".expo"
      )
        continue;
      if (entry.isDirectory()) await walk(full);
      else if (/\.(ts|tsx|js|json)$/.test(entry.name)) {
        const text = await readFile(full, "utf8");
        for (const pattern of forbidden)
          if (pattern.test(text)) findings.push(`${full}: ${pattern}`);
        for (const match of text.matchAll(/https:\/\/[^'"\s)]+/g))
          if (!allowedUrl.test(match[0]))
            findings.push(`${full}: undeclared URL ${match[0]}`);
      }
    }
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}
for (const root of roots) await walk(root);
if (findings.length) {
  process.stderr.write(`${findings.join("\n")}\n`);
  process.exit(1);
}
process.stdout.write(
  "Static production network allowlist check passed. Runtime packet observation remains an Apple-device release gate.\n",
);

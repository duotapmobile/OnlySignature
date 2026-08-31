import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";

const excludedPrefixes = [
  "artifacts/",
  "node_modules/",
  "store-assets/app-review/composition-evidence/",
  "store-assets/screenshots/composition-evidence/",
  "store-assets/screenshots/native/",
];
const excludedExtensions = new Set([
  ".gif",
  ".icns",
  ".ico",
  ".jpeg",
  ".jpg",
  ".pdf",
  ".png",
  ".webp",
  ".zip",
]);
const detectors = [
  {
    category: "private-key material",
    pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  },
  { category: "Stripe live secret", pattern: /sk_live_[A-Za-z0-9]{16,}/ },
  { category: "AWS access key", pattern: /AKIA[0-9A-Z]{16}/ },
  {
    category: "GitHub token",
    pattern: /(?:ghp|github_pat)_[A-Za-z0-9_]{20,}/,
  },
  {
    category: "Expo access token assignment",
    pattern: /EXPO_TOKEN\s*[:=]\s*["']?[A-Za-z0-9_-]{24,}/,
  },
];

const listed = execFileSync(
  "git",
  ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
  { encoding: "utf8" },
)
  .split("\0")
  .filter(Boolean)
  .map((file) => file.replaceAll("\\", "/"))
  .filter(
    (file) =>
      !excludedPrefixes.some((prefix) => file.startsWith(prefix)) &&
      !excludedExtensions.has(path.extname(file).toLowerCase()),
  );

const findings = [];
for (const file of listed) {
  let contents;
  try {
    contents = await readFile(file, "utf8");
  } catch {
    continue;
  }
  if (contents.includes("\0")) continue;
  for (const detector of detectors) {
    if (detector.pattern.test(contents))
      findings.push({ file, category: detector.category });
  }
}

if (findings.length > 0) {
  for (const finding of findings)
    process.stderr.write(`${finding.file}: ${finding.category}\n`);
  process.exit(1);
}

process.stdout.write(
  `Source secret scan passed across ${listed.length} non-generated text files.\n`,
);

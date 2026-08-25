import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

const privacy = await readFile("legal/PRIVACY_POLICY.md", "utf8");
const terms = await readFile("legal/TERMS_OF_USE.md", "utf8");
const digest = (text) => createHash("sha256").update(text).digest("hex");
const output =
  `// Generated from legal/*.md by npm run sync:legal. Do not edit by hand.\n` +
  `export const privacyPolicyMarkdown = ${JSON.stringify(privacy)} as const;\n` +
  `export const termsOfUseMarkdown = ${JSON.stringify(terms)} as const;\n` +
  `export const legalContentHashes = ${JSON.stringify({ privacy: digest(privacy), terms: digest(terms) })} as const;\n`;
await writeFile("packages/content/src/legal.generated.ts", output);
process.stdout.write(
  "Synchronized canonical legal Markdown into @only-signature/content.\n",
);

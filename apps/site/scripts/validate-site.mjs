import { readFile, readdir, stat } from "node:fs/promises";
import { join, resolve } from "node:path";

const appRoot = resolve(import.meta.dirname, "..");
const distRoot = join(appRoot, "dist");
const requiredRoutes = [
  "index.html",
  "privacy/index.html",
  "terms/index.html",
  "support/index.html",
  "faq/index.html",
  "accessibility/index.html",
  "contact/index.html",
  "download/index.html",
  "404.html",
  "robots.txt",
  "sitemap.xml",
];

const failures = [];

for (const route of requiredRoutes) {
  try {
    const info = await stat(join(distRoot, route));
    if (!info.isFile()) failures.push(`${route} is not a file`);
  } catch {
    failures.push(`missing ${route}`);
  }
}

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await collectFiles(path)));
    else files.push(path);
  }
  return files;
}

const files = await collectFiles(distRoot);
const textFiles = files.filter((file) =>
  /\.(?:html|css|js|xml|txt|svg)$/i.test(file),
);
const combined = (
  await Promise.all(textFiles.map((file) => readFile(file, "utf8")))
).join("\n");

const forbidden = [
  [
    "analytics SDK",
    /google-analytics|googletagmanager|segment\.com|amplitude|mixpanel/i,
  ],
  [
    "tracking pixel",
    /facebook\.com\/tr|connect\.facebook\.net|hotjar|fullstory/i,
  ],
  ["external font", /fonts\.(?:googleapis|gstatic)\.com|use\.typekit\.net/i],
  ["cookie script", /document\.cookie|cookiebot|onetrust/i],
  ["placeholder prose", /lorem ipsum/i],
];

for (const [label, pattern] of forbidden) {
  if (pattern.test(combined)) failures.push(`found forbidden ${label}`);
}

for (const phrase of [
  "No subscription",
  "JPEG does not support transparency",
  "Deleting the app may delete reusable sets",
  "does not verify identity",
  "We do not upload your signature",
]) {
  if (!combined.includes(phrase))
    failures.push(`missing required truth: ${phrase}`);
}

const htmlFiles = files.filter((file) => file.endsWith(".html"));
for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  if (!/<title>[^<]+<\/title>/.test(html))
    failures.push(`missing title: ${file}`);
  if (!/<meta name="description" content="[^"]+"/.test(html))
    failures.push(`missing description: ${file}`);
  if (!/<html lang="en-US">/.test(html)) failures.push(`missing lang: ${file}`);

  for (const match of html.matchAll(/<a\b[^>]*\bhref="(\/[^"]*)"/g)) {
    const href = match[1].split(/[?#]/, 1)[0];
    if (!href) continue;
    const relative =
      href === "/"
        ? "index.html"
        : href.endsWith("/")
          ? `${href.slice(1)}index.html`
          : href.slice(1);
    try {
      const target = await stat(join(distRoot, relative));
      if (!target.isFile())
        failures.push(`broken internal link ${href} in ${file}`);
    } catch {
      failures.push(`broken internal link ${href} in ${file}`);
    }
  }
}

const clientScripts = files.filter((file) => file.endsWith(".js"));
if (clientScripts.length)
  failures.push(`unexpected client JavaScript: ${clientScripts.join(", ")}`);

if (failures.length) {
  console.error(`Site validation failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Site validation passed: ${requiredRoutes.length} required outputs, ${htmlFiles.length} HTML files, internal links resolved, zero client JavaScript, no forbidden tracking/font/cookie patterns.`,
);

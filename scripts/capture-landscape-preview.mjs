import { mkdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "..");
const baseUrl =
  process.env.ONLY_SIGNATURE_PREVIEW_URL ?? "http://127.0.0.1:4174";
const playwrightEntry = process.env.ONLY_SIGNATURE_PLAYWRIGHT_ENTRY;
const playwright = playwrightEntry
  ? await import(pathToFileURL(playwrightEntry).href)
  : await import("playwright");
const output = path.join(
  root,
  "artifacts",
  "actual-flow-preview",
  "iphone-landscape",
  "03-signature-capture.png",
);
await mkdir(path.dirname(output), { recursive: true });
const browser = await playwright.chromium.launch({
  headless: true,
  executablePath: process.env.ONLY_SIGNATURE_BROWSER_EXECUTABLE || undefined,
});
try {
  const context = await browser.newContext({
    viewport: { width: 932, height: 430 },
    deviceScaleFactor: 1,
    colorScheme: "dark",
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto(new URL("/draw?fixture=both", baseUrl).href, {
    waitUntil: "networkidle",
  });
  await page.waitForSelector('[data-testid="signature-capture-screen"]');
  const canvas = await page
    .locator('[data-testid="signature-canvas"]')
    .boundingBox();
  const line = await page
    .locator('[data-testid="signature-guide-line"]')
    .boundingBox();
  if (!canvas || canvas.width < 900 || canvas.height < 390)
    throw new Error(
      `Landscape canvas is not full-screen: ${JSON.stringify(canvas)}`,
    );
  if (!line || line.width < 700)
    throw new Error(
      `Landscape guide line is too short: ${JSON.stringify(line)}`,
    );
  await page.screenshot({ path: output, fullPage: false });
  process.stdout.write(`Captured ${output}\n`);
  await context.close();
} finally {
  await browser.close();
}

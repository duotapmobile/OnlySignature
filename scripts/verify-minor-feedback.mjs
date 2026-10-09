import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const output = path.join(root, "artifacts/minor-feedback-2026-10-04");
const base = process.env.ONLY_SIGNATURE_PREVIEW_URL ?? "http://127.0.0.1:4176";
const playwright = process.env.ONLY_SIGNATURE_PLAYWRIGHT_ENTRY
  ? await import(
      pathToFileURL(process.env.ONLY_SIGNATURE_PLAYWRIGHT_ENTRY).href
    )
  : await import("playwright");
const feedbackFiles = ["review-feedback.json", "SCREEN-FEEDBACK.md"].map(
  (name) => path.join(root, "artifacts/actual-flow-preview", name),
);
const fingerprint = async () =>
  Promise.all(
    feedbackFiles.map(async (file) =>
      createHash("sha256")
        .update(await readFile(file))
        .digest("hex"),
    ),
  );
const originalFeedback = await fingerprint();
const report = {
  complete: false,
  capturedAt: new Date().toISOString(),
  bundle: null,
  runtimeErrors: [],
  layouts: [],
  feedbackUnchanged: false,
  scrolledStates: [],
};
const screens = [
  ["01-splash", "/?fixture=opening", "opening-splash-screen"],
  ["06-background-popup", "/purchase?fixture=both", "background-screen"],
  ["08-diy-warning-popup", "/free-export?fixture=both", "diy-warning-screen"],
  [
    "09-white-confirmation-popup",
    "/success?fixture=both&mode=white",
    "white-confirmation-screen",
  ],
  ["11-saved-sets-home", "/saved?fixture=saved-home", "saved-sets-screen"],
];
const allViewports = [
  [375, 667],
  [390, 844],
  [430, 932],
  [768, 1024],
  [1024, 1366],
  [667, 375],
  [844, 390],
  [932, 430],
  [1024, 768],
  [1366, 1024],
];
const shortLandscape = process.argv.includes("--short-landscape");
const viewports = shortLandscape ? [[667, 375]] : allViewports;
const browser = await playwright.chromium.launch({
  headless: true,
  executablePath: process.env.ONLY_SIGNATURE_BROWSER_EXECUTABLE,
});
await mkdir(output, { recursive: true });
try {
  for (const [width, height] of viewports) {
    const folder = `${width}x${height}`;
    await mkdir(path.join(output, folder), { recursive: true });
    for (const [id, route, testId] of screens) {
      const context = await browser.newContext({
        viewport: { width, height },
        reducedMotion: "reduce",
      });
      const page = await context.newPage();
      page.on("pageerror", (error) => report.runtimeErrors.push(error.message));
      try {
        await page.goto(new URL(route, base).href, {
          waitUntil: "networkidle",
        });
        await page.getByTestId(testId).waitFor();
        await page.evaluate(() => document.fonts.ready);
        await page.waitForFunction(() =>
          [...document.images].every(
            (img) => img.complete && img.naturalWidth > 0,
          ),
        );
        const bundle = await page.evaluate(() =>
          [...document.scripts]
            .map((script) => script.src)
            .find((src) => /entry-.*\.js/.test(src))
            ?.split("/")
            .pop(),
        );
        assert(bundle, "Missing implementation bundle");
        if (report.bundle) assert.equal(bundle, report.bundle);
        else report.bundle = bundle;
        if (id === "01-splash") {
          await page
            .getByText("Your signature and initials. Ready to reuse.", {
              exact: true,
            })
            .waitFor();
          assert.equal(
            await page
              .getByText("Your signing set is coming together.", {
                exact: true,
              })
              .count(),
            0,
          );
        }
        if (id === "06-background-popup" || id === "08-diy-warning-popup") {
          const amount = page.getByText("$1.99", { exact: true });
          await amount.waitFor();
          assert(
            Number.parseFloat(
              await amount.evaluate((el) => getComputedStyle(el).fontSize),
            ) >= 21,
          );
          const primary = page.getByRole("button", {
            name: "Purchase Transparent Signature",
            exact: true,
          });
          const fallback = page.getByRole("button", {
            name:
              id === "06-background-popup"
                ? "Continue With White Background"
                : "No Thanks, Download Free White Set",
            exact: true,
          });
          for (const control of [primary, fallback]) {
            await control.scrollIntoViewIfNeeded();
            const box = await control.boundingBox();
            assert(
              box &&
                box.height >= 44 &&
                box.y >= -1 &&
                box.y + box.height <= height + 1,
              `${id} hides a useful action at ${folder}`,
            );
          }
        }
        if (id === "09-white-confirmation-popup") {
          const message = page.getByTestId(
            "layout-slot:white-confirmation.subtitle",
          );
          assert(
            (await message.innerText()).includes("device.\nYou can return"),
          );
        }
        if (id === "11-saved-sets-home") {
          assert.equal(
            await page.getByText("Alex Morgan", { exact: true }).count(),
            2,
          );
          assert.equal(
            await page.getByText("Taylor Brooks", { exact: true }).count(),
            1,
          );
          assert.equal(await page.getByText(/^Created /).count(), 3);
          assert.equal(
            await page
              .locator(
                '[data-testid^="layout-slot:saved.card-"] img, [data-testid^="layout-slot:saved.card-"] svg',
              )
              .count(),
            0,
          );
          await page
            .getByRole("button", { name: "Export", exact: true })
            .scrollIntoViewIfNeeded();
          await page
            .getByRole("button", { name: "Add Initials", exact: true })
            .scrollIntoViewIfNeeded();
        }
        if (
          id === "06-background-popup" ||
          id === "08-diy-warning-popup" ||
          id === "11-saved-sets-home"
        ) {
          await page.evaluate(
            () =>
              new Promise((resolve) =>
                requestAnimationFrame(() => requestAnimationFrame(resolve)),
              ),
          );
          const file = `${folder}/${id}-actions.png`;
          await page.screenshot({ path: path.join(output, file) });
          report.scrolledStates.push({ id, width, height, screenshot: file });
        }
        await page.evaluate(() => {
          window.scrollTo(0, 0);
          document.querySelectorAll("*").forEach((el) => {
            if (el.scrollTop > 0) el.scrollTop = 0;
          });
          return new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve)),
          );
        });
        await page.screenshot({ path: path.join(output, folder, `${id}.png`) });
        report.layouts.push({
          id,
          width,
          height,
          screenshot: `${folder}/${id}.png`,
        });
      } finally {
        await context.close();
      }
    }
  }
  assert.equal(report.runtimeErrors.length, 0, report.runtimeErrors.join("\n"));
  assert.deepEqual(
    await fingerprint(),
    originalFeedback,
    "Founder feedback changed during verification",
  );
  report.feedbackUnchanged = true;
  for (const [id] of screens) {
    const before = await readFile(path.join(output, "before", `${id}.png`));
    const after = await readFile(path.join(output, "375x667", `${id}.png`));
    await sharp({
      create: { width: 766, height: 667, channels: 4, background: "#02040A" },
    })
      .composite([
        { input: before, left: 0, top: 0 },
        { input: after, left: 391, top: 0 },
      ])
      .png()
      .toFile(path.join(output, `${id}-comparison.png`));
  }
  report.complete = true;
} finally {
  await writeFile(
    path.join(
      output,
      shortLandscape ? "short-landscape-report.json" : "report.json",
    ),
    `${JSON.stringify(report, null, 2)}\n`,
  );
  await browser.close();
}
process.stdout.write(
  `Minor feedback: ${report.layouts.length} rendered layouts passed; founder feedback unchanged.\n`,
);

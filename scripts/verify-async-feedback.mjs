import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "..");
const output = path.join(root, "artifacts", "async-ui-feedback");
const base = process.env.ONLY_SIGNATURE_PREVIEW_URL ?? "http://127.0.0.1:4176";
const playwright = process.env.ONLY_SIGNATURE_PLAYWRIGHT_ENTRY
  ? await import(
      pathToFileURL(process.env.ONLY_SIGNATURE_PLAYWRIGHT_ENTRY).href
    )
  : await import("playwright");
const browser = await playwright.chromium.launch({
  headless: true,
  executablePath: process.env.ONLY_SIGNATURE_BROWSER_EXECUTABLE,
});
const report = {
  capturedAt: new Date().toISOString(),
  classification:
    "Actual isolated Expo web renders. Native-only storage/export failures are expected here; not StoreKit, Photos, Share, or iOS evidence.",
  purchaseTiming:
    "The test delays the real browser SHA-256 digest by 1100ms without replacing its result or modifying app behavior.",
  complete: false,
  purchases: {},
  exports: {},
  runtimeErrors: [],
};

async function ready(page, route) {
  page.on("pageerror", (error) => report.runtimeErrors.push(error.message));
  await page.goto(new URL(route, base).href, { waitUntil: "networkidle" });
  await page.getByRole("button").first().waitFor({ state: "visible" });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
}

async function artwork(page) {
  return page.getByTestId("sample-drawing-image").evaluateAll((images) =>
    images.map((image) => ({
      source:
        image.getAttribute("src") ?? getComputedStyle(image).backgroundImage,
      descendants: [...image.querySelectorAll("img")].map((img) => img.src),
    })),
  );
}

async function reachable(control, viewport) {
  await control.scrollIntoViewIfNeeded();
  await control.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
  const bounds = await control.boundingBox();
  assert(bounds, "Control is absent");
  assert(
    bounds.width >= 43.5 && bounds.height >= 43.5,
    "Control target is too small",
  );
  assert(
    bounds.x >= -1 &&
      bounds.x + bounds.width <= viewport.width + 1 &&
      bounds.y >= -1 &&
      bounds.y + bounds.height <= viewport.height + 1,
    "Control cannot be reached within the viewport",
  );
  return bounds;
}

await mkdir(output, { recursive: true });
try {
  for (const viewport of [
    { width: 375, height: 667 },
    { width: 667, height: 375 },
    { width: 768, height: 1024 },
  ]) {
    const id = `${viewport.width}x${viewport.height}`;
    const context = await browser.newContext({
      viewport,
      reducedMotion: "reduce",
    });
    await context.addInitScript(() => {
      const originalDigest = SubtleCrypto.prototype.digest;
      SubtleCrypto.prototype.digest = async function (...args) {
        await new Promise((resolve) => setTimeout(resolve, 1100));
        return Reflect.apply(originalDigest, this, args);
      };
    });
    const page = await context.newPage();
    await ready(page, "/purchase?fixture=both");
    const purchase = page.getByRole("button", {
      name: "Purchase Transparent Signature",
      exact: true,
    });
    const price = page.getByText("$1.99 • One-time purchase", { exact: true });
    await price.waitFor();
    const before = await artwork(page);
    assert.equal(before.length, 2, "Purchase artwork is missing");
    const error = page.getByText(
      "Purchase couldn’t open. Your signing set is safe. Try again or continue with white.",
      { exact: true },
    );
    for (let attempt = 0; attempt < 2; attempt++) {
      await purchase.click();
      const working = page.getByRole("button", {
        name: "Opening Apple Purchase...",
        exact: true,
      });
      await working.waitFor();
      assert(await working.isDisabled(), "Purchase is not disabled while busy");
      assert.equal(await working.getAttribute("aria-busy"), "true");
      assert(await price.isVisible(), "Busy purchase hides price");
      assert(await error.isHidden(), "Retry retained the previous error");
      const choices = page.getByRole("radio");
      assert.equal(await choices.count(), 2);
      for (const choice of await choices.all())
        assert(await choice.isDisabled(), "Background choice remained active");
      const secondary = page.getByRole("button", {
        name: "Continue With White Background",
        exact: true,
      });
      assert(await secondary.isDisabled(), "Secondary action remained active");
      if (attempt === 0) {
        const workingBounds = await reachable(working, viewport);
        const secondaryBounds = await reachable(secondary, viewport);
        const priceBounds = await price.boundingBox();
        assert(
          priceBounds.y >= 0 &&
            priceBounds.y + priceBounds.height <= viewport.height,
          "Price is clipped in the action view",
        );
        const white = choices.nth(1);
        report.purchases[id] = {
          workingBounds,
          secondaryBounds,
          priceBounds,
          choices: await choices.evaluateAll((nodes) =>
            nodes.map((node) => ({
              label: node.getAttribute("aria-label"),
              checked: node.getAttribute("aria-checked"),
              disabled: node.getAttribute("aria-disabled"),
            })),
          ),
        };
        await page.screenshot({
          path: path.join(output, `purchase-busy-${id}.png`),
        });
        // A real pointer event on a disabled choice must not change selection.
        await white.scrollIntoViewIfNeeded();
        const whiteBounds = await white.boundingBox();
        await page.mouse.click(
          whiteBounds.x + whiteBounds.width / 2,
          whiteBounds.y + whiteBounds.height / 2,
        );
        assert.equal(
          await choices.first().getAttribute("aria-checked"),
          "true",
        );
        report.purchases[id].disabledSelection = "passed";
      }
      await error.waitFor({ timeout: 15000 });
      assert(
        await purchase.isEnabled(),
        "Purchase did not recover after failure",
      );
      for (const choice of await choices.all())
        assert(await choice.isEnabled(), "Background choice did not recover");
      assert(await secondary.isEnabled(), "White fallback did not recover");
      assert.deepEqual(
        await artwork(page),
        before,
        "Failed purchase changed artwork",
      );
    }
    await error.scrollIntoViewIfNeeded();
    await reachable(purchase, viewport);
    await page.screenshot({
      path: path.join(output, `purchase-failure-${id}.png`),
    });
    report.purchases[id].failureAndRetry = "passed, unchanged artwork";
    await context.close();

    for (const [mode, route] of [
      ["white", "/white-export?fixture=both"],
      ["transparent", "/export?fixture=purchased"],
    ]) {
      const exportContext = await browser.newContext({
        viewport,
        reducedMotion: "reduce",
      });
      const exportPage = await exportContext.newPage();
      await ready(exportPage, route);
      const download = exportPage.getByRole("button", {
        name: "Download",
        exact: true,
      });
      const originalArtwork = await artwork(exportPage);
      assert.equal(originalArtwork.length, 2, "Export artwork is missing");
      const failure = exportPage.getByText(
        "We could not create the export file. Your saved drawing is unchanged.",
        { exact: true },
      );
      for (let attempt = 0; attempt < 2; attempt++) {
        await download.click();
        await exportPage
          .getByRole("button", { name: "Preparing...", exact: true })
          .waitFor();
        assert(
          await failure.isHidden(),
          "Export retry retained the previous error",
        );
        const busyFormats = exportPage.getByRole("button", {
          name: /^(Signature|Initials) format\./,
        });
        for (const format of await busyFormats.all())
          assert(
            await format.isDisabled(),
            "Export format remained active during preparation",
          );
        await failure.waitFor({ timeout: 15000 });
        assert(await download.isEnabled(), "Export action did not recover");
        const formats = exportPage.getByRole("button", {
          name: /^(Signature|Initials) format\./,
        });
        assert.equal(await formats.count(), 2);
        for (const format of await formats.all())
          assert(await format.isEnabled(), "Export format did not recover");
        assert.deepEqual(
          await artwork(exportPage),
          originalArtwork,
          "Failed export changed artwork",
        );
        assert.equal(
          new URL(exportPage.url()).pathname,
          new URL(route, base).pathname,
        );
        assert.equal(
          await exportPage
            .getByRole("button", { name: "Choose Save Location", exact: true })
            .count(),
          0,
        );
      }
      await failure.scrollIntoViewIfNeeded();
      const downloadBounds = await reachable(download, viewport);
      await exportPage.screenshot({
        path: path.join(output, `${mode}-export-failure-${id}.png`),
      });
      report.exports[`${mode}/${id}`] = {
        downloadBounds,
        failureAndRetry: "passed, unchanged artwork",
      };
      await exportContext.close();
    }
  }
  assert.deepEqual(
    report.runtimeErrors,
    [],
    "Async UI produced runtime errors",
  );
  report.complete = true;
} finally {
  await browser.close();
  await writeFile(
    path.join(output, "report.json"),
    JSON.stringify(report, null, 2) + "\n",
  );
}
process.stdout.write(
  "Async browser UI checks passed: 3 purchase busy/failure/retry layouts and 6 export failure/retry layouts. Native destinations and Apple outcomes remain unverified.\n",
);

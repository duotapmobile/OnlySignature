import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "..");
const output = path.join(root, "artifacts", "payment-ui");
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
    "Actual Expo web payment controls with isolated mock catalog scenarios. Not Apple account, native StoreKit, or transaction evidence.",
  complete: false,
  states: [],
  runtimeErrors: [],
};

async function reachable(control, viewport) {
  await control.scrollIntoViewIfNeeded();
  const bounds = await control.boundingBox();
  assert(
    bounds && bounds.width >= 43.5 && bounds.height >= 43.5,
    "Missing or undersized target",
  );
  assert(
    bounds.x >= -1 &&
      bounds.x + bounds.width <= viewport.width + 1 &&
      bounds.y >= -1 &&
      bounds.y + bounds.height <= viewport.height + 1,
    "Control is clipped",
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
    for (const [route, fallback] of [
      ["purchase", "Continue With White Background"],
      ["clear-background", "No Thanks"],
      ["free-export", "No Thanks, Download Free White Set"],
    ]) {
      for (const scenario of [
        "product-loading",
        "product-unavailable",
        "both",
      ]) {
        const context = await browser.newContext({
          viewport,
          reducedMotion: "reduce",
        });
        const page = await context.newPage();
        page.on("pageerror", (error) =>
          report.runtimeErrors.push(error.message),
        );
        await page.goto(new URL(`/${route}?fixture=${scenario}`, base).href, {
          waitUntil: "domcontentloaded",
        });
        const label =
          scenario === "product-loading"
            ? "Loading Apple Price..."
            : scenario === "product-unavailable"
              ? "Retry Apple Price"
              : "Purchase Transparent Signature";
        const action = page.getByRole("button", { name: label, exact: true });
        await action.waitFor();
        const secondary = page.getByRole("button", {
          name: fallback,
          exact: true,
        });
        assert(
          await secondary.isEnabled(),
          "Free path is blocked by catalog loading",
        );
        const actionBounds = await reachable(action, viewport);
        await reachable(secondary, viewport);
        if (scenario === "product-loading") {
          assert(
            await action.isDisabled(),
            "Price loading exposed a charge action",
          );
          assert.equal(
            await page
              .getByRole("button", {
                name: "Purchase Transparent Signature",
                exact: true,
              })
              .count(),
            0,
          );
        } else {
          assert(await action.isEnabled());
        }
        if (scenario === "product-unavailable") {
          await page
            .getByText("Apple price unavailable", { exact: true })
            .waitFor();
          assert.equal(
            await page
              .getByText("$1.99 • One-time purchase", { exact: true })
              .count(),
            0,
            "Unavailable product guessed a price",
          );
        }
        if (scenario === "both")
          await page
            .getByText("$1.99 • One-time purchase", { exact: true })
            .waitFor();
        const filename = `${route}-${scenario}-${viewport.width}x${viewport.height}.png`;
        await page.screenshot({ path: path.join(output, filename) });
        const result = {
          route,
          scenario,
          viewport,
          actionBounds,
          screenshot: filename,
        };
        if (scenario === "product-unavailable") {
          await action.click();
          const paidAction = page.getByRole("button", {
            name: "Purchase Transparent Signature",
            exact: true,
          });
          await paidAction.waitFor();
          assert(await paidAction.isEnabled());
          await page
            .getByText("$1.99 • One-time purchase", { exact: true })
            .waitFor();
          assert(
            await page
              .getByText("Apple price unavailable", { exact: true })
              .isHidden(),
          );
          assert.equal(
            new URL(page.url()).pathname,
            `/${route}`,
            "Price retry navigated as a purchase",
          );
          result.retryRecovered = true;
          await page.screenshot({
            path: path.join(
              output,
              filename.replace("product-unavailable", "retry-recovered"),
            ),
          });
        }
        report.states.push(result);
        await context.close();
      }
    }
  }
  assert.equal(report.runtimeErrors.length, 0, report.runtimeErrors.join("\n"));
  report.complete = true;
} finally {
  await writeFile(
    path.join(output, "report.json"),
    `${JSON.stringify(report, null, 2)}\n`,
  );
  await browser.close();
}
process.stdout.write(
  `Payment UI: ${report.states.length} route/state/viewport checks passed; loading, unavailable, price retry, and free fallback verified.\n`,
);

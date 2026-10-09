import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "..");
const output = path.join(root, "artifacts", "startup-ui-feedback");
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
const storageMessage =
  "Saved signatures are temporarily unavailable. Unlock this device and reopen Only Signature. No purchase will be finished until storage is available.";
const visualMessage =
  "The opening visuals could not load. Reopen Only Signature to try again. Your saved signing sets are unchanged.";
const report = {
  capturedAt: new Date().toISOString(),
  classification:
    "Actual isolated Expo web renders. Storage recovery is an authorized presentation fixture; delayed/failed artwork is real browser request handling. Not protected native storage, native splash, Dynamic Type, or VoiceOver proof.",
  complete: false,
  bundle: null,
  recovery: [],
  loading: [],
  artworkFailure: [],
  deepLinks: [],
  slowArtwork: null,
  runtimeErrors: [],
};
await mkdir(output, { recursive: true });

async function pageFor(context) {
  const page = await context.newPage();
  page.on("pageerror", (error) => report.runtimeErrors.push(error.message));
  return page;
}

async function paint(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
}

async function blocked(page) {
  assert.equal(
    await page.getByTestId("app-ready").count(),
    0,
    "Startup exposed the ready marker",
  );
  assert.equal(
    await page.getByRole("button").count(),
    0,
    "Unready startup exposed route actions",
  );
  assert.equal(
    await page.locator("canvas").count(),
    0,
    "Unready startup exposed a drawing surface",
  );
}

async function recovery(page, viewport, message) {
  await page.getByTestId("startup-recovery").waitFor({ state: "visible" });
  const alert = page.getByRole("alert");
  await alert.waitFor({ state: "visible" });
  assert.equal(await alert.textContent(), message);
  await alert.scrollIntoViewIfNeeded();
  await paint(page);
  const geometry = await alert.evaluate((el) => {
    const bounds = el.getBoundingClientRect();
    const css = getComputedStyle(el);
    return {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
      fontSize: parseFloat(css.fontSize),
      color: css.color,
      overflow: css.overflow,
      live: el.getAttribute("aria-live"),
    };
  });
  assert(geometry.fontSize >= 17, "Recovery shrank its required copy");
  assert(
    geometry.x >= 0 && geometry.x + geometry.width <= viewport.width,
    "Recovery copy overflows horizontally",
  );
  assert(
    geometry.y >= 0 && geometry.y + geometry.height <= viewport.height,
    "Standard-size recovery copy is not fully reachable",
  );
  assert(
    geometry.scrollWidth <= geometry.clientWidth + 1,
    "Recovery text is clipped",
  );
  assert.equal(geometry.live, "assertive");
  await blocked(page);
  return geometry;
}

try {
  const html = await (await fetch(new URL("/?fixture=landing", base))).text();
  report.bundle =
    html.match(/_expo\/static\/js\/web\/entry-[^"\s]+\.js/)?.[0] ?? null;
  assert(report.bundle, "Preview bundle identity is unavailable");
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
    const page = await pageFor(context);
    await page.goto(new URL("/?fixture=startup-recovery", base).href, {
      waitUntil: "networkidle",
    });
    report.recovery.push({
      id,
      geometry: await recovery(page, viewport, storageMessage),
    });
    await page.screenshot({
      path: path.join(output, `${id}-storage-recovery.png`),
    });
    await page.goto(new URL("/?fixture=startup-loading", base).href, {
      waitUntil: "networkidle",
    });
    await page.getByTestId("startup-loading").waitFor({ state: "visible" });
    await page
      .getByText("Opening your signing space", { exact: true })
      .waitFor();
    await blocked(page);
    await paint(page);
    await page.screenshot({ path: path.join(output, `${id}-loading.png`) });
    report.loading.push({ id, routeActionsBlocked: true });
    await context.close();

    const failedContext = await browser.newContext({
      viewport,
      reducedMotion: "reduce",
    });
    await failedContext.route("**/*", async (route) => {
      if (route.request().resourceType() === "image")
        await route.abort("failed");
      else await route.continue();
    });
    const failedPage = await pageFor(failedContext);
    await failedPage.goto(new URL("/?fixture=landing", base).href, {
      waitUntil: "networkidle",
    });
    report.artworkFailure.push({
      id,
      geometry: await recovery(failedPage, viewport, visualMessage),
    });
    await failedPage
      .getByRole("heading", { name: "Only Signature", exact: true })
      .waitFor();
    await failedPage.screenshot({
      path: path.join(output, `${id}-artwork-failure.png`),
    });
    await failedContext.close();
  }

  const viewport = { width: 375, height: 667 };
  for (const route of ["/draw", "/purchase", "/saved"]) {
    const context = await browser.newContext({
      viewport,
      reducedMotion: "reduce",
    });
    const page = await pageFor(context);
    await page.goto(new URL(`${route}?fixture=startup-recovery`, base).href, {
      waitUntil: "networkidle",
    });
    await recovery(page, viewport, storageMessage);
    report.deepLinks.push({ route, routeActionsBlocked: true });
    await context.close();
  }

  const slowContext = await browser.newContext({
    viewport,
    reducedMotion: "reduce",
  });
  let releaseImages;
  const imagesReleased = new Promise((resolve) => {
    releaseImages = resolve;
  });
  await slowContext.route("**/*", async (route) => {
    if (route.request().resourceType() === "image") await imagesReleased;
    await route.continue();
  });
  const slowPage = await pageFor(slowContext);
  try {
    await slowPage.goto(new URL("/?fixture=landing", base).href, {
      waitUntil: "domcontentloaded",
    });
    await slowPage.getByTestId("startup-loading").waitFor({ state: "visible" });
    await slowPage
      .getByTestId("launch-asset-warmup")
      .waitFor({ state: "attached" });
    await blocked(slowPage);
    assert.equal(
      await slowPage
        .getByTestId("launch-asset-warmup")
        .getAttribute("aria-hidden"),
      "true",
    );
    await slowPage.screenshot({
      path: path.join(output, "375x667-artwork-loading.png"),
    });
    releaseImages();
    await slowPage.getByTestId("app-ready").waitFor({ state: "visible" });
    await slowPage
      .getByRole("button", { name: "Create My FREE Signing Set", exact: true })
      .waitFor({ state: "visible" });
    assert.equal(await slowPage.getByTestId("launch-asset-warmup").count(), 0);
    assert.equal(await slowPage.getByTestId("startup-loading").count(), 0);
    await paint(slowPage);
    await slowPage.screenshot({
      path: path.join(output, "375x667-artwork-ready-home.png"),
    });
    report.slowArtwork = {
      routeActionsBlockedBeforeReadiness: true,
      homeVisibleAfterActualAssetsLoaded: true,
    };
  } finally {
    releaseImages();
    await slowContext.close();
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
  "Startup UI checks passed: three recovery/loading/artwork-failure layouts, three guarded deep links, and actual artwork readiness. Native startup remains a separate gate.\n",
);

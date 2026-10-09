import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const output = path.join(root, "artifacts", "purchase-recovery-ui");
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
const cases = [
  [
    "purchase-pending",
    "Your purchase is pending with Apple. This set will unlock automatically after approval.",
  ],
  [
    "purchase-interrupted",
    "Apple did not report a completed purchase. This frozen set stays saved while Only Signature checks again.",
  ],
  [
    "purchase-finishing",
    "Apple purchase finishing is still being checked. This purchased set remains saved and locked until recovery completes.",
  ],
  [
    "purchase-other-set",
    "A purchase is waiting for secure recovery. Keep this set saved; Only Signature will check again automatically.",
  ],
];
const routes = [
  ["background", "/purchase", "Continue With White Background"],
  ["comparison", "/clear-background", "No Thanks"],
  ["quality", "/free-export", "No Thanks, Download Free White Set"],
];
const report = {
  capturedAt: new Date().toISOString(),
  classification:
    "Actual isolated Expo web recovery presentation fixtures, not native StoreKit processing, transaction durability, VoiceOver, or Dynamic Type proof.",
  complete: false,
  bundle: null,
  screens: [],
  saved: [],
  runtimeErrors: [],
};

async function paint(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
}

async function capture(page, filename) {
  const back = page.getByRole("button", { name: "Go back", exact: true });
  for (let attempt = 0; attempt < 3; attempt++) {
    await paint(page);
    const bounds = await back.boundingBox();
    assert(bounds && bounds.y >= 0, "Back is outside the capture viewport");
    const pixels = await page.screenshot();
    const { data, info } = await sharp(pixels)
      .extract({
        left: Math.round(bounds.x + 10),
        top: Math.round(bounds.y + 10),
        width: 24,
        height: 24,
      })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    let darkSurface = 0;
    let lightIcon = 0;
    for (let i = 0; i < data.length; i += info.channels) {
      if (data[i] < 20 && data[i + 1] < 45 && data[i + 2] < 85) darkSurface++;
      if (data[i] > 200 && data[i + 1] > 200 && data[i + 2] > 200) lightIcon++;
    }
    const navigationPainted = darkSurface >= 250 && lightIcon >= 20;
    if (navigationPainted || attempt === 2) {
      await writeFile(path.join(output, filename), pixels);
      assert(
        navigationPainted,
        `Capture does not paint Back at its reported bounds: ${JSON.stringify({ filename, bounds, darkSurface, lightIcon })}`,
      );
      return { darkSurface, lightIcon, attempt };
    }
    // DOM scroll bounds may settle before the compositor. Re-capture only
    // within this bounded paint window; never accept a cropped navigation row.
    await page.waitForTimeout(80);
  }
}

async function reachable(control, viewport) {
  await control.scrollIntoViewIfNeeded();
  await paint(control.page());
  const bounds = await control.boundingBox();
  assert(
    bounds && bounds.width >= 43.5 && bounds.height >= 43.5,
    "Recovery control has no usable target",
  );
  assert(
    bounds.x >= -1 &&
      bounds.x + bounds.width <= viewport.width + 1 &&
      bounds.y >= -1 &&
      bounds.y + bounds.height <= viewport.height + 1,
    "Recovery control is unreachable",
  );
  return bounds;
}

async function artwork(page) {
  return page.getByTestId("sample-drawing-image").evaluateAll((images) =>
    images.map((image) => ({
      source: getComputedStyle(image).backgroundImage,
      images: [...image.querySelectorAll("img")].map((img) => img.src),
    })),
  );
}

async function readable(message, viewport) {
  await message.scrollIntoViewIfNeeded();
  await paint(message.page());
  const bounds = await message.boundingBox();
  assert(
    bounds &&
      bounds.x >= 0 &&
      bounds.x + bounds.width <= viewport.width + 1 &&
      bounds.y >= 0 &&
      bounds.y + bounds.height <= viewport.height + 1,
    "Recovery text is clipped or unreachable",
  );
  const color = await message.evaluate((node) => {
    const rgb = (value) =>
      value
        .match(/[\d.]+/g)
        .slice(0, 3)
        .map(Number);
    const luminance = (channels) =>
      channels
        .map((channel) => {
          const c = channel / 255;
          return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
        })
        .reduce(
          (total, channel, i) => total + channel * [0.2126, 0.7152, 0.0722][i],
          0,
        );
    const css = getComputedStyle(node);
    const surface = node.closest('[data-testid="purchase-feedback"]');
    const foreground = luminance(rgb(css.color));
    const background = luminance(
      rgb(getComputedStyle(surface).backgroundColor),
    );
    return {
      ratio:
        (Math.max(foreground, background) + 0.05) /
        (Math.min(foreground, background) + 0.05),
      fontSize: parseFloat(css.fontSize),
      scrollWidth: node.scrollWidth,
      clientWidth: node.clientWidth,
      role: surface.getAttribute("role"),
      live: surface.getAttribute("aria-live"),
    };
  });
  assert(
    color.ratio >= 4.5 && color.fontSize >= 14,
    "Recovery copy fails readable contrast/size",
  );
  assert(
    color.scrollWidth <= color.clientWidth + 1,
    "Recovery copy is truncated",
  );
  assert.equal(color.role, "status");
  assert.equal(color.live, "polite");
  return { bounds, ...color };
}

await mkdir(output, { recursive: true });
try {
  const html = await (await fetch(new URL("/?fixture=landing", base))).text();
  report.bundle =
    html.match(/_expo\/static\/js\/web\/entry-[^"\s]+\.js/)?.[0] ?? null;
  assert(report.bundle, "Missing preview bundle identity");
  for (const viewport of [
    { width: 375, height: 667 },
    { width: 667, height: 375 },
    { width: 768, height: 1024 },
  ]) {
    const id = `${viewport.width}x${viewport.height}`;
    for (const [name, route, fallbackName] of routes) {
      for (const [fixture, text] of cases) {
        const context = await browser.newContext({
          viewport,
          reducedMotion: "reduce",
        });
        const page = await context.newPage();
        page.on("pageerror", (error) =>
          report.runtimeErrors.push(error.message),
        );
        try {
          await page.goto(new URL(`${route}?fixture=${fixture}`, base).href, {
            waitUntil: "networkidle",
          });
          const message = page.getByText(text, { exact: true });
          await message.waitFor({ state: "visible" });
          const copy = await readable(message, viewport);
          assert.equal(
            await page.getByRole("alert").count(),
            0,
            "Pending purchase is styled/announced as a failure",
          );
          const statusCapture = await capture(
            page,
            `${name}-${fixture}-${id}-status.png`,
          );
          const primary = page.getByRole("button", {
            name: "Purchase Transparent Signature",
            exact: true,
          });
          assert(
            await primary.isDisabled(),
            "Frozen recovery permits another charge",
          );
          const primaryBounds = await reachable(primary, viewport);
          const before = await artwork(page);
          assert(
            before.length > 0,
            "Recovery fixture has no signature artwork",
          );
          await page.mouse.click(
            primaryBounds.x + primaryBounds.width / 2,
            primaryBounds.y + primaryBounds.height / 2,
          );
          await paint(page);
          assert.equal(
            new URL(page.url()).pathname,
            route,
            "Disabled purchase entered an export route",
          );
          assert.deepEqual(
            await artwork(page),
            before,
            "Disabled purchase changed signature artwork",
          );
          const fallback = page.getByRole("button", {
            name: fallbackName,
            exact: true,
          });
          assert(
            await fallback.isEnabled(),
            "Safe fallback is disabled during passive recovery",
          );
          const fallbackBounds = await reachable(fallback, viewport);
          const actionCapture = await capture(
            page,
            `${name}-${fixture}-${id}-actions.png`,
          );
          const navigationBounds = await page
            .getByRole("button", { name: "Go back", exact: true })
            .boundingBox();
          const scrollState = await page.evaluate(() => ({
            windowScrollY: scrollY,
            rootHeight: document.documentElement.scrollHeight,
            viewportHeight: innerHeight,
          }));
          assert(
            navigationBounds &&
              navigationBounds.y >= -1 &&
              navigationBounds.y + navigationBounds.height <=
                viewport.height + 1,
            `Recovery body scrolling hides navigation: ${JSON.stringify({ navigationBounds, scrollState })}`,
          );
          assert.equal(
            await page.getByText(text, { exact: true }).count(),
            1,
            "Recovery explanation disappeared",
          );
          report.screens.push({
            id,
            route,
            fixture,
            copy,
            primaryBounds,
            fallbackBounds,
            navigationBounds,
            statusCapture,
            actionCapture,
            unchangedArtwork: true,
          });
        } finally {
          await context.close();
        }
      }
    }
    const context = await browser.newContext({
      viewport,
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    page.on("pageerror", (error) => report.runtimeErrors.push(error.message));
    try {
      await page.goto(new URL("/saved?fixture=purchase-finishing", base).href, {
        waitUntil: "networkidle",
      });
      await page
        .getByText("Checking your Apple purchase", { exact: true })
        .waitFor();
      assert.equal(
        await page.getByRole("button", { name: "Export", exact: true }).count(),
        0,
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
      await paint(page);
      await page.screenshot({
        path: path.join(output, `saved-finishing-${id}.png`),
      });
      report.saved.push({ id, exportAndNewChargeAbsent: true });
    } finally {
      await context.close();
    }
    const tiles = [];
    for (const [index, screen] of report.screens
      .filter((screen) => screen.id === id)
      .entries()) {
      tiles.push({
        input: await sharp(
          path.join(
            output,
            `${routes.find((route) => route[1] === screen.route)[0]}-${screen.fixture}-${id}-status.png`,
          ),
        )
          .resize(210, 390, { fit: "contain", background: "#02040A" })
          .png()
          .toBuffer(),
        left: (index % 4) * 222,
        top: Math.floor(index / 4) * 402,
      });
    }
    await sharp({
      create: { width: 876, height: 1194, channels: 4, background: "#02040A" },
    })
      .composite(tiles)
      .png()
      .toFile(path.join(output, `${id}-recovery-contact-sheet.png`));
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
  "Purchase recovery UI passed: 36 route/state layouts and 3 locked Saved Sets layouts. Native purchase processing remains unverified.\n",
);

import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const output = path.join(root, "artifacts", "visual-cohesion");
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
const pages = [
  ["settings", "/settings", "Settings and About"],
  ["privacy", "/privacy", "Privacy Policy"],
  ["terms", "/terms", "Terms of Use"],
  ["support", "/support", "Support"],
  ["faq", "/faq", "Purchase FAQ"],
  ["storage", "/data-storage", "Data and Storage"],
  ["accessibility", "/accessibility", "Accessibility"],
  ["licenses", "/licenses", "Open-Source Licenses"],
  ["included-slot", "/missing-slot?fixture=signature", "Initials included"],
  ["saved-empty", "/saved?fixture=empty", "My Signing Sets"],
];
const report = {
  classification: "Actual Expo web renders, not native iOS evidence",
  pages: {},
  menus: {},
  realInk: {},
  density: {},
  consoleErrors: [],
};
try {
  for (const viewport of [
    { width: 430, height: 932 },
    { width: 1032, height: 1376 },
  ]) {
    const context = await browser.newContext({
      viewport,
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    page.on("pageerror", (error) =>
      report.consoleErrors.push(`density: ${error.message}`),
    );
    await page.goto(new URL("/?fixture=opening", base).href, {
      waitUntil: "networkidle",
    });
    const panel = page.getByTestId("opening-ink-card");
    await panel.waitFor();
    const opening = await panel.boundingBox();
    assert(
      opening && opening.width <= 620,
      "Opening becomes an oversized empty tablet panel",
    );
    if (viewport.width >= 768)
      assert(opening.height <= 860, "Tablet opening height is unbounded");
    await page.goto(new URL("/?fixture=landing", base).href, {
      waitUntil: "networkidle",
    });
    const benefits = [];
    for (const name of [
      "No Account",
      "No Subscription",
      "No Document Upload",
    ]) {
      const label = page.getByText(name, { exact: true });
      await label.waitFor();
      benefits.push(await label.boundingBox());
    }
    for (let index = 1; index < benefits.length; index++) {
      assert(
        benefits[index].y - benefits[index - 1].y <= 90,
        "Home benefit rows are stretched apart",
      );
    }
    await page.goto(new URL("/white-export?fixture=both", base).href, {
      waitUntil: "networkidle",
    });
    const signaturePreview = page
      .getByRole("img", { name: "Signature export preview", exact: true })
      .first();
    await signaturePreview.waitFor();
    const exportPreview = await signaturePreview.boundingBox();
    assert(
      exportPreview && exportPreview.height >= 88,
      "Tall-screen export preview is undersized",
    );
    report.density[`${viewport.width}x${viewport.height}`] = {
      opening,
      benefits,
      exportPreview,
    };
    await context.close();
  }
  for (const viewport of [
    { id: "small-phone", width: 375, height: 667 },
    { id: "ipad", width: 768, height: 1024 },
  ]) {
    const context = await browser.newContext({
      viewport,
      reducedMotion: "reduce",
    });
    // Each route starts from a clean, isolated browser store. A fixture used
    // earlier in this pass must not populate the Saved Sets empty-state case.
    await context.addInitScript(() => localStorage.clear());
    const directory = path.join(output, viewport.id);
    await mkdir(directory, { recursive: true });
    const captures = [];
    for (const [id, route, title] of pages) {
      const page = await context.newPage();
      page.on("pageerror", (error) =>
        report.consoleErrors.push(`${id}: ${error.message}`),
      );
      await page.goto(new URL(route, base).href, { waitUntil: "networkidle" });
      await page
        .getByRole("heading", { name: title, exact: true })
        .first()
        .waitFor();
      await page.evaluate(() => document.fonts.ready);
      const headingBox = await page
        .getByRole("heading", { name: title, exact: true })
        .first()
        .boundingBox();
      assert(
        headingBox.x >= 0 &&
          headingBox.x + headingBox.width <= viewport.width + 1,
        `${id} title is clipped`,
      );
      if (id !== "saved-empty")
        assert(
          await page.getByRole("button", { name: "Go back" }).count(),
          `${id} has no Back control`,
        );
      if (id === "saved-empty")
        await page
          .getByText("No saved signing sets yet", { exact: true })
          .waitFor();
      const file = path.join(directory, `${id}.png`);
      await page.screenshot({ path: file });
      captures.push(file);
      const lastText = await page.locator("[data-testid]").count();
      report.pages[`${viewport.id}/${id}`] = {
        title,
        headingBox,
        identifiedNodes: lastText,
      };
      // Information pages must remain scrollable to their final content.
      const textNodes = page.locator('div[dir="auto"]');
      if (await textNodes.count()) {
        await textNodes.last().scrollIntoViewIfNeeded();
        const bottom = await textNodes.last().boundingBox();
        assert(
          bottom && bottom.y < viewport.height && bottom.y + bottom.height > 0,
          `${id} last content cannot be reached`,
        );
      }
      await page.close();
    }
    const tiles = [];
    const tileWidth = 210,
      tileHeight = 400,
      columns = 5;
    for (const [index, file] of captures.entries()) {
      const tile = await sharp(file)
        .resize(tileWidth, tileHeight, {
          fit: "contain",
          background: "#02040A",
        })
        .png()
        .toBuffer();
      tiles.push({
        input: tile,
        left: (index % columns) * (tileWidth + 12),
        top: Math.floor(index / columns) * (tileHeight + 12),
      });
    }
    await sharp({
      create: {
        width: columns * (tileWidth + 12) - 12,
        height: Math.ceil(captures.length / columns) * (tileHeight + 12) - 12,
        channels: 4,
        background: "#02040A",
      },
    })
      .composite(tiles)
      .png()
      .toFile(path.join(output, `${viewport.id}-secondary-screens.png`));
    await context.close();
  }
  for (const viewport of [
    { width: 375, height: 667 },
    { width: 667, height: 375 },
  ]) {
    const context = await browser.newContext({
      viewport,
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    await page.goto(new URL("/white-export?fixture=both", base).href, {
      waitUntil: "networkidle",
    });
    const signature = page.getByRole("button", {
      name: "Signature format. PNG, White Background",
      exact: true,
    });
    const initials = page.getByRole("button", {
      name: "Initials format. PNG, White Background",
      exact: true,
    });
    const arrows = [];
    for (const control of [signature, initials]) {
      await control.scrollIntoViewIfNeeded();
      arrows.push(
        await control
          .locator("svg")
          .evaluate((node) => node.getBoundingClientRect().right),
      );
    }
    assert(
      Math.abs(arrows[0] - arrows[1]) < 1,
      "Export selector arrows do not align",
    );
    await signature.scrollIntoViewIfNeeded();
    await signature.click();
    await page
      .getByRole("heading", { name: "Choose signature format" })
      .waitFor();
    await page.getByRole("radio", { name: "JPEG, White Background" }).click();
    await page
      .getByRole("button", {
        name: "Signature format. JPEG, White Background",
        exact: true,
      })
      .waitFor();
    await page
      .getByRole("heading", { name: "Choose signature format" })
      .waitFor({ state: "hidden" });
    await initials.scrollIntoViewIfNeeded();
    await initials.click();
    const cancel = page.getByRole("button", { name: "Cancel", exact: true });
    await cancel.scrollIntoViewIfNeeded();
    const cancelBox = await cancel.boundingBox();
    assert(
      cancelBox.y >= 0 && cancelBox.y + cancelBox.height <= viewport.height,
      "Format dialog Cancel is clipped",
    );
    await mkdir(output, { recursive: true });
    // Wait for the actual native-compatible opacity transition to finish;
    // a half-faded modal is not evidence of its material or contrast.
    await page.waitForTimeout(350);
    await page.screenshot({
      path: path.join(
        output,
        `format-dialog-${viewport.width}x${viewport.height}.png`,
      ),
    });
    await cancel.click();
    report.menus[`${viewport.width}x${viewport.height}`] = {
      arrows,
      cancelBox,
      selectionAndCancellation: "passed",
    };
    await context.close();
  }
  const inkContext = await browser.newContext({
    viewport: { width: 375, height: 667 },
    reducedMotion: "reduce",
  });
  const inkPage = await inkContext.newPage();
  await inkPage.goto(new URL("/saved?fixture=empty", base).href, {
    waitUntil: "networkidle",
  });
  await inkPage
    .getByText("No saved signing sets yet", { exact: true })
    .waitFor();
  await inkPage
    .getByRole("button", { name: "Create New Signing Set", exact: true })
    .click();
  await inkPage.getByTestId("signature-capture-screen").waitFor();
  const save = inkPage.getByRole("button", {
    name: "Save Signature",
    exact: true,
  });
  await save.click();
  await inkPage
    .getByText("Write your full name before continuing.", { exact: true })
    .waitFor();
  assert(
    await inkPage.getByTestId("signature-capture-screen").isVisible(),
    "An empty capture advanced the flow",
  );
  const saveBounds = await save.boundingBox();
  assert(
    saveBounds.y + saveBounds.height <= 667,
    "Empty-capture error hides Save",
  );
  assert.equal(
    await inkPage.getByTestId("signature-canvas").locator("svg path").count(),
    0,
  );
  const canvas = await inkPage.getByTestId("signature-canvas").boundingBox();
  await inkPage.mouse.move(
    canvas.x + canvas.width * 0.15,
    canvas.y + canvas.height * 0.69,
  );
  await inkPage.mouse.down();
  for (let step = 1; step <= 40; step++) {
    const fraction = step / 40;
    await inkPage.mouse.move(
      canvas.x + canvas.width * (0.15 + fraction * 0.65),
      canvas.y +
        canvas.height * (0.69 - Math.sin(fraction * Math.PI * 4) * 0.2),
    );
  }
  await inkPage.mouse.up();
  await save.waitFor();
  assert(await save.isEnabled(), "Completed real ink does not enable Save");
  await save.click();
  await inkPage
    .getByRole("heading", { name: "Initials", exact: true })
    .waitFor();
  await inkPage
    .getByRole("button", { name: "Skip for Now", exact: true })
    .click();
  await inkPage
    .getByRole("heading", { name: "Review your signing set", exact: true })
    .waitFor();
  const drawing = inkPage
    .getByRole("img", { name: "Signature preview", exact: true })
    .first();
  await drawing.locator("svg g[transform]").waitFor();
  const groupTransform = await drawing
    .locator("svg g")
    .getAttribute("transform");
  const inkBounds = await drawing.locator("svg path").first().boundingBox();
  const previewBounds = await drawing.boundingBox();
  assert(
    inkBounds.width > 20 && inkBounds.height > 10,
    "Real-ink preview collapsed",
  );
  assert(
    inkBounds.x >= previewBounds.x - 2 &&
      inkBounds.x + inkBounds.width <=
        previewBounds.x + previewBounds.width + 2 &&
      inkBounds.y >= previewBounds.y - 2 &&
      inkBounds.y + inkBounds.height <=
        previewBounds.y + previewBounds.height + 2,
    "Real-ink preview is clipped",
  );
  await inkPage.screenshot({ path: path.join(output, "real-ink-review.png") });
  report.realInk = {
    method:
      "Synthetic browser mouse gesture, not physical iPhone touch-feel evidence",
    groupTransform,
    inkBounds,
    previewBounds,
    captureSaveSkipReview: "passed",
  };
  await inkContext.close();
  assert.deepEqual(
    report.consoleErrors,
    [],
    "Runtime errors found in secondary screens",
  );
} finally {
  await browser.close();
}
await writeFile(
  path.join(output, "browser-visual-report.json"),
  JSON.stringify(report, null, 2) + "\n",
);
process.stdout.write(
  "Cohesion checks passed: 10 secondary screens at 2 sizes, export menu selection/cancellation in portrait and landscape.\n",
);

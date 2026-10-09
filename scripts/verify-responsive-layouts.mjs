import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const baseUrl =
  process.env.ONLY_SIGNATURE_PREVIEW_URL ?? "http://127.0.0.1:4174";
const playwrightEntry = process.env.ONLY_SIGNATURE_PLAYWRIGHT_ENTRY;
const playwright = playwrightEntry
  ? await import(pathToFileURL(playwrightEntry).href)
  : await import("playwright");

const portraitDevices = [
  { name: "iphone-se", width: 375, height: 667 },
  { name: "iphone-standard", width: 390, height: 844 },
  { name: "iphone-large", width: 430, height: 932 },
  { name: "ipad-mini", width: 768, height: 1024 },
  { name: "ipad-pro", width: 1024, height: 1366 },
];

const fixedScreens = [
  {
    name: "home",
    route: "/?fixture=landing",
    testId: "entry-screen",
    actions: ["Create My FREE Signing Set", "View my Signing Sets"],
  },
  {
    name: "signature",
    route: "/draw?fixture=both",
    testId: "signature-capture-screen",
    actions: ["Sign First and Last Separately", "Save Signature"],
  },
  {
    name: "first-name",
    route: "/draw?fixture=both&namePart=first",
    testId: "first-name-capture-screen",
    actions: ["Save First Name"],
  },
  {
    name: "last-name",
    route: "/draw?fixture=both&namePart=last",
    testId: "last-name-capture-screen",
    actions: ["Save Last Name and Join"],
  },
  {
    name: "initials",
    route: "/draw?fixture=initials",
    testId: "initials-capture-screen",
    actions: ["Save Initials", "Skip for Now"],
  },
  {
    name: "review",
    route: "/preview?fixture=both",
    testId: "review-screen",
    actions: ["Confirm and Choose Background"],
  },
  {
    name: "background",
    route: "/purchase?fixture=both",
    testId: "background-screen",
    actions: [
      "Purchase Transparent Signature",
      "Continue With White Background",
    ],
  },
  {
    name: "clear-background",
    route: "/clear-background?fixture=both",
    testId: "clear-background-screen",
    actions: ["Purchase Transparent Signature", "No Thanks"],
  },
  {
    name: "warning",
    route: "/free-export?fixture=both",
    testId: "diy-warning-screen",
    actions: [
      "Purchase Transparent Signature",
      "No Thanks, Download Free White Set",
    ],
  },
  {
    name: "purchase-recovery",
    route: "/purchase?fixture=purchase-error",
    testId: "background-screen",
    actions: [
      "Purchase Transparent Signature",
      "Continue With White Background",
    ],
  },
  {
    name: "white-export",
    route: "/white-export?fixture=both",
    testId: "free-export-screen",
    actions: ["Download"],
  },
  {
    name: "transparent-export",
    route: "/export?fixture=purchased",
    testId: "paid-export-screen",
    actions: ["Download", "Create New"],
  },
  {
    name: "white-confirmation",
    route: "/success?fixture=both&mode=white",
    testId: "white-confirmation-screen",
    actions: ["Done"],
  },
];
const captureScreens = fixedScreens.filter((screen) =>
  ["signature", "first-name", "last-name", "initials"].includes(screen.name),
);
const landscapeDevices = portraitDevices.map((portrait) => ({
  name: `${portrait.name}-landscape`,
  width: portrait.height,
  height: portrait.width,
}));

async function visibleBoxForText(page, text) {
  const locator = page.getByText(text, { exact: true });
  for (let index = 0; index < (await locator.count()); index += 1) {
    const candidate = locator.nth(index);
    if (await candidate.isVisible()) return candidate.boundingBox();
  }
  return null;
}

async function visibleBoxForButton(page, name) {
  const locator = page.getByRole("button", { name });
  for (let index = 0; index < (await locator.count()); index += 1) {
    const candidate = locator.nth(index);
    if (await candidate.isVisible()) return candidate.boundingBox();
  }
  return null;
}

function assertInViewport(box, viewport, label) {
  assert(box, `${label} is not visible`);
  assert(box.x >= -1, `${label} starts left of the viewport: ${box.x}`);
  assert(box.y >= -1, `${label} starts above the viewport: ${box.y}`);
  assert(
    box.x + box.width <= viewport.width + 1,
    `${label} extends beyond the viewport width`,
  );
  assert(
    box.y + box.height <= viewport.height + 1,
    `${label} extends below the viewport: ${JSON.stringify(box)}`,
  );
}

const browser = await playwright.chromium.launch({
  headless: true,
  executablePath: process.env.ONLY_SIGNATURE_BROWSER_EXECUTABLE || undefined,
});
const report = {};
try {
  for (const viewport of portraitDevices) {
    const context = await browser.newContext({
      viewport,
      deviceScaleFactor: 1,
      colorScheme: "dark",
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    const deviceReport = {};
    for (const screen of fixedScreens) {
      await page.goto(new URL(screen.route, baseUrl).href, {
        waitUntil: "networkidle",
        timeout: 60_000,
      });
      await page.waitForSelector(`[data-testid="${screen.testId}"]`, {
        state: "visible",
      });
      await page.evaluate(() => document.fonts?.ready);
      const actions = {};
      for (const action of screen.actions) {
        const box =
          (await visibleBoxForButton(page, action)) ??
          (await visibleBoxForText(page, action));
        assertInViewport(
          box,
          viewport,
          `${viewport.name}/${screen.name}/${action}`,
        );
        assert(
          box.height >= 44,
          `${viewport.name}/${screen.name}/${action} touch target is below 44 points`,
        );
        actions[action] = {
          x: Math.round(box.x),
          y: Math.round(box.y),
          width: Math.round(box.width),
          height: Math.round(box.height),
        };
      }
      deviceReport[screen.name] = actions;
    }
    report[viewport.name] = deviceReport;
    await context.close();
  }

  for (const viewport of landscapeDevices) {
    const context = await browser.newContext({
      viewport,
      deviceScaleFactor: 1,
      colorScheme: "dark",
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    const captures = {};
    for (const screen of captureScreens) {
      await page.goto(new URL(screen.route, baseUrl).href, {
        waitUntil: "networkidle",
        timeout: 60_000,
      });
      await page.getByTestId(screen.testId).waitFor({ state: "visible" });
      const canvas = await page
        .locator('[data-testid="signature-canvas"]')
        .boundingBox();
      const line = await page
        .locator('[data-testid="signature-guide-line"]')
        .boundingBox();
      assert(canvas, `${viewport.name} canvas is missing`);
      assert(line, `${viewport.name} baseline is missing`);
      const toolbar = await page
        .getByTestId("landscape-drawing-toolbar")
        .boundingBox();
      const save = await page
        .getByTestId("landscape-drawing-save")
        .boundingBox();
      assert(toolbar && save, `${viewport.name} drawing controls are missing`);
      assert(
        canvas.width >= viewport.width - 2 &&
          canvas.height >= viewport.height - 158,
        `${viewport.name} canvas lost usable drawing space: ${JSON.stringify(canvas)}`,
      );
      assert(
        canvas.y >= toolbar.y + toolbar.height + 8 &&
          canvas.y + canvas.height <= save.y - 8,
        `${viewport.name}/${screen.name} ink region overlaps drawing controls`,
      );
      for (const artwork of await page
        .getByTestId("sample-drawing-image")
        .all()) {
        const ink = await artwork.boundingBox();
        assert(
          ink &&
            ink.y >= canvas.y - 1 &&
            ink.y + ink.height <= canvas.y + canvas.height + 1,
          `${viewport.name}/${screen.name} artwork escapes its drawing region`,
        );
      }
      assert(
        line.width >= viewport.width * 0.72,
        `${viewport.name} baseline is too short: ${JSON.stringify(line)}`,
      );
      // Split selection belongs to portrait; landscape itself provides room.
      for (const action of [
        "Redo",
        ...screen.actions.filter(
          (action) => action !== "Sign First and Last Separately",
        ),
      ])
        assertInViewport(
          await visibleBoxForText(page, action),
          viewport,
          `${viewport.name}/${action}`,
        );
      assertInViewport(
        await visibleBoxForButton(page, "Go back"),
        viewport,
        `${viewport.name}/Back`,
      );
      captures[screen.name] = {
        canvas: {
          width: Math.round(canvas.width),
          height: Math.round(canvas.height),
        },
        baselineWidth: Math.round(line.width),
      };
    }
    report[viewport.name] = { captures };
    await context.close();
  }
  // Non-drawing pages intentionally scroll in short landscape viewports.
  for (const viewport of landscapeDevices) {
    const context = await browser.newContext({
      viewport,
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    for (const screen of fixedScreens.filter(
      (screen) =>
        !["signature", "first-name", "last-name", "initials"].includes(
          screen.name,
        ),
    )) {
      await page.goto(new URL(screen.route, baseUrl).href, {
        waitUntil: "networkidle",
      });
      for (const action of screen.actions) {
        const button = page
          .getByRole("button", { name: action, exact: true })
          .first();
        await button.scrollIntoViewIfNeeded();
        assertInViewport(
          await button.boundingBox(),
          viewport,
          `${viewport.name}/${screen.name}/${action}`,
        );
      }
      if (screen.name === "home") {
        const benefits = await Promise.all(
          ["No Account", "No Subscription", "No Document Upload"].map((label) =>
            page.getByText(label, { exact: true }).boundingBox(),
          ),
        );
        for (let index = 1; index < benefits.length; index++) {
          assert(
            benefits[index] &&
              benefits[index - 1] &&
              benefits[index].y - benefits[index - 1].y <= 100,
            `${viewport.name}/Home spreads benefit rows through excessive dead space`,
          );
        }
      }
    }
    await context.close();
  }
} finally {
  await browser.close();
}

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
process.stdout.write(
  `Responsive layout verification passed for ${portraitDevices.length} portrait and ${landscapeDevices.length} landscape sizes, including all four capture modes and Home/confirmation actions.\n`,
);

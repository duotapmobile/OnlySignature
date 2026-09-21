import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "..");
const jsonPath = path.join(
  root,
  "apps",
  "mobile",
  "src",
  "design",
  "layout-studio-values.json",
);
const tsPath = path.join(
  root,
  "apps",
  "mobile",
  "src",
  "design",
  "layout-studio-values.ts",
);
const distIndex = path.join(
  root,
  "apps",
  "mobile",
  "dist-layout-studio",
  "index.html",
);
const baseUrl =
  process.env.ONLY_SIGNATURE_PREVIEW_URL ?? "http://127.0.0.1:4176";
const playwrightEntry = process.env.ONLY_SIGNATURE_PLAYWRIGHT_ENTRY;
const playwright = playwrightEntry
  ? await import(pathToFileURL(playwrightEntry).href)
  : await import("playwright");
const { chromium } = playwright;

const screens = [
  {
    name: "entry",
    route: "/?fixture=landing",
    testId: "entry-screen",
    title: "entry.title",
    subtitle: "entry.subtitle",
    button: "entry.create.button",
    label: "entry.create.label",
  },
  {
    name: "signature",
    route: "/draw?fixture=both",
    testId: "signature-capture-screen",
    script: "signature.script",
    title: "signature.title",
    subtitle: "signature.subtitle",
    button: "signature.primary.button",
    label: "signature.primary.label",
    capture: true,
  },
  {
    name: "first-name",
    route: "/draw?fixture=both&namePart=first",
    testId: "first-name-capture-screen",
    script: "signature-first.script",
    title: "signature-first.title",
    subtitle: "signature-first.subtitle",
    button: "signature-first.primary.button",
    label: "signature-first.primary.label",
    capture: true,
  },
  {
    name: "last-name",
    route: "/draw?fixture=both&namePart=last",
    testId: "last-name-capture-screen",
    script: "signature-last.script",
    title: "signature-last.title",
    subtitle: "signature-last.subtitle",
    button: "signature-last.primary.button",
    label: "signature-last.primary.label",
    capture: true,
  },
  {
    name: "initials",
    route: "/draw?fixture=initials",
    testId: "initials-capture-screen",
    script: "initials.script",
    title: "initials.title",
    subtitle: "initials.subtitle",
    button: "initials.primary.button",
    label: "initials.primary.label",
    capture: true,
  },
  {
    name: "review",
    route: "/preview?fixture=both",
    testId: "review-screen",
    script: "review.script",
    title: "review.title",
    subtitle: "review.subtitle",
    button: "review.confirm.button",
    label: "review.confirm.label",
  },
  {
    name: "background",
    route: "/purchase?fixture=both",
    testId: "background-screen",
    script: "background.script",
    title: "background.title",
    button: "background.primary.button",
    label: "background.primary.label",
  },
  {
    name: "clear",
    route: "/clear-background?fixture=both",
    testId: "clear-background-screen",
    title: "clear.title",
    subtitle: "clear.subtitle",
    button: "clear.primary.button",
    label: "clear.primary.label",
  },
  {
    name: "warning",
    route: "/free-export?fixture=both",
    testId: "diy-warning-screen",
    script: "warning.script",
    title: "warning.title",
    button: "warning.primary.button",
    label: "warning.primary.label",
  },
  {
    name: "white-confirmation",
    route: "/success?fixture=both&mode=white",
    testId: "white-confirmation-screen",
    title: "white-confirmation.title",
    subtitle: "white-confirmation.subtitle",
    button: "white-confirmation.primary.button",
    label: "white-confirmation.primary.label",
  },
  {
    name: "transparent-confirmation",
    route: "/success?fixture=purchased&mode=transparent",
    testId: "transparent-confirmation-screen",
    title: "transparent-confirmation.title",
    subtitle: "transparent-confirmation.subtitle",
    button: "transparent-confirmation.primary.button",
    label: "transparent-confirmation.primary.label",
  },
  {
    name: "saved",
    route: "/saved?fixture=saved-home",
    testId: "saved-sets-screen",
    title: "saved.title",
    button: "saved.create.button",
    label: "saved.create.label",
  },
];

const devices = {
  iphone: { width: 430, height: 932 },
  ipad: { width: 1032, height: 1376 },
};

const round = (value) => Math.round(value * 100) / 100;
const roundedRect = (rect) =>
  Object.fromEntries(
    ["x", "y", "width", "height"].map((key) => [key, round(rect[key])]),
  );

function parseTypescriptProfile(source) {
  const marker = "export const layoutStudioValues: LayoutStudioProfiles = ";
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, "TypeScript profile export is missing");
  const expression = source.slice(start + marker.length).replace(/;\s*$/, "");
  return Function(`"use strict"; return (${expression});`)();
}

const [jsonSource, tsSource, jsonInfo, tsInfo, buildInfo] = await Promise.all([
  readFile(jsonPath, "utf8"),
  readFile(tsPath, "utf8"),
  stat(jsonPath),
  stat(tsPath),
  stat(distIndex),
]);
const jsonProfiles = JSON.parse(jsonSource);
assert.deepEqual(
  parseTypescriptProfile(tsSource),
  jsonProfiles,
  "JSON and TypeScript layout profiles differ",
);
for (const device of Object.keys(devices)) {
  for (const id of Object.keys(jsonProfiles[device] ?? {})) {
    assert(
      !id.startsWith("capture."),
      `Obsolete shared profile remains: ${device}.${id}`,
    );
    assert(
      !id.startsWith("confirmation."),
      `Obsolete shared profile remains: ${device}.${id}`,
    );
  }
}
assert(
  buildInfo.mtimeMs >= jsonInfo.mtimeMs,
  "Built app is older than the JSON layout profile",
);
assert(
  buildInfo.mtimeMs >= tsInfo.mtimeMs,
  "Built app is older than the TypeScript layout profile",
);

async function elementRect(page, id) {
  const root = page.locator(`[data-testid="layout-slot:${id}"]`);
  await root.waitFor({ state: "visible", timeout: 30000 });
  return root.evaluate((node) => {
    const rect = node.getBoundingClientRect();
    return {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      right: rect.right,
      bottom: rect.bottom,
    };
  });
}

async function textMetrics(page, id) {
  const root = page.locator(`[data-testid="layout-slot:${id}"]`);
  await root.waitFor({ state: "visible", timeout: 30000 });
  return root.evaluate((node) => {
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    const rects = [];
    let textParent = null;
    while (walker.nextNode()) {
      if (!walker.currentNode.textContent?.trim()) continue;
      const range = document.createRange();
      range.selectNodeContents(walker.currentNode);
      rects.push(range.getBoundingClientRect());
      textParent ??= walker.currentNode.parentElement;
    }
    const left = Math.min(...rects.map((rect) => rect.left));
    const top = Math.min(...rects.map((rect) => rect.top));
    const right = Math.max(...rects.map((rect) => rect.right));
    const bottom = Math.max(...rects.map((rect) => rect.bottom));
    const style = getComputedStyle(textParent);
    return {
      rect: {
        x: left,
        y: top,
        width: right - left,
        height: bottom - top,
        right,
        bottom,
      },
      style: {
        fontFamily: style.fontFamily,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        lineHeight: style.lineHeight,
        letterSpacing: style.letterSpacing,
      },
    };
  });
}

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.ONLY_SIGNATURE_BROWSER_EXECUTABLE || undefined,
});
const report = {};
try {
  for (const [device, viewport] of Object.entries(devices)) {
    const context = await browser.newContext({
      viewport,
      deviceScaleFactor: 1,
      colorScheme: "dark",
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    const deviceReport = {};
    let entry;
    let splitNameReference;
    for (const screen of screens) {
      await page.goto(new URL(screen.route, baseUrl).href, {
        waitUntil: "networkidle",
        timeout: 60000,
      });
      await page.waitForSelector(`[data-testid="${screen.testId}"]`, {
        state: "visible",
      });
      await page.evaluate(() => document.fonts?.ready);
      const ids = await page
        .locator('[data-testid^="layout-slot:"]')
        .evaluateAll((nodes) =>
          nodes.map((node) => node.getAttribute("data-testid")),
        );
      assert.equal(
        new Set(ids).size,
        ids.length,
        `${device}/${screen.name} contains duplicate layer IDs`,
      );
      const measured = {
        button: await elementRect(page, screen.button),
        label: await textMetrics(page, screen.label),
        title: await textMetrics(page, screen.title),
        subtitle: screen.subtitle
          ? await textMetrics(page, screen.subtitle)
          : null,
        script: screen.script ? await textMetrics(page, screen.script) : null,
      };
      if (screen.name === "clear") {
        const whiteBox = await elementRect(page, "clear.bad.white-box");
        const signatureArt = await elementRect(page, "clear.bad.signature-art");
        const stacking = await page.evaluate(() => {
          const whiteBox = document.querySelector(
            '[data-testid="layout-slot:clear.bad.white-box"]',
          );
          const signature = document.querySelector(
            '[data-testid="layout-slot:clear.bad.signature-art"]',
          );
          return {
            whiteBox: Number(getComputedStyle(whiteBox).zIndex),
            signature: Number(getComputedStyle(signature).zIndex),
          };
        });
        assert(
          whiteBox.x < signatureArt.right && whiteBox.right > signatureArt.x,
          `${device}/clear white box must sit behind the signature horizontally`,
        );
        assert(
          whiteBox.y < signatureArt.bottom && whiteBox.bottom > signatureArt.y,
          `${device}/clear white box must sit behind the signature vertically`,
        );
        assert(
          stacking.whiteBox < stacking.signature,
          `${device}/clear signature must remain readable above the white-box layer`,
        );
        measured.dateInterference = {
          whiteBox: roundedRect(whiteBox),
          signature: roundedRect(signatureArt),
          stacking,
        };
      }
      if (screen.name === "entry") entry = measured;
      else {
        assert(
          measured.button.x >= 0 &&
            measured.button.right <= viewport.width &&
            measured.button.height >= 44,
          `${device}/${screen.name} primary button must stay on-screen with a 44px touch target`,
        );
        assert(
          measured.label.rect.y >= measured.button.y &&
            measured.label.rect.bottom <= measured.button.bottom,
          `${device}/${screen.name} button label must stay inside its action`,
        );
        assert.deepEqual(
          measured.label.style,
          entry.label.style,
          `${device}/${screen.name} button-label typography differs from Entry`,
        );
        if (screen.name === "last-name")
          assert.deepEqual(
            measured.script.style,
            splitNameReference.script.style,
            `${device}/last-name script typography differs from First Name Capture`,
          );
        if (screen.name === "last-name") {
          assert.deepEqual(
            {
              x: round(measured.button.x),
              width: round(measured.button.width),
              height: round(measured.button.height),
            },
            {
              x: round(splitNameReference.button.x),
              width: round(splitNameReference.button.width),
              height: round(splitNameReference.button.height),
            },
            `${device}/last-name primary button sizing differs from First Name Capture`,
          );
          assert.equal(
            round(measured.title.rect.y),
            round(splitNameReference.title.rect.y),
            `${device}/last-name title Y differs from First Name Capture`,
          );
          assert.deepEqual(
            measured.subtitle.style,
            splitNameReference.subtitle.style,
            `${device}/last-name subtitle typography differs from First Name Capture`,
          );
          assert.deepEqual(
            roundedRect(measured.script.rect),
            roundedRect(splitNameReference.script.rect),
            `${device}/last-name script-label bounds differ from First Name Capture`,
          );
        }
        if (screen.popup) {
          assert(
            measured.button.y - measured.subtitle.rect.bottom >= 16,
            `${device}/${screen.name} popup copy has less than 16px clearance above the action`,
          );
        }
      }
      deviceReport[screen.name] = {
        button: roundedRect(measured.button),
        label: {
          y: round(measured.label.rect.y),
          height: round(measured.label.rect.height),
          ...measured.label.style,
        },
        title: {
          y: round(measured.title.rect.y),
          height: round(measured.title.rect.height),
          ...measured.title.style,
        },
        ...(measured.script
          ? {
              script: {
                ...roundedRect(measured.script.rect),
                ...measured.script.style,
              },
            }
          : {}),
      };
      if (screen.name === "first-name") splitNameReference = measured;
    }
    report[device] = deviceReport;
    await context.close();
  }

  const funnelContext = await browser.newContext({
    viewport: devices.iphone,
    deviceScaleFactor: 1,
    colorScheme: "dark",
    reducedMotion: "reduce",
  });
  try {
    const funnelPage = await funnelContext.newPage();
    await funnelPage.goto(new URL("/purchase?fixture=both", baseUrl).href, {
      waitUntil: "networkidle",
      timeout: 60000,
    });
    await funnelPage
      .getByRole("button", { name: "Continue With White Background" })
      .click();
    await funnelPage.waitForSelector('[data-testid="clear-background-screen"]');
    assert.equal(
      new URL(funnelPage.url()).pathname,
      "/clear-background",
      "First white-background decline must open Screen 7",
    );
    await funnelPage.getByRole("button", { name: "No Thanks" }).click();
    await funnelPage.waitForSelector('[data-testid="diy-warning-screen"]');
    assert.equal(
      new URL(funnelPage.url()).pathname,
      "/free-export",
      "Second decline must open the DIY warning",
    );
    await funnelPage
      .getByRole("button", {
        name: "No Thanks, Download Free White Set",
      })
      .click();
    await funnelPage.waitForSelector('[data-testid="free-export-screen"]');
    assert.equal(
      new URL(funnelPage.url()).pathname,
      "/white-export",
      "Final decline must reach the free white export",
    );
  } finally {
    await funnelContext.close();
  }
} finally {
  await browser.close();
}

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
process.stdout.write(
  "Decline funnel passed: Background -> Clear -> DIY -> Free white export.\n",
);
process.stdout.write("Flow geometry checklist passed for iPhone and iPad.\n");

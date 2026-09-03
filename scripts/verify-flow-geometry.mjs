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
    script: "entry.sign",
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
    popup: true,
  },
  {
    name: "transparent-confirmation",
    route: "/success?fixture=purchased&mode=transparent",
    testId: "transparent-confirmation-screen",
    title: "transparent-confirmation.title",
    subtitle: "transparent-confirmation.subtitle",
    button: "transparent-confirmation.primary.button",
    label: "transparent-confirmation.primary.label",
    popup: true,
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

async function imageBoxModel(cdp, selector) {
  const { root: documentRoot } = await cdp.send("DOM.getDocument", {
    depth: -1,
    pierce: true,
  });
  const { nodeId } = await cdp.send("DOM.querySelector", {
    nodeId: documentRoot.nodeId,
    selector,
  });
  assert(nodeId, `Image not found: ${selector}`);
  return (await cdp.send("DOM.getBoxModel", { nodeId })).model;
}

async function imageMetrics(page, cdp, id) {
  const selector = `[data-testid="layout-slot:${id}"] img`;
  const image = page.locator(selector);
  await image.waitFor({ state: "visible", timeout: 30000 });
  await image.evaluate(async (node) => {
    if (!node.complete || !node.naturalWidth) await node.decode();
  });
  const model = await imageBoxModel(cdp, selector);
  return image.evaluate((node, modelData) => {
    const quad = modelData.content;
    const p1 = { x: quad[0], y: quad[1] };
    const p2 = { x: quad[2], y: quad[3] };
    const p4 = { x: quad[6], y: quad[7] };
    const boxWidth = modelData.width;
    const boxHeight = modelData.height;
    const naturalRatio = node.naturalWidth / node.naturalHeight;
    const boxRatio = boxWidth / boxHeight;
    const containedWidth =
      naturalRatio > boxRatio ? boxWidth : boxHeight * naturalRatio;
    const containedHeight =
      naturalRatio > boxRatio ? boxWidth / naturalRatio : boxHeight;
    const containX = (boxWidth - containedWidth) / 2;
    const containY = (boxHeight - containedHeight) / 2;
    const sx = containedWidth / node.naturalWidth;
    const sy = containedHeight / node.naturalHeight;
    const canvas = document.createElement("canvas");
    canvas.width = node.naturalWidth;
    canvas.height = node.naturalHeight;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.drawImage(node, 0, 0);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    const points = [];
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    const mapPoint = (x, y) => {
      const u = (containX + x * sx) / boxWidth;
      const v = (containY + y * sy) / boxHeight;
      return {
        x: p1.x + u * (p2.x - p1.x) + v * (p4.x - p1.x),
        y: p1.y + u * (p2.y - p1.y) + v * (p4.y - p1.y),
      };
    };
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        if (pixels[(y * canvas.width + x) * 4 + 3] < 24) continue;
        const point = mapPoint(x + 0.5, y + 0.5);
        minX = Math.min(minX, point.x);
        minY = Math.min(minY, point.y);
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
        if ((x + y) % 5 === 0) points.push(point);
      }
    }
    const meanX =
      points.reduce((sum, point) => sum + point.x, 0) / points.length;
    const meanY =
      points.reduce((sum, point) => sum + point.y, 0) / points.length;
    let xx = 0;
    let yy = 0;
    let xy = 0;
    for (const point of points) {
      xx += (point.x - meanX) ** 2;
      yy += (point.y - meanY) ** 2;
      xy += (point.x - meanX) * (point.y - meanY);
    }
    return {
      src: node.currentSrc.split("/").at(-1),
      visual: {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
        right: maxX,
        bottom: maxY,
      },
      angle: (Math.atan2(2 * xy, xx - yy) * 90) / Math.PI,
    };
  }, model);
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
      const cdp = await context.newCDPSession(page);
      await cdp.send("DOM.enable");
      const measured = {
        button: await elementRect(page, screen.button),
        label: await textMetrics(page, screen.label),
        title: await textMetrics(page, screen.title),
        subtitle: screen.subtitle
          ? await textMetrics(page, screen.subtitle)
          : null,
        script: screen.script
          ? await imageMetrics(page, cdp, screen.script)
          : null,
      };
      if (screen.name === "clear") {
        const whiteBox = await elementRect(page, "clear.bad.white-box");
        const damagedDate = await textMetrics(page, "clear.bad.date-value");
        const stacking = await page.evaluate(() => {
          const whiteBox = document.querySelector(
            '[data-testid="layout-slot:clear.bad.white-box"]',
          );
          const date = document.querySelector(
            '[data-testid="layout-slot:clear.bad.date-value"]',
          );
          return {
            whiteBox: Number(getComputedStyle(whiteBox).zIndex),
            date: Number(getComputedStyle(date).zIndex),
          };
        });
        assert(
          whiteBox.x < damagedDate.rect.right &&
            whiteBox.right > damagedDate.rect.x,
          `${device}/clear white box does not cross the date horizontally`,
        );
        assert(
          whiteBox.bottom > damagedDate.rect.y + 4 &&
            whiteBox.bottom < damagedDate.rect.bottom - 2,
          `${device}/clear white box must visibly cut through, not fully hide, the date`,
        );
        assert(
          stacking.whiteBox > stacking.date,
          `${device}/clear date must sit beneath the white-box layer`,
        );
        measured.dateInterference = {
          whiteBox: roundedRect(whiteBox),
          date: roundedRect(damagedDate.rect),
          stacking,
        };
      }
      if (screen.name === "entry") entry = measured;
      else {
        assert.deepEqual(
          roundedRect(measured.button),
          roundedRect(entry.button),
          `${device}/${screen.name} primary button differs from Entry`,
        );
        assert.equal(
          round(measured.label.rect.y),
          round(entry.label.rect.y),
          `${device}/${screen.name} button-label Y differs from Entry`,
        );
        assert.equal(
          round(measured.label.rect.height),
          round(entry.label.rect.height),
          `${device}/${screen.name} button-label height differs from Entry`,
        );
        assert.deepEqual(
          measured.label.style,
          entry.label.style,
          `${device}/${screen.name} button-label typography differs from Entry`,
        );
        assert.deepEqual(
          measured.title.style,
          entry.title.style,
          `${device}/${screen.name} title typography differs from Entry`,
        );
        if (screen.script)
          assert.equal(
            round(measured.script.angle),
            round(entry.script.angle),
            `${device}/${screen.name} script angle differs from Entry`,
          );
        if (screen.capture) {
          assert.equal(
            round(measured.title.rect.y),
            round(entry.title.rect.y),
            `${screen.name} title Y differs from Entry`,
          );
          assert.equal(
            round(measured.title.rect.height),
            round(entry.title.rect.height),
            `${screen.name} title height differs from Entry`,
          );
          assert.equal(
            round(measured.subtitle.rect.y),
            round(entry.subtitle.rect.y),
            `${screen.name} subtitle Y differs from Entry`,
          );
          assert.deepEqual(
            measured.subtitle.style,
            entry.subtitle.style,
            `${screen.name} subtitle typography differs from Entry`,
          );
        }
        if (screen.name === "signature") {
          assert.equal(
            measured.script.src,
            entry.script.src,
            "Signature screen must use the same script asset as Entry",
          );
          assert.deepEqual(
            roundedRect(measured.script.visual),
            roundedRect(entry.script.visual),
            `${device}/signature visible script bounds differ from Entry`,
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
                ...roundedRect(measured.script.visual),
                angle: round(measured.script.angle),
                src: measured.script.src,
              },
            }
          : {}),
      };
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

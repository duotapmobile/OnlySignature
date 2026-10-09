import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const allSizes = process.argv.includes("--all-sizes");
const output = path.join(
  root,
  "artifacts",
  allSizes ? "visual-layout-matrix" : "visual-protocol-audit",
);
const portraitViewports = [
  { width: 375, height: 667 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1024, height: 1366 },
];
const viewports = allSizes
  ? portraitViewports.flatMap((viewport) => [
      viewport,
      { width: viewport.height, height: viewport.width },
    ])
  : [portraitViewports[0], portraitViewports[3]];
const dialogViewports = allSizes
  ? viewports
  : [portraitViewports[0], { width: 667, height: 375 }];
const base = process.env.ONLY_SIGNATURE_PREVIEW_URL ?? "http://127.0.0.1:4176";
const playwright = process.env.ONLY_SIGNATURE_PLAYWRIGHT_ENTRY
  ? await import(
      pathToFileURL(process.env.ONLY_SIGNATURE_PLAYWRIGHT_ENTRY).href
    )
  : await import("playwright");
const manifest = JSON.parse(
  await readFile(
    path.join(root, "artifacts/actual-flow-preview/manifest.json"),
    "utf8",
  ),
);
const routes = manifest.screenshots
  .filter((screen) => screen.id !== "01-splash")
  .map((screen) => ({ id: screen.id, route: screen.route }));
routes.push(
  ...[
    "settings",
    "privacy",
    "terms",
    "support",
    "faq",
    "data-storage",
    "accessibility",
    "licenses",
  ].map((id) => ({ id, route: `/${id}` })),
  { id: "included-slot", route: "/missing-slot?fixture=signature" },
  { id: "saved-empty", route: "/saved?fixture=empty" },
);

const browser = await playwright.chromium.launch({
  headless: true,
  executablePath: process.env.ONLY_SIGNATURE_BROWSER_EXECUTABLE,
});
const report = {
  capturedAt: new Date().toISOString(),
  classification:
    "Actual Expo web UI audit; not native iOS or WCAG certification",
  complete: false,
  bundle: null,
  viewports,
  expected: {
    screens: routes.length * viewports.length,
    openings: viewports.length,
    dialogs: dialogViewports.length,
  },
  scope:
    "WCAG AA contrast, accessible control names, 44-point controls, browser keyboard focus, responsive dialogs",
  limitations: [
    "This focused DOM scan is not an axe-core scan or a screen-reader test.",
    "CSS colors are resolved through ancestor surfaces; texture and anti-aliasing still require screenshot inspection.",
    "Native Dynamic Type, VoiceOver, hardware-keyboard behavior, and finger drawing require iOS device validation.",
  ],
  screens: [],
  openings: [],
  dialogs: [],
  violations: [],
  runtimeErrors: [],
  contactSheets: [],
};

async function settle(page) {
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
}

// This supplements the initial viewport scan with every ordinary text/control
// in the rendered page. ScrollView/FlatList content is visited without clicking
// actions or changing app state. Tall paragraphs must expose both ends; short
// text and controls must fit fully inside their actual clipping ancestors.
async function checkReachableContent(page) {
  return page.evaluate(async () => {
    const paint = () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      );
    const selector =
      '[dir="auto"], [role="button"], [role="radio"], [role="link"]';
    const nodes = [...document.querySelectorAll(selector)].filter((node) => {
      const style = getComputedStyle(node);
      const bounds = node.getBoundingClientRect();
      return (
        bounds.width > 0 &&
        bounds.height > 0 &&
        style.visibility !== "hidden" &&
        !node.closest('[aria-hidden="true"], [role="img"]') &&
        (node.matches('[role="button"], [role="radio"], [role="link"]') ||
          (node.textContent.trim() && !node.querySelector('[dir="auto"]')))
      );
    });
    const clippingBounds = (node) => {
      const clip = { left: 0, top: 0, right: innerWidth, bottom: innerHeight };
      for (
        let parent = node.parentElement;
        parent;
        parent = parent.parentElement
      ) {
        const style = getComputedStyle(parent);
        const bounds = parent.getBoundingClientRect();
        if (/hidden|clip|auto|scroll/.test(style.overflowX)) {
          clip.left = Math.max(clip.left, bounds.left);
          clip.right = Math.min(clip.right, bounds.right);
        }
        if (/hidden|clip|auto|scroll/.test(style.overflowY)) {
          clip.top = Math.max(clip.top, bounds.top);
          clip.bottom = Math.min(clip.bottom, bounds.bottom);
        }
      }
      return clip;
    };
    const items = [];
    for (const node of nodes) {
      node.scrollIntoView({
        block: "nearest",
        inline: "nearest",
        behavior: "instant",
      });
      await paint();
      let bounds = node.getBoundingClientRect();
      let clip = clippingBounds(node);
      const role = node.getAttribute("role");
      const control = ["button", "radio", "link"].includes(role);
      const horizontal =
        bounds.left >= clip.left - 1 && bounds.right <= clip.right + 1;
      let vertical;
      if (!control && bounds.height > clip.bottom - clip.top + 1) {
        node.scrollIntoView({
          block: "start",
          inline: "nearest",
          behavior: "instant",
        });
        await paint();
        const start = node.getBoundingClientRect();
        const startClip = clippingBounds(node);
        node.scrollIntoView({
          block: "end",
          inline: "nearest",
          behavior: "instant",
        });
        await paint();
        bounds = node.getBoundingClientRect();
        clip = clippingBounds(node);
        vertical =
          start.top >= startClip.top - 1 &&
          start.top < startClip.bottom &&
          bounds.bottom <= clip.bottom + 1 &&
          bounds.bottom > clip.top;
      } else {
        vertical =
          bounds.top >= clip.top - 1 && bounds.bottom <= clip.bottom + 1;
      }
      const intrinsicOverflow =
        !control &&
        (node.scrollWidth > node.clientWidth + 1 ||
          node.scrollHeight > node.clientHeight + 1);
      items.push({
        name: node.getAttribute("aria-label") || node.textContent.trim(),
        kind: control ? "control" : "text",
        reachable: horizontal && vertical && !intrinsicOverflow,
        horizontal,
        vertical,
        intrinsicOverflow,
        width: bounds.width,
        height: bounds.height,
        bounds: bounds.toJSON(),
        clip,
      });
    }
    return {
      items,
      horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 1,
      scrollers: [...document.querySelectorAll("div")]
        .filter(
          (node) =>
            /auto|scroll/.test(getComputedStyle(node).overflowY) &&
            node.scrollHeight > node.clientHeight + 1,
        )
        .map((node) => {
          const bounds = node.getBoundingClientRect();
          const contentBottom = Math.max(
            node.clientHeight,
            ...nodes
              .filter((child) => node.contains(child))
              .map(
                (child) =>
                  child.getBoundingClientRect().bottom -
                  bounds.top +
                  node.scrollTop,
              ),
          );
          return {
            height: node.clientHeight,
            contentHeight: node.scrollHeight,
            trailingSpace: Math.max(0, node.scrollHeight - contentBottom),
          };
        }),
    };
  });
}

async function captureMatrix(page, viewport, route) {
  const directory = path.join(output, `${viewport.width}x${viewport.height}`);
  await mkdir(directory, { recursive: true });
  const filename = path.join(directory, `${route.id}.png`);
  await page.screenshot({ path: filename });
  return filename;
}

async function composeMatrix(viewport, captures, suffix) {
  if (!captures.length) return;
  const landscape = viewport.width > viewport.height;
  const columns = landscape ? 4 : 6;
  const width = landscape ? 336 : 224;
  const height = Math.round((width * viewport.height) / viewport.width);
  const labelHeight = 36;
  const gap = 12;
  const tiles = [];
  for (const [index, capture] of captures.entries()) {
    const left = (index % columns) * (width + gap);
    const top = Math.floor(index / columns) * (height + labelHeight + gap);
    tiles.push({
      input: await sharp(capture.path).resize(width, height).png().toBuffer(),
      left,
      top,
    });
    const label = capture.id.replace(/[&<>]/g, "");
    tiles.push({
      input: Buffer.from(
        `<svg width="${width}" height="${labelHeight}"><rect width="100%" height="100%" fill="#10234D"/><text x="8" y="21" font-family="sans-serif" font-size="12" fill="#FBFAF5">${label}</text></svg>`,
      ),
      left,
      top: top + height,
    });
  }
  const filename = path.join(
    output,
    `${viewport.width}x${viewport.height}-${suffix}.png`,
  );
  await sharp({
    create: {
      width: columns * (width + gap) - gap,
      height:
        Math.ceil(captures.length / columns) * (height + labelHeight + gap) -
        gap,
      channels: 4,
      background: "#02040A",
    },
  })
    .composite(tiles)
    .png()
    .toFile(filename);
  report.contactSheets.push(
    path.relative(root, filename).replaceAll("\\", "/"),
  );
}

// Scan only rendered text and controls. A fictional document is one accessible
// image: its intentionally obscured date is not an interactive text contrast bug.
async function scan(page, includeOffscreen = false) {
  return page.evaluate((includeOffscreen) => {
    const parse = (value) => {
      const values = value.match(/[\d.]+/g)?.map(Number) ?? [];
      return [values[0] ?? 0, values[1] ?? 0, values[2] ?? 0, values[3] ?? 1];
    };
    const blend = (foreground, background) => {
      const alpha = foreground[3] + background[3] * (1 - foreground[3]);
      return [0, 1, 2]
        .map((i) =>
          alpha === 0
            ? 0
            : (foreground[i] * foreground[3] +
                background[i] * background[3] * (1 - foreground[3])) /
              alpha,
        )
        .concat(alpha);
    };
    const luminance = (rgb) =>
      rgb
        .slice(0, 3)
        .map((channel) => {
          const value = channel / 255;
          return value <= 0.04045
            ? value / 12.92
            : ((value + 0.055) / 1.055) ** 2.4;
        })
        .reduce(
          (sum, value, i) => sum + value * [0.2126, 0.7152, 0.0722][i],
          0,
        );
    const visible = (node) => {
      const bounds = node.getBoundingClientRect();
      return (
        bounds.width > 0 &&
        bounds.height > 0 &&
        (includeOffscreen ||
          (bounds.bottom > 0 &&
            bounds.top < innerHeight &&
            bounds.right > 0 &&
            bounds.left < innerWidth)) &&
        !node.closest('[aria-hidden="true"]')
      );
    };
    const text = [...document.querySelectorAll('[dir="auto"]')]
      .filter(
        (node) =>
          visible(node) &&
          node.textContent.trim() &&
          !node.querySelector('[dir="auto"]') &&
          !node.closest('[role="img"]'),
      )
      .map((node) => {
        const style = getComputedStyle(node);
        let background = [0, 0, 0, 0];
        let opacity = 1;
        for (let parent = node; parent; parent = parent.parentElement) {
          const parentStyle = getComputedStyle(parent);
          background = blend(background, parse(parentStyle.backgroundColor));
          opacity *= Number(parentStyle.opacity);
        }
        background = blend(background, [255, 255, 255, 1]);
        const color = parse(style.color);
        color[3] *= opacity;
        const foreground = blend(color, background);
        const a = luminance(foreground),
          b = luminance(background);
        const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
        const size = parseFloat(style.fontSize);
        const large =
          size >= 24 || (size >= 18.667 && Number(style.fontWeight) >= 700);
        return {
          text: node.textContent.trim(),
          ratio: Number(ratio.toFixed(2)),
          required: large ? 3 : 4.5,
          disabled: Boolean(node.closest('[aria-disabled="true"]')),
          color: style.color,
          background: background.slice(0, 3).map(Math.round),
        };
      });
    const controls = [
      ...document.querySelectorAll(
        '[role="button"], [role="radio"], [role="link"]',
      ),
    ]
      .filter(visible)
      .map((node) => {
        const bounds = node.getBoundingClientRect();
        return {
          name: node.getAttribute("aria-label") || node.textContent.trim(),
          role: node.getAttribute("role") || "link",
          width: bounds.width,
          height: bounds.height,
          disabled: node.getAttribute("aria-disabled") === "true",
        };
      });
    const artwork = [
      ...document.querySelectorAll('[data-testid="sample-drawing-frame"]'),
    ]
      .filter(visible)
      .map((frame) => {
        const image = frame.querySelector(
          '[data-testid="sample-drawing-image"]',
        );
        const frameBounds = frame.getBoundingClientRect();
        const imageBounds = image?.getBoundingClientRect();
        return {
          label: frame.getAttribute("aria-label"),
          contained: Boolean(
            imageBounds &&
              imageBounds.width > 0 &&
              imageBounds.height > 0 &&
              imageBounds.left >= frameBounds.left - 1 &&
              imageBounds.right <= frameBounds.right + 1 &&
              imageBounds.top >= frameBounds.top - 1 &&
              imageBounds.bottom <= frameBounds.bottom + 1,
          ),
          frame: frameBounds.toJSON(),
          image: imageBounds?.toJSON(),
        };
      });
    return { text, controls, artwork };
  }, includeOffscreen);
}

async function checkKeyboard(page) {
  await page.mouse.click(1, 1);
  const count = await page
    .locator('[role="button"], [role="radio"], [role="link"]')
    .count();
  const seen = new Map();
  for (let i = 0; i < count + 4; i++) {
    await page.keyboard.press("Tab");
    const active = await page.evaluate(() => {
      const node = document.activeElement;
      if (
        !node ||
        !node.matches('[role="button"], [role="radio"], [role="link"]')
      )
        return null;
      const style = getComputedStyle(node);
      return {
        name: node.getAttribute("aria-label") || node.textContent.trim(),
        indicator:
          parseFloat(style.outlineWidth) > 0 && style.outlineStyle !== "none",
        outline: `${style.outlineWidth} ${style.outlineStyle} ${style.outlineColor}`,
      };
    });
    if (active) seen.set(active.name, active);
  }
  return [...seen.values()];
}

try {
  await mkdir(output, { recursive: true });
  // Immediately replace any old passing report with this incomplete run.
  // An interrupted route scan must never leave yesterday's pass as its result.
  await writeFile(
    path.join(output, "report.json"),
    JSON.stringify(report, null, 2) + "\n",
  );
  const html = await (await fetch(new URL("/?fixture=landing", base))).text();
  report.bundle =
    html.match(/_expo\/static\/js\/web\/entry-[^"\s]+\.js/)?.[0] ?? null;
  assert(report.bundle, "Missing preview bundle identity");
  for (const viewport of viewports) {
    const captures = [];
    const scrollingCaptures = [];
    for (const route of routes) {
      const context = await browser.newContext({
        viewport,
        reducedMotion: "reduce",
      });
      const page = await context.newPage();
      page.on("pageerror", (error) =>
        report.runtimeErrors.push(`${route.id}: ${error.message}`),
      );
      await page.goto(new URL(route.route, base).href, {
        waitUntil: "networkidle",
      });
      // The web router mounts after its hydration snapshot. Network idle alone
      // does not prove the route is rendered; never scan the temporary shell.
      await page.getByRole("button").first().waitFor({ state: "visible" });
      await page.evaluate(() => document.fonts.ready);
      await settle(page);
      const findings = await scan(page, allSizes);
      const id = `${viewport.width}x${viewport.height}/${route.id}`;
      let reachableContent;
      let screenshot;
      let scrolledScreenshot;
      if (allSizes) {
        screenshot = await captureMatrix(page, viewport, route);
        captures.push({ id: route.id, path: screenshot });
        reachableContent = await checkReachableContent(page);
        if (reachableContent.horizontalOverflow)
          report.violations.push({ id, kind: "page-horizontal-overflow" });
        for (const value of reachableContent.items.filter(
          (item) => !item.reachable,
        ))
          report.violations.push({
            ...value,
            id,
            contentKind: value.kind,
            kind: "content-clipped-or-unreachable",
          });
        for (const value of reachableContent.scrollers.filter(
          (item) => item.trailingSpace > 64,
        ))
          report.violations.push({ id, kind: "excess-scroll-tail", ...value });
        if (reachableContent.scrollers.length) {
          await page.evaluate(() => {
            for (const node of document.querySelectorAll("div")) {
              if (/auto|scroll/.test(getComputedStyle(node).overflowY))
                node.scrollTop = node.scrollHeight;
            }
          });
          await settle(page);
          scrolledScreenshot = await captureMatrix(page, viewport, {
            id: `${route.id}-scrolled`,
          });
          scrollingCaptures.push({ id: route.id, path: scrolledScreenshot });
        }
      }
      const keyboard = await checkKeyboard(page);
      report.screens.push({
        id,
        ...findings,
        keyboard,
        reachableContent,
        screenshot,
        scrolledScreenshot,
      });
      if (
        !findings.text.length ||
        !findings.controls.length ||
        !keyboard.length
      )
        report.violations.push({
          id,
          kind: "missing-render-or-keyboard-coverage",
        });
      for (const value of findings.text.filter(
        (item) => !item.disabled && item.ratio < item.required,
      ))
        report.violations.push({ id, kind: "text-contrast", ...value });
      for (const value of findings.controls.filter(
        (item) => !item.name || item.width < 43.5 || item.height < 43.5,
      ))
        report.violations.push({
          id,
          kind: "control-name-or-target",
          ...value,
        });
      for (const value of keyboard.filter((item) => !item.indicator))
        report.violations.push({ id, kind: "keyboard-focus", ...value });
      for (const value of findings.artwork.filter((item) => !item.contained))
        report.violations.push({ id, kind: "sample-artwork-bounds", ...value });
      await context.close();
      if (allSizes && captures.length % 6 === 0)
        process.stdout.write(
          `Matrix ${viewport.width}x${viewport.height}: ${captures.length}/${routes.length} routes.\n`,
        );
    }
    if (allSizes) {
      await composeMatrix(viewport, captures, "screens");
      await composeMatrix(viewport, scrollingCaptures, "scrolling");
    }
    process.stdout.write(
      `Audited ${viewport.width}x${viewport.height}: ${routes.length} routes.\n`,
    );
    const context = await browser.newContext({
      viewport,
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    page.on("pageerror", (error) =>
      report.runtimeErrors.push(`opening: ${error.message}`),
    );
    await page.goto(new URL("/?fixture=opening", base).href, {
      waitUntil: "networkidle",
    });
    const signature = page.getByTestId("opening-signature");
    await signature.waitFor({ state: "visible" });
    await page.waitForFunction(() =>
      [...document.images].every((image) => image.complete),
    );
    const { data, info } = await sharp(await signature.screenshot())
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    let lightInkPixels = 0;
    for (let i = 0; i < data.length; i += info.channels) {
      if (data[i] > 220 && data[i + 1] > 220 && data[i + 2] > 220)
        lightInkPixels++;
    }
    const findings = await scan(page);
    const reachableContent = allSizes
      ? await checkReachableContent(page)
      : undefined;
    for (const value of reachableContent?.items.filter(
      (item) => !item.reachable,
    ) ?? [])
      report.violations.push({
        ...value,
        contentKind: value.kind,
        kind: "opening-content-clipped-or-unreachable",
        viewport,
      });
    report.openings.push({
      viewport,
      lightInkPixels,
      findings,
      reachableContent,
    });
    for (const value of findings.text.filter(
      (item) => !item.disabled && item.ratio < item.required,
    ))
      report.violations.push({
        kind: "opening-text-contrast",
        viewport,
        ...value,
      });
    if (lightInkPixels < 60)
      report.violations.push({
        kind: "opening-light-ink-missing",
        viewport,
        lightInkPixels,
      });
    await page.screenshot({
      path: path.join(
        output,
        `opening-${viewport.width}x${viewport.height}.png`,
      ),
    });
    await context.close();
  }

  for (const viewport of dialogViewports) {
    const context = await browser.newContext({
      viewport,
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    page.on("pageerror", (error) =>
      report.runtimeErrors.push(`format-dialog: ${error.message}`),
    );
    await page.goto(new URL("/white-export?fixture=both", base).href, {
      waitUntil: "networkidle",
    });
    const trigger = page.getByRole("button", {
      name: "Signature format. PNG, White Background",
      exact: true,
    });
    await trigger.scrollIntoViewIfNeeded();
    await trigger.focus();
    await page.keyboard.press("Enter");
    await page
      .getByRole("heading", { name: "Choose signature format", exact: true })
      .waitFor();
    await page.waitForTimeout(350);
    const findings = await scan(page, allSizes);
    const reachableContent = allSizes
      ? await checkReachableContent(page)
      : undefined;
    for (const value of reachableContent?.items.filter(
      (item) => !item.reachable,
    ) ?? [])
      report.violations.push({
        ...value,
        viewport,
        contentKind: value.kind,
        kind: "dialog-content-clipped-or-unreachable",
      });
    const keyboard = await checkKeyboard(page);
    await page.screenshot({
      path: path.join(
        output,
        `format-dialog-${viewport.width}x${viewport.height}.png`,
      ),
    });
    await page.keyboard.press("Escape");
    const dismissed = await page
      .getByRole("heading", { name: "Choose signature format", exact: true })
      .waitFor({ state: "hidden", timeout: 2000 })
      .then(
        () => true,
        () => false,
      );
    report.dialogs.push({
      viewport,
      findings,
      keyboard,
      dismissed,
      reachableContent,
    });
    if (!keyboard.length)
      report.violations.push({
        kind: "missing-dialog-keyboard-coverage",
        viewport,
      });
    if (!dismissed)
      report.violations.push({ kind: "dialog-dismissal", viewport });
    for (const value of findings.text.filter(
      (item) => !item.disabled && item.ratio < item.required,
    ))
      report.violations.push({
        kind: "dialog-text-contrast",
        viewport,
        ...value,
      });
    for (const value of findings.controls.filter(
      (item) => !item.name || item.width < 43.5 || item.height < 43.5,
    ))
      report.violations.push({
        kind: "dialog-control-name-or-target",
        viewport,
        ...value,
      });
    for (const value of keyboard.filter((item) => !item.indicator))
      report.violations.push({
        kind: "dialog-keyboard-focus",
        viewport,
        ...value,
      });
    await context.close();
  }
  assert.equal(report.screens.length, report.expected.screens);
  assert.equal(report.openings.length, report.expected.openings);
  assert.equal(report.dialogs.length, report.expected.dialogs);
  const finalHtml = await (
    await fetch(new URL("/?fixture=landing", base))
  ).text();
  assert.equal(
    finalHtml.match(/_expo\/static\/js\/web\/entry-[^"\s]+\.js/)?.[0],
    report.bundle,
    "Preview bundle changed during the audit; repeat against one stable bundle",
  );
  report.complete =
    report.runtimeErrors.length === 0 && report.violations.length === 0;
} finally {
  await browser.close();
  await writeFile(
    path.join(output, "report.json"),
    JSON.stringify(report, null, 2) + "\n",
  );
}
process.stdout.write(
  `Visual protocol audit: ${report.screens.length} screen layouts, ${report.dialogs.length} dialog layouts, ${report.openings.length} opening captures, ${report.violations.length} findings.\n`,
);
if (report.violations.length)
  process.stdout.write(JSON.stringify(report.violations, null, 2) + "\n");
assert.deepEqual(report.runtimeErrors, [], "Runtime errors during UI audit");
if (!process.argv.includes("--record-only"))
  assert.deepEqual(
    report.violations,
    [],
    "Resolve local UI audit findings before release",
  );

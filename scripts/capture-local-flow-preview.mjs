import assert from "node:assert/strict";
import { copyFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const outputRoot = path.join(root, "artifacts", "actual-flow-preview");
const baseUrl =
  process.env.ONLY_SIGNATURE_PREVIEW_URL ?? "http://127.0.0.1:4174";
const playwrightEntry = process.env.ONLY_SIGNATURE_PLAYWRIGHT_ENTRY;
const playwright = playwrightEntry
  ? await import(pathToFileURL(playwrightEntry).href)
  : await import("playwright");
const { chromium } = playwright;

async function capturePaintedPage(page, outputPath) {
  const back = page.getByRole("button", { name: "Go back", exact: true });
  const hasBack = (await back.count()) > 0;
  if (hasBack) await back.waitFor({ state: "visible" });
  await page.waitForFunction(() =>
    [...document.images].every(
      (image) => image.complete && image.naturalWidth > 0,
    ),
  );
  for (let attempt = 0; attempt < 3; attempt++) {
    await page.evaluate(
      () =>
        new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        ),
    );
    const pixels = await page.screenshot({ fullPage: false });
    if (!hasBack) {
      await writeFile(outputPath, pixels);
      return;
    }
    const bounds = await back.boundingBox();
    assert(bounds && bounds.y >= 0, "Back is outside the capture viewport");
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
    if (darkSurface >= 250 && lightIcon >= 20) {
      await writeFile(outputPath, pixels);
      return;
    }
    assert(
      attempt < 2,
      `Back did not paint in ${outputPath}: ${JSON.stringify({ bounds, darkSurface, lightIcon })}`,
    );
  }
}

const screenshots = [
  {
    id: "01-splash",
    headline: "Animated opening",
    route: "/?fixture=opening",
    testId: "opening-splash-screen",
    assertions: ["Without the sign-up.", "Private by design."],
  },
  {
    id: "02-entry",
    headline: "Entry",
    route: "/?fixture=landing",
    testId: "entry-screen",
    assertions: ["Without the sign-up.", "Create My FREE Signing Set"],
  },
  {
    id: "03-signature-capture",
    headline: "Full Name Capture",
    route: "/draw?fixture=both",
    testId: "signature-capture-screen",
    assertions: ["Sign", "Save Signature", "Sign First and Last Separately"],
  },
  {
    id: "03a-first-name-capture",
    headline: "Optional First Name Capture",
    route: "/draw?fixture=both&namePart=first",
    testId: "first-name-capture-screen",
    assertions: ["Write your first name", "Save First Name"],
  },
  {
    id: "03b-last-name-capture",
    headline: "Last Name Capture",
    route: "/draw?fixture=both&namePart=last",
    testId: "last-name-capture-screen",
    assertions: ["Write your last name", "Save Last Name and Join"],
  },
  {
    id: "04-initials-capture",
    headline: "Initials Capture",
    route: "/draw?fixture=initials",
    testId: "initials-capture-screen",
    assertions: ["Write your initials", "Save Initials", "Skip for Now"],
  },
  {
    id: "05-review-popup",
    headline: "Review popup",
    route: "/preview?fixture=both",
    testId: "review-screen",
    assertions: ["Review your signing set", "Confirm and Choose Background"],
  },
  {
    id: "06-background-popup",
    headline: "Background popup",
    route: "/purchase?fixture=both",
    testId: "background-screen",
    assertions: [
      "Choose a background",
      "Transparent Background",
      "White Background",
    ],
  },
  {
    id: "06a-purchase-error",
    headline: "Purchase recovery message",
    route: "/purchase?fixture=purchase-error",
    testId: "background-screen",
    assertions: [
      "Transparent Background is temporarily unavailable.",
      "Your signing set is safe.",
      "Continue With White Background",
    ],
  },
  {
    id: "07-clear-background",
    headline: "Clear Background",
    route: "/clear-background?fixture=both",
    testId: "clear-background-screen",
    assertions: [
      "See the difference",
      "A transparent signature sits naturally on any document.",
      "White box",
      "No Thanks",
    ],
  },
  {
    id: "08-diy-warning-popup",
    headline: "DIY warning popup",
    route: "/free-export?fixture=both",
    testId: "diy-warning-screen",
    assertions: [
      "Download a Quality Signature",
      "Removing the background later can damage your signature.",
      "No Thanks, Download Free White Set",
    ],
  },
  {
    id: "08a-white-export",
    headline: "White Background Export",
    route: "/white-export?fixture=both",
    testId: "free-export-screen",
    assertions: [
      "White Background Export",
      "Choose your export format.",
      "Download",
    ],
  },
  {
    id: "08b-transparent-export",
    headline: "Transparent Export",
    route: "/export?fixture=purchased",
    testId: "paid-export-screen",
    assertions: [
      "Export Transparent Set",
      "Choose your export format.",
      "Download",
    ],
  },
  {
    id: "09-white-confirmation-popup",
    headline: "White confirmation popup",
    route: "/success?fixture=both&mode=white",
    testId: "white-confirmation-screen",
    assertions: ["White Background Set Saved", "Done"],
  },
  {
    id: "11-saved-sets-home",
    headline: "Saved Sets home",
    route: "/saved?fixture=saved-home",
    testId: "saved-sets-screen",
    assertions: [
      "My Signing Sets",
      "Transparent Unlocked",
      "Initials not added",
      "Add Initials",
    ],
  },
];

const devices = {
  "iphone-small": { width: 375, height: 667 },
  iphone: { width: 430, height: 932 },
  ipad: { width: 1032, height: 1376 },
};

await mkdir(outputRoot, { recursive: true });
for (const device of Object.keys(devices)) {
  const directory = path.join(outputRoot, device);
  // Replace only named generated captures. Never clear the directory before
  // the browser is ready or discard other files during a failed capture run.
  await mkdir(directory, { recursive: true });
}

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.ONLY_SIGNATURE_BROWSER_EXECUTABLE || undefined,
});
let bundle = null;
const runtimeErrors = [];
try {
  for (const [device, size] of Object.entries(devices)) {
    const context = await browser.newContext({
      viewport: size,
      deviceScaleFactor: 1,
      colorScheme: "dark",
      reducedMotion: "reduce",
    });
    for (const shot of screenshots) {
      const page = await context.newPage();
      page.on("pageerror", (error) =>
        runtimeErrors.push(`${device}/${shot.id}: ${error.message}`),
      );
      const outputPath = path.join(outputRoot, device, `${shot.id}.png`);
      await page.goto(new URL(shot.route, baseUrl).href, {
        waitUntil: "networkidle",
      });
      await page.waitForSelector(`[data-testid="${shot.testId}"]`, {
        state: "visible",
      });
      await page.evaluate(() => document.fonts?.ready);
      const currentBundle = await page.evaluate(() =>
        [...document.scripts]
          .map((script) => script.src)
          .find((src) => /entry-[a-f0-9]+\.js/.test(src)),
      );
      assert(currentBundle, "Capture has no identifiable Expo web bundle");
      if (bundle)
        assert.equal(currentBundle, bundle, "Bundle changed during capture");
      else bundle = currentBundle;
      for (const assertion of shot.assertions) {
        await page.waitForFunction(
          (expected) => document.body.innerText.includes(expected),
          assertion,
        );
      }
      await capturePaintedPage(page, outputPath);
      await page.close();
    }
    await context.close();
  }
} finally {
  await browser.close();
}
assert.deepEqual(runtimeErrors, [], "Runtime errors during main-flow capture");

const xml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

async function phoneFrame(inputPath) {
  const width = 180;
  const height = 390;
  const screenX = 8;
  const screenY = 12;
  const screenWidth = 164;
  const appY = 29;
  const appHeight = 340;
  const roundedShot = await sharp(inputPath)
    .resize(screenWidth, appHeight, { fit: "contain", background: "#02040A" })
    .composite([
      {
        input: Buffer.from(
          `<svg width="${screenWidth}" height="${appHeight}"><rect width="${screenWidth}" height="${appHeight}" rx="15" fill="white"/></svg>`,
        ),
        blend: "dest-in",
      },
    ])
    .png()
    .toBuffer();
  const frame =
    Buffer.from(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect x="1.5" y="1.5" width="${width - 3}" height="${height - 3}" rx="25" fill="#02070B" stroke="#7C6A57" stroke-width="3"/>
    <rect x="${screenX}" y="${screenY}" width="${screenWidth}" height="${height - 24}" rx="18" fill="#02040A"/>
    <text x="19" y="23" font-family="Arial, sans-serif" font-size="8" font-weight="700" fill="#F7FBFD">9:41</text>
    <rect x="135" y="16" width="12" height="6" rx="3" fill="#F7FBFD" opacity=".9"/>
    <circle cx="153" cy="19" r="3" fill="#F7FBFD" opacity=".9"/>
    <rect x="64" y="378" width="52" height="4" rx="2" fill="#F7FBFD" opacity=".9"/>
  </svg>`);
  return sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: frame, left: 0, top: 0 },
      { input: roundedShot, left: screenX, top: appY },
      {
        input: Buffer.from(
          `<svg width="${width}" height="${height}"><rect x="1.5" y="1.5" width="${width - 3}" height="${height - 3}" rx="25" fill="none" stroke="#7C6A57" stroke-width="3"/><rect x="64" y="378" width="52" height="4" rx="2" fill="#F7FBFD" opacity=".92"/></svg>`,
        ),
        left: 0,
        top: 0,
      },
    ])
    .png()
    .toBuffer();
}

const phoneWidth = 180;
const phoneHeight = 390;
const gapX = 22;
const marginX = 34;
const labelHeight = 42;
const rowGap = 48;
const marginY = 20;
const boardWidth = marginX * 2 + phoneWidth * 5 + gapX * 4;
const rowCount = Math.ceil(screenshots.length / 5);
const boardHeight =
  marginY * 2 +
  (labelHeight + phoneHeight) * rowCount +
  rowGap * (rowCount - 1);
const composites = [];
for (const [index, shot] of screenshots.entries()) {
  const column = index % 5;
  const row = Math.floor(index / 5);
  const x = marginX + column * (phoneWidth + gapX);
  const y = marginY + row * (labelHeight + phoneHeight + rowGap);
  const label =
    Buffer.from(`<svg width="${phoneWidth}" height="${labelHeight}" xmlns="http://www.w3.org/2000/svg">
    <text x="${phoneWidth / 2}" y="14" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="800" fill="#D8B66A">${xml(String(index + 1).padStart(2, "0"))}</text>
    <text x="${phoneWidth / 2}" y="33" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#F7FBFD">${xml(shot.headline)}</text>
  </svg>`);
  composites.push({ input: label, left: x, top: y });
  composites.push({
    input: await phoneFrame(path.join(outputRoot, "iphone", `${shot.id}.png`)),
    left: x,
    top: y + labelHeight,
  });
}

const contactSheet = path.join(
  outputRoot,
  "only-signature-reference-flow-contact-sheet.png",
);
await sharp({
  create: {
    width: boardWidth,
    height: boardHeight,
    channels: 4,
    background: "#03090E",
  },
})
  .composite(composites)
  .png()
  .toFile(contactSheet);
const contactSheetPreview = path.join(
  outputRoot,
  "only-signature-reference-flow-contact-sheet-preview.jpg",
);
await sharp(contactSheet).jpeg({ quality: 88 }).toFile(contactSheetPreview);

// Keep the legacy, easier-to-discover artifact names synchronized with the
// canonical reference-flow outputs so an older screen sequence cannot linger.
await copyFile(
  contactSheet,
  path.join(outputRoot, "only-signature-actual-flow-contact-sheet.png"),
);
await copyFile(
  contactSheetPreview,
  path.join(outputRoot, "only-signature-actual-flow-contact-sheet-preview.jpg"),
);

const manifest = {
  source: "Expo web static build with screenshot fixture mode enabled",
  classification:
    "Local reference-matched app rendering; phone frames are presentation-only and this is not native iOS or App Store evidence",
  capturedOn: new Date().toISOString().slice(0, 10),
  capturedAt: new Date().toISOString(),
  complete: true,
  bundle,
  runtimeErrors,
  referenceFlow: `${screenshots.length}-screen founder-directed flow`,
  screenshots: screenshots.map(({ id, route, headline, assertions }) => ({
    id,
    ...(route ? { route } : {}),
    headline,
    assertions,
  })),
  outputs: devices,
  contactSheet: path.relative(root, contactSheet).replaceAll("\\", "/"),
};
await writeFile(
  path.join(outputRoot, "manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);

process.stdout.write(
  `Captured ${screenshots.length} screens across ${Object.keys(devices).length} preview sizes (${screenshots.length * Object.keys(devices).length} screenshots).\n`,
);

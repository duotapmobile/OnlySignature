import { copyFile, mkdir, rm, writeFile } from "node:fs/promises";
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

const screenshots = [
  {
    id: "01-splash",
    headline: "Splash",
    kind: "splash",
    assertions: ["Only Signature"],
  },
  {
    id: "02-entry",
    headline: "Entry",
    route: "/?fixture=landing",
    testId: "entry-screen",
    assertions: ["Without the sign-up.", "Create My Signing Set"],
  },
  {
    id: "03-signature-capture",
    headline: "Signature Capture",
    route: "/draw?fixture=both",
    testId: "signature-capture-screen",
    assertions: ["Add your signature", "Save Signature"],
  },
  {
    id: "04-initials-capture",
    headline: "Initials Capture",
    route: "/draw?fixture=initials",
    testId: "initials-capture-screen",
    assertions: ["Add your initials", "Save Initials", "Skip for Now"],
  },
  {
    id: "05-review-popup",
    headline: "Review popup",
    route: "/preview?fixture=both",
    testId: "review-screen",
    assertions: ["Confirm Your Signing Set", "Confirm and Choose Background"],
  },
  {
    id: "06-background-popup",
    headline: "Background popup",
    route: "/purchase?fixture=both",
    testId: "background-screen",
    assertions: [
      "Choose Your Background",
      "Transparent Background",
      "White Background",
    ],
  },
  {
    id: "07-clear-background",
    headline: "Clear Background",
    route: "/clear-background?fixture=both",
    testId: "clear-background-screen",
    assertions: [
      "Clear Background",
      "Looks natural on any document.",
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
      "Removing the background later can damage your signature.",
      "No Thanks, Download Free White Set",
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
    id: "10-transparent-confirmation-popup",
    headline: "Transparent confirmation popup",
    route: "/success?fixture=purchased&mode=transparent",
    testId: "transparent-confirmation-screen",
    assertions: ["Transparent Set Unlocked", "Save or Share Files", "Done"],
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
  iphone: { width: 430, height: 932 },
  ipad: { width: 1032, height: 1376 },
};

const splashArtwork = path.join(
  root,
  "apps",
  "mobile",
  "assets",
  "brand",
  "only-signature-splash.png",
);

await mkdir(outputRoot, { recursive: true });
for (const device of Object.keys(devices)) {
  const directory = path.join(outputRoot, device);
  await rm(directory, { recursive: true, force: true });
  await mkdir(directory, { recursive: true });
}

async function createSplash(outputPath, size) {
  await sharp(splashArtwork)
    .resize(size.width, size.height, {
      fit: "contain",
      background: "#020B12",
    })
    .png()
    .toFile(outputPath);
}

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.ONLY_SIGNATURE_BROWSER_EXECUTABLE || undefined,
});
try {
  for (const [device, size] of Object.entries(devices)) {
    const context = await browser.newContext({
      viewport: size,
      deviceScaleFactor: 1,
      colorScheme: "dark",
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    for (const shot of screenshots) {
      const outputPath = path.join(outputRoot, device, `${shot.id}.png`);
      if (shot.kind === "splash") {
        await createSplash(outputPath, size);
        continue;
      }
      await page.goto(new URL(shot.route, baseUrl).href, {
        waitUntil: "networkidle",
      });
      await page.waitForSelector(`[data-testid="${shot.testId}"]`, {
        state: "visible",
      });
      await page.evaluate(() => document.fonts?.ready);
      for (const assertion of shot.assertions) {
        await page.waitForFunction(
          (expected) => document.body.innerText.includes(expected),
          assertion,
        );
      }
      await page.waitForTimeout(350);
      await page.screenshot({ path: outputPath, fullPage: false });
    }
    await context.close();
  }
} finally {
  await browser.close();
}

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
    .resize(screenWidth, appHeight, { fit: "fill" })
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
    <rect x="${screenX}" y="${screenY}" width="${screenWidth}" height="${height - 24}" rx="18" fill="#020B12"/>
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
    <text x="${phoneWidth / 2}" y="14" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="800" fill="#04B8D0">${xml(String(index + 1).padStart(2, "0"))}</text>
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
  referenceFlow: "11-screen founder-directed flow",
  screenshots: screenshots.map(({ id, route, headline, assertions, kind }) => ({
    id,
    ...(route ? { route } : {}),
    headline,
    ...(kind ? { kind } : {}),
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
  `Captured ${screenshots.length} iPhone and ${screenshots.length} iPad reference-flow screens.\n`,
);

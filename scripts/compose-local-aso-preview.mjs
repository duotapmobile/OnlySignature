import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const sourceRoot = path.join(root, "artifacts", "actual-flow-preview");
const outputRoot = path.join(root, "artifacts", "app-store-screenshots-v1");
const wordmarkPath = path.join(
  root,
  "apps",
  "mobile",
  "assets",
  "brand",
  "only-signature-wordmark.png",
);

const palette = {
  ink: "#071820",
  inkSoft: "#15313A",
  cream: "#F5F0E7",
  creamDeep: "#E8DED0",
  paper: "#FFFCF7",
  teal: "#0A9BA8",
  tealDeep: "#087680",
  tealPale: "#DCECEE",
  gold: "#C69A61",
  coral: "#C95F4D",
  coralPale: "#F2D9D3",
  white: "#FFFFFF",
  muted: "#51656C",
};

const slides = [
  {
    id: "01-ready",
    headline: ["Your signature.", "Ready when you are."],
    subhead: "Create a reusable signing set—without an account.",
    screens: ["01-entry.png"],
    background: palette.cream,
    accent: palette.tealPale,
    layout: "hero",
  },
  {
    id: "02-draw-once",
    headline: ["Draw it once."],
    subhead: "Save your signature and initials together.",
    screens: ["02-signature-capture.png", "03-initials-capture.png"],
    background: palette.tealPale,
    accent: palette.cream,
    layout: "duo",
    labels: ["Signature", "Initials"],
  },
  {
    id: "03-private",
    headline: ["Private by", "design."],
    subhead:
      "No account. No document upload. Your signing set stays on your device.",
    screens: ["01-entry.png"],
    background: palette.cream,
    accent: palette.tealPale,
    layout: "privacy",
    callouts: ["No account", "No document upload", "Saved on your device"],
  },
  {
    id: "04-review",
    headline: ["Review the", "whole set."],
    subhead: "Check your signature and initials before you continue.",
    screens: ["04-review.png"],
    background: palette.cream,
    accent: palette.creamDeep,
    layout: "review",
    callouts: ["Signature", "Initials"],
  },
  {
    id: "05-background",
    headline: ["Choose clear", "or white."],
    subhead: "Pick the background that fits the way you sign.",
    screens: ["05-background.png"],
    background: palette.tealPale,
    accent: palette.cream,
    layout: "background",
    callouts: ["Transparent", "White"],
  },
  {
    id: "06-fine-strokes",
    headline: ["Keep every", "fine stroke."],
    subhead: "See why DIY background removal can damage a signature.",
    screens: ["06-diy-warning.png"],
    background: palette.ink,
    accent: palette.coralPale,
    layout: "warning",
    dark: true,
    callouts: ["Original transparent", "DIY missing strokes"],
  },
  {
    id: "07-one-time",
    headline: ["$1.99 once.", "No subscription."],
    subhead: "Unlock one transparent signing set. Export it again anytime.",
    screens: ["07-transparent-unlocked.png"],
    background: palette.cream,
    accent: palette.tealPale,
    layout: "purchase",
    callouts: ["One-time unlock", "Export again anytime"],
  },
  {
    id: "08-save-anytime",
    headline: ["Save once.", "Sign anytime."],
    subhead: "Keep your signing sets organized and ready to export.",
    screens: ["08-saved-sets.png"],
    background: palette.tealPale,
    accent: palette.cream,
    layout: "saved",
    callouts: ["Export a saved set", "Create another set"],
  },
];

const devices = {
  iphone: {
    width: 1320,
    height: 2868,
    sourceWidth: 430,
    sourceHeight: 932,
    sourceDir: "iphone",
    outputDir: "iphone-6.9",
  },
  ipad: {
    width: 2064,
    height: 2752,
    sourceWidth: 1032,
    sourceHeight: 1376,
    sourceDir: "ipad",
    outputDir: "ipad-13",
  },
};

const escapeXml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const hashFile = async (filePath) =>
  createHash("sha256")
    .update(await readFile(filePath))
    .digest("hex");

const svg = (width, height, body) =>
  Buffer.from(
    `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`,
  );

const textBlock = ({
  x,
  y,
  lines,
  size,
  lineHeight,
  color,
  weight = 800,
  anchor = "start",
  family = "Arial, Segoe UI, sans-serif",
  letterSpacing = 0,
}) => {
  const spans = lines
    .map(
      (line, index) =>
        `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`,
    )
    .join("");
  return `<text x="${x}" y="${y}" fill="${color}" font-family="${family}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}" letter-spacing="${letterSpacing}">${spans}</text>`;
};

const wrapText = (value, maxChars) => {
  const words = value.split(/\s+/);
  const lines = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
};

const roundedMask = (width, height, radius) =>
  svg(
    width,
    height,
    `<rect width="${width}" height="${height}" rx="${radius}" fill="#fff"/>`,
  );

async function framedDevice(sourcePath, targetWidth, kind) {
  const meta = devices[kind];
  const screenWidth = targetWidth;
  const screenHeight = Math.round(
    targetWidth * (meta.sourceHeight / meta.sourceWidth),
  );
  const pad =
    kind === "iphone" ? Math.max(18, Math.round(targetWidth * 0.025)) : 24;
  const radius = kind === "iphone" ? Math.round(targetWidth * 0.105) : 58;
  const outerWidth = screenWidth + pad * 2;
  const outerHeight = screenHeight + pad * 2;
  const screen = await sharp(sourcePath)
    .resize(screenWidth, screenHeight, { fit: "fill" })
    .composite([
      {
        input: roundedMask(
          screenWidth,
          screenHeight,
          Math.max(28, radius - pad),
        ),
        blend: "dest-in",
      },
    ])
    .png()
    .toBuffer();
  const shell = svg(
    outerWidth,
    outerHeight,
    `<defs><filter id="shadow" x="-30%" y="-20%" width="160%" height="160%"><feDropShadow dx="0" dy="28" stdDeviation="28" flood-color="#071820" flood-opacity="0.24"/></filter></defs><rect x="5" y="5" width="${outerWidth - 10}" height="${outerHeight - 10}" rx="${radius}" fill="#111416" stroke="#8A8178" stroke-width="8" filter="url(#shadow)"/>`,
  );
  return sharp({
    create: {
      width: outerWidth,
      height: outerHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: shell, left: 0, top: 0 },
      { input: screen, left: pad, top: pad },
    ])
    .png()
    .toBuffer();
}

const pill = ({
  x,
  y,
  width,
  height,
  label,
  fill,
  color,
  stroke = "none",
  size,
}) =>
  `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${height / 2}" fill="${fill}" stroke="${stroke}" stroke-width="3"/><text x="${x + width / 2}" y="${y + height * 0.64}" fill="${color}" font-family="Arial, Segoe UI, sans-serif" font-size="${size}" font-weight="700" text-anchor="middle">${escapeXml(label)}</text>`;

function sharedArt(meta, slide, index) {
  const dark = Boolean(slide.dark);
  const ink = dark ? palette.cream : palette.ink;
  const sub = dark ? "#D5E0E2" : palette.muted;
  const margin = meta.width * 0.075;
  const brandWidth = meta.width * 0.23;
  const brandHeight = meta.height * 0.052;
  const headlineSize = meta.width * (meta.width < 1500 ? 0.092 : 0.066);
  const headlineLine = headlineSize * 1.03;
  const headlineY = meta.height * 0.122;
  const subSize = meta.width * (meta.width < 1500 ? 0.038 : 0.028);
  const subY = headlineY + headlineLine * slide.headline.length + subSize * 0.7;
  const subLines = wrapText(slide.subhead, meta.width < 1500 ? 38 : 60);
  const accentWidth = meta.width * 0.055;
  return {
    dark,
    ink,
    sub,
    margin,
    brandWidth,
    brandHeight,
    headlineY,
    subY,
    subLines,
    headlineSize,
    headlineLine,
    subSize,
    body: [
      `<rect width="${meta.width}" height="${meta.height}" fill="${slide.background}"/>`,
      `<rect x="0" y="0" width="${accentWidth}" height="${meta.height}" fill="${slide.accent}"/>`,
      `<rect x="${margin}" y="${meta.height * 0.045}" width="${brandWidth}" height="${brandHeight}" rx="${brandHeight / 2}" fill="${dark ? palette.inkSoft : palette.ink}" stroke="${dark ? palette.cream : "none"}" stroke-width="${dark ? 3 : 0}"/>`,
      `<text x="${meta.width - margin}" y="${meta.height * 0.076}" fill="${dark ? "#91A5AA" : palette.tealDeep}" font-family="Arial, Segoe UI, sans-serif" font-size="${meta.width * 0.023}" font-weight="700" text-anchor="end">${String(index + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}</text>`,
      textBlock({
        x: margin,
        y: headlineY,
        lines: slide.headline,
        size: headlineSize,
        lineHeight: headlineLine,
        color: ink,
        weight: 800,
      }),
      textBlock({
        x: margin,
        y: subY,
        lines: subLines,
        size: subSize,
        lineHeight: subSize * 1.28,
        color: sub,
        weight: 400,
      }),
    ].join(""),
  };
}

async function composeSlide(kind, slide, index) {
  const meta = devices[kind];
  const sourceDir = path.join(sourceRoot, meta.sourceDir);
  const { body, ink, margin, brandWidth, brandHeight } = sharedArt(
    meta,
    slide,
    index,
  );
  const art = [body];
  const composites = [];
  const wordmarkWidth = Math.round(brandWidth * 0.62);
  const wordmarkHeight = Math.round(brandHeight * 0.76);
  const wordmark = await sharp(wordmarkPath)
    .resize(wordmarkWidth, wordmarkHeight, { fit: "contain" })
    .tint(palette.white)
    .png()
    .toBuffer();
  composites.push({
    input: wordmark,
    left: Math.round(margin + (brandWidth - wordmarkWidth) / 2),
    top: Math.round(meta.height * 0.045 + (brandHeight - wordmarkHeight) / 2),
  });
  const phoneScale = meta.width < 1500 ? 0.66 : 0.54;
  const mainWidth = Math.round(meta.width * phoneScale);
  const stageTop = Math.round(meta.height * (meta.width < 1500 ? 0.35 : 0.31));

  if (slide.layout === "duo") {
    const width = Math.round(meta.width * (meta.width < 1500 ? 0.42 : 0.38));
    const gap = Math.round(meta.width * 0.035);
    const total = width * 2 + gap;
    const left = Math.round((meta.width - total) / 2);
    const top = Math.round(meta.height * (meta.width < 1500 ? 0.42 : 0.37));
    for (let i = 0; i < 2; i += 1) {
      const source = path.join(sourceDir, slide.screens[i]);
      const frame = await framedDevice(source, width, kind);
      composites.push({ input: frame, left: left + i * (width + gap), top });
      const labelWidth = Math.round(width * 0.62);
      const labelHeight = Math.round(meta.height * 0.038);
      art.push(
        pill({
          x: left + i * (width + gap) + (width - labelWidth) / 2,
          y: top - labelHeight * 1.3,
          width: labelWidth,
          height: labelHeight,
          label: slide.labels[i],
          fill: palette.ink,
          color: palette.cream,
          size: meta.width * 0.025,
        }),
      );
    }
  } else {
    const source = path.join(sourceDir, slide.screens[0]);
    let deviceWidth = mainWidth;
    let left = Math.round((meta.width - deviceWidth) / 2);
    let top = stageTop;
    if (["privacy", "review", "background"].includes(slide.layout)) {
      deviceWidth = Math.round(meta.width * (meta.width < 1500 ? 0.58 : 0.47));
      left = Math.round(meta.width * (meta.width < 1500 ? 0.35 : 0.46));
      top = Math.round(meta.height * 0.36);
    }
    if (slide.layout === "warning") {
      deviceWidth = Math.round(meta.width * (meta.width < 1500 ? 0.72 : 0.58));
      left = Math.round((meta.width - deviceWidth) / 2);
      top = Math.round(meta.height * 0.37);
    }
    if (slide.layout === "purchase" || slide.layout === "saved") {
      deviceWidth = Math.round(meta.width * (meta.width < 1500 ? 0.62 : 0.5));
      left = Math.round(meta.width * (meta.width < 1500 ? 0.33 : 0.43));
      top = Math.round(meta.height * 0.36);
    }
    let frameSource = source;
    if (slide.layout === "warning") {
      const crop =
        kind === "iphone"
          ? { left: 0, top: 190, width: 430, height: 370 }
          : { left: 0, top: 180, width: 1032, height: 650 };
      const focus = await sharp(source).extract(crop).png().toBuffer();
      frameSource = await sharp({
        create: {
          width: meta.sourceWidth,
          height: meta.sourceHeight,
          channels: 3,
          background: palette.ink,
        },
      })
        .composite([
          {
            input: focus,
            left: 0,
            top: kind === "iphone" ? 150 : 220,
          },
        ])
        .png()
        .toBuffer();
    }
    let frame = await framedDevice(frameSource, deviceWidth, kind);
    if (slide.layout === "warning") {
      const frameMeta = await sharp(frame).metadata();
      frame = await sharp(frame)
        .extract({
          left: 0,
          top: 0,
          width: frameMeta.width,
          height: Math.round(
            frameMeta.height * (kind === "iphone" ? 0.57 : 0.62),
          ),
        })
        .png()
        .toBuffer();
    }
    composites.push({ input: frame, left, top });

    const calloutSize = meta.width * (meta.width < 1500 ? 0.027 : 0.021);
    const pillHeight = meta.height * 0.042;
    const lineColor = slide.dark ? palette.coralPale : palette.tealDeep;
    if (slide.layout === "privacy") {
      const calloutX = margin;
      const calloutWidth = meta.width * 0.27;
      const startY = meta.height * 0.48;
      slide.callouts.forEach((label, i) => {
        const y = startY + i * pillHeight * 1.45;
        art.push(
          pill({
            x: calloutX,
            y,
            width: calloutWidth,
            height: pillHeight,
            label,
            fill: palette.paper,
            color: palette.ink,
            stroke: palette.tealDeep,
            size: calloutSize,
          }),
        );
        art.push(
          `<line x1="${calloutX + calloutWidth}" y1="${y + pillHeight / 2}" x2="${left + deviceWidth * 0.22}" y2="${top + deviceWidth * (0.55 + i * 0.3)}" stroke="${lineColor}" stroke-width="4"/><circle cx="${left + deviceWidth * 0.22}" cy="${top + deviceWidth * (0.55 + i * 0.3)}" r="9" fill="${lineColor}"/>`,
        );
      });
    }
    if (slide.layout === "review") {
      const x = margin;
      const w = meta.width * 0.27;
      const y1 = meta.height * 0.53;
      const y2 = meta.height * 0.66;
      [y1, y2].forEach((y, i) => {
        art.push(
          pill({
            x,
            y,
            width: w,
            height: pillHeight,
            label: slide.callouts[i],
            fill: palette.paper,
            color: palette.ink,
            stroke: palette.tealDeep,
            size: calloutSize,
          }),
        );
        art.push(
          `<line x1="${x + w}" y1="${y + pillHeight / 2}" x2="${left + deviceWidth * 0.3}" y2="${top + deviceWidth * (0.52 + i * 0.38)}" stroke="${lineColor}" stroke-width="4"/><circle cx="${left + deviceWidth * 0.3}" cy="${top + deviceWidth * (0.52 + i * 0.38)}" r="9" fill="${lineColor}"/>`,
        );
      });
    }
    if (slide.layout === "background") {
      const x = margin;
      const w = meta.width * 0.27;
      const ys = [meta.height * 0.5, meta.height * 0.68];
      ys.forEach((y, i) => {
        art.push(
          pill({
            x,
            y,
            width: w,
            height: pillHeight,
            label: slide.callouts[i],
            fill: i === 0 ? palette.ink : palette.paper,
            color: i === 0 ? palette.cream : palette.ink,
            stroke: palette.tealDeep,
            size: calloutSize,
          }),
        );
        art.push(
          `<line x1="${x + w}" y1="${y + pillHeight / 2}" x2="${left + deviceWidth * 0.34}" y2="${top + deviceWidth * (0.55 + i * 0.55)}" stroke="${lineColor}" stroke-width="4"/><circle cx="${left + deviceWidth * 0.34}" cy="${top + deviceWidth * (0.55 + i * 0.55)}" r="9" fill="${lineColor}"/>`,
        );
      });
    }
    if (slide.layout === "warning") {
      const y = meta.height * 0.325;
      const w = meta.width * 0.35;
      art.push(
        pill({
          x: margin,
          y,
          width: w,
          height: pillHeight,
          label: slide.callouts[0],
          fill: palette.tealPale,
          color: palette.ink,
          size: calloutSize,
        }),
      );
      art.push(
        pill({
          x: meta.width - margin - w,
          y,
          width: w,
          height: pillHeight,
          label: slide.callouts[1],
          fill: palette.coral,
          color: palette.white,
          size: calloutSize,
        }),
      );
    }
    if (slide.layout === "purchase") {
      const x = margin;
      const w = meta.width * 0.31;
      const y = meta.height * 0.51;
      art.push(
        `<rect x="${x}" y="${y}" width="${w}" height="${w * 0.72}" rx="${w * 0.11}" fill="${palette.ink}"/><text x="${x + w / 2}" y="${y + w * 0.27}" fill="${palette.cream}" font-family="Arial, Segoe UI, sans-serif" font-size="${meta.width * 0.028}" font-weight="700" text-anchor="middle">ONE TIME</text><text x="${x + w / 2}" y="${y + w * 0.54}" fill="${palette.white}" font-family="Arial, Segoe UI, sans-serif" font-size="${meta.width * 0.085}" font-weight="800" text-anchor="middle">$1.99</text>`,
      );
      art.push(
        pill({
          x,
          y: y + w * 0.82,
          width: w,
          height: pillHeight,
          label: slide.callouts[1],
          fill: palette.paper,
          color: palette.ink,
          stroke: palette.tealDeep,
          size: calloutSize * 0.92,
        }),
      );
      art.push(
        `<line x1="${x + w}" y1="${y + w * 0.88 + pillHeight / 2}" x2="${left + deviceWidth * 0.28}" y2="${top + deviceWidth * (kind === "ipad" ? 1.22 : 1.65)}" stroke="${lineColor}" stroke-width="4"/><circle cx="${left + deviceWidth * 0.28}" cy="${top + deviceWidth * (kind === "ipad" ? 1.22 : 1.65)}" r="9" fill="${lineColor}"/>`,
      );
    }
    if (slide.layout === "saved") {
      const x = margin;
      const w = meta.width * 0.3;
      const ys = [meta.height * 0.54, meta.height * 0.77];
      ys.forEach((y, i) => {
        art.push(
          pill({
            x,
            y,
            width: w,
            height: pillHeight,
            label: slide.callouts[i],
            fill: palette.paper,
            color: palette.ink,
            stroke: palette.tealDeep,
            size: calloutSize * 0.92,
          }),
        );
        art.push(
          `<line x1="${x + w}" y1="${y + pillHeight / 2}" x2="${left + deviceWidth * 0.25}" y2="${top + deviceWidth * (kind === "ipad" ? 0.56 + i * 0.62 : 0.66 + i * 1.08)}" stroke="${lineColor}" stroke-width="4"/><circle cx="${left + deviceWidth * 0.25}" cy="${top + deviceWidth * (kind === "ipad" ? 0.56 + i * 0.62 : 0.66 + i * 1.08)}" r="9" fill="${lineColor}"/>`,
        );
      });
    }
  }

  const artLayer = svg(meta.width, meta.height, art.join(""));
  const output = sharp(artLayer).composite(composites);
  const outputDir = path.join(outputRoot, meta.outputDir, "en-US");
  await mkdir(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, `${slide.id}.png`);
  await output
    .flatten({ background: slide.background })
    .removeAlpha()
    .png()
    .toFile(outputPath);
  const outputMeta = await sharp(outputPath).metadata();
  if (
    outputMeta.width !== meta.width ||
    outputMeta.height !== meta.height ||
    outputMeta.hasAlpha
  ) {
    throw new Error(`Invalid output: ${outputPath}`);
  }
  return {
    id: slide.id,
    headline: slide.headline.join(" "),
    sourceScreens: slide.screens,
    outputPath: path.relative(root, outputPath).replaceAll("\\", "/"),
    width: outputMeta.width,
    height: outputMeta.height,
    hasAlpha: Boolean(outputMeta.hasAlpha),
    sha256: await hashFile(outputPath),
  };
}

async function makeContactSheet(kind, outputs) {
  const meta = devices[kind];
  const thumbWidth = kind === "iphone" ? 280 : 380;
  const thumbHeight = Math.round(thumbWidth * (meta.height / meta.width));
  const gap = 36;
  const columns = 4;
  const rows = 2;
  const sheetWidth = columns * thumbWidth + (columns + 1) * gap;
  const labelHeight = 56;
  const sheetHeight = rows * (thumbHeight + labelHeight) + (rows + 1) * gap;
  const comps = [];
  for (let index = 0; index < outputs.length; index += 1) {
    const output = outputs[index];
    const filePath = path.join(root, output.outputPath);
    const thumb = await sharp(filePath)
      .resize(thumbWidth, thumbHeight, { fit: "fill" })
      .png()
      .toBuffer();
    const col = index % columns;
    const row = Math.floor(index / columns);
    const left = gap + col * (thumbWidth + gap);
    const top = gap + row * (thumbHeight + labelHeight + gap);
    comps.push({ input: thumb, left, top });
    comps.push({
      input: svg(
        thumbWidth,
        labelHeight,
        `<text x="${thumbWidth / 2}" y="39" fill="${palette.ink}" font-family="Arial, Segoe UI, sans-serif" font-size="24" font-weight="700" text-anchor="middle">${escapeXml(output.id)}</text>`,
      ),
      left,
      top: top + thumbHeight,
    });
  }
  const outputPath = path.join(outputRoot, `${kind}-contact-sheet.png`);
  await sharp({
    create: {
      width: sheetWidth,
      height: sheetHeight,
      channels: 3,
      background: palette.paper,
    },
  })
    .composite(comps)
    .removeAlpha()
    .png()
    .toFile(outputPath);
  return outputPath;
}

await mkdir(outputRoot, { recursive: true });
const provenance = {
  schemaVersion: 1,
  purpose:
    "App Store screenshot design preview using actual locally captured app screens",
  caveat:
    "Source screens are local Expo-rendered product-flow captures. Replace them with native iOS captures through the governed native screenshot workflow before submission evidence is finalized.",
  appleSpecifications: {
    iphone: "1320 x 2868 portrait, accepted 6.9-inch display size",
    ipad: "2064 x 2752 portrait, accepted 13-inch display size",
    alphaChannel: false,
  },
  source: "artifacts/actual-flow-preview",
  generatedAt: new Date().toISOString(),
  devices: {},
};

for (const kind of Object.keys(devices)) {
  const outputs = [];
  for (let index = 0; index < slides.length; index += 1) {
    outputs.push(await composeSlide(kind, slides[index], index));
  }
  const contactSheet = await makeContactSheet(kind, outputs);
  const sourceHashes = {};
  for (const name of new Set(slides.flatMap((slide) => slide.screens))) {
    sourceHashes[name] = await hashFile(
      path.join(sourceRoot, devices[kind].sourceDir, name),
    );
  }
  provenance.devices[kind] = {
    sourceHashes,
    outputs,
    contactSheet: path.relative(root, contactSheet).replaceAll("\\", "/"),
  };
}

provenance.wordmarkSha256 = await hashFile(wordmarkPath);
await writeFile(
  path.join(outputRoot, "manifest.json"),
  `${JSON.stringify(provenance, null, 2)}\n`,
  "utf8",
);

process.stdout.write(
  `Created ${slides.length} iPhone and ${slides.length} iPad ASO screenshot previews in ${path.relative(root, outputRoot)}.\n`,
);

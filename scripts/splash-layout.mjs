import path from "node:path";
import sharp from "sharp";

const repoRoot = path.resolve(import.meta.dirname, "..");
const sourcePath = path.join(
  repoRoot,
  "apps",
  "mobile",
  "assets",
  "brand",
  "only-signature-wordmark.png",
);
export const splashOutputPath = path.join(
  repoRoot,
  "apps",
  "mobile",
  "assets",
  "brand",
  "only-signature-splash.png",
);

const canvas = { width: 430, height: 932 };
const baseline = { width: 315, top: 252 };

function finite(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export async function renderSplash(profiles = {}) {
  const value =
    profiles?.iphone?.["splash.wordmark"] ??
    profiles?.ipad?.["splash.wordmark"] ??
    {};
  const boxWidth = Math.max(
    120,
    Math.min(430, finite(value.width, baseline.width)),
  );
  const scale = Math.max(0.5, Math.min(2, finite(value.scale, 1)));
  const x = Math.max(-700, Math.min(700, finite(value.x, 0)));
  const y = Math.max(-900, Math.min(900, finite(value.y, 0)));
  const metadata = await sharp(sourcePath).metadata();
  const ratio = (metadata.height ?? 1) / (metadata.width ?? 1);
  const baselineHeight = boxWidth * ratio;
  const renderedWidth = Math.max(1, Math.round(boxWidth * scale));
  const renderedHeight = Math.max(1, Math.round(baselineHeight * scale));
  const wordmark = await sharp(sourcePath)
    .resize({ width: renderedWidth })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: canvas.width,
      height: canvas.height,
      channels: 4,
      background: "#020B12",
    },
  })
    .composite([
      {
        input: wordmark,
        left: Math.round((canvas.width - renderedWidth) / 2 + x),
        top: Math.round(
          baseline.top + y - (renderedHeight - baselineHeight) / 2,
        ),
      },
    ])
    .png()
    .toFile(splashOutputPath);

  return splashOutputPath;
}

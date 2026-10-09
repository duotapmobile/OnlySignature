import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const reference =
  "C:/Users/mskir/.codex/codex-remote-attachments/01a09c22-8725-79e1-82ea-1ad811307576/8F1B4C80-20E8-4050-A0C7-F8F0564D14CE/1-Photo-1.jpg";
const output = path.join(root, "artifacts/visual-protocol-audit");
const manifest = JSON.parse(
  await readFile(
    path.join(root, "artifacts/actual-flow-preview/manifest.json"),
    "utf8",
  ),
);
const tileWidth = 300;
const tileHeight = 660;
const margin = 24;
const columns = [
  {
    title: "Selected reference region",
    file: reference,
    crop: { left: 44, top: 513, width: 153, height: 332 },
  },
  { title: "Actual Home", file: "02-entry.png" },
  { title: "Actual background choice", file: "06-background-popup.png" },
  { title: "Actual export", file: "08a-white-export.png" },
];
const width = margin + columns.length * (tileWidth + margin);
const height = 760;
const title = (text, x) =>
  `<text x="${x}" y="43" fill="#F8F6EF" font-family="Arial,sans-serif" font-size="17">${text}</text>`;
const layers = [
  {
    input: Buffer.from(
      `<svg width="${width}" height="${height}">${columns.map((column, i) => title(column.title, margin + i * (tileWidth + margin))).join("")}<text x="24" y="733" fill="#D8B66A" font-family="Arial,sans-serif" font-size="14">Reference attributes only: grouping, navy/paper hierarchy and soft depth. Actual Expo web captures: ${manifest.capturedAt}.</text></svg>`,
    ),
    left: 0,
    top: 0,
  },
];
for (const [index, column] of columns.entries()) {
  let source = sharp(
    column.crop
      ? column.file
      : path.join(root, "artifacts/actual-flow-preview/iphone", column.file),
  );
  if (column.crop) source = source.extract(column.crop);
  layers.push({
    input: await source
      .resize(tileWidth, tileHeight, { fit: "contain", background: "#02040A" })
      .png()
      .toBuffer(),
    left: margin + index * (tileWidth + margin),
    top: 60,
  });
}
await mkdir(output, { recursive: true });
await sharp({ create: { width, height, channels: 4, background: "#02040A" } })
  .composite(layers)
  .png()
  .toFile(path.join(output, "founder-reference-comparison.png"));
process.stdout.write(
  "Composed proportional reference-region and actual-render comparison; no app pixels were restyled.\n",
);

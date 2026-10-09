import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const directory = path.join(root, "artifacts/visual-layout-matrix");
const report = JSON.parse(
  await readFile(path.join(directory, "report.json"), "utf8"),
);
assert(
  report.complete,
  "Only compose state sheets from a completed passing matrix",
);
assert.equal(report.openings.length, report.expected.openings);
assert.equal(report.dialogs.length, report.expected.dialogs);

// These are proportional copies of the actual browser captures, not mockups.
// Letterboxing retains the entire viewport instead of cropping landscape pages.
for (const kind of ["opening", "format-dialog"]) {
  const width = 360;
  const height = 480;
  const labelHeight = 34;
  const columns = 5;
  const gap = 12;
  const tiles = [];
  for (const [index, viewport] of report.viewports.entries()) {
    const label = `${viewport.width}x${viewport.height}`;
    const left = (index % columns) * (width + gap);
    const top = Math.floor(index / columns) * (height + labelHeight + gap);
    tiles.push({
      input: await sharp(path.join(directory, `${kind}-${label}.png`))
        .resize(width, height, { fit: "contain", background: "#02040A" })
        .png()
        .toBuffer(),
      left,
      top,
    });
    tiles.push({
      input: Buffer.from(
        `<svg width="${width}" height="${labelHeight}"><rect width="100%" height="100%" fill="#10234D"/><text x="10" y="23" font-family="sans-serif" font-size="14" fill="#FBFAF5">${kind}: ${label}</text></svg>`,
      ),
      left,
      top: top + height,
    });
  }
  const filename = path.join(directory, `${kind}-contact-sheet.png`);
  await sharp({
    create: {
      width: columns * (width + gap) - gap,
      height:
        Math.ceil(report.viewports.length / columns) *
          (height + labelHeight + gap) -
        gap,
      channels: 4,
      background: "#02040A",
    },
  })
    .composite(tiles)
    .png()
    .toFile(filename);
  process.stdout.write(
    `Composed ${kind}: ${report.viewports.length} actual captures.\n`,
  );
}

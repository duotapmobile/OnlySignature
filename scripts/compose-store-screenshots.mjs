import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const manifest = JSON.parse(
  await readFile("store-assets/screenshots/manifest.json", "utf8"),
);
const template = await readFile(
  "store-assets/screenshots/source/frame-template.svg",
  "utf8",
);
const escapeXml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
const selectedScreenshots = process.env.SHOT_ID
  ? manifest.screenshots.filter((shot) => shot.id === process.env.SHOT_ID)
  : manifest.screenshots;
if (selectedScreenshots.length === 0)
  throw new Error(`Unknown screenshot id: ${process.env.SHOT_ID}`);
for (const device of ["iphone", "ipad"]) {
  const output = manifest.outputs[device];
  const rawDir = path.join("store-assets", "screenshots", "raw", device);
  const finalDir = path.join(
    "store-assets",
    "screenshots",
    "final",
    device,
    "en-US",
  );
  await mkdir(finalDir, { recursive: true });
  for (const shot of selectedScreenshots) {
    const rawPath = path.join(rawDir, `${shot.id}.png`);
    try {
      await readFile(rawPath);
    } catch {
      throw new Error(`Required capture is missing: ${rawPath}`);
    }
    const dimensions =
      device === "iphone"
        ? {
            headlineY: 210,
            headlineSize: 76,
            cardX: 105,
            cardY: 350,
            cardWidth: 1080,
            cardHeight: 2320,
            cardRadius: 96,
            footerY: 2735,
            footerSize: 34,
          }
        : {
            headlineY: 180,
            headlineSize: 82,
            cardX: 140,
            cardY: 310,
            cardWidth: 1784,
            cardHeight: 2325,
            cardRadius: 88,
            footerY: 2708,
            footerSize: 36,
          };
    const frameSvg = Buffer.from(
      template
        .replaceAll("{{WIDTH}}", String(output.width))
        .replaceAll("{{HEIGHT}}", String(output.height))
        .replaceAll("{{CENTER}}", String(output.width / 2))
        .replace("{{HEADLINE}}", escapeXml(shot.headline))
        .replace("{{HEADLINE_Y}}", String(dimensions.headlineY))
        .replace("{{HEADLINE_SIZE}}", String(dimensions.headlineSize))
        .replace("{{CARD_X}}", String(dimensions.cardX))
        .replace("{{CARD_Y}}", String(dimensions.cardY))
        .replace("{{CARD_WIDTH}}", String(dimensions.cardWidth))
        .replace("{{CARD_HEIGHT}}", String(dimensions.cardHeight))
        .replace("{{CARD_RADIUS}}", String(dimensions.cardRadius))
        .replace("{{FOOTER_Y}}", String(dimensions.footerY))
        .replace("{{FOOTER_SIZE}}", String(dimensions.footerSize)),
    );
    const frame = sharp(frameSvg).png();
    const screenWidth =
      device === "iphone"
        ? Math.round(output.width * 0.78)
        : Math.round(output.width * 0.72);
    const screenHeight =
      device === "iphone"
        ? Math.round(output.height * 0.76)
        : Math.round(output.height * 0.75);
    const top =
      device === "iphone"
        ? Math.round(output.height * 0.145)
        : Math.round(output.height * 0.16);
    const left = Math.round((output.width - screenWidth) / 2);
    const raw = await sharp(rawPath)
      .resize(screenWidth, screenHeight, { fit: "cover", position: "top" })
      .flatten({ background: "#F5F3EE" })
      .png()
      .toBuffer();
    const composed = await frame
      .composite([{ input: raw, left, top }])
      .flatten({ background: "#133A50" })
      .png()
      .toBuffer();
    const finalPath = path.join(finalDir, `${shot.id}.png`);
    await sharp(composed).removeAlpha().png().toFile(finalPath);
    const metadata = await sharp(finalPath).metadata();
    if (
      metadata.width !== output.width ||
      metadata.height !== output.height ||
      metadata.hasAlpha
    )
      throw new Error(`Invalid output ${finalPath}`);
    process.stdout.write(
      `WROTE ${finalPath} ${metadata.width}x${metadata.height} no-alpha\n`,
    );
  }
}

await mkdir(path.join("store-assets", "app-review"), { recursive: true });
const reviewSource = path.join(
  "store-assets",
  "screenshots",
  "final",
  "iphone",
  "en-US",
  "03-no-editing.png",
);
const reviewOutput = path.join(
  "store-assets",
  "app-review",
  "iap-review-1024.png",
);
await sharp(reviewSource)
  .resize(1024, 1024, {
    fit: "contain",
    position: "center",
    background: "#133A50",
  })
  .flatten({ background: "#133A50" })
  .removeAlpha()
  .png()
  .toFile(reviewOutput);
process.stdout.write(`WROTE ${reviewOutput} 1024x1024 no-alpha\n`);

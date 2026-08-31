import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
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
const hashFile = async (file) =>
  createHash("sha256")
    .update(await readFile(file))
    .digest("hex");
const devices = process.env.DEVICE ? [process.env.DEVICE] : ["iphone", "ipad"];
if (devices.some((device) => !["iphone", "ipad"].includes(device)))
  throw new Error("DEVICE must be iphone or ipad.");

for (const device of devices) {
  const output = manifest.outputs[device];
  const rawDir = path.join(
    "store-assets",
    "screenshots",
    "native",
    "raw",
    device,
  );
  const finalDir = path.join(
    "store-assets",
    "screenshots",
    "native",
    "final",
    device,
    "en-US",
  );
  const rawProvenance = JSON.parse(
    await readFile(path.join(rawDir, "capture-provenance.json"), "utf8"),
  );
  if (rawProvenance.source !== "native-react-native-ios-simulator")
    throw new Error(`Invalid native source provenance for ${device}.`);
  await mkdir(finalDir, { recursive: true });
  const finalCaptures = [];

  for (const shot of manifest.screenshots) {
    const rawPath = path.join(rawDir, `${shot.id}.png`);
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
    const composed = await sharp(frameSvg)
      .png()
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
      throw new Error(`Invalid native-derived output ${finalPath}`);
    finalCaptures.push({
      id: shot.id,
      route: shot.route,
      rawSha256: await hashFile(rawPath),
      finalPath: finalPath.replaceAll("\\", "/"),
      finalSha256: await hashFile(finalPath),
      width: metadata.width,
      height: metadata.height,
      hasAlpha: Boolean(metadata.hasAlpha),
    });
  }

  const provenanceDir = path.join(
    "store-assets",
    "screenshots",
    "native",
    "provenance",
  );
  await mkdir(provenanceDir, { recursive: true });
  await writeFile(
    path.join(provenanceDir, `${device}.json`),
    `${JSON.stringify(
      {
        schemaVersion: 1,
        ...rawProvenance,
        composedAt: new Date().toISOString(),
        finalCaptures,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  if (device === "iphone") {
    const reviewSource = path.join(rawDir, "03-no-editing.png");
    const reviewDir = path.join("store-assets", "app-review", "native");
    const reviewOutput = path.join(reviewDir, "iap-review-1024.png");
    const reviewProvenance = path.join(reviewDir, "provenance.json");
    const crop = { left: 75, top: 500, width: 1140, height: 1140 };
    await mkdir(reviewDir, { recursive: true });
    await sharp(reviewSource)
      .extract(crop)
      .resize(1024, 1024, {
        fit: "cover",
        position: "center",
      })
      .flatten({ background: "#133A50" })
      .removeAlpha()
      .png()
      .toFile(reviewOutput);
    const reviewMetadata = await sharp(reviewOutput).metadata();
    await writeFile(
      reviewProvenance,
      `${JSON.stringify(
        {
          schemaVersion: 1,
          source: "native-react-native-ios-simulator",
          sourceFrameId: "03-no-editing",
          sourceRoute: "/purchase?fixture=both",
          sourcePath: reviewSource.replaceAll("\\", "/"),
          sourceSha256: await hashFile(reviewSource),
          crop,
          outputPath: reviewOutput.replaceAll("\\", "/"),
          outputSha256: await hashFile(reviewOutput),
          width: reviewMetadata.width,
          height: reviewMetadata.height,
          hasAlpha: Boolean(reviewMetadata.hasAlpha),
          easBuildId: rawProvenance.easBuildId,
          easWorkflowId: rawProvenance.easWorkflowId,
          commitSha: rawProvenance.commitSha,
        },
        null,
        2,
      )}\n`,
      "utf8",
    );
  }
  process.stdout.write(
    `Composed ${finalCaptures.length} native-derived ${device} screenshots with hashes.\n`,
  );
}

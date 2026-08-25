import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const manifest = JSON.parse(
  await readFile("store-assets/screenshots/manifest.json", "utf8"),
);
let checked = 0;
for (const device of ["iphone", "ipad"]) {
  const expected = manifest.outputs[device];
  for (const shot of manifest.screenshots) {
    const file = path.join(
      "store-assets",
      "screenshots",
      "final",
      device,
      "en-US",
      `${shot.id}.png`,
    );
    const metadata = await sharp(file).metadata();
    if (
      metadata.width !== expected.width ||
      metadata.height !== expected.height ||
      metadata.hasAlpha
    )
      throw new Error(`Invalid App Store screenshot: ${file}`);
    checked += 1;
  }
  const digest = async (id) =>
    createHash("sha256")
      .update(
        await readFile(
          path.join("store-assets", "screenshots", "raw", device, `${id}.png`),
        ),
      )
      .digest("hex");
  if ((await digest("03-no-editing")) === (await digest("04-any-document")))
    throw new Error(`${device} screenshots 03 and 04 are duplicates`);
}
const iap = await sharp(
  "store-assets/app-review/iap-review-1024.png",
).metadata();
if (iap.width !== 1024 || iap.height !== 1024 || iap.hasAlpha)
  throw new Error("Invalid IAP review screenshot");
process.stdout.write(
  `Store assets verified: ${checked} screenshots plus opaque IAP review asset; distinct purchase fixtures.\n`,
);

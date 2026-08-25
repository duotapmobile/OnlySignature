import { describe, expect, it } from "vitest";
import { PNG } from "pngjs";
import sharp from "sharp";
import { rasterizeDrawing } from "../../packages/core/src/index";
import type { DrawingSnapshot } from "../../packages/core/src/index";

const signature: DrawingSnapshot = {
  renderingVersion: 1,
  width: 900,
  height: 320,
  orientation: "landscape",
  strokes: [
    {
      id: "main",
      points: [
        { x: 4, y: 180, t: 0 },
        { x: 180, y: 40, t: 20 },
        { x: 360, y: 250, t: 50 },
        { x: 620, y: 90, t: 80 },
        { x: 895, y: 160, t: 110 },
      ],
    },
    { id: "dot", points: [{ x: 450, y: 28, t: 120 }] },
  ],
};

function alphaValues(data: Uint8Array): number[] {
  const values: number[] = [];
  for (let i = 3; i < data.length; i += 4) values.push(data[i] ?? 0);
  return values;
}

function alphaRange(values: number[]): { min: number; max: number } {
  let min = 255;
  let max = 0;
  for (const value of values) {
    if (value < min) min = value;
    if (value > max) max = value;
  }
  return { min, max };
}

describe("pixel export requirements", () => {
  it("encodes a transparent PNG with zero-alpha padding and visible strokes", () => {
    const raster = rasterizeDrawing(signature, {
      background: "transparent",
      maxWidth: 1200,
      maxHeight: 600,
    });
    const encoded = PNG.sync.write({
      width: raster.width,
      height: raster.height,
      data: Buffer.from(raster.data),
    });
    const decoded = PNG.sync.read(encoded);
    const alphas = alphaValues(decoded.data);
    const range = alphaRange(alphas);
    expect(range.min).toBe(0);
    expect(range.max).toBe(255);
    expect(alphas.some((alpha) => alpha > 0 && alpha < 255)).toBe(true);
    const cornerAlpha = decoded.data[3];
    expect(cornerAlpha).toBe(0);
    const opaqueWhitePixels = decoded.data.reduce(
      (count, value, index, values) => {
        if (index % 4 !== 0) return count;
        return (
          count +
          (value === 255 &&
          values[index + 1] === 255 &&
          values[index + 2] === 255 &&
          values[index + 3] === 255
            ? 1
            : 0)
        );
      },
      0,
    );
    expect(opaqueWhitePixels).toBe(0);
  });

  it("encodes white PNG with opaque white padding and visible ink", () => {
    const raster = rasterizeDrawing(signature, {
      background: "white",
      maxWidth: 1200,
      maxHeight: 600,
    });
    const decoded = PNG.sync.read(
      PNG.sync.write({
        width: raster.width,
        height: raster.height,
        data: Buffer.from(raster.data),
      }),
    );
    const alphas = alphaValues(decoded.data);
    expect(new Set(alphas)).toEqual(new Set([255]));
    expect(decoded.data[0]).toBe(255);
    expect(
      decoded.data.some((value, index) => index % 4 === 0 && value < 80),
    ).toBe(true);
  });

  it("encodes JPEG without alpha and with a white background", async () => {
    const raster = rasterizeDrawing(signature, {
      background: "white",
      maxWidth: 1200,
      maxHeight: 600,
    });
    const encoded = await sharp(Buffer.from(raster.data), {
      raw: { width: raster.width, height: raster.height, channels: 4 },
    })
      .jpeg({ quality: 92 })
      .toBuffer();
    const metadata = await sharp(encoded).metadata();
    const corner = await sharp(encoded)
      .extract({ left: 0, top: 0, width: 1, height: 1 })
      .raw()
      .toBuffer();
    expect(metadata.format).toBe("jpeg");
    expect(metadata.hasAlpha).toBe(false);
    expect(corner[0]).toBeGreaterThan(240);
    expect(corner[1]).toBeGreaterThan(240);
    expect(corner[2]).toBeGreaterThan(240);
  });

  it.each([
    ["signature only", signature],
    [
      "tiny initials",
      {
        ...signature,
        width: 120,
        height: 80,
        strokes: [
          {
            id: "i",
            points: [
              { x: 50, y: 30, t: 0 },
              { x: 65, y: 60, t: 10 },
            ],
          },
        ],
      },
    ],
    [
      "disconnected dots",
      {
        ...signature,
        strokes: [
          { id: "a", points: [{ x: 100, y: 100, t: 0 }] },
          { id: "b", points: [{ x: 800, y: 200, t: 10 }] },
        ],
      },
    ],
  ])("keeps crop and padding for %s", (_name, drawing) => {
    const raster = rasterizeDrawing(drawing as DrawingSnapshot, {
      background: "transparent",
    });
    expect(raster.width).toBeGreaterThan(16);
    expect(raster.height).toBeGreaterThan(16);
    expect(raster.data[3]).toBe(0);
  });
});

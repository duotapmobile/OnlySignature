import assert from "node:assert/strict";
import test from "node:test";
import {
  baselinePreviewTransform,
  sampleBaselinePresentation,
} from "../src/domain/preview-layout";
import type { DrawingAsset } from "../src/domain/models";

const asset: DrawingAsset = {
  kind: "signature",
  canvasWidth: 600,
  canvasHeight: 300,
  orientation: "landscape",
  renderingVersion: 1,
  finalizedHash: null,
  strokes: [
    {
      id: "real-user-ink",
      points: [
        { x: 45, y: 70, t: 0, pressure: null },
        { x: 220, y: 207, t: 40, pressure: null },
        { x: 330, y: 262, t: 80, pressure: null },
        { x: 555, y: 200, t: 120, pressure: null },
      ],
    },
  ],
};

for (const [width, height] of [
  [280, 110],
  [500, 190],
  [700, 260],
]) {
  test(`real ink preserves the capture baseline and descender at ${width}x${height}`, () => {
    const before = JSON.stringify(asset);
    const transform = baselinePreviewTransform(asset, width!, height!, 0.72)!;
    assert(transform);
    assert(
      Math.abs(transform.y + 207 * transform.scale - height! * 0.72) < 0.001,
    );
    const descenderY = transform.y + 262 * transform.scale;
    assert(descenderY > height! * 0.72 && descenderY < height!);
    for (const point of asset.strokes[0]!.points) {
      assert(transform.x + point.x * transform.scale >= 0);
      assert(transform.x + point.x * transform.scale <= width!);
      assert(transform.y + point.y * transform.scale >= 0);
      assert(transform.y + point.y * transform.scale <= height!);
    }
    assert.equal(
      JSON.stringify(asset),
      before,
      "Presentation must not mutate saved strokes",
    );
  });
}

test("empty or unmeasured previews do not create invalid SVG transforms", () => {
  assert.equal(baselinePreviewTransform(asset, 0, 100, 0.7), null);
  assert.equal(
    baselinePreviewTransform({ ...asset, strokes: [] }, 100, 100, 0.7),
    null,
  );
});

for (const [aspect, sourceBaseline] of [
  [2172 / 724, 0.62],
  [1274 / 639, 0.83],
]) {
  test(`sample artwork at aspect ${aspect} sits on every guide without cropping`, () => {
    for (const [width, height] of [
      [280, 68],
      [320, 350],
      [700, 180],
    ]) {
      for (const targetBaseline of [0.69, 0.7, 0.72, 0.76, 0.82]) {
        const rect = sampleBaselinePresentation(
          width!,
          height!,
          aspect!,
          sourceBaseline!,
          targetBaseline,
        )!;
        assert(rect);
        assert(
          Math.abs(
            rect.y + sourceBaseline! * rect.height - height! * targetBaseline,
          ) < 0.001,
        );
        assert(rect.x >= -0.001 && rect.x + rect.width <= width! + 0.001);
        assert(rect.y >= -0.001 && rect.y + rect.height <= height! + 0.001);
        assert(Math.abs(rect.width / rect.height - aspect!) < 0.001);
      }
    }
  });
}

test("sample artwork rejects invalid or unmeasured layout inputs", () => {
  for (const args of [
    [0, 100, 3, 0.62, 0.69],
    [100, 0, 3, 0.62, 0.69],
    [100, 100, 0, 0.62, 0.69],
    [100, 100, 3, 1, 0.69],
    [100, 100, 3, 0, 0.69],
    [100, 100, 3, 0.62, Number.NaN],
  ]) {
    assert.equal(
      sampleBaselinePresentation(
        args[0]!,
        args[1]!,
        args[2]!,
        args[3]!,
        args[4]!,
      ),
      null,
    );
  }
});

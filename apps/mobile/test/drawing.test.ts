import assert from "node:assert/strict";
import test from "node:test";
import {
  exportDimensions,
  drawingBounds,
  paddedViewBox,
  pointToDrawingPlane,
  serializeSvg,
  smoothPath,
} from "../src/domain/drawing";
import { screenshotFixtureSet } from "../src/domain/fixtures";
import { formatLabel, isTransparent } from "../src/domain/models";

const asset = screenshotFixtureSet.signature!;

test("smooth path retains stroke endpoints and uses vector curves", () => {
  const path = smoothPath(asset.strokes[0]!.points);
  assert.match(path, /^M /);
  assert.match(path, / Q /);
  assert.match(path, / L /);
});

test("export bounds are tight with proportional padding", () => {
  const bounds = drawingBounds(asset)!;
  const [x, y, width, height] = paddedViewBox(asset).split(" ").map(Number);
  assert.ok(x! < bounds.minX);
  assert.ok(y! < bounds.minY);
  assert.ok(width! > bounds.maxX - bounds.minX);
  assert.ok(height! > bounds.maxY - bounds.minY);
  assert.ok(width! < asset.canvasWidth * 1.2);
  assert.ok(height! < asset.canvasHeight * 1.2);
});

test("runtime export dimensions preserve the padded drawing aspect ratio", () => {
  const [, , width, height] = paddedViewBox(asset).split(" ").map(Number);
  const dimensions = exportDimensions(asset);
  assert.equal(Math.max(dimensions.width, dimensions.height), 1600);
  assert.ok(dimensions.width >= 128);
  assert.ok(dimensions.height >= 128);
  assert.ok(
    Math.abs(dimensions.width / dimensions.height - width! / height!) < 0.01,
  );
});

test("transparent SVG is openable vector markup without an opaque background or private stroke metadata", () => {
  const svg = serializeSvg(asset);
  assert.match(
    svg,
    /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="[^"]+">/,
  );
  assert.match(svg, /<path /);
  assert.doesNotMatch(svg, /<rect /);
  assert.doesNotMatch(svg, /"points"|"pressure"|"timing"|checker/i);
  assert.match(svg, /<\/svg>$/);
});

test("white SVG explicitly adds one white background rectangle", () => {
  const svg = serializeSvg(asset, "white");
  assert.match(svg, /<rect [^>]*fill="#fff"\/>/);
  assert.equal((svg.match(/<rect /g) ?? []).length, 1);
});

test("format labels never claim JPEG transparency", () => {
  assert.equal(formatLabel["jpeg-white"], "JPEG, White Background");
  assert.equal(isTransparent("jpeg-white"), false);
  assert.equal(isTransparent("png-transparent"), true);
});

test("layout rotation cannot change canonical drawing geometry or hash input", () => {
  const portraitPoint = pointToDrawingPlane(100, 105, 400, 210, 800, 420);
  const landscapePoint = pointToDrawingPlane(200, 210, 800, 420, 800, 420);
  assert.deepEqual(portraitPoint, landscapePoint);
  const letterboxed = pointToDrawingPlane(500, 210, 1000, 420, 800, 420);
  assert.deepEqual(letterboxed, { x: 400, y: 210 });
  assert.equal(pointToDrawingPlane(50, 210, 1000, 420, 800, 420), null);
  assert.equal(pointToDrawingPlane(950, 210, 1000, 420, 800, 420), null);
});

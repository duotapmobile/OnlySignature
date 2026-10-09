import assert from "node:assert/strict";
import test from "node:test";
import {
  INK_STABILIZER_BETA,
  INK_MIN_SAMPLE_DISTANCE,
  INK_STABILIZER_MIN_CUTOFF,
  SIGNATURE_STROKE_WIDTH,
  exportDimensions,
  drawingBounds,
  paddedViewBox,
  pointToDrawingPlane,
  shouldRecordStrokePoint,
  serializeSvg,
  smoothPath,
  stabilizeStrokePoint,
  stabilizeDrawingTouch,
  type StrokeStabilizerState,
} from "../src/domain/drawing";
import { screenshotFixtureSet } from "../src/domain/fixtures";
import {
  formatLabel,
  isTransparent,
  type DrawingAsset,
} from "../src/domain/models";
import { fuseSignatureParts } from "../src/domain/signature-composition";

const asset = screenshotFixtureSet.signature!;

test("identical finger motion receives identical smoothing across stored-plane scales", () => {
  const viewport = { width: 360, height: 168 };
  const trace = [
    { x: 40, y: 90, t: 0, pressure: null },
    { x: 42, y: 92, t: 16, pressure: null },
    { x: 44, y: 88, t: 32, pressure: null },
    { x: 46, y: 92, t: 48, pressure: null },
    { x: 75, y: 75, t: 64, pressure: null },
    { x: 110, y: 100, t: 80, pressure: null },
  ];
  const run = (factor: number) => {
    let state: StrokeStabilizerState | null = null;
    return trace.map((point, index) => {
      const filtered = stabilizeDrawingTouch(
        state,
        point,
        viewport,
        { width: viewport.width * factor, height: viewport.height * factor },
        index === trace.length - 1,
      )!;
      state = filtered.state;
      return {
        x: filtered.point.x / factor,
        y: filtered.point.y / factor,
        t: filtered.point.t,
      };
    });
  };
  const direct = run(1);
  for (const factor of [0.5, 2, 3]) {
    const scaled = run(factor);
    for (let i = 0; i < direct.length; i++) {
      assert.ok(Math.abs(direct[i]!.x - scaled[i]!.x) < 1e-8);
      assert.ok(Math.abs(direct[i]!.y - scaled[i]!.y) < 1e-8);
      assert.equal(direct[i]!.t, scaled[i]!.t);
    }
  }
});

test("point threshold remains 5.5 screen points instead of changing with portrait/landscape scale", () => {
  for (const displayScale of [0.25, 0.5, 1, 2]) {
    const start = { x: 100, y: 100, t: 0, pressure: null };
    assert.equal(
      shouldRecordStrokePoint(
        start,
        { ...start, x: start.x + 4 / displayScale },
        displayScale,
      ),
      false,
    );
    assert.equal(
      shouldRecordStrokePoint(
        start,
        { ...start, x: start.x + 6 / displayScale },
        displayScale,
      ),
      true,
    );
  }
});

test("screen-point filtering starts under the finger and rejects letterbox touches without changing state", () => {
  const viewport = { width: 1000, height: 420 };
  const plane = { width: 800, height: 420 };
  const touch = { x: 500, y: 210, t: 0, pressure: null };
  const first = stabilizeDrawingTouch(null, touch, viewport, plane)!;
  assert.deepEqual(first.point, { ...touch, x: 400 });
  const before = JSON.stringify(first.state);
  assert.equal(
    stabilizeDrawingTouch(
      first.state,
      { ...touch, x: 50, t: 16 },
      viewport,
      plane,
    ),
    null,
  );
  assert.equal(JSON.stringify(first.state), before);
});

test("smooth path retains stroke endpoints and uses vector curves", () => {
  const path = smoothPath(asset.strokes[0]!.points);
  assert.match(path, /^M /);
  assert.match(path, / Q /);
  assert.match(path, / L /);
});

test("adaptive ink stabilization removes slow finger wobble without flattening deliberate movement", () => {
  assert.equal(INK_STABILIZER_MIN_CUTOFF, 0.55);
  assert.equal(INK_STABILIZER_BETA, 0.006);
  const makePoint = (x: number, y: number, t: number) => ({
    x,
    y,
    t,
    pressure: null,
  });
  let state = null;
  const slowRaw = [100, 102, 98, 102, 98, 100];
  const slowFiltered = slowRaw.map((y, index) => {
    const result = stabilizeStrokePoint(
      state,
      makePoint(index * 0.5, y, index * 16),
    );
    state = result.state;
    return result.point.y;
  });
  const rawSpread = Math.max(...slowRaw) - Math.min(...slowRaw);
  const filteredSpread = Math.max(...slowFiltered) - Math.min(...slowFiltered);
  assert.ok(filteredSpread < rawSpread * 0.6);

  state = null;
  const deliberate = [
    makePoint(0, 0, 0),
    makePoint(30, 0, 16),
    makePoint(60, 25, 32),
  ].map((point) => {
    const result = stabilizeStrokePoint(state, point);
    state = result.state;
    return result.point;
  });
  const last = deliberate.at(-1)!;
  assert.ok(last.x > 20);
  assert.ok(last.y > 4);
  assert.ok(last.x <= 60);
  assert.ok(last.y <= 25);
  assert.equal(last.t, 32);
});

test("ink sampling ignores micro-jitter but records intentional movement", () => {
  const previous = { x: 100, y: 100, t: 0, pressure: null };
  assert.equal(INK_MIN_SAMPLE_DISTANCE, 5.5);
  assert.equal(
    shouldRecordStrokePoint(previous, {
      x: 100.45,
      y: 99.55,
      t: 16,
      pressure: null,
    }),
    false,
  );
  assert.equal(
    shouldRecordStrokePoint(previous, {
      x: 5.6 + previous.x,
      y: 100,
      t: 16,
      pressure: null,
    }),
    true,
  );
});

test("terminal stabilization follows the lifted finger without snapping into a tail", () => {
  const previous = stabilizeStrokePoint(null, {
    x: 10,
    y: 20,
    t: 0,
    pressure: null,
  });
  const terminal = stabilizeStrokePoint(
    previous.state,
    { x: 40, y: 55, t: 16, pressure: null },
    true,
  );

  assert.equal(terminal.point.t, 16);
  assert.ok(terminal.point.x > 28 && terminal.point.x < 40);
  assert.ok(terminal.point.y > 42 && terminal.point.y < 55);
});

test("marketing fixtures use multi-stroke fictional handwriting rather than abstract marks", () => {
  const initials = screenshotFixtureSet.initials!;
  assert.ok(asset.strokes.length >= 3);
  assert.ok(initials.strokes.length >= 3);
  assert.ok(asset.strokes[0]!.points.length >= 20);
  assert.match(asset.finalizedHash!, /taylor-brooks-v3$/);
  assert.match(initials.finalizedHash!, /tb-v3$/);
  for (const stroke of [...asset.strokes, ...initials.strokes]) {
    if (stroke.points.length !== 2) continue;
    const [start, end] = stroke.points;
    assert.ok(
      Math.abs(end!.x - start!.x) < asset.canvasWidth * 0.6 ||
        Math.abs(end!.y - start!.y) > 10,
      "fixture must not contain a long straight underline",
    );
  }
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
  assert.equal(SIGNATURE_STROKE_WIDTH, 2.25);
  assert.match(svg, /stroke-width=\"2.25\"/);
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
  assert.equal(pointToDrawingPlane(400, 50, 800, 620, 800, 420), null);
  assert.equal(pointToDrawingPlane(400, 570, 800, 620, 800, 420), null);
  assert.deepEqual(pointToDrawingPlane(100, 100, 1000, 420, 800, 420), {
    x: 0,
    y: 100,
  });
});

test("first and last name drawings fuse in order on one shared baseline", () => {
  const part = (
    id: string,
    width: number,
    height: number,
    points: { x: number; y: number }[],
  ): DrawingAsset => ({
    kind: "signature",
    canvasWidth: width,
    canvasHeight: height,
    orientation: "portrait",
    renderingVersion: 1,
    finalizedHash: null,
    strokes: [
      {
        id,
        points: points.map((point, index) => ({
          ...point,
          t: index,
          pressure: null,
        })),
      },
    ],
  });
  const first = part("first", 400, 200, [
    { x: 40, y: 92 },
    { x: 180, y: 138 },
  ]);
  const last = part("last", 600, 300, [
    { x: 90, y: 140 },
    { x: 430, y: 207 },
  ]);

  const fused = fuseSignatureParts(first, last);
  const firstStroke = fused.strokes[0]!;
  const lastStroke = fused.strokes[1]!;
  const targetBaseline = fused.canvasHeight * 0.69;
  assert.equal(fused.canvasWidth, 600);
  assert.equal(fused.canvasHeight, 300);
  assert.ok(Math.abs(firstStroke.points.at(-1)!.y - targetBaseline) < 0.001);
  assert.ok(Math.abs(lastStroke.points.at(-1)!.y - targetBaseline) < 0.001);
  assert.ok(
    Math.max(...firstStroke.points.map(({ x }) => x)) <
      Math.min(...lastStroke.points.map(({ x }) => x)),
  );
  assert.ok(drawingBounds(fused)!.minX >= 0);
  assert.ok(drawingBounds(fused)!.maxX <= fused.canvasWidth);
  assert.equal(first.strokes[0]!.points[0]!.x, 40);
  assert.equal(last.strokes[0]!.points[0]!.x, 90);
});

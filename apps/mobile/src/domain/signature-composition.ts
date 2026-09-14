import { drawingBounds } from "./drawing";
import type { DrawingAsset, Stroke } from "./models";

const GUIDE_LINE_RATIO = 0.69;
const HORIZONTAL_INSET_RATIO = 0.07;
const NAME_HEIGHT_RATIO = 0.34;
const NAME_GAP_RATIO = 0.035;

function remapStrokes(
  strokes: Stroke[],
  prefix: string,
  scale: number,
  sourceBaseline: number,
  targetBaseline: number,
  sourceMinX: number,
  targetX: number,
): Stroke[] {
  return strokes.map((stroke, strokeIndex) => ({
    ...stroke,
    id: `${prefix}-${strokeIndex}-${stroke.id}`,
    points: stroke.points.map((point) => ({
      ...point,
      x: targetX + (point.x - sourceMinX) * scale,
      y: targetBaseline + (point.y - sourceBaseline) * scale,
    })),
  }));
}

export function fuseSignatureParts(
  firstName: DrawingAsset,
  lastName: DrawingAsset,
): DrawingAsset {
  const firstBounds = drawingBounds(firstName);
  const lastBounds = drawingBounds(lastName);
  if (!firstBounds || !lastBounds)
    throw new Error("Both signature name parts are required.");

  const canvasWidth = Math.max(firstName.canvasWidth, lastName.canvasWidth);
  const canvasHeight = Math.max(firstName.canvasHeight, lastName.canvasHeight);
  const targetBaseline = canvasHeight * GUIDE_LINE_RATIO;
  const targetNameHeight = canvasHeight * NAME_HEIGHT_RATIO;
  const availableWidth = canvasWidth * (1 - HORIZONTAL_INSET_RATIO * 2);
  const gap = canvasWidth * NAME_GAP_RATIO;
  const firstHeight = Math.max(1, firstBounds.maxY - firstBounds.minY);
  const lastHeight = Math.max(1, lastBounds.maxY - lastBounds.minY);
  let firstScale = targetNameHeight / firstHeight;
  let lastScale = targetNameHeight / lastHeight;
  const firstWidth = Math.max(1, firstBounds.maxX - firstBounds.minX);
  const lastWidth = Math.max(1, lastBounds.maxX - lastBounds.minX);
  const desiredWidth = firstWidth * firstScale + gap + lastWidth * lastScale;
  const fitScale = Math.min(1, availableWidth / desiredWidth);
  firstScale *= fitScale;
  lastScale *= fitScale;

  const fusedWidth = firstWidth * firstScale + gap + lastWidth * lastScale;
  const firstX = (canvasWidth - fusedWidth) / 2;
  const lastX = firstX + firstWidth * firstScale + gap;
  const firstStrokes = remapStrokes(
    firstName.strokes,
    "first-name",
    firstScale,
    firstName.canvasHeight * GUIDE_LINE_RATIO,
    targetBaseline,
    firstBounds.minX,
    firstX,
  );
  const lastStrokes = remapStrokes(
    lastName.strokes,
    "last-name",
    lastScale,
    lastName.canvasHeight * GUIDE_LINE_RATIO,
    targetBaseline,
    lastBounds.minX,
    lastX,
  );

  return {
    kind: "signature",
    strokes: [...firstStrokes, ...lastStrokes],
    canvasWidth,
    canvasHeight,
    orientation: firstName.orientation,
    renderingVersion: 1,
    finalizedHash: null,
  };
}

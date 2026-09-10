import type { DrawingAsset, StrokePoint } from "./models";

// Apple treats finger input as the configured ink width. Keep this close to a
// fine ballpoint so a thumb does not create marker-like handwriting.
export const SIGNATURE_STROKE_WIDTH = 2.25;

// A light 1 Euro filter removes slow finger tremor while keeping quick,
// intentional changes responsive. It never invents points or reshapes a
// completed signature; every output point is derived from the live touch.
export const INK_STABILIZER_MIN_CUTOFF = 2;
export const INK_STABILIZER_BETA = 0.02;
export const INK_STABILIZER_DERIVATIVE_CUTOFF = 10;

export interface StrokeStabilizerState {
  raw: StrokePoint;
  filtered: StrokePoint;
  derivativeX: number;
  derivativeY: number;
}

const smoothingAlpha = (cutoff: number, elapsedSeconds: number): number => {
  const timeConstant = 1 / (2 * Math.PI * Math.max(0.001, cutoff));
  return 1 / (1 + timeConstant / elapsedSeconds);
};

const blend = (previous: number, next: number, alpha: number): number =>
  previous + alpha * (next - previous);

export const stabilizeStrokePoint = (
  state: StrokeStabilizerState | null,
  point: StrokePoint,
): { point: StrokePoint; state: StrokeStabilizerState } => {
  if (!state) {
    const initial = { ...point };
    return {
      point: initial,
      state: {
        raw: initial,
        filtered: initial,
        derivativeX: 0,
        derivativeY: 0,
      },
    };
  }

  const elapsedSeconds = Math.min(
    0.05,
    Math.max(1 / 240, (point.t - state.raw.t) / 1000),
  );
  const derivativeAlpha = smoothingAlpha(
    INK_STABILIZER_DERIVATIVE_CUTOFF,
    elapsedSeconds,
  );
  const derivativeX = blend(
    state.derivativeX,
    (point.x - state.raw.x) / elapsedSeconds,
    derivativeAlpha,
  );
  const derivativeY = blend(
    state.derivativeY,
    (point.y - state.raw.y) / elapsedSeconds,
    derivativeAlpha,
  );
  const xAlpha = smoothingAlpha(
    INK_STABILIZER_MIN_CUTOFF + INK_STABILIZER_BETA * Math.abs(derivativeX),
    elapsedSeconds,
  );
  const yAlpha = smoothingAlpha(
    INK_STABILIZER_MIN_CUTOFF + INK_STABILIZER_BETA * Math.abs(derivativeY),
    elapsedSeconds,
  );
  const filtered = {
    ...point,
    x: blend(state.filtered.x, point.x, xAlpha),
    y: blend(state.filtered.y, point.y, yAlpha),
  };
  return {
    point: filtered,
    state: {
      raw: { ...point },
      filtered,
      derivativeX,
      derivativeY,
    },
  };
};

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export const pointToDrawingPlane = (
  x: number,
  y: number,
  layoutWidth: number,
  layoutHeight: number,
  planeWidth: number,
  planeHeight: number,
): Pick<StrokePoint, "x" | "y"> | null => {
  const scale = Math.min(
    Math.max(1, layoutWidth) / Math.max(1, planeWidth),
    Math.max(1, layoutHeight) / Math.max(1, planeHeight),
  );
  const offsetX = (layoutWidth - planeWidth * scale) / 2;
  const offsetY = (layoutHeight - planeHeight * scale) / 2;
  const renderedWidth = planeWidth * scale;
  const renderedHeight = planeHeight * scale;
  if (
    x < offsetX ||
    x > offsetX + renderedWidth ||
    y < offsetY ||
    y > offsetY + renderedHeight
  )
    return null;
  return {
    x: Math.max(0, Math.min(planeWidth, (x - offsetX) / scale)),
    y: Math.max(0, Math.min(planeHeight, (y - offsetY) / scale)),
  };
};

export const smoothPath = (points: StrokePoint[]): string => {
  if (points.length === 0) return "";
  const first = points[0];
  if (!first) return "";
  if (points.length === 1)
    return `M ${first.x.toFixed(2)} ${first.y.toFixed(2)} l 0.01 0.01`;
  let path = `M ${first.x.toFixed(2)} ${first.y.toFixed(2)}`;
  for (let index = 1; index < points.length - 1; index += 1) {
    const current = points[index];
    const next = points[index + 1];
    if (!current || !next) continue;
    const midX = (current.x + next.x) / 2;
    const midY = (current.y + next.y) / 2;
    path += ` Q ${current.x.toFixed(2)} ${current.y.toFixed(2)} ${midX.toFixed(2)} ${midY.toFixed(2)}`;
  }
  const last = points[points.length - 1];
  if (last) path += ` L ${last.x.toFixed(2)} ${last.y.toFixed(2)}`;
  return path;
};

export const drawingBounds = (asset: DrawingAsset): Bounds | null => {
  const points = asset.strokes.flatMap((stroke) => stroke.points);
  if (points.length === 0) return null;
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  return {
    minX: Math.min(...xs),
    minY: Math.min(...ys),
    maxX: Math.max(...xs),
    maxY: Math.max(...ys),
  };
};

export const paddedViewBox = (asset: DrawingAsset): string => {
  const bounds = drawingBounds(asset);
  if (!bounds) return `0 0 ${asset.canvasWidth} ${asset.canvasHeight}`;
  const width = Math.max(1, bounds.maxX - bounds.minX);
  const height = Math.max(1, bounds.maxY - bounds.minY);
  const paddingX = Math.max(28, width * 0.18);
  const paddingY = Math.max(16, height * 0.14);
  return `${(bounds.minX - paddingX).toFixed(2)} ${(bounds.minY - paddingY).toFixed(2)} ${(width + paddingX * 2).toFixed(2)} ${(height + paddingY * 2).toFixed(2)}`;
};

export const exportDimensions = (
  asset: DrawingAsset,
): { width: number; height: number } => {
  const [, , rawWidth, rawHeight] = paddedViewBox(asset).split(" ").map(Number);
  const width = Math.max(1, rawWidth ?? 1);
  const height = Math.max(1, rawHeight ?? 1);
  const longest = 1600;
  if (width >= height)
    return {
      width: longest,
      height: Math.max(128, Math.round((height / width) * longest)),
    };
  return {
    width: Math.max(128, Math.round((width / height) * longest)),
    height: longest,
  };
};

export const serializeSvg = (
  asset: DrawingAsset,
  background: "transparent" | "white" = "transparent",
): string => {
  const viewBox = paddedViewBox(asset);
  const paths = asset.strokes
    .map(
      (stroke) =>
        `<path d="${smoothPath(stroke.points)}" fill="none" stroke="#102733" stroke-width="${SIGNATURE_STROKE_WIDTH}" stroke-linecap="round" stroke-linejoin="round"/>`,
    )
    .join("");
  const [x, y, width, height] = viewBox.split(" ");
  const backgroundRect =
    background === "white"
      ? `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="#fff"/>`
      : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${backgroundRect}${paths}</svg>`;
};

export const normalizedDrawing = (asset: DrawingAsset): string =>
  JSON.stringify({
    renderingVersion: asset.renderingVersion,
    kind: asset.kind,
    strokes: asset.strokes.map((stroke) =>
      stroke.points.map((point) => [
        Number((point.x / asset.canvasWidth).toFixed(5)),
        Number((point.y / asset.canvasHeight).toFixed(5)),
        Number((point.t / 1000).toFixed(3)),
        point.pressure,
      ]),
    ),
  });

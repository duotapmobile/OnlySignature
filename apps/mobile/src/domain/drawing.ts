import type { DrawingAsset, StrokePoint } from "./models";

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
  const padding = Math.max(16, Math.max(width, height) * 0.08);
  return `${(bounds.minX - padding).toFixed(2)} ${(bounds.minY - padding).toFixed(2)} ${(width + padding * 2).toFixed(2)} ${(height + padding * 2).toFixed(2)}`;
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
        `<path d="${smoothPath(stroke.points)}" fill="none" stroke="#102733" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`,
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

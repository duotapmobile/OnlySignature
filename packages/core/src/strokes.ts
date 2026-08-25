import type { DrawingSnapshot, StrokePoint } from "./types";

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export function hasVisibleDrawing(
  drawing: DrawingSnapshot | null,
): drawing is DrawingSnapshot {
  return Boolean(drawing?.strokes.some((stroke) => stroke.points.length > 0));
}

export function normalizedPoints(
  drawing: DrawingSnapshot,
): readonly (readonly StrokePoint[])[] {
  if (drawing.width <= 0 || drawing.height <= 0)
    throw new Error("Canvas dimensions must be positive");
  return drawing.strokes.map((stroke) =>
    stroke.points.map((point) => ({
      x: clamp(point.x / drawing.width),
      y: clamp(point.y / drawing.height),
      t: Math.max(0, Math.round(point.t)),
      ...(typeof point.pressure === "number"
        ? { pressure: clamp(point.pressure) }
        : {}),
    })),
  );
}

function clamp(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function visibleBounds(drawing: DrawingSnapshot): Bounds | null {
  const points = drawing.strokes.flatMap((stroke) => stroke.points);
  if (points.length === 0) return null;
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return {
    minX,
    minY,
    maxX,
    maxY,
    width: Math.max(1, maxX - minX),
    height: Math.max(1, maxY - minY),
  };
}

export function paddedBounds(
  drawing: DrawingSnapshot,
  paddingRatio = 0.12,
): Bounds | null {
  const bounds = visibleBounds(drawing);
  if (!bounds) return null;
  const basis = Math.max(bounds.width, bounds.height);
  const padding = Math.max(8, basis * paddingRatio);
  const minX = Math.max(0, bounds.minX - padding);
  const minY = Math.max(0, bounds.minY - padding);
  const maxX = Math.min(drawing.width, bounds.maxX + padding);
  const maxY = Math.min(drawing.height, bounds.maxY + padding);
  return {
    minX,
    minY,
    maxX,
    maxY,
    width: Math.max(1, maxX - minX),
    height: Math.max(1, maxY - minY),
  };
}

export function stableDrawingPayload(drawing: DrawingSnapshot): string {
  return JSON.stringify({
    renderingVersion: drawing.renderingVersion,
    strokes: normalizedPoints(drawing),
  });
}

export function fnv1aHash(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return `fnv1a-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

export function drawingHash(drawing: DrawingSnapshot): string {
  return fnv1aHash(stableDrawingPayload(drawing));
}

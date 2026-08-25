import { paddedBounds } from "./strokes";
import type { DrawingSnapshot } from "./types";

export interface RasterOptions {
  maxWidth?: number;
  maxHeight?: number;
  strokeWidth?: number;
  background: "transparent" | "white";
}

export interface RasterImage {
  width: number;
  height: number;
  data: Uint8Array;
}

export function rasterizeDrawing(
  drawing: DrawingSnapshot,
  options: RasterOptions,
): RasterImage {
  const bounds = paddedBounds(drawing);
  if (!bounds) throw new Error("Cannot export an empty drawing");
  const maxWidth = options.maxWidth ?? 1800;
  const maxHeight = options.maxHeight ?? 900;
  const scale = Math.min(maxWidth / bounds.width, maxHeight / bounds.height);
  const width = Math.max(1, Math.ceil(bounds.width * scale));
  const height = Math.max(1, Math.ceil(bounds.height * scale));
  const data = new Uint8Array(width * height * 4);
  if (options.background === "white") {
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = 255;
    }
  }
  const radius = Math.max(
    1.5,
    ((options.strokeWidth ?? Math.max(2.6, drawing.height * 0.018)) * scale) /
      2,
  );
  for (const stroke of drawing.strokes) {
    for (let index = 0; index < stroke.points.length; index += 1) {
      const point = stroke.points[index];
      if (!point) continue;
      const x = (point.x - bounds.minX) * scale;
      const y = (point.y - bounds.minY) * scale;
      const previous = stroke.points[index - 1];
      if (!previous)
        drawDisc(data, width, height, x, y, radius, options.background);
      else {
        const px = (previous.x - bounds.minX) * scale;
        const py = (previous.y - bounds.minY) * scale;
        const distance = Math.hypot(x - px, y - py);
        const steps = Math.max(
          1,
          Math.ceil(distance / Math.max(0.75, radius * 0.45)),
        );
        for (let step = 0; step <= steps; step += 1) {
          const ratio = step / steps;
          drawDisc(
            data,
            width,
            height,
            px + (x - px) * ratio,
            py + (y - py) * ratio,
            radius,
            options.background,
          );
        }
      }
    }
  }
  return { width, height, data };
}

function drawDisc(
  data: Uint8Array,
  width: number,
  height: number,
  cx: number,
  cy: number,
  radius: number,
  background: "transparent" | "white",
): void {
  const minX = Math.max(0, Math.floor(cx - radius - 1));
  const maxX = Math.min(width - 1, Math.ceil(cx + radius + 1));
  const minY = Math.max(0, Math.floor(cy - radius - 1));
  const maxY = Math.min(height - 1, Math.ceil(cy + radius + 1));
  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const distance = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
      const coverage = Math.max(0, Math.min(1, radius + 0.75 - distance));
      if (coverage <= 0) continue;
      const offset = (y * width + x) * 4;
      const existingAlpha = data[offset + 3] ?? 0;
      const inkAlpha = Math.round(coverage * 255);
      if (background === "white") {
        const gray = Math.round(255 * (1 - coverage));
        data[offset] = Math.min(data[offset] ?? 255, gray);
        data[offset + 1] = Math.min(data[offset + 1] ?? 255, gray);
        data[offset + 2] = Math.min(data[offset + 2] ?? 255, gray);
        data[offset + 3] = 255;
      } else {
        const combined =
          255 - Math.round(((255 - existingAlpha) * (255 - inkAlpha)) / 255);
        data[offset] = 16;
        data[offset + 1] = 42;
        data[offset + 2] = 58;
        data[offset + 3] = combined;
      }
    }
  }
}

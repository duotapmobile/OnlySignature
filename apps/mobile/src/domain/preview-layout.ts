import { drawingBounds, SIGNATURE_STROKE_WIDTH } from "./drawing";
import type { DrawingAsset } from "./models";

// Fit fictional raster artwork to a guide without cropping its descenders.
// The source baseline is an artwork measurement, not a touch-coordinate offset.
export function sampleBaselinePresentation(
  width: number,
  height: number,
  sourceAspectRatio: number,
  sourceBaselineRatio: number,
  targetBaselineRatio: number,
) {
  if (
    ![
      width,
      height,
      sourceAspectRatio,
      sourceBaselineRatio,
      targetBaselineRatio,
    ].every(Number.isFinite) ||
    width <= 0 ||
    height <= 0 ||
    sourceAspectRatio <= 0 ||
    sourceBaselineRatio <= 0 ||
    sourceBaselineRatio >= 1
  ) {
    return null;
  }
  const baseline = height * Math.min(0.95, Math.max(0.1, targetBaselineRatio));
  const renderedHeight = Math.min(
    height,
    width / sourceAspectRatio,
    baseline / sourceBaselineRatio,
    (height - baseline) / (1 - sourceBaselineRatio),
  );
  const renderedWidth = renderedHeight * sourceAspectRatio;
  return {
    width: renderedWidth,
    height: renderedHeight,
    x: (width - renderedWidth) / 2,
    y: baseline - sourceBaselineRatio * renderedHeight,
  };
}

// Presentation only: keep the guide line from capture and preserve descenders.
// This transform never rewrites stored strokes or changes exported files.
export function baselinePreviewTransform(
  asset: DrawingAsset,
  width: number,
  height: number,
  baselineRatio: number,
) {
  const bounds = drawingBounds(asset);
  if (!bounds || width <= 0 || height <= 0) return null;
  const baseline = asset.canvasHeight * 0.69;
  const targetBaseline = height * Math.min(0.95, Math.max(0.1, baselineRatio));
  const inkWidth = Math.max(1, bounds.maxX - bounds.minX);
  const padding = Math.max(SIGNATURE_STROKE_WIDTH, inkWidth * 0.025);
  const above = Math.max(1, baseline - bounds.minY + padding);
  const below = Math.max(1, bounds.maxY - baseline + padding);
  const scale = Math.min(
    width / (inkWidth + padding * 2),
    targetBaseline / above,
    (height - targetBaseline) / below,
  );
  return {
    scale,
    x: (width - inkWidth * scale) / 2 - bounds.minX * scale,
    y: targetBaseline - baseline * scale,
  };
}

import { useState } from "react";
import { StyleSheet, View, type ViewStyle, type StyleProp } from "react-native";
import Svg, { G, Path } from "react-native-svg";
import { SampleDrawing, sampleSourceFor } from "./SampleDrawing";
import {
  paddedViewBox,
  SIGNATURE_STROKE_WIDTH,
  smoothPath,
} from "@/domain/drawing";
import type { DrawingAsset } from "@/domain/models";
import { theme } from "@/integrations/workspace";
import { baselinePreviewTransform } from "@/domain/preview-layout";

export function DrawingPreview({
  asset,
  color = "#102733",
  accessibilityLabel,
  style,
  align = "center",
  baselineRatio = 0.82,
}: {
  asset: DrawingAsset;
  color?: string;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  align?: "center" | "baseline";
  baselineRatio?: number;
}) {
  const label =
    accessibilityLabel ??
    `${asset.kind === "signature" ? "Signature" : "Initials"} preview`;
  const sampleSource = sampleSourceFor(asset);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const transform =
    align === "baseline"
      ? baselinePreviewTransform(asset, size.width, size.height, baselineRatio)
      : null;

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={label}
      style={[styles.container, style]}
      onLayout={({ nativeEvent }) => setSize(nativeEvent.layout)}
    >
      {sampleSource ? (
        <SampleDrawing
          asset={asset}
          accessibilityLabel={label}
          align={align}
          baselineRatio={baselineRatio}
          style={styles.sample}
        />
      ) : (
        <Svg
          width="100%"
          height="100%"
          viewBox={
            transform
              ? `0 0 ${size.width} ${size.height}`
              : paddedViewBox(asset)
          }
          preserveAspectRatio="xMidYMid meet"
        >
          <G
            transform={
              transform
                ? `translate(${transform.x} ${transform.y}) scale(${transform.scale})`
                : undefined
            }
          >
            {asset.strokes.map((stroke) => (
              <Path
                key={stroke.id}
                d={smoothPath(stroke.points)}
                fill="none"
                stroke={color}
                strokeWidth={SIGNATURE_STROKE_WIDTH}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </G>
        </Svg>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 0,
    minWidth: 0,
    overflow: "visible",
    borderRadius: theme.radii.sm,
  },
  sample: { width: "100%", height: "100%" },
});

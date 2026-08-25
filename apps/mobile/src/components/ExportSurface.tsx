import { forwardRef, type ComponentRef } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import type { DrawingAsset } from "@/domain/models";
import { exportDimensions, paddedViewBox, smoothPath } from "@/domain/drawing";

export const ExportSurface = forwardRef<
  ComponentRef<typeof View>,
  { asset: DrawingAsset; white: boolean }
>(function ExportSurface({ asset, white }, ref) {
  const dimensions = exportDimensions(asset);
  return (
    <View
      ref={ref}
      collapsable={false}
      style={[styles.surface, dimensions, white && styles.white]}
    >
      <Svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox={paddedViewBox(asset)}
        preserveAspectRatio="xMidYMid meet"
      >
        {asset.strokes.map((stroke) => (
          <Path
            key={stroke.id}
            d={smoothPath(stroke.points)}
            fill="none"
            stroke="#102733"
            strokeWidth={6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </Svg>
    </View>
  );
});

const styles = StyleSheet.create({
  surface: {
    position: "absolute",
    left: -5000,
    top: 0,
    backgroundColor: "transparent",
    pointerEvents: "none",
  },
  white: { backgroundColor: "#FFFFFF" },
});

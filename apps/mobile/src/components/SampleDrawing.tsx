import { useState } from "react";
import {
  Image,
  View,
  type ColorValue,
  type ViewStyle,
  type StyleProp,
} from "react-native";
import type { DrawingAsset } from "@/domain/models";
import { sampleBaselinePresentation } from "@/domain/preview-layout";

const signatureSource = require("../../assets/samples/taylor-brooks-signature-clean.png");
const initialsSource = require("../../assets/samples/taylor-brooks-initials.png");

export function sampleSourceFor(asset: DrawingAsset) {
  const firstStrokeId = asset.strokes[0]?.id ?? "";
  if (firstStrokeId.startsWith("fixture-signature-")) return signatureSource;
  if (firstStrokeId.startsWith("fixture-initials-")) return initialsSource;
  return null;
}

export function SampleDrawing({
  asset,
  style,
  accessibilityLabel,
  align = "center",
  baselineRatio = 0.82,
  tintColor,
}: {
  asset: DrawingAsset;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel: string;
  align?: "center" | "baseline";
  baselineRatio?: number;
  tintColor?: ColorValue;
}) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const source = sampleSourceFor(asset);
  if (!source) return null;
  const sourceAspectRatio =
    asset.kind === "signature" ? 2172 / 724 : 1274 / 639;
  const rect = sampleBaselinePresentation(
    size.width,
    size.height,
    sourceAspectRatio,
    asset.kind === "signature" ? 0.62 : 0.83,
    baselineRatio,
  );
  const imageFrame =
    align === "baseline"
      ? rect
      : size.width > 0 && size.height > 0
        ? { x: 0, y: 0, width: size.width, height: size.height }
        : null;
  return (
    <View
      testID="sample-drawing-frame"
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      onLayout={({ nativeEvent }) => setSize(nativeEvent.layout)}
      pointerEvents="none"
      style={style}
    >
      {imageFrame ? (
        <Image
          testID="sample-drawing-image"
          source={source}
          accessible={false}
          resizeMode="contain"
          style={[
            {
              position: "absolute",
              left: imageFrame.x,
              top: imageFrame.y,
              width: imageFrame.width,
              height: imageFrame.height,
            },
            tintColor ? { tintColor } : null,
          ]}
        />
      ) : null}
    </View>
  );
}

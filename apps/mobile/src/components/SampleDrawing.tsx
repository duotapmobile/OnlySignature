import { Image, type ImageStyle, type StyleProp } from "react-native";
import type { DrawingAsset } from "@/domain/models";

const signatureSource = require("../../assets/samples/taylor-brooks-signature.png");
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
}: {
  asset: DrawingAsset;
  style?: StyleProp<ImageStyle>;
  accessibilityLabel: string;
}) {
  const source = sampleSourceFor(asset);
  if (!source) return null;
  return (
    <Image
      source={source}
      accessibilityLabel={accessibilityLabel}
      resizeMode="contain"
      style={style}
    />
  );
}

import { StyleSheet, View, type ViewStyle, type StyleProp } from "react-native";
import Svg, { Path } from "react-native-svg";
import { paddedViewBox, smoothPath } from "@/domain/drawing";
import type { DrawingAsset } from "@/domain/models";
import { theme } from "@/integrations/workspace";

export function DrawingPreview({
  asset,
  color = "#102733",
  accessibilityLabel,
  style,
}: {
  asset: DrawingAsset;
  color?: string;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={
        accessibilityLabel ??
        `${asset.kind === "signature" ? "Signature" : "Initials"} preview`
      }
      style={[styles.container, style]}
    >
      <Svg
        width="100%"
        height="100%"
        viewBox={paddedViewBox(asset)}
        preserveAspectRatio="xMidYMid meet"
      >
        {asset.strokes.map((stroke) => (
          <Path
            key={stroke.id}
            d={smoothPath(stroke.points)}
            fill="none"
            stroke={color}
            strokeWidth={6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 72,
    minWidth: 100,
    overflow: "hidden",
    borderRadius: theme.radii.sm,
  },
});

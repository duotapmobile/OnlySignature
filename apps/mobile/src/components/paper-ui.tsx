import type { PropsWithChildren } from "react";
import {
  ImageBackground,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Svg, { Path } from "react-native-svg";

const paperTexture = require("../../assets/brand/warm-paper-texture.png");

export function AppBackdrop({
  children,
  style,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return (
    <View style={[styles.fill, styles.backdrop, style]}>
      <View pointerEvents="none" style={styles.inkGlow} />
      <View pointerEvents="none" style={styles.goldGlow} />
      {children}
    </View>
  );
}

export function PaperSurface({
  children,
  style,
  folded = false,
}: PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  folded?: boolean;
}>) {
  return (
    <ImageBackground
      source={paperTexture}
      resizeMode="repeat"
      style={[styles.paper, style]}
      imageStyle={styles.paperImage}
    >
      <View pointerEvents="none" style={styles.paperGlow} />
      {folded ? <PaperFold /> : null}
      {children}
    </ImageBackground>
  );
}

export function PaperFold() {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={styles.fold}
    >
      <Svg width="100%" height="100%" viewBox="0 0 120 120">
        <Path d="M0 0h120L0 120Z" fill="#E3E5E1" />
        <Path d="M0 0v120L42 38Z" fill="#FDFCF8" />
        <Path
          d="M0 120 42 38 120 0"
          fill="none"
          stroke="rgba(7,31,90,0.12)"
          strokeWidth="1.5"
        />
        <Path
          d="M6 112C33 91 44 63 42 38"
          fill="none"
          stroke="rgba(0,0,0,0.08)"
          strokeWidth="5"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  backdrop: {
    overflow: "hidden",
    backgroundColor: "#02040A",
  },
  inkGlow: {
    position: "absolute",
    width: 520,
    height: 520,
    left: -310,
    top: 80,
    borderRadius: 260,
    backgroundColor: "rgba(7,31,90,0.42)",
  },
  goldGlow: {
    position: "absolute",
    width: 360,
    height: 360,
    right: -260,
    bottom: -120,
    borderRadius: 180,
    backgroundColor: "rgba(216,182,106,0.08)",
  },
  paper: {
    overflow: "hidden",
    backgroundColor: "#F8F6EF",
    borderCurve: "continuous",
  },
  paperImage: { opacity: 0.86 },
  paperGlow: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  fold: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 118,
    height: 118,
    zIndex: 4,
  },
});

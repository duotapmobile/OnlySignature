import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const wordmarkSource = require("../../assets/brand/only-signature-wordmark.png");
const signatureSource = require("../../assets/samples/taylor-brooks-signature.png");

export const openingDurationMs = 2_200;
export const returningOpeningDurationMs = 650;

export function AnimatedOpening({
  onFinished,
  previewFrame = false,
  compact = false,
}: {
  onFinished(): void;
  previewFrame?: boolean;
  compact?: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(previewFrame ? 0.9 : 0);
  const [skipReady, setSkipReady] = useState(false);
  const finishedRef = useRef(false);
  const finish = useMemo(
    () => () => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      onFinished();
    },
    [onFinished],
  );

  useEffect(() => {
    if (previewFrame) return;
    const skipTimer = setTimeout(() => setSkipReady(true), 300);
    const duration = reducedMotion
      ? 250
      : compact
        ? returningOpeningDurationMs
        : openingDurationMs;
    progress.value = withTiming(
      1,
      { duration, easing: Easing.bezier(0.2, 0.78, 0.18, 1) },
      (finished) => {
        if (finished) runOnJS(finish)();
      },
    );
    return () => clearTimeout(skipTimer);
  }, [compact, finish, previewFrame, progress, reducedMotion]);

  const paperStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.08, 1], [0, 1, 1]),
    transform: reducedMotion
      ? []
      : [
          {
            translateY: interpolate(
              progress.value,
              [0, compact ? 0.48 : 0.25, 1],
              [-180, 0, 0],
            ),
          },
          {
            rotate: `${interpolate(progress.value, [0, 0.28, 1], [-7, -1.5, -1.5])}deg`,
          },
        ],
  }));
  const panelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.12, 0.38, 1], [0, 0, 1, 1]),
    transform: reducedMotion
      ? []
      : [
          {
            translateX: interpolate(
              progress.value,
              [0, 0.12, 0.4, 1],
              [120, 120, 0, 0],
            ),
          },
        ],
  }));
  const wordmarkStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.3, 0.52, 1], [0, 0, 1, 1]),
    transform: reducedMotion
      ? []
      : [
          {
            translateY: interpolate(
              progress.value,
              [0, 0.3, 0.52, 1],
              [-10, -10, 0, 0],
            ),
          },
        ],
  }));
  const copyStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.4, 0.64, 1], [0, 0, 1, 1]),
    transform: reducedMotion
      ? []
      : [
          {
            translateY: interpolate(
              progress.value,
              [0, 0.4, 0.64, 1],
              [22, 22, 0, 0],
            ),
          },
        ],
  }));
  const lineStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.5, 0.66, 1], [0, 0, 1, 1]),
    transform: reducedMotion
      ? []
      : [
          {
            scaleX: interpolate(
              progress.value,
              [0, 0.5, 0.78, 1],
              [0.03, 0.03, 1, 1],
            ),
          },
        ],
  }));
  const signatureStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.58, 0.82, 1], [0, 0, 1, 1]),
    transform: reducedMotion
      ? []
      : [
          {
            scaleX: interpolate(
              progress.value,
              [0, 0.58, 0.88, 1],
              [0.06, 0.06, 1, 1],
            ),
          },
        ],
  }));
  const footerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.7, 0.92, 1], [0, 0, 1, 1]),
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Only Signature animated opening. Tap to continue."
      onPress={() => {
        if (skipReady || previewFrame) finish();
      }}
      style={styles.fill}
      testID="opening-splash-screen"
    >
      <View style={styles.opening}>
        <View accessibilityElementsHidden style={styles.blueGlow} />
        <View accessibilityElementsHidden style={styles.goldGlow} />
        <Animated.View
          testID="opening-paper"
          style={[styles.paperSheet, paperStyle]}
        >
          <View style={styles.paperFold} />
        </Animated.View>
        <Animated.View
          testID="opening-ink-card"
          style={[styles.inkPanel, panelStyle]}
        >
          <View accessibilityElementsHidden style={styles.edgeHighlight} />
          <Animated.Image
            testID="opening-wordmark"
            source={wordmarkSource}
            accessibilityLabel="Only Signature"
            resizeMode="contain"
            style={[styles.wordmark, wordmarkStyle]}
          />
          {!compact ? (
            <Animated.View
              testID="opening-copy"
              style={[styles.copy, copyStyle]}
            >
              <Text style={styles.sign}>Sign.</Text>
              <Text style={styles.headline}>Without the sign-up.</Text>
              <Text style={styles.subhead}>
                Your signing set is coming together.
              </Text>
            </Animated.View>
          ) : null}
          <View style={styles.signatureStage}>
            <Animated.Image
              testID="opening-signature"
              source={signatureSource}
              accessibilityLabel="Sample signature"
              resizeMode="contain"
              style={[styles.signature, signatureStyle]}
            />
            <Animated.View
              testID="opening-line"
              style={[styles.signatureLine, lineStyle]}
            />
          </View>
        </Animated.View>
        <Animated.View
          testID="opening-footer"
          style={[styles.footer, footerStyle]}
        >
          <View style={styles.goldDot} />
          <Text style={styles.footerText}>
            Private by design. Ready when you are.
          </Text>
        </Animated.View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: "#02040A" },
  opening: {
    flex: 1,
    backgroundColor: "#02040A",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 14,
    overflow: "hidden",
  },
  blueGlow: {
    position: "absolute",
    width: 540,
    height: 540,
    borderRadius: 270,
    left: -330,
    top: 70,
    backgroundColor: "rgba(10,61,120,0.48)",
  },
  goldGlow: {
    position: "absolute",
    width: 360,
    height: 360,
    borderRadius: 180,
    right: -240,
    bottom: -60,
    backgroundColor: "rgba(216,182,106,0.13)",
  },
  paperSheet: {
    position: "absolute",
    left: 18,
    right: 18,
    top: 26,
    bottom: 54,
    borderRadius: 42,
    backgroundColor: "#F8F6EF",
    borderWidth: 1,
    borderColor: "rgba(216,182,106,0.76)",
    boxShadow: "0 34px 76px rgba(0,0,0,0.58)",
  },
  paperFold: {
    width: 92,
    height: 92,
    borderTopLeftRadius: 42,
    borderBottomRightRadius: 60,
    backgroundColor: "rgba(216,182,106,0.12)",
  },
  inkPanel: {
    flex: 1,
    marginTop: 10,
    marginBottom: 64,
    borderRadius: 42,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: "rgba(216,182,106,0.72)",
    backgroundColor: "#0A3D78",
    paddingHorizontal: 28,
    paddingTop: 22,
    paddingBottom: 30,
    overflow: "hidden",
    boxShadow: "0 34px 76px rgba(0,0,0,0.68)",
  },
  edgeHighlight: {
    position: "absolute",
    left: 32,
    right: 32,
    top: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.38)",
  },
  wordmark: { width: 148, height: 62, alignSelf: "flex-end" },
  copy: { marginTop: "18%" },
  sign: {
    color: "#F8F6EF",
    fontFamily: "Georgia",
    fontSize: 60,
    lineHeight: 66,
    fontWeight: "700",
    letterSpacing: -2.2,
  },
  headline: {
    color: "#F8F6EF",
    fontSize: 29,
    lineHeight: 35,
    fontWeight: "800",
    letterSpacing: -0.8,
    marginTop: 6,
  },
  subhead: {
    color: "rgba(248,246,239,0.86)",
    fontSize: 17,
    lineHeight: 24,
    marginTop: 12,
  },
  signatureStage: {
    height: 132,
    marginTop: "auto",
    justifyContent: "flex-end",
  },
  signature: {
    width: "96%",
    height: 104,
    alignSelf: "center",
    tintColor: "#F8F6EF",
    zIndex: 2,
    transformOrigin: "left center",
  },
  signatureLine: {
    height: 1.5,
    marginHorizontal: 8,
    marginTop: -14,
    backgroundColor: "#D8B66A",
    transformOrigin: "left center",
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 22,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 9,
  },
  goldDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#D8B66A" },
  footerText: { color: "#F8F6EF", fontSize: 14, lineHeight: 20 },
});

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const wordmarkSource = require("../../assets/brand/only-signature-wordmark.png");
const signatureSource = require("../../assets/samples/taylor-brooks-signature.png");

export const openingDurationMs = 3_400;

export function AnimatedOpening({
  onFinished,
  previewFrame = false,
}: {
  onFinished(): void;
  previewFrame?: boolean;
}) {
  const [progress] = useState(
    () => new Animated.Value(previewFrame ? 0.88 : 0),
  );
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
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (!mounted) return;
      Animated.timing(progress, {
        toValue: 1,
        delay: reduceMotion ? 0 : 140,
        duration: reduceMotion ? 480 : openingDurationMs,
        easing: reduceMotion
          ? Easing.linear
          : Easing.bezier(0.18, 0.78, 0.2, 1),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished && mounted) finish();
      });
    });
    return () => {
      mounted = false;
      progress.stopAnimation();
    };
  }, [finish, previewFrame, progress]);

  const paperStyle = {
    opacity: progress.interpolate({
      inputRange: [0, 0.08, 1],
      outputRange: [0, 1, 1],
    }),
    transform: [
      {
        translateY: progress.interpolate({
          inputRange: [0, 0.3, 1],
          outputRange: [-230, 0, 0],
        }),
      },
      {
        rotate: progress.interpolate({
          inputRange: [0, 0.3, 1],
          outputRange: ["-11deg", "-3deg", "-3deg"],
        }),
      },
    ],
  };
  const inkStyle = {
    opacity: progress.interpolate({
      inputRange: [0, 0.12, 0.42, 1],
      outputRange: [0, 0, 1, 1],
    }),
    transform: [
      {
        translateX: progress.interpolate({
          inputRange: [0, 0.12, 0.42, 1],
          outputRange: [180, 180, 0, 0],
        }),
      },
      {
        rotate: progress.interpolate({
          inputRange: [0, 0.42, 1],
          outputRange: ["5deg", "0deg", "0deg"],
        }),
      },
    ],
  };
  const wordmarkStyle = {
    opacity: progress.interpolate({
      inputRange: [0, 0.38, 0.57, 1],
      outputRange: [0, 0, 1, 1],
    }),
    transform: [
      {
        translateY: progress.interpolate({
          inputRange: [0, 0.38, 0.57, 1],
          outputRange: [-10, -10, 0, 0],
        }),
      },
    ],
  };
  const copyStyle = {
    opacity: progress.interpolate({
      inputRange: [0, 0.44, 0.68, 1],
      outputRange: [0, 0, 1, 1],
    }),
    transform: [
      {
        translateY: progress.interpolate({
          inputRange: [0, 0.44, 0.68, 1],
          outputRange: [24, 24, 0, 0],
        }),
      },
    ],
  };
  const lineStyle = {
    opacity: progress.interpolate({
      inputRange: [0, 0.55, 0.68, 1],
      outputRange: [0, 0, 1, 1],
    }),
    transform: [
      {
        scaleX: progress.interpolate({
          inputRange: [0, 0.55, 0.82, 1],
          outputRange: [0.02, 0.02, 1, 1],
        }),
      },
    ],
  };
  const signatureStyle = {
    opacity: progress.interpolate({
      inputRange: [0, 0.64, 0.88, 1],
      outputRange: [0, 0, 1, 1],
    }),
    transform: [
      {
        translateY: progress.interpolate({
          inputRange: [0, 0.64, 0.88, 1],
          outputRange: [9, 9, 0, 0],
        }),
      },
      {
        scaleX: progress.interpolate({
          inputRange: [0, 0.64, 0.88, 1],
          outputRange: [0.18, 0.18, 1, 1],
        }),
      },
    ],
  };
  const footerStyle = {
    opacity: progress.interpolate({
      inputRange: [0, 0.76, 0.96, 1],
      outputRange: [0, 0, 1, 1],
    }),
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Only Signature animated opening. Tap to continue."
      onPress={finish}
      style={styles.fill}
      testID="opening-splash-screen"
    >
      <View style={styles.opening}>
        <View accessibilityElementsHidden style={styles.blueGlow} />
        <View accessibilityElementsHidden style={styles.goldGlow} />
        <Animated.View
          testID="opening-paper"
          style={[
            styles.paperSheet,
            previewFrame ? styles.previewPaper : paperStyle,
          ]}
        />
        <Animated.View
          testID="opening-ink-card"
          style={[styles.inkCard, previewFrame ? styles.previewInk : inkStyle]}
        >
          <View accessibilityElementsHidden style={styles.cardHighlight} />
          <Animated.Image
            testID="opening-wordmark"
            source={wordmarkSource}
            accessibilityLabel="Only Signature"
            resizeMode="contain"
            style={[
              styles.wordmark,
              previewFrame ? styles.previewVisible : wordmarkStyle,
            ]}
          />
          <Animated.View
            testID="opening-copy"
            style={[
              styles.copy,
              previewFrame ? styles.previewVisible : copyStyle,
            ]}
          >
            <Text style={styles.sign}>Sign.</Text>
            <Text style={styles.headline}>Without the sign-up.</Text>
            <Text style={styles.subhead}>
              Your signing set is coming together.
            </Text>
          </Animated.View>
          <View style={styles.signatureStage}>
            <Animated.Image
              testID="opening-signature"
              source={signatureSource}
              accessibilityLabel="Sample signature"
              resizeMode="contain"
              style={[
                styles.signature,
                previewFrame ? styles.previewVisible : signatureStyle,
              ]}
            />
            <Animated.View
              testID="opening-line"
              style={[
                styles.signatureLine,
                previewFrame ? styles.previewVisible : lineStyle,
              ]}
            />
          </View>
        </Animated.View>
        <Animated.View
          testID="opening-footer"
          style={[
            styles.footer,
            previewFrame ? styles.previewVisible : footerStyle,
          ]}
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
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
    overflow: "hidden",
  },
  blueGlow: {
    position: "absolute",
    width: 470,
    height: 470,
    borderRadius: 235,
    left: -255,
    top: 110,
    backgroundColor: "rgba(10,61,120,0.42)",
  },
  goldGlow: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    right: -175,
    bottom: 80,
    backgroundColor: "rgba(216,182,106,0.12)",
  },
  paperSheet: {
    position: "absolute",
    width: "84%",
    maxWidth: 390,
    height: "61%",
    maxHeight: 590,
    borderRadius: 34,
    backgroundColor: "#F8F6EF",
    borderWidth: 1,
    borderColor: "rgba(216,182,106,0.74)",
    boxShadow: "0 34px 76px rgba(0,0,0,0.58)",
  },
  inkCard: {
    width: "88%",
    maxWidth: 410,
    minHeight: 520,
    borderRadius: 34,
    backgroundColor: "#0A3D78",
    borderWidth: 1,
    borderColor: "rgba(216,182,106,0.72)",
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 30,
    overflow: "hidden",
    boxShadow: "0 32px 76px rgba(0,0,0,0.62)",
  },
  cardHighlight: {
    position: "absolute",
    left: 24,
    right: 24,
    top: 0,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.38)",
  },
  wordmark: { width: 132, height: 58, alignSelf: "flex-end" },
  copy: { marginTop: 76 },
  sign: {
    color: "#F8F6EF",
    fontFamily: "Georgia",
    fontSize: 58,
    lineHeight: 64,
    fontWeight: "700",
    letterSpacing: -2.1,
  },
  headline: {
    color: "#F8F6EF",
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    letterSpacing: -0.8,
    marginTop: 5,
  },
  subhead: {
    color: "rgba(248,246,239,0.84)",
    fontSize: 16,
    lineHeight: 23,
    marginTop: 11,
  },
  signatureStage: {
    height: 104,
    marginTop: "auto",
    justifyContent: "flex-end",
  },
  signature: {
    width: "94%",
    height: 78,
    alignSelf: "center",
    tintColor: "#F8F6EF",
    zIndex: 2,
  },
  signatureLine: {
    height: 1.5,
    marginHorizontal: 10,
    marginTop: -11,
    backgroundColor: "#D8B66A",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginTop: 34,
  },
  goldDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#D8B66A" },
  footerText: { color: "#F8F6EF", fontSize: 14, lineHeight: 20 },
  previewPaper: {
    opacity: 1,
    transform: [{ translateY: 0 }, { rotate: "-3deg" }],
  },
  previewInk: {
    opacity: 1,
    transform: [{ translateX: 0 }, { rotate: "0deg" }],
  },
  previewVisible: { opacity: 1 },
});

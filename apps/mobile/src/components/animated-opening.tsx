import { useEffect, useMemo, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { PaperSurface, TealTexture } from "./paper-ui";

const wordmarkSource = require("../../assets/brand/only-signature-wordmark-paper.png");
const signatureSource = require("../../assets/samples/taylor-brooks-signature.png");

export const openingDurationMs = 2_750;

export function AnimatedOpening({ onFinished }: { onFinished(): void }) {
  const [progress] = useState(() => new Animated.Value(0));
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
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (!mounted) return;
      Animated.timing(progress, {
        toValue: 1,
        duration: reduceMotion ? 280 : openingDurationMs,
        easing: reduceMotion ? Easing.linear : Easing.bezier(0.2, 0.8, 0.2, 1),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished && mounted) finish();
      });
    });
    return () => {
      mounted = false;
      progress.stopAnimation();
    };
  }, [finish, progress]);

  const paperStyle = {
    opacity: progress.interpolate({
      inputRange: [0, 0.08, 1],
      outputRange: [0, 1, 1],
    }),
    transform: [
      {
        translateY: progress.interpolate({
          inputRange: [0, 0.34, 1],
          outputRange: [-150, 0, 0],
        }),
      },
      {
        rotate: progress.interpolate({
          inputRange: [0, 0.34, 1],
          outputRange: ["-3deg", "0deg", "0deg"],
        }),
      },
    ],
  };
  const revealStyle = {
    opacity: progress.interpolate({
      inputRange: [0, 0.34, 0.58, 1],
      outputRange: [0, 0, 1, 1],
    }),
    transform: [
      {
        translateY: progress.interpolate({
          inputRange: [0, 0.34, 0.58, 1],
          outputRange: [12, 12, 0, 0],
        }),
      },
    ],
  };
  const signatureStyle = {
    opacity: progress.interpolate({
      inputRange: [0, 0.56, 0.83, 1],
      outputRange: [0, 0, 1, 1],
    }),
    transform: [
      {
        scaleX: progress.interpolate({
          inputRange: [0, 0.56, 0.83, 1],
          outputRange: [0.18, 0.18, 1, 1],
        }),
      },
    ],
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Only Signature animated opening. Tap to continue."
      onPress={finish}
      style={styles.fill}
      testID="opening-splash-screen"
    >
      <TealTexture style={styles.opening}>
        <Animated.View style={[styles.paperWrap, paperStyle]}>
          <PaperSurface folded style={styles.paper}>
            <Image
              source={wordmarkSource}
              accessibilityLabel="Only Signature"
              resizeMode="contain"
              style={styles.wordmark}
            />
            <Animated.View style={[styles.message, revealStyle]}>
              <Text style={styles.sign}>Sign.</Text>
              <Text style={styles.headline}>Without the sign-up.</Text>
              <Text style={styles.subhead}>
                Your signature. Your initials. Yours to keep.
              </Text>
            </Animated.View>
            <Animated.View style={[styles.signatureStage, signatureStyle]}>
              <Image
                source={signatureSource}
                accessibilityLabel="Sample signature"
                resizeMode="contain"
                style={styles.signature}
              />
              <View style={styles.signatureLine} />
            </Animated.View>
          </PaperSurface>
        </Animated.View>
        <Animated.Text style={[styles.privateLine, revealStyle]}>
          Private by design. Ready when you are.
        </Animated.Text>
      </TealTexture>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  opening: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 46,
  },
  paperWrap: { width: "100%", maxWidth: 430 },
  paper: {
    minHeight: 500,
    borderRadius: 22,
    paddingHorizontal: 30,
    paddingTop: 28,
    paddingBottom: 32,
    boxShadow: "0 30px 70px rgba(0, 27, 32, 0.48)",
  },
  wordmark: {
    width: 126,
    height: 54,
    alignSelf: "flex-end",
    zIndex: 6,
  },
  message: { marginTop: 92 },
  sign: {
    color: "#071F5A",
    fontFamily: "Georgia",
    fontSize: 60,
    lineHeight: 66,
    fontWeight: "700",
    letterSpacing: -2.2,
  },
  headline: {
    color: "#071F5A",
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "800",
    letterSpacing: -0.8,
  },
  subhead: {
    color: "#183B67",
    fontSize: 17,
    lineHeight: 24,
    marginTop: 12,
    maxWidth: 290,
  },
  signatureStage: {
    height: 112,
    marginTop: "auto",
    justifyContent: "flex-end",
    transformOrigin: "left center",
  },
  signature: { width: "90%", height: 82, alignSelf: "center", zIndex: 2 },
  signatureLine: {
    height: 1,
    marginHorizontal: 12,
    marginTop: -13,
    backgroundColor: "rgba(7,31,90,0.55)",
  },
  privateLine: {
    color: "#F8F6EF",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 22,
    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});

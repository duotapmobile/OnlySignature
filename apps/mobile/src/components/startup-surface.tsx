import { useEffect, useRef } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LoadingMark } from "./feedback-ui";
import { flowColors, flowShadows } from "./flow-ui";

const wordmark = require("../../assets/brand/only-signature-wordmark.png");
const launchAssets = [
  wordmark,
  require("../../assets/brand/warm-paper-texture.png"),
  require("../../assets/samples/taylor-brooks-signature-clean.png"),
  require("../../assets/samples/taylor-brooks-initials.png"),
];

export function LaunchAssetWarmup({
  onReady,
  onFailed,
}: {
  onReady(): void;
  onFailed(): void;
}) {
  const loaded = useRef(new Set<number>());
  const settled = useRef(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (settled.current) return;
      settled.current = true;
      onFailed();
    }, 10_000);
    return () => clearTimeout(timer);
  }, [onFailed]);

  return (
    <View
      testID="launch-asset-warmup"
      pointerEvents="none"
      accessibilityElementsHidden
      aria-hidden={true}
      importantForAccessibility="no-hide-descendants"
      style={styles.warmup}
    >
      {launchAssets.map((source, index) => (
        <Image
          key={index}
          source={source}
          testID={`launch-asset-${index}`}
          accessible={false}
          style={styles.warmupImage}
          onLoad={() => {
            if (settled.current) return;
            loaded.current.add(index);
            if (loaded.current.size === launchAssets.length) {
              settled.current = true;
              onReady();
            }
          }}
          onError={() => {
            if (settled.current) return;
            settled.current = true;
            onFailed();
          }}
        />
      ))}
    </View>
  );
}

export function StartupSurface({
  message,
  assetFallback = false,
  onLayout,
}: {
  message: string | null;
  assetFallback?: boolean;
  onLayout?: (() => void) | undefined;
}) {
  return (
    <SafeAreaView
      style={styles.fill}
      testID={message ? "startup-recovery" : "startup-loading"}
    >
      <ScrollView
        style={styles.fill}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.shadow} onLayout={onLayout}>
          <View style={styles.card}>
            <View style={styles.brand}>
              {assetFallback ? (
                <Text accessibilityRole="header" style={styles.brandText}>
                  Only Signature
                </Text>
              ) : (
                <Image
                  source={wordmark}
                  accessibilityLabel="Only Signature"
                  resizeMode="contain"
                  style={styles.wordmark}
                />
              )}
              <View pointerEvents="none" style={styles.baseline} />
            </View>
            <View style={styles.body}>
              {message ? (
                <Text
                  accessibilityRole="alert"
                  accessibilityLiveRegion="assertive"
                  selectable
                  style={styles.message}
                >
                  {message}
                </Text>
              ) : (
                <>
                  <LoadingMark />
                  <Text accessibilityLiveRegion="polite" style={styles.message}>
                    Opening your signing space
                  </Text>
                </>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: flowColors.night },
  scrollContent: { flexGrow: 1, justifyContent: "center", padding: 24 },
  shadow: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: flowColors.gold,
    boxShadow: flowShadows.panel,
  },
  card: {
    borderRadius: 23,
    overflow: "hidden",
    backgroundColor: flowColors.paper,
  },
  brand: { backgroundColor: flowColors.action, padding: 20, gap: 16 },
  wordmark: { width: 138, height: 46, alignSelf: "flex-end" },
  brandText: {
    color: flowColors.white,
    fontFamily: "Georgia",
    fontSize: 25,
    lineHeight: 31,
    fontWeight: "700",
  },
  baseline: { height: 1, backgroundColor: flowColors.gold },
  body: { padding: 20, gap: 16 },
  message: { color: flowColors.cardText, fontSize: 17, lineHeight: 25 },
  warmup: {
    position: "absolute",
    width: 1,
    height: 1,
    overflow: "hidden",
    opacity: 0,
  },
  warmupImage: { position: "absolute", width: 1, height: 1 },
});

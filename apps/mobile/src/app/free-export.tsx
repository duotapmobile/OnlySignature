import { StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { DrawingPreview } from "@/components/DrawingPreview";
import { LayoutSlot } from "@/components/layout-slot";
import {
  FlowBackButton,
  FlowHeading,
  FlowPrimaryButton,
  FlowScreen,
  FlowTextButton,
  ScriptLabel,
  flowColors,
} from "@/components/flow-ui";
import { isAuthorizedScreenshotFixture } from "@/config/screenshotFixtures";
import { hasDrawing } from "@/domain/models";
import { useTransparentPurchase } from "@/hooks/use-transparent-purchase";
import { useAppState } from "@/state/AppStateProvider";

export default function DiyWarningScreen() {
  const { activeSet } = useAppState();
  const { fixture } = useLocalSearchParams<{ fixture?: string }>();
  const screenshotFixture = isAuthorizedScreenshotFixture(fixture, [
    "both",
    "signature",
  ]);
  const purchase = useTransparentPurchase({
    suppressSuccessRedirect: screenshotFixture,
  });
  const asset = hasDrawing(activeSet.signature)
    ? activeSet.signature
    : activeSet.initials;

  return (
    <FlowScreen
      scroll={false}
      contentStyle={styles.content}
      testID="diy-warning-screen"
    >
      <View style={styles.back}>
        <FlowBackButton
          onPress={() => router.back()}
          layoutId="warning.back.icon"
        />
      </View>
      <LayoutSlot id="warning.header" style={styles.warning}>
        <ScriptLabel
          asset="before"
          style={styles.script}
          layoutId="warning.script"
        />
        <FlowHeading style={styles.headingText} layoutId="warning.title">
          Removing the background later can damage your signature.
        </FlowHeading>
      </LayoutSlot>
      <LayoutSlot id="warning.comparison" style={styles.comparison}>
        <View style={styles.labels}>
          <LayoutSlot id="warning.original.label" style={styles.labelSlot}>
            <Text selectable style={styles.label}>
              Original{"\n"}Transparent
            </Text>
          </LayoutSlot>
          <LayoutSlot id="warning.diy.label" style={styles.labelSlot}>
            <Text selectable style={styles.label}>
              DIY Removal{"\n"}Missing strokes
            </Text>
          </LayoutSlot>
        </View>
        <View style={styles.compare}>
          <LayoutSlot id="warning.original.card" style={styles.compareSlot}>
            <View style={[styles.compareCard, styles.checker]}>
              {asset ? (
                <LayoutSlot
                  id="warning.original.art"
                  style={styles.previewLayer}
                >
                  <DrawingPreview
                    asset={asset}
                    accessibilityLabel="Original transparent signature"
                    style={styles.preview}
                  />
                </LayoutSlot>
              ) : null}
            </View>
          </LayoutSlot>
          <LayoutSlot id="warning.diy.card" style={styles.compareSlot}>
            <View style={styles.compareCard}>
              {asset ? (
                <LayoutSlot id="warning.diy.art" style={styles.previewLayer}>
                  <DrawingPreview
                    asset={asset}
                    accessibilityLabel="DIY removal result with missing strokes"
                    color="#586167"
                    style={[styles.preview, styles.damaged]}
                  />
                </LayoutSlot>
              ) : null}
              <LayoutSlot
                id="warning.diy.damage-one"
                style={styles.damageLayer}
              >
                <View accessibilityElementsHidden style={styles.damageOne} />
              </LayoutSlot>
              <LayoutSlot
                id="warning.diy.damage-two"
                style={styles.damageLayer}
              >
                <View accessibilityElementsHidden style={styles.damageTwo} />
              </LayoutSlot>
            </View>
          </LayoutSlot>
        </View>
      </LayoutSlot>
      {purchase.error ? (
        <LayoutSlot id="warning.error">
          <Text accessibilityRole="alert" selectable style={styles.error}>
            {purchase.error}
          </Text>
        </LayoutSlot>
      ) : null}
      <LayoutSlot id="warning.actions" style={styles.actions}>
        <FlowPrimaryButton
          label={`Unlock Transparent Set - ${purchase.displayPrice}`}
          onPress={() => void purchase.beginPurchase()}
          disabled={purchase.busy || purchase.transparentUnavailable}
          layoutId="warning.primary.button"
          labelLayoutId="warning.primary.label"
        />
        <FlowTextButton
          label="No Thanks, Download Free White Set"
          onPress={() => router.push("/white-export" as never)}
          disabled={purchase.busy}
          layoutId="warning.secondary.button"
          labelLayoutId="warning.secondary.label"
        />
      </LayoutSlot>
    </FlowScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 18, paddingBottom: 18 },
  back: { position: "absolute", top: 8, left: 20, zIndex: 4 },
  warning: { marginTop: 34 },
  script: { width: 205, height: 36, marginLeft: 30, marginBottom: 7 },
  headingText: { fontSize: 25, lineHeight: 30 },
  comparison: { marginTop: 16 },
  labels: { flexDirection: "row", marginBottom: 8 },
  labelSlot: { flex: 1 },
  label: {
    flex: 1,
    color: flowColors.white,
    fontSize: 13,
    lineHeight: 17,
    textAlign: "center",
  },
  compare: { flexDirection: "row", gap: 12 },
  compareSlot: { flex: 1 },
  compareCard: {
    flex: 1,
    height: 188,
    borderRadius: 16,
    backgroundColor: "#FFF",
    overflow: "hidden",
    boxShadow: "0 16px 30px rgba(0, 0, 0, 0.34)",
    alignItems: "center",
    justifyContent: "center",
  },
  checker: { backgroundColor: "#EEF1F2" },
  previewLayer: { width: "100%", alignItems: "center" },
  damageLayer: { ...StyleSheet.absoluteFill },
  preview: { width: "96%", height: 142 },
  damaged: { opacity: 0.72 },
  damageOne: {
    position: "absolute",
    left: 0,
    right: 30,
    top: 49,
    height: 8,
    backgroundColor: "#FFF",
  },
  damageTwo: {
    position: "absolute",
    left: 38,
    right: 0,
    top: 72,
    height: 7,
    backgroundColor: "#FFF",
  },
  error: {
    color: "#FFD8D2",
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
    marginTop: 7,
  },
  actions: { marginTop: "auto", paddingTop: 10, marginBottom: 1, gap: 2 },
});

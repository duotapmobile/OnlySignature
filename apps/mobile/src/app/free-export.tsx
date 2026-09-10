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
        <LayoutSlot id="warning.original.card" style={styles.resultBlock}>
          <View style={styles.resultHeading}>
            <LayoutSlot id="warning.original.label">
              <Text selectable style={styles.resultTitle}>
                Original Transparent
              </Text>
            </LayoutSlot>
            <Text selectable style={styles.resultCopy}>
              All fine strokes intact
            </Text>
          </View>
          <View style={[styles.compareCard, styles.checker]}>
            {asset ? (
              <LayoutSlot id="warning.original.art" style={styles.previewLayer}>
                <DrawingPreview
                  asset={asset}
                  accessibilityLabel="Original transparent signature with all strokes intact"
                  align="baseline"
                  style={styles.preview}
                />
              </LayoutSlot>
            ) : null}
          </View>
        </LayoutSlot>
        <LayoutSlot id="warning.diy.card" style={styles.resultBlock}>
          <View style={styles.resultHeading}>
            <LayoutSlot id="warning.diy.label">
              <Text selectable style={[styles.resultTitle, styles.diyTitle]}>
                DIY Removal
              </Text>
            </LayoutSlot>
            <Text selectable style={styles.resultCopy}>
              Fine strokes get erased
            </Text>
          </View>
          <View style={styles.compareCard}>
            {asset ? (
              <LayoutSlot id="warning.diy.art" style={styles.previewLayer}>
                <DrawingPreview
                  asset={asset}
                  accessibilityLabel="DIY background removal result with erased signature strokes"
                  align="baseline"
                  color="#586167"
                  style={[styles.preview, styles.damaged]}
                />
              </LayoutSlot>
            ) : null}
            <View accessibilityElementsHidden style={styles.damageGapOne} />
            <View accessibilityElementsHidden style={styles.damageGapTwo} />
            <LayoutSlot
              id="warning.diy.damage-one"
              style={styles.damageCallout}
            >
              <Text selectable style={styles.damageText}>
                Missing strokes
              </Text>
            </LayoutSlot>
          </View>
        </LayoutSlot>
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
          label={
            purchase.busy
              ? purchase.unboundPurchase
                ? "Applying Apple Purchase..."
                : "Opening Apple Purchase..."
              : "Purchase Transparent"
          }
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
  comparison: { marginTop: 12, gap: 12 },
  resultBlock: { width: "100%" },
  resultHeading: {
    minHeight: 31,
    paddingHorizontal: 4,
    paddingBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  resultTitle: {
    color: flowColors.white,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
  },
  diyTitle: { color: "#FFAAA1" },
  resultCopy: {
    flexShrink: 1,
    color: "#DDE5E8",
    fontSize: 11,
    lineHeight: 15,
    textAlign: "right",
  },
  compareCard: {
    width: "100%",
    height: 126,
    borderRadius: 16,
    backgroundColor: "#FFF",
    overflow: "hidden",
    boxShadow: "0 14px 28px rgba(0, 0, 0, 0.32)",
    alignItems: "center",
    justifyContent: "center",
  },
  checker: { backgroundColor: "#EEF1F2" },
  previewLayer: { width: "100%", alignItems: "center" },
  preview: { width: "92%", height: 94 },
  damaged: { opacity: 0.58 },
  damageGapOne: {
    position: "absolute",
    left: "36%",
    top: 0,
    bottom: 0,
    width: 12,
    backgroundColor: "#FFF",
  },
  damageGapTwo: {
    position: "absolute",
    left: "68%",
    top: 0,
    bottom: 0,
    width: 9,
    backgroundColor: "#FFF",
  },
  damageCallout: {
    position: "absolute",
    right: 9,
    bottom: 8,
    borderRadius: 999,
    backgroundColor: "#C9362E",
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  damageText: {
    color: "#FFF",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
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

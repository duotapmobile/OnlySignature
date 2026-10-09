import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { DrawingPreview } from "@/components/DrawingPreview";
import { LayoutSlot } from "@/components/layout-slot";
import { PurchaseAction } from "@/components/purchase-action";
import { PurchaseFeedback } from "@/components/purchase-feedback";
import {
  FlowBackButton,
  FlowHeading,
  FlowScreen,
  FlowTextButton,
  flowColors,
  flowRadii,
  flowShadows,
} from "@/components/flow-ui";
import { isAuthorizedScreenshotFixture } from "@/config/screenshotFixtures";
import { hasDrawing } from "@/domain/models";
import { useTransparentPurchase } from "@/hooks/use-transparent-purchase";
import { useAppState } from "@/state/AppStateProvider";
import { hapticWarning } from "@/services/haptics";

export default function DiyWarningScreen() {
  const { height } = useWindowDimensions();
  const compact = height <= 700;
  const { activeSet } = useAppState();
  const { fixture } = useLocalSearchParams<{ fixture?: string }>();
  const screenshotFixture = isAuthorizedScreenshotFixture(fixture, [
    "both",
    "signature",
    "purchase-pending",
    "purchase-interrupted",
    "purchase-finishing",
    "purchase-other-set",
    "product-loading",
    "product-unavailable",
  ]);
  const purchase = useTransparentPurchase({
    suppressSuccessRedirect: screenshotFixture,
  });
  const asset = hasDrawing(activeSet.signature)
    ? activeSet.signature
    : activeSet.initials;

  return (
    <FlowScreen
      scroll={Boolean(purchase.feedback)}
      contentStyle={[styles.content, compact && styles.compactContent]}
      testID="diy-warning-screen"
      navigation={
        <FlowBackButton
          onPress={() => router.back()}
          layoutId="warning.back.icon"
        />
      }
      header={
        <LayoutSlot
          id="warning.header"
          style={[styles.warning, compact && styles.compactWarning]}
        >
          <FlowHeading
            style={[styles.headingText, compact && styles.compactHeadingText]}
            layoutId="warning.title"
          >
            Download a Quality Signature
          </FlowHeading>
          <LayoutSlot id="warning.subtitle">
            <Text
              selectable
              style={[styles.warningCopy, compact && styles.compactWarningCopy]}
            >
              Removing the background later can damage your signature.
            </Text>
          </LayoutSlot>
        </LayoutSlot>
      }
    >
      <LayoutSlot
        id="warning.comparison"
        style={[styles.comparison, compact && styles.compactComparison]}
      >
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
          <View
            style={[
              styles.compareCard,
              styles.checker,
              compact && styles.compactCompareCard,
            ]}
          >
            {asset ? (
              <LayoutSlot id="warning.original.art" style={styles.previewLayer}>
                <DrawingPreview
                  asset={asset}
                  accessibilityLabel="Original transparent signature with all strokes intact"
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
            <LayoutSlot id="warning.diy.damage-one">
              <Text selectable style={[styles.resultCopy, styles.damagePill]}>
                Missing strokes
              </Text>
            </LayoutSlot>
          </View>
          <View
            style={[styles.compareCard, compact && styles.compactCompareCard]}
          >
            {asset ? (
              <LayoutSlot id="warning.diy.art" style={styles.previewLayer}>
                <DrawingPreview
                  asset={asset}
                  accessibilityLabel="DIY background removal result with erased signature strokes"
                  color="#586167"
                  style={[styles.preview, styles.damaged]}
                />
              </LayoutSlot>
            ) : null}
            <View accessibilityElementsHidden style={styles.damageGapOne} />
            <View accessibilityElementsHidden style={styles.damageGapTwo} />
            <View accessibilityElementsHidden style={styles.damageGapThree} />
          </View>
        </LayoutSlot>
      </LayoutSlot>
      <PurchaseFeedback
        busy={purchase.busy}
        unboundPurchase={purchase.unboundPurchase}
        feedback={purchase.feedback}
        layoutId="warning.error"
      />
      <LayoutSlot
        id="warning.actions"
        style={[styles.actions, compact && styles.compactActions]}
      >
        <PurchaseAction
          displayPrice={purchase.displayPrice}
          productStatus={purchase.productStatus}
          onRetry={() => void purchase.retryProduct()}
          busy={purchase.busy}
          unboundPurchase={purchase.unboundPurchase}
          onPress={() => void purchase.beginPurchase()}
          disabled={purchase.busy || purchase.transparentUnavailable}
          layoutPrefix="warning.primary"
        />
        <FlowTextButton
          label="No Thanks, Download Free White Set"
          onPress={() => {
            void hapticWarning();
            router.push("/white-export" as never);
          }}
          disabled={purchase.busy}
          layoutId="warning.secondary.button"
          labelLayoutId="warning.secondary.label"
        />
      </LayoutSlot>
    </FlowScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 16,
    paddingBottom: 14,
    justifyContent: "center",
  },
  compactContent: { paddingTop: 12, paddingBottom: 5 },
  back: { position: "absolute", top: 8, left: 20, zIndex: 4 },
  warning: {},
  compactWarning: {},
  headingText: { fontSize: 24, lineHeight: 29 },
  compactHeadingText: { fontSize: 22, lineHeight: 26 },
  warningCopy: {
    color: flowColors.bodyText,
    fontSize: 14,
    lineHeight: 19,
    marginTop: 5,
  },
  compactWarningCopy: { fontSize: 13, lineHeight: 18, marginTop: 3 },
  comparison: { flex: 1, maxHeight: 540, gap: 12 },
  compactComparison: { gap: 10 },
  resultBlock: { flex: 1, width: "100%" },
  resultHeading: {
    minHeight: 34,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    borderRadius: 12,
    backgroundColor: "rgba(248,246,239,0.96)",
  },
  resultTitle: {
    color: flowColors.cardText,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "800",
  },
  diyTitle: { color: flowColors.destructive },
  resultCopy: {
    flexShrink: 1,
    color: flowColors.cardMuted,
    fontSize: 12,
    lineHeight: 16,
    textAlign: "right",
  },
  compareCard: {
    width: "100%",
    flex: 1,
    minHeight: 108,
    borderRadius: flowRadii.card,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "rgba(216,182,106,0.62)",
    overflow: "hidden",
    boxShadow: flowShadows.card,
    alignItems: "center",
    justifyContent: "center",
  },
  compactCompareCard: { minHeight: 88 },
  checker: { backgroundColor: "#FFFDF8" },
  previewLayer: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  preview: { width: "96%", height: "82%" },
  damaged: { opacity: 0.58 },
  damageGapOne: {
    position: "absolute",
    left: "36%",
    top: 0,
    bottom: 0,
    width: "7%",
    backgroundColor: "#FFF",
  },
  damageGapTwo: {
    position: "absolute",
    left: "68%",
    top: 0,
    bottom: 0,
    width: "6%",
    backgroundColor: "#FFF",
  },
  damageGapThree: {
    position: "absolute",
    left: "23%",
    top: 0,
    bottom: 0,
    width: "5%",
    backgroundColor: "#FFF",
  },
  damagePill: {
    borderRadius: 999,
    backgroundColor: "#C9362E",
    paddingHorizontal: 10,
    paddingVertical: 4,
    color: "#FFF",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
  },
  actions: {
    marginTop: 10,
    gap: 2,
  },
  compactActions: { marginTop: 4, gap: 0 },
});

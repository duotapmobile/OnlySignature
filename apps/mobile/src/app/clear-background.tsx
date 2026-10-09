import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { DocumentSignaturePreview } from "@/components/document-signature-preview";
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
import { hasDrawing, type DrawingAsset } from "@/domain/models";
import { useTransparentPurchase } from "@/hooks/use-transparent-purchase";
import { useAppState } from "@/state/AppStateProvider";

function StatusIcon({ positive }: { positive: boolean }) {
  return (
    <View
      accessibilityElementsHidden
      style={[styles.statusIcon, positive ? styles.goodIcon : styles.badIcon]}
    >
      <Svg width={22} height={22} viewBox="0 0 24 24">
        <Path
          d={positive ? "m5.5 12.5 4 4 9-9" : "m7 7 10 10M17 7 7 17"}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

function ComparisonCard({
  asset,
  positive,
  tablet,
}: {
  asset: DrawingAsset;
  positive: boolean;
  tablet: boolean;
}) {
  const prefix = positive ? "clear.good" : "clear.bad";
  return (
    <LayoutSlot
      id={prefix + ".card"}
      style={[styles.card, tablet && styles.tabletCard]}
    >
      <View style={styles.statusRow}>
        <LayoutSlot id={prefix + ".icon"}>
          <StatusIcon positive={positive} />
        </LayoutSlot>
        <LayoutSlot id={prefix + ".status"}>
          <Text
            selectable
            style={[styles.statusText, positive ? styles.good : styles.bad]}
          >
            {positive ? "Looks natural" : "White box"}
          </Text>
        </LayoutSlot>
      </View>
      <View style={styles.document}>
        <DocumentSignaturePreview
          asset={asset}
          background={positive ? "transparent" : "white"}
          compact={!tablet}
        />
      </View>
    </LayoutSlot>
  );
}

export default function ClearBackgroundScreen() {
  const { width, fontScale } = useWindowDimensions();
  const tablet = width >= 768;
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

  if (!asset) return null;

  return (
    <FlowScreen
      scroll={Boolean(purchase.feedback)}
      contentStyle={[styles.content, tablet && styles.tabletContent]}
      testID="clear-background-screen"
      navigation={<FlowBackButton onPress={() => router.back()} />}
      header={
        <LayoutSlot id="clear.header" style={styles.header}>
          <FlowHeading style={styles.title} layoutId="clear.title">
            See the difference
          </FlowHeading>
          <LayoutSlot id="clear.subtitle">
            <Text
              selectable
              numberOfLines={fontScale > 1.15 ? undefined : 1}
              adjustsFontSizeToFit={fontScale <= 1.15}
              minimumFontScale={0.86}
              style={styles.subtitle}
            >
              A transparent signature sits naturally on any document.
            </Text>
          </LayoutSlot>
        </LayoutSlot>
      }
    >
      <LayoutSlot id="clear.comparison" style={styles.comparison}>
        <ComparisonCard asset={asset} positive tablet={tablet} />
        <ComparisonCard asset={asset} positive={false} tablet={tablet} />
      </LayoutSlot>
      <PurchaseFeedback
        busy={purchase.busy}
        unboundPurchase={purchase.unboundPurchase}
        feedback={purchase.feedback}
        layoutId="clear.error"
      />
      <LayoutSlot id="clear.actions" style={styles.actions}>
        <PurchaseAction
          displayPrice={purchase.displayPrice}
          productStatus={purchase.productStatus}
          onRetry={() => void purchase.retryProduct()}
          busy={purchase.busy}
          unboundPurchase={purchase.unboundPurchase}
          onPress={() => void purchase.beginPurchase()}
          disabled={purchase.busy || purchase.transparentUnavailable}
          layoutPrefix="clear.primary"
        />
        <FlowTextButton
          label="No Thanks"
          onPress={() => router.push("/free-export")}
          disabled={purchase.busy}
          layoutId="clear.secondary.button"
          labelLayoutId="clear.secondary.label"
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
  tabletContent: { maxWidth: 780, paddingHorizontal: 38 },
  back: { position: "absolute", top: 8, left: 20, zIndex: 3 },
  header: { alignItems: "center" },
  title: {
    color: flowColors.white,
    fontSize: 27,
    lineHeight: 32,
    textAlign: "center",
  },
  subtitle: {
    color: flowColors.bodyText,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 5,
  },
  comparison: {
    flex: 1,
    maxHeight: 540,
    flexDirection: "column",
    gap: 12,
    marginTop: 0,
  },
  card: {
    width: "100%",
    flex: 1,
    minHeight: 148,
    borderRadius: flowRadii.card,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(216,182,106,0.62)",
    paddingHorizontal: 10,
    paddingTop: 12,
    boxShadow: flowShadows.card,
  },
  tabletCard: { height: 210, paddingHorizontal: 20, paddingTop: 14 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  statusIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  goodIcon: { backgroundColor: "#1F8840" },
  badIcon: { backgroundColor: "#F04438" },
  statusText: {
    flexShrink: 1,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "800",
  },
  good: { color: "#1D7B3B" },
  bad: { color: "#D9382F" },
  document: { flex: 1, marginTop: 8, position: "relative" },
  actions: {
    marginTop: 10,
    gap: 2,
  },
});

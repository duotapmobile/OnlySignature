import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { DrawingPreview } from "@/components/DrawingPreview";
import { LayoutSlot } from "@/components/layout-slot";
import {
  FlowBackButton,
  FlowBody,
  FlowHeading,
  FlowPrimaryButton,
  FlowScreen,
  FlowTextButton,
  flowColors,
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
        <LayoutSlot
          id={prefix + ".signature-label"}
          style={styles.signatureLabel}
        >
          <Text selectable style={styles.documentLabel}>
            Signature:
          </Text>
        </LayoutSlot>
        <LayoutSlot
          id={prefix + ".signature-line"}
          style={styles.signatureRule}
        >
          <View style={styles.rule} />
        </LayoutSlot>
        {!positive ? (
          <LayoutSlot
            id="clear.bad.white-box"
            accessibilityLabel="White signature background covering part of the document date"
            style={styles.whiteBox}
          />
        ) : null}
        <LayoutSlot id={prefix + ".signature-art"} style={styles.artLayer}>
          <DrawingPreview
            asset={asset}
            accessibilityLabel={
              positive
                ? "Transparent signature sitting naturally on a document line"
                : "Signature with a white rectangle covering the document"
            }
            style={styles.art}
            align="baseline"
          />
        </LayoutSlot>
        <LayoutSlot id={prefix + ".date-label"} style={styles.dateLabel}>
          <Text selectable style={styles.documentLabel}>
            Date:
          </Text>
        </LayoutSlot>
        <LayoutSlot id={prefix + ".date-line"} style={styles.dateRule}>
          <View style={styles.rule} />
        </LayoutSlot>
        <LayoutSlot
          id={prefix + ".date-value"}
          style={[styles.dateValue, !positive && styles.obstructedDate]}
        >
          <Text selectable style={styles.dateText}>
            08-20-26
          </Text>
        </LayoutSlot>
      </View>
    </LayoutSlot>
  );
}

export default function ClearBackgroundScreen() {
  const { width } = useWindowDimensions();
  const tablet = width >= 768;
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

  if (!asset) return null;

  return (
    <FlowScreen
      scroll={false}
      contentStyle={[styles.content, tablet && styles.tabletContent]}
      testID="clear-background-screen"
    >
      <View style={styles.back}>
        <FlowBackButton onPress={() => router.back()} />
      </View>
      <LayoutSlot id="clear.header" style={styles.header}>
        <FlowHeading style={styles.title} layoutId="clear.title">
          Clear Background
        </FlowHeading>
        <FlowBody style={styles.subtitle} layoutId="clear.subtitle">
          Looks natural on any document.
        </FlowBody>
      </LayoutSlot>
      <LayoutSlot id="clear.comparison" style={styles.comparison}>
        <ComparisonCard asset={asset} positive tablet={tablet} />
        <ComparisonCard asset={asset} positive={false} tablet={tablet} />
      </LayoutSlot>
      {purchase.error ? (
        <LayoutSlot id="clear.error">
          <Text accessibilityRole="alert" selectable style={styles.error}>
            {purchase.error}
          </Text>
        </LayoutSlot>
      ) : null}
      <LayoutSlot id="clear.actions" style={styles.actions}>
        <FlowPrimaryButton
          label={
            purchase.busy
              ? purchase.unboundPurchase
                ? "Applying Apple Purchase..."
                : "Opening Apple Purchase..."
              : purchase.productNeedsRetry
                ? "Try Transparent Purchase Again"
                : "Unlock Transparent Set - " + purchase.displayPrice
          }
          onPress={() => void purchase.beginPurchase()}
          disabled={purchase.busy || purchase.transparentUnavailable}
          layoutId="clear.primary.button"
          labelLayoutId="clear.primary.label"
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
  content: { paddingTop: 18, paddingBottom: 18 },
  tabletContent: { maxWidth: 780, paddingHorizontal: 38 },
  back: { position: "absolute", top: 8, left: 20, zIndex: 3 },
  header: { alignItems: "center", marginTop: 34 },
  title: {
    color: flowColors.white,
    fontSize: 27,
    lineHeight: 32,
    textAlign: "center",
  },
  subtitle: {
    color: "#DCE5E8",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 5,
  },
  comparison: { flexDirection: "column", gap: 12, marginTop: 14 },
  card: {
    width: "100%",
    height: 196,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingTop: 12,
    boxShadow: "0 14px 34px rgba(0, 0, 0, 0.3)",
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
  goodIcon: { backgroundColor: "#2DB65B" },
  badIcon: { backgroundColor: "#F04438" },
  statusText: {
    flexShrink: 1,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "800",
  },
  good: { color: "#259F4D" },
  bad: { color: "#D9382F" },
  document: { flex: 1, marginTop: 8, position: "relative" },
  documentLabel: {
    color: "#1C2023",
    fontFamily: "serif",
    fontSize: 11,
    lineHeight: 15,
  },
  signatureLabel: { position: "absolute", left: 0, top: 25 },
  signatureRule: { position: "absolute", left: 58, right: 1, top: 55 },
  dateLabel: { position: "absolute", left: 0, top: 83 },
  dateRule: { position: "absolute", left: 31, right: 1, top: 98 },
  rule: { height: 1.2, backgroundColor: "#252A2D" },
  artLayer: {
    position: "absolute",
    left: 55,
    right: 12,
    top: 10,
    height: 40,
    zIndex: 3,
  },
  whiteBox: {
    position: "absolute",
    left: 51,
    right: 8,
    top: 17,
    height: 48,
    zIndex: 2,
    backgroundColor: "#FFFFFF",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  art: { width: "100%", height: "100%" },
  dateValue: { position: "absolute", left: 36, top: 78, zIndex: 3 },
  obstructedDate: { zIndex: 1 },
  dateText: {
    color: "#1C2023",
    fontFamily: "serif",
    fontSize: 12,
    lineHeight: 16,
  },
  error: {
    color: "#FFD8D2",
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
    marginTop: 7,
  },
  actions: { marginTop: "auto", paddingTop: 10, gap: 1 },
});

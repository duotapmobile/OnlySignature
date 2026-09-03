import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { DrawingPreview } from "@/components/DrawingPreview";
import { LayoutSlot } from "@/components/layout-slot";
import {
  FlowBody,
  FlowHeading,
  FlowPrimaryButton,
  FlowScreen,
  FlowTextButton,
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
      <Svg width={30} height={30} viewBox="0 0 24 24">
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
      tone="light"
      contentStyle={[styles.content, tablet && styles.tabletContent]}
      testID="clear-background-screen"
    >
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
              : "Unlock Transparent Set \u00b7 " + purchase.displayPrice
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
  content: { paddingTop: 78, paddingBottom: 28 },
  tabletContent: { maxWidth: 780, paddingTop: 82, paddingHorizontal: 38 },
  header: { alignItems: "center" },
  title: {
    color: "#242A2E",
    fontSize: 32,
    lineHeight: 38,
    textAlign: "center",
  },
  subtitle: {
    color: "#30363A",
    fontSize: 17,
    lineHeight: 24,
    textAlign: "center",
    marginTop: 7,
  },
  comparison: { gap: 16, marginTop: 28 },
  card: {
    height: 230,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    paddingTop: 18,
    boxShadow: "0 14px 34px rgba(54, 48, 43, 0.12)",
  },
  tabletCard: { height: 280, paddingHorizontal: 28, paddingTop: 24 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  statusIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  goodIcon: { backgroundColor: "#2DB65B" },
  badIcon: { backgroundColor: "#F04438" },
  statusText: { fontSize: 18, lineHeight: 24, fontWeight: "800" },
  good: { color: "#25A950" },
  bad: { color: "#E33D32" },
  document: { flex: 1, marginTop: 10, position: "relative" },
  documentLabel: {
    color: "#1C2023",
    fontFamily: "serif",
    fontSize: 16,
    lineHeight: 21,
  },
  signatureLabel: { position: "absolute", left: 0, top: 45 },
  signatureRule: { position: "absolute", left: 88, right: 2, top: 63 },
  dateLabel: { position: "absolute", left: 0, top: 107 },
  dateRule: { position: "absolute", left: 58, right: 2, top: 125 },
  rule: { height: 1.5, backgroundColor: "#252A2D" },
  artLayer: {
    position: "absolute",
    left: 104,
    right: 18,
    top: 21,
    height: 74,
    zIndex: 3,
  },
  whiteBox: {
    position: "absolute",
    left: 118,
    right: 44,
    top: 21,
    height: 88,
    zIndex: 2,
    paddingHorizontal: 8,
    backgroundColor: "#FFFFFF",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  art: { width: "100%", height: "100%" },
  dateValue: { position: "absolute", left: 154, top: 101, zIndex: 3 },
  obstructedDate: { zIndex: 1 },
  dateText: {
    color: "#1C2023",
    fontFamily: "serif",
    fontSize: 17,
    lineHeight: 22,
  },
  error: {
    color: "#A5281F",
    fontSize: 14,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 10,
  },
  actions: { marginTop: "auto", paddingTop: 18, gap: 2 },
});

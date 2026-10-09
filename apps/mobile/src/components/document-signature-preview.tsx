import { StyleSheet, Text, View } from "react-native";
import { DrawingPreview } from "@/components/DrawingPreview";
import type { DrawingAsset } from "@/domain/models";

export function DocumentSignaturePreview({
  asset,
  background,
  compact = false,
}: {
  asset: DrawingAsset;
  background: "transparent" | "white";
  compact?: boolean;
}) {
  const white = background === "white";
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={
        white
          ? "White signature background covering part of the document date"
          : "Transparent signature sitting naturally over a document line without covering the date"
      }
      style={[styles.document, compact && styles.compactDocument]}
    >
      <Text
        allowFontScaling={false}
        style={[styles.label, compact && styles.compactLabel]}
      >
        Signature:
      </Text>
      <View style={styles.signatureRule} />
      <View style={[styles.dateRow, compact && styles.compactDateRow]}>
        <Text
          allowFontScaling={false}
          style={[styles.date, compact && styles.compactDate]}
        >
          Date:
        </Text>
        <View style={styles.dateValue}>
          <Text
            allowFontScaling={false}
            style={[styles.date, compact && styles.compactDate]}
          >
            08-20-26
          </Text>
        </View>
      </View>
      {white ? (
        <View
          pointerEvents="none"
          style={[styles.whiteBox, compact && styles.compactWhiteBox]}
        />
      ) : null}
      <DrawingPreview
        asset={asset}
        align="baseline"
        baselineRatio={0.76}
        style={styles.signature}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  document: {
    width: "100%",
    flex: 1,
    minHeight: 116,
    position: "relative",
    overflow: "hidden",
    borderRadius: 18,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: "rgba(7,31,90,0.12)",
    backgroundColor: "#FFFDF8",
  },
  compactDocument: { minHeight: 78, borderRadius: 14 },
  label: {
    position: "absolute",
    left: 14,
    top: "27%",
    zIndex: 1,
    color: "#1C2023",
    fontFamily: "Georgia",
    fontSize: 14,
    lineHeight: 18,
  },
  compactLabel: { left: 10, fontSize: 12, lineHeight: 16 },
  signatureRule: {
    position: "absolute",
    left: "24%",
    right: 12,
    top: "52%",
    height: 1.2,
    backgroundColor: "#252A2D",
  },
  date: {
    color: "#1C2023",
    fontFamily: "Georgia",
    fontSize: 14,
    lineHeight: 18,
  },
  compactDate: { fontSize: 12, lineHeight: 16 },
  dateRow: {
    position: "absolute",
    left: 14,
    right: 12,
    bottom: 13,
    flexDirection: "row",
    alignItems: "baseline",
    gap: 5,
    zIndex: 1,
  },
  compactDateRow: { left: 10, bottom: 8 },
  dateValue: { flex: 1, borderBottomWidth: 1.2, borderBottomColor: "#252A2D" },
  whiteBox: {
    position: "absolute",
    left: 68,
    right: 12,
    top: "16%",
    bottom: 5,
    zIndex: 2,
    backgroundColor: "#FFFFFF",
    boxShadow: "0 2px 7px rgba(7,31,90,0.10)",
  },
  compactWhiteBox: { left: 52 },
  signature: {
    position: "absolute",
    left: "25%",
    right: 12,
    top: "8%",
    height: "58%",
    zIndex: 3,
  },
});

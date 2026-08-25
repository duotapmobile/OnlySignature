import { StyleSheet, Text, View } from "react-native";
import { DrawingPreview } from "./DrawingPreview";
import type { DrawingAsset } from "@/domain/models";
import { theme } from "@/integrations/workspace";

function Agreement({
  asset,
  whiteBox,
}: {
  asset: DrawingAsset;
  whiteBox: boolean;
}) {
  return (
    <View style={styles.document}>
      <Text style={styles.docTitle}>SERVICE AGREEMENT</Text>
      <Text style={styles.docText}>
        Avery Lane agrees to the terms listed in this fictional sample.
      </Text>
      <View style={styles.rule} />
      <View style={styles.signatureArea}>
        <Text style={styles.label}>
          {asset.kind === "initials" ? "Initials" : "Signature"}
        </Text>
        <View style={styles.signatureLine} />
        <Text style={styles.date}>Date: 08 / 25 / 2026</Text>
        <View style={[styles.signaturePlacement, whiteBox && styles.whiteBox]}>
          <DrawingPreview asset={asset} style={styles.drawing} />
        </View>
      </View>
    </View>
  );
}

export function DocumentComparison({ asset }: { asset: DrawingAsset }) {
  return (
    <View
      style={styles.comparison}
      accessibilityLabel="The same sample agreement shown with a white-background signature and a transparent signature"
    >
      <View style={styles.column}>
        <Text style={styles.caption}>White Background</Text>
        <View style={styles.secondarySpacer} />
        <Agreement asset={asset} whiteBox />
      </View>
      <View style={styles.column}>
        <Text style={styles.caption}>Transparent</Text>
        <Text style={styles.secondary}>Professional Export</Text>
        <Agreement asset={asset} whiteBox={false} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  comparison: { flexDirection: "row", gap: 12 },
  column: { flex: 1, minWidth: 0, width: 0 },
  caption: {
    color: theme.colors.text,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 3,
  },
  secondary: {
    color: theme.colors.success,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  secondarySpacer: { height: 19 },
  document: {
    aspectRatio: 0.78,
    backgroundColor: "#E7E2D4",
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#BFB7A4",
    padding: 12,
    overflow: "hidden",
  },
  docTitle: {
    color: "#2E3234",
    fontSize: 11,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 14,
  },
  docText: { color: "#43484A", fontSize: 8, lineHeight: 12 },
  rule: { height: 1, backgroundColor: "#8B8D87", marginVertical: 12 },
  signatureArea: { marginTop: "auto", height: 98, justifyContent: "flex-end" },
  label: {
    color: "#394044",
    fontSize: 9,
    position: "absolute",
    left: 0,
    bottom: 39,
  },
  signatureLine: { height: 1, backgroundColor: "#515658", marginBottom: 36 },
  date: {
    color: "#394044",
    fontSize: 8,
    position: "absolute",
    right: 0,
    bottom: 18,
  },
  signaturePlacement: {
    position: "absolute",
    left: 16,
    right: 9,
    bottom: 20,
    height: 72,
    zIndex: 2,
    paddingHorizontal: 8,
  },
  whiteBox: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  drawing: { height: "100%" },
});

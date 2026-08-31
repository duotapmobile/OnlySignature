import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { DrawingPreview } from "@/components/DrawingPreview";
import {
  FlowBackButton,
  FlowHeading,
  FlowPrimaryButton,
  FlowScreen,
  FlowTextButton,
  ScriptLabel,
  flowColors,
} from "@/components/flow-ui";
import { hasDrawing } from "@/domain/models";
import { useAppState } from "@/state/AppStateProvider";

export default function DiyWarningScreen() {
  const { activeSet, product } = useAppState();
  const asset = hasDrawing(activeSet.signature)
    ? activeSet.signature
    : activeSet.initials;
  const displayPrice = product.displayPrice || "$1.99";

  return (
    <FlowScreen contentStyle={styles.content} testID="diy-warning-screen">
      <View style={styles.back}>
        <FlowBackButton onPress={() => router.back()} />
      </View>
      <ScriptLabel asset="before" style={styles.script} />
      <View style={styles.warning}>
        <FlowHeading>
          Removing the background later can damage your signature.
        </FlowHeading>
        <View style={styles.labels}>
          <Text selectable style={styles.label}>
            Original{`\n`}Transparent
          </Text>
          <Text selectable style={styles.label}>
            DIY Removal{`\n`}Missing strokes
          </Text>
        </View>
        <View style={styles.compare}>
          <View style={[styles.compareCard, styles.checker]}>
            {asset ? (
              <DrawingPreview
                asset={asset}
                accessibilityLabel="Original transparent signature"
                style={styles.preview}
              />
            ) : null}
          </View>
          <View style={styles.compareCard}>
            {asset ? (
              <DrawingPreview
                asset={asset}
                accessibilityLabel="DIY removal result with missing strokes"
                color="#586167"
                style={[styles.preview, styles.damaged]}
              />
            ) : null}
            <View accessibilityElementsHidden style={styles.damageOne} />
            <View accessibilityElementsHidden style={styles.damageTwo} />
          </View>
        </View>
      </View>
      <View style={styles.actions}>
        <FlowPrimaryButton
          label={`Unlock Transparent Set · ${displayPrice}`}
          onPress={() => router.replace("/purchase")}
        />
        <FlowTextButton
          label="Download White Background Set"
          onPress={() => router.push("/white-export" as never)}
        />
      </View>
    </FlowScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 24 },
  back: { position: "absolute", top: 24, left: 18, zIndex: 4 },
  script: { marginLeft: 24, marginBottom: 8 },
  warning: { marginTop: 2 },
  labels: { flexDirection: "row", marginTop: 18, marginBottom: 8 },
  label: {
    flex: 1,
    color: flowColors.white,
    fontSize: 12,
    lineHeight: 16,
    textAlign: "center",
  },
  compare: { flexDirection: "row", gap: 12 },
  compareCard: {
    flex: 1,
    height: 176,
    borderRadius: 14,
    backgroundColor: "#FFF",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  checker: { backgroundColor: "#EEF1F2" },
  preview: { width: "96%", height: 138 },
  damaged: { opacity: 0.72 },
  damageOne: {
    position: "absolute",
    left: 0,
    right: 42,
    top: 62,
    height: 9,
    backgroundColor: "#FFF",
  },
  damageTwo: {
    position: "absolute",
    left: 54,
    right: 0,
    top: 91,
    height: 8,
    backgroundColor: "#FFF",
  },
  actions: { marginTop: 18 },
});

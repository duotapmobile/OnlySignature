import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { DrawingPreview } from "@/components/DrawingPreview";
import {
  EntryBackdrop,
  FlowBackButton,
  FlowBody,
  FlowHeading,
  FlowPrimaryButton,
  FlowScreen,
  FlowSheet,
  PreviewCard,
  ScriptLabel,
  flowColors,
} from "@/components/flow-ui";
import { hasDrawing } from "@/domain/models";
import { useAppState } from "@/state/AppStateProvider";

export default function ReviewScreen() {
  const { activeSet, setSelectedAsset } = useAppState();
  const signatureExists = hasDrawing(activeSet.signature);
  const initialsExists = hasDrawing(activeSet.initials);

  const edit = (kind: "signature" | "initials") => {
    setSelectedAsset(kind);
    router.push({ pathname: "/draw", params: { returnTo: "review" } });
  };

  return (
    <FlowScreen contentStyle={styles.content} testID="review-screen">
      <EntryBackdrop />
      <View accessibilityElementsHidden style={styles.shade} />
      <FlowSheet label="Confirm Your Signing Set" style={styles.sheet}>
        <View style={styles.sheetBack}>
          <FlowBackButton
            onPress={() => {
              setSelectedAsset("initials");
              router.back();
            }}
          />
        </View>
        <ScriptLabel asset="review" style={styles.script} />
        <FlowHeading>Confirm Your Signing Set</FlowHeading>
        <FlowBody style={styles.copy}>
          Check carefully. Once downloaded, saved assets cannot be changed.
        </FlowBody>
        <PreviewCard
          label="Signature"
          actionLabel="Edit"
          onAction={() => edit("signature")}
        >
          {signatureExists && activeSet.signature ? (
            <DrawingPreview
              asset={activeSet.signature}
              style={styles.signature}
            />
          ) : (
            <Text style={styles.missing}>Signature not added</Text>
          )}
        </PreviewCard>
        <PreviewCard
          label="Initials"
          actionLabel={initialsExists ? "Edit" : "Add"}
          onAction={() => edit("initials")}
        >
          {initialsExists && activeSet.initials ? (
            <DrawingPreview
              asset={activeSet.initials}
              style={styles.initials}
            />
          ) : (
            <Text selectable style={styles.missing}>
              Initials not added
            </Text>
          )}
        </PreviewCard>
        <View style={styles.continue}>
          <FlowPrimaryButton
            label="Confirm and Choose Background"
            onPress={() => router.push("/purchase")}
            disabled={!signatureExists}
          />
        </View>
      </FlowSheet>
    </FlowScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 0 },
  shade: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(0,0,0,0.62)" },
  sheet: { top: "14%" },
  sheetBack: { position: "absolute", top: -6, left: 20, zIndex: 3 },
  script: { marginLeft: 28, marginBottom: 2 },
  copy: {
    fontSize: 13,
    lineHeight: 18,
    color: "#DDE4E7",
    marginTop: 7,
    marginBottom: 10,
  },
  signature: { width: "90%", height: 64 },
  initials: { width: "58%", height: 60 },
  missing: { color: flowColors.cardMuted, fontSize: 13, lineHeight: 18 },
  continue: { marginTop: 4 },
});

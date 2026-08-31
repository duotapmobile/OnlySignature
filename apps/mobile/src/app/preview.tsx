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
          Review your signing set before saving. Saved originals stay unchanged;
          duplicate a set to make changes later.
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
            label="Continue to Background"
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
  sheet: { top: 164 },
  sheetBack: { position: "absolute", top: 14, left: 22, zIndex: 3 },
  script: { width: 84, height: 29, marginLeft: 28, marginBottom: 2 },
  copy: {
    fontSize: 13,
    lineHeight: 18,
    color: "#DDE4E7",
    marginTop: 7,
    marginBottom: 12,
  },
  signature: { width: "82%", height: 58 },
  initials: { width: "52%", height: 55 },
  missing: { color: flowColors.cardMuted, fontSize: 13, lineHeight: 18 },
  continue: { marginTop: "auto" },
});

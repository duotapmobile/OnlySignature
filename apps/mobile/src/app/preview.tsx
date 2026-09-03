import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { DrawingPreview } from "@/components/DrawingPreview";
import { LayoutSlot } from "@/components/layout-slot";
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
      <FlowSheet
        label="Confirm Your Signing Set"
        style={styles.sheet}
        layoutId="review.sheet"
        handleLayoutId="review.handle"
      >
        <View style={styles.sheetBack}>
          <FlowBackButton
            layoutId="review.back.icon"
            onPress={() => {
              setSelectedAsset("initials");
              router.back();
            }}
          />
        </View>
        <LayoutSlot id="review.header">
          <ScriptLabel
            asset="review"
            style={styles.script}
            layoutId="review.script"
          />
          <FlowHeading style={styles.headingText} layoutId="review.title">
            Confirm Your Signing Set
          </FlowHeading>
          <FlowBody style={styles.copy} layoutId="review.subtitle">
            Check carefully. Once downloaded, saved assets cannot be changed.
          </FlowBody>
        </LayoutSlot>
        <LayoutSlot id="review.signature">
          <PreviewCard
            label="Signature"
            actionLabel="Edit"
            onAction={() => edit("signature")}
            labelLayoutId="review.signature.label"
            actionLayoutId="review.signature.edit"
            contentLayoutId="review.signature.art"
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
        </LayoutSlot>
        <LayoutSlot id="review.initials">
          <PreviewCard
            label="Initials"
            actionLabel={initialsExists ? "Edit" : "Add"}
            onAction={() => edit("initials")}
            labelLayoutId="review.initials.label"
            actionLayoutId="review.initials.edit"
            contentLayoutId="review.initials.art"
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
        </LayoutSlot>
        <LayoutSlot id="review.actions" style={styles.continue}>
          <FlowPrimaryButton
            label="Confirm and Choose Background"
            onPress={() => router.push("/purchase")}
            disabled={!signatureExists}
            layoutId="review.confirm.button"
            labelLayoutId="review.confirm.label"
          />
        </LayoutSlot>
      </FlowSheet>
    </FlowScreen>
  );
}

const styles = StyleSheet.create({
  headingText: { fontSize: 32, lineHeight: 38 },
  content: { padding: 0 },
  shade: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(0,0,0,0.62)" },
  sheet: { top: "27%" },
  sheetBack: { position: "absolute", top: 2, left: 20, zIndex: 3 },
  script: { width: 148, height: 60, marginLeft: 52, marginBottom: -6 },
  copy: {
    fontSize: 22,
    lineHeight: 31,
    color: "#DDE4E7",
    marginTop: 12,
    marginBottom: 24,
  },
  signature: { width: "92%", height: 88 },
  initials: { width: "62%", height: 82 },
  missing: { color: flowColors.cardMuted, fontSize: 15, lineHeight: 21 },
  continue: { marginTop: "auto", paddingTop: 24, marginBottom: 26 },
});

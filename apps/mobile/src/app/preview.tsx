import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { DrawingPreview } from "@/components/DrawingPreview";
import { LayoutSlot } from "@/components/layout-slot";
import {
  FlowBackButton,
  FlowBody,
  FlowHeading,
  FlowPrimaryButton,
  FlowScreen,
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
    <FlowScreen
      scroll={false}
      contentStyle={styles.content}
      testID="review-screen"
    >
      <View style={styles.back}>
        <FlowBackButton
          layoutId="review.back.icon"
          onPress={() => {
            setSelectedAsset("initials");
            router.back();
          }}
        />
      </View>
      <LayoutSlot id="review.header" style={styles.header}>
        <ScriptLabel
          asset="review"
          style={styles.script}
          layoutId="review.script"
        />
        <FlowHeading style={styles.headingText} layoutId="review.title">
          Confirm Your Signing Set
        </FlowHeading>
        <FlowBody style={styles.copy} layoutId="review.subtitle">
          Check both before choosing a background.
        </FlowBody>
      </LayoutSlot>
      <View style={styles.previews}>
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
      </View>
      <LayoutSlot id="review.actions" style={styles.continue}>
        <FlowPrimaryButton
          label="Confirm and Choose Background"
          onPress={() => router.push("/purchase")}
          disabled={!signatureExists}
          layoutId="review.confirm.button"
          labelLayoutId="review.confirm.label"
        />
      </LayoutSlot>
    </FlowScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 18, paddingBottom: 18 },
  back: { position: "absolute", top: 8, left: 20, zIndex: 3 },
  header: { marginTop: 28 },
  script: { width: 126, height: 48, marginLeft: 30, marginBottom: -4 },
  headingText: { fontSize: 27, lineHeight: 32 },
  copy: {
    fontSize: 15,
    lineHeight: 21,
    color: "#DDE4E7",
    marginTop: 5,
    marginBottom: 12,
  },
  previews: { gap: 0 },
  signature: { width: "92%", height: 72 },
  initials: { width: "58%", height: 66 },
  missing: { color: flowColors.cardMuted, fontSize: 14, lineHeight: 20 },
  continue: { marginTop: "auto", paddingTop: 6, marginBottom: 2 },
});

import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { router } from "expo-router";
import { DrawingPreview } from "@/components/DrawingPreview";
import { LayoutSlot } from "@/components/layout-slot";
import {
  FlowBackButton,
  FlowHeading,
  FlowPrimaryButton,
  FlowScreen,
  PreviewCard,
  flowColors,
} from "@/components/flow-ui";
import { hasDrawing } from "@/domain/models";
import { useAppState } from "@/state/AppStateProvider";

export default function ReviewScreen() {
  const { fontScale } = useWindowDimensions();
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
      navigation={
        <FlowBackButton
          layoutId="review.back.icon"
          onPress={() => {
            setSelectedAsset("initials");
            router.back();
          }}
        />
      }
      header={
        <LayoutSlot id="review.header" style={styles.header}>
          <FlowHeading style={styles.headingText} layoutId="review.title">
            Review your signing set
          </FlowHeading>
          <LayoutSlot id="review.subtitle">
            <Text
              selectable
              numberOfLines={fontScale > 1.15 ? undefined : 1}
              adjustsFontSizeToFit={fontScale <= 1.15}
              minimumFontScale={0.86}
              style={styles.copy}
            >
              Check both before choosing a background.
            </Text>
          </LayoutSlot>
        </LayoutSlot>
      }
    >
      <View style={styles.previews}>
        <LayoutSlot id="review.signature" style={styles.previewSlot}>
          <PreviewCard
            label="Signature"
            actionLabel="Edit"
            onAction={() => edit("signature")}
            labelLayoutId="review.signature.label"
            actionLayoutId="review.signature.edit"
            contentLayoutId="review.signature.art"
          >
            {signatureExists && activeSet.signature ? (
              <View style={styles.signatureStage}>
                <View
                  accessibilityElementsHidden
                  style={styles.signatureRule}
                />
                <DrawingPreview
                  asset={activeSet.signature}
                  align="baseline"
                  baselineRatio={0.72}
                  style={styles.signature}
                />
              </View>
            ) : (
              <Text style={styles.missing}>Signature not added</Text>
            )}
          </PreviewCard>
        </LayoutSlot>
        <LayoutSlot id="review.initials" style={styles.previewSlot}>
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
  content: {
    paddingTop: 14,
    paddingBottom: 14,
    justifyContent: "center",
  },
  back: { position: "absolute", top: 8, left: 20, zIndex: 3 },
  header: { gap: 3 },
  headingText: { fontSize: 27, lineHeight: 32 },
  copy: {
    fontSize: 14,
    lineHeight: 19,
    color: "#E9E6DC",
    marginTop: 3,
    marginBottom: 8,
  },
  previews: { flex: 1, maxHeight: 540, gap: 12, paddingTop: 2 },
  previewSlot: { flex: 1 },
  signatureStage: {
    width: "94%",
    flex: 1,
    minHeight: 106,
    justifyContent: "flex-end",
    position: "relative",
  },
  signatureRule: {
    position: "absolute",
    left: 8,
    right: 8,
    top: "72%",
    height: 1,
    backgroundColor: flowColors.outline,
  },
  signature: {
    width: "96%",
    height: "100%",
    alignSelf: "center",
  },
  initials: { width: "58%", height: "80%", maxHeight: 120 },
  missing: { color: flowColors.cardMuted, fontSize: 14, lineHeight: 20 },
  continue: {
    marginTop: 10,
  },
});

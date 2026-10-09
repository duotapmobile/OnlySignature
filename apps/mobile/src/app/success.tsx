import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { DrawingPreview } from "@/components/DrawingPreview";
import { LayoutSlot } from "@/components/layout-slot";
import { PaperSurface } from "@/components/paper-ui";
import {
  CheckMark,
  FlowBody,
  FlowHeading,
  FlowPrimaryButton,
  FlowScreen,
  flowColors,
  flowRadii,
  flowShadows,
} from "@/components/flow-ui";
import { hasDrawing } from "@/domain/models";
import { useAppState } from "@/state/AppStateProvider";

export default function ConfirmationScreen() {
  const { activeSet } = useAppState();
  const layerPrefix = "white-confirmation";
  const savedAsset = hasDrawing(activeSet.signature)
    ? activeSet.signature
    : activeSet.initials;
  const finishFlow = () => {
    router.dismissAll();
    router.replace("/saved");
  };

  return (
    <FlowScreen
      scroll={false}
      contentStyle={styles.content}
      testID="white-confirmation-screen"
      header={
        <FlowHeading
          style={styles.headingText}
          layoutId={`${layerPrefix}.title`}
        >
          White Background Set Saved
        </FlowHeading>
      }
    >
      <LayoutSlot id={`${layerPrefix}.message`} style={styles.success}>
        <CheckMark layoutId={`${layerPrefix}.check.icon`} />
        <FlowBody style={styles.copy} layoutId={`${layerPrefix}.subtitle`}>
          {
            "Your signing set is saved on this device.\nYou can return anytime to export it again or unlock transparency."
          }
        </FlowBody>
        {savedAsset ? (
          <PaperSurface style={styles.signatureCard}>
            <View style={styles.signatureStage}>
              <View style={styles.signatureRule} />
              <DrawingPreview
                asset={savedAsset}
                align="baseline"
                baselineRatio={0.72}
                style={styles.signaturePreview}
              />
            </View>
          </PaperSurface>
        ) : null}
        <LayoutSlot id={`${layerPrefix}.actions`} style={styles.actions}>
          <FlowPrimaryButton
            label="Done"
            onPress={finishFlow}
            layoutId={`${layerPrefix}.primary.button`}
            labelLayoutId={`${layerPrefix}.primary.label`}
          />
        </LayoutSlot>
      </LayoutSlot>
    </FlowScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 24,
    justifyContent: "center",
  },
  success: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    alignItems: "center",
  },
  headingText: {
    fontSize: 27,
    lineHeight: 32,
  },
  copy: {
    color: flowColors.cardMuted,
    fontSize: 16,
    lineHeight: 23,
    textAlign: "center",
    marginTop: 12,
    paddingHorizontal: 8,
  },
  signatureCard: {
    width: "100%",
    maxWidth: 370,
    height: 160,
    marginTop: 20,
    borderRadius: flowRadii.card,
    borderWidth: 1,
    borderColor: "rgba(216,182,106,0.58)",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: flowShadows.card,
  },
  signatureStage: { width: "90%", height: 132 },
  signatureRule: {
    position: "absolute",
    left: 8,
    right: 8,
    top: "72%",
    height: 1,
    backgroundColor: "rgba(7,31,90,0.34)",
  },
  signaturePreview: { width: "100%", height: "100%" },
  actions: { marginTop: 20, width: "100%" },
});

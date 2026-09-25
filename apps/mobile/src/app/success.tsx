import { StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { DrawingPreview } from "@/components/DrawingPreview";
import { LayoutSlot } from "@/components/layout-slot";
import { PaperSurface } from "@/components/paper-ui";
import {
  CheckMark,
  FlowBody,
  FlowHeading,
  FlowPrimaryButton,
  FlowScreen,
  FlowTextButton,
  Wordmark,
  flowRadii,
  flowShadows,
} from "@/components/flow-ui";
import { hasDrawing } from "@/domain/models";
import { useAppState } from "@/state/AppStateProvider";

export default function ConfirmationScreen() {
  const { activeSet } = useAppState();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const transparent = mode === "transparent" || mode === "purchased";
  const layerPrefix = transparent
    ? "transparent-confirmation"
    : "white-confirmation";
  const savedAsset = hasDrawing(activeSet.signature)
    ? activeSet.signature
    : activeSet.initials;
  const finishFlow = () => {
    router.dismissAll();
    router.replace("/saved");
  };

  return (
    <FlowScreen
      chrome="none"
      scroll={false}
      contentStyle={styles.content}
      testID={
        transparent
          ? "transparent-confirmation-screen"
          : "white-confirmation-screen"
      }
    >
      <View style={styles.shell}>
        <View style={styles.clip}>
          <View style={styles.inkPanel}>
            <View pointerEvents="none" style={styles.blueGlow} />
            <View pointerEvents="none" style={styles.goldGlow} />
            <Wordmark style={styles.wordmark} />
            <LayoutSlot id={`${layerPrefix}.message`} style={styles.success}>
              <CheckMark layoutId={`${layerPrefix}.check.icon`} />
              <View style={styles.title}>
                <FlowHeading
                  style={styles.headingText}
                  layoutId={`${layerPrefix}.title`}
                >
                  {transparent
                    ? "Transparent Set Unlocked"
                    : "White Background Set Saved"}
                </FlowHeading>
              </View>
              <FlowBody
                style={styles.copy}
                layoutId={`${layerPrefix}.subtitle`}
              >
                {transparent
                  ? "Download this signing set again anytime."
                  : "Your signing set is saved on this device. You can return anytime to export it again or unlock transparency."}
              </FlowBody>
              {savedAsset ? (
                <PaperSurface style={styles.signatureCard}>
                  <View style={styles.signatureRule} />
                  <DrawingPreview
                    asset={savedAsset}
                    align="baseline"
                    style={styles.signaturePreview}
                  />
                </PaperSurface>
              ) : null}
            </LayoutSlot>
          </View>
          <PaperSurface style={styles.actionPanel}>
            <LayoutSlot id={`${layerPrefix}.actions`} style={styles.actions}>
              {transparent ? (
                <FlowPrimaryButton
                  label="Save or Share Files"
                  onPress={() => router.push("/export")}
                  layoutId={`${layerPrefix}.primary.button`}
                  labelLayoutId={`${layerPrefix}.primary.label`}
                />
              ) : (
                <FlowPrimaryButton
                  label="Done"
                  onPress={finishFlow}
                  layoutId={`${layerPrefix}.primary.button`}
                  labelLayoutId={`${layerPrefix}.primary.label`}
                />
              )}
              {transparent ? (
                <FlowTextButton
                  label="Done"
                  onPress={finishFlow}
                  layoutId={`${layerPrefix}.secondary.button`}
                  labelLayoutId={`${layerPrefix}.secondary.label`}
                />
              ) : null}
            </LayoutSlot>
          </PaperSurface>
        </View>
      </View>
    </FlowScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
  },
  shell: {
    flex: 1,
    borderRadius: flowRadii.shell,
    backgroundColor: "#081A35",
    boxShadow: flowShadows.shell,
  },
  clip: {
    flex: 1,
    overflow: "hidden",
    borderRadius: flowRadii.shell,
    borderWidth: 1,
    borderColor: "rgba(216,182,106,0.52)",
  },
  inkPanel: {
    flex: 1,
    minHeight: 360,
    overflow: "hidden",
    backgroundColor: "#0A3D78",
  },
  blueGlow: {
    position: "absolute",
    width: 360,
    height: 360,
    left: -150,
    bottom: -70,
    borderRadius: 180,
    backgroundColor: "rgba(24,117,205,0.28)",
  },
  goldGlow: {
    position: "absolute",
    width: 220,
    height: 220,
    right: -110,
    top: -90,
    borderRadius: 110,
    backgroundColor: "rgba(216,182,106,0.12)",
  },
  wordmark: {
    position: "absolute",
    top: 20,
    right: 24,
    width: 118,
    height: 46,
    zIndex: 3,
  },
  success: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingTop: 62,
    paddingBottom: 28,
  },
  title: { width: "100%", maxWidth: 330, marginTop: 18 },
  headingText: {
    color: "#FFFFFF",
    fontSize: 31,
    lineHeight: 37,
    textAlign: "center",
  },
  copy: {
    color: "#E9E6DC",
    fontSize: 18,
    lineHeight: 26,
    textAlign: "center",
    marginTop: 12,
    paddingHorizontal: 8,
  },
  signatureCard: {
    width: "100%",
    maxWidth: 370,
    minHeight: 134,
    marginTop: 24,
    borderRadius: flowRadii.card,
    borderWidth: 1,
    borderColor: "rgba(216,182,106,0.58)",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: flowShadows.card,
  },
  signatureRule: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 31,
    height: 1,
    backgroundColor: "rgba(7,31,90,0.34)",
  },
  signaturePreview: { width: "90%", height: 108 },
  actionPanel: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 12,
    borderTopLeftRadius: flowRadii.panel,
    borderTopRightRadius: flowRadii.panel,
    marginTop: -18,
    zIndex: 2,
  },
  actions: { gap: 2 },
});

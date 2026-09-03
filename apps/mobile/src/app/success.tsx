import { StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LayoutSlot } from "@/components/layout-slot";
import {
  CaptureBackdrop,
  CheckMark,
  FlowBody,
  FlowHeading,
  FlowPrimaryButton,
  FlowScreen,
  FlowSheet,
  FlowTextButton,
} from "@/components/flow-ui";

export default function ConfirmationScreen() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const transparent = mode === "transparent" || mode === "purchased";
  const layerPrefix = transparent
    ? "transparent-confirmation"
    : "white-confirmation";
  const finishFlow = () => {
    router.dismissAll();
    router.replace("/saved");
  };

  return (
    <FlowScreen
      contentStyle={styles.content}
      testID={
        transparent
          ? "transparent-confirmation-screen"
          : "white-confirmation-screen"
      }
    >
      <CaptureBackdrop initial={transparent} />
      <View accessibilityElementsHidden style={styles.shade} />
      <FlowSheet
        label={
          transparent
            ? "Transparent Set Unlocked"
            : "White Background Set Saved"
        }
        style={styles.sheet}
        layoutId={`${layerPrefix}.sheet`}
        handleLayoutId={`${layerPrefix}.handle`}
      >
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
          <FlowBody style={styles.copy} layoutId={`${layerPrefix}.subtitle`}>
            {transparent
              ? "Download this signing set again anytime."
              : "Your signing set is finalized and saved on this device. Return anytime to unlock the transparent version."}
          </FlowBody>
        </LayoutSlot>
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
      </FlowSheet>
    </FlowScreen>
  );
}

const styles = StyleSheet.create({
  headingText: { fontSize: 32, lineHeight: 38 },
  content: { padding: 0 },
  shade: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(0,0,0,0.62)" },
  sheet: { height: "42%", minHeight: 370, maxHeight: 420 },
  success: { alignItems: "center", paddingTop: 0 },
  title: { marginTop: 6 },
  copy: {
    color: "#E3EAED",
    fontSize: 22,
    lineHeight: 31,
    textAlign: "center",
    marginTop: 6,
    paddingHorizontal: 10,
  },
  actions: { marginTop: "auto", paddingTop: 6, gap: 4 },
});

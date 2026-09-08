import { StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LayoutSlot } from "@/components/layout-slot";
import {
  CheckMark,
  FlowBody,
  FlowHeading,
  FlowPrimaryButton,
  FlowScreen,
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
      scroll={false}
      contentStyle={styles.content}
      testID={
        transparent
          ? "transparent-confirmation-screen"
          : "white-confirmation-screen"
      }
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
            : "Your signing set is saved on this device. You can return anytime to export it again or unlock transparency."}
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
    </FlowScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 72,
    paddingBottom: 28,
    justifyContent: "space-between",
  },
  success: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  title: { marginTop: 18 },
  headingText: { fontSize: 31, lineHeight: 37, textAlign: "center" },
  copy: {
    color: "#E3EAED",
    fontSize: 18,
    lineHeight: 26,
    textAlign: "center",
    marginTop: 12,
    paddingHorizontal: 8,
  },
  actions: { paddingTop: 20, gap: 4 },
});

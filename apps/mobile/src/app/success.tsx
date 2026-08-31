import { StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  CheckMark,
  EntryBackdrop,
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
      <EntryBackdrop />
      <View accessibilityElementsHidden style={styles.shade} />
      <FlowSheet
        label={
          transparent
            ? "Transparent Set Unlocked"
            : "White Background Set Saved"
        }
        style={styles.sheet}
      >
        <View style={styles.success}>
          <CheckMark />
          <View style={styles.title}>
            <FlowHeading>
              {transparent
                ? "Transparent Set Unlocked"
                : "White Background Set Saved"}
            </FlowHeading>
          </View>
          <FlowBody style={styles.copy}>
            {transparent
              ? "Download this signing set again anytime."
              : "Your signing set is finalized and saved on this device. Return anytime to unlock the transparent version."}
          </FlowBody>
        </View>
        <View style={styles.actions}>
          {transparent ? (
            <FlowPrimaryButton
              label="Save or Share Files"
              onPress={() => router.push("/export")}
            />
          ) : (
            <FlowPrimaryButton label="Done" onPress={finishFlow} />
          )}
          {transparent ? (
            <FlowTextButton label="Done" onPress={finishFlow} />
          ) : null}
        </View>
      </FlowSheet>
    </FlowScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 0 },
  shade: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(0,0,0,0.62)" },
  sheet: { top: "28%" },
  success: { alignItems: "center", paddingTop: 30 },
  title: { marginTop: 18 },
  copy: {
    color: "#E3EAED",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 14,
    paddingHorizontal: 10,
  },
  actions: { marginTop: 28 },
});

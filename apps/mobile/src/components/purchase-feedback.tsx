import { StyleSheet, Text, View } from "react-native";
import { InlineStatus } from "./feedback-ui";
import { flowColors } from "./flow-ui";
import { LayoutSlot } from "./layout-slot";
import type { PurchaseFeedback as Feedback } from "@/domain/purchase-feedback";

export function PurchaseFeedback({
  busy,
  unboundPurchase,
  feedback,
  layoutId,
}: {
  busy: boolean;
  unboundPurchase: boolean;
  feedback: Feedback | null;
  layoutId: string;
}) {
  if (busy)
    return (
      <InlineStatus
        message={
          unboundPurchase
            ? "Checking your Apple purchase"
            : "Opening Apple purchase"
        }
        tone="light"
      />
    );
  if (!feedback) return null;
  const isError = feedback.tone === "error";
  return (
    <LayoutSlot id={layoutId}>
      <View
        role={isError ? "alert" : "status"}
        accessibilityLiveRegion={isError ? "assertive" : "polite"}
        style={[styles.message, isError && styles.error]}
        testID="purchase-feedback"
      >
        <Text selectable style={[styles.text, isError && styles.errorText]}>
          {feedback.message}
        </Text>
      </View>
    </LayoutSlot>
  );
}

const styles = StyleSheet.create({
  message: {
    marginTop: 7,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#EEF2F8",
  },
  text: { color: flowColors.cardText, fontSize: 14, lineHeight: 20 },
  error: { backgroundColor: "#FFF1F0" },
  errorText: { color: flowColors.destructive },
});

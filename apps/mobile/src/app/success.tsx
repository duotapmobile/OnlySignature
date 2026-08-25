import { StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  GlassCard,
  Heading,
  PrimaryButton,
  Screen,
  SecondaryButton,
} from "@/components/ui";
import { hasDrawing } from "@/domain/models";
import { theme } from "@/integrations/workspace";
import { useAppState } from "@/state/AppStateProvider";

export default function SuccessScreen() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const { activeSet, product, productStatus } = useAppState();
  const both =
    hasDrawing(activeSet.signature) && hasDrawing(activeSet.initials);
  const onlySignature = hasDrawing(activeSet.signature);
  const line = both
    ? "Your signature and initials are saved."
    : onlySignature
      ? "Your signature is saved."
      : "Your initials are saved.";
  return (
    <Screen>
      <View
        accessible
        accessibilityLabel="Saved successfully"
        style={styles.check}
      >
        <Text style={styles.checkText}>✓</Text>
      </View>
      <Heading>Saved Successfully!</Heading>
      <GlassCard>
        <Text style={styles.line}>{line}</Text>
      </GlassCard>
      <PrimaryButton label="Done" onPress={() => router.replace("/saved")} />
      {mode === "free" &&
      activeSet.status !== "purchased" &&
      productStatus === "available" &&
      product.displayPrice ? (
        <SecondaryButton
          label={`Export Transparent for ${product.displayPrice}`}
          onPress={() => router.replace("/purchase")}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  check: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignSelf: "center",
    backgroundColor: theme.colors.success,
    alignItems: "center",
    justifyContent: "center",
  },
  checkText: { color: theme.colors.white, fontSize: 62, fontWeight: "900" },
  line: {
    color: theme.colors.text,
    fontSize: 21,
    lineHeight: 29,
    fontWeight: "700",
    textAlign: "center",
  },
});

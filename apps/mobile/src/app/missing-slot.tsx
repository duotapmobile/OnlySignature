import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import {
  FlowBackButton,
  FlowBody,
  FlowHeading,
  FlowPrimaryButton,
  FlowScreen,
  FlowTextButton,
  flowColors,
  flowShadows,
} from "@/components/flow-ui";
import { hasDrawing } from "@/domain/models";
import { useAppState } from "@/state/AppStateProvider";

export default function MissingSlotScreen() {
  const { activeSet, setSelectedAsset } = useAppState();
  const missing = hasDrawing(activeSet.signature) ? "initials" : "signature";
  const label = missing === "initials" ? "Initials" : "Signature";

  return (
    <FlowScreen
      contentStyle={styles.content}
      testID="missing-slot-screen"
      navigation={<FlowBackButton onPress={() => router.back()} />}
      header={<FlowHeading>{label} included</FlowHeading>}
    >
      <FlowBody style={styles.copy}>
        Add {missing === "initials" ? "them" : "it"} now or later. You will not
        pay again to fill this included slot.
      </FlowBody>
      <View style={styles.card}>
        <Text selectable style={styles.cardTitle}>
          One complete signing set
        </Text>
        <Text selectable style={styles.cardBody}>
          Your one-time purchase includes one signature and one set of initials.
        </Text>
      </View>
      <View style={styles.actions}>
        <FlowPrimaryButton
          label={`Add ${label}`}
          onPress={() => {
            setSelectedAsset(missing);
            router.replace("/draw");
          }}
        />
        <FlowTextButton
          label="Continue"
          onPress={() => router.push("/purchase")}
        />
      </View>
    </FlowScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 24 },
  copy: { marginTop: 6, color: flowColors.cardMuted },
  card: {
    marginTop: 22,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(216,182,106,0.58)",
    backgroundColor: flowColors.card,
    padding: 18,
    boxShadow: flowShadows.card,
  },
  cardTitle: {
    color: flowColors.cardText,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "800",
  },
  cardBody: {
    color: flowColors.cardMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 5,
  },
  actions: { marginTop: 20, gap: 4 },
});

import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SignatureCanvas } from "@/components/SignatureCanvas";
import { SegmentedControl } from "@/components/SegmentedControl";
import {
  BackLink,
  GlassCard,
  Heading,
  PrimaryButton,
  Screen,
  SecondaryButton,
} from "@/components/ui";
import { hasDrawing } from "@/domain/models";
import { theme } from "@/integrations/workspace";
import { useAppState } from "@/state/AppStateProvider";

const tabs = [
  { value: "signature" as const, label: "Signature" },
  { value: "initials" as const, label: "Initials" },
];

export default function DrawScreen() {
  const { width, height } = useWindowDimensions();
  const { fixture } = useLocalSearchParams<{ fixture?: string }>();
  const { activeSet, data, setSelectedAsset, updateAsset, clearAsset } =
    useAppState();
  const [message, setMessage] = useState<string | null>(null);
  const selected = data.selectedAsset;
  const asset = activeSet[selected];
  const immutable =
    fixture !== "both" &&
    (Boolean(activeSet.pendingPurchaseId) ||
      activeSet.transactionFinishPending ||
      (activeSet.status === "purchased" &&
        activeSet.unclaimedSlot !== selected));
  const continueFlow = () => {
    if (!hasDrawing(activeSet.signature) && !hasDrawing(activeSet.initials)) {
      setMessage("Draw your signature or initials before continuing.");
      return;
    }
    router.push("/preview");
  };
  const confirmClear = () => {
    if (!hasDrawing(asset)) return;
    Alert.alert("Clear this drawing?", undefined, [
      { text: "Keep Drawing", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: () => clearAsset(selected),
      },
    ]);
  };
  return (
    <Screen testID="draw-screen">
      <Heading>
        {selected === "signature"
          ? "Draw Your Signature"
          : "Draw Your Initials"}
      </Heading>
      <Text style={styles.authorizedUse}>
        Use only a signature you are authorized to use.
      </Text>
      <SegmentedControl
        value={selected}
        options={tabs}
        onChange={(kind) => {
          setSelectedAsset(kind);
          setMessage(null);
        }}
        label="Choose what to draw"
      />
      <Text allowFontScaling style={styles.orientation}>
        {width > height
          ? "Landscape gives you more room."
          : "More room is available in landscape."}
      </Text>
      <GlassCard
        style={[
          styles.canvasCard,
          { height: Math.min(430, Math.max(280, height * 0.43)) },
        ]}
      >
        {immutable ? (
          <View style={styles.locked}>
            <Text style={styles.lockedTitle}>
              {activeSet.pendingPurchaseId
                ? "Apple is still processing this purchase."
                : "This purchased drawing stays saved."}
            </Text>
            <Text style={styles.lockedBody}>
              {activeSet.pendingPurchaseId
                ? "This frozen set cannot be changed or purchased again while recovery is in progress."
                : "Choose Create New from Saved to make a changed version."}
            </Text>
          </View>
        ) : asset ? (
          <SignatureCanvas
            key={`${selected}-${hasDrawing(asset) ? "drawn" : "empty"}`}
            asset={asset}
            kind={selected}
            onChange={(strokes, canvasWidth, canvasHeight, orientation) =>
              updateAsset(
                selected,
                strokes,
                canvasWidth,
                canvasHeight,
                orientation,
              )
            }
          />
        ) : null}
      </GlassCard>
      {message ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {message}
        </Text>
      ) : null}
      <View style={styles.actions}>
        <SecondaryButton
          label="🗑  Clear"
          onPress={confirmClear}
          disabled={immutable || !hasDrawing(asset)}
        />
        <PrimaryButton label="Continue" onPress={continueFlow} />
      </View>
      <BackLink onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  orientation: {
    color: theme.colors.white,
    fontSize: 17,
    textAlign: "center",
    fontWeight: "600",
  },
  canvasCard: { minHeight: 280, padding: 10 },
  authorizedUse: {
    color: theme.colors.white,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "700",
  },
  actions: { gap: 10 },
  error: {
    color: "#FFE0DB",
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
  },
  locked: {
    flex: 1,
    minHeight: 250,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 8,
  },
  lockedTitle: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },
  lockedBody: {
    color: theme.colors.muted,
    fontSize: 17,
    lineHeight: 24,
    textAlign: "center",
  },
});

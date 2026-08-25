import { useState } from "react";
import { StyleSheet, Text } from "react-native";
import { router } from "expo-router";
import { DocumentComparison } from "@/components/DocumentComparison";
import { SegmentedControl } from "@/components/SegmentedControl";
import {
  BackLink,
  Body,
  GlassCard,
  Heading,
  PrimaryButton,
  Screen,
} from "@/components/ui";
import { hasDrawing, type AssetKind } from "@/domain/models";
import { sharedCopy, theme } from "@/integrations/workspace";
import { useAppState } from "@/state/AppStateProvider";

export default function PreviewScreen() {
  const { activeSet, fillIncludedSlot } = useAppState();
  const signatureExists = hasDrawing(activeSet.signature);
  const initialsExists = hasDrawing(activeSet.initials);
  const presence =
    signatureExists && initialsExists
      ? "both"
      : initialsExists
        ? "initials"
        : "signature";
  const copy = sharedCopy.flowCopy(presence);
  const [kind, setKind] = useState<AssetKind>(
    signatureExists ? "signature" : "initials",
  );
  const asset = activeSet[kind];
  const options = [
    signatureExists && { value: "signature" as const, label: "Signature" },
    initialsExists && { value: "initials" as const, label: "Initials" },
  ].filter(Boolean) as { value: AssetKind; label: string }[];
  const confirm = async () => {
    if (activeSet.status === "purchased") {
      if (activeSet.unclaimedSlot) {
        const included = activeSet[activeSet.unclaimedSlot];
        if (included && hasDrawing(included))
          await fillIncludedSlot(activeSet.unclaimedSlot, included);
      }
      router.push("/export");
      return;
    }
    if (signatureExists !== initialsExists) {
      router.push("/missing-slot");
      return;
    }
    router.push("/purchase");
  };
  return (
    <Screen testID="preview-screen">
      <Heading>Preview on Document</Heading>
      <Body>
        See exactly how your {kind === "signature" ? "signature" : "initials"}{" "}
        will look.
      </Body>
      {options.length > 1 ? (
        <SegmentedControl<AssetKind>
          value={kind}
          options={options}
          onChange={setKind}
          label="Preview asset"
        />
      ) : null}
      {asset && hasDrawing(asset) ? (
        <GlassCard style={styles.comparison}>
          <Text accessibilityRole="header" style={styles.compareHeading}>
            Compare versions
          </Text>
          <DocumentComparison asset={asset} />
        </GlassCard>
      ) : (
        <Text style={styles.error}>This drawing is empty.</Text>
      )}
      <PrimaryButton
        label={copy.confirm}
        onPress={() => {
          void confirm();
        }}
        disabled={!asset || !hasDrawing(asset)}
      />
      <BackLink onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  comparison: { padding: 12 },
  compareHeading: {
    color: theme.colors.text,
    fontSize: 21,
    fontWeight: "800",
    marginBottom: 10,
  },
  error: { color: theme.colors.white, fontSize: 18 },
});

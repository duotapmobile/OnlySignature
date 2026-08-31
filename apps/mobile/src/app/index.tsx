import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  Feature,
  FlowBody,
  FlowHeading,
  FlowPrimaryButton,
  FlowScreen,
  LockLine,
  ScriptLabel,
} from "@/components/flow-ui";
import { isAuthorizedScreenshotFixture } from "@/config/screenshotFixtures";
import { hasDrawing } from "@/domain/models";
import { confirmAuthorizedUse } from "@/services/authorizedUse";
import { useAppState } from "@/state/AppStateProvider";

export default function EntryScreen() {
  const { data, createNew, setSelectedAsset } = useAppState();
  const { fixture } = useLocalSearchParams<{ fixture?: string }>();
  const entryFixture = isAuthorizedScreenshotFixture(fixture, "landing");
  const hasSavedWork = data.sets.some(
    (set) =>
      set.status === "purchased" ||
      hasDrawing(set.signature) ||
      hasDrawing(set.initials),
  );

  useEffect(() => {
    if (data.hydrated && hasSavedWork && !entryFixture)
      router.replace("/saved");
  }, [data.hydrated, entryFixture, hasSavedWork]);

  const begin = () => {
    if (!data.hydrated) return;
    confirmAuthorizedUse(() => {
      if (hasSavedWork) createNew();
      setSelectedAsset("signature");
      router.push("/draw");
    });
  };

  return (
    <FlowScreen contentStyle={styles.content} testID="entry-screen">
      <View>
        <ScriptLabel asset="sign" />
        <FlowHeading>Without the sign-up.</FlowHeading>
        <FlowBody>Create your reusable signature + initials.</FlowBody>
      </View>
      <View style={styles.features} accessibilityLabel="Privacy benefits">
        <Feature kind="subscription">No{`\n`}Subscription</Feature>
        <Feature kind="upload">No{`\n`}Document Upload</Feature>
        <Feature kind="account">No{`\n`}Account</Feature>
      </View>
      <View style={styles.action}>
        <FlowPrimaryButton
          label="Create My Signing Set"
          onPress={begin}
          accessibilityHint="Opens the signature drawing screen"
          testID="create-signing-set"
          disabled={!data.hydrated}
        />
        <View style={styles.privacy}>
          <LockLine>Saved privately on your device.</LockLine>
        </View>
      </View>
    </FlowScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 54 },
  features: { flexDirection: "row", gap: 12, marginTop: 44 },
  action: { marginTop: 42 },
  privacy: { marginTop: 28 },
});

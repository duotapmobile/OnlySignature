import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LayoutSlot } from "@/components/layout-slot";
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
      <LayoutSlot id="entry.hero" style={styles.hero}>
        <ScriptLabel asset="sign" style={styles.script} layoutId="entry.sign" />
        <FlowHeading style={styles.heroTitle} layoutId="entry.title">
          Without the sign-up.
        </FlowHeading>
        <FlowBody style={styles.intro} layoutId="entry.subtitle">
          Create your reusable signature + initials.
        </FlowBody>
      </LayoutSlot>
      <LayoutSlot
        id="entry.features"
        style={styles.features}
        accessibilityLabel="Privacy benefits"
      >
        <Feature
          kind="subscription"
          iconLayoutId="entry.subscription.icon"
          labelLayoutId="entry.subscription.label"
        >
          No Subscription
        </Feature>
        <Feature
          kind="upload"
          iconLayoutId="entry.upload.icon"
          labelLayoutId="entry.upload.label"
        >
          No Document Upload
        </Feature>
        <Feature
          kind="account"
          iconLayoutId="entry.account.icon"
          labelLayoutId="entry.account.label"
        >
          No Account
        </Feature>
      </LayoutSlot>
      <LayoutSlot id="entry.actions" style={styles.action}>
        <FlowPrimaryButton
          label="Create My Signing Set"
          labelStyle={styles.primaryLabel}
          onPress={begin}
          accessibilityHint="Opens the signature drawing screen"
          testID="create-signing-set"
          disabled={!data.hydrated}
          layoutId="entry.create.button"
          labelLayoutId="entry.create.label"
        />
        <View style={styles.privacy}>
          <LockLine
            iconLayoutId="entry.privacy.icon"
            textLayoutId="entry.privacy.label"
          >
            Saved privately on your device.
          </LockLine>
        </View>
      </LayoutSlot>
    </FlowScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 38,
    paddingBottom: 32,
  },
  hero: { gap: 4 },
  script: { width: 90, height: 64, marginLeft: 2, marginBottom: -5 },
  heroTitle: { fontSize: 32, lineHeight: 38 },
  intro: { marginTop: 2, fontSize: 17, lineHeight: 24 },
  primaryLabel: { fontSize: 17, lineHeight: 23 },
  features: { flexDirection: "row", gap: 20, marginTop: 48 },
  action: { gap: 14, marginTop: "auto" },
  privacy: { marginTop: 2 },
});

import { useCallback, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { AnimatedOpening } from "@/components/animated-opening";
import { LayoutSlot } from "@/components/layout-slot";
import { PaperSurface } from "@/components/paper-ui";
import {
  Feature,
  FlowBody,
  FlowHeading,
  FlowPrimaryButton,
  FlowScreen,
  FlowTextButton,
  LockLine,
} from "@/components/flow-ui";
import { isAuthorizedScreenshotFixture } from "@/config/screenshotFixtures";
import { hasDrawing } from "@/domain/models";
import { useAppState } from "@/state/AppStateProvider";

const wordmarkSource = require("../../assets/brand/only-signature-wordmark-paper.png");
const signatureSource = require("../../assets/samples/taylor-brooks-signature.png");
let hasShownOpening = false;

export default function EntryScreen() {
  const { data, createNew, setSelectedAsset } = useAppState();
  const { fixture } = useLocalSearchParams<{ fixture?: string }>();
  const entryFixture = isAuthorizedScreenshotFixture(fixture, "landing");
  const [showOpening, setShowOpening] = useState(
    !entryFixture && !hasShownOpening,
  );
  const hasSavedWork = data.sets.some(
    (set) =>
      set.status === "purchased" ||
      hasDrawing(set.signature) ||
      hasDrawing(set.initials),
  );

  const finishOpening = useCallback(() => {
    hasShownOpening = true;
    setShowOpening(false);
  }, []);

  const begin = () => {
    if (!data.hydrated) return;
    if (hasSavedWork) createNew();
    setSelectedAsset("signature");
    router.push("/draw");
  };

  if (showOpening) {
    return <AnimatedOpening onFinished={finishOpening} />;
  }

  return (
    <FlowScreen
      scroll={false}
      contentStyle={styles.content}
      testID="entry-screen"
    >
      <LayoutSlot id="entry.hero" style={styles.hero}>
        <PaperSurface folded style={styles.heroPaper}>
          <Image
            source={wordmarkSource}
            accessibilityLabel="Only Signature"
            resizeMode="contain"
            style={styles.wordmark}
          />
          <View style={styles.heroCopy}>
            <LayoutSlot id="entry.sign">
              <Text style={styles.sign}>Sign.</Text>
            </LayoutSlot>
            <FlowHeading style={styles.heroTitle} layoutId="entry.title">
              Without the sign-up.
            </FlowHeading>
            <FlowBody style={styles.intro} layoutId="entry.subtitle">
              Create your reusable signature + initials.
            </FlowBody>
          </View>
          <View style={styles.sampleRow}>
            <Text style={styles.sampleLabel}>Signature</Text>
            <View style={styles.sampleSticker}>
              <Image
                source={signatureSource}
                accessibilityLabel="Sample signature"
                resizeMode="contain"
                style={styles.sampleSignature}
              />
              <View style={styles.sampleLine} />
            </View>
          </View>
        </PaperSurface>
      </LayoutSlot>
      <LayoutSlot
        id="entry.features"
        style={styles.features}
        accessibilityLabel="Privacy benefits"
      >
        <Feature
          kind="account"
          iconLayoutId="entry.account.icon"
          labelLayoutId="entry.account.label"
        >
          No Account
        </Feature>
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
        {hasSavedWork ? (
          <FlowTextButton
            label="My Signing Sets"
            onPress={() => router.push("/saved")}
            disabled={!data.hydrated}
          />
        ) : null}
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
  content: { paddingTop: 12, paddingBottom: 24 },
  hero: { width: "100%" },
  heroPaper: {
    minHeight: 446,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 22,
    borderWidth: 1,
    borderColor: "rgba(216,182,106,0.48)",
    boxShadow: "0 24px 48px rgba(0, 37, 43, 0.4)",
  },
  wordmark: {
    width: 130,
    height: 56,
    alignSelf: "flex-end",
    zIndex: 6,
  },
  heroCopy: { marginTop: 52 },
  sign: {
    color: "#071F5A",
    fontFamily: "Georgia",
    fontSize: 58,
    lineHeight: 66,
    fontWeight: "700",
    letterSpacing: -2.2,
    marginBottom: -7,
  },
  heroTitle: {
    color: "#071F5A",
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.8,
  },
  intro: {
    color: "#183B67",
    marginTop: 10,
    fontSize: 18,
    lineHeight: 25,
    maxWidth: 300,
  },
  sampleRow: {
    marginTop: "auto",
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  sampleLabel: {
    color: "#071F5A",
    fontFamily: "Georgia",
    fontSize: 17,
    fontStyle: "italic",
    marginBottom: 10,
  },
  sampleSticker: {
    flex: 1,
    height: 72,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(7,31,90,0.2)",
    backgroundColor: "rgba(255,255,255,0.56)",
    paddingHorizontal: 8,
    justifyContent: "center",
    boxShadow: "0 8px 16px rgba(0,0,0,0.15)",
  },
  sampleSignature: { width: "100%", height: 58, zIndex: 2 },
  sampleLine: {
    height: 1,
    backgroundColor: "rgba(7,31,90,0.48)",
    marginTop: -13,
  },
  primaryLabel: { fontSize: 17, lineHeight: 23 },
  features: { gap: 5, marginTop: 25, paddingHorizontal: 12 },
  action: { gap: 7, marginTop: "auto", paddingTop: 20 },
  privacy: { marginTop: 2 },
});

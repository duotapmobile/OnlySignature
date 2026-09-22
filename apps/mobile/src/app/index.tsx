import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { router, useGlobalSearchParams } from "expo-router";
import { AnimatedOpening } from "@/components/animated-opening";
import { FlowScreen } from "@/components/flow-ui";
import { LayoutSlot } from "@/components/layout-slot";
import { WelcomeFoldedPanel } from "@/components/welcome-folded-panel";
import { LoadingMark } from "@/components/feedback-ui";
import { isAuthorizedScreenshotFixture } from "@/config/screenshotFixtures";
import { hasDrawing } from "@/domain/models";
import { useAppState } from "@/state/AppStateProvider";

let hasShownOpening = false;

export default function EntryScreen() {
  const { data, createNew, setSelectedAsset, markOpeningSeen } = useAppState();
  const { fixture } = useGlobalSearchParams<{ fixture?: string | string[] }>();
  const fixtureName = Array.isArray(fixture) ? fixture[0] : fixture;
  const landingFixture = isAuthorizedScreenshotFixture(fixtureName, "landing");
  const openingFixture = isAuthorizedScreenshotFixture(fixtureName, "opening");
  const [showOpening, setShowOpening] = useState(
    openingFixture || (!landingFixture && !hasShownOpening),
  );
  const hasSavedWork = data.sets.some(
    (set) =>
      set.status === "purchased" ||
      hasDrawing(set.signature) ||
      hasDrawing(set.initials),
  );

  const finishOpening = useCallback(() => {
    hasShownOpening = true;
    if (!data.hasSeenFullOpening) markOpeningSeen();
    setShowOpening(false);
  }, [data.hasSeenFullOpening, markOpeningSeen]);

  const begin = () => {
    if (!data.hydrated) return;
    if (hasSavedWork) createNew();
    setSelectedAsset("signature");
    router.push("/draw");
  };

  if (!data.hydrated) {
    return (
      <View style={styles.startup}>
        <LoadingMark />
        <Text style={styles.startupText}>Opening your signing space</Text>
      </View>
    );
  }

  if (showOpening) {
    return (
      <AnimatedOpening
        onFinished={finishOpening}
        previewFrame={openingFixture}
        compact={data.hasSeenFullOpening && !openingFixture}
      />
    );
  }

  return (
    <FlowScreen
      chrome="none"
      scroll={false}
      contentStyle={styles.content}
      testID="entry-screen"
    >
      <LayoutSlot id="entry.hero" style={styles.heroSlot}>
        <WelcomeFoldedPanel
          disabled={!data.hydrated}
          onBegin={begin}
          onOpenSaved={() => router.push("/saved")}
        />
      </LayoutSlot>
    </FlowScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
  heroSlot: { flex: 1 },
  startup: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
    backgroundColor: "#02040A",
  },
  startupText: {
    color: "#F8F6EF",
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
  },
});

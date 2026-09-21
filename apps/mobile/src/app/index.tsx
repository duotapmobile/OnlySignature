import { useCallback, useState } from "react";
import { StyleSheet } from "react-native";
import { router, useGlobalSearchParams } from "expo-router";
import { AnimatedOpening } from "@/components/animated-opening";
import { FlowScreen } from "@/components/flow-ui";
import { LayoutSlot } from "@/components/layout-slot";
import { WelcomeFoldedPanel } from "@/components/welcome-folded-panel";
import { isAuthorizedScreenshotFixture } from "@/config/screenshotFixtures";
import { hasDrawing } from "@/domain/models";
import { useAppState } from "@/state/AppStateProvider";

let hasShownOpening = false;

export default function EntryScreen() {
  const { data, createNew, setSelectedAsset } = useAppState();
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
    setShowOpening(false);
  }, []);

  const begin = () => {
    if (!data.hydrated) return;
    if (hasSavedWork) createNew();
    setSelectedAsset("signature");
    router.push("/draw");
  };

  if (showOpening) {
    return (
      <AnimatedOpening
        onFinished={finishOpening}
        previewFrame={openingFixture}
      />
    );
  }

  return (
    <FlowScreen
      chrome="none"
      contentStyle={styles.content}
      testID="entry-screen"
    >
      <LayoutSlot id="entry.hero">
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
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 4,
  },
});

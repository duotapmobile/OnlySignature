import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { DrawingPreview } from "@/components/DrawingPreview";
import { LayoutSlot } from "@/components/layout-slot";
import {
  FlowBackButton,
  FlowHeading,
  FlowPrimaryButton,
  FlowScreen,
  FlowTextButton,
  ScriptLabel,
  flowColors,
  flowRadii,
  flowShadows,
} from "@/components/flow-ui";
import { isAuthorizedScreenshotFixture } from "@/config/screenshotFixtures";
import { useTransparentPurchase } from "@/hooks/use-transparent-purchase";
import { hapticSelection } from "@/services/haptics";
import { InlineStatus } from "@/components/feedback-ui";
import { hasDrawing, type DrawingAsset } from "@/domain/models";
import { useAppState } from "@/state/AppStateProvider";

type Background = "transparent" | "white";

function CheckerSwatch() {
  return (
    <View accessibilityElementsHidden style={[styles.swatch, styles.checker]}>
      {Array.from({ length: 16 }, (_, index) => (
        <View
          key={index}
          style={[
            styles.checkerSquare,
            {
              backgroundColor:
                (Math.floor(index / 4) + index) % 2 === 0
                  ? "#F5F5F5"
                  : "#CFCFCF",
            },
          ]}
        />
      ))}
    </View>
  );
}

function BackgroundChoice({
  value,
  selected,
  title,
  description,
  price,
  asset,
  compact,
  onSelect,
  layerPrefix,
}: {
  value: Background;
  selected: boolean;
  title: string;
  description: string;
  price?: string;
  asset?: DrawingAsset | null;
  compact?: boolean;
  onSelect(): void;
  layerPrefix: string;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={`${title}. ${description}${price ? ` ${price}` : ""}`}
      accessibilityState={{ checked: selected }}
      onPress={onSelect}
      style={({ pressed }) => [
        styles.choice,
        compact && styles.choiceCompact,
        selected && styles.choiceSelected,
        pressed && styles.pressed,
      ]}
    >
      <View
        style={[styles.choiceHeader, compact && styles.choiceHeaderCompact]}
      >
        <LayoutSlot id={`${layerPrefix}.swatch`}>
          {value === "transparent" ? (
            <CheckerSwatch />
          ) : (
            <View
              accessibilityElementsHidden
              style={[styles.swatch, styles.whiteSwatch]}
            />
          )}
        </LayoutSlot>
        <View style={styles.choiceCopy}>
          <View style={styles.choiceTitleRow}>
            <LayoutSlot id={`${layerPrefix}.title`}>
              <Text selectable style={styles.choiceTitle}>
                {title}
              </Text>
            </LayoutSlot>
            {value === "transparent" ? (
              <LayoutSlot id={`${layerPrefix}.tag`}>
                <Text style={styles.tag}>Recommended</Text>
              </LayoutSlot>
            ) : null}
          </View>
          <View style={styles.descriptionRow}>
            <LayoutSlot
              id={`${layerPrefix}.description`}
              style={styles.descriptionSlot}
            >
              <Text selectable style={styles.choiceDescription}>
                {description}
              </Text>
            </LayoutSlot>
            {price ? (
              <LayoutSlot id={`${layerPrefix}.price`}>
                <Text selectable style={styles.price}>
                  {price}
                </Text>
              </LayoutSlot>
            ) : null}
          </View>
        </View>
        <LayoutSlot id={`${layerPrefix}.radio`}>
          <View
            accessibilityElementsHidden
            style={[styles.radio, selected && styles.radioSelected]}
          >
            {selected ? <View style={styles.radioDot} /> : null}
          </View>
        </LayoutSlot>
      </View>
      <View
        accessibilityElementsHidden
        style={[
          styles.optionPreview,
          compact && styles.optionPreviewCompact,
          value === "transparent"
            ? styles.transparentPreview
            : styles.whitePreview,
        ]}
      >
        <View style={styles.previewRule} />
        {asset ? (
          <DrawingPreview
            asset={asset}
            align="baseline"
            style={styles.optionArt}
          />
        ) : null}
        <View style={styles.previewDateRule} />
      </View>
    </Pressable>
  );
}

export default function BackgroundScreen() {
  const { height } = useWindowDimensions();
  const compact = height <= 700;
  const { activeSet } = useAppState();
  const { fixture } = useLocalSearchParams<{ fixture?: string }>();
  const purchaseErrorFixture = isAuthorizedScreenshotFixture(
    fixture,
    "purchase-error",
  );
  const purchaseFixture = isAuthorizedScreenshotFixture(fixture, [
    "both",
    "signature",
    "purchase-error",
  ]);
  const [background, setBackground] = useState<Background>("transparent");
  const optionAsset = hasDrawing(activeSet.signature)
    ? activeSet.signature
    : activeSet.initials;
  const {
    beginPurchase,
    busy,
    clearError,
    displayPrice,
    error,
    transparentUnavailable,
    unboundPurchase,
  } = useTransparentPurchase({
    initialError: purchaseErrorFixture
      ? "Transparent Background is temporarily unavailable. Your signing set is safe. Try again or continue with white."
      : null,
    suppressSuccessRedirect: purchaseFixture,
  });

  const continueFlow = () => {
    if (background === "white") router.push("/clear-background" as never);
    else void beginPurchase();
  };

  return (
    <FlowScreen
      scroll={false}
      contentStyle={styles.content}
      testID="background-screen"
    >
      <View style={styles.back}>
        <FlowBackButton
          onPress={() => router.back()}
          layoutId="background.back.icon"
        />
      </View>
      <LayoutSlot id="background.header" style={styles.header}>
        <ScriptLabel
          asset="select"
          style={styles.script}
          layoutId="background.script"
        />
        <FlowHeading style={styles.headingText} layoutId="background.title">
          Choose a background
        </FlowHeading>
      </LayoutSlot>
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel="Background format"
        style={[styles.options, compact && styles.optionsCompact]}
      >
        <LayoutSlot id="background.transparent" style={styles.choiceSlot}>
          <BackgroundChoice
            value="transparent"
            selected={background === "transparent"}
            title="Transparent Background"
            description="Sits cleanly over lines, dates, and text."
            price={displayPrice}
            asset={optionAsset}
            compact={compact}
            layerPrefix="background.transparent"
            onSelect={() => {
              void hapticSelection();
              setBackground("transparent");
              clearError();
            }}
          />
        </LayoutSlot>
        <LayoutSlot id="background.white" style={styles.choiceSlot}>
          <BackgroundChoice
            value="white"
            selected={background === "white"}
            title="White Background"
            description="May cover anything behind your signature."
            asset={optionAsset}
            compact={compact}
            layerPrefix="background.white"
            onSelect={() => {
              void hapticSelection();
              setBackground("white");
              clearError();
            }}
          />
        </LayoutSlot>
      </View>
      {busy ? (
        <InlineStatus
          message={
            unboundPurchase
              ? "Checking your Apple purchase"
              : "Opening Apple purchase"
          }
          tone="light"
        />
      ) : null}
      {error ? (
        <LayoutSlot id="background.error">
          <Text
            accessibilityRole="alert"
            maxFontSizeMultiplier={1.12}
            style={styles.error}
          >
            {error}
          </Text>
        </LayoutSlot>
      ) : null}
      <LayoutSlot
        id="background.actions"
        style={[styles.actions, compact && styles.actionsCompact]}
      >
        <FlowPrimaryButton
          label={
            busy
              ? unboundPurchase
                ? "Applying Apple Purchase..."
                : "Opening Apple Purchase..."
              : background === "transparent"
                ? unboundPurchase
                  ? "Apply Apple Purchase to This Set"
                  : "Purchase Transparent"
                : "Continue With White Background"
          }
          onPress={continueFlow}
          disabled={
            busy || (background === "transparent" && transparentUnavailable)
          }
          loading={busy}
          layoutId="background.primary.button"
          labelLayoutId="background.primary.label"
        />
        <FlowTextButton
          label={
            background === "transparent"
              ? "Continue With White Background"
              : "Choose Transparent Instead"
          }
          onPress={() => {
            if (background === "transparent")
              router.push("/clear-background" as never);
            else {
              void hapticSelection();
              setBackground("transparent");
            }
          }}
          disabled={busy}
          layoutId="background.secondary.button"
          labelLayoutId="background.secondary.label"
        />
      </LayoutSlot>
    </FlowScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 16, paddingBottom: 14 },
  back: { position: "absolute", top: 8, left: 20, zIndex: 3 },
  header: { marginTop: 32 },
  script: { marginBottom: 7 },
  headingText: { fontSize: 27, lineHeight: 32 },
  options: { flex: 1, gap: 14, marginTop: 14, paddingBottom: 10 },
  optionsCompact: { gap: 8, marginTop: 8, paddingBottom: 2 },
  choiceSlot: { flex: 1 },
  choice: {
    flex: 1,
    minHeight: 124,
    borderWidth: 1,
    borderColor: flowColors.outline,
    borderRadius: flowRadii.card,
    padding: 17,
    gap: 12,
    backgroundColor: flowColors.card,
    boxShadow: flowShadows.card,
  },
  choiceCompact: { minHeight: 106, padding: 12, gap: 7 },
  choiceHeader: {
    flexDirection: "row",
    gap: 13,
    alignItems: "center",
  },
  choiceHeaderCompact: { gap: 10 },
  choiceSelected: {
    borderWidth: 1.5,
    borderColor: flowColors.cyan,
    backgroundColor: "#FFF9E8",
  },
  pressed: { opacity: 0.76 },
  swatch: {
    width: 62,
    height: 62,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#CCD3D6",
    overflow: "hidden",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  checker: { backgroundColor: "#FFF" },
  checkerSquare: { width: 15.5, height: 15.5 },
  whiteSwatch: { backgroundColor: "#FFF" },
  choiceCopy: { flex: 1, minWidth: 0 },
  choiceTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flexWrap: "wrap",
  },
  choiceTitle: {
    color: flowColors.cardText,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "700",
  },
  tag: {
    color: flowColors.accessibleLink,
    borderWidth: 1,
    borderColor: flowColors.cyan,
    borderRadius: 7,
    paddingHorizontal: 5,
    paddingVertical: 1,
    fontSize: 10,
    lineHeight: 13,
  },
  descriptionRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 7,
    marginTop: 4,
  },
  descriptionSlot: { flex: 1 },
  choiceDescription: {
    color: flowColors.cardMuted,
    fontSize: 14,
    lineHeight: 19,
    flex: 1,
  },
  price: { color: flowColors.accessibleLink, fontSize: 14, lineHeight: 19 },
  radio: {
    width: 24,
    height: 24,
    borderWidth: 1.5,
    borderColor: flowColors.ink,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  radioSelected: { borderColor: flowColors.cyan },
  radioDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: flowColors.cyan,
  },
  optionPreview: {
    flex: 1,
    minHeight: 74,
    overflow: "hidden",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(7,31,90,0.10)",
    justifyContent: "center",
    alignItems: "center",
  },
  optionPreviewCompact: { minHeight: 46 },
  transparentPreview: { backgroundColor: "#E9EEF0" },
  whitePreview: { backgroundColor: "#FFFFFF" },
  previewRule: {
    position: "absolute",
    left: 18,
    right: 18,
    top: "54%",
    height: 1,
    backgroundColor: "rgba(7,31,90,0.54)",
  },
  previewDateRule: {
    position: "absolute",
    left: 18,
    width: "38%",
    bottom: 13,
    height: 1,
    backgroundColor: "rgba(7,31,90,0.26)",
  },
  optionArt: { width: "84%", height: "82%" },
  error: {
    color: flowColors.destructive,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 7,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#FFF1F0",
    textAlign: "left",
  },
  retryNote: {
    color: "#F0F5F2",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 8,
    textAlign: "center",
  },
  actions: {
    marginTop: 4,
    padding: 8,
    paddingBottom: 2,
    borderRadius: flowRadii.card,
    borderWidth: 1,
    borderColor: "rgba(7,31,90,0.08)",
    backgroundColor: "rgba(255,255,255,0.54)",
    boxShadow: flowShadows.card,
    gap: 0,
  },
  actionsCompact: { marginTop: 2, paddingTop: 4, paddingBottom: 0 },
});

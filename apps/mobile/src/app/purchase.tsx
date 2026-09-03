import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LayoutSlot } from "@/components/layout-slot";
import {
  FlowBackButton,
  FlowHeading,
  FlowPrimaryButton,
  FlowScreen,
  FlowSheet,
  FlowTextButton,
  ReviewBackdrop,
  ScriptLabel,
  flowColors,
} from "@/components/flow-ui";
import { isAuthorizedScreenshotFixture } from "@/config/screenshotFixtures";
import { useTransparentPurchase } from "@/hooks/use-transparent-purchase";

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
  onSelect,
  layerPrefix,
}: {
  value: Background;
  selected: boolean;
  title: string;
  description: string;
  price?: string;
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
        selected && styles.choiceSelected,
        pressed && styles.pressed,
      ]}
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
    </Pressable>
  );
}
export default function BackgroundScreen() {
  const { fixture } = useLocalSearchParams<{ fixture?: string }>();
  const purchaseFixture = isAuthorizedScreenshotFixture(fixture, [
    "both",
    "signature",
  ]);
  const [background, setBackground] = useState<Background>("transparent");
  const {
    beginPurchase,
    busy,
    clearError,
    displayPrice,
    error,
    transparentUnavailable,
    unboundPurchase,
  } = useTransparentPurchase({ suppressSuccessRedirect: purchaseFixture });

  const continueFlow = () => {
    if (background === "white") router.push("/clear-background" as never);
    else void beginPurchase();
  };

  return (
    <FlowScreen contentStyle={styles.content} testID="background-screen">
      <ReviewBackdrop />
      <View accessibilityElementsHidden style={styles.shade} />
      <FlowSheet
        label="Choose Your Background"
        style={styles.sheet}
        layoutId="background.sheet"
        handleLayoutId="background.handle"
      >
        <View style={styles.sheetBack}>
          <FlowBackButton
            onPress={() => router.back()}
            layoutId="background.back.icon"
          />
        </View>
        <LayoutSlot id="background.header">
          <ScriptLabel
            asset="select"
            style={styles.script}
            layoutId="background.script"
          />
          <FlowHeading style={styles.headingText} layoutId="background.title">
            Choose Your Background
          </FlowHeading>
        </LayoutSlot>
        <View
          accessibilityRole="radiogroup"
          accessibilityLabel="Background format"
          style={styles.options}
        >
          <LayoutSlot id="background.transparent">
            <BackgroundChoice
              value="transparent"
              selected={background === "transparent"}
              title="Transparent Background"
              description="Sits cleanly over lines, dates, and text."
              price={displayPrice}
              layerPrefix="background.transparent"
              onSelect={() => {
                setBackground("transparent");
                clearError();
              }}
            />
          </LayoutSlot>
          <LayoutSlot id="background.white">
            <BackgroundChoice
              value="white"
              selected={background === "white"}
              title="White Background"
              description="May cover anything behind your signature."
              layerPrefix="background.white"
              onSelect={() => {
                setBackground("white");
                clearError();
              }}
            />
          </LayoutSlot>
        </View>
        {error ? (
          <LayoutSlot id="background.error">
            <Text accessibilityRole="alert" style={styles.error}>
              {error}
            </Text>
          </LayoutSlot>
        ) : null}
        <LayoutSlot id="background.actions" style={styles.actions}>
          <FlowPrimaryButton
            label={
              busy
                ? unboundPurchase
                  ? "Applying Apple Purchase…"
                  : "Opening Apple Purchase…"
                : background === "transparent"
                  ? unboundPurchase
                    ? "Apply Apple Purchase to This Set"
                    : `Unlock Transparent Set · ${displayPrice}`
                  : "Continue With White Background"
            }
            onPress={continueFlow}
            disabled={
              busy || (background === "transparent" && transparentUnavailable)
            }
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
              else setBackground("transparent");
            }}
            disabled={busy}
            layoutId="background.secondary.button"
            labelLayoutId="background.secondary.label"
          />
        </LayoutSlot>
      </FlowSheet>
    </FlowScreen>
  );
}

const styles = StyleSheet.create({
  headingText: { fontSize: 32, lineHeight: 38 },
  content: { padding: 0 },
  shade: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(0,0,0,0.62)" },
  sheet: { top: "33%" },
  sheetBack: { position: "absolute", top: 2, left: 20, zIndex: 3 },
  script: { width: 122, height: 60, marginLeft: 52, marginBottom: -6 },
  options: { gap: 18, marginTop: 24 },
  choice: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: flowColors.outline,
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
    boxShadow: "0 14px 30px rgba(0, 0, 0, 0.28)",
  },
  choiceSelected: { minHeight: 124, borderColor: flowColors.cyan },
  pressed: { opacity: 0.76 },
  swatch: {
    width: 64,
    height: 64,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#CCD3D6",
    overflow: "hidden",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  checker: { backgroundColor: "#FFF" },
  checkerSquare: { width: 16, height: 16 },
  whiteSwatch: { backgroundColor: "#FFF" },
  choiceCopy: { flex: 1, minWidth: 0 },
  choiceTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flexWrap: "wrap",
  },
  choiceTitle: {
    color: flowColors.white,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "700",
  },
  tag: {
    color: flowColors.cyanText,
    borderWidth: 1,
    borderColor: flowColors.cyan,
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    fontSize: 11,
    lineHeight: 14,
  },
  descriptionRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginTop: 5,
  },
  descriptionSlot: { flex: 1 },
  choiceDescription: {
    color: "#DCE3E5",
    fontSize: 15,
    lineHeight: 20,
    flex: 1,
  },
  price: { color: flowColors.cyanText, fontSize: 15, lineHeight: 20 },
  radio: {
    width: 26,
    height: 26,
    borderWidth: 1.5,
    borderColor: "#FFF",
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  radioSelected: { borderColor: flowColors.cyan },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: flowColors.cyan,
  },
  error: { color: "#FFD8D2", fontSize: 14, lineHeight: 20, marginTop: 10 },
  actions: { marginTop: "auto", paddingTop: 24, marginBottom: 28, gap: 6 },
});

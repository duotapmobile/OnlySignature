import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LayoutSlot } from "@/components/layout-slot";
import {
  FlowBackButton,
  FlowHeading,
  FlowPrimaryButton,
  FlowScreen,
  FlowTextButton,
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
    productNeedsRetry,
    transparentUnavailable,
    unboundPurchase,
  } = useTransparentPurchase({ suppressSuccessRedirect: purchaseFixture });

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
      ) : background === "transparent" && productNeedsRetry ? (
        <LayoutSlot id="background.retry-note">
          <Text selectable style={styles.retryNote}>
            Apple pricing refreshes when you tap Unlock.
          </Text>
        </LayoutSlot>
      ) : null}
      <LayoutSlot id="background.actions" style={styles.actions}>
        <FlowPrimaryButton
          label={
            busy
              ? unboundPurchase
                ? "Applying Apple Purchase..."
                : "Opening Apple Purchase..."
              : background === "transparent"
                ? unboundPurchase
                  ? "Apply Apple Purchase to This Set"
                  : productNeedsRetry
                    ? "Try Transparent Purchase Again"
                    : `Unlock Transparent Set - ${displayPrice}`
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
    </FlowScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 18, paddingBottom: 18 },
  back: { position: "absolute", top: 8, left: 20, zIndex: 3 },
  header: { marginTop: 32 },
  script: { width: 106, height: 44, marginLeft: 30, marginBottom: -3 },
  headingText: { fontSize: 27, lineHeight: 32 },
  options: { gap: 12, marginTop: 18 },
  choice: {
    minHeight: 116,
    borderWidth: 1,
    borderColor: flowColors.outline,
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    gap: 13,
    alignItems: "center",
    backgroundColor: "rgba(6, 26, 36, 0.72)",
    boxShadow: "0 14px 30px rgba(0, 0, 0, 0.28)",
  },
  choiceSelected: { borderColor: flowColors.cyan, backgroundColor: "#082631" },
  pressed: { opacity: 0.76 },
  swatch: {
    width: 54,
    height: 54,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#CCD3D6",
    overflow: "hidden",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  checker: { backgroundColor: "#FFF" },
  checkerSquare: { width: 13.5, height: 13.5 },
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
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "700",
  },
  tag: {
    color: flowColors.cyanText,
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
    color: "#DCE3E5",
    fontSize: 14,
    lineHeight: 19,
    flex: 1,
  },
  price: { color: flowColors.cyanText, fontSize: 14, lineHeight: 19 },
  radio: {
    width: 24,
    height: 24,
    borderWidth: 1.5,
    borderColor: "#FFF",
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
  error: {
    color: "#FFD8D2",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
    textAlign: "center",
  },
  retryNote: {
    color: "#DCE3E5",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 8,
    textAlign: "center",
  },
  actions: { marginTop: "auto", paddingTop: 10, marginBottom: 2, gap: 2 },
});

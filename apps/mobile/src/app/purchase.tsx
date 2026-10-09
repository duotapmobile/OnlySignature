import { useState } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { DocumentSignaturePreview } from "@/components/document-signature-preview";
import { LayoutSlot } from "@/components/layout-slot";
import { PurchaseAction } from "@/components/purchase-action";
import { PurchaseFeedback } from "@/components/purchase-feedback";
import {
  FlowBackButton,
  FlowHeading,
  FlowPrimaryButton,
  FlowScreen,
  FlowTextButton,
  flowColors,
  flowRadii,
  flowShadows,
} from "@/components/flow-ui";
import { isAuthorizedScreenshotFixture } from "@/config/screenshotFixtures";
import { useTransparentPurchase } from "@/hooks/use-transparent-purchase";
import { hapticSelection } from "@/services/haptics";
import { hasDrawing, type DrawingAsset } from "@/domain/models";
import { useAppState } from "@/state/AppStateProvider";
import { FocusPressable as Pressable } from "@/components/FocusPressable";

type Background = "transparent" | "white";

function BackgroundChoice({
  value,
  selected,
  title,
  description,
  asset,
  compact = false,
  recoveryCompact = false,
  disabled = false,
  onSelect,
  layerPrefix,
}: {
  value: Background;
  selected: boolean;
  title: string;
  description: string;
  asset?: DrawingAsset | null;
  compact?: boolean;
  recoveryCompact?: boolean;
  disabled?: boolean;
  onSelect(): void;
  layerPrefix: string;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={`${title}. ${description}`}
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      onPress={onSelect}
      style={({ pressed }) => [
        styles.choice,
        compact && styles.choiceCompact,
        recoveryCompact && styles.recoveryChoice,
        selected && styles.choiceSelected,
        disabled && styles.choiceDisabled,
        pressed && styles.pressed,
      ]}
    >
      <View
        style={[styles.choiceHeader, compact && styles.choiceHeaderCompact]}
      >
        <LayoutSlot id={`${layerPrefix}.swatch`}>
          {value === "transparent" ? (
            <View
              accessibilityElementsHidden
              style={[
                styles.swatch,
                styles.transparentSwatch,
                recoveryCompact && styles.recoverySwatch,
              ]}
            >
              <Text allowFontScaling={false} style={styles.swatchLabel}>
                T
              </Text>
            </View>
          ) : (
            <View
              accessibilityElementsHidden
              style={[
                styles.swatch,
                styles.whiteSwatch,
                recoveryCompact && styles.recoverySwatch,
              ]}
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
          <LayoutSlot
            id={`${layerPrefix}.description`}
            style={styles.descriptionSlot}
          >
            <Text selectable style={styles.choiceDescription}>
              {description}
            </Text>
          </LayoutSlot>
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
      {asset ? (
        <DocumentSignaturePreview
          asset={asset}
          background={value}
          compact={compact}
        />
      ) : null}
    </Pressable>
  );
}

export default function BackgroundScreen() {
  const { height, fontScale } = useWindowDimensions();
  const compact = height <= 860;
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
    "purchase-pending",
    "purchase-interrupted",
    "purchase-finishing",
    "purchase-other-set",
    "product-loading",
    "product-unavailable",
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
    productStatus,
    retryProduct,
    feedback,
    transparentUnavailable,
    unboundPurchase,
  } = useTransparentPurchase({
    initialError: purchaseErrorFixture
      ? "Transparent Background is temporarily unavailable. Your signing set is safe. Try again or continue with white."
      : null,
    suppressSuccessRedirect: purchaseFixture,
  });
  const compactRecovery =
    Boolean(feedback) && height <= 700 && fontScale <= 1.15;

  const continueFlow = () => {
    if (background === "white") router.push("/clear-background" as never);
    else void beginPurchase();
  };

  return (
    <FlowScreen
      scroll={Boolean(feedback)}
      contentStyle={[styles.content, compactRecovery && styles.recoveryContent]}
      testID="background-screen"
      navigation={
        <FlowBackButton
          onPress={() => router.back()}
          layoutId="background.back.icon"
        />
      }
      header={
        <LayoutSlot id="background.header" style={styles.header}>
          <FlowHeading style={styles.headingText} layoutId="background.title">
            Choose a background
          </FlowHeading>
        </LayoutSlot>
      }
    >
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel="Background format"
        style={[
          styles.options,
          compact && styles.optionsCompact,
          compactRecovery && styles.recoveryOptions,
        ]}
      >
        <LayoutSlot id="background.transparent" style={styles.choiceSlot}>
          <BackgroundChoice
            value="transparent"
            selected={background === "transparent"}
            title="Transparent Background"
            description="Sits cleanly over lines, dates, and text."
            asset={optionAsset}
            compact={compact}
            recoveryCompact={compactRecovery}
            disabled={busy}
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
            recoveryCompact={compactRecovery}
            disabled={busy}
            layerPrefix="background.white"
            onSelect={() => {
              void hapticSelection();
              setBackground("white");
              clearError();
            }}
          />
        </LayoutSlot>
      </View>
      <PurchaseFeedback
        busy={busy}
        unboundPurchase={unboundPurchase}
        feedback={feedback}
        layoutId="background.error"
      />
      <LayoutSlot
        id="background.actions"
        style={[
          styles.actions,
          compact && styles.actionsCompact,
          compactRecovery && styles.recoveryActions,
        ]}
      >
        {background === "transparent" ? (
          <PurchaseAction
            displayPrice={displayPrice}
            productStatus={productStatus}
            onRetry={() => void retryProduct()}
            busy={busy}
            unboundPurchase={unboundPurchase}
            disabled={busy || transparentUnavailable}
            onPress={continueFlow}
            layoutPrefix="background.primary"
          />
        ) : (
          <FlowPrimaryButton
            label="Continue With White Background"
            onPress={continueFlow}
            disabled={busy}
            layoutId="background.primary.button"
            labelLayoutId="background.primary.label"
          />
        )}
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
  content: {
    paddingTop: 16,
    paddingBottom: 14,
    justifyContent: "center",
  },
  recoveryContent: { paddingTop: 4, paddingBottom: 4 },
  back: { position: "absolute", top: 8, left: 20, zIndex: 3 },
  header: {},
  headingText: { fontSize: 28, lineHeight: 33 },
  options: { flex: 1, maxHeight: 560, gap: 12, paddingBottom: 6 },
  optionsCompact: { gap: 10, paddingBottom: 0 },
  recoveryOptions: { gap: 6 },
  choiceSlot: { flex: 1 },
  choice: {
    flex: 1,
    minHeight: 118,
    borderWidth: 1,
    borderColor: flowColors.outline,
    borderRadius: flowRadii.card,
    padding: 14,
    gap: 9,
    backgroundColor: flowColors.card,
    boxShadow: flowShadows.card,
  },
  choiceCompact: { minHeight: 100, padding: 10, gap: 6 },
  recoveryChoice: { padding: 6, gap: 4 },
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
  choiceDisabled: { opacity: 0.78 },
  swatch: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CCD3D6",
    overflow: "hidden",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  recoverySwatch: { width: 44, height: 44 },
  transparentSwatch: {
    backgroundColor: "#FFF9E8",
    alignItems: "center",
    justifyContent: "center",
  },
  swatchLabel: {
    color: flowColors.accessibleLink,
    fontFamily: "Georgia",
    fontSize: 24,
    lineHeight: 29,
    fontWeight: "700",
  },
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
    fontSize: 17,
    lineHeight: 22,
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
  descriptionSlot: { marginTop: 3 },
  choiceDescription: {
    color: flowColors.cardMuted,
    fontSize: 12,
    lineHeight: 16,
  },
  radio: {
    width: 24,
    height: 24,
    borderWidth: 1.5,
    borderColor: flowColors.ink,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  radioSelected: { borderColor: flowColors.ink },
  radioDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: flowColors.ink,
  },
  actions: {
    marginTop: 4,
    gap: 2,
  },
  actionsCompact: { marginTop: 2 },
  recoveryActions: { marginTop: 0 },
});

import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  EntryBackdrop,
  FlowBackButton,
  FlowHeading,
  FlowPrimaryButton,
  FlowScreen,
  FlowSheet,
  FlowTextButton,
  ScriptLabel,
  flowColors,
} from "@/components/flow-ui";
import { hasPurchaseRecoveryInProgress } from "@/domain/purchaseState";
import { isAuthorizedScreenshotFixture } from "@/config/screenshotFixtures";
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
  onSelect,
}: {
  value: Background;
  selected: boolean;
  title: string;
  description: string;
  price?: string;
  onSelect(): void;
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
      {value === "transparent" ? (
        <CheckerSwatch />
      ) : (
        <View
          accessibilityElementsHidden
          style={[styles.swatch, styles.whiteSwatch]}
        />
      )}
      <View style={styles.choiceCopy}>
        <View style={styles.choiceTitleRow}>
          <Text selectable style={styles.choiceTitle}>
            {title}
          </Text>
          {value === "transparent" ? (
            <Text style={styles.tag}>Recommended</Text>
          ) : null}
        </View>
        <View style={styles.descriptionRow}>
          <Text selectable style={styles.choiceDescription}>
            {description}
          </Text>
          {price ? (
            <Text selectable style={styles.price}>
              {price}
            </Text>
          ) : null}
        </View>
      </View>
      <View
        accessibilityElementsHidden
        style={[styles.radio, selected && styles.radioSelected]}
      >
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
    </Pressable>
  );
}

export default function BackgroundScreen() {
  const {
    activeSet,
    data,
    product,
    productStatus,
    purchaseActiveSet,
    recoverUnboundPurchase,
  } = useAppState();
  const { fixture } = useLocalSearchParams<{ fixture?: string }>();
  const purchaseFixture = isAuthorizedScreenshotFixture(fixture, [
    "both",
    "signature",
  ]);
  const [background, setBackground] = useState<Background>("transparent");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const purchasePending = hasPurchaseRecoveryInProgress(data);
  const unboundPurchase = data.unboundPurchases[0];
  const displayPrice = product.displayPrice || "$1.99";

  useEffect(() => {
    if (
      !purchaseFixture &&
      activeSet.status === "purchased" &&
      !activeSet.transactionFinishPending
    )
      router.replace({ pathname: "/success", params: { mode: "transparent" } });
  }, [activeSet.status, activeSet.transactionFinishPending, purchaseFixture]);

  const purchase = async () => {
    setBusy(true);
    setError(null);
    try {
      const result = unboundPurchase
        ? await recoverUnboundPurchase()
        : await purchaseActiveSet();
      if (result.state === "purchased") {
        // Advance through the state effect only after StoreKit finishing is
        // durably complete. A verified purchase can still be finish-pending.
      } else if (result.state === "pending") {
        setError(
          "Your purchase is pending with Apple. This set will unlock automatically after approval.",
        );
      } else if (result.state === "cancelled") {
        setError("Purchase cancelled. You were not charged.");
      } else {
        setError(
          "Apple did not report a completed purchase. This frozen set stays saved while Only Signature checks again.",
        );
      }
    } catch {
      setError(
        "Transparent export is temporarily unavailable. You can still save with a white background for free.",
      );
    } finally {
      setBusy(false);
    }
  };

  const continueFlow = () => {
    if (background === "white") router.push("/free-export");
    else void purchase();
  };

  const transparentUnavailable =
    !unboundPurchase && (purchasePending || productStatus !== "available");

  return (
    <FlowScreen contentStyle={styles.content} testID="background-screen">
      <EntryBackdrop />
      <View accessibilityElementsHidden style={styles.shade} />
      <FlowSheet label="Choose Your Background" style={styles.sheet}>
        <View style={styles.sheetBack}>
          <FlowBackButton onPress={() => router.back()} />
        </View>
        <ScriptLabel asset="select" style={styles.script} />
        <FlowHeading>Choose Your Background</FlowHeading>
        <View
          accessibilityRole="radiogroup"
          accessibilityLabel="Background format"
          style={styles.options}
        >
          <BackgroundChoice
            value="transparent"
            selected={background === "transparent"}
            title="Transparent Background"
            description="Sits cleanly over lines, dates, and text."
            price={displayPrice}
            onSelect={() => {
              setBackground("transparent");
              setError(null);
            }}
          />
          <BackgroundChoice
            value="white"
            selected={background === "white"}
            title="White Background"
            description="May cover anything behind your signature."
            onSelect={() => {
              setBackground("white");
              setError(null);
            }}
          />
        </View>
        {error ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {error}
          </Text>
        ) : null}
        <View style={styles.actions}>
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
          />
          <FlowTextButton
            label={
              background === "transparent"
                ? "Continue With White Background"
                : "Choose Transparent Instead"
            }
            onPress={() => {
              if (background === "transparent") router.push("/free-export");
              else setBackground("transparent");
            }}
            disabled={busy}
          />
        </View>
      </FlowSheet>
    </FlowScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 0 },
  shade: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(0,0,0,0.62)" },
  sheet: { top: "34%" },
  sheetBack: { position: "absolute", top: -6, left: 20, zIndex: 3 },
  script: { marginLeft: 28, marginBottom: 2 },
  options: { gap: 10, marginTop: 12 },
  choice: {
    minHeight: 92,
    borderWidth: 1,
    borderColor: flowColors.outline,
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  choiceSelected: { minHeight: 108, borderColor: flowColors.cyan },
  pressed: { opacity: 0.76 },
  swatch: {
    width: 56,
    height: 56,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#CCD3D6",
    overflow: "hidden",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  checker: { backgroundColor: "#FFF" },
  checkerSquare: { width: 14, height: 14 },
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
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "700",
  },
  tag: {
    color: flowColors.cyanText,
    borderWidth: 1,
    borderColor: flowColors.cyan,
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    fontSize: 10,
    lineHeight: 13,
  },
  descriptionRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginTop: 5,
  },
  choiceDescription: {
    color: "#DCE3E5",
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
  price: { color: flowColors.cyanText, fontSize: 13, lineHeight: 17 },
  radio: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderColor: "#FFF",
    borderRadius: 11,
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
  error: { color: "#FFD8D2", fontSize: 12, lineHeight: 17, marginTop: 8 },
  actions: { marginTop: 12 },
});

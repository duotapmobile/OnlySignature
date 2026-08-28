import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { DrawingPreview } from "@/components/DrawingPreview";
import {
  BackLink,
  Body,
  GlassCard,
  Heading,
  PrimaryButton,
  Screen,
  SecondaryButton,
} from "@/components/ui";
import { hasDrawing } from "@/domain/models";
import { hasPurchaseRecoveryInProgress } from "@/domain/purchaseState";
import { sharedCopy, theme } from "@/integrations/workspace";
import { useAppState } from "@/state/AppStateProvider";
import { isAuthorizedScreenshotFixture } from "@/config/screenshotFixtures";

export default function PurchaseScreen() {
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
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const asset = hasDrawing(activeSet.signature)
    ? activeSet.signature
    : activeSet.initials;
  const signatureExists = hasDrawing(activeSet.signature);
  const initialsExists = hasDrawing(activeSet.initials);
  const presence =
    signatureExists && initialsExists
      ? "both"
      : initialsExists
        ? "initials"
        : "signature";
  const copy = sharedCopy.flowCopy(presence);
  const purchasePending = hasPurchaseRecoveryInProgress(data);
  const unboundPurchase = data.unboundPurchases[0];
  useEffect(() => {
    if (
      !purchaseFixture &&
      activeSet.status === "purchased" &&
      !activeSet.transactionFinishPending
    )
      router.replace("/export");
  }, [activeSet.status, activeSet.transactionFinishPending, purchaseFixture]);
  const purchase = async () => {
    setBusy(true);
    setError(null);
    try {
      const result = await purchaseActiveSet();
      if (result.state === "purchased") router.replace("/export");
      else if (result.state === "pending")
        setError(
          "Your purchase is pending. This set will unlock automatically after Apple approves it.",
        );
      else if (result.state === "cancelled")
        setError("Purchase cancelled. You were not charged.");
      else if (result.state === "request-interrupted")
        setError(
          "Apple did not report a completed purchase. Only Signature will keep checking this frozen set.",
        );
      else setError("The purchase did not complete. Please try again.");
    } catch {
      setError(
        "Transparent export is temporarily unavailable. You can still save with a white background for free.",
      );
    } finally {
      setBusy(false);
    }
  };
  const recoverPurchase = async () => {
    setBusy(true);
    setError(null);
    try {
      await recoverUnboundPurchase();
      router.replace("/export");
    } catch {
      setError(
        "The recovered Apple purchase could not be attached yet. Keep this set saved and do not purchase again.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <Screen testID="purchase-screen">
      <Heading>Transparent Export</Heading>
      <Body>{copy.purchaseLine}</Body>
      <GlassCard>
        <Text style={styles.formTitle}>RIVERBEND SCHOOL — PERMISSION FORM</Text>
        <Text style={styles.formLine}>Student: Jordan Example</Text>
        <Text style={styles.formLine}>Activity: Community Garden Visit</Text>
        <View style={styles.signatureLine}>
          {asset ? (
            <DrawingPreview asset={asset} style={styles.signature} />
          ) : null}
        </View>
        <Text style={styles.formLabel}>Authorized signature</Text>
      </GlassCard>
      <GlassCard style={styles.callout}>
        <Text style={styles.calloutText}>No editing or cropping</Text>
      </GlassCard>
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
      {productStatus === "unavailable" ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {sharedCopy.errorCopy.productUnavailable}
        </Text>
      ) : null}
      {purchasePending ? (
        <Text accessibilityRole="alert" style={styles.pending}>
          {unboundPurchase
            ? "Apple already completed a transparent-set purchase that is not attached to local artwork. Apply it to this set without another charge."
            : `${sharedCopy.errorCopy.purchasePending} Do not purchase this set again.`}
        </Text>
      ) : null}
      <PrimaryButton
        label={
          busy
            ? unboundPurchase
              ? "Applying Apple purchase…"
              : "Opening Apple purchase…"
            : unboundPurchase
              ? "Apply Apple Purchase to This Set"
              : purchasePending
                ? "Purchase pending with Apple"
                : productStatus === "loading"
                  ? "Loading Apple price…"
                  : productStatus === "unavailable"
                    ? "Transparent purchase unavailable"
                    : `Purchase for ${product.displayPrice}`
        }
        disabled={
          busy ||
          (!unboundPurchase &&
            (purchasePending || productStatus !== "available"))
        }
        onPress={() => {
          if (unboundPurchase) void recoverPurchase();
          else void purchase();
        }}
      />
      <Body>{copy.scope}</Body>
      <Text style={styles.scope}>
        {sharedCopy.purchaseCopy.noSubscription}{" "}
        {sharedCopy.purchaseCopy.reexport}
      </Text>
      <Text style={styles.durability}>
        {sharedCopy.purchaseCopy.durability}
      </Text>
      <SecondaryButton
        label="Save with White Background, Free"
        onPress={() => router.push("/free-export")}
        disabled={busy}
      />
      <BackLink disabled={busy} onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  formTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 16,
  },
  formLine: { color: theme.colors.muted, fontSize: 14, lineHeight: 22 },
  signatureLine: {
    marginTop: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#59646A",
    height: 80,
  },
  signature: { height: 75 },
  formLabel: { color: theme.colors.muted, fontSize: 12, marginTop: 5 },
  callout: { paddingVertical: 16 },
  calloutText: {
    color: theme.colors.primary,
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
  },
  scope: {
    color: theme.colors.white,
    fontSize: 18,
    lineHeight: 25,
    fontWeight: "700",
  },
  durability: { color: theme.colors.white, fontSize: 16, lineHeight: 23 },
  pending: {
    color: theme.colors.white,
    backgroundColor: "rgba(138,90,8,0.45)",
    borderRadius: 12,
    padding: 14,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "700",
  },
  error: { color: "#FFE0DB", fontSize: 17, lineHeight: 24, fontWeight: "700" },
});

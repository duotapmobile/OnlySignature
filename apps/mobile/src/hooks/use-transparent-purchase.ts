import { useEffect, useState } from "react";
import { router } from "expo-router";
import { hasPurchaseRecoveryInProgress } from "@/domain/purchaseState";
import { useAppState } from "@/state/AppStateProvider";
import {
  hapticError,
  hapticLightImpact,
  hapticSuccess,
  hapticWarning,
} from "@/services/haptics";

const purchaseErrorCopy = (error: unknown): string => {
  const detail =
    error instanceof Error
      ? error.message.toLowerCase()
      : String(error).toLowerCase();
  if (
    detail.includes("product-not-found") ||
    detail.includes("product-unavailable")
  )
    return "Transparent Background is temporarily unavailable. Your signing set is safe. Try again or continue with white.";
  if (detail.includes("product-lookup-failed"))
    return "Couldn’t load Transparent Background. Check your connection and try again.";
  return "Purchase couldn’t open. Your signing set is safe. Try again or continue with white.";
};

export function useTransparentPurchase({
  initialError = null,
  suppressSuccessRedirect = false,
}: {
  initialError?: string | null;
  suppressSuccessRedirect?: boolean;
} = {}) {
  const {
    activeSet,
    data,
    product,

    purchaseActiveSet,
    recoverUnboundPurchase,
  } = useAppState();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const purchasePending = hasPurchaseRecoveryInProgress(data);
  const unboundPurchase = data.unboundPurchases[0];
  const displayPrice = product.displayPrice;

  useEffect(() => {
    if (
      !suppressSuccessRedirect &&
      activeSet.status === "purchased" &&
      !activeSet.transactionFinishPending
    )
      router.replace({ pathname: "/success", params: { mode: "transparent" } });
  }, [
    activeSet.status,
    activeSet.transactionFinishPending,
    suppressSuccessRedirect,
  ]);

  const beginPurchase = async () => {
    void hapticLightImpact();
    setBusy(true);
    setError(null);
    try {
      const result = unboundPurchase
        ? await recoverUnboundPurchase()
        : await purchaseActiveSet();
      if (result.state === "pending") {
        void hapticWarning();
        setError(
          "Your purchase is pending with Apple. This set will unlock automatically after approval.",
        );
      } else if (result.state === "cancelled") {
        setError("Purchase cancelled. You were not charged.");
      } else if (result.state !== "purchased") {
        void hapticError();
        setError(
          "Apple did not report a completed purchase. This frozen set stays saved while Only Signature checks again.",
        );
      } else void hapticSuccess();
    } catch (caught) {
      void hapticError();
      setError(purchaseErrorCopy(caught));
    } finally {
      setBusy(false);
    }
  };

  return {
    beginPurchase,
    busy,
    clearError: () => setError(null),
    displayPrice,
    error,

    transparentUnavailable: !unboundPurchase && purchasePending,
    unboundPurchase: Boolean(unboundPurchase),
  };
}

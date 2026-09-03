import { useEffect, useState } from "react";
import { router } from "expo-router";
import { hasPurchaseRecoveryInProgress } from "@/domain/purchaseState";
import { useAppState } from "@/state/AppStateProvider";

export function useTransparentPurchase({
  suppressSuccessRedirect = false,
}: {
  suppressSuccessRedirect?: boolean;
} = {}) {
  const {
    activeSet,
    data,
    product,
    productStatus,
    purchaseActiveSet,
    recoverUnboundPurchase,
  } = useAppState();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const purchasePending = hasPurchaseRecoveryInProgress(data);
  const unboundPurchase = data.unboundPurchases[0];
  const displayPrice = product.displayPrice || "$1.99";

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
    setBusy(true);
    setError(null);
    try {
      const result = unboundPurchase
        ? await recoverUnboundPurchase()
        : await purchaseActiveSet();
      if (result.state === "pending") {
        setError(
          "Your purchase is pending with Apple. This set will unlock automatically after approval.",
        );
      } else if (result.state === "cancelled") {
        setError("Purchase cancelled. You were not charged.");
      } else if (result.state !== "purchased") {
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

  return {
    beginPurchase,
    busy,
    clearError: () => setError(null),
    displayPrice,
    error,
    transparentUnavailable:
      !unboundPurchase && (purchasePending || productStatus !== "available"),
    unboundPurchase: Boolean(unboundPurchase),
  };
}

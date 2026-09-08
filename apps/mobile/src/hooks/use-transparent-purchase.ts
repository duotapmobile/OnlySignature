import { useEffect, useState } from "react";
import { router } from "expo-router";
import { hasPurchaseRecoveryInProgress } from "@/domain/purchaseState";
import { useAppState } from "@/state/AppStateProvider";

const purchaseErrorCopy = (error: unknown): string => {
  const detail =
    error instanceof Error
      ? error.message.toLowerCase()
      : String(error).toLowerCase();
  if (detail.includes("product-not-found"))
    return "Apple TestFlight did not return the transparent product. Confirm this iPhone uses a United States Media & Purchases account, then tap Try Again.";
  if (detail.includes("product-lookup-failed"))
    return "Apple TestFlight could not load the transparent product. Check your connection, then tap Try Again.";
  return "Apple could not open the transparent purchase. Your signing set is unchanged. Tap Try Again or save the white version for free.";
};

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
    } catch (caught) {
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
    productNeedsRetry: productStatus !== "available",
    transparentUnavailable: !unboundPurchase && purchasePending,
    unboundPurchase: Boolean(unboundPurchase),
  };
}

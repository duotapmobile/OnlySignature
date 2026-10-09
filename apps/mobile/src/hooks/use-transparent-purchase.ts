import { useEffect, useRef, useState } from "react";
import { router } from "expo-router";
import { hasPurchaseRecoveryInProgress } from "@/domain/purchaseState";
import {
  purchaseFeedback,
  type PurchaseFeedback,
} from "@/domain/purchase-feedback";
import {
  purchaseErrorCopy,
  purchaseResultFeedback,
} from "@/domain/purchase-result-feedback";
import { useAppState } from "@/state/AppStateProvider";
import {
  hapticError,
  hapticLightImpact,
  hapticSuccess,
  hapticWarning,
} from "@/services/haptics";

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
    productStatus,
    refreshProduct,
    purchaseActiveSet,
    recoverUnboundPurchase,
  } = useAppState();
  const [busy, setBusy] = useState(false);
  const actionInFlight = useRef(false);
  const [purchasePrice, setPurchasePrice] = useState("");
  const [error, setError] = useState<string | null>(initialError);
  const [errorTone, setErrorTone] = useState<PurchaseFeedback["tone"]>("error");
  const [preferRecovery, setPreferRecovery] = useState(false);
  const purchasePending = hasPurchaseRecoveryInProgress(data);
  const unboundPurchase = data.unboundPurchases[0];
  const displayPrice = product.displayPrice;

  useEffect(() => {
    if (
      !suppressSuccessRedirect &&
      activeSet.status === "purchased" &&
      !activeSet.transactionFinishPending
    )
      router.replace("/export");
  }, [
    activeSet.status,
    activeSet.transactionFinishPending,
    suppressSuccessRedirect,
  ]);

  const beginPurchase = async () => {
    if (
      actionInFlight.current ||
      (!unboundPurchase &&
        (purchasePending ||
          productStatus !== "available" ||
          !displayPrice.trim()))
    )
      return;
    actionInFlight.current = true;
    setPurchasePrice(displayPrice);
    void hapticLightImpact();
    setBusy(true);
    setError(null);
    setErrorTone("error");
    setPreferRecovery(false);
    try {
      const result = unboundPurchase
        ? await recoverUnboundPurchase()
        : await purchaseActiveSet();
      const outcome = purchaseResultFeedback(result);
      if (outcome.feedback) {
        setErrorTone(outcome.feedback.tone);
        setError(outcome.feedback.message);
      }
      if (outcome.haptic === "success") void hapticSuccess();
      else if (outcome.haptic === "warning") void hapticWarning();
      else if (outcome.haptic === "error") void hapticError();
    } catch (caught) {
      setPreferRecovery(true);
      void hapticError();
      setError(purchaseErrorCopy(caught));
    } finally {
      actionInFlight.current = false;
      setBusy(false);
    }
  };

  const retryProduct = async () => {
    if (actionInFlight.current) return;
    actionInFlight.current = true;
    setError(null);
    setPreferRecovery(false);
    try {
      await refreshProduct();
    } catch (caught) {
      setPreferRecovery(true);
      setErrorTone("error");
      setError(purchaseErrorCopy(caught));
    } finally {
      actionInFlight.current = false;
    }
  };

  return {
    beginPurchase,
    busy,
    clearError: () => setError(null),
    displayPrice: busy ? purchasePrice : displayPrice,
    productStatus,
    retryProduct,
    error,
    feedback: purchaseFeedback({
      activeSet,
      data,
      error,
      errorTone,
      busy,
      preferRecovery,
    }),

    transparentUnavailable: !unboundPurchase && purchasePending,
    unboundPurchase: Boolean(unboundPurchase),
  };
}

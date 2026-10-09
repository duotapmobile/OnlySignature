import type { StoreKitTransaction } from "../services/storekitContract";
import type { AppStateData } from "./models";
import { purchaseStatusCopy, type PurchaseFeedback } from "./purchase-feedback";

export type PurchaseResult = StoreKitTransaction & {
  fulfillmentState?: "complete" | "finishing" | "unbound";
};

/** A verified Apple result is not success feedback until local delivery completes. */
export function purchaseResultForState(
  data: AppStateData,
  transaction: StoreKitTransaction,
  expectedProductId: string,
): PurchaseResult {
  if (transaction.state !== "purchased") return transaction;
  const binding =
    transaction.verified &&
    transaction.productId === expectedProductId &&
    data.sets.find(
      (set) =>
        set.status === "purchased" &&
        set.transactionId === transaction.transactionId,
    );
  return {
    ...transaction,
    fulfillmentState: !binding
      ? "unbound"
      : binding.transactionFinishPending
        ? "finishing"
        : "complete",
  };
}

export function purchaseErrorCopy(error: unknown): string {
  const detail =
    error instanceof Error
      ? error.message.toLowerCase()
      : String(error).toLowerCase();
  if (
    detail.includes("product-not-found") ||
    detail.includes("product-unavailable") ||
    detail.includes("not-available-in-storefront")
  )
    return "Transparent Background is temporarily unavailable. Your signing set is safe. Try again or continue with white.";
  if (
    detail.includes("product-lookup") ||
    detail.includes("product-price") ||
    detail.includes("product-identity") ||
    detail.includes("product-invalid")
  )
    return "Couldn’t load Transparent Background. Check your connection and try again.";
  return "Purchase couldn’t open. Your signing set is safe. Try again or continue with white.";
}

export function purchaseResultFeedback(transaction: PurchaseResult): {
  feedback: PurchaseFeedback | null;
  haptic: "success" | "warning" | "error" | null;
} {
  switch (transaction.state) {
    case "purchased":
      if (transaction.fulfillmentState !== "complete")
        return {
          feedback: {
            message:
              transaction.fulfillmentState === "finishing"
                ? purchaseStatusCopy.finishing
                : purchaseStatusCopy.unbound,
            tone: "info",
          },
          haptic: "warning",
        };
      return { feedback: null, haptic: "success" };
    case "cancelled":
      return {
        feedback: {
          message: "Purchase cancelled. You were not charged.",
          tone: "info",
        },
        haptic: null,
      };
    case "pending":
      return {
        feedback: { message: purchaseStatusCopy.pending, tone: "info" },
        haptic: "warning",
      };
    case "request-failed":
      return {
        feedback: {
          message: purchaseErrorCopy(transaction.errorCategory),
          tone: "error",
        },
        haptic: "error",
      };
    case "failed":
      return {
        feedback: {
          message:
            "Apple could not verify this purchase. This set stays locked while Only Signature checks again. Do not purchase it again.",
          tone: "error",
        },
        haptic: "error",
      };
    case "request-interrupted":
      return {
        feedback: { message: purchaseStatusCopy.interrupted, tone: "info" },
        haptic: "warning",
      };
  }
}

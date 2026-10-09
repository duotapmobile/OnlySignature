import type { AppStateData, SignatureSet } from "./models";

// Existing app strings, shared by result feedback and reopened recovery states.
export const purchaseStatusCopy = {
  pending:
    "Your purchase is pending with Apple. This set will unlock automatically after approval.",
  interrupted:
    "Apple did not report a completed purchase. This frozen set stays saved while Only Signature checks again.",
  finishing:
    "Apple purchase finishing is still being checked. This purchased set remains saved and locked until recovery completes.",
  unbound:
    "A verified Apple purchase needs recovery before it can be attached to a saved set. Do not purchase again.",
  otherSet:
    "A purchase is waiting for secure recovery. Keep this set saved; Only Signature will check again automatically.",
} as const;

export type PurchaseFeedback = {
  message: string;
  tone: "info" | "error";
};

export function purchaseFeedback({
  activeSet,
  data,
  error,
  errorTone,
  busy,
  preferRecovery = false,
}: {
  activeSet: SignatureSet;
  data: AppStateData;
  error: string | null;
  errorTone: PurchaseFeedback["tone"];
  busy: boolean;
  preferRecovery?: boolean;
}): PurchaseFeedback | null {
  if (busy) return null;
  const localError = error ? { message: error, tone: errorTone } : null;
  // A thrown operation can leave a durable hold. Its generic retry message
  // must not cover the live recovery state once the provider renders it.
  if (localError && !preferRecovery) return localError;
  if (activeSet.transactionFinishPending)
    return { message: purchaseStatusCopy.finishing, tone: "info" };
  if (activeSet.pendingPurchaseId)
    return {
      message:
        activeSet.purchaseIntentState === "pending"
          ? purchaseStatusCopy.pending
          : purchaseStatusCopy.interrupted,
      tone: "info",
    };
  if (data.unboundPurchases.length)
    return { message: purchaseStatusCopy.unbound, tone: "info" };
  if (
    data.sets.some(
      (set) => set.pendingPurchaseId || set.transactionFinishPending,
    )
  )
    return { message: purchaseStatusCopy.otherSet, tone: "info" };
  return localError;
}

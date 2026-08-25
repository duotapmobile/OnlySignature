import type {
  AppStateData,
  AssetKind,
  DrawingAsset,
  SignatureSet,
} from "./models";
import { hasDrawing } from "./models";
import type { StoreKitTransaction } from "@/services/storekit";

export const canEditAsset = (set: SignatureSet, kind: AssetKind): boolean => {
  if (set.pendingPurchaseId || set.transactionFinishPending) return false;
  return set.status === "draft" || set.unclaimedSlot === kind;
};

export const hasPurchaseRecoveryInProgress = (data: AppStateData): boolean =>
  data.sets.some(
    (set) => Boolean(set.pendingPurchaseId) || set.transactionFinishPending,
  );
export const canBeginPurchase = (set: SignatureSet): boolean =>
  !set.pendingPurchaseId &&
  !set.transactionFinishPending &&
  set.status !== "purchased" &&
  (hasDrawing(set.signature) || hasDrawing(set.initials));

export const stateWithPendingPurchaseCleared = (
  data: AppStateData,
  setId: string,
): AppStateData => ({
  ...data,
  sets: data.sets.map((set) =>
    set.id === setId
      ? {
          ...set,
          pendingPurchaseId: null,
          transactionFinishPending: false,
          signature: set.signature
            ? { ...set.signature, finalizedHash: null }
            : null,
          initials: set.initials
            ? { ...set.initials, finalizedHash: null }
            : null,
        }
      : set,
  ),
});

export const findTransactionSet = (
  data: AppStateData,
  transaction: StoreKitTransaction,
): SignatureSet | null => {
  const exact = data.sets.find(
    (set) =>
      (transaction.appAccountToken &&
        set.pendingPurchaseId === transaction.appAccountToken) ||
      set.transactionId === transaction.transactionId,
  );
  if (exact) return exact;
  if (transaction.appAccountToken) return null;
  const pending = data.sets.filter((set) => Boolean(set.pendingPurchaseId));
  return pending.length === 1 ? (pending[0] ?? null) : null;
};

export const purchasedStateForTransaction = (
  data: AppStateData,
  transaction: StoreKitTransaction,
  now: string,
  expectedProductId?: string,
): AppStateData | null => {
  if (transaction.state !== "purchased" || !transaction.verified) return null;
  if (expectedProductId && transaction.productId !== expectedProductId)
    return null;
  if (!transaction.transactionId) return null;
  const matching = findTransactionSet(data, transaction);
  const alreadyBound = data.sets.find(
    (set) =>
      set.transactionId === transaction.transactionId &&
      set.id !== matching?.id,
  );
  if (alreadyBound) return null;
  if (!matching) return null;
  if (
    matching.status === "purchased" &&
    matching.transactionId === transaction.transactionId
  )
    return data;
  const signatureExists = hasDrawing(matching.signature);
  const initialsExists = hasDrawing(matching.initials);
  const updated: SignatureSet = {
    ...matching,
    status: "purchased",
    transactionId: transaction.transactionId,
    pendingPurchaseId: null,
    transactionFinishPending: true,
    purchasedAt: matching.purchasedAt ?? now,
    unclaimedSlot:
      signatureExists && !initialsExists
        ? "initials"
        : initialsExists && !signatureExists
          ? "signature"
          : null,
  };
  return {
    ...data,
    sets: data.sets.map((set) => (set.id === updated.id ? updated : set)),
    lastError: null,
  };
};

export const stateWithFinalizedIncludedSlot = (
  data: AppStateData,
  setId: string,
  kind: AssetKind,
  asset: DrawingAsset,
  hash: string,
  now: string,
): AppStateData => {
  const target = data.sets.find((set) => set.id === setId);
  if (
    !target ||
    target.status !== "purchased" ||
    target.unclaimedSlot !== kind ||
    !hasDrawing(asset) ||
    !hash
  )
    throw new Error("included-slot-unavailable");
  const updated: SignatureSet = {
    ...target,
    [kind]: { ...asset, finalizedHash: hash },
    unclaimedSlot: null,
    lastUsedAt: now,
  };
  return {
    ...data,
    sets: data.sets.map((set) => (set.id === setId ? updated : set)),
  };
};

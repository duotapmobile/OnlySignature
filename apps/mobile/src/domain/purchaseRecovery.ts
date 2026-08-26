import type { AppStateData } from "./models";
import { canonicalPurchaseToken } from "./purchaseState";
import type { StoreKitTransaction } from "@/services/storekit";

export const stateAfterCompletedUnfinishedSnapshot = (
  data: AppStateData,
  transactions: StoreKitTransaction[],
): AppStateData => {
  const unfinishedIds = new Set(
    transactions.map((transaction) => transaction.transactionId),
  );
  return {
    ...data,
    sets: data.sets.map((set) =>
      set.transactionFinishPending &&
      set.transactionId &&
      !unfinishedIds.has(set.transactionId)
        ? { ...set, transactionFinishPending: false }
        : set,
    ),
  };
};

export const stateMarkingInterruptedPresentations = (
  data: AppStateData,
  transactions: StoreKitTransaction[],
): AppStateData => {
  const unfinishedTokens = new Set(
    transactions
      .map((transaction) => transaction.appAccountToken)
      .map(canonicalPurchaseToken)
      .filter((token): token is string => Boolean(token)),
  );
  return {
    ...data,
    sets: data.sets.map((set) =>
      set.pendingPurchaseId &&
      set.purchaseIntentState === "presenting" &&
      !unfinishedTokens.has(
        canonicalPurchaseToken(set.pendingPurchaseId) ?? set.pendingPurchaseId,
      )
        ? { ...set, purchaseIntentState: "interrupted" }
        : set,
    ),
  };
};

export const stateAfterRecoverySnapshot = (
  data: AppStateData,
  transactions: StoreKitTransaction[],
  purchasePresentationActive: boolean,
): AppStateData => {
  const recovered = stateAfterCompletedUnfinishedSnapshot(data, transactions);
  return purchasePresentationActive
    ? recovered
    : stateMarkingInterruptedPresentations(recovered, transactions);
};

export const stateAfterFinishResult = (
  data: AppStateData,
  transactionId: string,
  finished: boolean,
): AppStateData => {
  if (!finished) return data;
  return {
    ...data,
    sets: data.sets.map((set) =>
      set.transactionId === transactionId
        ? { ...set, transactionFinishPending: false }
        : set,
    ),
  };
};

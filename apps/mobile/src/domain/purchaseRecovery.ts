import type { AppStateData } from "./models";
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
      .filter((token): token is string => Boolean(token))
      .map((token) => token.toLowerCase()),
  );
  return {
    ...data,
    sets: data.sets.map((set) =>
      set.pendingPurchaseId &&
      set.purchaseIntentState === "presenting" &&
      !unfinishedTokens.has(set.pendingPurchaseId.toLowerCase())
        ? { ...set, purchaseIntentState: "interrupted" }
        : set,
    ),
  };
};

export const purchaseStates = [
  "purchased",
  "cancelled",
  "pending",
  "failed",
  "request-failed",
  "request-interrupted",
] as const;

export type PurchaseState = (typeof purchaseStates)[number];

export interface StoreKitTransaction {
  transactionId: string;
  productId: string;
  appAccountToken?: string;
  state: PurchaseState;
  verified: boolean;
  errorCategory?: string;
}

const purchaseStateSet = new Set<string>(purchaseStates);

export const storeKitTransaction = (value: unknown): StoreKitTransaction => {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("storekit-invalid-transaction");
  const candidate = value as Record<string, unknown>;
  if (
    typeof candidate.transactionId !== "string" ||
    typeof candidate.productId !== "string" ||
    !candidate.productId ||
    typeof candidate.state !== "string" ||
    !purchaseStateSet.has(candidate.state) ||
    typeof candidate.verified !== "boolean" ||
    (candidate.appAccountToken !== undefined &&
      typeof candidate.appAccountToken !== "string") ||
    (candidate.errorCategory !== undefined &&
      typeof candidate.errorCategory !== "string") ||
    (candidate.state === "purchased" &&
      (!candidate.transactionId || !candidate.verified)) ||
    (candidate.state !== "purchased" && candidate.verified)
  )
    throw new Error("storekit-invalid-transaction");
  return {
    transactionId: candidate.transactionId,
    productId: candidate.productId,
    state: candidate.state as PurchaseState,
    verified: candidate.verified,
    ...(candidate.appAccountToken
      ? { appAccountToken: candidate.appAccountToken.trim().toLowerCase() }
      : {}),
    ...(candidate.errorCategory
      ? { errorCategory: candidate.errorCategory }
      : {}),
  };
};

import { fnv1aHash } from "./strokes";
import type { PendingPurchase, SignatureSet } from "./types";

export interface VerifiedTransaction {
  verification: "verified";
  transactionId: string;
  productId: string;
  appAccountToken?: string | null;
}
export interface UnverifiedTransaction {
  verification: "unverified";
  transactionId?: string;
}

export function snapshotHash(set: SignatureSet): string {
  return fnv1aHash(
    JSON.stringify({
      setId: set.id,
      signature: set.signature.normalizedHash,
      initials: set.initials.normalizedHash,
    }),
  );
}

export function preparePurchase(
  set: SignatureSet,
  intentId: string,
  productId: string,
  now: string,
  appAccountToken: string | null = null,
): PendingPurchase {
  if (set.purchaseState === "purchased")
    throw new Error("This set is already purchased");
  if (!set.signature.drawing && !set.initials.drawing)
    throw new Error("At least one asset is required");
  return {
    intentId,
    setId: set.id,
    productId,
    snapshotHash: snapshotHash(set),
    state: "prepared",
    transactionId: null,
    appAccountToken,
    createdAt: now,
    updatedAt: now,
  };
}

export function recordStorePending(
  intent: PendingPurchase,
  now: string,
): PendingPurchase {
  if (intent.state !== "prepared") return intent;
  return { ...intent, state: "store_pending", updatedAt: now };
}

export function acceptVerifiedTransaction(
  intent: PendingPurchase,
  transaction: VerifiedTransaction | UnverifiedTransaction,
  now: string,
): PendingPurchase {
  if (transaction.verification !== "verified")
    return { ...intent, state: "recovery_required", updatedAt: now };
  if (transaction.productId !== intent.productId)
    return {
      ...intent,
      state: "recovery_required",
      transactionId: transaction.transactionId,
      updatedAt: now,
    };
  if (
    intent.transactionId &&
    intent.transactionId !== transaction.transactionId
  )
    return { ...intent, state: "recovery_required", updatedAt: now };
  if (
    intent.appAccountToken &&
    transaction.appAccountToken &&
    intent.appAccountToken !== transaction.appAccountToken
  )
    return {
      ...intent,
      state: "recovery_required",
      transactionId: transaction.transactionId,
      updatedAt: now,
    };
  return {
    ...intent,
    state: "verified_unbound",
    transactionId: transaction.transactionId,
    updatedAt: now,
  };
}

export function markBound(
  intent: PendingPurchase,
  now: string,
): PendingPurchase {
  if (
    intent.state !== "verified_unbound" &&
    intent.state !== "bound_unfinished"
  )
    throw new Error("Verified transaction must be bound before finishing");
  return { ...intent, state: "bound_unfinished", updatedAt: now };
}

export function markFinished(
  intent: PendingPurchase,
  now: string,
): PendingPurchase {
  if (intent.state !== "bound_unfinished")
    throw new Error("Transaction cannot finish before durable binding");
  return { ...intent, state: "finished", updatedAt: now };
}

export function canDeleteAll(intents: readonly PendingPurchase[]): boolean {
  return intents.every((intent) => intent.state === "finished");
}

export function shouldFinishTransaction(
  intent: PendingPurchase,
  protectedDataAvailable: boolean,
): boolean {
  return protectedDataAvailable && intent.state === "bound_unfinished";
}

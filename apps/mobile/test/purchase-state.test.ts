import assert from "node:assert/strict";
import test from "node:test";
import { screenshotFixtureSet } from "../src/domain/fixtures";
import type { AppStateData, SignatureSet } from "../src/domain/models";
import {
  canBeginPurchase,
  canEditAsset,
  canonicalPurchaseToken,
  hasPurchaseRecoveryInProgress,
  purchaseRequestClearsPendingIntent,
  purchasedStateForTransaction,
  stateWithFinalizedIncludedSlot,
  stateWithPendingPurchaseCleared,
} from "../src/domain/purchaseState";

const pendingSet: SignatureSet = {
  ...screenshotFixtureSet,
  id: "set-1",
  initials: null,
  pendingPurchaseId: "abcdefab-cdef-4abc-8def-abcdefabcdef",
  purchaseIntentState: "pending",
  transactionFinishPending: false,
  status: "draft",
};
const data: AppStateData = {
  hydrated: true,
  activeSetId: pendingSet.id,
  sets: [pendingSet],
  selectedAsset: "signature",
  reviewPrompted: false,
  lastError: null,
};

test("pending purchase freezes both drawing slots and blocks delete-all", () => {
  assert.equal(canEditAsset(pendingSet, "signature"), false);
  assert.equal(canEditAsset(pendingSet, "initials"), false);
  assert.equal(hasPurchaseRecoveryInProgress(data), true);
  assert.equal(canBeginPurchase(pendingSet), false);
});

test("immediate verified result can reconcile from the just-persisted pending snapshot", () => {
  const transaction = {
    transactionId: "instant",
    productId: "product",
    appAccountToken: pendingSet.pendingPurchaseId!,
    state: "purchased" as const,
    verified: true,
  };
  assert.equal(
    purchasedStateForTransaction(data, transaction, "now")!.sets[0]!
      .transactionId,
    "instant",
  );
});

test("StoreKit account-token correlation is case insensitive", () => {
  const transaction = {
    transactionId: "case-normalized",
    productId: "product",
    appAccountToken: pendingSet.pendingPurchaseId!.toUpperCase(),
    state: "purchased" as const,
    verified: true,
  };
  assert.equal(
    purchasedStateForTransaction(data, transaction, "now")!.sets[0]!
      .transactionId,
    "case-normalized",
  );
});

test("purchase tokens are canonical UUIDs and reject malformed correlation", () => {
  assert.equal(
    canonicalPurchaseToken(
      `  ${pendingSet.pendingPurchaseId!.toUpperCase()}  `,
    ),
    pendingSet.pendingPurchaseId,
  );
  assert.equal(canonicalPurchaseToken("not-a-uuid"), null);
});

test("an unresolved intent on any saved set blocks another paid attempt", () => {
  const active = {
    ...screenshotFixtureSet,
    id: "active-draft",
    status: "draft" as const,
    transactionId: null,
    pendingPurchaseId: null,
    purchaseIntentState: null,
    transactionFinishPending: false,
  };
  const interrupted = {
    ...pendingSet,
    id: "interrupted-set",
    purchaseIntentState: "interrupted" as const,
  };
  assert.equal(
    hasPurchaseRecoveryInProgress({
      ...data,
      activeSetId: active.id,
      sets: [active, interrupted],
    }),
    true,
  );
  assert.equal(canBeginPurchase(active), true);
});

test("only terminal request outcomes clear a pending purchase intent", () => {
  assert.equal(purchaseRequestClearsPendingIntent("cancelled"), true);
  assert.equal(purchaseRequestClearsPendingIntent("request-failed"), true);
  assert.equal(
    purchaseRequestClearsPendingIntent("request-interrupted"),
    false,
  );
  assert.equal(purchaseRequestClearsPendingIntent("pending"), false);
  assert.equal(purchaseRequestClearsPendingIntent("failed"), false);
  assert.equal(purchaseRequestClearsPendingIntent("purchased"), false);
});

test("an explicit cancellation durably unlocks the draft for another attempt", () => {
  const unlockedAfterCancel = stateWithPendingPurchaseCleared(
    data,
    pendingSet.id,
  );
  assert.equal(unlockedAfterCancel.sets[0]!.pendingPurchaseId, null);
  assert.equal(canEditAsset(unlockedAfterCancel.sets[0]!, "signature"), true);
  assert.equal(canBeginPurchase(unlockedAfterCancel.sets[0]!), true);
});

test("verified purchase atomically binds the frozen set and grants the unused slot", () => {
  const next = purchasedStateForTransaction(
    data,
    {
      transactionId: "42",
      productId: "product",
      appAccountToken: pendingSet.pendingPurchaseId!,
      state: "purchased",
      verified: true,
    },
    "2026-08-25T12:00:00.000Z",
  )!;
  const result = next.sets[0]!;
  assert.equal(result.status, "purchased");
  assert.equal(result.pendingPurchaseId, null);
  assert.equal(result.transactionId, "42");
  assert.equal(result.transactionFinishPending, true);
  assert.equal(result.unclaimedSlot, "initials");
  assert.equal(data.sets[0]!.status, "draft");
});

test("wrong product and duplicate transaction bindings fail closed", () => {
  const transaction = {
    transactionId: "42",
    productId: "wrong-product",
    appAccountToken: pendingSet.pendingPurchaseId!,
    state: "purchased" as const,
    verified: true,
  };
  assert.equal(
    purchasedStateForTransaction(data, transaction, "now", "expected-product"),
    null,
  );
  const duplicateData: AppStateData = {
    ...data,
    sets: [
      pendingSet,
      {
        ...screenshotFixtureSet,
        id: "already-bound",
        transactionId: "42",
        transactionFinishPending: false,
      },
    ],
  };
  assert.equal(
    purchasedStateForTransaction(
      duplicateData,
      { ...transaction, productId: "expected-product" },
      "now",
      "expected-product",
    ),
    null,
  );
});

test("a mismatched nonempty account token never falls back to another pending set", () => {
  assert.equal(
    purchasedStateForTransaction(
      data,
      {
        transactionId: "different-token",
        productId: "product",
        appAccountToken: "99999999-9999-4999-8999-999999999999",
        state: "purchased",
        verified: true,
      },
      "now",
    ),
    null,
  );
});

test("finish-pending state blocks edits, new purchase, and deletion", () => {
  const finishing = {
    ...pendingSet,
    pendingPurchaseId: null,
    purchaseIntentState: null,
    transactionFinishPending: true,
    status: "purchased" as const,
  };
  const finishingData = { ...data, sets: [finishing] };
  assert.equal(canEditAsset(finishing, "signature"), false);
  assert.equal(canBeginPurchase(finishing), false);
  assert.equal(hasPurchaseRecoveryInProgress(finishingData), true);
});

test("unverified purchase cannot unlock a set", () => {
  assert.equal(
    purchasedStateForTransaction(
      data,
      {
        transactionId: "bad",
        productId: "product",
        state: "purchased",
        verified: false,
      },
      "2026-08-25T12:00:00.000Z",
    ),
    null,
  );
});

test("included slot requires a nonempty hash and becomes immutable after finalization", () => {
  const purchased = {
    ...pendingSet,
    status: "purchased" as const,
    pendingPurchaseId: null,
    transactionFinishPending: false,
    transactionId: "42",
    unclaimedSlot: "initials" as const,
  };
  const initials = screenshotFixtureSet.initials!;
  const purchasedData = { ...data, sets: [purchased] };
  assert.throws(() =>
    stateWithFinalizedIncludedSlot(
      purchasedData,
      purchased.id,
      "initials",
      initials,
      "",
      "now",
    ),
  );
  const next = stateWithFinalizedIncludedSlot(
    purchasedData,
    purchased.id,
    "initials",
    initials,
    "sha256-hash",
    "now",
  );
  assert.equal(next.sets[0]!.initials!.finalizedHash, "sha256-hash");
  assert.equal(next.sets[0]!.unclaimedSlot, null);
  assert.equal(canEditAsset(next.sets[0]!, "initials"), false);
});

test("included slot cannot finalize while transaction finishing is unresolved", () => {
  const purchased = {
    ...pendingSet,
    status: "purchased" as const,
    pendingPurchaseId: null,
    purchaseIntentState: null,
    transactionFinishPending: true,
    transactionId: "42",
    unclaimedSlot: "initials" as const,
  };
  assert.throws(() =>
    stateWithFinalizedIncludedSlot(
      { ...data, sets: [purchased] },
      purchased.id,
      "initials",
      screenshotFixtureSet.initials!,
      "sha256-hash",
      "now",
    ),
  );
});

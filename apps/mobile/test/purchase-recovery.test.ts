import assert from "node:assert/strict";
import test from "node:test";
import { screenshotFixtureSet } from "../src/domain/fixtures";
import type { AppStateData } from "../src/domain/models";
import {
  stateAfterFinishResult,
  stateAfterRecoverySnapshot,
  stateAfterCompletedUnfinishedSnapshot,
  stateMarkingInterruptedPresentations,
} from "../src/domain/purchaseRecovery";

const pendingToken = "abcdefab-cdef-4abc-8def-abcdefabcdef";
const pendingData = (): AppStateData => ({
  hydrated: true,
  activeSetId: "original",
  selectedAsset: "signature",
  reviewPrompted: false,
  lastError: null,
  sets: [
    {
      ...screenshotFixtureSet,
      id: "original",
      status: "draft",
      transactionId: null,
      pendingPurchaseId: pendingToken,
      purchaseIntentState: "presenting",
      transactionFinishPending: false,
    },
  ],
});

test("only a completed snapshot absence clears a finished consumable marker", () => {
  const finishing = {
    ...pendingData(),
    sets: [
      {
        ...pendingData().sets[0]!,
        status: "purchased" as const,
        pendingPurchaseId: null,
        purchaseIntentState: null,
        transactionId: "tx-1",
        transactionFinishPending: true,
      },
    ],
  };
  const present = stateAfterCompletedUnfinishedSnapshot(finishing, [
    {
      transactionId: "tx-1",
      productId: "product",
      state: "purchased",
      verified: true,
    },
  ]);
  assert.equal(present.sets[0]!.transactionFinishPending, true);
  const absent = stateAfterCompletedUnfinishedSnapshot(finishing, []);
  assert.equal(absent.sets[0]!.transactionFinishPending, false);
});

test("restart keeps frozen artwork and marks an absent presentation interrupted", () => {
  const absent = stateMarkingInterruptedPresentations(pendingData(), []);
  assert.equal(absent.activeSetId, "original");
  assert.equal(absent.sets[0]!.pendingPurchaseId, pendingToken);
  assert.equal(absent.sets[0]!.purchaseIntentState, "interrupted");
  const present = stateMarkingInterruptedPresentations(pendingData(), [
    {
      transactionId: "tx",
      productId: "product",
      appAccountToken: pendingToken,
      state: "purchased",
      verified: true,
    },
  ]);
  assert.equal(present.activeSetId, "original");
  assert.equal(present.sets[0]!.purchaseIntentState, "presenting");
});

test("snapshot token matching is case insensitive", () => {
  const present = stateMarkingInterruptedPresentations(pendingData(), [
    {
      transactionId: "late-tx",
      productId: "product",
      appAccountToken: pendingToken.toUpperCase(),
      state: "purchased",
      verified: true,
    },
  ]);
  assert.equal(present.sets[0]!.purchaseIntentState, "presenting");
});

test("an active purchase presentation is never marked interrupted by its own snapshot", () => {
  const active = stateAfterRecoverySnapshot(pendingData(), [], true);
  assert.equal(active.sets[0]!.purchaseIntentState, "presenting");
  const afterSession = stateAfterRecoverySnapshot(pendingData(), [], false);
  assert.equal(afterSession.sets[0]!.purchaseIntentState, "interrupted");
});

test("finish false retains recovery until a completed snapshot proves absence", () => {
  const finishing: AppStateData = {
    ...pendingData(),
    sets: [
      {
        ...pendingData().sets[0]!,
        status: "purchased",
        pendingPurchaseId: null,
        purchaseIntentState: null,
        transactionId: "tx-finish",
        transactionFinishPending: true,
      },
    ],
  };
  const retained = stateAfterFinishResult(finishing, "tx-finish", false);
  assert.equal(retained.sets[0]!.transactionFinishPending, true);
  const cleared = stateAfterFinishResult(finishing, "tx-finish", true);
  assert.equal(cleared.sets[0]!.transactionFinishPending, false);
  assert.equal(
    stateAfterCompletedUnfinishedSnapshot(retained, []).sets[0]!
      .transactionFinishPending,
    false,
  );
});

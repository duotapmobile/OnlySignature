import assert from "node:assert/strict";
import test from "node:test";
import { validateAndMigrateAppState } from "../src/domain/appStateValidation";
import { createDraftSet } from "../src/domain/models";

const valid = () => ({
  hydrated: true,
  activeSetId: "draft",
  sets: [createDraftSet("draft", "now")],
  selectedAsset: "signature",
  reviewPrompted: false,
  lastError: null,
});

test("semantic state validation migrates legacy purchase fields", () => {
  const result = validateAndMigrateAppState(valid());
  assert.equal(result.sets[0]!.purchaseIntentState, null);
});

test("semantic state validation rejects checksum-valid impossible state", () => {
  const malformed = valid();
  malformed.activeSetId = "missing";
  assert.throws(() => validateAndMigrateAppState(malformed));
  const duplicate = valid();
  duplicate.sets.push(createDraftSet("draft", "later"));
  assert.throws(() => validateAndMigrateAppState(duplicate));
});

test("semantic state validation canonicalizes UUID purchase tokens", () => {
  const pending = valid();
  pending.sets[0]!.pendingPurchaseId = "ABCDEFAB-CDEF-4ABC-8DEF-ABCDEFABCDEF";
  pending.sets[0]!.purchaseIntentState = "pending";
  assert.equal(
    validateAndMigrateAppState(pending).sets[0]!.pendingPurchaseId,
    "abcdefab-cdef-4abc-8def-abcdefabcdef",
  );
  pending.sets[0]!.pendingPurchaseId = "invalid-token";
  assert.throws(() => validateAndMigrateAppState(pending));
});

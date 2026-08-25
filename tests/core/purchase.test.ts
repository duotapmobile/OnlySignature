import { describe, expect, it } from "vitest";
import {
  acceptVerifiedTransaction,
  canDeleteAll,
  markBound,
  markFinished,
  preparePurchase,
  recordStorePending,
  shouldFinishTransaction,
  createDraftSet,
  updateDraftSlot,
} from "../../packages/core/src/index";
import type { DrawingSnapshot } from "../../packages/core/src/index";

const drawing: DrawingSnapshot = {
  renderingVersion: 1,
  width: 100,
  height: 50,
  orientation: "landscape",
  strokes: [
    {
      id: "s",
      points: [
        { x: 1, y: 1, t: 0 },
        { x: 80, y: 30, t: 10 },
      ],
    },
  ],
};

function prepared() {
  const set = updateDraftSlot(
    createDraftSet("set-1", "Signature Set 1", "n0"),
    "signature",
    drawing,
    "n1",
  );
  return preparePurchase(
    set,
    "intent-1",
    "com.example.onlysignature.transparent-set-v1",
    "n2",
  );
}

describe("purchase journal", () => {
  it("finishes only after verified binding and protected storage availability", () => {
    const pending = recordStorePending(prepared(), "n3");
    const verified = acceptVerifiedTransaction(
      pending,
      {
        verification: "verified",
        transactionId: "tx-1",
        productId: pending.productId,
      },
      "n4",
    );
    const bound = markBound(verified, "n5");
    expect(shouldFinishTransaction(bound, false)).toBe(false);
    expect(shouldFinishTransaction(bound, true)).toBe(true);
    expect(markFinished(bound, "n6").state).toBe("finished");
  });

  it("rejects unverified results and wrong products", () => {
    expect(
      acceptVerifiedTransaction(
        prepared(),
        { verification: "unverified" },
        "n3",
      ).state,
    ).toBe("recovery_required");
    expect(
      acceptVerifiedTransaction(
        prepared(),
        { verification: "verified", transactionId: "tx", productId: "wrong" },
        "n3",
      ).state,
    ).toBe("recovery_required");
  });

  it("blocks Delete All while any purchase is unfinished", () => {
    const intent = prepared();
    expect(canDeleteAll([intent])).toBe(false);
    const verified = acceptVerifiedTransaction(
      intent,
      {
        verification: "verified",
        transactionId: "tx",
        productId: intent.productId,
      },
      "n3",
    );
    const finished = markFinished(markBound(verified, "n4"), "n5");
    expect(canDeleteAll([finished])).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import {
  createDraftSet,
  duplicateAsDraft,
  fillIncludedSlot,
  finalizePurchasedSet,
  updateDraftSlot,
} from "../../packages/core/src/index";
import type { DrawingSnapshot } from "../../packages/core/src/index";

const drawing: DrawingSnapshot = {
  renderingVersion: 1,
  width: 300,
  height: 120,
  orientation: "landscape",
  strokes: [
    {
      id: "stroke-1",
      points: [
        { x: 10, y: 50, t: 0 },
        { x: 250, y: 40, t: 80 },
      ],
    },
  ],
};

describe("signature set rules", () => {
  it("purchases one completed slot and leaves the companion slot included", () => {
    const draft = updateDraftSlot(
      createDraftSet("set-1", "Signature Set 1", "2026-08-25T00:00:00Z"),
      "signature",
      drawing,
      "2026-08-25T00:01:00Z",
    );
    const purchased = finalizePurchasedSet(
      draft,
      "tx-1",
      "2026-08-25T00:02:00Z",
    );
    expect(purchased.signature.state).toBe("finalized");
    expect(purchased.initials.state).toBe("included_unclaimed");
    expect(purchased.purchaseState).toBe("purchased");
  });

  it("fills the included slot later without changing the transaction", () => {
    const draft = updateDraftSlot(
      createDraftSet("set-1", "Signature Set 1", "2026-08-25T00:00:00Z"),
      "signature",
      drawing,
      "2026-08-25T00:01:00Z",
    );
    const purchased = finalizePurchasedSet(
      draft,
      "tx-1",
      "2026-08-25T00:02:00Z",
    );
    const filled = fillIncludedSlot(
      purchased,
      "initials",
      drawing,
      "2026-08-25T00:03:00Z",
    );
    expect(filled.initials.state).toBe("finalized");
    expect(filled.transactionId).toBe("tx-1");
  });

  it("does not permit editing a finalized slot", () => {
    const draft = updateDraftSlot(
      createDraftSet("set-1", "Signature Set 1", "2026-08-25T00:00:00Z"),
      "signature",
      drawing,
      "2026-08-25T00:01:00Z",
    );
    const purchased = finalizePurchasedSet(
      draft,
      "tx-1",
      "2026-08-25T00:02:00Z",
    );
    expect(() =>
      updateDraftSlot(purchased, "signature", drawing, "2026-08-25T00:03:00Z"),
    ).toThrow(/immutable/);
  });

  it("duplicates purchased art as a separate unpaid draft", () => {
    const draft = updateDraftSlot(
      createDraftSet("set-1", "Signature Set 1", "2026-08-25T00:00:00Z"),
      "signature",
      drawing,
      "2026-08-25T00:01:00Z",
    );
    const purchased = finalizePurchasedSet(
      draft,
      "tx-1",
      "2026-08-25T00:02:00Z",
    );
    const duplicate = duplicateAsDraft(
      purchased,
      "set-2",
      "Signature Set 2",
      "2026-08-25T00:03:00Z",
    );
    expect(duplicate.purchaseState).toBe("unpurchased");
    expect(duplicate.transactionId).toBeNull();
    expect(duplicate.signature.state).toBe("draft");
    expect(purchased.transactionId).toBe("tx-1");
  });
});

import assert from "node:assert/strict";
import test from "node:test";
import {
  purchaseErrorCopy,
  purchaseResultForState,
  purchaseResultFeedback,
} from "../src/domain/purchase-result-feedback";
import { purchaseStatusCopy } from "../src/domain/purchase-feedback";
import type { StoreKitTransaction } from "../src/services/storekitContract";
import { screenshotFixtureSet } from "../src/domain/fixtures";
import type { AppStateData } from "../src/domain/models";

const result = (
  state: StoreKitTransaction["state"],
  errorCategory?: string,
): StoreKitTransaction => ({
  transactionId: state === "purchased" ? "verified-test-transaction" : "",
  productId: "product",
  state,
  verified: state === "purchased",
  ...(errorCategory ? { errorCategory } : {}),
});

test("terminal unavailable product is a retryable error, never a frozen interrupted status", () => {
  for (const category of ["product-not-found", "not-available-in-storefront"]) {
    const outcome = purchaseResultFeedback(result("request-failed", category));
    assert.equal(outcome.feedback?.tone, "error");
    assert.match(
      outcome.feedback!.message,
      /temporarily unavailable[\s\S]*set is safe[\s\S]*Try again/,
    );
    assert.doesNotMatch(
      outcome.feedback!.message,
      /frozen|pending|Do not purchase again/,
    );
    assert.equal(outcome.haptic, "error");
  }
  assert.match(
    purchaseResultFeedback(result("request-failed", "product-lookup-failed"))
      .feedback!.message,
    /Check your connection/,
  );
});

test("pending, cancellation, interruption, and unverified failure are distinct", () => {
  assert.deepEqual(purchaseResultFeedback(result("pending")), {
    feedback: { message: purchaseStatusCopy.pending, tone: "info" },
    haptic: "warning",
  });
  assert.deepEqual(purchaseResultFeedback(result("cancelled")), {
    feedback: {
      message: "Purchase cancelled. You were not charged.",
      tone: "info",
    },
    haptic: null,
  });
  assert.deepEqual(purchaseResultFeedback(result("request-interrupted")), {
    feedback: { message: purchaseStatusCopy.interrupted, tone: "info" },
    haptic: "warning",
  });
  const failed = purchaseResultFeedback(result("failed"));
  assert.equal(failed.feedback?.tone, "error");
  assert.match(
    failed.feedback!.message,
    /could not verify[\s\S]*Do not purchase it again/,
  );
  assert.equal(failed.haptic, "error");
  assert.deepEqual(
    purchaseResultFeedback({
      ...result("purchased"),
      fulfillmentState: "complete",
    }),
    {
      feedback: null,
      haptic: "success",
    },
  );
});

test("success requires a locally bound and finished purchase, not just a verified charge", () => {
  const transaction = result("purchased");
  const data: AppStateData = {
    hydrated: true,
    activeSetId: screenshotFixtureSet.id,
    selectedAsset: "signature",
    sets: [
      {
        ...screenshotFixtureSet,
        transactionId: transaction.transactionId,
        transactionFinishPending: true,
      },
    ],
    unboundPurchases: [],
    reviewPrompted: false,
    lastError: null,
  };
  const before = JSON.stringify(data);
  const finishing = purchaseResultForState(data, transaction, "product");
  assert.equal(finishing.fulfillmentState, "finishing");
  assert.deepEqual(purchaseResultFeedback(finishing), {
    feedback: { message: purchaseStatusCopy.finishing, tone: "info" },
    haptic: "warning",
  });
  assert.equal(JSON.stringify(data), before);
  const complete = purchaseResultForState(
    {
      ...data,
      sets: data.sets.map((set) => ({
        ...set,
        transactionFinishPending: false,
      })),
    },
    transaction,
    "product",
  );
  assert.equal(complete.fulfillmentState, "complete");
  assert.equal(purchaseResultFeedback(complete).haptic, "success");
  for (const unbound of [
    purchaseResultForState({ ...data, sets: [] }, transaction, "product"),
    purchaseResultForState(
      data,
      { ...transaction, verified: false },
      "product",
    ),
    purchaseResultForState(data, transaction, "wrong-product"),
    transaction,
  ]) {
    assert.equal(purchaseResultFeedback(unbound).haptic, "warning");
    assert.equal(
      purchaseResultFeedback(unbound).feedback?.message,
      purchaseStatusCopy.unbound,
    );
  }
  assert.deepEqual(
    purchaseResultForState(data, result("cancelled"), "product"),
    result("cancelled"),
  );
});

test("product errors reuse honest recoverable copy and do not fabricate a charge or price", () => {
  for (const error of [
    "product-price-unavailable",
    "product-identity-mismatch",
    "product-lookup-timeout",
    "product-invalid-response",
  ])
    assert.match(
      purchaseErrorCopy(new Error(error)),
      /Couldn’t load Transparent Background/,
    );
  assert.match(
    purchaseErrorCopy(new Error("storage-write-failed")),
    /Your signing set is safe/,
  );
});

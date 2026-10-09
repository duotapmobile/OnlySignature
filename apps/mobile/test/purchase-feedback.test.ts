import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { screenshotFixtureSetsFor } from "../src/domain/fixtures";
import { isAuthorizedFixture } from "../src/domain/screenshotFixtureAuthorization";
import {
  purchaseFeedback,
  purchaseStatusCopy,
} from "../src/domain/purchase-feedback";
import type { AppStateData } from "../src/domain/models";

function state(fixture = "both"): AppStateData {
  const sets = screenshotFixtureSetsFor(fixture);
  return {
    hydrated: true,
    activeSetId: sets[0]!.id,
    sets,
    selectedAsset: "signature",
    unboundPurchases: [],
    reviewPrompted: false,
    hasSeenFullOpening: true,
    lastError: null,
  };
}

function feedback(fixture: string) {
  const data = state(fixture);
  return purchaseFeedback({
    activeSet: data.sets[0]!,
    data,
    busy: false,
    error: null,
    errorTone: "error",
  });
}

test("reopened pending, interrupted, finishing, and other-set holds expose quiet explanations", () => {
  for (const [fixture, message] of [
    ["purchase-pending", purchaseStatusCopy.pending],
    ["purchase-interrupted", purchaseStatusCopy.interrupted],
    ["purchase-finishing", purchaseStatusCopy.finishing],
    ["purchase-other-set", purchaseStatusCopy.otherSet],
  ]) {
    assert.deepEqual(feedback(fixture!), { message, tone: "info" });
  }
  assert.equal(feedback("both"), null);
  assert.equal(feedback("purchased"), null);
});

test("unbound recovery stays informational and explicit errors retain their own tone", () => {
  const data = state();
  data.unboundPurchases = [
    {
      transactionId: "test-transaction",
      productId: "test-product",
      appAccountToken: null,
      detectedAt: "2026-10-03T00:00:00Z",
    },
  ];
  const input = {
    activeSet: data.sets[0]!,
    data,
    busy: false,
    error: null,
    errorTone: "error" as const,
  };
  assert.deepEqual(purchaseFeedback(input), {
    message: purchaseStatusCopy.unbound,
    tone: "info",
  });
  assert.deepEqual(
    purchaseFeedback({
      ...input,
      error: "Purchase cancelled. You were not charged.",
      errorTone: "info",
    }),
    { message: "Purchase cancelled. You were not charged.", tone: "info" },
  );
  assert.deepEqual(
    purchaseFeedback({ ...input, error: "Purchase couldn’t open" }),
    { message: "Purchase couldn’t open", tone: "error" },
  );
  assert.equal(purchaseFeedback({ ...input, busy: true }), null);
});

test("status presentation does not mutate or unlock frozen sets", () => {
  const data = state("purchase-finishing");
  const before = JSON.stringify(data);
  purchaseFeedback({
    activeSet: data.sets[0]!,
    data,
    busy: false,
    error: null,
    errorTone: "error",
  });
  assert.equal(JSON.stringify(data), before);
  assert.equal(data.sets[0]!.transactionFinishPending, true);
});

test("ambiguous operation exceptions prefer live durable holds without masking definitive result feedback", () => {
  const retryMessage = "Purchase couldn’t open. Try again.";
  for (const [fixture, message] of [
    ["purchase-pending", purchaseStatusCopy.pending],
    ["purchase-interrupted", purchaseStatusCopy.interrupted],
    ["purchase-finishing", purchaseStatusCopy.finishing],
    ["purchase-other-set", purchaseStatusCopy.otherSet],
  ]) {
    const data = state(fixture!);
    const before = JSON.stringify(data);
    const input = {
      activeSet: data.sets[0]!,
      data,
      busy: false,
      error: retryMessage,
      errorTone: "error" as const,
    };
    assert.deepEqual(purchaseFeedback({ ...input, preferRecovery: true }), {
      message,
      tone: "info",
    });
    const verificationMessage =
      "Apple could not verify this purchase. Do not purchase it again.";
    assert.deepEqual(
      purchaseFeedback({ ...input, error: verificationMessage }),
      {
        message: verificationMessage,
        tone: "error",
      },
    );
    assert.equal(JSON.stringify(data), before);
  }
  const data = state();
  assert.deepEqual(
    purchaseFeedback({
      activeSet: data.sets[0]!,
      data,
      busy: false,
      error: retryMessage,
      errorTone: "error",
      preferRecovery: true,
    }),
    { message: retryMessage, tone: "error" },
  );
  data.unboundPurchases.push({
    transactionId: "test-transaction",
    productId: "test-product",
    appAccountToken: null,
    detectedAt: "2026-10-03T00:00:00Z",
  });
  assert.deepEqual(
    purchaseFeedback({
      activeSet: data.sets[0]!,
      data,
      busy: false,
      error: retryMessage,
      errorTone: "error",
      preferRecovery: true,
    }),
    { message: purchaseStatusCopy.unbound, tone: "info" },
  );
});

test("recovery fixtures remain inert outside authorized screenshot mode", () => {
  for (const fixture of [
    "purchase-pending",
    "purchase-interrupted",
    "purchase-finishing",
    "purchase-other-set",
  ]) {
    assert.equal(isAuthorizedFixture(fixture, fixture, false), false);
    assert.equal(isAuthorizedFixture(fixture, fixture, true), true);
  }
});

test("status strings are existing source copy and every purchase screen shares the recipe", async () => {
  const [provider, hook, presentation, ...routes] = await Promise.all([
    readFile(
      new URL("../src/state/AppStateProvider.tsx", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../src/hooks/use-transparent-purchase.ts", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../src/components/purchase-feedback.tsx", import.meta.url),
      "utf8",
    ),
    ...["purchase", "clear-background", "free-export"].map((name) =>
      readFile(new URL(`../src/app/${name}.tsx`, import.meta.url), "utf8"),
    ),
  ]);
  for (const message of [
    purchaseStatusCopy.finishing,
    purchaseStatusCopy.unbound,
    purchaseStatusCopy.otherSet,
  ])
    assert(provider.includes(message));
  assert.match(hook, /purchaseResultFeedback\(result\)/);
  assert.match(hook, /setError\(outcome\.feedback\.message\)/);
  assert.equal((hook.match(/setPreferRecovery\(true\)/g) ?? []).length, 2);
  assert.match(hook, /catch \(caught\) \{\s*setPreferRecovery\(true\)/);
  assert.match(hook, /feedback: purchaseFeedback\(\{[^}]*preferRecovery/s);
  for (const route of routes) {
    assert.match(route, /<PurchaseFeedback/);
    assert.match(route, /scroll=\{Boolean\((purchase\.)?feedback\)\}/);
  }
  assert.match(presentation, /role=\{isError \? "alert" : "status"\}/);
  assert.match(
    presentation,
    /accessibilityLiveRegion=\{isError \? "assertive" : "polite"\}/,
  );
  assert.doesNotMatch(presentation, /numberOfLines|allowFontScaling|boxShadow/);
});

test("short recovery selection uses tighter spacing without changing ready or enlarged-text geometry", async () => {
  const source = await readFile(
    new URL("../src/app/purchase.tsx", import.meta.url),
    "utf8",
  );
  assert.match(
    source,
    /Boolean\(feedback\) && height <= 700 && fontScale <= 1\.15/,
  );
  assert.equal(
    (source.match(/recoveryCompact=\{compactRecovery\}/g) ?? []).length,
    2,
  );
  assert.match(source, /recoveryChoice: \{ padding: 6, gap: 4 \}/);
  assert.match(source, /recoverySwatch: \{ width: 44, height: 44 \}/);
  assert.match(
    source,
    /recoveryContent: \{ paddingTop: 4, paddingBottom: 4 \}/,
  );
});

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { storeKitTransaction } from "../src/services/storekitContract";

const swiftSource = readFileSync(
  fileURLToPath(
    new URL(
      "../modules/only-signature-native/ios/OnlySignatureStoreKitModule.swift",
      import.meta.url,
    ),
  ),
  "utf8",
);

test("native product lookup fails terminally before purchase presentation", () => {
  assert.match(
    swiftSource,
    /Product\.products\(for: \[productId\]\).*?state: "request-failed".*?errorCategory: "product-not-found"/s,
  );
  assert.match(
    swiftSource,
    /catch \{\s*return self\.requestPayload\(productId: productId, appAccountToken: appAccountToken, state: "request-failed", errorCategory: "product-lookup-failed"\)/s,
  );
});

test("native StoreKit errors preserve the terminal versus ambiguous contract", () => {
  assert.match(swiftSource, /case \.userCancelled:[\s\S]*?state: "cancelled"/);
  for (const terminalCase of [
    "notAvailableInStorefront",
    "notEntitled",
    "unsupported",
  ])
    assert.match(
      swiftSource,
      new RegExp(`case \\.${terminalCase}:[\\s\\S]*?state: "request-failed"`),
    );
  for (const ambiguousCase of ["networkError", "systemError", "unknown"])
    assert.match(
      swiftSource,
      new RegExp(
        `case \\.${ambiguousCase}:[\\s\\S]*?state: "request-interrupted"`,
      ),
    );
  assert.match(
    swiftSource,
    /error is Product\.PurchaseError[\s\S]*?state: "request-failed"/,
  );
  assert.match(
    swiftSource,
    /case \.userCancelled: return \["transactionId": "", "productId": productId, "state": "cancelled"/,
  );
});

test("adapter validates and normalizes native classification payloads", () => {
  assert.deepEqual(
    storeKitTransaction({
      transactionId: "",
      productId: "product",
      appAccountToken: " ABCDEFAB-CDEF-4ABC-8DEF-ABCDEFABCDEF ",
      state: "request-failed",
      verified: false,
      errorCategory: "product-not-found",
    }),
    {
      transactionId: "",
      productId: "product",
      appAccountToken: "abcdefab-cdef-4abc-8def-abcdefabcdef",
      state: "request-failed",
      verified: false,
      errorCategory: "product-not-found",
    },
  );
  assert.throws(() =>
    storeKitTransaction({
      transactionId: "",
      productId: "product",
      state: "invented-state",
      verified: false,
    }),
  );
  assert.throws(() =>
    storeKitTransaction({
      transactionId: "",
      productId: "product",
      state: "purchased",
      verified: false,
    }),
  );
});

test("verified recovery accepts a transaction without an app account token", () => {
  assert.deepEqual(
    storeKitTransaction({
      transactionId: "12345",
      productId: "product",
      state: "purchased",
      verified: true,
    }),
    {
      transactionId: "12345",
      productId: "product",
      state: "purchased",
      verified: true,
    },
  );
  assert.match(
    swiftSource,
    /if let appAccountToken = transaction\.appAccountToken \{[\s\S]*?result\["appAccountToken"\]/,
  );
  assert.doesNotMatch(
    swiftSource,
    /"appAccountToken": transaction\.appAccountToken\?/,
  );
});

test("native purchase rejects a missing or malformed correlation token before lookup", () => {
  const invalidTokenGuard = swiftSource.indexOf(
    'errorCategory: "invalid-app-account-token"',
  );
  const productLookup = swiftSource.indexOf(
    "Product.products(for: [productId])",
    invalidTokenGuard,
  );
  assert.ok(invalidTokenGuard > 0);
  assert.ok(productLookup > invalidTokenGuard);
  assert.match(
    swiftSource,
    /product\.purchase\(options: \[\.appAccountToken\(token\)\]\)/,
  );
  assert.doesNotMatch(
    swiftSource,
    /else \{ result = try await product\.purchase\(\) \}/,
  );
});

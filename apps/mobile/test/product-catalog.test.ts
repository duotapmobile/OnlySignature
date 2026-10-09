import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  createProductRequest,
  purchaseActionState,
  validatedProduct,
} from "../src/services/productCatalog";

const productId = "com.duotap.onlysignature.transparent_set_v1";
const product = { productId, displayPrice: "$1.99" };

test("a purchase price must come from the exact Apple product, including localized currency", () => {
  for (const displayPrice of ["$1.99", "1,99 €", "¥300", "  £1.99  "])
    assert.deepEqual(validatedProduct({ productId, displayPrice }, productId), {
      productId,
      displayPrice: displayPrice.trim(),
    });
  for (const value of [
    null,
    [],
    "1.99",
    {},
    { ...product, productId: "wrong" },
    { productId },
    { productId, displayPrice: "  " },
    { productId, displayPrice: 1.99 },
  ])
    assert.throws(() => validatedProduct(value, productId));
});

test("concurrent startup, foreground, and manual retry perform one product lookup", async () => {
  let requests = 0;
  let resolveLookup!: (value: unknown) => void;
  const lookup = createProductRequest(() => {
    requests++;
    return new Promise((resolve) => {
      resolveLookup = resolve;
    });
  }, productId);
  const first = lookup();
  const second = lookup();
  assert.equal(first, second);
  await Promise.resolve();
  assert.equal(requests, 1);
  resolveLookup(product);
  assert.deepEqual(await first, product);
  assert.deepEqual(await second, product);
  const third = lookup();
  await Promise.resolve();
  assert.equal(requests, 2);
  resolveLookup(product);
  await third;
});

test("failed lookup permits a real retry without inventing a price", async () => {
  let requests = 0;
  const lookup = createProductRequest(async () => {
    if (++requests === 1) throw new Error("product-not-found");
    return product;
  }, productId);
  await assert.rejects(lookup(), /product-not-found/);
  assert.deepEqual(await lookup(), product);
  assert.equal(requests, 2);
});

test("hung lookup times out, and a late response cannot overwrite a newer retry", async () => {
  let requests = 0;
  let finishLate!: (value: unknown) => void;
  const lookup = createProductRequest(
    () => {
      if (++requests === 1)
        return new Promise((resolve) => {
          finishLate = resolve;
        });
      return Promise.resolve({ productId, displayPrice: "1,99 €" });
    },
    productId,
    15,
  );
  await assert.rejects(lookup(), /product-lookup-timeout/);
  assert.deepEqual(await lookup(), { productId, displayPrice: "1,99 €" });
  finishLate(product);
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(requests, 2);
});

test("synchronous adapter errors reject safely and do not poison the next lookup", async () => {
  let requests = 0;
  const lookup = createProductRequest(() => {
    if (++requests === 1) throw new Error("native-unavailable");
    return Promise.resolve(product);
  }, productId);
  await assert.rejects(lookup(), /native-unavailable/);
  assert.deepEqual(await lookup(), product);
});

test("price loading and unavailable states never expose a paid action", () => {
  const input = {
    productStatus: "loading" as const,
    displayPrice: "",
    busy: false,
    unboundPurchase: false,
  };
  assert.deepEqual(purchaseActionState(input), {
    label: "Loading Apple Price...",
    loadingPrice: true,
    retryPrice: false,
    ready: false,
  });
  for (const productStatus of ["unavailable", "available"] as const)
    assert.deepEqual(purchaseActionState({ ...input, productStatus }), {
      label: "Retry Apple Price",
      loadingPrice: false,
      retryPrice: true,
      ready: false,
    });
  assert.equal(
    purchaseActionState({
      ...input,
      productStatus: "available",
      displayPrice: "$1.99",
    }).label,
    "Purchase Transparent Signature",
  );
  assert.equal(
    purchaseActionState({
      ...input,
      productStatus: "unavailable",
      displayPrice: "$1.99",
    }).ready,
    false,
  );
});

test("recovery applies the existing purchase without requiring price or invoking a new paid action", () => {
  for (const productStatus of [
    "loading",
    "available",
    "unavailable",
  ] as const) {
    const action = purchaseActionState({
      productStatus,
      displayPrice: "",
      busy: false,
      unboundPurchase: true,
    });
    assert.equal(action.label, "Apply Apple Purchase to This Set");
    assert.equal(action.ready, true);
    assert.equal(action.retryPrice, false);
    assert.equal(action.loadingPrice, false);
  }
});

test("all three purchase routes share retry, with one haptic owner and finish-last unchanged", async () => {
  const paths = [
    "components/purchase-action.tsx",
    "hooks/use-transparent-purchase.ts",
    "state/AppStateProvider.tsx",
    "app/purchase.tsx",
    "app/clear-background.tsx",
    "app/free-export.tsx",
  ];
  const [action, hook, provider, ...routes] = await Promise.all(
    paths.map((path) =>
      readFile(new URL(`../src/${path}`, import.meta.url), "utf8"),
    ),
  );
  assert.match(action!, /action\.retryPrice \? onRetry : onPress/);
  assert.match(action!, /disabled=\{disabled \|\| action\.loadingPrice\}/);
  assert.match(action!, /haptic=\{action\.retryPrice\}/);
  assert.doesNotMatch(action!, /\$1\.99/);
  assert.match(
    hook!,
    /actionInFlight\.current[\s\S]*?productStatus !== "available"[\s\S]*?return;[\s\S]*?actionInFlight\.current = true;[\s\S]*?hapticLightImpact/,
  );
  assert.match(hook!, /finally \{[\s\S]*?actionInFlight\.current = false/);
  assert.match(hook!, /setPurchasePrice\(displayPrice\)/);
  assert.match(hook!, /displayPrice: busy \? purchasePrice : displayPrice/);
  for (const route of routes) {
    assert.match(route, /<PurchaseAction/);
    assert.match(route, /productStatus=\{/);
    assert.match(route, /onRetry=\{/);
  }
  assert.equal((provider!.match(/storeKit\.loadProduct\(\)/g) ?? []).length, 1);
  assert.match(provider!, /createProductRequest/);
  assert(
    provider!.indexOf('throw new Error("purchase-durability-check-failed")') <
      provider!.indexOf("storeKit.finish("),
  );
  assert.match(
    provider!,
    /purchaseRequestClearsPendingIntent\(transaction\.state\)/,
  );
  assert.match(
    provider!,
    /currentData\.activeSetId !== initialTarget\.id[\s\S]*?purchase-target-changed/,
  );
  assert.match(provider!, /return purchaseResultForState\(/);
});

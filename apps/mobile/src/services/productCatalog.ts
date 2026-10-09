export interface ProductInfo {
  productId: string;
  displayPrice: string;
}

export type ProductStatus = "loading" | "available" | "unavailable";

/** No guessed price or mismatched product may enable the purchase action. */
export function validatedProduct(
  value: unknown,
  expectedId: string,
): ProductInfo {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("product-invalid-response");
  const candidate = value as Record<string, unknown>;
  if (candidate.productId !== expectedId)
    throw new Error("product-identity-mismatch");
  if (
    typeof candidate.displayPrice !== "string" ||
    !candidate.displayPrice.trim()
  )
    throw new Error("product-price-unavailable");
  return { productId: expectedId, displayPrice: candidate.displayPrice.trim() };
}

/** Coalesce launch, foreground, and manual retry; discard timed-out results. */
export function createProductRequest(
  load: () => Promise<unknown>,
  expectedId: string,
  timeoutMs = 15_000,
) {
  let inFlight: Promise<ProductInfo> | null = null;
  return (): Promise<ProductInfo> => {
    if (inFlight) return inFlight;
    const request = new Promise<ProductInfo>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error("product-lookup-timeout")),
        timeoutMs,
      );
      Promise.resolve()
        .then(load)
        .then((value) => validatedProduct(value, expectedId))
        .then(resolve, reject)
        .finally(() => clearTimeout(timer));
    });
    inFlight = request.finally(() => {
      inFlight = null;
    });
    return inFlight;
  };
}

export function purchaseActionState({
  productStatus,
  displayPrice,
  busy,
  unboundPurchase,
}: {
  productStatus: ProductStatus;
  displayPrice: string;
  busy: boolean;
  unboundPurchase: boolean;
}) {
  const ready = productStatus === "available" && Boolean(displayPrice.trim());
  const loadingPrice = !unboundPurchase && !busy && productStatus === "loading";
  const retryPrice = !unboundPurchase && !busy && !ready && !loadingPrice;
  return {
    label: busy
      ? unboundPurchase
        ? "Applying Apple Purchase..."
        : "Opening Apple Purchase..."
      : unboundPurchase
        ? "Apply Apple Purchase to This Set"
        : loadingPrice
          ? "Loading Apple Price..."
          : retryPrice
            ? "Retry Apple Price"
            : "Purchase Transparent Signature",
    loadingPrice,
    retryPrice,
    ready: unboundPurchase || ready,
  };
}

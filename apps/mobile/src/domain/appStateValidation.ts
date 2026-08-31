import type { AppStateData, DrawingAsset, SignatureSet } from "./models";
import { canonicalPurchaseToken } from "./purchaseState";

const object = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("local-state-invalid");
  return value as Record<string, unknown>;
};

const asset = (value: unknown, expectedKind: string): DrawingAsset | null => {
  if (value === null) return null;
  const candidate = object(value) as unknown as DrawingAsset;
  if (
    candidate.kind !== expectedKind ||
    !Array.isArray(candidate.strokes) ||
    !Number.isFinite(candidate.canvasWidth) ||
    candidate.canvasWidth <= 0 ||
    !Number.isFinite(candidate.canvasHeight) ||
    candidate.canvasHeight <= 0 ||
    !["portrait", "landscape"].includes(candidate.orientation) ||
    candidate.renderingVersion !== 1
  )
    throw new Error("local-state-invalid");
  for (const stroke of candidate.strokes) {
    if (
      !stroke ||
      typeof stroke.id !== "string" ||
      !Array.isArray(stroke.points)
    )
      throw new Error("local-state-invalid");
    for (const point of stroke.points)
      if (
        !Number.isFinite(point.x) ||
        !Number.isFinite(point.y) ||
        !Number.isFinite(point.t) ||
        (point.pressure !== null && !Number.isFinite(point.pressure))
      )
        throw new Error("local-state-invalid");
  }
  return candidate;
};

const signatureSet = (value: unknown): SignatureSet => {
  const source = object(value);
  const candidate = {
    ...source,
    purchaseIntentState: source.pendingPurchaseId
      ? (source.purchaseIntentState ?? "pending")
      : null,
  } as unknown as SignatureSet;
  if (
    typeof candidate.id !== "string" ||
    !candidate.id ||
    typeof candidate.label !== "string" ||
    !["draft", "purchased"].includes(candidate.status) ||
    !Number.isFinite(candidate.exportCount) ||
    candidate.exportCount < 0 ||
    typeof candidate.lastUsedAt !== "string" ||
    (candidate.pendingPurchaseId !== null &&
      typeof candidate.pendingPurchaseId !== "string") ||
    (candidate.transactionId !== null &&
      typeof candidate.transactionId !== "string") ||
    ![null, "presenting", "pending", "interrupted"].includes(
      candidate.purchaseIntentState,
    ) ||
    (candidate.pendingPurchaseId === null &&
      candidate.purchaseIntentState !== null) ||
    (candidate.pendingPurchaseId !== null &&
      candidate.purchaseIntentState === null) ||
    (candidate.transactionFinishPending && !candidate.transactionId) ||
    (candidate.status === "purchased" && !candidate.transactionId) ||
    ![null, "signature", "initials"].includes(candidate.unclaimedSlot)
  )
    throw new Error("local-state-invalid");
  const pendingPurchaseId = candidate.pendingPurchaseId
    ? canonicalPurchaseToken(candidate.pendingPurchaseId)
    : null;
  if (candidate.pendingPurchaseId && !pendingPurchaseId)
    throw new Error("local-state-invalid");
  return {
    ...candidate,
    pendingPurchaseId,
    signature: asset(candidate.signature, "signature"),
    initials: asset(candidate.initials, "initials"),
  };
};

export const validateAndMigrateAppState = (value: unknown): AppStateData => {
  const source = object(value);
  if (
    !Array.isArray(source.sets) ||
    source.sets.length === 0 ||
    typeof source.activeSetId !== "string" ||
    !["signature", "initials"].includes(String(source.selectedAsset)) ||
    typeof source.reviewPrompted !== "boolean"
  )
    throw new Error("local-state-invalid");
  const sets = source.sets.map(signatureSet);
  const unboundPurchases = (
    Array.isArray(source.unboundPurchases) ? source.unboundPurchases : []
  ).map((value) => {
    const candidate = object(value);
    const appAccountToken =
      candidate.appAccountToken === null
        ? null
        : canonicalPurchaseToken(String(candidate.appAccountToken ?? ""));
    if (
      typeof candidate.transactionId !== "string" ||
      !candidate.transactionId ||
      typeof candidate.productId !== "string" ||
      !candidate.productId ||
      (candidate.appAccountToken !== null && !appAccountToken) ||
      typeof candidate.detectedAt !== "string" ||
      !candidate.detectedAt
    )
      throw new Error("local-state-invalid");
    return {
      transactionId: candidate.transactionId,
      productId: candidate.productId,
      appAccountToken,
      detectedAt: candidate.detectedAt,
    };
  });
  const ids = new Set(sets.map((set) => set.id));
  if (ids.size !== sets.length || !ids.has(source.activeSetId))
    throw new Error("local-state-invalid");
  const transactionIds = sets
    .map((set) => set.transactionId)
    .filter((id): id is string => Boolean(id));
  const pendingTokens = sets
    .map((set) => set.pendingPurchaseId)
    .filter((id): id is string => Boolean(id));
  if (
    new Set(transactionIds).size !== transactionIds.length ||
    new Set(pendingTokens).size !== pendingTokens.length ||
    new Set(unboundPurchases.map((purchase) => purchase.transactionId)).size !==
      unboundPurchases.length ||
    unboundPurchases.some((purchase) =>
      transactionIds.includes(purchase.transactionId),
    )
  )
    throw new Error("local-state-invalid");
  return {
    hydrated: Boolean(source.hydrated),
    activeSetId: source.activeSetId,
    sets,
    selectedAsset: source.selectedAsset as AppStateData["selectedAsset"],
    unboundPurchases,
    reviewPrompted: source.reviewPrompted,
    lastError: typeof source.lastError === "string" ? source.lastError : null,
  };
};

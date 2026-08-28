export type AssetKind = "signature" | "initials";
export type Background = "transparent" | "white";
export type ExportFormat = "png-transparent" | "png-white" | "jpeg-white";
export type SetStatus = "draft" | "purchased";

export interface StrokePoint {
  x: number;
  y: number;
  t: number;
  pressure: number | null;
}

export interface Stroke {
  id: string;
  points: StrokePoint[];
}

export interface DrawingAsset {
  kind: AssetKind;
  strokes: Stroke[];
  canvasWidth: number;
  canvasHeight: number;
  orientation: "portrait" | "landscape";
  renderingVersion: 1;
  finalizedHash: string | null;
}

export interface SignatureSet {
  id: string;
  label: string;
  status: SetStatus;
  signature: DrawingAsset | null;
  initials: DrawingAsset | null;
  purchasedAt: string | null;
  transactionId: string | null;
  pendingPurchaseId: string | null;
  purchaseIntentState: "presenting" | "pending" | "interrupted" | null;
  transactionFinishPending: boolean;
  unclaimedSlot: AssetKind | null;
  lastUsedAt: string;
  exportCount: number;
}

export interface UnboundPurchase {
  transactionId: string;
  productId: string;
  appAccountToken: string | null;
  detectedAt: string;
}

export interface AppStateData {
  hydrated: boolean;
  activeSetId: string;
  sets: SignatureSet[];
  selectedAsset: AssetKind;
  unboundPurchases: UnboundPurchase[];
  reviewPrompted: boolean;
  lastError: string | null;
}

export const createEmptyAsset = (kind: AssetKind): DrawingAsset => ({
  kind,
  strokes: [],
  canvasWidth: 900,
  canvasHeight: 420,
  orientation: "portrait",
  renderingVersion: 1,
  finalizedHash: null,
});

export const createDraftSet = (
  id: string,
  now = new Date().toISOString(),
): SignatureSet => ({
  id,
  label: "",
  status: "draft",
  signature: createEmptyAsset("signature"),
  initials: createEmptyAsset("initials"),
  purchasedAt: null,
  transactionId: null,
  pendingPurchaseId: null,
  purchaseIntentState: null,
  transactionFinishPending: false,
  unclaimedSlot: null,
  lastUsedAt: now,
  exportCount: 0,
});

export const hasDrawing = (asset: DrawingAsset | null): asset is DrawingAsset =>
  Boolean(asset?.strokes.some((stroke) => stroke.points.length > 0));

export const isTransparent = (format: ExportFormat): boolean =>
  format.endsWith("transparent");

export const formatLabel: Record<ExportFormat, string> = {
  "png-transparent": "PNG, Transparent",
  "png-white": "PNG, White Background",
  "jpeg-white": "JPEG, White Background",
};

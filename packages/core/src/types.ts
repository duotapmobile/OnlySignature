export type SlotKind = "signature" | "initials";
export type SlotState = "empty" | "draft" | "finalized" | "included_unclaimed";
export type PurchaseState =
  | "unpurchased"
  | "purchase_pending"
  | "recovery_required"
  | "purchased";
export type Orientation = "portrait" | "landscape";

export interface StrokePoint {
  x: number;
  y: number;
  t: number;
  pressure?: number;
}

export interface Stroke {
  id: string;
  points: readonly StrokePoint[];
}

export interface DrawingSnapshot {
  renderingVersion: 1;
  width: number;
  height: number;
  orientation: Orientation;
  strokes: readonly Stroke[];
}

export interface SignatureSlot {
  kind: SlotKind;
  state: SlotState;
  drawing: DrawingSnapshot | null;
  normalizedHash: string | null;
  finalizedAt: string | null;
}

export interface SignatureSet {
  id: string;
  label: string;
  signature: SignatureSlot;
  initials: SignatureSlot;
  purchaseState: PurchaseState;
  transactionId: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ExportFormat = "png-transparent" | "png-white" | "jpeg-white";

export interface PendingPurchase {
  intentId: string;
  setId: string;
  productId: string;
  snapshotHash: string;
  state:
    | "prepared"
    | "store_pending"
    | "verified_unbound"
    | "bound_unfinished"
    | "finished"
    | "recovery_required";
  transactionId: string | null;
  appAccountToken: string | null;
  createdAt: string;
  updatedAt: string;
}

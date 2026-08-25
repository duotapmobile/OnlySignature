import { drawingHash, hasVisibleDrawing } from "./strokes";
import type {
  DrawingSnapshot,
  SignatureSet,
  SignatureSlot,
  SlotKind,
} from "./types";

export interface Clock {
  now(): string;
}
export interface IdFactory {
  create(): string;
}

const emptySlot = (kind: SlotKind): SignatureSlot => ({
  kind,
  state: "empty",
  drawing: null,
  normalizedHash: null,
  finalizedAt: null,
});

export function createDraftSet(
  id: string,
  label: string,
  now: string,
): SignatureSet {
  return {
    id,
    label,
    signature: emptySlot("signature"),
    initials: emptySlot("initials"),
    purchaseState: "unpurchased",
    transactionId: null,
    createdAt: now,
    updatedAt: now,
  };
}

export function updateDraftSlot(
  set: SignatureSet,
  kind: SlotKind,
  drawing: DrawingSnapshot | null,
  now: string,
): SignatureSet {
  const current = set[kind];
  if (current.state === "finalized")
    throw new Error(
      "Finalized purchased slots are immutable; duplicate the set as a new draft",
    );
  if (
    set.purchaseState === "purchased" &&
    current.state === "included_unclaimed" &&
    !hasVisibleDrawing(drawing)
  )
    return set;
  const next: SignatureSlot = hasVisibleDrawing(drawing)
    ? {
        kind,
        state: "draft",
        drawing,
        normalizedHash: drawingHash(drawing),
        finalizedAt: null,
      }
    : emptySlot(kind);
  return { ...set, [kind]: next, updatedAt: now };
}

export function finalizePurchasedSet(
  set: SignatureSet,
  transactionId: string,
  now: string,
): SignatureSet {
  if (
    !hasVisibleDrawing(set.signature.drawing) &&
    !hasVisibleDrawing(set.initials.drawing)
  )
    throw new Error("At least one drawing is required");
  const finalize = (slot: SignatureSlot): SignatureSlot =>
    hasVisibleDrawing(slot.drawing)
      ? { ...slot, state: "finalized", finalizedAt: now }
      : { ...slot, state: "included_unclaimed" };
  return {
    ...set,
    signature: finalize(set.signature),
    initials: finalize(set.initials),
    purchaseState: "purchased",
    transactionId,
    updatedAt: now,
  };
}

export function fillIncludedSlot(
  set: SignatureSet,
  kind: SlotKind,
  drawing: DrawingSnapshot,
  now: string,
): SignatureSet {
  if (
    set.purchaseState !== "purchased" ||
    set[kind].state !== "included_unclaimed"
  )
    throw new Error("Slot is not an included unclaimed slot");
  if (!hasVisibleDrawing(drawing))
    throw new Error("A visible drawing is required");
  return {
    ...set,
    [kind]: {
      kind,
      state: "finalized",
      drawing,
      normalizedHash: drawingHash(drawing),
      finalizedAt: now,
    },
    updatedAt: now,
  };
}

export function duplicateAsDraft(
  set: SignatureSet,
  id: string,
  label: string,
  now: string,
): SignatureSet {
  const copy = (slot: SignatureSlot): SignatureSlot =>
    slot.drawing
      ? {
          kind: slot.kind,
          state: "draft",
          drawing: slot.drawing,
          normalizedHash: slot.normalizedHash,
          finalizedAt: null,
        }
      : emptySlot(slot.kind);
  return {
    id,
    label,
    signature: copy(set.signature),
    initials: copy(set.initials),
    purchaseState: "unpurchased",
    transactionId: null,
    createdAt: now,
    updatedAt: now,
  };
}

import type { DrawingAsset, SignatureSet } from "./models";

const signature: DrawingAsset = {
  kind: "signature",
  canvasWidth: 900,
  canvasHeight: 420,
  orientation: "landscape",
  renderingVersion: 1,
  finalizedHash: "fixture-signature-hash",
  strokes: [
    {
      id: "fixture-1",
      points: [
        { x: 60, y: 270, t: 0, pressure: null },
        { x: 115, y: 90, t: 50, pressure: null },
        { x: 180, y: 330, t: 100, pressure: null },
        { x: 260, y: 180, t: 150, pressure: null },
        { x: 340, y: 260, t: 200, pressure: null },
        { x: 440, y: 130, t: 250, pressure: null },
        { x: 515, y: 280, t: 300, pressure: null },
        { x: 620, y: 150, t: 350, pressure: null },
        { x: 720, y: 250, t: 400, pressure: null },
        { x: 840, y: 210, t: 450, pressure: null },
      ],
    },
    {
      id: "fixture-2",
      points: [
        { x: 100, y: 320, t: 500, pressure: null },
        { x: 790, y: 320, t: 750, pressure: null },
      ],
    },
  ],
};

const initials: DrawingAsset = {
  kind: "initials",
  canvasWidth: 900,
  canvasHeight: 420,
  orientation: "landscape",
  renderingVersion: 1,
  finalizedHash: "fixture-initials-hash",
  strokes: [
    {
      id: "fixture-i1",
      points: [
        { x: 250, y: 310, t: 0, pressure: null },
        { x: 330, y: 90, t: 100, pressure: null },
        { x: 390, y: 315, t: 200, pressure: null },
      ],
    },
    {
      id: "fixture-i2",
      points: [
        { x: 470, y: 100, t: 250, pressure: null },
        { x: 470, y: 310, t: 350, pressure: null },
        { x: 610, y: 190, t: 450, pressure: null },
        { x: 470, y: 100, t: 550, pressure: null },
      ],
    },
  ],
};

export const screenshotFixtureSet: SignatureSet = {
  id: "screenshot-fixture",
  label: "My Signature",
  status: "purchased",
  signature,
  initials,
  purchasedAt: "2026-08-25T12:00:00.000Z",
  transactionId: "fixture-transaction",
  pendingPurchaseId: null,
  purchaseIntentState: null,
  transactionFinishPending: false,
  unclaimedSlot: null,
  lastUsedAt: "2026-08-25T12:00:00.000Z",
  exportCount: 0,
};

export const screenshotFixtureSetFor = (fixture?: string): SignatureSet => {
  if (fixture === "purchased") return screenshotFixtureSet;
  const signatureOnly = fixture === "signature";
  return {
    ...screenshotFixtureSet,
    status: "draft",
    signature: { ...signature, finalizedHash: null },
    initials: signatureOnly ? null : { ...initials, finalizedHash: null },
    purchasedAt: null,
    transactionId: null,
  };
};

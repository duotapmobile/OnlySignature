export const brand = {
  productName: "Only Signature",
  principle: "We do not sign your documents. We give you your signature.",
  privacyClaim: "Created on your device. We do not upload it.",
  noSubscription: "No login. No subscription.",
} as const;

export const landingCopy = {
  heading: "Signature and Initials",
  supporting: "Export in the format you need.",
  primaryStatement: "EXPORT WITH A TRANSPARENT BACKGROUND",
  benefits: [
    "No white box",
    "No editing or cropping",
    brand.privacyClaim,
    brand.noSubscription,
  ],
  action: "Get Started",
} as const;

export const purchaseCopy = {
  title: "Transparent Export",
  noEditing: "No editing or cropping",
  noSubscription: "No subscription.",
  reexport: "Re-export this set anytime while it remains saved in the app.",
  durability:
    "Saved only on this device. Deleting the app may delete this set. Exported files are not affected.",
  freeAction: "Save with White Background, Free",
} as const;

export const errorCopy = {
  noDrawing: "Draw a signature or initials before continuing.",
  exportFailed:
    "Couldn’t create the file. Your drawing is still saved. Try again.",
  filesSaveFailed:
    "Couldn’t save to Files. Your drawing is still saved. Try Share instead.",
  destinationUnavailable:
    "That share destination was not available. Choose Files or another Share option.",
  sharingCancelled: "Sharing closed. Your drawing is still saved.",
  productUnavailable:
    "Transparent purchase is unavailable right now. You can still save with a white background for free.",
  purchaseCancelled: "Purchase cancelled. This attempt did not complete.",
  purchasePending:
    "Purchase pending. Apple is still processing it. This set will unlock automatically when approved.",
  purchaseFailed:
    "The purchase did not complete. Your drawing is safe. Try again later or use the free export.",
  verificationFailed:
    "We could not verify this purchase yet. Do not purchase this set again. We will check again automatically.",
  recoveredPurchase:
    "Purchase recovered. Transparent export is ready for this set.",
  insufficientStorage:
    "There is not enough storage to finish this action. Free some space and try again. Your drawing is safe.",
  corruptedSet:
    "This saved set could not be opened. Other saved sets were not changed.",
  unsupportedFormat:
    "That format is not available for this export. Choose PNG or JPEG.",
  cleanupFailed:
    "A temporary file could not be removed yet. Only Signature will try again next time it opens.",
  offlinePurchase:
    "Connect to the internet to purchase transparent export. Free white-background export still works offline.",
} as const;

export type AssetPresence = "signature" | "initials" | "both";

export function flowCopy(presence: AssetPresence) {
  if (presence === "initials") {
    return {
      confirm: "Confirm Initials",
      purchaseLine: "Place your initials on any document.",
      scope: "One purchase for these initials + included signature slot.",
      success: "Your initials are saved.",
    } as const;
  }
  if (presence === "both") {
    return {
      confirm: "Confirm Signature and Initials",
      purchaseLine: "Place your signature and initials on any document.",
      scope: "One purchase for this signature + initials set.",
      success: "Your signature and initials are saved.",
    } as const;
  }
  return {
    confirm: "Confirm Signature",
    purchaseLine: "Place your signature on any document.",
    scope: "One purchase for this signature + included initials slot.",
    success: "Your signature is saved.",
  } as const;
}

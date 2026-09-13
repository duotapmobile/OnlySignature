# User Flow

## First use

```text
Landing
  → Draw (Signature / Initials; either or both)
  → Preview on Document
  → Missing-slot choice when applicable
  → Transparent Export offer
       ↘ Save White Background, Free → format/destination → Saved home
       ↘ StoreKit purchase → pending/recovery or verified fulfillment
                                → purchase confirmation → format/destination → Saved home
  → Saved home
```

### Landing

Shows `Signature and Initials`, supporting format line, standalone `EXPORT WITH A TRANSPARENT BACKGROUND`, four benefit cards, `Get Started`, and unobtrusive Privacy/Terms. No draw controls, Saved manager, onboarding wall, or paywall.

### Draw

Signature and Initials preserve independent strokes. Heading matches selected slot. Canvas is large, neutral, vector-backed, and named for assistive technology. `Clear` confirms only when selected slot is nonempty; safe action is `Keep Drawing`. Continue accepts either asset. Rotation is optional and preserves normalized strokes, selected tab, focus, and both slots.

### Preview

Actual drawing appears on two geometrically identical fictional agreement fixtures. White Background visibly obstructs part of Signature, line, and Date area; Transparent leaves them visible. At large text/compact width the same variants stack. Confirm text is asset-aware; Back preserves work.

### Missing slot

Signature-only: `Initials are included. Add them now or later.` Initials-only mirrors this. Add and Continue are real accessible choices; Continue does not forfeit the slot.

### Purchase/free choice

The purchase view shows actual drawing on a second fictional form, `No editing or cropping`, localized StoreKit price, one-set scope, no subscription, same-set re-export, included slot, and `Saved only on this device. Deleting the app may delete this set. Exported files are not affected.` The free white-background action is always visible and remains functional if StoreKit is unavailable.

Purchase states block duplicate activation and distinguish cancelled, pending/deferred, checking/recovery, recovered, unavailable, verification failure, and ordinary failure without unsupported charge claims.

### Format and destination

Each existing asset has its own verified format selector. Purchased default: PNG Transparent. Free default: PNG White Background. A user may save directly to Photos or open Apple’s Share sheet for Save to Files, AirDrop, and other available apps. After saving every selected asset, Back restores the destination choices so the files can be saved another way; Done records the export and returns to Saved.

### Purchase confirmation

After verified transparent fulfillment, the confirmation contains no price or new offer. Save or Share Files opens format and destination selection; Done returns to Saved with the relevant set focused. White-background export completes directly from the destination sheet.

## Returning users

Saved cards use `Signature Set N` default labels plus assets/status/included-slot text. Export never repurchases a purchased set. `Fill Included Slot` finalizes the empty companion without StoreKit. `Duplicate as New Draft` explains that the original stays saved and a changed transparent set needs a new purchase. Rename never changes hashes/state.

## Destructive and recovery paths

- Delete one set names the set and says exported files are unaffected.
- Delete All explains complete app-local scope and exported-file exclusion.
- Delete All is blocked/deferred throughout active, pending/deferred, unfinished, protected-unavailable, or recovery-required purchase state.
- Unresolved verified purchase blocks repurchase. If protected data is locked, reconciliation waits unfinished for unlock. If frozen art is unrecoverable, the user may redraw and bind to the outstanding verified transaction without another charge.
- Post-purchase Back remains within purchased state.

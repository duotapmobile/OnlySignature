# StoreKit Product Model

## Product

One centrally configured repeat-purchasable **consumable**, working ID `com.onlysignature.transparent-set-v1` until the final bundle/product identifiers are founder-approved.

One purchase includes transparent-export rights for one frozen local Signature Set:

- one signature slot;
- one initials slot;
- both finalize together if present;
- an absent companion slot remains included/unclaimed and may be filled once later free;
- same-set re-export, format changes, filenames, rename, sharing, and copying never charge again.

## Why consumable

The unit is one newly finalized set and can be purchased repeatedly for distinct sets. A subscription is not justified. A global non-consumable would falsely unlock every future changed signature. Per-export charging would be unfair.

## Immutability and new drafts

Purchased finalized strokes cannot be edited. `Duplicate as New Draft` preserves the original and creates an unpaid draft. Only a later request for transparent export of that materially new set presents another purchase.

## Fulfillment sequence

1. Validate at least one slot.
2. Canonicalize and freeze strokes/bounds/render version/hashes.
3. Create random set and intent UUIDs; persist redundant protected prepared generations.
4. Block duplicate taps and present StoreKit.
5. Accept only verified transaction for expected product/environment.
6. Bind unique transaction to exact frozen set and unclaimed state atomically.
7. Read back/checksum.
8. Finish only after durable fulfillment.

Launch observes updates/unfinished transactions early and reconciles idempotently. `appAccountToken` is optional: a valid random opaque UUID only when bridge-proven, with no correctness dependency or artwork-derived content.

## Recovery and deletion

Pending/deferred/checking/recovered states are visible and announced. Unmatched verified delivery blocks repurchase. If recovery generations cannot restore the frozen art, the user may redraw and bind the outstanding verified transaction without another charge before finish. Protected-data-unavailable delivery remains unfinished until unlock. Delete All is deferred during unresolved purchase/recovery.

After deliberate app deletion, completed consumable history cannot recreate strokes. Exported files remain where saved. No misleading Restore Purchase control appears.

## Refunds and review

Apple processes refunds. With no backend, near-real-time refund telemetry is excluded. A locally surfaced revocation never deletes art/exports or creates a second-charge loop. App Review receives a sub-three-minute path, free route, exact scope, deletion explanation, unclaimed-slot steps, and IAP screenshot. Sandbox evidence remains Apple-gated.

## Current implementation observation

At the 2026-08-25 documentation snapshot, the TypeScript StoreKit adapter required an `appAccountToken` string and its transaction type did not expose a verified/unverified result. The expected `OnlySignatureStoreKit` native module had not yet been observed in the repository. This is not release-compliant: token input/return must be optional, verification must be explicit and unverified results rejected, the owned/native boundary must exist and compile, and production must fail closed rather than fall back to mock or silently no-op finish/observation.

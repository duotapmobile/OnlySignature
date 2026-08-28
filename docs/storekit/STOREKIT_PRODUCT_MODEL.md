# StoreKit Product Model

## Product

One centrally configured repeat-purchasable **consumable** with the Apple-valid identifier `com.duotap.onlysignature.transparent_set_v1`, derived from the confirmed bundle identifier `com.duotap.onlysignature`. The originally planned hyphenated form was rejected by App Store Connect before creation because current product IDs allow underscores and periods, not hyphens.

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

At the 2026-08-25 corrected source snapshot, the owned StoreKit 2 module returns verified/unverified outcomes, localized price, transaction/product identity, normalized optional account token, pending/cancelled/terminal-request-failure/interrupted-request states, unfinished snapshots, updates, and explicit finish results. All transaction callbacks, completed-snapshot decisions, result transitions, and destructive deletion checks use one serial queue; the system purchase sheet itself is outside that queue. The app durably binds and reads back the frozen set before finish. A later completed unfinished snapshot clears a finish marker when StoreKit no longer lists the transaction; `Transaction.all` and finished-consumable history are not used.

An explicit cancellation and a native `Product.PurchaseError` unlock the draft. A bridge/system interruption remains visibly frozen, blocks another paid attempt and destructive deletion, and is rechecked on activation. Other drafts and free white-background export remain available. Tokenless fallback requires the expected product and exactly one live unresolved frozen intent. EAS/macOS compilation and StoreKit Test/sandbox fault evidence remain release gates.

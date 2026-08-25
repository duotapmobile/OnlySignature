# ADR-002 — Purchase Model

**Status:** Accepted  
**Date:** 2026-08-25

## Decision

Use one repeat-purchasable StoreKit consumable. One consumption finalizes transparent-export rights for one immutable local Signature Set containing one signature slot and one initials slot. A missing companion slot remains included/unclaimed and may be filled later without StoreKit.

## Rejected models

- Subscription: disproportionate and contradicts no-subscription promise.
- Global non-consumable: contradicts new-set purchase behavior.
- Per-export charge: unfair; same purchased set re-exports freely.
- Backend entitlement/account: outside scope and weakens local privacy.

## Invariants

- No global `isPremium` or misleading Restore control.
- Price comes from StoreKit `displayPrice` in production.
- Purchase freezes canonical assets and persists a prepared intent before the system sheet.
- Only verified transactions fulfill.
- Unique transaction binding, atomic commit, checksum/read-back, then finish.
- `appAccountToken` is optional, valid random UUID only when bridge-proven, and never required for correctness.
- Unresolved delivery disables repurchase and offers humane recovery, including redraw-and-bind without another charge when a verified transaction exists but artwork cannot be recovered safely.
- Delete All is deferred during active/pending/recovery states.
- Finished consumables cannot recreate deleted local artwork; disclose this before purchase.

## Consequences

No backend refund telemetry or cross-device restoration exists. Apple handles money/refunds. Local revocation never deletes artwork or creates another-charge loops. StoreKit Test/sandbox and fault injection are mandatory release gates.

# StoreKit App Store Connect Setup

No portal action is authorized or claimed by this document.

## Founder/portal prerequisites

- Final bundle ID, team, app record, SKU, roles, and product identifier.
- Paid Applications Agreement accepted; tax and banking active.
- Planned U.S. $1.99 per-set price approved; StoreKit will localize actual display price.
- Territory selection and DSA/export/legal facts complete.

## Consumable record

1. Create one consumable matching the configured product ID.
2. Add required localization with a 2–30-character scoped display name and description within the current limit.
3. Configure price schedule/availability and verify storefront display.
4. Upload a current review screenshot showing the actual pay screen, localized price, exact set scope, included slot when applicable, visible free action, and local-deletion disclosure.
5. Add review notes covering signature-only, initials-only, both, free route, included later slot, re-export, deletion, and recovery.
6. Select the first consumable on version 1.0; Apple requires first IAP submission with a new app version.

## Test order

Committed StoreKit configuration → native StoreKit Test/XCTest → signed development build → sandbox physical-device matrix → TestFlight → exact submitted production build. Include success, cancel, pending/deferred, unavailable, offline, duplicate, interruption, termination before/after commit, unverified, unfinished, refund/revocation, token present/absent, Delete All, protected storage locked, and redraw-bind recovery.

## Release evidence

Record role, date, app/product IDs without secrets, localization, price/availability, product status, screenshot hash, review-note version, build ID, environment, device/OS, and actual results. Do not state `Ready for Review`, sandbox success, or submission until observed.

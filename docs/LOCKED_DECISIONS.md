# Locked Decisions

**Authority:** `docs/audits/06-final-authority.md`  
**Locked:** 2026-08-25

1. Only Signature creates signature/initials assets; it never accepts or signs documents.
2. Expo SDK 57, React Native 0.86, React 19.2.3, Node 22.22.0, npm workspaces, strict TypeScript, prebuild, and EAS preparation are the mobile baseline.
3. Canonical versioned stroke points are durable; paths, thumbnails, previews, and raster files are derived.
4. Signature and initials are independent slots. One purchase includes both, including one later-fillable empty slot.
5. Transparent export is a repeat-purchasable StoreKit consumable scoped to one frozen local set; no subscription, global premium, or app-wide lifetime unlock exists.
6. StoreKit localized `displayPrice` is the only production price string. `$1.99` is limited to development and U.S. store fixtures.
7. Fulfillment freezes and persists first, verifies StoreKit, atomically binds by unique transaction, reads back, then finishes. Unresolved verified delivery blocks repurchase.
8. `appAccountToken` is optional. Use only a valid random opaque UUID proven by the selected bridge; correctness never depends on it.
9. Delete All is blocked/deferred during active, pending, deferred, unfinished, protected-unavailable, or recovery-required purchase states.
10. Protected-data-unavailable StoreKit delivery remains queued/unfinished until storage is available; unlock/relaunch recovery is idempotent.
11. Purchased slots are immutable. Changes use `Duplicate as New Draft`; the original remains.
12. The free export is high quality, repeatable, visible, and supports white PNG/JPEG.
13. Transparent PNG, white PNG, and white JPEG are baseline. Optional formats/destinations remain hidden until proven.
14. Reusable data uses app-only protected, backup-excluded storage with atomic generations/checksums. Temporary exports are protected, randomized, journaled, and cleaned.
15. Image Copy, if shipped, uses a local-only expiring pasteboard implementation.
16. Production uses an embedded bundle with Expo Updates disabled and no analytics, ads, crash upload, remote logs, remote assets/config, account, backend, or cloud signature storage.
17. The preferred privacy claim is conditional on final observation: “Created on your device. We do not upload it.” User-selected destinations and Apple purchase processing are disclosed separately.
18. Side-by-side matched preview is default; identical-geometry vertical stacking is required for large text/compact widths.
19. No Undo. Confirmed per-slot Clear remains, with motor-access mitigations and no claim of universal tremor accommodation.
20. Accessibility labels and “accessible” marketing remain withheld until physical-device common-task evidence.
21. Apple’s Standard EULA applies; separate product Terms are not uploaded as a custom EULA absent counsel approval.
22. `Only Signature` is a centralized working name pending founder/professional clearance and App Store reservation.
23. U.S.-only is a planning default. Production territory selection fails closed; EU requires DSA completion.
24. App Preview sources/automation are prepared, but final capture/upload is not launch-critical.
25. Written controls authorize implementation, never native/release claims. Every external or Apple result is recorded only after it occurs.

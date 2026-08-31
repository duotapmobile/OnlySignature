# Current Four-Person Council

Date: 2026-08-28

Endpoint reviewed: a complete launch record and one internal TestFlight build. App Review submission and public release remain outside authority.

Participants:

- Product, UX, Accessibility, and Purchase Fairness
- Engineering, StoreKit, Persistence, Security, and Privacy
- App Store Connect, EAS, Screenshots, and Release Evidence
- Final Authority

Reviewed state: the actual working tree on `codex/only-signature-testflight-readiness-2026-08-28`, after the independent defect and improvement reviews. The council did not rely on the August 25 audit as current evidence.

## Consensus

No P0 defect was found. The following local P1 corrections are mandatory:

1. Screenshot fixture query parameters must affect navigation or purchase presentation only when the embedded screenshot-fixture capability is enabled and the fixture name is recognized.
2. A two-asset export must track confirmation per asset and must not claim that both files were saved after only one share flow.
3. The authorized-use alert must be a first-entry acknowledgment, not a repeated interruption before Create New or Duplicate as New Draft.
4. A verified consumable transaction that cannot match retained local state must have a finite, no-second-charge recovery path. It may be attached only to an explicitly frozen replacement set, persisted before finishing, and never silently consumed.
5. Successful snapshot reconciliation must return a recovered-purchase result and must not be overwritten by interruption or failure copy.
6. The production network scan must inspect checked-in native modules and skip only generated native output.
7. Archive inspection must reconcile every bundled privacy manifest, its collected-data declarations, tracking declarations, and required-reason values.
8. Both EAS workflow files must pass the pinned workflow schema validator. The current null `workflow_dispatch` value is invalid and must be an object.

## Closed during council

- Expo CLI identity is `duotap` / `admin@duotap.app`.
- The local dynamic Expo configuration is bound only to existing project `@duotap/onlysignature`, ID `954b1a21-89e9-41af-8021-d7c8e66d74c8`.
- Production configuration now refuses any different EAS project ID.
- The exact live consumable remains `com.duotap.onlysignature.transparent_set_v1`; app and IAP availability are exactly U.S.-only.
- The mobile recovery suite passed 46 tests after the pre-council corrections.

## External evidence gates

- Set the Expo GitHub base directory to `/apps/mobile` before workflow dispatch.
- Run and retrieve the native screenshot workflow; verify all 16 native images and the native-derived IAP review crop locally.
- Complete the IAP review image and re-read its live metadata state.
- Compile and inspect the signed archive on EAS/macOS.
- Prove the processed build is visible in and assigned only to `Only Signature Internal`.
- Retain physical-device accessibility, StoreKit sandbox, export-destination, file-protection, and runtime-network evidence without claiming it passed prematurely.

## Fourth-authority decision

The repository remains HOLD for internal TestFlight until the local P1 corrections pass fresh tests and the tenth man has challenged this consensus. External gates are not waived, and no public-release authority is granted.

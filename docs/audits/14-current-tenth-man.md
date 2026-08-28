# Current Tenth-Man Review

Date: 2026-08-28

The tenth man reviewed the completed four-person council, assumed its consensus was wrong, and inspected the actual TestFlight-readiness working tree.

## Verdict

No P0 was found. HOLD remained correct. The council P1s were confirmed, and five additional P1 corrections were required.

1. The shipped iOS exporter uses React Native view-shot, while the existing pixel tests exercise a separate pure rasterizer. A fixture-gated EAS simulator harness must generate the actual runtime PNG and JPEG files, decode them, and verify alpha, opacity, visible strokes, padding, and hashes.
2. Screenshot and archive provenance must compare the binary's embedded source revision with the exact workflow checkout SHA. Recording the checkout SHA without comparing the binary is insufficient.
3. The native-derived IAP review crop must retain the purchase offer and localized price. Route assertions and source hashes do not alone prove the crop communicates the purchase.
4. The privacy policy must name GitHub Pages and distinguish GitHub-controlled infrastructure logging from DuoTap's no-analytics behavior.
5. TestFlight completion requires API readback of the exact processed build, its assignment to `Only Signature Internal`, the 1.0.0 train, and en-US What to Test.

## Corrections adopted

- Added a screenshot-only `/native-export-test` route that uses the real `generateExport` and `ExportSurface` implementation.
- Extended the native EAS capture to retrieve and decode actual transparent PNG, white PNG, and JPEG exports and retain a provenance report.
- Required simulator and signed-archive source stamps to equal `git rev-parse HEAD`.
- Required non-null EAS build/workflow IDs, exact App Store application identifiers, profile expiry, and all bundled privacy-manifest declarations.
- Updated the canonical privacy policy for GitHub Pages and regenerated shared in-app/site legal content.
- Added `verify:asc:testflight` for exact processed-build, group, train, and What to Test readback without printing credentials.
- Retained a mandatory visual review of the native IAP crop before its App Store Connect upload.

## External verification retained

Actual native export pixels, native screenshots, the IAP crop, Swift compilation, signed provisioning, StoreKit sandbox behavior, device export destinations, physical-device accessibility, runtime network observation, and processed TestFlight visibility remain evidence gates until they actually run. No App Review or public-release authority is granted.

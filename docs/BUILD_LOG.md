# Build Log

## 2026-08-25 - Phase 0 preflight

- Working directory: `C:\Users\mskir\Desktop\Only Signature Build August`
- Initial directory state: empty.
- Unrelated project markers: none found.
- Isolation decision: safe to proceed.
- Host: Windows / PowerShell.
- Node: `v22.22.0`.
- npm: `10.9.4`.
- Git: `2.50.0.windows.2`.
- Expo CLI: not preinstalled; the first `npx expo --version` attempted package resolution, so the project will pin Expo through the workspace lockfile.

This file records only commands and outcomes actually observed. Signed iOS builds, StoreKit sandbox purchases, device accessibility checks, portal actions, and deployment remain distinct external activities.

## 2026-08-25 - Local implementation and verification

- Built the Expo SDK 57 mobile application, owned StoreKit 2 and protected-storage modules, shared packages, Astro site, legal/research packages, brand/icon assets, ASO metadata, and capture automation.
- `npm run typecheck`: passed for all six workspaces; Astro reported 0 errors, warnings, or hints.
- `npm run lint`: passed for every lint-enabled workspace.
- `npm test`: 24/24 tests passed. `npm run test --workspace @only-signature/mobile`: 11/11 passed.
- `npx expo install --check`: compatible. `npx expo-doctor`: 21/21 checks passed.
- `npx expo export --platform ios --output-dir dist-ios`: completed with 25 local export files. This is not a signed native build.
- `npx expo prebuild --platform ios --clean --no-install`: Expo refused iOS generation on Windows and required macOS/Linux. EAS Continuous Native Generation is the prepared boundary.
- Site build: 9 pages. Site validation: 11 required outputs, resolved internal links, zero client JavaScript, and no tracking/font/cookie patterns.
- Static privacy/network/content checks passed; secret-pattern scan found no matches.
- `npm ls --all --json`: valid tree. `npm audit`: 0 critical/high, 12 moderate findings through Expo build tooling's `xcode` -> `uuid <11.1.1`; npm offers only an incompatible Expo 46 downgrade, so no force fix was applied.
- CycloneDX 1.5 SBOM generated at `artifacts/sbom.cdx.json` with 1,151 package-version components.
- Production release validation failed closed on missing founder/legal/public/Apple values as intended.
- `git remote -v`: empty; no remote, upload, push, deployment, or portal mutation occurred.

## 2026-08-25 - Final repository remediation

- Added the owned `OnlySignatureNative` podspec and Apple module configuration. Expo iOS autolinking now resolves the pod, both Swift modules, and the privacy resource bundle. Compilation remains an EAS/macOS gate.
- Reworked the mobile purchase boundary to serialize state writes, retain ambiguous transactions for recovery, validate product and transaction identity, persist/read back a checksummed binding, keep a durable finish-pending deletion lock, finish through StoreKit, and then persist/read back the finished state.
- Removed unproved runtime Copy, direct Photos, and SVG options. The shipped destination is Share / Save to Files; transparent PNG, white PNG, and white JPEG remain.
- Made export dimensions follow the tightly padded drawing aspect ratio and made the white/transparent preview side-by-side at phone and tablet widths.
- Added explicit production ATS denial of arbitrary and local loads and unified release environment names across the root gate, Expo config, and EAS profiles.
- Generated eight deterministic web-rendered fixture masters for iPhone and eight for iPad, each flattened to the current configured size with no alpha. These are local layout/composition proofs, not substitutes for final iOS Simulator captures.
- `npm run check`: passed the consolidated Windows gate, including formatting, type checking, lint, 24 root tests and 17 mobile tests, content drift, configuration, static network policy, native autolinking, and the high/critical advisory threshold.
- `npx expo config --type introspect --json` with complete non-secret production fixtures: `NSAllowsArbitraryLoads=false`, `NSAllowsLocalNetworking=false`, real StoreKit mode, OTA disabled, and the expected bundle identifier.
- Regenerated CycloneDX 1.5 SBOM with 1,145 package-version components.
- Closed the final local audit defects: verified-history recovery for a StoreKit transaction finished before its local completion marker, protected prior-generation state recovery, fail-closed mismatched-token handling, serialized Delete All, removal of residual Copy/SVG/Photos promises, partial white-box obstruction, distinct route-aware screenshot fixtures, corrected iPad framing, and an opaque 1024×1024 IAP review screenshot.
- Added a store-asset verification gate covering 16 exact-size opaque masters, distinct purchase fixtures, and the IAP review asset. The masters are implemented-UI web fixture captures; final native iOS captures remain explicitly gated.

## 2026-08-25 - Sequential code audit, council, and tenth-man remediation

- A first independent agent found three runtime P1 defects: finished-consumable crash recovery relied on history that omits finished consumables by default, thrown purchase calls could remain locked, and rotation changed stroke normalization. A second agent independently confirmed them and proposed a completed-unfinished-snapshot state machine and stable drawing plane.
- Implemented an owned StoreKit outcome split for verified, unverified, pending, cancelled, terminal `Product.PurchaseError`, and ambiguous bridge/system interruption. UUID account tokens are lowercase at the native boundary and compared case-insensitively in TypeScript.
- Replaced transaction-history proof with completed `Transaction.unfinished` snapshots. Observer callbacks, snapshot decisions, purchase-result transitions, individual deletion, and Delete All use one reusable serial queue; StoreKit purchase-sheet presentation remains outside it. Snapshot/finish calls are bounded, and timeout never proves absence.
- Removed the experimental hidden abandoned-intent design after the council and tenth man showed double-charge, deletion, privacy, and tokenless-correlation risks. Ambiguous artwork remains visibly frozen; paid retry and destructive deletion are blocked while free drafts and white-background export remain available.
- Added stable drawing-plane transforms, rejected touches in aspect-fit margins, gated included-slot drawing until transaction finishing resolves, made the comparison stack for narrow/large-text layouts with one semantic accessibility summary, and improved paid-set deletion copy.
- Added semantic state validation with backup fallback, same-session temporary export cleanup including partial failures, and a production EAS lifecycle hook in the mobile app root.
- Focused validation after remediation: mobile TypeScript passed, lint passed, 26/26 mobile tests passed, development app-root EAS hook ran, and a production-mode negative test rejected all missing release values as expected.

## 2026-08-25 - Final corrected-source authority

- The engineering auditor re-reviewed the corrected pre-sheet transaction boundary and returned APPROVE with no remaining local P0/P1 defect.
- `npm run check`: exited 0 after all corrections. The gate passed Prettier, strict TypeScript, lint, 24 root tests, 26 mobile tests, content drift across 122 files, release configuration, static production-network policy, native autolinking, store-asset verification, and the high/critical dependency threshold.
- `npx expo-doctor@latest apps/mobile`: 21/21 checks passed.
- The app-root production lifecycle check was run with `EXPO_PUBLIC_RELEASE_MODE=production` and correctly exited 1 because founder/legal/public/Apple release values and real StoreKit mode are absent.
- `git diff --check`: passed. `git remote -v`: empty.
- Final authority is local-source approval with explicit EAS/macOS compilation, StoreKit sandbox, physical-device, runtime-network, final native screenshot, founder-input, signing, and submission gates.

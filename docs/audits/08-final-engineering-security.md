# Final Actual-Repository Engineering, StoreKit, Security, and Privacy Audit

**Product:** Only Signature  
**Audit date:** 2026-08-25  
**Checkout:** `C:\Users\mskir\Desktop\Only Signature Build August`  
**Branch / commit inspected:** `main` at `53ad3b2` (`docs: establish research and build authority`), with 51 modified or untracked paths in the shared working tree  
**Authority:** `docs/audits/06-final-authority.md` and its FA-01 through FA-03 corrections  
**Audit posture:** actual current source, lockfile, configs, tests, generated artifacts, and observed command results; no implementation changes

## Verdict

**ENGINEERING / STOREKIT / SECURITY / PRIVACY RELEASE NO-GO.**

The repository is not a complete working production iOS app at this snapshot. One P0, ten P1 findings, and four P2 findings remain. The P0 is concrete: Expo finds the owned native-module package during search, but the iOS resolver omits it because the package has no podspec. Therefore the Swift protected-storage and StoreKit modules are not currently part of the resolved iOS native dependency set. Production storage then fails closed and the real StoreKit adapter has no native implementation.

Even after that link defect is fixed, the mobile runtime does not use the more rigorous purchase journal and checksummed repository implemented and tested in `packages/core`. It instead uses a simpler provider model that has a launch/hydration transaction race, no protected-data-unavailable queue, no durable `verified_unbound` or `bound_unfinished` state, deletion exposure during transaction finishing, ambiguous transaction fallback, no product-ID check, and unsynchronized persistence writes. These violate the final authority's finish-last, no-repurchase, Delete All, optional-token, and protected-data rules.

The transparent PNG pixel suite passes against the pure TypeScript rasterizer, but the shipped mobile exporter uses a different `react-native-view-shot` path that has zero automated coverage and a fixed 1200×600 surface. Copy uses the general iOS pasteboard without local-only or expiry controls. SVG is exposed despite lacking the required common-tool/device evidence. Production Expo introspection also retains `NSAllowsArbitraryLoads=true`, while the repository's static network command currently fails and a stale artifact says it passed.

No signed build, `.ipa`, `.xcarchive`, StoreKit sandbox transaction, physical-device storage/alpha test, Xcode privacy report, packet capture, TestFlight upload, or App Store submission exists. `apps/mobile/dist-ios` is an Expo JavaScript export, not a native build.

## Severity and closure model

| Severity | Meaning in this audit                                                                                                                                |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| P0       | The current production implementation cannot provide its core protected-storage / StoreKit path or has an immediate paid-fulfillment safety failure. |
| P1       | Release-blocking correctness, purchase-fairness, sensitive-data, privacy, export-truth, or production-control defect.                                |
| P2       | Material quality, evidence, dependency, or hardening debt that does not by itself create the P0 path.                                                |

`Local` means the repository must be corrected without founder input. `Apple/device` means the correction additionally requires macOS/EAS, a signed build, StoreKit, an archive, or a physical device to prove it. `Founder` means a real external value or authorization is required. An external verification gate never excuses a locally visible defect.

## Scope and positive evidence

The audit traced `apps/mobile/src/state/AppStateProvider.tsx`, the runtime domain models, storage/StoreKit/export adapters, export UI and off-screen surface, owned Swift sources, Expo plugin/config, EAS profiles, privacy manifests, package declarations and lockfile, pure core implementations, tests, network/release scripts, SBOM, and recorded test/build claims.

The following controls are present and useful, but do not offset the findings:

- Expo SDK 57 / React Native 0.86 / React 19 versions are mutually accepted by Expo Doctor: 21/21 checks passed.
- Type checking and linting passed across their configured workspaces.
- `npm test` passed 24/24 pure/config tests; the separate mobile Node suite passed 11/11.
- The nominal transaction path distinguishes verified and unverified StoreKit results and writes purchased state before calling `finish` (`apps/mobile/src/state/AppStateProvider.tsx:147-174`; `apps/mobile/modules/only-signature-native/ios/OnlySignatureStoreKitModule.swift:17-22,47-60`).
- Source intent sets complete file protection and backup exclusion for app-support and temporary directories (`apps/mobile/modules/only-signature-native/ios/OnlySignatureStorageModule.swift:6-28,38-58`) and adds an app-switcher cover (`apps/mobile/src/app/_layout.tsx:9-29`).
- Production config rejects its own placeholder URLs/identifiers, mock StoreKit, screenshot fixtures, and a non-derived product ID (`apps/mobile/app.config.ts:27-48`). OTA updates are disabled (`apps/mobile/app.config.ts:60-64`).
- No Git remote is configured. The targeted secret-pattern scan found no private-key, common live API-key, GitHub token, or Slack-token pattern.
- Authored mobile/runtime source contains no `fetch`, `XMLHttpRequest`, WebSocket, analytics, crash-upload, Firebase, RevenueCat, or proprietary-backend call. This is static source evidence, not packet observation.
- App-level privacy-manifest configuration declares tracking false and the current required-reason categories (`apps/mobile/app.config.ts:84-108`); the owned XML manifest is well-formed. Final archive merge and reason correctness are not proven.

## P0 findings

### P0-01 — The owned StoreKit and protected-storage Swift modules are not in the resolved iOS native dependency set

**Impact:** The only production protected-storage implementation and the only real StoreKit implementation are source files that the current iOS resolver does not include. With `APP_VARIANT=production`, `appStorage.read`, cleanup, and write require the native storage module and throw `protected-storage-unavailable` if it is absent (`apps/mobile/src/services/storage.ts:17-25,28-50,70-89`). The app's launch hydration does not catch that error (`apps/mobile/src/state/AppStateProvider.tsx:107-136`). Real StoreKit product load and purchase likewise fail when the native module is absent (`apps/mobile/src/services/storekit.ts:74-83`). This blocks the core production flow and makes all native StoreKit/storage claims hypothetical.

**Evidence:** The local package advertises two iOS module classes (`apps/mobile/modules/only-signature-native/expo-module.config.json:1-5`) and contains two Swift files, but its package root contains no `*.podspec` and its config supplies no `podspecPath` (`apps/mobile/modules/only-signature-native/package.json:1-10`). `npx expo-modules-autolinking search --platform ios` finds `only-signature-native`; `npx expo-modules-autolinking resolve --platform ios` reports zero matches for `OnlySignature` / `only-signature-native`. The same resolution lists normal Expo pods. Local observed counts were `swift_source_count=2`, `local_podspec_count=0`, and `custom_module_matches=0`. Expo's installed iOS resolver omits revisions without a podspec (`node_modules/expo-modules-autolinking/build/platforms/apple/apple.js:42-48`). The plugin only changes entitlements and Info.plist; it does not add or compile these sources (`apps/mobile/plugins/withOnlySignatureIos.js:1-15`).

**Closure:** `Local + Apple/device`. Create a valid owned Expo iOS module package/podspec that includes both Swift sources and `PrivacyInfo.xcprivacy`; make `expo-modules-autolinking resolve --platform ios` list its pod; add an automated autolink assertion. Then run a clean EAS/macOS prebuild and compile, inspect the generated Pods/project and archive, launch a production-mode build, and prove both native modules are non-null and callable. Windows Expo CLI explicitly refused iOS prebuild during this audit, so compilation is an Apple/macOS gate after the local package correction. No founder product decision is required; signing/build authorization is required only for the external proof.

## P1 findings

### P1-01 — The tested durable purchase journal is not the mobile runtime purchase implementation

**Impact:** The repository gives the appearance that `prepared`, `verified_unbound`, `bound_unfinished`, `finished`, `recovery_required`, protected-data availability, checksums, and Delete All interlocks are implemented because those exist under `packages/core` and their tests pass. The mobile app never calls those APIs. Its runtime state can represent only `draft` / `purchased` plus one nullable pending UUID (`apps/mobile/src/domain/models.ts:8,32-53`). It cannot durably represent verified-but-unbound, bound-but-unfinished, protected-data-unavailable, or recovery-required states mandated by FA-01 and FA-03.

**Evidence:** Runtime search finds `SignatureRepository`, `preparePurchase`, `acceptVerifiedTransaction`, and `purchaseIntents` only in the imported namespace exported by `apps/mobile/src/integrations/workspace.ts:17,29-43`; no mobile flow consumes them. The pure core contains the richer states and guards (`packages/core/src/purchase.ts:63-124`; `packages/core/src/repository.ts:34-66`), while the provider uses `pendingPurchaseId` and its own functions (`apps/mobile/src/state/AppStateProvider.tsx:23-31,147-198,340-416`). Root coverage reports 0% for `apps/mobile/src/services/storage.ts`, `storekit.ts`, `export.ts`, `purchaseState.ts`, and the mobile drawing/models. Passing core tests therefore do not verify the app's real fulfillment path.

**Closure:** `Local + Apple/device`. Adopt one canonical runtime journal/repository (or faithfully implement the same states in the provider), persist every transition, and add provider/service tests for every crash boundary. Then run StoreKit Test/XCTest and physical sandbox termination/relaunch cases. No founder decision is required.

### P1-02 — Launch and protected-data handling can miss an unfinished verified transaction

**Impact:** The StoreKit observer and one-time unfinished enumeration start independently of storage hydration. If a transaction arrives before the pending set is restored, `dataRef` still contains the initial draft, `findTransactionSet` returns null, and `processTransaction` returns without persisting, finishing, or queuing the transaction. Hydration does not trigger another unfinished enumeration. If complete-protection storage is unavailable while locked, cleanup/read rejection is unhandled and there is no protected-data availability event, queue, or retry. The transaction can remain unfinished while the UI later exposes an unresolved local draft, violating FA-03 and creating repurchase/confusion risk.

**Evidence:** Hydration is an unguarded async effect at `apps/mobile/src/state/AppStateProvider.tsx:107-136`; observation/enumeration is a separate effect at `apps/mobile/src/state/AppStateProvider.tsx:190-198`. Unmatched delivery exits at `apps/mobile/src/state/AppStateProvider.tsx:158-167`. The native storage module has no `isProtectedDataAvailable` function or availability event (`apps/mobile/modules/only-signature-native/ios/OnlySignatureStorageModule.swift:31-60`). The mobile test suite covers a just-persisted in-memory pending snapshot, not delivery before hydration, locked launch, unlock, or replay (`apps/mobile/test/purchase-state.test.ts:37-50`).

**Closure:** `Local + Apple/device`. Hydrate the protected journal before reconciling, retain incoming verified transactions in a non-finishing queue while data is unavailable, observe protected-data availability, re-read durable state on unlock, rerun unfinished enumeration, and converge duplicate events idempotently. StoreKit must remain unfinished until checksum/read-back succeeds. Prove locked-before-launch, locked-before-callback, unlock/retry, termination, duplicate, and low-disk paths on a signed physical-device build.

### P1-03 — Error, correlation, and product validation can orphan or misbind a paid transaction

**Impact:** Any exception thrown from `storeKit.purchase` clears the only pending UUID and finalized hashes, even though Apple may later deliver a verified unfinished transaction. With no pending record, that later delivery is ignored. When a transaction has no matching token, the app binds it to the sole pending set without checking its product ID. The code does not enforce transaction-ID uniqueness across sets. These behaviors can lock a charged set, expose another purchase, or bind the wrong verified product.

**Evidence:** The catch unconditionally calls `stateWithPendingPurchaseCleared` (`apps/mobile/src/state/AppStateProvider.tsx:407-415`; clearing logic at `apps/mobile/src/domain/purchaseState.ts:22-41`). Fallback selects the only pending set (`apps/mobile/src/domain/purchaseState.ts:43-55`). `purchasedStateForTransaction` checks only state and the bridge's `verified` boolean, not `transaction.productId` against the configured ID (`apps/mobile/src/domain/purchaseState.ts:58-90`). The native bridge accepts a token only if it parses as UUID and otherwise buys without it (`apps/mobile/modules/only-signature-native/ios/OnlySignatureStoreKitModule.swift:31-45`), but runtime tests cover neither absent/changed token nor wrong product/duplicate transaction. The pure-core wrong-product test does not exercise this runtime implementation (`tests/core/purchase.test.ts:64-79`).

**Closure:** `Local + Apple/device`. Keep ambiguous/transport errors in a durable recovery state; clear an intent only on a definitive cancellation/failure whose semantics are proven safe. Require configured product-ID equality, unique transaction binding, frozen-hash verification, and an explicit unmatched recovery path. Prove token-present, token-absent, token-changed, wrong-product, late callback after thrown request, and duplicate transaction cases. `appAccountToken` may remain only an optional valid random UUID hint, never the correctness mechanism.

### P1-04 — Finish-last and Delete All are not closed across the verified-to-finished window

**Impact:** Reconciliation persists a `purchased` set with `pendingPurchaseId=null` before awaiting StoreKit finish. During that await—or after finish throws—the Delete All guard sees no recovery in progress and may erase the art/mapping. The native `finish` method returns success even when no matching unfinished transaction was found, and the JS real adapter silently no-ops when the native module is missing. The runtime has no durable bound-but-unfinished state, so it cannot prove one fulfillment followed by one safe finish.

**Evidence:** The pending marker is cleared by `purchasedStateForTransaction` (`apps/mobile/src/domain/purchaseState.ts:73-78`), saved, and then finished (`apps/mobile/src/state/AppStateProvider.tsx:168-174`). Delete All blocks only while any `pendingPurchaseId` exists (`apps/mobile/src/domain/purchaseState.ts:15-16`; `apps/mobile/src/state/AppStateProvider.tsx:325-339`). Native finish iterates and returns no result whether it finds a transaction or not (`apps/mobile/modules/only-signature-native/ios/OnlySignatureStoreKitModule.swift:57-60`); the adapter also permits no-op unfinished/finish/observe paths (`apps/mobile/src/services/storekit.ts:85-98`). This contradicts FA-01 at `docs/audits/06-final-authority.md:43-58`.

**Closure:** `Local + Apple/device`. Persist a durable `bound_unfinished` state through successful native finish and a subsequent durable `finished` transition. Block/defer Delete All and individual deletion throughout purchase-sheet, pending, verified, binding, finishing, protected-unavailable, and recovery-required states. Make native finish return a confirmed outcome or a recoverable error; make all real-adapter methods fail closed when the module is absent. Add deterministic concurrent deletion and finish-failure tests, then StoreKit device proof.

### P1-05 — Purchase and state persistence are not serialized

**Impact:** The purchase button's component-local `busy` flag reduces ordinary repeated taps but the state action itself has no mutex. Two concurrent calls can both capture the same `activeSet` / `data`, pass `canBeginPurchase`, create different UUIDs, and present two Apple purchases. Separately, every state change launches a `void appStorage.write` with no write queue; older writes can finish after newer purchase or drawing writes and overwrite them. Atomic replacement protects each individual file operation, not ordering between operations.

**Evidence:** `purchaseActiveSet` closes over `activeSet` and `data`, checks before any action-level lock, and writes later (`apps/mobile/src/state/AppStateProvider.tsx:340-385`). The generic persistence effect starts unawaited writes (`apps/mobile/src/state/AppStateProvider.tsx:142-145`) while purchase/fill paths also write directly (`apps/mobile/src/state/AppStateProvider.tsx:381-383,396-404,407-415,418-430`). Native `String.write(... atomically: true)` provides single-write replacement but no cross-call sequencing (`apps/mobile/modules/only-signature-native/ios/OnlySignatureStorageModule.swift:38-44`). No provider concurrency test exists.

**Closure:** `Local + Apple/device`. Add an action-level single-flight purchase mutex, use current-state functional updates, and serialize all durable writes through one versioned queue. Reject stale generations and require post-write read-back for purchase transitions. Test repeated calls, observer/request callback overlap, drawing updates during writes, slow/failed writes, backgrounding, and termination; then confirm on StoreKit Test/device.

### P1-06 — Runtime local storage lacks the required integrity and recovery envelope

**Impact:** The production runtime stores raw JSON with no schema version, checksum, previous generation, validated read-back, or protected-data classification. A corrupt/truncated state throws from hydration without a user recovery path; a failed cleanup also aborts hydration. This can make all saved sets inaccessible and prevents fulfillment from proving durable association before transaction finish.

**Evidence:** `appStorage.read` parses raw JSON and throws `local-state-corrupted`; `write` serializes raw state (`apps/mobile/src/services/storage.ts:28-61`). Native storage reads/writes a single `state.json` (`apps/mobile/modules/only-signature-native/ios/OnlySignatureStorageModule.swift:18,33-47`). The checksum/generation behavior tested in `tests/core/repository.test.ts:12-100` belongs to the unused `SignatureRepository`, not the app runtime. Hydration has no catch or recovery UI (`apps/mobile/src/state/AppStateProvider.tsx:107-136`).

**Closure:** `Local + Apple/device`. Use the canonical versioned checksummed envelope with last-good generation, atomic staging, fsync/read-back appropriate to the native platform, explicit corrupt/protected-unavailable/low-disk categories, and non-destructive recovery UI. Verify protection and backup attributes on the actual file and generations, simulate corruption/low disk, and repeat on a signed device.

### P1-07 — Copy exposes a signature on the general pasteboard without locality or expiry

**Impact:** A signature image is placed on `UIPasteboard.general`, with neither a local-only option nor expiration. Other apps or synced devices may retain/access it according to platform behavior. This directly violates the locked owned local-only expiring pasteboard control and the dependency inventory's own release decision.

**Evidence:** The app reads the full image as base64 and calls `Clipboard.setImageAsync` (`apps/mobile/src/services/export.ts:80-89`); the paid/free UI exposes Copy for a single PNG/JPEG (`apps/mobile/src/components/ExportFlow.tsx:199-207`). The installed Expo implementation assigns `UIPasteboard.general.image` (`node_modules/expo-clipboard/ios/ClipboardModule.swift:53-59`) and exposes no locality/expiration parameters. `docs/privacy/SDK_DATA_INVENTORY.csv:10` says this generic API is not authorized for signature-image Copy, while `docs/audits/06-final-authority.md:121-123` locks an owned local-only expiring image pasteboard. Disclosure does not satisfy that control.

**Closure:** `Local + Apple/device`. Hide Copy now, or replace it with an owned iOS API using `UIPasteboard.setItems(_:options:)` with local-only and expiration options and prove image compatibility. Re-audit manifest/API use and verify on supported iOS versions. No founder input is needed.

### P1-08 — Shipped raster/alpha/crop and SVG behavior is not what the passing export tests verify

**Impact:** Passing pixel tests do not prove the app's actual transparent PNG, white PNG, or JPEG files. Tests rasterize with `packages/core/src/raster.ts`, while the app captures an off-screen React Native view with `react-native-view-shot`. The actual surface is always 1200×600 with `preserveAspectRatio="xMidYMid meet"`, so narrow/tall drawings can contain large transparent or white bands instead of a tightly cropped proportional canvas. Alpha, halos, JPEG background, destination re-import, memory, and Photos/Share behavior are unproved. SVG is exposed as a paid format after only markup-string tests, not common-tool/device interoperability.

**Evidence:** Runtime generation is `captureRef` at fixed 1200×600 (`apps/mobile/src/services/export.ts:21-46`) over a fixed 1200×600 surface (`apps/mobile/src/components/ExportSurface.tsx:17-21,39-49`). The pure pixel tests call `rasterizeDrawing` directly (`tests/export/pixels.test.ts:43-123`), and root coverage reports 0% for the runtime export service. Paid options include `svg-transparent` (`apps/mobile/src/components/ExportFlow.tsx:27-32`) while mobile SVG tests only inspect XML strings (`apps/mobile/test/drawing.test.ts:32-47`). No physical destination artifacts exist.

**Closure:** `Local + Apple/device`. Make the runtime use the verified raster engine or add tests that decode files produced by the exact native capture path. Size the output to padded visible bounds rather than a fixed aspect ratio. Hide SVG until Files/Quick Look/Preview/Pages/common-tool opening, bounds, scaling, metadata, and destination tests pass. Decode and inspect every actual PNG/JPEG; re-import from Share/Files and any advertised destination on all supported device classes.

### P1-09 — Production network enforcement is not a valid passing control

**Impact:** The production introspected Info.plist permits arbitrary network loads. The static network checker currently fails, does not inspect Swift/plist/xcprivacy/archive/binary content, and scans generated web output that produces false positives. Nevertheless the build log and test artifact say the static check passed. There is no runtime packet observation. The authored app currently has no explicit network client, but the repository cannot truthfully claim a passing production allowlist audit.

**Evidence:** With complete dummy production values, `npx expo config --type introspect --json` produced `NSAppTransportSecurity.NSAllowsArbitraryLoads=true` and a localhost exception. `app.config.ts` does not override that production value (`apps/mobile/app.config.ts:66-109`). `npm run verify:network` failed on `apps/mobile/dist-web` for `fetch`, `XMLHttpRequest`, and multiple URLs. The script scans only `.ts/.tsx/.js/.json`, skips `ios`/`android`, and does not exclude `dist-web` (`scripts/check-production-network.mjs:4-44`). Stale claims remain in `docs/BUILD_LOG.md:27` and `artifacts/TEST_RESULTS.md:19`. Final packet observation is correctly marked not run in `docs/privacy/NETWORK_BEHAVIOR.md:24-28`.

**Closure:** `Local + Apple/device`. Set production ATS intentionally (no arbitrary loads), make dev-only exceptions conditional, scan authored source separately from bundles, scan native/config/manifests and the exact production JS/native archive, maintain a derived domain allowlist, and make evidence artifacts generated from current command results. Then capture DNS/traffic on the signed release binary through every flow. Founder input is required only for final public domains/build authorization.

### P1-10 — Production release configuration and localized price are split across conflicting authorities

**Impact:** The root release checker can pass values the Expo app does not read, and the Expo app can build without several values the contract says must gate production. The app initially exposes a hardcoded `$1.99` before StoreKit product loading succeeds. This defeats the claim of one centralized fail-closed release configuration and can display an incorrect production price.

**Evidence:** Root `.env.example` and `scripts/check-release-config.mjs` use `EXPO_PUBLIC_RELEASE_MODE` and `EXPO_PUBLIC_APPLE_TEAM_ID` (`.env.example:2,7`; `scripts/check-release-config.mjs:3-18,27-30`). Expo uses `APP_VARIANT` and `APPLE_TEAM_ID` plus `EAS_PROJECT_ID` (`apps/mobile/app.config.ts:6-24`), while EAS production sets only `APP_VARIANT` and StoreKit mode (`apps/mobile/eas.json:22-31`). App config does not consume/gate marketing URL, legal operator/address, DSA status, or territories. A dummy environment containing both variable families made both checks pass, proving they are independent rather than one authority. Runtime product state starts at `$1.99` (`apps/mobile/src/state/AppStateProvider.tsx:88-91`), and the purchase button renders it immediately (`apps/mobile/src/app/purchase.tsx:69-79`). Product-load failure does not clear/disable that price path (`apps/mobile/src/state/AppStateProvider.tsx:127-135`). The purchase screen also omits the mandatory local-only/app-deletion disclosure before StoreKit (`apps/mobile/src/app/purchase.tsx:46-89`).

**Closure:** `Local + founder for values`. Define one typed config schema and one naming convention consumed by app config, EAS, scripts, website, and tests. Production must reject every required external value, mock/fixture mode, arbitrary ATS, and hardcoded price. Represent product loading/unavailable explicitly and render no purchase price/button until StoreKit supplies `displayPrice`; keep free export available. Add the concise deletion disclosure. Founder supplies final identities, URLs, Apple IDs, territories, DSA decision, and price approval, but no founder decision is needed to fix the plumbing.

## P2 findings

### P2-01 — Dependency audit is non-clean and documentation is stale

`npm audit --json` reports 12 moderate, 0 high, and 0 critical vulnerabilities. The material advisory is `uuid <11.1.1` through the build-time `xcode` / Expo config-plugin chain; npm proposes incompatible major downgrades, so `npm audit fix --force` is not appropriate. `npm ls --all --json` reports two extraneous installed packages (`@emnapi/runtime@1.11.3`, `@img/sharp-wasm32@0.35.3`) even though `docs/security/DEPENDENCY_AUDIT.md:18` calls the tree valid. The SDK inventory contains version drift, including `expo-clipboard ~57.0.2` while the declared/installed package is 57.0.1 (`docs/privacy/SDK_DATA_INVENTORY.csv:10`; `apps/mobile/package.json`; `package-lock.json`).

**Closure:** `Local`. Reconcile install/lock state, regenerate the inventory and SBOM from the lockfile, document the exact advisory path/exploitability, and monitor for a compatible Expo fix. Re-run immediately before production build. Any high/critical or runtime-reachable escalation becomes P1.

### P2-02 — The combined local gate omits mobile tests, network, formatting, audit, and native resolution

Root `npm run check` runs root Vitest but not `npm run test --workspace @only-signature/mobile`; it also omits `verify:network`, `format:check`, `npm audit`, Expo Doctor, SBOM drift, secret scan, autolinking resolution, and production Expo introspection (`package.json`). Current `npm run format:check` fails on 25 generated/document/script files. This is quality/evidence debt rather than proof that a runtime feature works.

**Closure:** `Local`. Define one deterministic Windows gate with generated-output exclusions and one macOS/archive gate. Ensure current evidence files are generated from those gates and fail on stale results.

### P2-03 — Temporary-file lifecycle and ownership validation are incomplete

Exports use randomized subdirectories, which is good, but remain until the next launch or Delete All; there is no best-effort post-share cleanup (`apps/mobile/src/services/export.ts:26-46,49-67`; `apps/mobile/src/services/storage.ts:63-84`). Native `protectTemporaryFile` accepts any file URL without asserting it is within the owned export directory (`apps/mobile/modules/only-signature-native/ios/OnlySignatureStorageModule.swift:54-58`). Cleanup aborts on the first removal error (`apps/mobile/modules/only-signature-native/ios/OnlySignatureStorageModule.swift:49-52`).

**Closure:** `Local + device`. Validate canonical path ownership, journal generated files, clean after safe handoff where possible, continue cleanup across individual errors, and retain next-launch cleanup as a backstop. Verify file-protection/backup attributes and interruption cases on device.

### P2-04 — App-switcher cover starts uncovered until a lifecycle event arrives

`PrivacyCover` initializes `covered=false` rather than deriving from `AppState.currentState` (`apps/mobile/src/app/_layout.tsx:9-16`). A launch/resume snapshot before the first change event is therefore not proven covered.

**Closure:** `Local + device`. Initialize from current state, cover before background/inactive snapshot timing, and verify rapid launch/background/foreground behavior on supported iOS versions. Do not claim screenshot or recording prevention.

## Privacy manifest and App Privacy disposition

The source manifest is not release evidence. The app-level Expo config currently declares UserDefaults `CA92.1`, file timestamp `C617.1`, disk space `E174.1`, and system boot time `35F9.1` (`apps/mobile/app.config.ts:84-108`). Installed SDK manifests additionally declare file-timestamp reasons `0A2A.1`, `3B52.1`, `C617.1`, disk-space `85F4.1` / `E174.1`, UserDefaults `CA92.1`, and boot-time `35F9.1`. Those manifests were enumerated for Expo Constants, Device, File System, Media Library, React Native, React Native View Shot, and React Native third-party pods.

The owned manifest is valid XML and declares file timestamp `C617.1` (`apps/mobile/modules/only-signature-native/ios/PrivacyInfo.xcprivacy:1-10`), but P0-01 means it is not currently in the resolved pod set. Windows cannot inspect the final merged archive. Therefore App Privacy answers, required reasons, SDK signatures, and “Data Not Collected” remain release-gated until a corrected signed archive is inventoried, an Xcode privacy report is generated, the exact reasons are mapped to reached code, and App Store upload diagnostics are clean. No ATT usage string or tracking SDK was found in authored configuration.

## Purchase race/recovery disposition against final authority

| Final-authority requirement                                                                                            | Actual repository status                                                                                                                                                                     | Result                                                                                           |
| ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| FA-01 blocks/defer Delete All through active, pending, verified-unfinished, recovery, and protected-unavailable states | Guard sees only `pendingPurchaseId`; purchased persistence clears it before `finish`; no other durable states exist                                                                          | **FAIL — local P1**                                                                              |
| FA-02 token is optional and never correctness-critical                                                                 | Native token parameter is optional and uses only a valid UUID, but runtime no-token fallback is ambiguous, wrong product is accepted, and no-token/changed-token provider tests do not exist | **FAIL — local P1 plus device proof**                                                            |
| FA-03 queue protected-data-unavailable delivery without finishing                                                      | No availability API/event, queue, retry, or post-unlock unfinished scan; launch read rejection is unhandled                                                                                  | **FAIL — local P1 plus device proof**                                                            |
| Freeze snapshot and hash before purchase                                                                               | Hashes are computed and state is written before the call                                                                                                                                     | **PARTIAL** — hashes are never validated during binding and ordered read-back is absent          |
| Verified transaction only                                                                                              | Swift distinguishes verification results and JS checks `verified`                                                                                                                            | **PARTIAL** — native code is not linked/compiled and product identity is unchecked               |
| Persist binding, confirm durability, finish last                                                                       | One raw JSON write precedes nominal finish                                                                                                                                                   | **FAIL** — no durable bound-unfinished journal/read-back; finish/no-op not confirmed             |
| Same set re-exports without payment; unclaimed slot included                                                           | Model and ordinary UI path implement purchased status and included slot                                                                                                                      | **LOCAL LOGIC PRESENT** — depends on safe purchase binding/storage and remains device-unverified |

## Commands and results actually observed

| Command/check                                                                    | Actual result                                                                                     |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `git remote -v`                                                                  | Empty; no remote configured                                                                       |
| Targeted secret-pattern scan                                                     | No matches for the tested private-key/live-key/token patterns                                     |
| `npm test`                                                                       | PASS: 7 files, 24 tests; 43.63% statements overall; mobile state/services reported 0%             |
| `npm run test --workspace @only-signature/mobile`                                | PASS: 11/11 pure mobile-domain tests                                                              |
| `npm run typecheck`                                                              | PASS across mobile, site, config, content, core, and design tokens; Astro 0 errors/warnings/hints |
| `npm run lint`                                                                   | PASS across lint-enabled workspaces                                                               |
| `npm run format:check`                                                           | **FAIL:** 25 files reported, primarily generated mobile web output plus three docs/scripts        |
| `npm run check:content`                                                          | PASS across 109 files                                                                             |
| `npm run check:release`                                                          | PASS only as development: “Development configuration does not claim production readiness.”        |
| Production release script with complete audit-only dummy values                  | PASS; proves the script's own inputs can validate, not that founder values exist                  |
| Production `expo config --type introspect` with complete audit-only dummy values | PASS config resolution; exposed `NSAllowsArbitraryLoads=true`; no build occurred                  |
| Production Expo config with placeholders/mock-adjacent defaults                  | Correctly failed closed on bundle/team/URLs/product/EAS project values                            |
| `npx expo-doctor@latest`                                                         | PASS: 21/21 checks                                                                                |
| `npx expo-modules-autolinking search --platform ios`                             | Finds `only-signature-native` source package                                                      |
| `npx expo-modules-autolinking resolve --platform ios`                            | **FAIL for owned module:** zero custom-module matches; local podspec count zero                   |
| Isolated temporary `expo prebuild --platform ios --no-install`                   | NOT RUN TO COMPLETION: Expo refused iOS project generation on Windows and required macOS/Linux    |
| `npm run verify:network`                                                         | **FAIL:** generated `dist-web` fetch/XMLHttpRequest/URL findings; no packet capture               |
| Manual authored-source network scan                                              | No explicit runtime fetch/XHR/WebSocket/analytics/backend call found                              |
| `npm audit --json`                                                               | **NON-CLEAN:** 12 moderate, 0 high, 0 critical                                                    |
| `npm ls --all --json`                                                            | Exit 0 but reported two extraneous installed packages                                             |
| Privacy XML parse                                                                | Owned `PrivacyInfo.xcprivacy` is well-formed XML; archive merge not available                     |
| Build artifact search                                                            | No `.ipa`, `.xcarchive`, provisioning profile, certificate, or signing key found                  |
| `apps/mobile/dist-ios` inspection                                                | Expo JS/assets export only; not a native or signed build                                          |

## Required closure order

1. Fix P0-01 and prove the owned pod resolves, compiles, and is embedded with its privacy manifest.
2. Replace the runtime's simplified purchase/storage path with the canonical durable journal/repository semantics; close P1-01 through P1-06 with deterministic concurrency/crash tests.
3. Hide Copy and SVG unless/until their owned privacy/interoperability contracts pass; make actual runtime PNG/JPEG outputs pass pixel and destination tests.
4. Unify production configuration, remove hardcoded production price behavior, harden ATS/network checks, and regenerate truthful evidence.
5. Reconcile dependencies, manifests, SBOM, formatting, and gates.
6. Only then request authorized EAS/macOS compilation and signed physical-device/StoreKit/archive/network/privacy verification.

## External gates and finite founder inputs

The defects above are locally fixable and must not be relabeled as founder blockers. After correction, these genuine external gates remain:

- Apple Team ID, final bundle/product identifiers, EAS/App Store Connect credentials, signing/build authorization, and StoreKit/App Store records.
- Final public support/privacy/Terms/marketing URLs, support email, operator identity/address, DSA/territory/export-compliance decisions, and legal/name review.
- Authorized signed EAS/macOS build, physical iPhone/iPad testing, StoreKit Test/sandbox, archive/privacy report, packet observation, TestFlight, and submission actions.

## Final authority verdict

**P0 OPEN. MULTIPLE P1s OPEN. RELEASE AUTHORITY WITHHELD.**

The repository may continue local implementation under the final four-person authority. It must not be described as a complete working production iOS app, StoreKit-safe, protected-data-safe, alpha-verified on iOS, pasteboard-private, privacy-manifest validated, network-audited, signed, or App Store ready at this snapshot. A follow-up actual-repository audit is required after the local corrections; only the remaining signed-build/device/portal proofs may then be carried as external gates.

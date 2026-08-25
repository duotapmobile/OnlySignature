# Auditor B — Engineering, StoreKit, Security, and Privacy

**Product:** Only Signature  
**Research and audit date:** 2026-08-25  
**Role:** Independent Auditor B  
**Audit stage:** Pre-implementation specification audit  
**Independence:** This report was prepared from the controlling build contract and current primary technical sources. No other auditor report was opened or used.

## Decision

**Conditional approval to implement.** The requested app is technically feasible with Expo React Native on Windows, provided the implementation treats the Windows host as a JavaScript/TypeScript, web, Android, and native-project-generation environment—not as evidence of an iOS build or device result. EAS Build can compile iOS in an Expo-hosted macOS environment from Windows. Final iOS compilation, archive inspection, StoreKit testing, performance measurement, network observation, accessibility testing, and destination-specific alpha verification remain release gates until a signed build can run on Apple hardware or a macOS simulator.

No P0 blocker was found in the product definition. The P1 findings below are build-authority conditions. Each has a concrete disposition and verification method, so implementation may begin without founder credentials.

## Severity and disposition vocabulary

- **P0:** Prevents a safe or lawful build; no implementation should proceed until resolved.
- **P1:** Release-critical correctness, purchase safety, privacy, or submission concern. Implementation may proceed only with an explicit design disposition.
- **P2:** Important quality or operational risk that must be closed before release.
- **P3:** Improvement or documentation hardening.
- **Fixed in specification:** The correction is defined here and can be implemented without an external decision.
- **Disproven with evidence:** Current primary evidence shows the challenge is not a blocker.
- **Founder-gated:** The locally achievable work can finish, but external credentials, legal identity, or device/portal access remains required.
- **Excluded:** The capability is intentionally not shipped, with a defensible reason.

## Current technical baseline

The local host reported:

- Windows PowerShell workspace: `C:\Users\mskir\Desktop\Only Signature Build August`
- Node.js `v22.22.0`
- npm `10.9.4`
- Git `2.50.0.windows.2`
- Expo CLI resolving to `57.0.18`

Current registry checks on 2026-08-25 reported Expo `57.0.16`, React Native `0.87.0` as the unconstrained registry latest, `react-native-iap` `16.3.2`, `expo-iap` `5.3.2`, React Native Skia `2.11.1`, and `react-native-svg` `15.15.5`. These registry values are evidence of availability, not automatic compatibility approval.

Expo's SDK matrix identifies SDK 57 with React Native 0.86, React 19.2.3, minimum Node 22.13.x, minimum iOS 16.4, and Xcode 26.4 or later. Therefore the app must use Expo's compatible version set through `npx expo install`; it must **not** install the unconstrained React Native 0.87 registry latest. [Expo SDK version matrix](https://docs.expo.dev/versions/latest/) (official Expo documentation, accessed 2026-08-25). Expo announced SDK 57 on 2026-06-30 and identifies it as the React Native 0.86 release. [Expo SDK 57 changelog](https://expo.dev/changelog/sdk-57) (official Expo source, published 2026-06-30, accessed 2026-08-25).

Apple requires iOS and iPadOS uploads beginning 2026-04-28 to use the iOS/iPadOS 26 SDK or later. Expo SDK 57's Xcode 26.4+ baseline satisfies that minimum in principle, but the actual EAS build log and archive SDK metadata must prove it at release. [Apple upcoming SDK minimum requirements](https://developer.apple.com/news/?id=ueeok6yw) (official Apple news, published 2026-02-03, accessed 2026-08-25); [Xcode system requirements](https://developer.apple.com/xcode/system-requirements) (official Apple documentation, accessed 2026-08-25).

## Locked engineering decisions proposed by Auditor B

1. Use an npm-workspace monorepo with Expo SDK 57, React Native 0.86, React 19.2.3, strict TypeScript, a pinned Node 22.22.0 toolchain, and a committed lockfile.
2. Use Expo prebuild/Continuous Native Generation and EAS Build, with config plugins and small owned Expo native modules for iOS behavior that generic JavaScript APIs cannot guarantee.
3. Use a development build, not Expo Go, for any evidence involving native StoreKit, file attributes, clipboard behavior, share destinations, Photos, privacy manifests, or app lifecycle.
4. Persist canonical stroke-point records as the durable source of truth. Skia paths and raster exports are derived artifacts. Never persist only a canvas screenshot or a version-specific serialized Skia picture.
5. Use direct StoreKit 2 semantics through a verified React Native bridge. The bridge must expose StoreKit verification state, transaction ID, product ID, `appAccountToken`, purchase state, transaction updates, unfinished transactions, and explicit finish behavior. If an off-the-shelf bridge cannot pass the contract test, replace only the StoreKit boundary with a small owned Expo native module.
6. Model the transparent-set product as a repeat-purchasable consumable. A local set—not a user account or global entitlement—owns the durable re-export right.
7. Implement purchase fulfillment as a durable, idempotent journal. Persist and verify the local set before finishing the StoreKit transaction.
8. Store reusable strokes in `Library/Application Support` with `NSFileProtectionComplete` and backup exclusion. Create exports in a protected randomized temporary directory and clean them after handoff and on next launch.
9. Implement image copy through a small native pasteboard module using `localOnly: true` and an expiration date. Do not use `expo-clipboard.setImageAsync` for signature images because its documented API does not expose either safety option.
10. Disable `expo-updates` in production and ship an embedded bundle. Permit no application-originated production networking other than explicit external-link opening; StoreKit communication is system-mediated by Apple.
11. Ship PNG and JPEG first. Ship SVG only after actual vector interoperability tests. Ship PDF only after Apple-viewer transparency and bounds tests; otherwise exclude it without weakening the core product.

## Findings register

### ENG-01 — Windows development is feasible, but Windows cannot certify iOS

- **Severity:** P1
- **Evidence:** Expo documents that EAS Build provides cloud iOS builds from any operating system and runs iOS builds on hosted macOS infrastructure. It also states that local iOS compilation requires Xcode; Windows local EAS builds are not officially supported. [EAS Build introduction](https://docs.expo.dev/build/introduction/) and [development builds](https://docs.expo.dev/develop/development-builds/introduction/) (official Expo documentation, accessed 2026-08-25); [local EAS build limitations](https://docs.expo.dev/build-reference/local-builds/) (official Expo documentation, accessed 2026-08-25).
- **Assessment:** The architecture is viable. Windows can run repository checks, generate native projects, build the static site, and exercise pure TypeScript logic. It cannot run Xcode, an iOS simulator, StoreKit Testing in Xcode, Instruments, VoiceOver on iOS, or a local signed iOS archive.
- **Disposition:** **Disproven with evidence** as a project blocker; **founder-gated** only for signed-device and portal evidence.
- **Required correction:** Separate local checks, EAS cloud compilation, Apple-device QA, StoreKit sandbox QA, and App Store submission in all status reporting. Never convert an Expo web or Android result into an iOS claim.
- **Verification:** Run all platform-neutral gates on Windows. After credentials exist, run an EAS development/preview/production iOS build, retain the build logs, inspect the archive, and execute the native test matrix on a supported iPhone and iPad. Record exact device, OS, build ID, and result.

### ENG-02 — Expo SDK 57 is the compatible baseline; unconstrained latest packages are unsafe

- **Severity:** P1
- **Evidence:** Expo maps SDK 57 to React Native 0.86 and Node 22.13.x minimum. Its documentation says native projects must be regenerated after SDK or native dependency changes. [Expo SDK matrix](https://docs.expo.dev/versions/latest/) and [Continuous Native Generation](https://docs.expo.dev/workflow/continuous-native-generation/) (official Expo documentation, accessed 2026-08-25).
- **Assessment:** Installing `react-native@latest` would currently select 0.87 and step outside Expo SDK 57's declared compatibility. Native packages must be selected with `npx expo install` or proven independently.
- **Disposition:** **Fixed in specification.**
- **Required correction:** Pin Node 22.22.0, Expo 57, its compatible React Native/React set, and exact direct dependency versions in the lockfile. Use `npx expo install --check`, `npx expo-doctor`, and clean prebuild after native changes.
- **Verification:** Clean install from the lockfile; Expo Doctor zero unexplained issues; clean iOS prebuild; EAS iOS compile using Xcode 26.4+; archive reports iOS 26 SDK or later.

### ENG-03 — StoreKit must be a proven StoreKit 2 boundary, not merely an IAP package import

- **Severity:** P1
- **Evidence:** Apple recommends the Swift-based StoreKit API for new apps whose minimum OS supports it; it provides App Store-signed JWS transactions beginning with iOS 15. [Choosing a StoreKit API](https://developer.apple.com/documentation/storekit/choosing-a-storekit-api-for-in-app-purchases) (official Apple documentation, accessed 2026-08-25). StoreKit automatically returns verified or unverified transaction results, and Apple states that a StoreKit-verified transaction is valid for the device. [VerificationResult](https://developer.apple.com/documentation/storekit/verificationresult) and [Transaction verification](https://developer.apple.com/documentation/storekit/transaction) (official Apple documentation, accessed 2026-08-25).
- **Assessment:** Both `react-native-iap` and `expo-iap` were actively published in the audit week, but recency alone does not prove the exact required semantics. Their public guides often prescribe server verification generically, while Apple expressly allows reliance on StoreKit verification. This app deliberately has no backend. The selected bridge must prove that it does not flatten an unverified result into an apparent success and that it preserves the correlation and recovery fields.
- **Disposition:** **Fixed in specification** with a mandatory bridge contract test.
- **Required correction:** Create one `StoreKitAdapter` interface with real and mock implementations. Select one maintained bridge only after a native spike proves: StoreKit 2, verified/unverified distinction, localized `displayPrice`, consumable product requests, UUID `appAccountToken`, transaction ID, pending/cancel/failure states, launch listener, unfinished transaction delivery, explicit finish, duplicate callbacks, and no automatic finishing. Disable any option named like automatic or dangerous finish. Fall back to a narrow owned Expo StoreKit module if the package cannot satisfy the contract.
- **Verification:** XCTest/StoreKit Test plus JS integration tests. Inject an unverified result and prove no entitlement. Inspect native bridge source and the linked binary. Test duplicate, pending, interrupted, failed, refunded, and unfinished transactions. Confirm production bundle has no mock-adapter activation path.

### ENG-04 — Consumable is correct, but no global premium or StoreKit restoration is valid

- **Severity:** P1
- **Evidence:** Apple defines a consumable as depleted after one use and repurchasable; non-consumables are one-time, non-expiring feature purchases. [App Store Connect IAP overview](https://developer.apple.com/help/app-store-connect/configure-in-app-purchase-settings/overview-for-configuring-in-app-purchases/) and [In-app purchase HIG](https://developer.apple.com/design/human-interface-guidelines/in-app-purchase) (official Apple sources, accessed 2026-08-25). Apple states that consumables do not appear in `Transaction.currentEntitlements`; unfinished or full transaction sequences are separate. [Transaction.currentEntitlements](https://developer.apple.com/documentation/storekit/transaction/currententitlements) (official Apple documentation, accessed 2026-08-25).
- **Assessment:** The product sells one unit of transparent finalization for one local signature-plus-initials set. It must be purchasable repeatedly for distinct sets, so a consumable fits better than a global non-consumable. The durable same-set re-export right is app-maintained local fulfillment of that consumed unit, not an App Store entitlement. StoreKit cannot reconstruct deleted stroke artwork.
- **Disposition:** **Disproven with evidence** as a product-model blocker; **fixed in specification** for data behavior.
- **Required correction:** No `isPremium`, no restore button, and no transaction-history claim that deleted drawings can be restored. Persist purchased status per set. Explain that app deletion may remove sets while user-exported files remain. A consumed transaction alone cannot recreate the signature.
- **Verification:** Static search rejects global premium flags and restore UI. Tests prove repeated export of the same set is free, a modified duplicate remains unpaid, and deletion/reinstall does not claim artwork restoration.

### ENG-05 — Purchase fulfillment requires a durable state machine and recovery journal

- **Severity:** P1
- **Evidence:** Apple says to persist and deliver the purchase before finishing a transaction; unfinished transactions stay queued. [Finishing a transaction](https://developer.apple.com/documentation/storekit/finishing-a-transaction) (official Apple documentation, accessed 2026-08-25). Apple requires a transaction-update task as soon as the app launches because unfinished transactions may be emitted immediately. [Transaction.updates](https://developer.apple.com/documentation/storekit/transaction/updates) and [Transaction.unfinished](https://developer.apple.com/documentation/storekit/transaction/unfinished) (official Apple documentation, accessed 2026-08-25). Apple returns the purchase UUID in the resulting `appAccountToken`. [appAccountToken](https://developer.apple.com/documentation/storekit/transaction/appaccounttoken) (official Apple documentation, accessed 2026-08-25).
- **Assessment:** A Boolean entitlement or an in-memory callback loses purchases under termination, duplicate callbacks, low disk, or process interruption. Hashing the drawing after purchase also creates a race if the draft changes.
- **Disposition:** **Fixed in specification.**
- **Required correction:** Use these durable records and transitions:
  1. Validate at least one non-empty slot.
  2. Canonicalize raw stroke data; freeze immutable slot snapshots, bounds, rendering version, and SHA-256 hashes.
  3. Generate random local set UUID and random purchase-correlation UUID; never derive either from stroke content.
  4. Atomically persist `purchase_intent(state=prepared)` before showing StoreKit.
  5. Allow only one active purchase request per prepared intent and lock repeated taps.
  6. Pass the random correlation UUID as `appAccountToken`; send no label, hash, pixels, or stroke data to Apple.
  7. On a verified callback, check product ID, environment, token where available, and unique transaction ID.
  8. In one durable commit, insert the transaction under a uniqueness constraint, bind it to the frozen set, mark completed slots immutable, preserve any unclaimed slot, and set the set purchased.
  9. Read the committed record back and validate its checksum.
  10. Only then finish the StoreKit transaction as consumable.
  11. On launch, start the listener first, replay local journal intents, then reconcile StoreKit unfinished transactions idempotently.
  12. If a verified transaction has no safe local mapping, quarantine it as recovery-required and do not silently finish or charge again.
- **Verification:** Fault-injection tests terminate after every numbered step. Re-run each callback at least twice. Simulate low disk and write failure. Assert one transaction maps to one set, no duplicate charge path becomes enabled, a successful purchase survives relaunch, and finish occurs only after durable read-back.

### ENG-06 — The included unclaimed slot must be represented independently of payment

- **Severity:** P1
- **Evidence:** Product contract; no external technical fact required.
- **Assessment:** Treating a set as a single immutable blob would either overwrite purchased content or charge twice when the second slot is filled later.
- **Disposition:** **Fixed in specification.**
- **Required correction:** Model signature and initials as separate slots with `empty | draft | finalized` state and independent canonical hashes. The set has `unpurchased | purchase_pending | purchased`. A purchased set may have one finalized slot and one `included_unclaimed` slot. Filling that slot finalizes it atomically without StoreKit. Editing a finalized slot always creates a new draft set and never mutates the original.
- **Verification:** State-machine tests cover signature-only, initials-only, both, filling later, repeated attempt to fill, relaunch during fill, duplicate-as-new-draft, and independent formats.

### ENG-07 — No-backend verification is defensible, but refund semantics must be explicit

- **Severity:** P1
- **Evidence:** Apple says apps may verify transactions on a server **or rely on StoreKit's verification**. [StoreKit In-App Purchase](https://developer.apple.com/documentation/storekit/in-app-purchase) (official Apple documentation, accessed 2026-08-25). Apple server notifications provide near-real-time refund events, including for consumables, but require a server. [Handling refund notifications](https://developer.apple.com/documentation/storekit/handling-refund-notifications) (official Apple documentation, accessed 2026-08-25). StoreKit testing can produce refund information in transaction revocation fields. [Testing refund requests](https://developer.apple.com/documentation/storekit/testing-refund-requests) (official Apple documentation, accessed 2026-08-25).
- **Assessment:** A proprietary backend is not required for this low-value, locally fulfilled consumable. The tradeoff is that the developer cannot guarantee near-real-time refund notification or cross-device reconciliation. An exported file cannot be revoked, and destroying the only local artwork after a refund would not claw back exports.
- **Disposition:** **Fixed in specification**; server component **excluded** to preserve the locked architecture.
- **Required correction:** Accept only StoreKit `verified` transactions. Record revocation if surfaced locally but do not destroy drawings or exported files. Apple handles the monetary refund. Disclose that the app has no account/cloud and does not restore deleted artwork. Document the lack of server refund telemetry as an intentional limitation, not a security claim.
- **Verification:** StoreKit Test refund case; confirm a revocation never creates a second-charge loop and never deletes local art. App Review notes explain the consumable/local-asset model.

### ENG-08 — Generic Expo file APIs do not prove file protection, backup exclusion, or durable commit

- **Severity:** P1
- **Evidence:** Apple provides `NSFileProtectionComplete`, under which files cannot be read or written while the device is locked, and a default-data-protection entitlement. [NSFileProtectionComplete](https://developer.apple.com/documentation/foundation/fileprotectiontype/complete) and [Data Protection entitlement](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.default-data-protection) (official Apple documentation, accessed 2026-08-25). Apple documents that `Documents` and `Application Support` are backed up by default and can be excluded via the backup-exclusion resource key; `tmp` is not backed up and must be cleaned. [Apple File System Programming Guide](https://developer.apple.com/library/archive/documentation/FileManagement/Conceptual/FileSystemProgrammingGuide/FileSystemOverview/FileSystemOverview.html) (official Apple archive, accessed 2026-08-25). Expo FileSystem 57 documents create/write/move APIs but no public file-protection or backup-exclusion option. [Expo FileSystem](https://docs.expo.dev/versions/latest/sdk/filesystem/) (official Expo documentation, accessed 2026-08-25).
- **Assessment:** Saving JSON in Expo's document directory alone does not meet the contract. SecureStore is not appropriate for bulk stroke data and may persist keychain entries across uninstall/reinstall on iOS, which would confuse deletion behavior. [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/) (official Expo documentation, accessed 2026-08-25).
- **Disposition:** **Fixed in specification.**
- **Required correction:** Build an owned, narrow iOS storage module/config plugin that creates `Library/Application Support/OnlySignature`, applies `NSFileProtectionComplete`, sets backup exclusion on the directory and verifies attributes, writes a same-directory randomized temporary file, synchronizes it, atomically replaces the prior file, and returns a durable success only after read-back/checksum validation. Apply the same protection to purchase journals and temporary exports. Do not store strokes, thumbnails, labels, or purchase mappings in AsyncStorage, UserDefaults, SecureStore, logs, shared app groups, Spotlight, or unprotected caches.
- **Verification:** Native XCTest checks resource values and protection attributes. Device test locks the phone and confirms files are inaccessible to the app until unlock. Inspect a device backup to prove the directory is excluded. Fault-injection storage tests prove old-or-new atomicity, never a truncated canonical record.

### ENG-09 — Temporary export and clipboard controls need owned native behavior

- **Severity:** P1
- **Evidence:** Apple's pasteboard API supports `localOnly: true` to prevent Handoff and an expiration date to remove content. [UIPasteboard setItemProviders](https://developer.apple.com/documentation/uikit/uipasteboard/setitemproviders%28_%3Alocalonly%3Aexpirationdate%3A%29) and [localOnly option](https://developer.apple.com/documentation/uikit/uipasteboard/optionskey/localonly) (official Apple documentation, accessed 2026-08-25). Expo Clipboard's documented image setter accepts only a base64 image and exposes neither option. [Expo Clipboard](https://docs.expo.dev/versions/latest/sdk/clipboard/) (official Expo documentation, accessed 2026-08-25).
- **Assessment:** `expo-clipboard.setImageAsync` would permit indefinite general-pasteboard persistence and cross-device Handoff. Cache files may outlive the share flow.
- **Disposition:** **Fixed in specification.**
- **Required correction:** Use an owned image-pasteboard module with local-only and a short documented expiration. Copy only one compatible raster asset at a time. Generate share files under an app-owned randomized protected temp subdirectory, maintain a cleanup journal, delete after safe handoff where lifecycle permits, and clean stale exports at every launch. Never use typed labels or names in temp filenames.
- **Verification:** Native test reads pasteboard options; device test confirms no Universal Clipboard transfer and expiration. Relaunch with deliberately orphaned temp files and prove cleanup. Inspect container after share cancel, share success, crash, and reboot.

### ENG-10 — Export truth is achievable, but formats require independent gates

- **Severity:** P1
- **Evidence:** React Native Skia supports path-based drawing, canvas snapshots, encoded bytes, and pixel reads. [Skia Canvas](https://shopify.github.io/react-native-skia/docs/canvas/overview/) and [Skia Images](https://shopify.github.io/react-native-skia/docs/images/) (maintainer documentation, accessed 2026-08-25). Skia serialized pictures are documented as compatible only with the Skia version that created them, so they are unsuitable as the durable signature representation. [Skia Pictures](https://shopify.github.io/react-native-skia/docs/shapes/pictures/) (maintainer documentation, accessed 2026-08-25).
- **Assessment:** Transparent PNG and white PNG/JPEG are feasible. SVG is feasible from canonical vector paths but must be generated and sanitized directly. Transparent PDF is not automatically proven by a Skia screen snapshot. Alpha survival through Files, Share, AirDrop, Copy, and Photos is destination-dependent.
- **Disposition:** **Fixed in specification** for PNG/JPEG; SVG and PDF remain gated and may be defensibly excluded.
- **Required correction:** Render exports offscreen from canonical strokes at deterministic dimensions. Explicitly clear transparent PNG surfaces to RGBA zero; explicitly fill white PNG/JPEG surfaces white. Generate SVG from owned path data with a tight `viewBox`, no scripts, links, external resources, private metadata, names, or raster fallback. Do not ship PDF until Quick Look, Preview, Files, and print/scaling tests prove transparent bounds. Do not market transparent Photos saving until device tests prove the actual saved file retains alpha.
- **Verification:** Decode pixels in automated tests and inspect alpha/background/crop/padding. Open SVG/PDF in multiple common tools. On Apple devices, hash or re-import destination files and inspect pixel alpha. Screenshot appearance is not proof of alpha because viewers may composite transparency.

### ENG-11 — Drawing must preserve canonical points across rotation and upgrades

- **Severity:** P2
- **Evidence:** Gesture Handler runs native gesture recognition and can process on the UI thread; Skia renders its own canvas and supports snapshots. [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/) and [Skia Canvas](https://shopify.github.io/react-native-skia/docs/canvas/overview/) (maintainer documentation, accessed 2026-08-25). Expo warns that orientation control on iPad interacts with Split View and may require disabling multitasking to force orientation. [Expo ScreenOrientation](https://docs.expo.dev/versions/latest/sdk/screen-orientation/) (official Expo documentation, accessed 2026-08-25).
- **Assessment:** Coordinates tied only to current pixels will distort on rotation. Rerendering React state on every touch point may cause latency. Forcing orientation may undermine iPad adaptability.
- **Disposition:** **Fixed in specification.**
- **Required correction:** Store normalized points plus original canvas dimensions/orientation/timing/optional pressure; preserve raw points and use a versioned deterministic path builder. Accumulate active strokes on the UI/native side and commit completed strokes to JS state. Recompute view transforms on rotation without rewriting canonical points. Treat “Rotate for more room” as guidance; support portrait and landscape instead of forcing a lock that disables iPad multitasking. Pressure is optional and must not be synthesized.
- **Verification:** Golden path/export tests across aspect ratios and renderer versions; rotate mid-stroke and between strokes; measure input-to-render latency and dropped frames on the oldest supported iPhone and a current iPad.

### ENG-12 — Production network behavior requires build-time and runtime separation

- **Severity:** P1
- **Evidence:** Expo Updates checks for updates at launch by default when enabled; setting it disabled causes the embedded update to load. [Expo Updates](https://docs.expo.dev/versions/latest/sdk/updates/) (official Expo documentation, accessed 2026-08-25). Apple's App Transport Security is enabled by default and blocks insecure URL-loading connections, but it is not a domain allowlist and does not govern every lower-level library. [Apple ATS](https://developer.apple.com/documentation/security/preventing-insecure-network-connections) (official Apple documentation, accessed 2026-08-25).
- **Assessment:** “No proprietary runtime network” cannot be proven solely by absence of `fetch` in source. Dev client, Metro, Expo Updates, dependency code, link previews, and native frameworks can create traffic. EAS Build uploads source to Expo at build time; that is not production-app transmission but must not contain secrets.
- **Disposition:** **Fixed in specification.**
- **Required correction:** Set production `updates.enabled=false`; omit update URL/channel/runtime publication; use embedded JS. Do not include analytics, crash reporters, remote fonts/images, remote config, web views, or incoming share-extension resolution. Use basic outgoing share only. External policy/support links must open only after user action. Maintain a runtime allowlist: system StoreKit; user-initiated OS share/save; user-initiated HTTPS links. Create `.easignore`, secret scan, and EAS source-upload disclosure for the build process.
- **Verification:** Static scan for network APIs/domains, generated Info.plist and entitlements review, dependency source/binary audit, and packet/DNS observation on a release build during fresh launch, drawing, preview, local save, relaunch, and settings. Repeat StoreKit and explicit-link actions separately so system-mediated traffic is not mistaken for app telemetry.

### ENG-13 — Privacy manifests and App Privacy answers must be derived from the final archive

- **Severity:** P1
- **Evidence:** Apple requires a valid `PrivacyInfo.xcprivacy`; it describes collected data, tracking, tracking domains, and required-reason APIs. App Store Connect rejects invalid manifests. Beginning 2025-02-12, submissions using certain common third-party SDKs must contain valid SDK manifests. [Privacy manifest files](https://developer.apple.com/documentation/bundleresources/privacy-manifest-files) and [Adding a privacy manifest](https://developer.apple.com/documentation/bundleresources/adding-a-privacy-manifest-to-your-app-or-third-party-sdk) (official Apple documentation, accessed 2026-08-25). Apps using covered APIs must declare approved reasons; fingerprinting is prohibited. [Required-reason APIs](https://developer.apple.com/documentation/bundleresources/describing-use-of-required-reason-api) (official Apple documentation, accessed 2026-08-25). Expo SDK 57 can merge iOS privacy-manifest definitions through app config. [Expo app configuration](https://docs.expo.dev/versions/v57.0.0/config/app/) (official Expo documentation, accessed 2026-08-25).
- **Assessment:** A hand-authored empty manifest is not proof. Expo, React Native, Skia, storage, IAP, and other native modules may use UserDefaults, file timestamp, disk-space, or system-boot-time API categories. Dependency manifests can be missing, invalid, or semantically wrong. App Privacy “Data Not Collected” cannot be inferred merely from having no backend; Apple purchase records and voluntarily initiated support are separate disclosures to analyze under Apple's definitions.
- **Disposition:** **Fixed in specification.**
- **Required correction:** Maintain an SDK inventory with purpose, version, license, native code, network behavior, data behavior, permissions, privacy manifest, and required-reason use. Declare no tracking and no tracking domains only if the binary audit supports it. Do not include ATT or `NSUserTrackingUsageDescription`. Generate Xcode's privacy report from the release archive, inspect every embedded framework manifest/signature, and make App Privacy answers match actual runtime, website, and support behavior.
- **Verification:** `plutil -lint` every manifest; inspect the final `.app` and embedded frameworks; generate the Xcode privacy report; run App Store upload validation; compare the report to SDK inventory and policy. Any App Store warning is release-blocking until resolved—not waived by an app-level manifest.

### ENG-14 — Photos and Files must use least privilege and destination-truthful copy

- **Severity:** P2
- **Evidence:** Expo MediaLibrary supports a write-only permission request and iOS `NSPhotoLibraryAddUsageDescription`. [Expo MediaLibrary](https://docs.expo.dev/versions/latest/sdk/media-library/) (official Expo documentation, accessed 2026-08-25). Expo Sharing opens the system action sheet for a local file URL. [Expo Sharing](https://docs.expo.dev/versions/latest/sdk/sharing/) (official Expo documentation, accessed 2026-08-25).
- **Assessment:** Basic outgoing sharing does not require an inbound share extension or app group. Asking for broad Photos read access would violate minimization. Photos UI may visually composite alpha even when the file retains it, so both file-level and workflow-level testing are needed.
- **Disposition:** **Fixed in specification.**
- **Required correction:** Use basic `shareAsync` without enabling an incoming share extension. Request Photos add-only permission only after the user chooses Photos. Offer Files/Share as the primary transparent path until Photos alpha is proven. Never state that an OS-selected cloud destination remains on-device.
- **Verification:** Inspect generated permissions/entitlements; deny Photos and confirm Files/Share still work; test limited/add-only states; export/re-import PNG and inspect alpha on every supported iOS major version.

### ENG-15 — App-switcher cover, logs, and diagnostics need lifecycle tests

- **Severity:** P2
- **Evidence:** The risk follows from the contract and iOS lifecycle behavior; no claim is made that screen capture can be technically prevented.
- **Assessment:** A React-only cover may appear too late during transition. Development logging can inadvertently stringify set records or StoreKit payloads. Error reporters and default console output must not receive sensitive objects.
- **Disposition:** **Fixed in specification.**
- **Required correction:** Present an opaque privacy cover on inactive/background lifecycle events at the native window/root-view boundary; remove it only when active. Centralize release logging behind a structured redaction logger and strip/suppress console output in production. Diagnostics may contain only app/build/device/OS and coarse error/StoreKit/export categories. Never log transactions wholesale, filenames, labels, paths containing labels, images, hashes, points, or serialized state.
- **Verification:** Slow-motion screen recording of app switcher entry/return; lifecycle UI test; static scan for console calls and object serialization; inspect device console while exercising all failures.

### ENG-16 — Release configuration must fail closed

- **Severity:** P1
- **Evidence:** The production/mocking boundary and external placeholders are contract requirements. Expo application config is evaluated during native generation and can supply iOS identifiers, entitlements, and privacy manifest values. [Expo app configuration](https://docs.expo.dev/versions/v57.0.0/config/app/) (official Expo documentation, accessed 2026-08-25).
- **Assessment:** A permissive fallback to mock StoreKit, placeholder URLs, a hardcoded U.S. price, OTA updates, or development links would create purchase/review/privacy failures.
- **Disposition:** **Fixed in specification; founder-gated** only for final values and signing credentials.
- **Required correction:** One typed release-config loader must reject production when bundle ID, team ID, product ID, HTTPS privacy/support/marketing URLs, support email, operator identity, territories, StoreKit mode, or legal URL is absent/placeholder. The production StoreKit mode must be `real`; localized price must come from the fetched StoreKit product. Keep `$1.99` only in development fixtures and explicitly labeled U.S. screenshot metadata. Exclude `.env*` except `.env.example`, keys, profiles, certificates, and private legal data.
- **Verification:** Unit tests reject each missing/placeholder value; inspect the production JS bundle for mock adapter identifiers and placeholder strings; static search for `$1.99`; archive Info.plist/entitlement review; product-unavailable test still leaves free export functional.

### ENG-17 — Dependency and supply-chain claims require a final locked-graph audit

- **Severity:** P2
- **Evidence:** Apple holds developers responsible for included third-party SDKs and their privacy manifests/signatures. [Apple privacy requirement reminder](https://developer.apple.com/news/?id=pvszzano) (official Apple news, published 2024-04-26, accessed 2026-08-25).
- **Assessment:** A current npm publication is not proof of security, privacy, license compatibility, or Expo compatibility. Native libraries materially expand the binary and privacy-manifest surface. Test-only image decoders and site tooling must not leak into the mobile runtime bundle.
- **Disposition:** **Fixed in specification.**
- **Required correction:** Prefer Expo-maintained modules and owned small native modules. Justify every direct dependency. Pin exact versions and lockfile integrity. Separate mobile runtime, build-only, test-only, and site dependencies. Do not add RevenueCat, Firebase, analytics, crash reporting, PDF toolkits, archive libraries, or cloud SDKs absent a proven requirement. Generate CycloneDX SBOM; run npm audit plus an independent advisory scan and license inventory; document every exception with scope and expiry.
- **Verification:** Clean lockfile install, dependency graph, SBOM diff, license report, vulnerability report, native binary/framework list, privacy manifests, and packet observation. Release gate fails on unexplained critical/high advisories or undeclared runtime network behavior.

### ENG-18 — Automated tests are broad, but several acceptance checks are necessarily Apple-gated

- **Severity:** P1
- **Evidence:** Apple StoreKit configuration files support local product definitions, localized payment sheets, failed transactions, and automation; Xcode's transaction manager simulates interrupted purchases. [StoreKit Testing setup](https://developer.apple.com/documentation/xcode/setting-up-storekit-testing-in-xcode/) and [StoreKit transaction manager](https://developer.apple.com/documentation/xcode/testing-in-app-purchases-with-storeKit-transaction-manager-in-code) (official Apple documentation, accessed 2026-08-25).
- **Assessment:** The state machine, canonical hashing, crop math, SVG generation, content drift checks, release config, and pixel decoding can all be fully tested on Windows. Native StoreKit, iOS file protection, pasteboard, Files/Photos/AirDrop behavior, memory, latency, VoiceOver, and archive/privacy reports cannot be certified from Windows-only mocks.
- **Disposition:** **Fixed in specification; founder-gated** only for final Apple execution.
- **Required correction:** Build a deterministic mock and pure state-machine suite now, plus committed StoreKit config, XCTest/StoreKit Test plan, E2E fixtures, and exact Apple execution instructions. Mark unexecuted native checks as `NOT RUN — APPLE ENVIRONMENT REQUIRED`, never pass. EAS compilation proves compilation only.
- **Verification:** Windows CI-equivalent command log plus later macOS/iPhone/iPad evidence. Minimum StoreKit scenarios: success, cancel, pending, unavailable, network failure, interrupted, duplicate event, background, termination before/after durable commit, unfinished recovery, unverified transaction, repeated tap, refund. Minimum storage scenarios: corrupt primary, valid prior generation, low disk, cleanup failure, lock/unlock, deletion. Minimum export scenarios match every format/slot combination in the contract.

### ENG-19 — Asset integrity and release-mode separation must be reproducible

- **Severity:** P2
- **Evidence:** Expo accepts a 1024x1024 iOS icon and generates required sizes, while warning that production icon inputs must follow Apple icon rules. [Expo app icon configuration](https://docs.expo.dev/versions/v57.0.0/config/app/) (official Expo documentation, accessed 2026-08-25).
- **Assessment:** Generated images can accidentally include alpha, incorrect color profiles, stale copy, or nonreproducible manual edits. Fixture/demo signatures must not enter real saved data or production screenshots unexpectedly.
- **Disposition:** **Fixed in specification.**
- **Required correction:** Keep source assets and deterministic generation scripts; hash inputs/outputs; verify dimensions, alpha, color mode, and small-size legibility. Namespace fixture storage separately and compile fixture mode out of production or require a non-production build-time flag that production rejects.
- **Verification:** Asset manifest/hash test, image-mode/alpha inspection, screenshot fixture determinism, production bundle string scan, and installed-icon visual checks on Home Screen, Settings, Spotlight, and App Store-size composites.

### ENG-20 — PDF is not required for launch; excluding it can reduce risk

- **Severity:** P3
- **Evidence:** The contract requires PNG and JPEG and makes SVG/PDF conditional on reliable implementation and tests.
- **Assessment:** Transparent PDF generation, crop box selection, viewer interoperability, and metadata sanitization add native and QA surface without changing the core promise.
- **Disposition:** **Excluded unless all gates pass.**
- **Required correction:** Prioritize transparent PNG, white PNG, and white JPEG. Add SVG only from canonical paths after interoperability. Treat PDF as optional; do not display or market it until verified on Apple viewers.
- **Verification:** Format registry is generated from passing capability flags/tests. Metadata and UI never mention excluded formats.

## Architecture comparison

| Criterion                    | Expo React Native + prebuild                  | Bare React Native                                  | Native SwiftUI                                            |
| ---------------------------- | --------------------------------------------- | -------------------------------------------------- | --------------------------------------------------------- |
| Windows product work         | Strong; TypeScript, web/site, tests, prebuild | Moderate; more manual native setup                 | Poor for executable app work                              |
| Cloud iOS build              | First-class EAS path                          | EAS supports it, with more manual native ownership | Requires a separate Mac/cloud Xcode workflow              |
| StoreKit 2                   | Bridge or small Expo native module            | Bridge or custom native module                     | Direct and strongest native surface                       |
| Protected storage/pasteboard | Small owned native modules needed             | Native customization needed                        | Direct APIs                                               |
| Drawing/export               | Skia + canonical path core                    | Same                                               | Native PencilKit/Core Graphics, but Windows-host mismatch |
| Cross-platform testability   | Highest                                       | Good                                               | Lowest on this host                                       |
| Native debugging burden      | Moderate                                      | High                                               | High and macOS-dependent                                  |
| Recommendation               | **Use**                                       | No demonstrated advantage for this narrow app      | Reject for this Windows-first build                       |

The expected Expo architecture stands. Prebuild does not remove native responsibility; it makes owned native changes reproducible through modules/config plugins. Committing or regenerating the `ios` directory is an implementation choice, but the project must choose one authoritative strategy and test clean regeneration so native privacy/security changes cannot disappear.

## Reference data model and invariants

The implementation should enforce these invariants independent of UI:

- `SignatureSet.id` is a random UUID and contains zero personal meaning.
- Each set contains `signature` and `initials` slots; each slot retains raw canonical points, source dimensions/orientation, rendering version, normalized hash, status, and optional finalized timestamp.
- A local display label is stored separately and is never part of filenames, transaction metadata, logs, hashes sent externally, or StoreKit options.
- A set may be a draft, purchase-pending frozen snapshot, or purchased set. There is no global entitlement.
- A purchased finalized slot is immutable. “Edit” is structurally impossible; duplication creates new IDs and unpaid status.
- A purchased set may have one included-unclaimed slot. Claiming it does not invoke StoreKit.
- Export preferences and filenames do not affect asset hashes or purchase ownership.
- Transaction ID is unique. A duplicate callback is a no-op after verifying the existing binding.
- StoreKit is never finished before durable purchase binding and read-back.
- Deleting a local set removes its local art and preferences; the consumed transaction does not reconstruct it.
- Exported files are outside app control after user handoff.

## Production network allowlist

| Activity                                        |          Allowed | App-controlled payload                                  | Constraint                                                   |
| ----------------------------------------------- | ---------------: | ------------------------------------------------------- | ------------------------------------------------------------ |
| StoreKit product fetch/purchase                 |              Yes | Product ID and random correlation UUID through StoreKit | Apple system API only; no strokes, images, labels, or hashes |
| Open privacy/support/Terms/App Store HTTPS link |              Yes | URL                                                     | Explicit user action only                                    |
| System share/AirDrop/Files/Photos               |              Yes | User-selected exported file                             | Explicit user action; destination may be third-party/cloud   |
| EAS Build source upload                         |  Build-time only | Source bundle required for build                        | `.easignore`, no secrets; never describe as runtime behavior |
| Expo Updates/OTA                                | No in production | None                                                    | `updates.enabled=false`, embedded bundle                     |
| Analytics, ads, crash upload, remote logs       |               No | None                                                    | Dependency and packet audit                                  |
| App backend, cloud signature storage, accounts  |               No | None                                                    | No endpoints or credentials                                  |
| Remote fonts/images/config                      |               No | None                                                    | Bundle assets locally                                        |

The allowlist is a policy target, not a current test result. It must be verified against the final release binary.

## Required dependency decision record before installation

For each mobile dependency, record:

1. Exact version and integrity from lockfile.
2. Purpose and why platform/owned code is insufficient.
3. Maintainer and last release/activity.
4. License.
5. JavaScript versus native code.
6. Production network behavior and domains.
7. Data accessed, stored, or transmitted.
8. Permissions and entitlements.
9. Privacy manifest/signature status.
10. Required-reason API categories and approved reasons.
11. Expo SDK 57 / React Native 0.86 / new-architecture compatibility evidence.
12. Removal or replacement plan.

Likely justified runtime dependencies are Expo/React Native core, routing, gesture handling, Skia, orientation, file/share/media/haptics, cryptographic hashing, localization, and one StoreKit bridge. The protected storage and image pasteboard surfaces should be owned narrow modules because generic Expo APIs do not expose the required guarantees. Test-only image decoders and SBOM/license tools must remain outside the production dependency graph.

## Mandatory verification gates

### Windows-local gates

- Clean npm install from lockfile; Node/npm version check.
- TypeScript strict build, lint, formatting, unit/component/service/storage/state-machine tests.
- Deterministic canonicalization and SHA-256 vectors.
- PNG/JPEG decode and pixel assertions; SVG schema/bounds/sanitization tests.
- Fault injection at every purchase-journal transition.
- Navigation, accessibility-prop, localization expansion, reduced-motion, copy-drift, and release-config tests.
- Static checks for global premium, restore UI, hardcoded price, TODO/pseudocode, placeholder production values, analytics/network packages, ATT keys, logs, secrets, and forbidden product scope.
- npm audit, independent advisory scan, license inventory, CycloneDX SBOM, and dependency graph.
- Clean iOS prebuild/config inspection without claiming compilation.

### EAS/macOS compilation gates

- EAS iOS build uses Xcode 26.4+ and iOS 26 SDK or later; retain build logs.
- Generated native project contains intended entitlements, permission strings, disabled Updates, privacy manifest, storage/pasteboard modules, and no unexpected capabilities.
- Archive contains no mock configuration, development server, update channel, analytics/crash SDK, secrets, or forbidden frameworks.
- `PrivacyInfo.xcprivacy` and all embedded SDK manifests pass `plutil`; generate Xcode privacy report.
- StoreKit configuration and XCTest/StoreKit Test suite compile and run.

### Physical Apple-device gates

- Oldest supported iPhone, latest iPhone/iOS, and supported iPad adaptive layout.
- VoiceOver, Voice Control, largest Dynamic Type, increased contrast, button shapes, reduced motion, portrait/landscape, Split View where supported.
- Drawing latency, dropped frames, memory, startup, rotation, large strokes, export duration, saved-set loading.
- StoreKit sandbox success/cancel/pending/failure/interruption/recovery/repeated-tap/refund.
- File protection lock test, backup exclusion proof, app-switcher cover, container/temp inspection.
- Transparent alpha after Files, Share, AirDrop, Copy, and Photos if offered.
- Packet/DNS observation of a production release build under the network test matrix.

## P0/P1 closure table

| Finding                            | Severity | Disposition before implementation                                          |
| ---------------------------------- | -------: | -------------------------------------------------------------------------- |
| Windows cannot locally certify iOS |       P1 | Feasibility disproven as blocker; final native evidence founder-gated      |
| Version compatibility              |       P1 | Fixed: Expo SDK 57/RN 0.86/Node 22.22.0 and Expo-managed installs          |
| StoreKit bridge semantics          |       P1 | Fixed: mandatory contract test; owned bridge fallback                      |
| Consumable versus global unlock    |       P1 | Fixed: consumable per local set; no global entitlement/restore claim       |
| Crash-safe purchase binding        |       P1 | Fixed: frozen snapshot + durable idempotent journal + finish last          |
| Included unclaimed slot            |       P1 | Fixed: independent slot state machine                                      |
| No-backend verification/refunds    |       P1 | Fixed: rely on StoreKit verification; disclose refund-telemetry limitation |
| File protection/backup/atomicity   |       P1 | Fixed: owned protected storage module                                      |
| Clipboard/temp exposure            |       P1 | Fixed: owned expiring local-only pasteboard and cleanup journal            |
| Export format truth                |       P1 | Fixed for PNG/JPEG; SVG/PDF gated                                          |
| Production network behavior        |       P1 | Fixed: OTA disabled, embedded bundle, allowlist and binary observation     |
| Privacy manifests/required reasons |       P1 | Fixed: final archive/privacy report is authority                           |
| Production release config          |       P1 | Fixed: fail closed; final identities/credentials founder-gated             |
| Native acceptance testing          |       P1 | Test assets built locally; execution on Apple environment founder-gated    |

All P1 concerns therefore have an allowed disposition under the governing contract. Implementation may proceed automatically. None is permission to declare release readiness before its verification gate is executed.

## Auditor B final authority statement

Auditor B authorizes implementation under Expo React Native with prebuild and EAS preparation. The architecture is compatible with a Windows primary host and the no-backend/no-account/no-analytics product boundary. The strongest risks are not UI construction; they are transaction durability, proof that the StoreKit bridge preserves verification semantics, file attributes unavailable through generic Expo APIs, clipboard expiry/locality, production OTA/network drift, and confusing Windows-local success with iOS release evidence.

Release authority must be withheld until the final repository and a real iOS release build demonstrate:

- a StoreKit-verified, idempotent, finish-last consumable flow bound to one frozen local set;
- correct included-slot and same-set re-export behavior;
- protected and backup-excluded local storage with atomic recovery;
- expiring local-only clipboard and bounded protected temporary files;
- true transparent pixels and destination preservation for every advertised path;
- an embedded production bundle with no hidden runtime telemetry or mock purchase mode;
- a valid archive-derived privacy manifest/report and dependency inventory;
- executed StoreKit, device, accessibility, performance, and network tests.

Until those gates run, the truthful status is **implementation-authorized, not iOS-release-certified**.

# Current Final Authority

Date: 2026-08-28

Scope: final authority over the corrected local source after the sequential defect audit, independent improvement review, four-person council, tenth-man challenge, remediation, and hostile re-review.

## Decision

**LOCAL SOURCE APPROVED WITH EXTERNAL RELEASE GATES.**

No open local P0 or P1 correctness defect was found in the reviewed source. This decision is not approval to submit or release and does not claim that Swift compilation, StoreKit sandbox behavior, signed iOS builds, device accessibility, runtime networking, or exported-file destination behavior passed.

## Closed council and tenth-man findings

- Replaced finished-consumable history assumptions with completed `Transaction.unfinished` snapshots. A timeout never proves absence.
- Serialized observer callbacks, snapshot decisions, purchase transitions, and destructive operations without holding the queue across Apple's purchase sheet.
- Re-read and validated the active set, hashed its frozen artwork, persisted the purchase intent, and proved its readback inside the queue before opening StoreKit.
- Added a process-wide single-flight barrier for purchase, Create New, duplicate, set deletion, and Delete All at the pre-sheet boundary.
- Separated explicit cancellation and terminal `Product.PurchaseError` from ambiguous interruption; only explicit cancellation says the user was not charged.
- Kept ambiguous purchase artwork visible and frozen while blocking paid retry and deletion until reconciliation.
- Normalized StoreKit UUID account tokens at the Swift boundary and compared them case-insensitively in TypeScript.
- Restricted tokenless fallback to the configured product and exactly one unresolved live intent.
- Made purchase binding durable before `finish`, retained a finish-pending lock, and required durable completion-marker readback.
- Stabilized the logical drawing plane across rotation and rejected aspect-fit margin touches instead of clamping them to drawing edges.
- Gated included-slot editing during transaction finishing and adapted the comparison for narrow and large-text layouts.
- Added semantic state validation with backup fallback, partial temporary-export cleanup, and a production configuration hook in the EAS app root.

## Final hostile verification

The engineering auditor re-read the corrected pre-sheet path and returned **APPROVE**. It confirmed that the serial queue owns target re-read, validation, hashing, frozen-intent persistence, and durability readback; the queue is released before StoreKit presentation; and all adjacent mutating actions fail closed during the single-flight boundary. It found no new P0 or P1.

Observed local results:

- `git diff --check`: passed.
- `npm run check`: exited 0.
- Root tests: 24/24 passed.
- Mobile tests: 26/26 passed.
- Strict TypeScript: passed across all workspaces.
- Lint: passed across all lint-enabled workspaces.
- Content drift: passed across 122 files.
- Static production network allowlist: passed; runtime observation remains gated.
- Native iOS autolink resolution: passed; Swift compilation remains gated.
- Store-asset verifier: passed for 16 opaque fixture masters and the opaque IAP review asset; final native captures remain gated.
- `npx expo-doctor@latest apps/mobile`: 21/21 checks passed.
- Production configuration negative test: correctly exited 1 with missing founder and release values.
- `git remote -v`: empty.
- Dependency threshold: 0 high or critical advisories; 12 moderate transitive Expo build-chain advisories remain monitored because the offered force fix is breaking.

## Mandatory external release gates

1. Compile the generated iOS project on EAS/macOS and resolve any Swift compiler or SDK issue.
2. Exercise cancellation, pending, interrupted presentation, late verified callback, termination after charge, unfinished recovery, finish retry, and app deletion in StoreKit Test and Apple sandbox.
3. Verify transparent PNG alpha and Files/share destination behavior on supported physical devices.
4. Verify file protection, backup exclusion, temporary-file cleanup, app-switcher cover, and runtime network allowlist on device.
5. Complete VoiceOver, Voice Control, Dynamic Type, reduced-motion, increased-contrast, rotation, iPad, and hand-tremor walkthroughs on Apple hardware.
6. Capture and approve final native App Store screenshots; fixture masters are composition evidence only.
7. Supply founder identity, legal, URL, Apple, territory, pricing, signing, and submission values and pass the fail-closed production configuration gate.

## Authority boundary

The source may proceed to the external release gates. It may not be described as signed, sandbox-tested, device-tested, deployed, submitted, trademark-cleared, or attorney-certified until corresponding evidence exists.

## 2026-08-28 authority renewal

The current four-person council and subsequent tenth-man review found no P0. Every locally actionable P1 was corrected before this renewal. Corrections include screenshot-fixture authorization, per-asset export confirmation, non-repeating authorized-use prompts, finite no-second-charge recovery for an unmatched verified consumable, successful snapshot-recovery messaging, checked-in native network scanning, complete archive privacy-manifest inspection, source-SHA provenance, GitHub Pages privacy disclosure, a native runtime export harness, and post-upload TestFlight readback.

Fresh `npm run acceptance:local` evidence passed in full:

- Prettier, strict TypeScript, and lint passed.
- Root Vitest passed 34/34; mobile Node tests passed 51/51.
- Content drift, development release configuration, production network allowlist, production Expo introspection, iOS native autolink, composition-evidence asset verification, and the source secret scan passed.
- The dependency threshold passed with zero high or critical advisories. Twelve moderate Expo/Xcode build-chain findings remain governed; no force downgrade was used.
- Export pixel verification passed 6/6.
- The Astro site built 9 pages and passed required-output, internal-link, no-client-JavaScript, and prohibited-tracking validation.
- The CycloneDX SBOM was regenerated with 1,147 components after locking the exact optional Apple Silicon Astro compiler and Satteri bindings.
- Both EAS workflow files passed exact `eas-cli@23.0.0 workflow:validate`.
- Expo readback is `duotap` / `admin@duotap.app`, project `@duotap/onlysignature`, ID `954b1a21-89e9-41af-8021-d7c8e66d74c8`.
- The existing GitHub integration base directory was changed to `/apps/mobile` and verified by live readback without dispatching a workflow.

**Renewed decision: LOCAL SOURCE APPROVED FOR THE AUTHORIZED NATIVE-SCREENSHOT AND INTERNAL-TESTFLIGHT GATES.** No signed build, native screenshot, StoreKit sandbox, physical-device, TestFlight, App Review, or public-release claim is made.

The first native screenshot workflow failed safely in source acceptance before allocating a simulator build. Its macOS log exposed an implicit app-config callback type and npm's omission of Astro's Apple Silicon optional compiler binding from the Windows-authored lockfile. Both portability defects were corrected, the exact optional binding is now locked, and the complete local acceptance suite passed again. This renewal covers the corrected commit only; a successful cloud rerun is still required.

The second native screenshot workflow also failed safely before allocating a simulator. It cleared the earlier defects and then exposed the separately omitted `@bruits/satteri-darwin-arm64` package during Astro's production build. The exact `0.10.5` optional binding is now locked, focused site checks and the complete local acceptance suite passed, and no production/TestFlight workflow was dispatched. Cloud-native capture evidence remains mandatory.

The third native screenshot workflow passed source acceptance and reached the real Xcode simulator build. Xcode rejected three assignments to the get-only `URLResourceValues.fileProtection` property and one unqualified ambiguous `Transaction` type in owned Swift. Protection remains enforced through `FileManager` attributes, backup exclusion remains enforced through writable URL resource values, and every intended transaction reference is now `StoreKit.Transaction`. Two fail-closed source tests were added; focused mobile tests passed 53/53 and the complete acceptance suite passed. A successful cloud rerun remains mandatory.

# Current Final Authority

Date: 2026-08-25

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

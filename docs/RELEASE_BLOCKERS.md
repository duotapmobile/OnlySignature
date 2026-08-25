# Release Blockers

**Current release status:** NO-GO. Local implementation authority is granted; release authority is withheld.

## Apple build and purchase

- Signed EAS iOS archive built with an exact stable Xcode image satisfying Apple’s current SDK requirement; logs and archive metadata retained.
- StoreKit bridge proves verified/unverified semantics, localized price, consumable purchase, updates, unfinished recovery, explicit finish, and production mock exclusion.
- StoreKit Test/XCTest and physical sandbox cover success, cancel, pending/deferred, offline, duplicate, interruption, termination, refund/revocation, token present/absent, unmatched recovery, Delete All interlock, and locked protected data.
- First consumable has complete localization, price/availability, review screenshot/notes, reviewer path, agreement/tax/banking readiness, and is submitted with version 1.0.

## Native security, privacy, and export

- Physical-device proof for file protection, backup exclusion, atomic recovery, app-switcher cover, protected temporary files, and cleanup. Image Copy is not shipped.
- Automated and destination re-import proof for transparent alpha, white backgrounds, crop/padding, no halo/checkerboard/opaque rectangle, and every advertised destination.
- Final archive privacy manifests, required-reason APIs, covered-SDK signatures, permissions, entitlements, Xcode privacy report, and upload diagnostics reconcile with the SDK inventory.
- Release packet/DNS observation confirms the network allowlist and the preferred privacy claim.
- Dependency graph, SBOM, licenses, advisories, native frameworks, domains, and secrets have no unexplained release-critical issue.

## Accessibility and product truth

- Physical iPhone/iPad common-task evidence for every Accessibility Nutrition Label claim.
- Maximum Dynamic Type, VoiceOver, Voice Control, contrast, non-color state, reduced motion/transparency, orientation, iPad adaptation/keyboard, touch targets, and representative older-user purchase comprehension pass.
- Free and paid paths, included slot, same-set re-export, duplicate-as-new, deletion limits, and recovery never contradict copy or behavior.

## Store, legal, and public package

- Real operator/contact/domain values; live anonymous HTTPS Privacy, Terms, Support, FAQ, Contact, and Accessibility URLs; release-build links verified.
- Final App Privacy, age rating, accessibility labels, encryption/export answer, territories, and DSA declaration completed from the exact binary and founder facts.
- Professional legal review and final product-name/trademark clearance decision.
- Actual flattened iPhone/iPad screenshots and IAP screenshot match the submitted binary, current dimensions, localized fixture, and no-alpha rule.
- App Store metadata and reviewer notes describe only implemented behavior and no legal-certification/document-signing claim.

## Production fail-closed checks

Release is blocked by any placeholder, mock StoreKit path, fixture mode, debug endpoint, OTA channel, telemetry, hardcoded production price, secret, undeclared domain, high/critical unexplained advisory, unlicensed asset, unsupported format/destination, stale screenshot, or test represented as passed when not run.

The earlier source observations were locally corrected: the owned plugin/modules now resolve as an iOS pod with both Swift modules and their privacy manifest; complete file protection and backup exclusion are implemented; production storage fails closed behind a checksummed envelope with a checksum-valid prior generation; `appAccountToken` is optional; product/transaction validation, durable finish-pending recovery, and finish-last states are enforced; required-reason declarations are populated for source use; pending purchase/delete races are tested; unproved Copy, direct Photos, and SVG options are removed; ATS forbids arbitrary/local loads; production configuration rejects mock, fixture, identifier, URL, identity, territory, DSA, and credential placeholders; 16 opaque screenshot masters are present and distinct purchase fixtures plus the IAP review image are machine-checked. Archive inspection, final native screenshots, StoreKit sandbox, and physical-device proof remain release blockers because Windows source validation cannot certify the signed binary or Apple runtime behavior.

The final four-role repository audit must close every locally fixable defect before any production-readiness claim.

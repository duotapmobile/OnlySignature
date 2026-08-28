# Release Blockers

**Current release status:** NO-GO. Local implementation authority is granted; release authority is withheld.

The App Store Connect app, exact SKU, numeric app ID, U.S.-only availability, consumable record, internal group, and existing EAS project are live-verified. Remaining external gates are native artifacts, signing, IAP review image/metadata completion, tax/banking readiness, processed TestFlight visibility, device evidence, and later legal/submission authority.

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
- Professional legal review of the policies and Terms. The founder chose `Only Signature` without a trademark filing and accepts the documented preliminary name risk; do not claim legal clearance, and recheck exact App Store availability before submission.
- Actual flattened iPhone/iPad screenshots and IAP screenshot match the submitted binary, current dimensions, localized fixture, and no-alpha rule.
- App Store metadata and reviewer notes describe only implemented behavior and no legal-certification/document-signing claim.

## Production fail-closed checks

Release is blocked by any placeholder, mock StoreKit path, fixture mode, debug endpoint, OTA channel, telemetry, hardcoded production price, secret, undeclared domain, high/critical unexplained advisory, unlicensed asset, unsupported format/destination, stale screenshot, or test represented as passed when not run.

The earlier source observations were locally corrected: the owned plugin/modules now resolve as an iOS pod with both Swift modules and their privacy manifest; complete file protection and backup exclusion are implemented; production storage fails closed behind a checksummed envelope with a checksum-valid prior generation; `appAccountToken` is optional; product/transaction validation, durable finish-pending recovery, and finish-last states are enforced; required-reason declarations are populated for source use; pending purchase/delete races are tested; unproved Copy, direct Photos, and SVG options are removed; ATS forbids arbitrary/local loads; production configuration rejects mock, fixture, identifier, URL, identity, territory, DSA, and credential placeholders; 16 opaque screenshot masters are present and distinct purchase fixtures plus the IAP review image are machine-checked. Archive inspection, final native screenshots, StoreKit sandbox, and physical-device proof remain release blockers because Windows source validation cannot certify the signed binary or Apple runtime behavior.

The final four-role repository audit must close every locally fixable defect before any production-readiness claim.

## 2026-08-28 TestFlight execution gates

- **Closed — Expo identity and binding:** pinned CLI is authenticated as `duotap`; project readback is exactly `@duotap/onlysignature`, ID `954b1a21-89e9-41af-8021-d7c8e66d74c8`. Dynamic config and EAS profiles use that ID, both workflows pass pinned schema validation, and the existing GitHub integration base directory was changed to `/apps/mobile` and verified by live readback before dispatch.
- **Human gate — Apple authentication:** production signing requires the founder to complete Apple login/2FA for team `JWXC66G9Z5` in the EAS credential flow. Credentials and 2FA codes never enter chat or Git.
- **Closed credential input — App Store Connect API:** the team API key is stored outside Git with an owner-only ACL. Live API readback passed app/SKU/bundle, exact underscore consumable, U.S.-only app/IAP availability, future-territory opt-out, and internal group. The key is never committed or printed.
- **External evidence gate:** the new EAS simulator workflow must produce 16 native captures and the native-derived IAP image before any upload. Existing web-rendered masters are composition evidence only.
- **External evidence gate:** the internal-TestFlight workflow now blocks upload until the signed IPA passes bundle/team/product, provisioning, complete-data-protection, permission, privacy-manifest, OTA-module, framework, and secret-marker checks. The production build, inspection, App Store Connect processing, and TestFlight visibility have not yet occurred. App Review and public release remain explicitly unauthorized.

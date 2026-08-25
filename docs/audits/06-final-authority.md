# Final Four-Person Build Authority

**Product:** Only Signature  
**Authority date:** 2026-08-25  
**Roles represented:** Auditor A (Product, UX, Accessibility), Auditor B (Engineering, StoreKit, Security, Privacy), Auditor C (App Store, Legal Preparation, Website, ASO), and the Tenth Man (adversarial review)  
**Written authorities read in full:** `01-product-ux-accessibility.md`, `02-engineering-storekit-security.md`, `03-appstore-legal-aso.md`, `04-conference.md`, and `05-tenth-man.md`  
**Scope:** Final pre-implementation authority. This document records the four roles’ determinations; it does not claim implementation, a signed build, native testing, portal work, legal clearance, or release.

## Authority verdict

**UNANIMOUS GO FOR LOCAL IMPLEMENTATION. UNANIMOUS NO-GO FOR RELEASE.**

No role identified a P0 that requires abandoning or pausing the local build. Every P1 from the three independent audits and the adversarial review has an allowed disposition in this document. The Tenth Man’s new findings TM-16, TM-17, and TM-18 are accepted and locked into the implementation specification.

Implementation may proceed through all locally achievable phases: product code, native-module source, deterministic StoreKit fixtures, tests, website, legal-preparation drafts, ASO/store assets, EAS configuration, and release documentation. Implementation authority is not release certification. Release remains withheld until the exact signed binary, physical-device flows, StoreKit environment, public URLs, portal package, professional/founder inputs, and final repository audit supply the evidence enumerated below.

The governing product boundary remains:

> Create your signature and initials. Export them cleanly. Nothing else.

## Four-role determinations

### Auditor A — Product, UX, and Accessibility

Auditor A authorizes implementation because the product is narrow, the free path is substantive, the per-set model can be fair, and every identified P1 now has a locked behavior. Authority depends on state-aware signature/initials copy, a defined assistive-technology canvas contract, adaptive same-fixture comparison, truthful pre-purchase local-durability disclosure, visible purchase-recovery states, and withholding Accessibility Nutrition Label claims until complete physical-device common-task evidence exists.

### Auditor B — Engineering, StoreKit, Security, and Privacy

Auditor B authorizes Expo React Native with prebuild and EAS preparation on the Windows host. Windows is a valid implementation environment, not native iOS certification. Authority depends on compatible pinned versions, a proven StoreKit 2 boundary, frozen-snapshot finish-last fulfillment, protected and backup-excluded storage, bounded protected temporary files, an expiring local-only pasteboard, embedded production bundle, final-archive privacy authority, and strict separation between Windows tests, EAS compilation, and Apple-device evidence.

### Auditor C — App Store, Legal Preparation, Website, and ASO

Auditor C authorizes local implementation while withholding release for the signed archive, first consumable, public URLs, App Privacy and privacy-manifest validation, current store assets, legal identity, territories/DSA/export determinations, trademark clearance, and submission authorization. Consumer and store language must describe a signature image asset—not document signing, identity verification, certification, notarization, an audit trail, enforceability, or universal acceptance.

### Tenth Man — Adversarial authority

The Tenth Man authorizes only a conditional build and rejects release based on written controls alone. Commercial necessity remains an unproven launch hypothesis; the no-backend consumable model remains unforgiving; and native privacy, accessibility, transparency, storage, StoreKit, and App Review outcomes remain unproven. The fourth role adds three mandatory P1 corrections: destructive deletion cannot orphan a purchase, `appAccountToken` cannot be required for correctness, and protected-data-unavailable transaction delivery must remain queued and unfinished until protected storage is available.

## Final locked corrections from the Tenth Man

These corrections supersede any earlier wording that can be read more permissively.

### FA-01 — Delete All is blocked or deferred during purchase and recovery

`Delete All Saved Signatures` must not execute while any of these conditions exists:

- the system purchase sheet or an active StoreKit purchase request is in progress;
- a purchase is pending or deferred;
- a verified transaction has not yet been durably fulfilled and finished;
- an unfinished transaction is being reconciled;
- a purchase intent is in `recovery_required` or another unresolved recovery state;
- protected purchase data is unavailable because the device is locked or protection state has not become available.

The UI must explain in plain language that deletion is temporarily unavailable because a purchase is still being processed or recovered, that the user must not purchase the set again, and that deletion can be retried after resolution. The message is persistent while relevant and announced once to assistive technology.

The app retains only the minimum protected purchase-recovery journal and frozen snapshot necessary to resolve the outstanding transaction. It must not silently finish, discard, fabricate failure, or erase the recovery mapping merely to permit deletion. Once the transaction is cancelled, failed, durably fulfilled, or otherwise safely resolved, the user may invoke Delete All again; after confirmed deletion, the retained recovery material must be removed when no longer technically required. The privacy policy, Data and Storage screen, and deletion confirmation must disclose this narrow temporary retention.

Required verification: Delete All before the purchase sheet, while the sheet is visible, during pending/deferred, after verified callback before commit, during protected-data unavailability, during `recovery_required`, after relaunch, and after fulfillment. Assert that no unresolved paid transaction exposes a repurchase button, no necessary recovery artifact is deleted, no transaction is prematurely finished, and completed deletion removes all in-scope local content.

### FA-02 — `appAccountToken` is optional and never correctness-critical

The durable local purchase-intent journal and unique StoreKit transaction ID are the mandatory correlation mechanisms. Correct fulfillment and recovery must work with no `appAccountToken`.

An `appAccountToken` may be supplied only when all of the following are true:

1. the value is a syntactically valid, opaque, randomly generated UUID;
2. the selected StoreKit 2 bridge or owned native adapter explicitly supports passing and reading it without automatic transaction finishing or semantic loss;
3. native contract tests prove the UUID round-trips when Apple returns it;
4. current implementation/review documentation supports its use in this no-account flow; and
5. App Review notes describe its use accurately if it is used.

The token must never contain or derive from strokes, pixels, hashes, local labels, typed names, filenames, device identifiers, or stable personal identifiers. A local set ID must not be treated as Apple-endorsed user/account identity. The token may be a supporting correlation hint only. Absence, rejection, non-return, change, or mismatch must route through the durable journal and recovery rules; it must never by itself deny a verified purchase, select a different set, finish a transaction, or expose another purchase button. If the bridge cannot satisfy the contract, omit the token.

Required verification: adapter and StoreKit tests with a valid token, no token, invalid/non-UUID input rejected locally, token not returned, changed token, and duplicate callback. Inspect native source and transaction results. Prove every fulfillment decision remains correct without the token.

### FA-03 — Protected-data-unavailable delivery is queued and never finished

`NSFileProtectionComplete` can make the purchase journal and frozen snapshot unavailable while the device is locked. The launch StoreKit observer must treat this as a first-class recoverable condition.

When StoreKit emits a transaction and protected storage is unavailable, the app must:

1. verify only what can safely be verified through StoreKit;
2. queue/defer local delivery and reconciliation without treating it as success or failure;
3. not finish, discard, or mark the transaction fulfilled;
4. keep the affected purchase UI in a recovery state that blocks repurchase;
5. register for protected-data availability and retry idempotently after unlock;
6. re-read the durable journal and frozen snapshot, bind once, validate checksum/read-back, and only then finish;
7. rely on StoreKit’s unfinished redelivery if the process terminates before protected data becomes available; and
8. emit only coarse, local, non-sensitive diagnostic categories.

No in-memory queue is considered durable proof. If the process dies, the transaction remains unfinished and must be reconciled again at launch/unlock. Duplicate update, unlock notification, resume, and replay events must converge on exactly one fulfillment and one safe finish.

Required verification: StoreKit Test/XCTest and physical-device cases with the device locked before launch, locked before callback, unlocked after callback, repeated unlock/resume notifications, duplicate delivery, low disk after unlock, and process termination before/after reconciliation. Assert exactly one fulfillment and no finish before protected durable read-back.

## Complete P0/P1 final disposition register

Only these disposition labels are authoritative: **fixed in specification**, **disproven with evidence**, **explicitly founder-gated**, and **defensibly excluded**. No P0 was reported.

### Auditor A P1s

| ID                                    | Final disposition            | Binding closure                                                                                                                                                                               |
| ------------------------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A-01 Canvas assistive interaction     | **fixed in specification**   | Named canvas, state, instructions, direct-interaction entry/exit where needed, safe escape, slot controls, and announcements are mandatory. Public claims require physical iPhone/iPad proof. |
| A-02 Slot-neutral copy gap            | **fixed in specification**   | Headings, confirmation, purchase support/scope, and success copy vary correctly for signature-only, initials-only, and both.                                                                  |
| A-03 Side-by-side/large-text conflict | **fixed in specification**   | Readable side-by-side by default; identical-geometry vertical stacking at accessibility text/compact width. No carousel or changed fixture.                                                   |
| A-04 Purchase durability clarity      | **fixed in specification**   | Local-only/deletion disclosure and fully visible free white-background action appear before StoreKit.                                                                                         |
| A-05 Purchase recovery UX             | **fixed in specification**   | Persistent accessible pending/checking/recovered/failure states, duplicate-tap prevention, no paid set routed back to paywall.                                                                |
| A-06 Accessibility claim truthfulness | **explicitly founder-gated** | Drafts remain unapproved. Publish only the claims proven for all common tasks on every supported device family and authorized in App Store Connect.                                           |

### Auditor B P1s

| ID                                        | Final disposition            | Binding closure                                                                                                                                                                                 |
| ----------------------------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ENG-01 Windows/iOS feasibility            | **disproven with evidence**  | EAS hosted macOS makes implementation/build preparation feasible from Windows. Signed archive and device evidence remain release conditions, not proof supplied by Windows.                     |
| ENG-02 Version compatibility              | **fixed in specification**   | Node 22.22.0, Expo SDK 57, React Native 0.86, React 19.2.3, exact compatible dependencies, lockfile, and Expo-managed installs.                                                                 |
| ENG-03 StoreKit bridge semantics          | **fixed in specification**   | Mandatory StoreKit 2 contract test; owned narrow native fallback; verified/unverified distinction, updates, unfinished, explicit finish, and production mock exclusion.                         |
| ENG-04 Consumable/global unlock           | **fixed in specification**   | One consumable per local set; no subscription, global premium, or misleading consumed-artwork Restore control.                                                                                  |
| ENG-05 Crash-safe purchase binding        | **fixed in specification**   | Frozen snapshot, durable journal, unique transaction, idempotent recovery, read-back, finish last, and FA-01 through FA-03.                                                                     |
| ENG-06 Included unclaimed slot            | **fixed in specification**   | Independent slots; one later fill included without StoreKit; finalized purchased slots immutable; edits duplicate into a new draft.                                                             |
| ENG-07 No-backend verification/refunds    | **fixed in specification**   | Accept only StoreKit-verified transactions; disclose lack of server refund telemetry; never delete art or create a repurchase loop from revocation.                                             |
| ENG-08 File protection/backup/atomicity   | **fixed in specification**   | Owned protected, backup-excluded, atomic storage with generations/checksum and protected-data recovery under FA-03.                                                                             |
| ENG-09 Clipboard/temp exposure            | **fixed in specification**   | Protected randomized temp files, cleanup journal, and owned local-only expiring image pasteboard.                                                                                               |
| ENG-10 Export truth                       | **fixed in specification**   | Transparent/white PNG and white JPEG are baseline; optional formats/destinations stay absent until their independent tests pass.                                                                |
| ENG-12 Production network behavior        | **fixed in specification**   | Embedded production bundle, OTA disabled, no telemetry/backend/remote assets, and final binary/network allowlist verification.                                                                  |
| ENG-13 Privacy manifests/required reasons | **explicitly founder-gated** | Inventory and manifest work is local; final signed archive, Xcode privacy report, SDK signature validation, and upload diagnostics control publication.                                         |
| ENG-16 Production release configuration   | **fixed in specification**   | Typed fail-closed configuration rejects placeholders, mock StoreKit, hardcoded production price, OTA, missing legal/identity values, and secrets.                                               |
| ENG-18 Native acceptance testing          | **explicitly founder-gated** | Local mocks/plans are required now; EAS/macOS, StoreKit, physical device, archive, privacy, performance, accessibility, and network checks remain explicitly not run until authorized/executed. |

### Auditor C P1s

| ID                                        | Final disposition            | Binding closure                                                                                                                                                             |
| ----------------------------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C-01 Xcode/iOS SDK minimum                | **explicitly founder-gated** | Pin an exact stable compliant EAS image and recheck Apple within 72 hours of production build; retain signed build/archive SDK evidence.                                    |
| C-02 First consumable submission          | **explicitly founder-gated** | Local metadata, fixture, screenshot, notes, and reviewer path are required; agreements, tax/banking, product record, sandbox, and portal submission need founder authority. |
| C-03 Consumable deletion/restoration      | **fixed in specification**   | No false Restore; pre-purchase deletion warning; unfinished recovery; FA-01 deletion interlock; exported files remain outside app deletion.                                 |
| C-04 Charge-loss risk                     | **fixed in specification**   | Early observer, verified transaction, unique binding, durable atomic fulfillment, finish last, humane recovery/redraw-without-recharge where safe.                          |
| C-05 App Privacy answer                   | **explicitly founder-gated** | “Data Not Collected” is conditional only; publication waits for exact archive, SDK inventory, privacy report, network observation, and portal review.                       |
| C-06 Required-reason APIs/SDK manifests   | **explicitly founder-gated** | Declare actual reasons locally; authoritative final archive/report/signature/upload validation requires the Apple environment.                                              |
| C-07 Public privacy/support URLs          | **explicitly founder-gated** | Complete local pages now; public HTTPS deployment and real identity/contact/domain values require founder authorization and anonymous verification.                         |
| C-08 Content contradictions               | **fixed in specification**   | One content authority and drift tests cover purchase scope, deletion, privacy, format truth, legal limits, and localized StoreKit price.                                    |
| C-09 Misuse/legal-certification risk      | **fixed in specification**   | Asset-only product; authorized-use prohibition; no verification/notary/certificate/audit/enforceability/acceptance claims.                                                  |
| C-10 Working-name risk                    | **explicitly founder-gated** | Centralize the working brand; final professional clearance, founder decision, and App Store reservation are external.                                                       |
| C-11 EU DSA/territories                   | **explicitly founder-gated** | Territory configuration fails closed; EU requires trader decision, verified public contact details, and explicit territory authorization.                                   |
| C-12 Export compliance                    | **explicitly founder-gated** | Final archive/dependency facts determine the answer; specialist input/documentation if needed; never guess.                                                                 |
| C-13 Accessibility Nutrition Labels       | **explicitly founder-gated** | Implementation remains mandatory, but publication requires device-family common-task evidence and portal authority.                                                         |
| C-14 Screenshots/App Preview assets       | **explicitly founder-gated** | Build deterministic sources locally; final actual-iOS capture/current-dimension/no-alpha verification is external. App Preview final capture remains optional.              |
| C-15 Prelaunch commercial viability proof | **defensibly excluded**      | Public evidence cannot prove viability and no metric will be fabricated. Launch, if authorized, is a measured hypothesis using privacy-safe App Store evidence.             |

### Tenth-Man P1s

| ID                                           | Final disposition            | Binding closure                                                                                                                                                                                                                            |
| -------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| TM-01 Product necessity                      | **defensibly excluded**      | Uniqueness or proven demand is not claimed. Preserve narrow differentiation and treat viability as a falsifiable launch hypothesis.                                                                                                        |
| TM-02 Per-set model fairness                 | **explicitly founder-gated** | Final $1.99/model approval requires founder authority after purchase-comprehension evidence; all disclosure/free-path/new-set/included-slot corrections are mandatory meanwhile.                                                           |
| TM-03 Privacy claim                          | **fixed in specification**   | Scope claim to automatic signature-content behavior, disclose handoffs and external contexts, remove hidden transmission, and withhold claim if release observation contradicts it.                                                        |
| TM-04 Purchase loss                          | **fixed in specification**   | Redundant frozen recovery state, finish-last, unresolved paid-state repurchase block, redraw-and-bind without recharge when the original snapshot is unrecoverable, and deliberate-uninstall restoration excluded with disclosure.         |
| TM-05 App Review rejection                   | **explicitly founder-gated** | Native utility/reviewer package is built locally; only review of the submitted version resolves acceptance. No approval guarantee.                                                                                                         |
| TM-06 Trademark/name risk                    | **explicitly founder-gated** | Working name only until professional clearance, founder decision, reservation, and shelf test. Contingency names are not treated as cleared.                                                                                               |
| TM-07 Misleading ASO/legal intent            | **fixed in specification**   | Metadata derives from live evidence and implemented features; no competitor terms, fabricated volume, document-signing implication, or legal-certification keywords. Search Ads research remains external if authorized.                   |
| TM-08 Screenshot truth/value                 | **explicitly founder-gated** | First-frame transparency value, actual identical-geometry UI, opaque flattened assets, small-size comprehension, and final iOS capture must pass before upload.                                                                            |
| TM-09 Older-user confusion                   | **fixed in specification**   | One dominant action, state-aware copy, large-text stacking, visible free route, deterministic navigation, safe Clear, format defaults, and decision-point disclosures are mandatory; representative usability remains a release condition. |
| TM-10 Transparent-export truth               | **fixed in specification**   | Pixel-proven transparent PNG is core; Files/Share first; Photos/Copy/SVG/PDF remain absent until destination/interoperability proof.                                                                                                       |
| TM-11 Free-competitor viability              | **defensibly excluded**      | Prelaunch commercial certainty is unavailable. Do not respond with subscriptions, ads, AI, accounts, or document scope; measure actual launch behavior if released.                                                                        |
| TM-12 No-backend limitation                  | **defensibly excluded**      | No cross-device/cloud artwork restoration or server ledger is intentionally shipped to preserve narrow privacy scope; disclose limits and revisit model if comprehension fails.                                                            |
| TM-13 Unauthorized-signature verification    | **defensibly excluded**      | Identity/authority verification is intentionally absent; proportionate first-create/Create New acknowledgment and Terms prohibitions are mandatory.                                                                                        |
| TM-14 Windows completion challenge           | **disproven with evidence**  | Windows plus EAS is a feasible implementation path. Full working-iOS/release claims remain unavailable until signed/native execution.                                                                                                      |
| TM-15 Hidden external dependencies           | **fixed in specification**   | Inventory and audit runtime/build/system dependencies; OTA/dev/telemetry excluded; SBOM, native archive, domains, secrets, manifests, and packet behavior must reconcile.                                                                  |
| TM-16 Delete All during in-flight purchase   | **fixed in specification**   | FA-01 controls: deletion is blocked/deferred throughout active, pending, unfinished, protected-unavailable, and recovery states.                                                                                                           |
| TM-17 Optional correlation token             | **fixed in specification**   | FA-02 controls: valid opaque UUID only when bridge/API proof exists; optional supporting hint; never required for correctness.                                                                                                             |
| TM-18 File protection versus launch delivery | **fixed in specification**   | FA-03 controls: queue/defer without finishing, wait for protected storage, retry idempotently, and fulfill exactly once after read-back.                                                                                                   |

## Release authority withholding conditions

Release remains a no-go until all applicable conditions have current, retained evidence:

1. A signed EAS iOS archive uses an exact stable Xcode image satisfying Apple’s then-current SDK rule; archive metadata and build logs are retained.
2. The StoreKit bridge contract passes native inspection and StoreKit Test/XCTest, including unverified rejection, valid/absent token, success, cancellation, pending, deferred, offline, duplicate update, interruption, refund/revocation, and explicit finish.
3. Fault injection proves frozen-snapshot durability, low-disk/corruption handling, unmatched verified recovery without repurchase, redraw-and-bind where needed, FA-01 Delete All safety, and FA-03 locked-device delivery.
4. Physical iPhone/iPad tests prove drawing, orientation, performance, file protection, backup exclusion, temp cleanup, pasteboard behavior, app-switcher cover, and every advertised export destination.
5. Automated pixel tests and destination re-import prove transparent alpha, visible strokes, crop/padding, no white rectangle/halo/checkerboard, and truthful white PNG/JPEG behavior.
6. VoiceOver, Voice Control, Larger Text, contrast, non-color differentiation, Reduce Transparency, Increase Contrast, Reduced Motion, Voice Control labels, iPad keyboard/adaptation, and older-user task flows pass before corresponding public claims.
7. The final archive’s privacy manifests, required-reason APIs, SDK signatures, permissions, entitlements, Xcode privacy report, upload diagnostics, SBOM, licenses, advisories, secrets, bundled domains, and release packet/DNS behavior reconcile with policy and App Privacy.
8. Production configuration contains real StoreKit only, localized `displayPrice`, no mock/fixture mode, no hardcoded production `$1.99`, no placeholder identity/URLs, OTA disabled, no telemetry, and no secrets.
9. Privacy, Terms, support, FAQ, contact, accessibility, and marketing pages are live over anonymous-accessible HTTPS with real operator/contact facts, accurate host/support disclosures, and working in-app links.
10. Final legal/trademark review, product name decision/reservation, legal operator identity, territory selection, DSA status where relevant, and export-compliance determination are complete.
11. Paid Applications Agreement, tax/banking, roles, app record, bundle ID/SKU, consumable record/localization/price/availability, sandbox evidence, IAP review screenshot/notes, age rating, App Privacy, and authorized accessibility answers are complete.
12. Actual flattened iPhone/iPad screenshots match the exact submitted UI and current specifications. The IAP screenshot shows the offer and free path. No asset implies document upload, unsupported format, legal certification, or universal acceptance.
13. Purchase-comprehension testing verifies exact set scope, free route, no subscription, included slot, changed-set charge, same-set re-export, and app-deletion limitation. Material failure returns the price/model to founder decision.
14. The final four-role repository audit finds no specification drift, purchase-loss path, misleading privacy/paywall/legal claim, hidden network/dependency, vulnerable or unlicensed critical asset, stale store asset, mock production behavior, placeholder, secret, or unexecuted test represented as passed.

## Finite external founder inputs

Only these genuinely external matters may remain after local work:

1. Final legal operator/entity name.
2. Legal/public mailing address and any required public phone number.
3. Support email and authorized support contact details.
4. Final domain, host choice, and public HTTPS deployment authorization.
5. Final product-name decision after professional trademark/common-law/domain/social/international clearance.
6. Apple Team ID, final bundle identifier, SKU, and app-record creation/reservation authorization.
7. App Store Connect roles/credentials or approved API-key access and signing/EAS Apple credential authorization.
8. Paid Applications Agreement, tax, and banking completion.
9. Final StoreKit product identifier and explicit approval of the planned U.S. $1.99 price/per-set model.
10. Final territory selection.
11. DSA trader/non-trader decision, public contact data, and verification documents if EU distribution is selected.
12. Final professional legal review of Privacy Policy, Terms, authorized-use language, regional disclosures, purchase framing, and Standard EULA decision.
13. Final export-compliance determination or specialist input if the archive contains non-exempt/non-standard encryption.
14. Physical iPhone/iPad, StoreKit sandbox, TestFlight, archive/privacy-report, and App Review access/authorization.
15. Website deployment authorization.
16. TestFlight, App Store submission, phased/manual/automatic release, and production-release authorization.

Missing founder values do not pause unrelated local work. Production configuration fails closed at the exact boundary.

## Stop rules

The implementation team must stop the affected action—but continue unrelated local work—when any of these conditions occurs:

- The workspace ceases to be isolated or a destructive target cannot be resolved safely.
- A requested step would create/push a remote, deploy publicly, change App Store Connect, sign/submit a build, start TestFlight, purchase a domain/service, or use founder/legal credentials without explicit authority.
- A production build contains placeholder identity/URLs, mock StoreKit, fixture data, debug endpoints, OTA configuration, hardcoded purchase price, telemetry, secrets, or an unexplained external domain.
- StoreKit verification semantics, explicit finish, unfinished updates, transaction uniqueness, or the durable journal cannot be proven. The team must use the owned narrow native fallback or withhold that release path.
- Any code can finish a transaction before durable set binding/read-back, enable repurchase during unresolved delivery, delete required recovery state, require `appAccountToken` for correctness, or finish while protected storage is unavailable.
- Delete All is invoked during an active, pending, deferred, unfinished, protected-unavailable, or recovery-required purchase state. The deletion is blocked/deferred under FA-01.
- A format or destination fails its pixel, alpha, bounds, metadata, interoperability, permission, privacy, or device test. Hide it and remove every claim rather than ship an unsupported option.
- A privacy, accessibility, legal, trademark, commercial, sandbox, TestFlight, App Review, signed-build, or deployment claim lacks the corresponding current evidence. Report it as unverified or founder-gated.
- App Privacy, required-reason API, SDK signature/manifest, export-compliance, age-rating, DSA, territory, or Accessibility Nutrition Label facts cannot be reconciled with the exact binary. Withhold submission.
- Representative purchase-comprehension testing shows users materially misunderstand recurring payment, per-set scope, included slot, new-set charge, free path, or deletion. Return the model/price to the founder before release.
- A high/critical dependency vulnerability, unlicensed asset, undeclared network behavior, secret, or materially misleading store/legal copy remains unresolved. Withhold release.

## Final authority statement

All four roles grant **implementation authority** under the locked corrections and dispositions above. All four roles withhold **release authority**.

The build team may proceed without further product clarification. It may not weaken the free route, add a backend/account/subscription/document workflow, replace durable fulfillment with a Boolean, rely on an optional StoreKit token, erase unresolved purchase recovery state, or turn written controls into claims of native proof.

**Final verdict: BUILD GO. RELEASE NO-GO UNTIL EVIDENCED.**

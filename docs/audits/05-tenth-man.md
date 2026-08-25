# Tenth-Man Adversarial Review

**Product:** Only Signature  
**Review date:** 2026-08-25  
**Role:** Independent adversarial fourth reviewer  
**Inputs read in full:** the controlling build contract and `docs/audits/01-product-ux-accessibility.md` through `04-conference.md`  
**Method:** assume the conference consensus is wrong; seek failure modes rather than confirm its conclusions  
**Scope limit:** this is a pre-implementation challenge. No completed app, signed archive, StoreKit sandbox run, production network capture, final screenshots, or physical-device usability evidence existed when this report was written. A specification-level correction is not implementation evidence.

## Adversarial conclusion

The consensus has **not** proven that Only Signature is necessary, commercially viable, easy for older adults, recoverable after every paid edge case, or acceptable to App Review. It has shown only that a narrow implementation is plausible and that many risks have a proposed control.

The most dangerous unresolved tension is this:

> The product sells a repeat-purchasable consumable, promises repeated use of the purchased set, intentionally has no account or server, and stores the only reconstructible artwork locally.

That combination is possible, but it is unforgiving. A finished consumable cannot recreate deleted art; an unmatched verified transaction can become a customer-support dead end; a user can understand “one-time purchase” as more durable than the architecture delivers; and Apple-device evidence cannot be produced from the Windows host alone. The free path, pre-purchase deletion disclosure, crash-safe finish-last journal, unresolved-transaction recovery UI, and strict release gates are therefore product obligations, not polish.

**Adversarial verdict: CONDITIONAL BUILD, NO RELEASE AUTHORITY.** No P0 makes local implementation irrational or unsafe. The P1 items in this report must be implemented or remain explicit release/founder gates. In particular, the release must not proceed while a pending purchase can be deleted out from under StoreKit, while an unmatched verified consumable has no humane recovery path, while purchase comprehension is untested, or while transparency/privacy/accessibility claims rest only on Windows tests.

## Severity and disposition language

- **P0:** implementation must stop because safe or lawful delivery cannot reasonably be achieved.
- **P1:** release-critical purchase, privacy, rejection, legal, accessibility, or material fairness risk.
- **P2:** material conversion/usability risk with a workable fallback.
- **P3:** optimization or operational improvement.
- **Fixed in specification:** a concrete behavior is now mandatory, but still requires implementation evidence.
- **Disproven with evidence:** current authoritative evidence defeats the proposed blocker.
- **Founder-gated:** an external decision, identity, credential, legal review, portal action, or physical Apple environment is required.
- **Defensibly excluded:** the capability or claim is deliberately omitted and the limitation is disclosed.

## Current evidence considered

Primary and live sources were checked on 2026-08-25:

1. [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) — completeness, accurate metadata, visible IAPs, responsibility for third-party SDKs, copycat rules, and minimum functionality.
2. [Apple In-App Purchase Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/in-app-purchase) — consumables deplete and can be purchased again; non-consumables are persistent feature purchases.
3. [Apple, offering, completing, and restoring in-app purchases](https://developer.apple.com/documentation/storekit/offering-completing-and-restoring-in-app-purchases) — unfinished transactions remain queued; delivery must precede finishing; restore examples apply to restorable products.
4. [Apple `appAccountToken`](https://developer.apple.com/documentation/storekit/transaction/appaccounttoken) — the token is described as a UUID associating a transaction with a user on the developer's service, which is not this app's no-account architecture.
5. [Apple, Submit an In-App Purchase](https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/submit-an-in-app-purchase/) — the first consumable must accompany a new app version.
6. [USPTO comprehensive clearance guidance](https://www.uspto.gov/trademarks/search/comprehensive-clearance-search-similar-trademarks) and [likelihood of confusion](https://www.uspto.gov/trademarks/search/likelihood-confusion) — an exact-name web search is not a clearance search; similar sound, appearance, meaning, commercial impression, and related goods matter.
7. Live U.S. App Store evidence: [Signature generator & maker](https://apps.apple.com/us/app/signature-generator-maker/id6446936588) advertises transparent PNG and includes a public review praising its free/no-subscription behavior; [Signature AI](https://apps.apple.com/us/app/signature-ai/id6780077495) advertises transparent PNG/SVG, no login, no tracking, and a one-time-purchase proposition. These listings prove competing claims exist, not downloads, revenue, or market share.

The three independent audits and conference are evidence of considered design intent. They are not evidence that code, native behavior, customer comprehension, trademark clearance, or App Review acceptance exists.

## Challenge 1 — The product may be unnecessary

**Evidence:** Transparent signature export already exists in free and low-cost App Store utilities. The live listing for Signature generator & maker advertises transparent PNG and has a review specifically praising that the feature stayed free and did not require a subscription. Signature AI markets transparent PNG/SVG, no login, and one-time purchases. The conference itself concedes that transparent PNG, no subscription, and on-device positioning are not individually unique. No public evidence establishes demand for a separate per-set signature-plus-initials product.

**Severity:** P1 commercial risk, not a safety or implementation blocker.

**Disposition:** **Defensibly excluded as a prelaunch proof obligation.** Commercial viability cannot be proven from public ratings or fabricated keyword volume. It can only be treated as a falsifiable launch hypothesis.

**Required correction:** Never describe the product as unique, proven, demanded, or category-defining. Keep the app small and make the differentiated bundle explicit: no document upload, paired signature and initials, understandable white-box comparison, useful free export, older-adult-friendly flow, and a scoped non-subscription purchase. Do not expand into document signing to manufacture differentiation.

**Verification method:** Complete the required 20-result matrix and review sample; run task-based usability/comprehension sessions before submission; after launch, evaluate App Store product-page views, downloads, IAP units, refunds, ratings/reviews, and PPO without invented benchmarks. If users consistently select free competitors or do not understand the paired-set value, treat that as a product signal rather than an ASO copy problem.

## Challenge 2 — The per-set pay model may feel exploitative

**Evidence:** A user can draw a nearly identical replacement and be asked to purchase again because the strokes changed, while competing apps advertise free transparent export or one-time-purchase propositions. The purchased set is durable only while local app data survives, yet “No subscription” and “Re-export this set anytime” can sound like a conventional permanent unlock. “Professional Export” may also imply that the free high-quality export is unprofessional rather than simply white-backed.

**Severity:** P1 fairness and consumer-expectation risk.

**Disposition:** **Founder-gated** on final price/model approval and **fixed in specification** for disclosure and flow. The $1.99 plan is not authorized by this audit merely because it is low in absolute terms.

**Required correction:** Before payment, show the localized price, exact current set, included unused slot, no-subscription statement, same-set re-export right, change/new-set consequence, visible free path, and local-deletion limitation in plain language. Keep “Transparent” objective and make “Professional Export” subordinate or remove it if testing suggests a quality hierarchy. Before “Duplicate as New Draft,” state that transparent export of the changed version requires a new purchase. Never charge when filling the included slot.

**Verification method:** Moderated comprehension testing must establish that users can accurately explain all six facts: what is bought, what is free, whether payment repeats, what counts as a new set, that the second slot is included, and what deletion does. Record disagreement and abandonment, not just successful taps. Review refund complaints after launch. A material comprehension failure requires founder reconsideration of price/model or copy before release.

## Challenge 3 — The privacy claim may be misleading

**Evidence:** “Created on your device. We do not upload it.” is true only about automatic signature-content transmission by the production binary. StoreKit communicates with Apple; the app opens external sites; user-selected Files, Photos, email, AirDrop, clipboard, or share extensions may store or transmit the asset; the website host receives ordinary request logs; support can receive volunteered attachments; Expo/EAS receives source at build time; and native dependencies can transmit data despite the absence of an app-level `fetch` call. A privacy manifest describes declared behavior but is not a packet capture.

**Severity:** P1 trust, App Privacy, and review risk.

**Disposition:** **Fixed in specification** with a **release gate** on the final binary.

**Required correction:** Scope every claim to automatic app behavior and signature content. Explain the handoff boundary at export. Separate app, Apple purchase, website, support, build-service, and user-selected destination behavior in the policy. Disable production OTA updates and remove analytics, crash upload, remote logs, remote assets, WebViews, and developer APIs. If final observation finds any undeclared runtime transmission, change the claim and App Privacy answer before release.

**Verification method:** Inspect final archive dependencies/manifests and generated configuration; scan source and bundle for domains/network APIs; observe packet and DNS traffic on a release build during fresh launch, draw, preview, local export, relaunch, and Settings; then separately exercise StoreKit, external links, and share destinations. Reconcile results against policy, App Privacy, SDK inventory, and marketing copy.

## Challenge 4 — A purchase could be lost

**Evidence:** Apple's StoreKit guidance says unfinished transactions remain queued and content must be delivered before finishing. That protects only unfinished transactions. Once a consumable is finished, StoreKit is not a reconstruction service for the local strokes. Before finishing, a verified transaction can still be unmatched if its prepared journal or frozen snapshot is corrupt, deleted, or unavailable. Apple's `appAccountToken` documentation describes association with a user on the developer's service; this app has no user or service, so the optional token cannot be assumed to solve correlation. After finishing, app deletion or storage corruption can remove the re-exportable set permanently.

**Severity:** P1 purchase-loss and duplicate-charge risk.

**Disposition:** **Fixed in specification** for crash-safe fulfillment; **defensibly excluded** for restoration after deliberate app deletion, with conspicuous disclosure.

**Required correction:** Persist redundant recoverable generations of the prepared intent and frozen artwork before StoreKit; use a unique transaction constraint; never auto-finish; verify product, environment, transaction, and safe correlation; bind and read back durably before finish. An unmatched verified transaction must enter a visible `recovery_required` state that disables repurchase. If the frozen asset cannot be recovered, let the user redraw and bind that drawing to the outstanding verified transaction without another charge, then finish only after durable fulfillment. Do not rely on `appAccountToken` unless the selected bridge and current Apple guidance support the exact use. Do not promise restoration after uninstall.

**Verification method:** Fault-inject process termination, locked protected data, low disk, corrupt current/prior generations, missing token, duplicate callback, deleted draft, and app relaunch at every state transition. In StoreKit Test and sandbox, prove that an unresolved paid transaction never exposes another purchase button, can be fulfilled once, and is finished only after read-back. Reinstall must show the documented limitation without a false Restore control.

## Challenge 5 — App Review could reject the app

**Evidence:** Apple Guideline 4.2 allows rejection where an app lacks adequate utility or is not particularly useful, unique, or app-like. Guideline 2.1 requires a complete, on-device-tested build with functional IAP and URLs. Guidelines 2.3 and 3.1 make accurate metadata and clear IAP behavior material. The product is narrower than many signature tools and its first consumable must be reviewed with the first version. The conference's architectural plausibility does not bind App Review.

**Severity:** P1 release risk.

**Disposition:** **Not disproven; founder/submission-gated.** No one can guarantee review acceptance.

**Required correction:** Demonstrate native utility beyond a web wrapper: high-quality capture, paired slots, persistent saved sets, matched comparison, free exports, independent formats, and reusable purchased sets. Make the IAP visible and fully testable; provide a sub-three-minute reviewer path; deploy complete HTTPS privacy/support pages; keep all metadata/screenshots accurate; and explain the asset-only scope, deletion behavior, free route, and no-account model in review notes.

**Verification method:** Run the reviewer checklist on the exact signed build and sandbox product; validate public URLs anonymously; compare metadata and screenshots to the binary; submit the first consumable with the version; retain App Review correspondence. Only approval disproves the rejection outcome for that submitted version.

## Challenge 6 — The working name may create trademark risk

**Evidence:** The earlier exact-name search found no proven exact U.S. App Store conflict, but that is weak negative evidence. USPTO guidance requires searching confusingly similar marks and related goods/services across federal, state, and common-law sources. “Only Signature” is descriptive/suggestive of a signature-only utility, which may make protection narrow. App Store availability and domain/social availability are mutable. Similarity does not require an exact match.

**Severity:** P1 legal, rebrand-cost, and App Store-record risk.

**Disposition:** **Founder/professional-gated.** The name remains a working name; it is neither cleared nor condemned by this audit.

**Required correction:** Centralize every brand string and asset. Complete federal exact/similar/coordinated-class, state, common-law, App Store, domain, social, WIPO/EUIPO/TMview, and relevant trade-dress searches immediately before app-record creation. Obtain legal review. Keep three unvetted contingency directions ready—`Signature Layer`, `Clear Signature Asset`, and `No-Box Signature`—without treating any as cleared alternatives.

**Verification method:** Dated search records with candidate-by-candidate analysis of goods/services and commercial impression; counsel/founder decision; confirmed App Store name reservation; final icon shelf test. A search-engine miss is not verification.

## Challenge 7 — The ASO plan may be generic

**Evidence:** `signature`, `signature maker`, `transparent PNG`, `no login`, and `no subscription` appear in competing listings. `Transparent Signature Export` repeats a title term and describes a capability competitors also claim. No public keyword-volume, conversion, or retention data exists. Searches centered on `digital signature` or `e-signature` may attract users who expect cryptography or document signing, creating low-intent traffic and legal ambiguity.

**Severity:** P2 conversion risk; P1 if metadata misrepresents document-signing or legal capability.

**Disposition:** **Fixed in specification** for evidence discipline; Apple Ads popularity remains **founder-gated**.

**Required correction:** Build metadata from the live competitor matrix and keyword map, not intuition. Emphasize the combined job: signature plus initials, transparent background, no document upload, no cropping, and per-set/no-subscription scope. Exclude competitor names and ambiguous legal-certification terms. Do not lock the subtitle until duplication, byte limits, relevance, and live listing density are checked.

**Verification method:** Validate every field against current App Store limits and actual features; document observed competitor usage; run Apple Search Ads research only if authorized; use App Store Connect acquisition/PPO evidence after launch. Do not assign invented volume or conversion scores.

## Challenge 8 — The screenshots may fail to communicate value

**Evidence:** No final implemented UI or iOS capture existed for this review. The proposed first screenshot, “Your Signature and Initials,” states category rather than the white-box problem. A two-document comparison can become illegibly small on a phone screenshot. “We Do Not Upload Your Signature” is a qualified claim that can crowd a visual. A text-heavy icon direction is especially likely to become unreadable at search-result size.

**Severity:** P1 truth/review risk and P2 conversion risk.

**Disposition:** **Fixed in specification** with a final Apple-environment capture gate.

**Required correction:** Make screenshot one communicate transparent-export value visibly, not through fine print. At actual display size, prove the same-fixture obstruction is obvious but realistic and that both documents/drawings have identical geometry. Use only actual UI and supported destinations/formats. Flatten files with no alpha. Select the no-text icon fallback if integrated wording fails small-size testing. Do not show `$1.99` outside the explicitly controlled U.S. fixture.

**Verification method:** Actual-size shelf and first-three comprehension tests; automated dimension/mode/alpha checks; source-to-flattened hashes; side-by-side geometry/pixel assertions; final iPhone/iPad capture against the submitted build; a five-second test asking users what the app does and what costs money.

## Challenge 9 — Older users may become confused

**Evidence:** The flow combines two slots, an optional included slot, a paid-versus-free background distinction, immutable purchased sets, duplication as a new paid draft, independent format menus, local deletion limitations, and no Undo. “Transparency,” “PNG,” and `alpha` are unfamiliar concepts. The audits contain no moderated usability evidence, and age alone is not a persona. A 44-point hit target does not establish comprehension.

**Severity:** P1 core-flow and purchase-fairness risk.

**Disposition:** **Fixed in specification** with a release gate on representative usability and physical-device accessibility testing.

**Required correction:** Keep one dominant action, state-aware headings, visible Back, plain format labels, a fully visible free action, safe Clear confirmation, text-first saved-set cards, and explicit outcomes for Done/Create New/Delete. Default purchased export to `PNG, Transparent` and free export to `PNG, White Background`. At large text, stack the comparison rather than shrink it. Explain included-slot and deletion behavior at the decision point, not only in FAQ.

**Verification method:** Task-based walkthroughs with first-time iPhone users, low-vision users, reduced fine-motor precision, privacy-conscious users, and rushed users. Record wrong-path taps, requests for document upload, beliefs about subscription/global unlock, failed Back behavior, accidental Clear, and inability to find free export. Repeat at maximum Dynamic Type and with VoiceOver/Voice Control on physical iPhone and iPad before claiming support.

## Challenge 10 — The export may not be truly transparent

**Evidence:** A transparent-looking preview can still contain an opaque rectangle, white halo, embedded checkerboard, incorrect crop, or a destination that composites/removes alpha. Windows pixel tests can validate generated bytes but not prove behavior through iOS Files, Share, AirDrop, Copy, Photos, Quick Look, or third-party extensions. PDF and SVG add independent rendering and metadata risks.

**Severity:** P1 core product truth risk.

**Disposition:** **Fixed in specification** for transparent PNG; unsupported formats/destinations are **defensibly excluded** until proven.

**Required correction:** Launch with transparent PNG, white PNG, and white JPEG only unless each optional format passes its own gate. Render offscreen from canonical vector points; clear transparent surfaces to RGBA zero; use tight crop with proportional padding; test for halo and embedded patterns. Make Files/system Share the primary transparent route. Hide Photos, Copy, SVG, and PDF claims until physical-device/interoperability evidence exists.

**Verification method:** Decode output pixels and assert transparent exterior, visible strokes, tight bounds, padding, no opaque white rectangle, and no checkerboard. Re-import the exact file after every advertised iOS destination and inspect alpha. Compare source and destination hashes where the destination preserves bytes. Test edge-touching, dots, multiple strokes, portrait/landscape, long signatures, and tiny initials.

## Challenge 11 — Free competitors may make the product nonviable

**Evidence:** A live competitor explicitly advertises transparent PNG and has a user praising its free/no-subscription behavior. Another advertises transparent PNG/SVG and no login. This directly attacks the proposed paid feature. Ratings are only a demand proxy and cannot establish competitor revenue or user quality, but the price objection is real.

**Severity:** P1 business-model risk.

**Disposition:** **Defensibly excluded as a prelaunch certainty;** the product may launch only as a measured hypothesis, not a proven business.

**Required correction:** Compete on the full experience rather than claiming transparency is scarce: paired slots, faithful drawing, no document intake, no cropping, accurate comparison, useful free output, strong local privacy, and older-adult clarity. Keep operating scope and dependency cost low. Do not add ads, subscriptions, AI, accounts, or document workflows as a panic response.

**Verification method:** Current competitor/review refresh immediately before metadata lock; after launch, monitor App Store product-page conversion, IAP units/refunds, review language, and support contacts. Define in the measurement plan what evidence would trigger copy, onboarding, pricing, or product-model review without fabricating target lifts.

## Challenge 12 — The no-backend architecture may be an unacceptable limitation

**Evidence:** No backend means no cross-device art recovery, no server-side transaction-to-set ledger, no near-real-time refund notifications, no remote corruption recovery, and limited support diagnosis. The architecture intentionally excludes iCloud backup for reusable signatures. Apple's StoreKit verification can validate a transaction locally, but it cannot recreate stroke content or determine which deleted artwork the founder should restore.

**Severity:** P1 durability/support limitation.

**Disposition:** **Defensibly excluded** to preserve the privacy promise and narrow scope, but only with truthful purchase framing and recovery controls.

**Required correction:** Frame the purchase as local finalization and reusable export for the saved set, not an account entitlement. Make deletion consequences visible before payment. Provide robust unfinished-transaction recovery and voluntary privacy-safe diagnostics. Do not claim cross-device access, cloud backup, or restoration. If user comprehension testing shows that customers reasonably expect cloud durability despite the disclosure, the founder must revisit either the purchase model or the no-backend boundary before release.

**Verification method:** Purchase comprehension tests; app deletion/reinstall tests; corrupt-storage recovery tests; sandbox refund/revocation tests; support playbook dry run for “charged but set missing.” Confirm that support can give an honest next step without requesting signature content.

## Challenge 13 — The app could be misused to imitate another person's signature

**Evidence:** The app accepts arbitrary strokes, stores a reusable transparent image, and intentionally performs no identity or authorization verification. Terms alone do not prevent misuse. The product can lower friction for placing a copied mark into another app even though it never edits documents itself.

**Severity:** P1 legal/reputation/abuse risk; not technically eliminable without contradicting privacy and scope.

**Disposition:** **Defensibly excluded** as a verification capability, with mandatory proportionate guardrails.

**Required correction:** State visibly and concisely at first creation and Create New: “Use only a signature you are authorized to use.” Terms must prohibit forgery, impersonation, fraud, unauthorized signature use, misrepresentation, and illegal alteration. Never claim identity verification, authenticity, certification, or legal acceptance. Do not collect identity documents or introduce an account merely to create weak theater of verification.

**Verification method:** Copy scan across app, site, legal pages, metadata, screenshots, preview, and review notes; usability test that the acknowledgment is understood without being mistaken for certification; legal review of authorized-use language. Verify no document-import or placement workflow exists.

## Challenge 14 — The project cannot be completed from Windows

**Evidence:** Windows can implement TypeScript, native source, website, fixtures, tests, Expo prebuild, and EAS configuration. It cannot locally run Xcode, iOS Simulator, StoreKit Test, Xcode privacy reports, Instruments, or physical iOS accessibility/destination tests. Owned native modules for StoreKit, file protection/backup exclusion, pasteboard options, and app-switcher privacy cover are essential boundaries. EAS compilation proves compilation, not correct device behavior.

**Severity:** P1 schedule and truth-in-reporting risk.

**Disposition:** **Disproven as an implementation-path blocker; founder-gated as a complete working iOS/release claim.**

**Required correction:** Complete all Windows-achievable code, tests, native module sources, config plugins, StoreKit configuration, XCTest plans, and EAS profiles. Label native checks `NOT RUN — APPLE ENVIRONMENT REQUIRED` until executed. Do not declare the app “completely working,” signed, sandbox-tested, accessible, or release-ready from prebuild/web/mock success.

**Verification method:** Clean Windows gates and prebuild; then signed EAS build with retained Xcode image/log/archive metadata; StoreKit Test/XCTest; physical iPhone/iPad flows; privacy/archive inspection; performance and network observation. Report each layer separately.

## Challenge 15 — The final build may contain hidden external dependencies

**Evidence:** Expo/EAS is an external build service. StoreKit, App Store reports, website hosting, support email, OS share extensions, and user-selected cloud destinations are external systems. Native npm dependencies may include telemetry, update checks, remote assets, required-reason APIs, or transitive network code. ATS is not a domain allowlist. A source search for `fetch` cannot inspect linked frameworks or runtime behavior.

**Severity:** P1 privacy, supply-chain, and availability risk.

**Disposition:** **Fixed in specification** with a release-binary gate; necessary system dependencies are documented rather than denied.

**Required correction:** Inventory every direct/transitive runtime dependency, native framework, privacy manifest, permission, required-reason API, license, domain, and network behavior. Disable Expo Updates and development tooling in production; bundle fonts/assets; exclude analytics/crash/remote-config/cloud SDKs; protect EAS source uploads with `.easignore` and secret scanning. Describe Apple StoreKit and explicit user-selected destinations as allowed dependencies, not “no external dependencies.”

**Verification method:** Reproducible clean install, SBOM, license/advisory audit, native archive/framework enumeration, manifest validation, production bundle/domain scan, secret scan, and packet/DNS observation. Fail release on any unexplained high/critical vulnerability, undeclared domain, mock adapter, dev server, OTA channel, or telemetry path.

## Newly discovered P0/P1 issues

### TM-16 — Delete All can orphan an in-flight purchase

**Evidence:** The contract requires Delete All Local Data and also supports pending/deferred purchases that may complete later. The conference says Delete All removes drafts, purchased assets, previews, labels, temp files, and set preferences, while retaining only what is technically required. It does not explicitly define behavior when a prepared, pending, recovery-required, or unfinished transaction exists. Deleting the frozen set or journal while Apple still owns the transaction recreates the unmatched-purchase failure.

**Severity:** P1.

**Disposition:** **Fixed in specification.**

**Required correction:** Disable destructive data deletion while a StoreKit request is actively being presented. If a transaction is pending/deferred, explain that purchase resolution must complete before its protected recovery record can be removed. Delete ordinary saved content immediately when safe, but retain the minimum encrypted/protected purchase-recovery journal and frozen snapshot until the transaction is cancelled, failed, durably fulfilled, or otherwise safely resolved. Name that narrow retention in the confirmation, privacy policy, and data screen. Never silently finish simply to permit deletion.

**Verification method:** Exercise Delete All before system sheet, while sheet is visible, during pending/deferred, after verified callback before commit, in `recovery_required`, and after fulfillment. Assert no repurchase button for an unresolved paid transaction; all non-required data is deleted; the retained recovery record is removed as soon as resolution permits.

### TM-17 — The optional correlation token cannot be treated as a proven set identifier

**Evidence:** Apple's current `appAccountToken` documentation describes a UUID that associates a transaction with a user on the developer's service. Only Signature has neither an account nor a developer service. The conference wisely makes token use optional, but earlier implementation language risks using a local set UUID as if Apple had endorsed that semantic.

**Severity:** P1.

**Disposition:** **Fixed in specification** by refusing to depend on it; final use is **Apple-review/implementation-gated**.

**Required correction:** Make the local durable intent journal and unique transaction ID the primary correlation mechanism. Do not put artwork hashes, labels, filenames, or stable personal identifiers in StoreKit metadata. Use an opaque token only after native contract testing and documented confirmation that the selected API/bridge accepts the no-account association; otherwise omit it. Recovery must still work when the token is absent.

**Verification method:** Adapter contract tests with token present, absent, changed, and not returned; native source inspection; StoreKit Test and sandbox transaction inspection; App Review notes that accurately describe any token. Prove no fulfillment decision relies solely on the token.

### TM-18 — File protection can collide with launch-time StoreKit delivery

**Evidence:** The chosen `NSFileProtectionComplete` state can make recovery files unavailable while the device is locked, while StoreKit transaction observation begins at launch and may emit unfinished transactions. The conference says to leave a transaction unfinished until unlock, but no implementation exists yet to prove that the observer remains alive and reconciliation is retried exactly once.

**Severity:** P1.

**Disposition:** **Fixed in specification.**

**Required correction:** Treat protected-data-unavailable as a first-class recoverable state. Do not finish, discard, or mark failure. Register for protected-data availability, retry the durable reconciliation idempotently after unlock, and keep the purchase UI from inviting another transaction. Emit only coarse local diagnostics.

**Verification method:** StoreKit Test/XCTest and physical-device runs with the device locked before launch/resume and unlocked after callback delivery; duplicate callback and process-kill variants; assert exactly one fulfillment and finish after protected durable read-back.

## Adversarial release conditions

Implementation may proceed, but this fourth reviewer withholds release authority until all of the following are evidenced:

1. Purchase comprehension confirms per-set scope, free alternative, included slot, new-set charge, and deletion limitation.
2. Fault injection and StoreKit Test/sandbox prove finish-last fulfillment, unmatched-transaction recovery without repurchase, and Delete All safety during pending states.
3. A signed release archive and physical devices prove native storage protection, backup exclusion, pasteboard behavior, app-switcher cover, alpha preservation, accessibility, orientation, and performance.
4. Release-binary archive/network audits support the privacy claim and provisional App Privacy answer.
5. App Review assets, public URLs, IAP record, screenshot/IAP screenshot, and reviewer path match the exact submitted binary.
6. The working name, operator identity, territories, DSA status where applicable, export-compliance answer, Terms, and privacy policy receive the required founder/professional completion.
7. Competitor and ASO artifacts make no unsupported uniqueness, demand, keyword-volume, conversion, or legal-signature claim.

## Final adversarial verdict

**CONDITIONAL BUILD — NO-GO FOR RELEASE.**

Only Signature remains worth implementing as a deliberately small experiment, not as a proven market need. The conference was correct that Windows plus EAS is a viable build path and that a backend is not technically mandatory. It was too generous wherever it treated a written control as closure. The pay model, no-backend durability, custom native boundaries, privacy claim, transparency promise, accessibility, screenshots, and rejection risk remain unproven until the actual repository, signed binary, StoreKit environment, physical devices, and public store package pass their stated tests.

No P0 requires abandoning the build. TM-16, TM-17, and TM-18 are new P1s. They must be carried into final authority and the implementation acceptance tests. The narrow product promise remains the only defensible scope:

> Create your signature and initials. Export them cleanly. Nothing else.

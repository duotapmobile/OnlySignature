# Auditor C — App Store, Legal Preparation, Website, and ASO

**Product:** Only Signature  
**Research and audit date:** August 25, 2026  
**Storefront examined:** United States, with release-preparation notes for the EU and other regions  
**Authority:** the controlling Only Signature build contract  
**Independence statement:** This report was prepared independently. No other file under `docs/audits/` was read before or during this audit. This is product and legal preparation, not legal advice, a trademark opinion, or a promise of App Review acceptance.

## Executive determination

The narrow product is reviewable and commercially intelligible if the implementation remains an asset creator rather than drifting into document signing. The strongest defensible positioning is: draw a signature and initials, understand the white-box problem, then export a reusable local asset without an account or subscription. The proposed consumable product can express “one purchase for this set,” but it creates an unusually important fairness and recovery obligation: StoreKit cannot recreate signature artwork after deletion, and a finished consumable is not a normal restorable entitlement. That limitation must be disclosed before purchase, tested under interrupted-transaction conditions, and never obscured by “lifetime,” “restore,” or global-premium language.

There are **no intrinsic P0 findings** in the product specification. The P1 items below are either already fixed in the controlling specification or gated on finite founder/submission inputs. They do not prevent local implementation. They do prevent a truthful release declaration until verified.

The largest rejection risks are:

1. an incomplete or nonrecoverable consumable transaction flow;
2. metadata or screenshots that imply document signing, universal acceptance, or legal certification;
3. publishing “Data Not Collected” before inspecting the final native archive and every embedded SDK;
4. invalid or incomplete privacy-manifest/required-reason declarations;
5. placeholder, broken, or contact-free privacy and support URLs;
6. shipping with an EAS/Xcode image that does not satisfy the current Xcode 26 and iOS 26 SDK requirement;
7. using “Only Signature” without final federal, state, common-law, domain, and international clearance.

## Severity and disposition vocabulary

- **P0:** safety, fraud, legal, or submission failure that prevents implementation or release until corrected.
- **P1:** release-blocking or high-likelihood review/customer-harm issue. Implementation may continue only when fixed in the specification, disproven, or explicitly gated.
- **P2:** material conversion, trust, or operational weakness that should be fixed before launch when locally possible.
- **P3:** optimization or post-launch improvement.
- **Mutable:** the fact is likely to change before submission and must be rechecked near upload.

Allowed dispositions used here are: **fixed in specification**, **disproven with evidence**, **gated on founder/submission input**, and **excluded with defensible reason**.

## P0/P1 authority register

| ID | Finding | Severity | Required disposition | Mutable before submission? | Verification method |
|---|---|---:|---|---|---|
| C-01 | App uploads now require Xcode 26 or later using the iOS 26 SDK. A remembered Xcode 16 baseline is obsolete. | P1 | **Fixed in specification:** pin an EAS production image that resolves to a stable Xcode 26 release; **gated on submission:** recheck Apple’s Upcoming Requirements and inspect the uploaded build SDK. | Yes | Record EAS build image and build log; inspect archive/processing metadata; re-open Apple Upcoming Requirements within 72 hours of production build. |
| C-02 | The first consumable must be submitted with a new app version and requires complete localization, price/availability, review screenshot, notes, and a visible working path. | P1 | **Fixed in specification:** one consumable, clear scope, review fixture, and review notes; **gated on founder input:** Paid Apps Agreement, tax/banking, product creation, price, sandbox, and portal submission. | Yes | App Store Connect checklist; first-IAP status `Ready for Review`; screenshot visibly shows the purchase offer; sandbox purchase on physical device. |
| C-03 | A finished consumable is not a normal cross-device/restorable entitlement; app deletion can remove the only local signature snapshot. | P1 | **Fixed in specification:** no misleading Restore control; disclose deletion consequence before purchase and in FAQ, Terms, policy, support, and data screen; persist/deliver atomically before `finish()`. | No (low-drift rule) | Kill-app matrix before and after verified transaction; reinstall test; copy review; StoreKit `unfinished` recovery evidence. |
| C-04 | A successful charge can be lost if the transaction is finished before the immutable set and transaction binding are durable. | P1 | **Fixed in specification:** launch observer, verified transaction only, atomic persistence, idempotency, stable local set ID, then finish. | No (low-drift rule) | Automated state-machine tests plus StoreKit Test failure/interruption cases and sandbox termination-after-charge test. |
| C-05 | “Data Not Collected” is accurate only if the final app and third-party code transmit no developer/partner-collected data. On-device signature processing is not “collected” under Apple’s definition, while developer-accessible diagnostics or SDK telemetry would change the answer. | P1 | **Fixed in specification:** no analytics/ads/remote diagnostics; **gated on final archive:** inspect SDK behavior, privacy report, network capture, support flow, and App Privacy answers. | Yes | Xcode privacy report; archive and dependency inspection; clean-install network capture; compare final binary to App Privacy draft. |
| C-06 | Required-reason API declarations and SDK privacy manifests/signatures must match the final native archive; invalid manifests are rejected. | P1 | **Fixed in specification:** declare only actual approved reasons and inventory every native dependency; **gated on macOS archive audit** because Windows cannot produce the authoritative Xcode privacy report. | Yes | Validate every `PrivacyInfo.xcprivacy`; Xcode archive privacy report; App Store Connect upload diagnostics; compare APIs against Apple’s current list. |
| C-07 | Privacy policy and support URL are required and must be accessible; App Review rejects placeholders, broken links, and temporary content. Apple also requires the privacy policy to be easily accessible inside the app. | P1 | **Fixed in specification:** build complete local pages and in-app links; **gated on founder input:** legal identity, contact details, domain, hosting authorization, and public HTTPS deployment. | Yes | Anonymous browser checks for 200 status, TLS, mobile layout, accurate content, and in-app links on release build. |
| C-08 | The production policy, Terms, FAQ, metadata, and purchase screen could contradict one another about price scope, deletion, StoreKit, JPEG transparency, or data handling. | P1 | **Fixed in specification:** one authoritative content source and drift tests; no hardcoded production price; no universal transparency or acceptance claim. | Yes (implementation-dependent) | Automated content drift checks plus line-by-line pre-submission legal/product review against the binary. |
| C-09 | Unauthorized-signature misuse and legal-certification implications create consumer-protection and review risk. | P1 | **Fixed in specification:** prohibit forgery/impersonation/fraud, state no identity verification/notary/certificate/audit trail/legal advice/acceptance guarantee, and keep the app out of document-signing workflows. | No (low-drift boundary) | Copy scan of binary, website, metadata, screenshots, preview, and Terms; reviewer path verifies no document upload. |
| C-10 | “Only Signature” has not received comprehensive trademark clearance. No exact U.S. App Store listing surfaced in the limited live exact-name search, but this is not proof of availability or registrability. The wording is also commercially weak/descriptive enough that protection may be narrow. | P1 | **Gated on founder input:** final name decision and attorney-quality clearance; **fixed in specification:** centralize all brand strings and avoid famous-brand references/trade dress. | Yes | Search USPTO federal records and coordinated classes, state registries, WIPO/EUIPO/TMview, App Store, domains, social handles, and common-law use immediately before app-record creation. |
| C-11 | EU distribution requires a DSA trader-status declaration; traders must provide verified contact information that Apple displays on the EU product page. | P1 | **Gated on founder input:** legal entity/status, public contact details, verification documents, and territory choice. Default release scope must not silently include the EU. | Yes | App Store Connect DSA status and territory screenshots; verify displayed product-page contact data. |
| C-12 | Export-compliance answers must account for the app and all linked libraries, even when encryption is provided only by the OS and is likely exempt from documentation. | P1 | **Gated on final dependency/archive audit:** determine correct `ITSAppUsesNonExemptEncryption` value and any filing obligation; do not guess. | Yes | Final dependency list, App Store Connect questionnaire, Info.plist inspection, and specialist review if non-standard crypto is present. |
| C-13 | Accessibility Nutrition Labels are claims about completing all common tasks, including first launch, purchase, export, and settings—not a list of isolated accessible widgets. | P1 | **Fixed in specification:** implement accessibility; **gated on device testing:** publish only labels proven on every supported device class. | Yes | Device matrix for VoiceOver, Voice Control, Larger Text at 200%+, contrast, non-color differentiation, and Reduced Motion. |
| C-14 | Screenshot and preview assets must show actual implemented UI and accurate purchase behavior; transparent screenshot files themselves are prohibited. | P1 | **Fixed in specification:** deterministic fixture mode, flattened assets, exact comparison document, real localized price fixture only for U.S. screenshots; **gated on final iOS capture**. | Yes | Pixel/alpha inspection, dimension validator, UI-to-asset comparison, localization review, and current App Store specification check. |
| C-15 | The product competes with free or inexpensive transparent-PNG tools as well as subscription-heavy sign-PDF suites. A $1.99 per-set model is differentiated but viability is not proven by public listing data. | P1 | **Fixed in specification:** preserve narrow scope, free white export, no subscription, included initials, clear per-set language; **gated on live launch measurement**, not fabricated market estimates. | Yes | At least 20 directly relevant live U.S. listings, review sample, Search Ads research if authorized, App Store conversion and IAP units after launch. |

## Current Apple submission and review audit

### Submission toolchain

Apple’s current requirement states that, **since April 28, 2026**, App Store Connect uploads must use Xcode 26 or later and an SDK for iOS 26 or later. The current stable Xcode line shown by Apple is Xcode 26.6; beta Xcode 27 exists but should not be the production default merely because it is newer. The Windows host is not itself a blocker: Expo/EAS can prepare and remotely build iOS, but an authoritative signed archive, StoreKit sandbox validation, Xcode privacy report, and final iOS screenshots remain credential/macOS/device boundaries.

**Decision:** production must select a stable Xcode 26 EAS image, not `latest` without a resolved image record. Recheck within 72 hours of the final build because Apple’s upload rule is mutable. Source: [Apple SDK minimum requirements](https://developer.apple.com/news/upcoming-requirements/?id=02032026a) and [Xcode system requirements](https://developer.apple.com/xcode/system-requirements).

### App Review completeness

Guideline 2.1 requires a final, tested app, complete metadata, and functioning URLs; incomplete IAPs must be explained and visible. Guideline 2.3 requires screenshots, previews, privacy information, and descriptions to reflect the core experience accurately. Guideline 4.2 requires adequate utility beyond a repackaged website. This product’s capture, comparison, reusable saved sets, independent formats, and exports are adequate utility if implemented. A mere web wrapper or a nonfunctional prototype would not be.

The reviewer path should take under three minutes: Get Started → draw a signature → Continue → compare identical fixture documents → Confirm Signature → see the localized consumable offer and free path. Review notes must state that the app has no account and therefore needs no demo credentials, identify the free export, explain the per-set consumable and unclaimed slot, and disclose deletion behavior. The App Review contact phone must be in international format per the August 19, 2026 App Store Connect release notes.

Sources: [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/), [App Review preparation](https://developer.apple.com/app-store/review/), and [App Store Connect release notes](https://developer.apple.com/help/app-store-connect/release-notes/).

### Roles and process

- Creating the app record requires Account Holder, Admin, or App Manager, and current agreements must be signed.
- Uploading builds requires Account Holder, Admin, App Manager, or Developer.
- Publishing App Privacy answers requires Account Holder, Admin, or App Manager.
- Accessibility labels can be managed by Account Holder, Admin, Finance, App Manager, or Marketing.
- The first consumable is submitted with a new version by Account Holder, Admin, or App Manager.
- TestFlight supports up to 100 internal App Store Connect users and 10,000 external testers; the first external build may require beta review, and a build is testable for up to 90 days.

Sources: [Add a new app](https://developer.apple.com/help/app-store-connect/create-an-app-record/add-a-new-app), [Upload builds](https://developer.apple.com/help/app-store-connect/manage-builds/upload-builds/), [Manage App Privacy](https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy/), [Submit an IAP](https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/submit-an-in-app-purchase/), and [TestFlight overview](https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview).

## StoreKit and purchase-presentation audit

Apple defines a consumable as a product used once and then depleted; that maps acceptably to one newly finalized transparent Signature Set. A global non-consumable would contradict the locked rule that a materially changed/new set requires another purchase, while a subscription would be disproportionate and contradict the product promise. This does not make consumable recovery automatic.

StoreKit guidance requires persistent transaction observation and says unfinished transactions remain until finished. The app must persist and deliver the purchase before finishing. StoreKit 2 provides verified transactions, `Transaction.unfinished`, `Transaction.updates`, and `appAccountToken` purchase options. If `appAccountToken` is used with a local set UUID, the privacy and review documentation must say it is a random association token and contains no strokes, image, label, name, or filename. Its suitability for a no-account local set should be verified in native implementation and sandbox review notes; omitting it is preferable to misusing it.

The first consumable requires a new app-version submission. App Store Connect also requires at least one localization, a product ID, availability and price, a review screenshot that clearly shows what is offered, and review notes. The local UI must use StoreKit’s localized `displayPrice`; `$1.99` is a planned U.S. storefront value, not a production constant. Paid Apps Agreement, tax, and banking must be complete before sale.

The IAP copy is fair only when the purchase screen simultaneously communicates:

- “Purchase for {localized price}”
- “One purchase for this signature + initials set.”
- “No subscription. Re-export this set anytime.”
- the included-but-unclaimed slot when relevant
- a visible, functional free white-background action
- a concise deletion/local-storage disclosure reachable before purchase

Apple’s restore guidance explicitly discusses restoring non-consumables and subscriptions. Therefore a Restore Purchase button for this finished consumable would be misleading. Recovery of an **unfinished** verified transaction is required and is not the same as restoring consumed artwork. Sources: [IAP types](https://developer.apple.com/help/app-store-connect/configure-in-app-purchase-settings/overview-for-configuring-in-app-purchases/), [StoreKit unfinished transactions](https://developer.apple.com/documentation/StoreKit/Transaction/unfinished), [finishing a transaction](https://developer.apple.com/documentation/storekit/finishing-a-transaction), [purchase options](https://developer.apple.com/documentation/storekit/product/purchase%28options%3A%29), and [IAP information](https://developer.apple.com/help/app-store-connect/reference/in-app-purchases-and-subscriptions/in-app-purchase-information/).

## Privacy policy, App Privacy, manifests, and required-reason APIs

### Privacy policy

Apple requires a privacy-policy URL in App Store Connect and an easily accessible in-app link. The policy must identify collected data, uses, third parties, and retention/deletion practices. Only Signature’s policy must separate four contexts:

1. signature/initial strokes and reusable assets processed locally by the app;
2. destinations the user chooses through Files, Photos, pasteboard, AirDrop, email, or other share extensions;
3. purchase processing by Apple and aggregated sales/accounting records available to the developer;
4. support email/attachments and ordinary website-host logs received outside the app.

“Created on your device. We do not upload it.” is supportable only after a final network and native-SDK audit. “Never leaves your device,” “100% private,” and “no data is collected” are overbroad because users can export to cloud-backed destinations, Apple processes purchases, support can receive volunteered content, and a site host normally receives request logs.

### App Privacy answer

Apple says data processed only on-device is not “collected” for the label, and payment details entered outside the app do not need disclosure if the developer never receives them. Apple also says developers are not responsible for data Apple itself collects, but must disclose data they obtain from Apple frameworks or services. Therefore **Data Not Collected is a plausible draft answer for the app binary**, subject to these hard conditions:

- no analytics, ads, telemetry, remote logging, crash-reporting SDK, account, or developer API;
- no signature, thumbnail, stroke, local label, filename, diagnostics, device ID, or product interaction transmitted to the developer or a partner;
- StoreKit reports used only through Apple’s developer reports are documented distinctly;
- opening a support link does not silently attach diagnostics or content;
- website/support practices remain disclosed in the policy even though they are outside the app label’s binary scope.

This answer is not authorized until the final archive and network capture pass. Source: [Apple App Privacy Details](https://developer.apple.com/app-store/app-privacy-details/) and [Manage App Privacy](https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy/).

### Privacy manifest and SDK signatures

The app target must contain a valid `PrivacyInfo.xcprivacy`. Every executable/dynamic library using a required-reason API needs an appropriate manifest in its own bundle. Apple has rejected apps that omit covered reasons since May 1, 2024, and App Store Connect rejects invalid manifest keys/values. The build must not declare tracking domains or ATT usage. Do not “future proof” the file by declaring APIs or data that are not actually used.

The final macOS archive audit must:

- enumerate all app and SDK manifests;
- generate and review Xcode’s privacy report;
- search the linked binary for required-reason API categories;
- confirm third-party SDK signatures/manifests for any SDK on Apple’s current list;
- reconcile file timestamp, disk-space, UserDefaults, and system-boot-time access with approved reason codes actually used;
- confirm no tracking domain, `NSUserTrackingUsageDescription`, or ATT framework path;
- compare the resulting data-use declaration against App Privacy and the policy.

Sources: [Privacy manifest files](https://developer.apple.com/documentation/bundleresources/privacy-manifest-files), [adding a privacy manifest](https://developer.apple.com/documentation/bundleresources/adding-a-privacy-manifest-to-your-app-or-third-party-sdk), and [required-reason API use](https://developer.apple.com/documentation/bundleresources/describing-use-of-required-reason-api).

## Legal-preparation and authorized-use audit

### Product claim boundary

Under the U.S. E-SIGN Act, an electronic signature is an electronic sound, symbol, or process attached to or logically associated with a record and executed or adopted with intent to sign. Only Signature creates an image asset; it does not attach the asset to a record, establish intent, authenticate the signer, preserve evidence, or provide an audit trail. A digital signature commonly means a cryptographic mechanism and certificate-backed verification. A notarized or qualified signature involves legal and trust-service processes that this app does not provide.

All consumer and store copy must therefore avoid “legally binding,” “verified,” “certified,” “digital signature” when it could imply cryptography, “secure signing,” “sign any document,” “accepted everywhere,” “authentic,” and “official.” Accurate phrases are “signature image,” “handwritten signature asset,” and “place the exported image on a document.” Recipients and applicable law decide acceptance.

Source: [15 U.S.C. § 7006](https://www.law.cornell.edu/uscode/text/15/7006). The legal policy must be reviewed by licensed counsel before release.

### Misuse and consumer protection

Terms must prohibit creating, storing, or using a signature without authority, including forgery, impersonation, fraud, misrepresentation, and illegal document alteration. The app should not ask users to prove identity because that would contradict scope and create new data risk. A concise, nonintrusive authorized-use statement in Settings/Terms and near “Create New” is proportionate. The app must not claim to verify ownership.

### EULA decision

Apple’s Standard EULA automatically applies when no custom EULA is supplied. A custom EULA supersedes it in selected territories and must be complete. The safer launch preparation is:

- rely on Apple’s Standard EULA for the app license;
- publish separate product Terms covering authorized use, per-set purchase scope, local storage/deletion, exports, refunds through Apple, and legal-claim limits;
- do not upload the Terms as a custom EULA unless counsel confirms all Apple minimum provisions and territory coverage.

Sources: [Apple Standard EULA](https://www.apple.com/legal/internet-services/itunes/dev/stdeula/) and [custom EULA setup](https://developer.apple.com/help/app-store-connect/manage-app-information/provide-a-custom-license-agreement).

### Privacy-law preparation

- **COPPA:** the utility is general-audience and should not be marketed to children. FTC guidance says general-audience services are covered when they have actual knowledge they collect personal information from a child under 13; it does not require routine age investigation. Do not add age collection. Reassess if marketing, data flows, or audience changes. [FTC COPPA guidance](https://www.ftc.gov/business-guidance/resources/childrens-online-privacy-protection-rule-not-just-kids-sites).
- **California:** publish a conspicuous, accurate policy and assess CalOPPA. CCPA/CPRA applicability depends on the operator, revenue/processing thresholds, and practices; do not promise statutory rights or “Do Not Sell/Share” machinery without confirming applicability, but do honor stated deletion procedures and never sell/share for targeted advertising. [California DOJ CCPA](https://oag.ca.gov/privacy/ccpa) and [California public privacy-practices guidance](https://oag.ca.gov/sites/all/files/agweb/pdfs/cybersecurity/making_your_privacy_practices_public.pdf).
- **EU/UK/Canada/Australia:** distribution and website/support collection may create controller/business obligations even though signature content stays local. Operator identity, lawful contact path, retention, international transfer/processor information, and user-right procedures must be tailored to actual hosting and territory choices. Do not ship generic claims of worldwide compliance. Territory selection and counsel review remain founder gates.

## Website and public-support readiness

The static website approach is suitable and minimizes risk. Before submission, it must be deployed over HTTPS with no placeholder operator, email, address, phone, domain, or effective date. Apple’s current Support URL reference says the page must lead to actual contact information—potentially legal address, email, and phone as required by local law. The site should expose stable direct URLs for privacy, Terms, support, purchase FAQ, accessibility, and contact. The Marketing URL is optional; the Support URL and Privacy URL are not.

Required controls:

- no analytics cookies, tracking pixels, ad technology, fingerprinting, third-party chat, or unnecessary form;
- first-party static assets and system fonts where practical;
- accessible landmarks, headings, skip link, keyboard focus, large-text reflow, contrast, reduced-motion behavior, and descriptive link text;
- factual purchase scope and deletion warning synchronized with the app;
- host-log and mailto behavior disclosed in the privacy policy;
- no claim that the website itself creates or stores signatures;
- `robots.txt`, sitemap, canonical metadata, Open Graph data, favicon, 404, and structured organization/software metadata only after legal identity and URLs are real;
- direct static-upload and one non-GitHub CLI deployment path documented, with no deployment before authorization.

Verification is anonymous browser testing from a clean session, `curl`/HTTP checks for each URL, Lighthouse/axe or equivalent accessibility checks, no-cookie/storage inspection, and a host/network request inventory.

Source: [Apple platform-version information](https://developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information) and App Review Guideline 2.1 in the [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/).

## Metadata, screenshots, app preview, age rating, and accessibility labels

### Current metadata constraints

| Field | Current Apple limit/status | Only Signature audit decision |
|---|---|---|
| App name | 2–30 characters | `Only Signature` fits at 14 characters; availability and clearance remain unproven. |
| Subtitle | 30 characters | `Transparent Signature Export` fits at 28 but repeats “Signature” from the title. Test a nonduplicative accurate option such as `Transparent PNG & Initials` only after keyword evidence and UI truth review. |
| Promotional text | 170 characters | Conversion copy; may be edited without a new version. No legal or privacy absolutes. |
| Description | 4,000 characters, plain text | Lead with signature/initials and transparent export; disclose no document upload and exact per-set purchase. |
| Keywords | 100 bytes; required/localizable | No competitor brands, company/app-name duplication, fabricated popularity, or irrelevant e-sign terms. |
| Screenshots | 1–10; JPEG/JPG/PNG; no alpha | Produce 6.9-inch iPhone master and 13-inch iPad master if iPad is supported; recheck accepted pixel dimensions immediately before upload. |
| App previews | Optional; up to 3 per locale/device; 15–30 seconds, max 500 MB | Not a launch blocker. A preview always precedes screenshots; launch only if polished actual-device footage communicates the value faster than screenshot 1. |
| IAP display name | 2–30 characters | Use a scoped name such as `Transparent Signature Set`, subject to count and localization check. |
| IAP description | Up to 45 characters | State one set, not app-wide or lifetime access. |
| IAP review screenshot | Required review evidence | Show the actual purchase screen with product scope and free path; this is separate from marketing screenshots. |

Sources: [App information](https://developer.apple.com/help/app-store-connect/reference/app-information/app-information), [platform version information](https://developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information), [screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/), [app preview specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/app-preview-specifications/), and [IAP information](https://developer.apple.com/help/app-store-connect/reference/in-app-purchases-and-subscriptions/in-app-purchase-information/).

### Screenshot communication audit

The proposed first-three story is stronger than generic feature screens because it teaches the problem visually:

1. signature and initials;
2. the same fixture with a realistic white rectangle obstructing nearby labels/line versus transparent output;
3. no editing or cropping.

Screenshot 1 must still reveal the transparent-export benefit without requiring a scroll. Screenshot 2 must use the exact same fictional document, drawing, scale, and placement on both sides. Do not use a checkerboard, real document, fabricated review, or unsupported format. All store images must be flattened with no alpha even though the product exports alpha. The price may show `$1.99` only in the deterministic U.S. screenshot fixture and must not be confused with a production hardcode.

The current Apple screenshot page permits one to ten screenshots and lists 6.9-inch accepted masters including 1260×2736, 1290×2796, and 1320×2868 portrait variants depending on source device; iPad requires its current 13-inch master. The asset pipeline should validate against the exact accepted size chosen at capture time rather than assuming one remembered dimension.

### App Preview decision

An App Preview is optional and will display before the first screenshot. In this narrow utility, actual drawing motion and the before/after reveal could explain value well, but a video also adds macOS capture/upload and localization burden and can displace the strongest static value proposition. **Disposition: exclude from the launch critical path with a defensible reason, but prepare a 15–30 second storyboard and capture automation.** Publish only after native footage, large readable captions, no implied document upload, and a poster-frame test. This is P3, not a release blocker.

### Age rating

Apple introduced an updated age-rating system reflected on iOS 26 and later; an unrated app cannot be published. A general utility with no user communication, web browsing, gambling, sexual/violent content, or child-directed material should likely resolve to the lowest general rating, but the current questionnaire must be answered from the actual binary. Do not mark Made for Kids and do not add age collection. Source: [Set an app age rating](https://developer.apple.com/help/app-store-connect/manage-app-information/set-an-app-age-rating) and [Apple Upcoming Requirements](https://developer.apple.com/news/upcoming-requirements/).

### Accessibility Nutrition Labels

Labels are currently voluntary to start but Apple says they will become required over time. A support claim requires all common tasks to work with that feature. Draft candidates are VoiceOver, Voice Control, Larger Text, Differentiate Without Color Alone, Sufficient Contrast, and Reduced Motion; none may be published before device testing. Larger Text requires at least 200% or the system maximum without severe overlap/truncation. The drawing canvas needs an accessible path: screen-reader users must be told what drawing requires and still be able to reach, switch, clear, continue, purchase/free-export, manage sets, and delete data. Do not claim that VoiceOver can create handwriting by itself if the canvas cannot support that interaction.

Sources: [Accessibility Nutrition Labels overview](https://developer.apple.com/help/app-store-connect/manage-app-accessibility/overview-of-accessibility-nutrition-labels/), [VoiceOver criteria](https://developer.apple.com/help/app-store-connect/manage-app-accessibility/voiceover-evaluation-criteria/), and [Larger Text criteria](https://developer.apple.com/help/app-store-connect/manage-app-accessibility/larger-text-evaluation-criteria).

## Export compliance and regional distribution

Apple requires an export-compliance determination if the app uses, accesses, contains, implements, or incorporates encryption. OS-provided encryption can often be exempt from documentation, but that determination covers linked libraries too. Set `ITSAppUsesNonExemptEncryption` to `NO` only after final archive review confirms the app uses no non-exempt encryption; if documentation is required, attach Apple’s approval code before TestFlight/App Review. Source: [Apple export compliance overview](https://developer.apple.com/help/app-store-connect/manage-app-information/overview-of-export-compliance) and [encryption declaration guidance](https://developer.apple.com/documentation/Security/complying-with-encryption-export-regulations).

For the EU, App Store Connect requires every developer to declare trader status; a trader distributing in the EU must verify business/contact information, and Apple publishes address, phone, and email. This is a genuine founder/legal-identity gate. The app should not default to every territory. Initial U.S.-only availability is operationally defensible while EU/UK/Canada/Australia policy, tax, consumer-disclosure, and contact requirements are reviewed. Source: [Apple DSA trader requirements](https://developer.apple.com/help/app-store-connect/manage-compliance-information/manage-european-union-digital-services-act-trader-requirements).

## Competitor and ASO audit

### Live market observations

The U.S. App Store scan found a dense but fragmented set of products:

- **Signature Maker: Sign & Scan** advertises scan/draw/text generation, PDF/image signing, and IAPs at $1.99, $4.99, and $19.99; its privacy label lists linked location, identifiers, and usage data. [Listing](https://apps.apple.com/us/app/signature-maker-sign-scan/id6759557084)
- **Signature Maker – Sign AI** advertises transparent export and local storage but sells monthly and annual subscriptions. [Listing](https://apps.apple.com/us/app/signature-maker-sign-ai/id6763584180)
- **Signature Maker: Scan&Sign PDF** advertises document signing and weekly/annual subscriptions, illustrating the crowded “sign PDF” pattern Only Signature should avoid. [Listing](https://apps.apple.com/us/app/signature-maker-scan-sign-pdf/id6754448228)
- **Digitize Signature** is a $0.99 paid app that advertises transparent PNG and JPEG, demonstrating that transparent export itself has low-priced competition. Its public rating count is seven, which is only a demand proxy and says nothing about downloads. [Listing](https://apps.apple.com/us/app/digitize-signature/id1477487648)
- **Signature generator & maker** advertises transparent PNG for free and had 24 U.S. ratings at access time; a visible positive review specifically praised that it stayed free and did not ask for a subscription. [Listing](https://apps.apple.com/us/app/signature-generator-maker/id6446936588)
- **eSign App: Sign PDF Documents** had about 1.3K U.S. ratings at access time. A critical public review complained about an unnoticed weekly renewal, while praise emphasized completing a task quickly. These are individual review statements, not representative prevalence. [Reviews](https://apps.apple.com/us/app/6446249178?platform=iphone&see-all=reviews)
- **eSign — Fill & Sign Documents** listed weekly/monthly/yearly/lifetime options; a critical review called the interface confusing and complained about missing editing/resizing. [Listing](https://apps.apple.com/us/app/esign-fill-sign-documents/id6746846547)

Public listings do not expose downloads, revenue, retention, keyword volume, or conversion. Rating counts are demand proxies only. No such metrics may be inferred.

### Competitive conclusion

“Transparent PNG” is not unique. “No subscription” is not unique. “On device” is increasingly common. The combination that remains differentiated is:

- no document upload because the product does not edit documents;
- paired signature and initials in one set;
- an explicit visual explanation of the white-box problem;
- high-quality free white export;
- one transparent-set purchase with re-export rights and an included unclaimed slot;
- large, older-adult-friendly flow.

The product should not attempt to outrank document-signing suites by pretending to sign PDFs. That would dilute conversion, create privacy/legal complexity, and violate scope. The working keyword intent groups are `signature image`, `transparent signature`, `signature PNG`, `handwritten signature`, `initials`, and `white background`; `digital signature` and `e-signature` should be used, if at all, only in explanatory/negative context because they invite a different job and stronger legal expectations.

### ASO work required before metadata lock

The required 20-result competitor matrix must include current ratings/counts, IAPs, privacy labels, screenshots, update history, account/document requirements, and review themes. Search Ads popularity cannot be invented; if credentials are later authorized, query exact terms in Apple Ads and record locale/date. Otherwise classify competition only as observed listing density and preserve an `unknown` popularity field.

Provisional metadata direction:

- keep `Only Signature` as a working title pending name clearance and app-record availability;
- compare `Transparent Signature Export` against a nonduplicative subtitle such as `Transparent PNG & Initials` using relevance and listing evidence, not subjective preference;
- keep competitor brands out of keywords;
- use screenshot captions for benefits and the keyword field for relevant synonyms not already indexed by the title/company;
- classify primary category as **Utilities** unless the final competitor matrix shows a stronger directly relevant Productivity cohort; Business is a defensible secondary candidate only if the final product actually serves that audience without document signing.

### Product-page optimization and measurement

Apple PPO can test up to three alternate icons, screenshot sets, and previews after the app is Ready for Distribution. Tests run up to 90 days and results begin after at least five attributed first-time downloads; Apple reports conversion and confidence and may label a result at 90% confidence. A low-volume launch can remain inconclusive, so do not promise minimum traffic or lift. Test one coherent hypothesis at a time: transparency problem first, no-subscription simplicity first, or no-document-upload privacy first.

Privacy-safe launch measurement is sufficient through App Store Connect App Analytics, Sales and Trends, proceeds, IAP units/refunds, ratings/reviews, and PPO. Apple notes usage metrics depend on user opt-in and privacy thresholds. No third-party analytics SDK is justified. Sources: [PPO overview](https://developer.apple.com/help/app-store-connect/create-product-page-optimization-tests/overview-of-product-page-optimization), [run a PPO test](https://developer.apple.com/help/app-store-connect/create-product-page-optimization-tests/run-a-test/), [PPO analytics](https://developer.apple.com/help/app-store-connect-analytics/acquisition/product-page-optimization), and [reporting tools](https://developer.apple.com/help/app-store-connect/measure-app-performance/overview-of-reporting-tools).

## Name and trademark preliminary screen

The exact-name web/App Store search performed August 25, 2026 did not surface a directly relevant U.S. App Store app called “Only Signature.” That observation is narrow and mutable. Search-engine results cannot establish that the App Store name is reservable, that no pending/registered federal mark exists, or that no common-law user has superior rights. The phrase uses two common words and directly suggests a signature-only utility, so registrability and scope may be weak even without a conflict.

USPTO guidance requires more than an exact-match search: similar sound, appearance, meaning, commercial impression, and related goods/services matter. A comprehensive search includes federal pending/registered marks, state records, common-law internet use, domains, WIPO/EUIPO/TMview, and related classes. This must be a release gate, not a developer’s legal conclusion. Sources: [USPTO comprehensive clearance search](https://www.uspto.gov/trademarks/search/comprehensive-clearance-search-similar-trademarks), [federal searching](https://www.uspto.gov/trademarks/search/federal-trademark-searching), and [likelihood of confusion](https://www.uspto.gov/trademarks/search/likelihood-confusion).

No material exact conflict was established in this preliminary screen, so the contract’s mandatory alternate-name branch is not activated. Nevertheless, all brand strings, bundle values, icon text, legal references, and site metadata must remain centralized until founder/counsel clearance. The design must avoid confusingly similar competitor icons and any OnlyFans reference, typography, color treatment, or search-traffic tactic.

## Source-confidence and mutability summary

| Conclusion | Primary source type | Confidence | Product effect | May change before submission? |
|---|---|---:|---|---|
| Xcode 26/iOS 26 SDK minimum | Official Apple requirement | High | EAS production image and build gate | Yes |
| 1–10 flattened screenshots, no alpha | Official App Store Connect reference | High | Screenshot validator | Yes |
| 15–30 second optional previews, up to three | Official App Store Connect reference | High | Preview storyboard/capture | Yes |
| First consumable accompanies new app version | Official App Store Connect help | High | IAP submission plan | Yes |
| On-device-only data is not App Privacy “collection” | Official Apple privacy guidance | High | Provisional Data Not Collected answer | Yes, because code can change |
| Required-reason APIs need accurate manifests | Official Apple developer documentation | High | Archive/privacy-report gate | Yes |
| DSA trader declaration/contact display | Official Apple help reflecting DSA | High | Founder/territory gate | Yes |
| COPPA general-audience actual-knowledge rule | Official FTC guidance | High | No child marketing or unnecessary age gate | Law/guidance can change |
| Electronic-signature definition | U.S. statute text | High | Avoid certification/enforceability claims | Low |
| Subscription frustration and simplicity praise | Individual live App Store reviews | Medium for the review’s existence; low for prevalence | Copy and pricing hypothesis only | Yes |
| App name has no conflict | Not established | None | Final clearance remains blocked | Yes |
| Keyword popularity or conversion lift | Not publicly established | None | Do not invent; use Apple Ads/PPO later | Yes |

## Required corrections and release verification

### Must be built locally

1. Centralized and testable public/in-app content for privacy, Terms, FAQ, purchase scope, formats, deletion, and legal disclaimers.
2. A valid app privacy manifest with only actual required reasons and no tracking declarations.
3. A complete, visible free export path and exact per-set consumable copy.
4. Reviewer fixture data and IAP review screenshot composition.
5. Deterministic, flattened screenshot pipeline for current iPhone and iPad masters.
6. Static website with complete pages and no tracking dependencies.
7. Metadata drafts within current field limits, without competitor names or false legal/format claims.
8. Accessibility claim matrix and accurate draft labels, not published claims.
9. Localized StoreKit price in production and U.S. `$1.99` only in development/store fixtures.
10. Drift tests covering no subscription, no document upload, per-set purchase, deletion limits, App Privacy, and JPEG’s white background.

### Genuine founder/submission gates

- final legal operator name, address, support email, and public phone/contact details;
- public domain and hosting authorization;
- Apple Team ID, bundle ID, app record, SKU, and final name reservation;
- Paid Apps Agreement, tax/banking status, App Store Connect roles/credentials, and consumable product record;
- final U.S. price approval and territory selection;
- DSA trader decision and evidence;
- final legal and trademark clearance;
- code-signing/EAS credentials and physical-device access;
- sandbox/TestFlight/App Review authorization.

### Final verification sequence

1. Recheck Apple Upcoming Requirements, screenshot/previews, age rating, accessibility labels, privacy-manifest rules, and IAP submission pages within 72 hours of the production build.
2. Build with a stable Xcode 26+ image and inspect the archive, privacy report, entitlements, `Info.plist`, SDK manifests/signatures, symbols, and network behavior.
3. Run a clean-install physical-device matrix: free export, successful/cancelled/pending/offline purchase, termination after charge, unfinished recovery, re-export, unclaimed slot, deletion, large text, VoiceOver, Voice Control, and iPad/rotation.
4. Validate every public URL anonymously over HTTPS and verify contact/legal identity, no placeholders, and in-app reachability.
5. Compare screenshots, preview, metadata, App Privacy, Terms, policy, FAQ, and review notes to the exact submitted binary.
6. Submit the first consumable with the version and its review screenshot; ensure the reviewer can reach both free and paid paths without credentials.
7. Record portal screenshots/statuses as external evidence; do not claim signed build, sandbox success, TestFlight, review, or legal clearance until those events actually occur.

## Auditor C conclusion

**Implementation authority recommendation:** proceed with local implementation under the controlling specification. Every identified P1 is either fixed in that specification or finitely gated on founder/submission evidence. Do not relax the narrow asset-only scope.

**Release authority recommendation:** withhold release authority until the final archive passes privacy/required-reason and network inspection; StoreKit interruption/sandbox tests pass; public URLs are complete and live; accessibility claims are device-tested; App Store metadata/IAP assets match the binary; operator/DSA/export/territory inputs are complete; and the working name receives final clearance.

The central go-to-market claim is defensible only in this bounded form: **Create your signature and initials. Export them cleanly. No document upload, no login, and no subscription.**

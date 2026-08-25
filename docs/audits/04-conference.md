# Three-Auditor Conference — Consolidated Build Authority

**Product:** Only Signature  
**Conference date:** 2026-08-25  
**Participants:** Auditor A (Product, UX, Accessibility), Auditor B (Engineering, StoreKit, Security, Privacy), Auditor C (App Store, Legal Preparation, Website, ASO)  
**Inputs read in full:** `01-product-ux-accessibility.md`, `02-engineering-storekit-security.md`, and `03-appstore-legal-aso.md`  
**Scope:** Reconcile the independent pre-implementation audits, resolve disagreements using cited evidence, disposition every P0/P1, lock implementation decisions, separate implementation authority from release authority, and identify finite founder inputs.  
**Not performed here:** implementation, portal changes, code signing, deployment, legal certification, trademark clearance, or Apple-device testing.

## Conference decision

**IMPLEMENTATION AUTHORIZED. RELEASE NOT AUTHORIZED.**

The three auditors agree that the narrow product can be built locally under Expo React Native, npm workspaces, Expo prebuild, and EAS preparation without a backend, account, subscription, analytics SDK, document upload, or remote signature storage. No auditor identified an intrinsic P0. Every P1 has one of the contract-authorized dispositions in the traceability register below.

Implementation authorization means the team may build all locally achievable code, tests, site pages, legal-preparation drafts, research artifacts, StoreKit fixtures, screenshot infrastructure, and release configuration. It does **not** mean that an iOS build, StoreKit sandbox purchase, physical-device accessibility flow, App Store submission, public URL, privacy answer, export-compliance answer, DSA declaration, commercial viability, or name clearance has passed.

Release authority remains withheld until the finite external and device/archive gates in this document are satisfied with current evidence.

## Evidence hierarchy used to resolve the conference

1. The founder’s controlling build contract defines product scope and commercial intent.
2. Current official Apple requirements govern iOS submission, StoreKit, App Privacy, privacy manifests, accessibility declarations, screenshots, and portal behavior.
3. Current official Expo documentation governs the Windows/EAS/SDK compatibility path.
4. Platform-native test evidence governs behaviors that JavaScript mocks cannot prove: StoreKit verification, file attributes, pasteboard options, share destinations, archive contents, privacy reports, VoiceOver, Voice Control, performance, and network traffic.
5. W3C WCAG 2.2 AA is a supporting accessibility baseline; Apple’s common-task criteria govern App Store Accessibility Nutrition Label claims.
6. Official statutes and regulator guidance govern legal-preparation research. Final legal advice and trademark clearance remain external professional decisions.
7. Live App Store listings and reviews support market hypotheses only. They do not prove downloads, revenue, conversion, retention, keyword volume, or viability.

The conference relies on evidence captured in the three source reports on 2026-08-25. Mutable Apple requirements must be rechecked within 72 hours of the production build and again before submission.

## Consensus findings

### Product and fairness

- The product is useful only while it stays an asset creator: signature and initials in, clean local image assets out. It must not drift into PDF/document signing, document upload, signature requests, identity verification, or legal certification.
- The real differentiation is the combination of no document upload, signature plus initials, an understandable white-box comparison, a useful free white-background export, no login, no subscription, and one transparent-export purchase per local set.
- The per-set consumable is defensible because users can create multiple materially different sets, but it carries an unusually high duty to prevent lost purchases and clarify that deleted local artwork is not reconstructible.
- The free flow must remain a first-class functional path. It cannot be visually hidden, intentionally degraded, or framed as broken.
- Initials-only, signature-only, both-assets, and one-included-slot-later are all core states. Copy and navigation must be state-aware.

### Engineering and security

- Windows is a valid primary implementation host but cannot certify native iOS behavior. EAS can compile iOS remotely; final archive, simulator/device, StoreKit, privacy, accessibility, performance, and destination evidence remain Apple-environment gates.
- Canonical, versioned stroke points are the durable source of truth. Skia paths, thumbnails, previews, and raster exports are derived artifacts.
- StoreKit fulfillment must be a frozen-snapshot, verified, durable, idempotent, finish-last journal. There is no global premium state.
- Generic Expo APIs do not prove the required file protection, backup exclusion, atomic durability, or local-only expiring image pasteboard. Narrow owned iOS modules/config plugins are authorized for those boundaries.
- Production OTA updates are disabled. The embedded app has no analytics, crash upload, remote logs, cloud storage, accounts, remote fonts/assets, or proprietary runtime API.
- PNG transparent/white and JPEG white are launch formats. Other formats and destinations appear only after their individual truth tests pass.

### Accessibility and usability

- The custom drawing canvas is the accessibility-critical control. Labels alone do not prove VoiceOver or Voice Control support.
- Accessibility claims require completion of all common tasks on each claimed device family, including canvas, purchase/free choice, export, returning sets, and deletion.
- The prescribed side-by-side comparison is correct at readable sizes. At accessibility text sizes or constrained widths, a same-fixture vertical comparison is required so the product lesson does not shrink into illegibility.
- Three-dimensional glass is decorative. Information, state, focus, contrast, and action hierarchy cannot depend on blur, transparency, shadow, color, haptics, or animation alone.
- The no-Undo decision remains a known motor-access tradeoff. It is retained to honor the locked simple interface, with explicit mitigation and without claiming perfect accommodation for tremor.

### Store, legal preparation, website, and ASO

- Public and store copy must describe a signature image asset, not a verified, certified, cryptographic, notarized, qualified, universally accepted, or legally binding signing service.
- “Data Not Collected” is only a provisional app-binary draft. It cannot be published until the final archive, SDK manifests, privacy report, and release-network observation support it. Website hosting logs, support correspondence, Apple purchase processing, and user-selected share destinations are separately disclosed.
- The app target and embedded native code require archive-derived privacy-manifest and required-reason review. An empty app-level manifest is not proof.
- “Only Signature” remains a centralized working name. The preliminary exact-name scan found no proven exact App Store conflict, but did not establish availability, registrability, or freedom to operate.
- The public privacy and support pages must be complete, stable, anonymous-accessible HTTPS URLs before submission. Local pages are necessary but not sufficient.
- An App Preview is optional. The storyboard and automation are locally required; a final launch video is excluded from the critical path unless actual-device footage is polished and truthful.

## Disagreements and resolutions

### 1. Exact Xcode/EAS production baseline

**Positions:** Auditor B proposed Expo SDK 57 with Xcode 26.4 or later because that is the SDK baseline; Auditor C observed that Apple’s current stable line is newer and warned against an unresolved `latest` build image.

**Evidence:** Apple requires uploads from 2026-04-28 onward to use Xcode 26 or later and the iOS 26 SDK or later. Expo maps SDK 57 to React Native 0.86, React 19.2.3, Node 22.13.x minimum, and Xcode 26.4 or later. These are minimums, not proof of a particular EAS image.

**Resolution:** Pin Node 22.22.0, Expo SDK 57, React Native 0.86, and React 19.2.3. Pin an **exact stable EAS macOS/Xcode image**, not `latest`, when the production image is selected. The image must be at least Xcode 26.4 and satisfy Apple’s then-current submission rule; prefer the then-current stable Xcode 26 release supported by Expo. Record the resolved image and build log. Recheck Apple’s requirement within 72 hours of the production build. This resolves ENG-02 and C-01 without pretending a Windows prebuild is an iOS compile.

### 2. `appAccountToken` in an app with no account

**Positions:** Auditor B proposed a random purchase-correlation UUID in `appAccountToken`; Auditor C warned that the API is account-named and should not be misused merely to force correlation.

**Evidence:** StoreKit supports an opaque UUID purchase option and returns it on the transaction. The controlling contract says to include an appropriate set identifier “when supported.” No signature pixels, strokes, hashes, typed labels, or names may be sent to Apple.

**Resolution:** The local durable purchase-intent journal and unique transaction ID are mandatory regardless of token use. The StoreKit adapter exposes an **optional opaque correlation UUID**. Use it only if the selected StoreKit 2 bridge/native spike proves correct round-trip behavior and current Apple documentation/review preparation supports its use for this no-account local purchase correlation. It must be random and unrelated to artwork or labels. If that proof is absent, omit the token; never weaken the finish-last journal or invent an account. This is a fixed specification consistent with “when supported.”

### 3. Side-by-side preview versus very large text

**Positions:** The product contract and Auditor C prioritize a true side-by-side same-document comparison; Auditor A found that forcing two document panels on narrow/large-text layouts can make the core lesson unreadable.

**Evidence:** Apple’s Larger Text criteria require common tasks at 200% or system maximum without overlap or severe truncation. Apple’s layout guidance requires adaptation to orientation, device, and iPad window size.

**Resolution:** Side-by-side remains the default at standard text sizes and is the composition used in marketing screenshots when readable. At accessibility Dynamic Type sizes, Display Zoom, narrow iPhone widths, or constrained iPad windows, stack the two **identical-geometry** variants vertically in one reading sequence. Both versions keep the same fixture, content, scale, drawing, signature size, placement, and date. This is an accessibility adaptation, not a different comparison.

### 4. Whether “Data Not Collected” can be drafted now

**Positions:** Auditor C found it plausible for the app binary because on-device-only processing is not Apple “collection”; Auditor B warned that no backend does not itself prove the answer and that SDKs, StoreKit-derived developer data, support, or diagnostics can change it.

**Evidence:** Apple’s App Privacy rules distinguish on-device-only processing and Apple’s own payment collection from data the developer or partners collect. Apple also holds the developer responsible for third-party SDK behavior.

**Resolution:** Draft “Data Not Collected” only as a **conditional app-binary answer** based on the locked no-telemetry architecture. Mark it unapproved. Final authority comes from the release archive, dependency/SDK inventory, Xcode privacy report, App Store upload diagnostics, and clean-install release-network observation. The privacy policy separately describes website logs, support messages/attachments, Apple purchase records available to the operator, and user-selected destinations. If any SDK or workflow transmits covered data to the developer or partner, change the answer before submission.

### 5. VoiceOver support for freehand drawing

**Positions:** Auditor A required an explicit direct-interaction model; Auditor C cautioned that the app must not claim VoiceOver can create handwriting if it cannot support the interaction.

**Evidence:** Apple requires all common tasks for a published VoiceOver label and provides native direct-interaction traits for custom surfaces. React Native accessibility props alone do not prove custom-canvas operability.

**Resolution:** Implement a named canvas, explicit empty/non-empty state, visible and accessible instructions, safe direct-interaction entry/exit where required, an escape path, slot switching, Clear, Continue, and state announcements. Test on physical iPhone and iPad without sighted assistance. If the drawing task cannot pass, **do not publish a VoiceOver or Voice Control Nutrition Label**; still make every non-canvas task as accessible as possible and disclose the limitation accurately.

### 6. No Undo versus hand-tremor recovery

**Positions:** The controlling contract prohibits Undo; Auditor A identified the cost of requiring a full redraw after one accidental stroke.

**Evidence:** Larger targets, spacing, low latency, palm rejection, and confirmation reduce accidental input, but do not replace stroke-level undo.

**Resolution:** Retain no Undo as a defensible product-simplicity exclusion. Implement a large low-latency canvas, reliable palm/system-gesture rejection where available, generous padding, full-size Clear, and “Keep Drawing” as the safe confirmation action. Never silently alter strokes. Test with reduced fine-motor precision and document the residual limitation; do not market universal tremor accommodation.

### 7. SVG, PDF, Photos, and Copy at launch

**Positions:** The contract permits SVG/PDF only if verified; Auditor B recommends PNG/JPEG first and destination-specific alpha proof; Auditor C requires metadata/screenshots to show only actual functionality.

**Resolution:** Launch baseline is transparent PNG, white PNG, and white JPEG through Files/system Share. SVG is hidden unless owned vector generation, sanitization, bounds, and interoperability tests pass. PDF is excluded from launch unless Apple-viewer alpha/bounds/scaling tests pass. Transparent Photos is hidden or described only after saved-file alpha and workflow tests pass for supported iOS versions. Image Copy requires the owned local-only expiring pasteboard module and a single compatible asset. The UI, website, FAQ, metadata, and screenshots are generated from the same passing format/destination registry.

### 8. App Preview priority

**Positions:** The controlling contract requires research and preparation; Auditor C found the final preview nonessential and potentially harmful because it precedes screenshots.

**Resolution:** Build the 15–30 second storyboard, fixture sequence, captions, capture instructions, audio-free source, and automation. Exclude final App Preview capture/upload from the launch critical path until actual-device footage exists and a poster-frame/readability test shows it improves rather than displaces the strongest screenshot. This exclusion does not reduce local readiness.

### 9. Global territory availability versus regional preparation

**Positions:** The contract requires regional checklists but forbids silently enabling all territories; Auditor C recommends U.S.-first as the safest operational default.

**Resolution:** Prepare configuration and legal checklists for the named regions. The release configuration fails closed without an explicit founder territory selection. Use U.S.-only as the planning default, not as a portal action or irrevocable decision. EU availability remains blocked on DSA trader status/contact verification and regional legal inputs.

### 10. Standard EULA versus custom Terms

**Positions:** The contract asks for Terms and Apple-required provisions if a custom EULA is used; Auditor C found Apple’s Standard EULA safer absent counsel review of a full custom license.

**Resolution:** Rely on Apple’s Standard EULA for the App Store license. Publish separate product Terms for authorized use, purchase scope, local deletion, exports, refunds, and claim limits. Do not upload those Terms as a custom EULA unless licensed counsel later approves complete territory-specific provisions.

## Locked implementation decisions

These decisions amend and clarify the build specification for implementation. They may be changed only by later founder authority supported by new evidence and a documented audit update.

### Product boundary and states

1. The app creates local handwritten signature and initials assets. It does not accept or edit documents and never becomes a signing platform.
2. Signature and initials are independent slots: `empty`, `draft`, `finalized`, or `included_unclaimed` as applicable.
3. Set purchase state is separate: `unpurchased`, `purchase_pending`, or `purchased`. There is no `isPremium`, app-wide entitlement, subscription, or artwork restore control.
4. A finalized purchased slot is immutable. A changed drawing is a new draft set; the original purchased set remains.
5. An included unclaimed slot can be filled once later without StoreKit. This action is idempotent and survives relaunch.
6. Returning sets receive non-personal default text labels such as “Signature Set 1”; thumbnails and color are supplementary.

### Architecture and drawing

7. Use npm workspaces, strict TypeScript, Node 22.22.0, Expo SDK 57, React Native 0.86, React 19.2.3, Expo prebuild/CNG, EAS preparation, exact dependency versions, and a committed lockfile.
8. Use Expo-managed compatible installation (`npx expo install`) and prohibit an unconstrained React Native latest install.
9. Canonical versioned raw points, dimensions, orientation, timing, stroke segmentation, and reliable optional pressure are durable; renderer paths and images are derived.
10. Normalize coordinates across rotation without rewriting canonical points. Both orientations and iPad adaptive layouts remain usable; rotation is optional guidance, not a requirement.
11. No AI beautification, font conversion, shape replacement, silent stroke deletion, or automatic handwriting substitution.
12. No visible Undo. Keep confirmed per-slot Clear and record the motor-access limitation and mitigations described above.

### StoreKit and purchase fairness

13. The product is one repeat-purchasable StoreKit consumable for one frozen local signature-plus-initials set, including one later unclaimed slot.
14. Production price display comes only from StoreKit `displayPrice`. `$1.99` is permitted only in development fixtures and explicitly U.S. store/screenshot artifacts.
15. The adapter must preserve StoreKit 2 verified/unverified results, transaction ID, product ID, pending/cancel/failure, updates, unfinished transactions, explicit finish, and optional verified correlation token. If a maintained bridge fails the contract test, replace only that boundary with an owned Expo native StoreKit module.
16. Before the system purchase sheet: validate an asset, freeze immutable canonical snapshots and hashes, create random set/intent IDs, and durably persist the prepared intent.
17. After a verified callback: validate product/environment/correlation where available; atomically bind unique transaction to frozen set; persist purchased/unclaimed state; read back/checksum; then and only then finish.
18. Launch starts the StoreKit observer early, replays the local journal, and reconciles unfinished transactions idempotently. Unmappable verified transactions enter `recovery_required` and are not silently finished or repurchased.
19. Pending/recovery status is visible, persistent, plain-language, announced once, and blocks duplicate purchase taps. A recovered set never routes to another paywall.
20. StoreKit verification is accepted without a proprietary backend. Server refund telemetry is intentionally excluded. Local revocation information does not delete art or exports and must not create a second-charge loop.
21. The purchase boundary says: no subscription; one purchase for this exact set; the empty companion slot is included; same-set re-export is free; and “Saved only on this device. Deleting the app may delete this set. Exported files are not affected.”
22. The free white-background action is visible, enabled, high contrast, at least 44 points high, and functional when the product is unavailable or purchase is declined.

### Storage, exports, privacy, and network

23. Reusable assets and purchase journals reside in app-only `Library/Application Support/OnlySignature` with `NSFileProtectionComplete`, backup exclusion, same-directory atomic replacement, checksum read-back, and recovery generations. If protected data is unavailable while locked, leave transactions unfinished and reconcile after unlock.
24. Strokes, thumbnails, labels, and purchase mappings never reside in AsyncStorage, UserDefaults, SecureStore, shared app groups, Spotlight, logs, or unprotected caches.
25. Temporary exports use randomized protected names, a cleanup journal, post-handoff deletion where safe, and launch cleanup. Typed labels/names never enter filenames.
26. Image Copy uses an owned local-only expiring pasteboard path. Do not use a generic image clipboard API that lacks those options.
27. PNG transparent/white and JPEG white are mandatory launch formats. SVG/PDF are gated as resolved above. JPEG never appears under a transparency claim.
28. Production `expo-updates` is disabled; the app ships an embedded bundle. No analytics, ads, remote logging, crash upload, remote configuration, remote fonts/images, WebView, accounts, backend, cloud signature storage, or proprietary API.
29. Allowed production behavior is system StoreKit, explicit user-selected OS share/save, and explicit HTTPS external-link opening. Build-time EAS source upload is documented separately and excludes secrets.
30. App Privacy and privacy-manifest answers come from the final archive and observed runtime, not architecture intent alone. No ATT prompt, `NSUserTrackingUsageDescription`, tracking domains, or speculative required-reason declarations.
31. Production configuration fails closed on placeholder/missing identity, bundle/team/product IDs, HTTPS URLs, support contact, territory, real StoreKit mode, legal values, OTA/network policy, or mock fixture mode.

### UX and accessibility

32. All headings, confirm actions, purchase lines, and success text are state-aware for signature-only, initials-only, and both-assets flows.
33. The canvas exposes a named control, empty/non-empty state, instructions, safe assistive direct interaction, exit/escape, slot state, and announcements; physical-device evidence controls public claims.
34. Side-by-side is the normal comparison; same-fixture vertical stacking is mandatory where needed for legibility. No checkerboard appears in the comparison.
35. Every interactive target is at least 44 by 44 points; dominant actions are generally at least 56 points high. Visible label and accessible name agree. Controls expose correct role, selected/disabled state, press/focus state, and logical order.
36. Dynamic Type supports 200%/system maximum without overlap or severe truncation. Glass has opaque/high-contrast fallbacks for Reduce Transparency/Increase Contrast. Information is never color-only.
37. Navigation destinations are deterministic: success Done returns to Saved/the relevant set; Create New creates a separate draft; post-purchase Back never returns to unpaid state; destructive scope is named and confirmed.
38. Errors state what happened, whether work is safe, and the next action; they remain visible while relevant and announce once. User cancellation is neutral, not an error.
39. Accessibility Nutrition Labels remain unapproved until all common tasks pass for each published device family. No “accessible” marketing claim is inferred from automated tests.

### Copy, legal preparation, website, and store assets

40. Use “Created on your device. We do not upload it.” only after final network verification. Explain that user-selected destinations may store or transmit the export. Never use “never leaves your device” or “100% private.”
41. Never imply identity verification, certification, cryptographic/digital signature, notarization, audit trail, legal advice, enforceability, or universal recipient acceptance.
42. Authorized-use terms prohibit forgery, impersonation, fraud, unauthorized signature use, misrepresentation, and illegal alteration. No intrusive identity collection or repeated warning is added.
43. Apple’s Standard EULA applies; separate product Terms remain website/in-app terms unless counsel approves a custom EULA.
44. Privacy policy, Terms, FAQ, purchase scope, format truth, and privacy claims come from authoritative shared content and pass contradiction/drift tests across app, site, metadata, and review notes.
45. The static site contains all required local pages and no tracking technology. Public deployment waits for real legal/contact values, domain, HTTPS hosting authorization, and anonymous URL verification.
46. Only Signature remains a centralized working name until founder/counsel clearance and App Store record availability. No OnlyFans reference, competitor keyword, or imitative trade dress.
47. Deterministic screenshot fixtures show actual implemented UI, the exact same comparison document/drawing/geometry, a realistic white obstruction, and flattened no-alpha outputs. Final iPhone/iPad capture is Apple-environment gated.
48. App Preview preparation is built; final capture/upload is not a launch blocker unless founder later authorizes it after evidence.
49. App Store metadata uses only implemented functionality, exact per-set scope, no competitor brands, no fabricated keyword or market metrics, and no document-signing/legal-certification implication.
50. Territory configuration fails closed. U.S.-only is the planning default; EU and other distribution require explicit founder/legal completion.

## Complete P0/P1 traceability and disposition register

No source report identified a P0. The following table covers every P1 ID from all three reports. The **Disposition** column uses only the four allowed conference outcomes.

| Source ID | Severity | Disposition | Conference closure | Required evidence before release |
|---|---:|---|---|---|
| A-01 | P1 | **Fixed in specification** | Canvas interaction contract is locked in decisions 33 and 39; native direct interaction is authorized where required. | Physical iPhone/iPad VoiceOver and Voice Control common-task runs. |
| A-02 | P1 | **Fixed in specification** | Slot-aware copy and actions are locked in decision 32. | Asset-state navigation/copy tests and VoiceOver transcript. |
| A-03 | P1 | **Fixed in specification** | Default side-by-side plus same-fixture vertical adaptation is locked in decision 34. | Maximum Dynamic Type, compact iPad window, Display Zoom, and visual-regression evidence. |
| A-04 | P1 | **Fixed in specification** | Purchase scope, visible free action, and local-deletion disclosure are locked in decisions 21–22. | Purchase-screen assertions and moderated comprehension evidence. |
| A-05 | P1 | **Fixed in specification** | Durable visible purchase/recovery states and duplicate-tap guard are locked in decisions 18–19. | StoreKit state-machine, UI, and VoiceOver interruption/recovery matrix. |
| A-06 | P1 | **Founder-gated** | Positive accessibility claims are withheld; implementation remains required under decisions 33–39. | Physical devices, final supported device families, and authorized App Store Connect publication. |
| ENG-01 | P1 | **Disproven** | Windows is not a project blocker because EAS provides hosted macOS iOS builds; Windows results are explicitly not iOS certification. | Signed EAS build log/archive plus physical Apple-device evidence. |
| ENG-02 | P1 | **Fixed in specification** | Exact compatible baseline and managed installs are locked in decisions 7–8. | Clean lockfile install, Expo Doctor, clean prebuild, and EAS compile log. |
| ENG-03 | P1 | **Fixed in specification** | Mandatory StoreKit 2 bridge contract and owned-module fallback are locked in decision 15. | Native bridge inspection, StoreKit Test/XCTest, unverified-result rejection, production mock exclusion. |
| ENG-04 | P1 | **Fixed in specification** | Consumable per local set; no global premium/restore is locked in decisions 3, 13, and 20. | Static forbidden-state scan and same-set/new-set/reinstall tests. |
| ENG-05 | P1 | **Fixed in specification** | Frozen snapshot, durable journal, idempotency, recovery, and finish-last are locked in decisions 16–19. | Fault injection after every transition; duplicate callbacks; termination and low-disk cases. |
| ENG-06 | P1 | **Fixed in specification** | Independent slot and set states, included slot, and immutable purchase behavior are locked in decisions 2–5. | Full slot-state/relaunch/duplicate-as-draft suite. |
| ENG-07 | P1 | **Fixed in specification** | StoreKit verification without backend and refund limitations are locked in decision 20; server telemetry is intentionally absent. | Verified/unverified/refund tests and accurate FAQ/Terms/review notes. |
| ENG-08 | P1 | **Fixed in specification** | Owned protected, backup-excluded, atomic storage is locked in decisions 23–24. | XCTest resource attributes, lock test, backup inspection, fault injection. |
| ENG-09 | P1 | **Fixed in specification** | Protected temp cleanup and local-only expiring pasteboard are locked in decisions 25–26. | Native options test, Universal Clipboard check, expiry and orphan-cleanup cases. |
| ENG-10 | P1 | **Fixed in specification** | PNG/JPEG truth and per-format gates are locked in decision 27; optional format claims are excluded until proven. | Pixel decoding, alpha/crop/padding assertions, destination re-import, interoperability tests. |
| ENG-12 | P1 | **Fixed in specification** | Embedded production bundle and runtime allowlist are locked in decisions 28–29. | Generated config/archive review, static domain/API scan, packet/DNS observation. |
| ENG-13 | P1 | **Founder-gated** | Manifest/inventory process is locked in decision 30, but the authoritative archive and App Store diagnostics require Apple build access. | Final `.app`/framework manifest validation, Xcode privacy report, upload diagnostics, policy reconciliation. |
| ENG-16 | P1 | **Fixed in specification** | Typed fail-closed release configuration is locked in decision 31; external values are finite founder inputs. | Unit rejection for each placeholder, bundle/archive scan, product-unavailable free flow. |
| ENG-18 | P1 | **Founder-gated** | Windows suites and native test assets must be completed locally; execution-only Apple checks remain external. | EAS/macOS, StoreKit, iPhone/iPad, archive, performance, accessibility, and network evidence marked actually run. |
| C-01 | P1 | **Founder-gated** | Exact stable Xcode image policy is fixed, but signed build selection and mutable requirement recheck depend on production authorization. | Recheck within 72 hours, resolved EAS image/build log, archive SDK metadata. |
| C-02 | P1 | **Founder-gated** | First-IAP path/assets/checklist are built locally; Paid Apps Agreement, tax/banking, product record, price, sandbox, and submission are portal inputs. | IAP `Ready for Review`, localization/price/availability, review screenshot/notes, physical sandbox success. |
| C-03 | P1 | **Fixed in specification** | No Restore control; pre-purchase deletion disclosure; atomic finish-last fulfillment are locked in decisions 3, 17, and 21. | Kill/reinstall/unfinished-recovery and copy-drift tests. |
| C-04 | P1 | **Fixed in specification** | Transaction observer, verification, unique binding, atomic persistence, and finish-last are locked in decisions 15–19. | Automated failure injection and sandbox termination-after-charge recovery. |
| C-05 | P1 | **Founder-gated** | Conditional Data Not Collected draft is allowed; publication waits for final binary/SDK/network authority. | Xcode privacy report, archive inventory, release capture, final App Privacy review. |
| C-06 | P1 | **Founder-gated** | Actual-only required reasons and dependency inventory are locked; authoritative archive validation requires Apple environment. | Per-bundle manifest lint, privacy report, covered-SDK signatures, upload diagnostics. |
| C-07 | P1 | **Founder-gated** | Complete local/in-app pages are required; real operator/contact/domain and deployment authorization are external. | Anonymous HTTPS 200/TLS/mobile/contact tests and release-build in-app links. |
| C-08 | P1 | **Fixed in specification** | Shared authoritative content and contradiction tests are locked in decision 44; StoreKit price remains localized. | Automated drift suite plus final line-by-line binary/site/store comparison. |
| C-09 | P1 | **Fixed in specification** | Asset-only claim boundary and authorized-use prohibitions are locked in decisions 1, 41, and 42. | Copy/binary/site/metadata/screenshot scan and reviewer path showing no document upload. |
| C-10 | P1 | **Founder-gated** | Centralized working brand is locked; legal clearance and final name reservation remain external. | Attorney-quality federal/state/common-law/international/domain/social/App Store clearance and founder decision. |
| C-11 | P1 | **Founder-gated** | Territory fails closed and U.S.-only planning default is locked; EU requires DSA trader identity/contact evidence. | App Store Connect trader/territory evidence and displayed contact verification. |
| C-12 | P1 | **Founder-gated** | No encryption answer is guessed; final dependencies/archive control the determination. | Final linked-library audit, Info.plist, questionnaire, documentation or specialist review if needed. |
| C-13 | P1 | **Founder-gated** | Accessibility implementation is locked; label publication waits for device-family common-task proof and portal authorization. | VoiceOver, Voice Control, Larger Text, contrast, non-color, Reduced Motion device matrix. |
| C-14 | P1 | **Founder-gated** | Deterministic fixture/composition/flattening is locked; final actual-iOS capture and upload remain external. | Device capture, current dimensions, no-alpha validation, UI/price/localization comparison. |
| C-15 | P1 | **Defensibly excluded** | Proof of commercial viability before launch is not publicly available and will not be fabricated. Narrow differentiation and privacy-safe measurement are locked; viability is a post-launch measurement question. | Current 20-result market/review research locally; later App Store Connect/IAP/PPO metrics if launched. |

## Blockers versus improvements

### Implementation blockers

**None remain after adoption of this conference document.** Every locally actionable P1 is now a locked implementation requirement; external P1s have finite gates that do not prevent unrelated local work.

### Release blockers

The following block a truthful production/App Store release claim:

1. A signed EAS iOS archive built with an exact stable image satisfying current Apple SDK requirements.
2. Final StoreKit bridge contract proof, StoreKit Test/XCTest, sandbox interruption/recovery, and first-IAP portal readiness.
3. Physical-device iPhone/iPad drawing, orientation, export-destination, file-protection, temp, pasteboard, performance, and app-switcher tests.
4. Physical-device Accessibility Nutrition Label common-task evidence for each claim/device family.
5. Final archive privacy manifests, required-reason APIs, covered-SDK signatures, Xcode privacy report, upload diagnostics, and release network observation.
6. Real production release values with no placeholders, mock StoreKit, fixture mode, OTA channel, secrets, or hardcoded price.
7. Live anonymous-accessible HTTPS privacy/support/Terms/FAQ/contact/accessibility pages with real operator/contact information.
8. Final legal operator, Terms/privacy review, export-compliance determination, territory selection, and DSA trader completion where applicable.
9. Final working-name clearance and App Store record availability/reservation.
10. Actual iOS screenshots, correct current dimensions/no alpha, accurate localized fixture, and IAP review screenshot.
11. Paid Apps Agreement, tax/banking, App Store Connect roles, IAP record, price/availability, and submission authorization.
12. A final four-role repository audit proving no drift, hidden network behavior, unsupported claim, unlicensed asset, high-risk vulnerability, or unexecuted test represented as passed.

### Required pre-release improvements (P2/P3)

These do not block implementation. They must be completed locally where possible and either verified or explicitly documented before release:

- opaque/high-contrast glass fallbacks, large-text reflow, keyboard focus, non-color state, reduced motion, and target-size measurement;
- deterministic Back/Done/Create New/delete destinations and accessible error/status announcements;
- text-first Saved-set cards and multi-set VoiceOver traversal;
- no-Undo motor-access mitigations and usability evidence;
- destination-truthful Files/Share/Photos/Copy copy;
- app-switcher cover at native lifecycle boundary and release-log redaction;
- dependency/license/SBOM/vulnerability audit and locked-graph review;
- deterministic icon/screenshot/source-asset hashes and production fixture exclusion;
- optional SVG/PDF/Photos/App Preview kept absent unless their specific gates pass;
- complete research matrices, ASO keyword evidence, screenshot hypotheses, review plan, and privacy-safe measurement plan without invented metrics.

## Finite founder inputs

Only genuinely external inputs may remain. No coding, documentation, testing-fixture, research-draft, or local build task belongs in this list.

1. Final legal operator/entity name.
2. Legal/public mailing address and any jurisdiction-required public phone number.
3. Support email and authorized support contact details.
4. Final public domain and HTTPS hosting/deployment authorization.
5. Final product name decision after professional trademark/common-law/domain/social/international clearance.
6. Apple Team ID, final bundle identifier, SKU, and permission to create/reserve the App Store app record.
7. App Store Connect roles/credentials or API-key access; signing/EAS Apple credential authorization.
8. Paid Apps Agreement, tax, and banking completion/status.
9. Final StoreKit product identifier and approval of the planned U.S. $1.99 price.
10. Final territory selection.
11. DSA trader/non-trader decision, public contact data, and verification documents if EU distribution is selected.
12. Final legal review of privacy policy, Terms, authorized-use language, regional disclosures, and standard-EULA decision.
13. Final export-compliance determination or specialist input if the final archive contains non-standard encryption.
14. Access to/authorization for required physical iPhone/iPad testing, StoreKit sandbox, TestFlight, and App Review.
15. Website deployment authorization.
16. TestFlight and App Store submission/release authorization, including phased versus manual/automatic release choice.

If a founder value is absent, production configuration fails closed. Development fixtures continue with visibly safe nonproduction values and must be excluded from the production bundle.

## Implementation authority and stop rules

The implementation team is authorized to proceed automatically through all local phases. It must stop only at the exact external boundary for a destructive or credentialed action, while continuing unrelated local work.

The team must not:

- declare a signed iOS build from a Windows prebuild or EAS configuration file;
- finish a StoreKit transaction before durable verified local fulfillment;
- enable mock StoreKit or fixture data in production;
- publish Accessibility Nutrition Labels from component-level tests;
- publish “Data Not Collected” from architecture intent alone;
- deploy placeholder legal/support pages;
- add a Restore Purchase control for consumed local artwork;
- market JPEG as transparent, include an unverified format/destination, or show a checkerboard export;
- imply document signing, identity verification, certification, enforceability, or universal acceptance;
- expand into a backend, account, subscription, document upload, analytics, ads, or cloud storage to solve a locally bounded issue;
- treat commercial viability, trademark clearance, legal review, sandbox success, TestFlight, review, or release as complete without the corresponding external evidence.

## Conference final authority

All three auditors authorize implementation under the locked decisions in this report. The authority is deliberately split:

- **Build authority:** granted.
- **Local test authority:** granted.
- **EAS preparation authority:** granted.
- **Public deployment:** founder-gated.
- **Signed Apple build and sandbox/device QA:** founder-gated.
- **App Store Connect changes, TestFlight, IAP submission, App Review, and release:** founder-gated.
- **Trademark and legal clearance:** founder/professional-gated.
- **Production readiness claim:** withheld until the final adversarial repository audit and all applicable release blockers pass.

The conference’s governing product sentence remains:

> Create your signature and initials. Export them cleanly. Nothing else.

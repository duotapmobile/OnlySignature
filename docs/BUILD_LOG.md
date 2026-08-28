# Build Log

## 2026-08-25 - Phase 0 preflight

- Working directory: `C:\Users\mskir\Desktop\Only Signature Build August`
- Initial directory state: empty.
- Unrelated project markers: none found.
- Isolation decision: safe to proceed.
- Host: Windows / PowerShell.
- Node: `v22.22.0`.
- npm: `10.9.4`.
- Git: `2.50.0.windows.2`.
- Expo CLI: not preinstalled; the first `npx expo --version` attempted package resolution, so the project will pin Expo through the workspace lockfile.

This file records only commands and outcomes actually observed. Signed iOS builds, StoreKit sandbox purchases, device accessibility checks, portal actions, and deployment remain distinct external activities.

## 2026-08-25 - Local implementation and verification

- Built the Expo SDK 57 mobile application, owned StoreKit 2 and protected-storage modules, shared packages, Astro site, legal/research packages, brand/icon assets, ASO metadata, and capture automation.
- `npm run typecheck`: passed for all six workspaces; Astro reported 0 errors, warnings, or hints.
- `npm run lint`: passed for every lint-enabled workspace.
- `npm test`: 24/24 tests passed. `npm run test --workspace @only-signature/mobile`: 11/11 passed.
- `npx expo install --check`: compatible. `npx expo-doctor`: 21/21 checks passed.
- `npx expo export --platform ios --output-dir dist-ios`: completed with 25 local export files. This is not a signed native build.
- `npx expo prebuild --platform ios --clean --no-install`: Expo refused iOS generation on Windows and required macOS/Linux. EAS Continuous Native Generation is the prepared boundary.
- Site build: 9 pages. Site validation: 11 required outputs, resolved internal links, zero client JavaScript, and no tracking/font/cookie patterns.
- Static privacy/network/content checks passed; secret-pattern scan found no matches.
- `npm ls --all --json`: valid tree. `npm audit`: 0 critical/high, 12 moderate findings through Expo build tooling's `xcode` -> `uuid <11.1.1`; npm offers only an incompatible Expo 46 downgrade, so no force fix was applied.
- CycloneDX 1.5 SBOM generated at `artifacts/sbom.cdx.json` with 1,151 package-version components.
- Production release validation failed closed on missing founder/legal/public/Apple values as intended.
- `git remote -v`: empty; no remote, upload, push, deployment, or portal mutation occurred.

## 2026-08-25 - Final repository remediation

- Added the owned `OnlySignatureNative` podspec and Apple module configuration. Expo iOS autolinking now resolves the pod, both Swift modules, and the privacy resource bundle. Compilation remains an EAS/macOS gate.
- Reworked the mobile purchase boundary to serialize state writes, retain ambiguous transactions for recovery, validate product and transaction identity, persist/read back a checksummed binding, keep a durable finish-pending deletion lock, finish through StoreKit, and then persist/read back the finished state.
- Removed unproved runtime Copy, direct Photos, and SVG options. The shipped destination is Share / Save to Files; transparent PNG, white PNG, and white JPEG remain.
- Made export dimensions follow the tightly padded drawing aspect ratio and made the white/transparent preview side-by-side at phone and tablet widths.
- Added explicit production ATS denial of arbitrary and local loads and unified release environment names across the root gate, Expo config, and EAS profiles.
- Generated eight deterministic web-rendered fixture masters for iPhone and eight for iPad, each flattened to the current configured size with no alpha. These are local layout/composition proofs, not substitutes for final iOS Simulator captures.
- `npm run check`: passed the consolidated Windows gate, including formatting, type checking, lint, 24 root tests and 17 mobile tests, content drift, configuration, static network policy, native autolinking, and the high/critical advisory threshold.
- `npx expo config --type introspect --json` with complete non-secret production fixtures: `NSAllowsArbitraryLoads=false`, `NSAllowsLocalNetworking=false`, real StoreKit mode, OTA disabled, and the expected bundle identifier.
- Regenerated CycloneDX 1.5 SBOM with 1,145 package-version components.
- Closed the final local audit defects: verified-history recovery for a StoreKit transaction finished before its local completion marker, protected prior-generation state recovery, fail-closed mismatched-token handling, serialized Delete All, removal of residual Copy/SVG/Photos promises, partial white-box obstruction, distinct route-aware screenshot fixtures, corrected iPad framing, and an opaque 1024×1024 IAP review screenshot.
- Added a store-asset verification gate covering 16 exact-size opaque masters, distinct purchase fixtures, and the IAP review asset. The masters are implemented-UI web fixture captures; final native iOS captures remain explicitly gated.

## 2026-08-25 - Sequential code audit, council, and tenth-man remediation

- A first independent agent found three runtime P1 defects: finished-consumable crash recovery relied on history that omits finished consumables by default, thrown purchase calls could remain locked, and rotation changed stroke normalization. A second agent independently confirmed them and proposed a completed-unfinished-snapshot state machine and stable drawing plane.
- Implemented an owned StoreKit outcome split for verified, unverified, pending, cancelled, terminal `Product.PurchaseError`, and ambiguous bridge/system interruption. UUID account tokens are lowercase at the native boundary and compared case-insensitively in TypeScript.
- Replaced transaction-history proof with completed `Transaction.unfinished` snapshots. Observer callbacks, snapshot decisions, purchase-result transitions, individual deletion, and Delete All use one reusable serial queue; StoreKit purchase-sheet presentation remains outside it. Snapshot/finish calls are bounded, and timeout never proves absence.
- Removed the experimental hidden abandoned-intent design after the council and tenth man showed double-charge, deletion, privacy, and tokenless-correlation risks. Ambiguous artwork remains visibly frozen; paid retry and destructive deletion are blocked while free drafts and white-background export remain available.
- Added stable drawing-plane transforms, rejected touches in aspect-fit margins, gated included-slot drawing until transaction finishing resolves, made the comparison stack for narrow/large-text layouts with one semantic accessibility summary, and improved paid-set deletion copy.
- Added semantic state validation with backup fallback, same-session temporary export cleanup including partial failures, and a production EAS lifecycle hook in the mobile app root.
- Focused validation after remediation: mobile TypeScript passed, lint passed, 26/26 mobile tests passed, development app-root EAS hook ran, and a production-mode negative test rejected all missing release values as expected.

## 2026-08-25 - Final corrected-source authority

- The engineering auditor re-reviewed the corrected pre-sheet transaction boundary and returned APPROVE with no remaining local P0/P1 defect.
- `npm run check`: exited 0 after all corrections. The gate passed Prettier, strict TypeScript, lint, 24 root tests, 26 mobile tests, content drift across 122 files, release configuration, static production-network policy, native autolinking, store-asset verification, and the high/critical dependency threshold.
- `npx expo-doctor@latest apps/mobile`: 21/21 checks passed.
- The app-root production lifecycle check was run with `EXPO_PUBLIC_RELEASE_MODE=production` and correctly exited 1 because founder/legal/public/Apple release values and real StoreKit mode are absent.
- `git diff --check`: passed. `git remote -v`: empty.
- Final authority is local-source approval with explicit EAS/macOS compilation, StoreKit sandbox, physical-device, runtime-network, final native screenshot, founder-input, signing, and submission gates.

## 2026-08-26 - Final local acceptance and authorized publication

- Closed the post-council StoreKit, purchase-recovery, drawing-letterbox, large-text/VoiceOver comparison, finish-pending included-slot, partial-export cleanup, EAS-hook, shipping-identifier, public-copy, and U.S.-only release-gate findings.
- The final hostile re-review returned APPROVE with no remaining locally fixable P0/P1.
- `npm run check`: exit 0; 27/27 root tests and 42/42 mobile tests passed; content drift covered 128 files.
- Site build/validation, 6/6 pixel export tests, Expo Doctor 21/21, unsigned iOS bundle export, production fixture inspection, native autolink, store assets, static network policy, SBOM generation, resolved dependency tree, and secret scan passed.
- The site release check intentionally failed only on legal mailing address and governing law. The EAS production lifecycle check intentionally failed closed without external release values.
- The dependency gate found no high/critical advisories; 12 moderate transitive Expo build-tool advisories remain documented without a breaking force fix.
- GitHub `origin` is now founder-authorized. Signed build, StoreKit sandbox, physical-device, DNS/deployment, legal completion, and App Store submission remain explicit external gates.

## 2026-08-26 - Legal contact and GitHub Pages DNS preparation

- Classified DuoTap LLC's Apple membership address as private and excluded it from public artifacts; confirmed the public review phone, Team ID, U.S.-only territory decision, support email, bundle identifier, and App Store Connect app record.
- Regenerated the shared legal-content module. The site release gate now blocks only on the governing-law choice.
- Selected GitHub Pages behind the existing Namecheap BasicDNS configuration, added the static `CNAME` and `.nojekyll` artifacts, and documented the exact apex A/AAAA and `www` CNAME changes while preserving Namecheap MX and SPF email-forwarding records.
- `npm run build --workspace @only-signature/site`: built 9 pages. `npm run validate --workspace @only-signature/site`: passed 11 required outputs, internal links, zero client JavaScript, and prohibited-tracking checks.
- `npm run check`: exit 0; 27/27 root tests and 42/42 mobile tests passed, with formatting, strict TypeScript, lint, content drift, release configuration, static network policy, native autolinking, store assets, and high/critical dependency threshold passing.
- `npm audit` reported 12 moderate transitive advisories in Expo build tooling; the offered full fix is breaking and was not forced.

## 2026-08-27 - Public website gate and GitHub Pages branch

- Selected a Florida governing-law draft for the Florida LLC and U.S.-only launch while preserving mandatory consumer protections and small-claims remedies; professional legal review remains required before App Store release.
- Kept the private Apple membership address and phone out of public source, generated legal content, and deployment output.
- `npm run release:check --workspace @only-signature/site`: passed after building 9 pages and validating 11 required outputs, internal links, zero client JavaScript, and prohibited tracking/font/cookie patterns.
- `npm run check`: exit 0; 27/27 root tests and 42/42 mobile tests passed with formatting, strict TypeScript, lint, content drift, release configuration, static network policy, native autolinking, store assets, and high/critical dependency threshold checks.
- Published the validated static output as remote `gh-pages` root commit `e0d9c6d` with `CNAME` set to `onlysignature.app` and `.nojekyll` present. GitHub Pages activation, Namecheap DNS edits, certificate issuance, and anonymous HTTPS checks remain external control-panel steps.

## 2026-08-28 - TestFlight readiness branch and native screenshot boundary

- Verified the exact clean starting state: `main` at `759212dd6561ce19bf682e019004e7c3bb02c1f9`, origin/main at `c38ea04bc28a4432594e32587d37c92869bffb18`, exactly one local commit ahead. Created `codex/only-signature-testflight-readiness-2026-08-28` from that exact HEAD; remote main remained untouched.
- Rechecked Apple and Expo primary documentation. Apple requires iOS/iPadOS 26 SDK or later for uploads after April 28, 2026. Expo SDK 57 maps to `macos-tahoe-26.5-xcode-26.6`. Current 6.9-inch/13-inch target sizes remain 1290×2796 and 2064×2752 within Apple’s accepted sets.
- Ran `npm run check` on pinned Node 22.22.0/npm 10.9.4: exit 0; formatting, strict TypeScript, lint, 27 root tests, 42 mobile tests, content drift, release config, static network policy, native autolink, composition-evidence store assets, and the high/critical audit threshold passed. Twelve moderate transitive Expo build-chain advisories remain; no breaking force fix was used.
- Pinned EAS CLI 23.0.0. Read-only identity inspection found `notebox` and `noteboxs-team`, with no DuoTap Expo organization. No project was linked and no charge was initiated.
- Added a credentials-free screenshot-only iOS Simulator profile and an EAS macOS workflow that builds the real React Native app, proves Maestro availability, asserts every route/state, captures exact-size iPhone 15 Pro Max and iPad Pro 13-inch (M4) frames, records build/workflow/simulator/route hashes, composes opaque native-derived assets, and verifies all 16 frames plus the IAP image.
- Moved the existing deterministic web-rendered masters under explicitly labeled `composition-evidence` paths. They remain useful layout proof but cannot satisfy the native screenshot gate.
- Aligned Expo configuration to the verified existing project owner `duotap` and slug `onlysignature`; the app stays intentionally unlinked until the local CLI can authenticate to that owner and read the existing project UUID.
- Added a production-only EAS workflow that builds the signed archive, downloads and inspects the exact IPA, emits a hashed inspection report, and uploads to internal TestFlight only after inspection passes. It explicitly does not request beta review or public release.
- The founder created and secured the App Store Connect team API key outside Git. Its non-secret metadata is available for EAS setup; no private-key contents were read, printed, or committed.
- Re-ran `npm run check` after these changes: exit 0; 28 root tests, 42 mobile tests, formatting, strict TypeScript, lint, content drift, release configuration, static network policy, native autolink, composition-evidence store assets, and the high/critical dependency threshold passed. Twelve moderate Expo build-chain advisories remain without a breaking force fix.

## 2026-08-28 - Current council and tenth-man remediation

- Ran independent defect and improvement agents, then three independent council roles with the executor as fourth authority, followed only afterward by an adversarial tenth man. No P0 was found; all locally actionable P1 findings were adopted.
- Verified Expo CLI as `duotap` / `admin@duotap.app` and exact existing project `@duotap/onlysignature`, ID `954b1a21-89e9-41af-8021-d7c8e66d74c8`. No duplicate project was created.
- Recorded the existing project ID in dynamic app config and every EAS profile; production rejects any different ID. Corrected the workflow manual trigger and passed pinned EAS 23.0.0 schema validation for both workflows.
- Gated screenshot query parameters behind the embedded fixture capability, changed multi-asset success to require per-asset confirmation, and removed repeated authorized-use interruption from Create New and Duplicate.
- Added explicit no-second-charge recovery that freezes and durably binds replacement artwork to a verified unmatched consumable before finishing. Snapshot reconciliation now returns recovered success instead of overwriting it with failure copy.
- Extended the network scanner to checked-in Swift/Objective-C modules with a mutation test. Strengthened signed-archive provenance, profile expiration/application ID, every bundled privacy manifest, and required-reason values.
- Added a fixture-gated native view-shot export harness for actual PNG/JPEG alpha, opacity, visible-stroke, padding, and hash verification on the EAS simulator.
- Corrected the canonical privacy policy to name GitHub Pages and regenerated synchronized in-app/site legal content.
- Added post-upload App Store Connect verification for the exact processed build, `Only Signature Internal` assignment, 1.0.0 train, and en-US What to Test.

## 2026-08-28 - Local TestFlight acceptance gate

- Honored the private coordination hold, recorded exact working-tree scope, and resumed only after the matching coordinator clearance. No cloud workflow was dispatched during the hold.
- Closed the production-network drift with an exact allowlist entry for GitHub's published privacy statement, which is linked by the canonical GitHub Pages disclosure. A regression test proves unrelated GitHub URLs remain blocked.
- Kept exact `eas-cli@23.0.0` as an on-demand release tool rather than a product dependency. The product audit returned to zero high/critical advisories; 12 moderate Expo/Xcode build-chain findings remain governed without a breaking force fix.
- `npm run acceptance:local`: exit 0. Prettier, strict TypeScript, lint, 34/34 root tests, 51/51 mobile tests, content drift across 134 files, release configuration, network policy, production introspection, iOS autolink, composition-evidence assets, secret scan, dependency threshold, 6/6 export pixel tests, and the static-site release check passed.
- Site release check built 9 pages and validated 11 required outputs, resolved internal links, zero client JavaScript, and no forbidden tracking/font/cookie patterns.
- Regenerated the CycloneDX SBOM with 1,146 components after locking the exact optional Apple Silicon Astro compiler binding.
- Exact EAS CLI readback: `duotap` / `admin@duotap.app`, project `@duotap/onlysignature`, ID `954b1a21-89e9-41af-8021-d7c8e66d74c8`; both workflows passed schema validation.
- Coordinator live readback confirmed the existing Expo GitHub base directory is `/apps/mobile`. No workflow was dispatched as part of that mutation.
- Published review commit `07e94d825280f53006bcdc44769a86a4a41eb5a8`; remote branch SHA matched exactly and `origin/main` remained unchanged.
- Native screenshot workflow `01a04a04-4d70-716e-a1f1-7d6b3be9fa38` failed safely in source acceptance before simulator allocation. The exact log identified an implicit app-config callback type and npm's missing Apple Silicon Astro optional binding.
- Added the explicit type and exact optional `@astrojs/compiler-binding-darwin-arm64@0.4.0` lock entry. Full local acceptance passed again; no production/TestFlight workflow was dispatched.
- Native screenshot workflow attempt 2 `01a04a11-4b4c-7c03-9bcb-605d3de35e51` ran from exact commit `1ba067bdbd4c3f3d0cc10ddf32eb2cbb2e4459c7`. Source job `01a04a11-4e1f-7645-84a2-3a87a7f65e0e` failed after the preceding source checks passed because Astro's production build could not load `@bruits/satteri-darwin-arm64`. Simulator build and capture were skipped; no artifact was produced.
- Added exact optional `@bruits/satteri-darwin-arm64@0.10.5`, verified its resolved integrity entry in the lockfile, and passed focused Astro type/build checks plus the complete local acceptance suite: 34/34 root tests, 51/51 mobile tests, 6/6 export tests, all policy/configuration/asset/secret checks, and the 9-page site release check. Regenerated the CycloneDX SBOM with 1,147 components. No production/TestFlight workflow was dispatched.
- Native screenshot attempt 3 `01a04a23-b532-710b-b6cd-6022eebda314` passed source acceptance and reached the real Xcode simulator build. Job `01a04a24-e54b-7a0a-935e-96c427da299c`, build `4addf60f-a080-4587-a3c0-de0d205c6126`, failed on three writes to get-only `URLResourceValues.fileProtection` and one ambiguous StoreKit `Transaction` type. Capture was skipped and no artifact was produced.
- Preserved complete file protection through `FileManager.setAttributes`, preserved backup exclusion through writable URL resource values, removed all get-only property writes, and fully qualified every intended `StoreKit.Transaction` reference. Added fail-closed source regression tests. Focused native tests passed 53/53, then the full acceptance suite passed: 34/34 root, 53/53 mobile, 6/6 export, all policy/configuration/native/store-asset/secret checks, and the 9-page site release check. Dependencies did not change, so the 1,147-component SBOM remains current. No production/TestFlight workflow was dispatched.
- Native screenshot attempt 4 `01a04a3b-bcbf-7c99-993a-4948bb1aa82c` proved the corrected native sources compile: simulator build `412cb20a-4f02-4810-810f-cfad4bc1bb6a` finished successfully from exact commit `ccff39c8e839e19c29b41a0f39fb8ae9cbbbfbee`. Capture job `01a04a43-a988-7f74-91fd-3cb8cb3824ad` then failed before the first frame because the deep link was sent immediately after process launch and the requested route copy was not visible.
- Verified with the installed Expo Router parser that `onlysignature:///draw?fixture=both` resolves exactly to `draw?fixture=both`, and verified the iOS Hermes bundle contains the draw route and exact `Draw Your Signature` copy. Replaced the launch race with deterministic Maestro gates: the hydrated `saved-screen` fixture shell must be visible before a deep link is sent, and each route's unique first copy assertion must be visible before final assertions and capture. Added a focused regression test plus a store-asset flow-order guard.
- Full local acceptance passed after the route-readiness correction: 36/36 root tests, 53/53 mobile tests, 6/6 export tests, all formatting/type/lint/content/config/network/introspection/native/store-asset/secret/audit gates, and the 9-page static-site release check. No dependency changed, no production/TestFlight workflow was dispatched, and the 1,147-component SBOM remains current.
- Native screenshot attempt 5 `01a04a5b-7534-7296-bf44-b7a008255d38` again passed source acceptance and its real simulator build (`74003cfa-d773-4b1e-bd6b-154a87fe3b06`) before capture failed on the first route. The 30-second failure after proven fixture-shell readiness disproved another timing delay; zero frames and no artifact were produced.
- Changed the capture boundary to a true cold launch for every route: terminate the installed app, invoke the exact fixture URL with `xcrun simctl openurl`, conditionally accept iOS's documented first-use `Open in "Only Signature"` prompt, then require the hydrated global app marker and exact route/state assertions. The same plan now covers native export verification, and capture fails closed if the app bundle does not register the `onlysignature` URL scheme.
- Focused cold-launch regression tests passed 4/4. Complete local acceptance then passed with 38/38 root tests, 53/53 mobile tests, 6/6 export pixel tests, formatting, strict TypeScript, lint, content/config/network/introspection/native/store-asset/secret/audit gates, and the 9-page static-site release check. No dependency changed; the 1,147-component SBOM remains current. Production/TestFlight were not dispatched.

## 2026-08-28 - Native attempt 6 and retained launch diagnostics

- Native screenshot workflow attempt 6 `01a04a7e-76a2-7beb-8ee5-ccb805323179` ran from exact synchronized commit `6453eaf5379eafb5ebf617142b2a389ca121ee97`. Source acceptance passed. Simulator build `7893e422-422d-4ddf-a35c-884f826f4d48` passed with fingerprint `09e37a2c115af5b7ad278457fa8fcca2a6719d97`.
- Capture job `01a04a87-423c-7944-80c5-a5ba66fafb31` failed before frame one: the cold `simctl openurl` command completed without error, the exact-text optional confirmation flow was skipped, and `app-ready` remained absent for 30 seconds. No screenshot artifact was produced; production/TestFlight stayed undispatched.
- Downloaded and inspected the exact passed simulator artifact. Its binary Info.plist registers `onlysignature` and `com.duotap.onlysignature`, identifies bundle `com.duotap.onlysignature`, enables only the screenshot fixture build, uses mock StoreKit, and stamps exact source revision `6453eaf5379eafb5ebf617142b2a389ca121ee97`. Scheme registration is not the failure.
- Added diagnostic-only instrumentation, without changing navigation behavior: immediate post-open screenshot, accessibility hierarchy, process state, frontmost-app query, relevant launch log, command exit/stdout/stderr records, explicit Maestro debug-output directory, and an always-run EAS artifact upload. Focused regression coverage prevents these diagnostics from being removed or skipped on failure.
- Pinned `eas-cli@23.0.0` accepted the instrumented workflow schema. Focused diagnostic regression tests passed 5/5. The complete local acceptance suite then passed from the monorepo root: 39/39 root tests, 53/53 mobile tests, 6/6 export pixel tests, formatting, strict TypeScript, lint, content/config/network/introspection/native/store-asset/secret gates, zero high or critical advisories, and the 9-page/11-output static-site release check. No dependency changed; the 1,147-component SBOM remains current.
- A final-tree rerun exposed one subprocess-based production release test exceeding Vitest's generic 5-second limit under concurrent load. The same guard passed immediately in isolation and still rejected production fixture mode. Set the suite's explicit timeout to 15 seconds, focused production-release tests passed 5/5, and the complete final-tree acceptance rerun passed with the same 39 root, 53 mobile, 6 export, policy, audit, and site results.

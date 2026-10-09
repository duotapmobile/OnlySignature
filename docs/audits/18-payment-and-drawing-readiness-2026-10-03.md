# Payment and drawing readiness

Date: October 3, 2026 (America/New_York)

Checkout: `codex/full-paper-redesign`
Authority: Founder request to finish the cohesive UI, drawing behavior, and payment integration; existing visual design specification and product invariants remain authoritative.

## Implemented corrections

- Production retains the existing StoreKit 2 integration and consumable `com.duotap.onlysignature.transparent_set_v1`. No payment processor, backend, account, global entitlement, or new native dependency was added.
- Apple product lookup is single-flight, bounded to 15 seconds, and validates the configured product ID and a non-empty localized display price. A late timed-out request cannot overwrite the result of a retry.
- All three purchase-capable screens use the same loading, unavailable, retry, ready, busy, and existing-purchase recovery presentation. `Loading Apple Price...`, `Retry Apple Price`, and `Apple price unavailable` are explicitly new transient-state copy, not changes to locked product marketing copy. Lookup retry does not purchase or freeze a set. The free white-background path remains available during catalog-only loading/failure.
- A new purchase requires a fetched Apple price; fixture `$1.99` is not a production fallback. The displayed price is retained throughout an active purchase even if a foreground catalog refresh fails.
- Rapid purchase taps are guarded before the purchase operation and its haptic. Shared controls do not also fire a duplicate purchase haptic. Provider preflight rejects a changed active set after asynchronous product lookup, before freeze or charge.
- Feedback now distinguishes request failure, cancellation, pending approval, failed verification, interrupted recovery, unbound verified transactions, and transaction finishing. A success haptic requires the verified configured-product transaction to be durably bound to a purchased local set with no outstanding finish flag. A StoreKit `purchased` response alone is not presented as completed fulfillment.
- A final source review caught ambiguous thrown-operation errors taking precedence over the provider's saved purchase hold. Those exceptions now opt into live recovery-message priority; ordinary catalog failures still show an error and definite cancellation/verification results keep their own feedback. A regression covers all hold types, unbound recovery, no-hold failure, and non-mutation. This is a presentation correction, not a transaction-policy change.
- The existing journal, export hashing, durable readback, finish-last ordering, immutable purchased slots, and recovery queue remain in place. The new fulfillment-state value is presentation-only and is not serialized into the local state envelope.
- Finger smoothing and minimum point sampling now operate in physical display points rather than the canonical stored drawing plane. The same physical gesture has consistent filtering on a small phone, landscape canvas, and enlarged iPad surface. Filtered coordinates map back to the existing storage plane. Touch-down remains at the finger coordinate; letterbox touches are rejected. Saved signatures, stroke width, serialization, and export geometry are unchanged.
- Shared navy/paper geometry, content-width arrowless primary controls, document examples, typography, and soft tinted elevation are retained. The attribution map and new interaction contracts are recorded in `docs/visual-design-spec.md`.

## Verification completed

- Final cache-corrected local Expo web export: `_expo/static/js/web/entry-93ac02a1b587112b13a092a9d9c01031.js`; its embedded fixture and Layout Studio flags were verified enabled. No application code has changed after this export. An earlier interrupted matrix belongs to a superseded bundle and is not the final pass.
- Full workspace formatting, typecheck, and lint passed. Final mobile typecheck/lint and all 158 mobile tests passed after the exception-priority correction. All 53 root tests passed again after the preview-tooling correction. The new regressions cover catalog concurrency/timeout/retry, truthful purchase outcomes, active-set guards, haptic ownership, physical-scale drawing, and live recovery-message priority.
- Content drift, development release configuration, static production network allowlist, production introspection, iOS native-module autolink, existing composition store-assets verification, and source secret scan passed.
- Six export regression tests passed separately. Website local build, content/link validation, and placeholder release checks passed separately; nothing was deployed.
- Payment UI checks passed 27 route/state/viewport combinations across 375x667, 667x375, and 768x1024, with loading, unavailable, ready, retry, and reachable free fallback controls. All 36 actual state/retry screenshots are captured in `artifacts/payment-ui/`; the report explicitly identifies the isolated mock catalog and excludes native StoreKit evidence. No runtime errors were recorded.
- The refreshed complete browser UI gate and contact-sheet inspection are recorded below when finished. Passing source tests are not substituted for visual inspection.
- The first final-preview attempt was correctly rejected at screen readiness: it contained disabled fixture settings and rendered the native-storage protection message, with no runtime errors. Correcting environment flags alone did not invalidate Metro's embedded Expo Constants configuration. A local `expo export --clear` corrects the QA cache; the Layout Studio export now uses the same cache-clear step to prevent reuse of another mode's configuration. No application guard or readiness assertion was removed.

## Remaining release boundaries

- `npm run acceptance:local` is **not passing**: it reached the unchanged high-severity dependency-audit gate and failed with 37 affected packages (25 high, 12 moderate). The chained export/site checks were not reached, so they were run and passed separately. No forced fix, downgrade, override, or risk waiver was applied.
- Current authenticated App Store Connect product, price, availability, and agreement verification is **not available**. The read-only ASC verifier exited before contacting Apple because `ASC_KEY_ID`, `ASC_ISSUER_ID`, `ASC_PRIVATE_KEY_PATH`, `ASC_APP_ID`, and `ASC_IAP_ID` are absent. The founder has been asked for the existing key's file location only and confirmation of Paid Apps Agreement, banking, and tax readiness; no secret contents are requested in chat. These account requirements follow [Apple's configuration guidance](https://developer.apple.com/help/app-store-connect/configure-in-app-purchase-settings/overview-for-configuring-in-app-purchases/), not a guess based on the earlier product-unavailable screenshot.
- No current iPhone StoreKit sandbox transaction has been observed. Apple-side readiness and an actual localized price, cancellation, purchase, interruption/relaunch, and finish/recovery sequence still require authenticated ASC access and a compatible iOS test runtime. Browser mock success is not payment fulfillment evidence.
- Native iOS touch feel, Dynamic Type/VoiceOver, native splash handoff, protected storage behavior, and Photos/Share destinations remain unverified on this Windows host. No claim of perfection, production readiness, or exhaustive test coverage is made.
- No native/cloud binary build, GitHub commit/push, TestFlight upload, store submission, or deployment was started in this pass.

## Preservation

Hash checks confirmed unchanged founder `review-feedback.json` and `SCREEN-FEEDBACK.md`, user-owned ASO research, `package-lock.json`, and all three existing emergency TestFlight evidence artifacts. Existing unrelated working-tree changes were not discarded or included in a blanket commit. Founder screen review statuses remain unchanged.

## Changed files in this pass

- Payment services/state: `apps/mobile/src/services/productCatalog.ts` (new), `services/storekit.ts`, `state/AppStateProvider.tsx`, `hooks/use-transparent-purchase.ts`, `domain/purchase-result-feedback.ts` (new), and `domain/purchase-feedback.ts`, under the same `apps/mobile/src/` root.
- Shared controls/routes: `apps/mobile/src/components/purchase-action.tsx`, `components/flow-ui.tsx`, `app/purchase.tsx`, `app/clear-background.tsx`, `app/free-export.tsx`, and `domain/screenshotFixtureAuthorization.ts`, under the same source root.
- Drawing: `apps/mobile/src/domain/drawing.ts` and `apps/mobile/src/components/SignatureCanvas.tsx`.
- Regression tests under `apps/mobile/test/`: new `product-catalog.test.ts` and `purchase-result-feedback.test.ts`; updated `drawing.test.ts`, `purchase-feedback.test.ts`, and `audited-flow-ui.test.ts`.
- Preview/verification: new `scripts/verify-payment-ui.mjs`; updated `scripts/verify-ui.mjs`, `scripts/layout-studio.mjs`, and root `package.json`.
- Design/evidence: updated `docs/visual-design-spec.md`, this new readiness record, and generated browser screenshots/reports. Older unrelated redesign changes remain outside this pass's inventory.

## Refreshed rendered evidence

The complete `npm run verify:ui` gate passed on the final cache-corrected bundle `93ac02a1b587112b13a092a9d9c01031`: flow geometry; five portrait and five matching landscape sizes; all four capture modes; Home/confirmation actions; secondary screens and actual browser-ink interaction; async purchase/export recovery; startup recovery/readiness; persistent purchase recovery; catalog loading/failure/retry; contrast, control, focus, and dialog checks; and isolated feedback-workspace zoom/markup/save/export. The final matrix completed 240 route layouts, 10 dialog layouts, and 10 opening captures with zero findings and zero runtime errors. These are browser checks, not native or physical-device coverage.

All 45 main-flow screenshots (15 screens at three preview sizes) were regenerated after that gate. The complete refreshed main contact sheet was inspected, alongside small-phone Home, capture, Review, background selection, download-quality, white export, and Saved Sets close-ups; both secondary-screen sheets; the real browser-ink Review; current purchase ready/unavailable states; the current small-phone opening; and the 10-size opening and format-dialog contact sheets. The previously reported copy/button overlaps and hidden standard-text main actions were not present in those inspected browser renders. Intentional list/information-page scrolling and the brief full-screen opening remain distinct from fixed main-task screens.

The accessibility-audit guidance was used for readable status feedback, disabled/busy semantics, usable targets, and focused manual/automated control checks. It did not add a VoiceOver feature or establish native accessibility certification. Founder approval and the release boundaries above remain open.

The actual implementation remains available in the local zoomable review workspace at `http://127.0.0.1:4176/studio/review.html`. Actual captures are in `artifacts/actual-flow-preview/`, `artifacts/payment-ui/`, `artifacts/visual-cohesion/`, and `artifacts/visual-layout-matrix/`. No image-generated mockup is being presented as implementation evidence.

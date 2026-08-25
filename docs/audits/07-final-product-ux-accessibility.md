# Final Actual-Repository Product, UX, and Accessibility Audit

**Product:** Only Signature  
**Audit date:** 2026-08-25  
**Checkout:** `C:\Users\mskir\Desktop\Only Signature Build August`  
**Branch / commit inspected:** `main` at `53ad3b2` (`docs: establish research and build authority`)  
**Authority:** `docs/audits/06-final-authority.md`, incorporated by `docs/LOCKED_DECISIONS.md:3-4`  
**Audit posture:** actual current source, tests, documentation, and store-fixture pipeline; no implementation changes

## Verdict

**PRODUCT / UX / ACCESSIBILITY RELEASE NO-GO. BUILD AUTHORITY MAY CONTINUE.**

No P0 was established in this review: the substantive free export remains available, purchased sets are not intentionally overwritten, and the state layer blocks a second StoreKit call while a local pending identifier exists. However, **11 P1 release blockers and 5 P2 defects remain in the actual UI and evidence pipeline**. The written specification closes the earlier design questions, but the runtime does not yet implement several binding closures.

The most serious gaps are: a production-visible `$1.99` fallback when localized StoreKit product loading has not succeeded; no durable, visible recovery experience for pending/unverified/recovered purchases; signature-only hard-coded copy in initials/both flows; omission of the pre-purchase local-deletion disclosure; an assistive drawing canvas without the required state/direct-interaction/escape contract; unconditional exposure of unproven SVG/Photos/Copy features; false-positive success after a dismissed share sheet; and screenshot routes whose query fixtures are ignored.

Positive App Store Accessibility Nutrition Labels, final screenshots, and release claims remain withheld under `docs/LOCKED_DECISIONS.md:25,29` and `docs/audits/06-final-authority.md:172-189`.

## Scope, authority, and limits

This audit treats WCAG 2.2 AA as a supporting reference and the locked iOS requirements as governing. The binding product requirements are in `docs/PRODUCT_REQUIREMENTS.md:7-67`; the locked product decisions are in `docs/LOCKED_DECISIONS.md:6-30`; detailed expected navigation and copy are in `docs/ux/USER_FLOW.md:3-57` and `docs/ux/COPY_DECK.md:3-86`; accessibility acceptance is in `docs/accessibility/ACCESSIBILITY_SUPPORT.md:3-42`.

The review covered every mobile route under `apps/mobile/src/app`, shared UI and drawing/export components, runtime state, StoreKit adapter, export service, fixture state, app configuration, E2E definitions, store screenshot scripts/manifest, shared copy, mobile/domain tests, repository tests, and the public site's semantic/accessibility shell. The site has a skip link, landmarks, visible focus styles, reduced-motion CSS, and an explicitly provisional app-accessibility statement (`apps/site/src/layouts/BaseLayout.astro:34-111`, `apps/site/src/styles/global.css:41-54,656-677`, `apps/site/src/pages/accessibility.astro:11-19`). No site P1 was found by static review.

This was a Windows source audit. It did not and cannot prove a signed iOS build, StoreKit sandbox behavior, physical VoiceOver/Voice Control interaction, Dynamic Type rendering, iPad keyboard/window behavior, final destination preservation, or submitted App Store screenshots. Those remain Apple/device gates, not local passes.

## Severity and closure model

| Severity | Meaning in this audit                                                                                                  |
| -------- | ---------------------------------------------------------------------------------------------------------------------- |
| P0       | Immediate safety, paid-entitlement, or truth failure with no acceptable release path.                                  |
| P1       | Blocks a core flow, purchase fairness, material accessibility, or truthful release. Must close before release.         |
| P2       | Material usability/accessibility degradation with a workaround; fix before release or explicitly accept with evidence. |

`Local` means the repository can and must be corrected without founder input. `Device` means a local correction still needs signed/native or physical-device proof. `Founder` means a product/commercial/publication decision remains outside local authority. A device or founder gate does not excuse a locally fixable defect.

## Locked screen and navigation-state coverage

| Screen/state                                 | Actual implementation                                                                                                                                                        | Audit result                                                                                                                                 |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Landing                                      | One primary `Get Started`; Privacy/Terms links; returning work redirects to Saved (`apps/mobile/src/app/index.tsx:15-73`).                                                   | Core route present. Returning redirect makes the manifest's landing fixture unreachable; see P1-09.                                          |
| Draw: Signature / Initials                   | Independent tabs and strokes exist (`apps/mobile/src/app/draw.tsx:24-112`).                                                                                                  | Heading is always `Draw Your Signature`; canvas contract and large-text layout are incomplete; see P1-03, P1-05, P1-06.                      |
| Empty Continue / Clear                       | Empty Continue shows an alert-role message; Clear confirms with safe default (`apps/mobile/src/app/draw.tsx:38-55,100-113`).                                                 | Core behavior present. Empty copy drifts from the deck; orientation helper is not the locked optional wording; see P2-02.                    |
| Preview                                      | Same component renders white and transparent fixture side by side or stacked below 720 px (`apps/mobile/src/components/DocumentComparison.tsx:6-48`).                        | Geometry is shared, but copy, accessibility grouping, text-size adaptation, and initials context are incomplete; see P1-03, P1-06, P2-03.    |
| Missing slot                                 | Add and Continue are visible; Continue proceeds to purchase (`apps/mobile/src/app/missing-slot.tsx:14-46`).                                                                  | Included-slot concept is present; signature case says `Add them`, and purchase scope then becomes inaccurate; see P1-03 and P2-02.           |
| Purchase / free choice                       | Localized product field, one-set/no-subscription text, and visible free button are rendered (`apps/mobile/src/app/purchase.tsx:46-90`).                                      | Price is not fail-closed, state-aware scope and deletion disclosure are absent, and recovery states are incomplete; see P1-01 through P1-04. |
| Pending / checking / recovered / unavailable | Domain state stores `pendingPurchaseId`; transaction reconciliation exists (`apps/mobile/src/state/AppStateProvider.tsx:142-193,335-411`).                                   | Required persistent accessible UI states do not exist; see P1-02.                                                                            |
| Free export                                  | White PNG/JPEG defaults and the same 1200×600 capture path are used (`apps/mobile/src/components/ExportFlow.tsx:33-43,124-167`; `apps/mobile/src/services/export.ts:21-46`). | Substantive free quality and repeatability are present. Destination/success defects affect both tiers; see P1-08.                            |
| Paid export / same-set re-export             | Purchased route rejects an unpaid set; purchased sets open Export from Saved (`apps/mobile/src/app/export.tsx:5-8`; `apps/mobile/src/app/saved.tsx:27-30`).                  | No repeat paywall in the ordinary purchased state. Unproven SVG/Copy/Photos are exposed; see P1-07.                                          |
| Included slot later                          | Saved and Export expose an add action; preview finalizes it without StoreKit (`apps/mobile/src/app/saved.tsx:81-90`; `apps/mobile/src/app/preview.tsx:30-38`).               | Core path exists. Export's Add button does not select the missing slot before navigation; see P2-02.                                         |
| Success: paid / free                         | Asset-aware confirmation, Done→Saved, no paid offer, and free upsell only for unpaid sets (`apps/mobile/src/app/success.tsx:14-45`).                                         | Good copy branching, but Share/Copy can lead to a false `Saved Successfully!`; relevant-set focus is not restored; see P1-08 and P2-01.      |
| Returning Saved / multiple sets              | Export, Continue Drawing, Fill Included Slot, Rename, Duplicate, Delete, Settings, and Create New exist (`apps/mobile/src/app/saved.tsx:24-211`).                            | Default naming, status/focus, named deletion, and modal focus semantics remain incomplete; see P2-01 and P2-04.                              |
| Settings / legal / support                   | Required information routes and Delete All exist (`apps/mobile/src/app/settings.tsx:8-71`).                                                                                  | Routes are present. In-app Accessibility copy overclaims unverified support; see P1-05.                                                      |
| Screenshot/app-preview fixtures              | Manifest and capture scripts enumerate target routes (`store-assets/screenshots/manifest.json:1-49`; `scripts/capture-ios-screenshots.mjs:11-35`).                           | Route fixture parameters are ignored and paid/landing states are not deterministic; see P1-09.                                               |

## P0 findings

**None established.** This does not authorize release. The P1 findings below independently trigger the final authority stop rules in `docs/audits/06-final-authority.md:214-228`.

## P1 findings

### P1-01 — StoreKit price and product-unavailable UI are not fail-closed

**Impact:** A production user can see `Purchase for $1.99` before a localized product loads, or after loading fails. This contradicts the locked rule that StoreKit `displayPrice` is the only production price string and makes the offer screen materially unreliable.

**Evidence:** Runtime product state starts with `$1.99` (`apps/mobile/src/state/AppStateProvider.tsx:88-91`). Product-load failure only writes `data.lastError` (`apps/mobile/src/state/AppStateProvider.tsx:122-129`), but no screen reads `lastError` or calls `dismissError`; the purchase button remains enabled and interpolates the fallback (`apps/mobile/src/app/purchase.tsx:69-79`). Shared unavailable copy exists but is not consumed (`packages/content/src/copy/index.ts:39-49`). Locked authority is `docs/LOCKED_DECISIONS.md:11` and `docs/PRODUCT_REQUIREMENTS.md:18`.

**Closure:** `Local` — represent loading/unavailable explicitly, render no price until real `displayPrice` is loaded, disable only the paid action, keep free export operable, and add UI-state tests. `Device` — verify delayed/offline/unavailable StoreKit on a signed build. No founder decision is required.

### P1-02 — Pending, verification, recovery, and recovered purchases have no durable truthful UI

**Impact:** After a pending result or relaunch, Saved labels the frozen set `Draft`; Continue Drawing opens a canvas that looks editable while state silently rejects changes; Preview can route back to a visible purchase button. Unverified and delete-one-set failures can be stored only in an invisible global error. This invites confusion around money and creates a dead-end recovery experience even though the state layer blocks the second StoreKit call.

**Evidence:** Runtime statuses are only `draft | purchased` (`apps/mobile/src/domain/models.ts:8,32-43`). Pending is encoded only as `pendingPurchaseId`; `canEditAsset` and `canBeginPurchase` reject it (`apps/mobile/src/domain/purchaseState.ts:10-20`). Saved nevertheless displays `Draft` and routes it to Draw (`apps/mobile/src/app/saved.tsx:27-30,48-53`). Draw calls `updateAsset`, which silently returns the unchanged set when editing is blocked (`apps/mobile/src/state/AppStateProvider.tsx:215-233`). Purchase reports pending once, then re-enables its button (`apps/mobile/src/app/purchase.tsx:25-45,69-79`). Observer recovery updates state but does not navigate or render recovered/checking status (`apps/mobile/src/state/AppStateProvider.tsx:142-193`). The binding closure requires persistent accessible states and no unresolved repurchase button (`docs/audits/06-final-authority.md:103-107`).

**Closure:** `Local` — add explicit UI purchase states, route guards, persistent status/action copy, a disabled/removed duplicate purchase action, surfaced recovery/delete errors, and navigation tests. `Device` — StoreKit Test/sandbox interruption, pending, unverified, relaunch, unfinished, and recovery transcripts with VoiceOver. No founder decision is required.

### P1-03 — Signature/initials/both copy is not wired to actual asset state

**Impact:** Initials-only and both-asset users are told they are drawing, confirming, or purchasing a signature. The mismatch is especially harmful to rushed, older, and screen-reader users and can obscure which included slot is being bought.

**Evidence:** Draw always renders `Draw Your Signature` (`apps/mobile/src/app/draw.tsx:56-67`). Preview always renders `Confirm Signature` even when `kind` is initials or both assets exist (`apps/mobile/src/app/preview.tsx:18-29,65-71`). Purchase always says `Place your signature on any document` and `One purchase for this signature + initials set` (`apps/mobile/src/app/purchase.tsx:47-49,80-83`). Correct state-aware strings already exist in `flowCopy` (`packages/content/src/copy/index.ts:62-86`) but runtime screens do not use them. This directly fails `docs/audits/06-final-authority.md:104`.

**Closure:** `Local` — derive one shared asset-presence value, use centralized visible/accessibility strings for heading, confirm, support, scope, and success, and add signature-only/initials-only/both UI tests. No device or founder decision is needed to correct the copy; device VoiceOver verification remains required.

### P1-04 — The purchase screen omits the locked local-deletion disclosure

**Impact:** `Re-export this set anytime` can reasonably sound account-backed or permanent even though uninstall may erase reusable art and a consumed purchase cannot reconstruct it. This is a material purchase-expectation defect.

**Evidence:** Purchase renders scope, `No subscription. Re-export this set anytime.`, and the free button, but no local-only/deletion sentence (`apps/mobile/src/app/purchase.tsx:69-90`). The exact approved disclosure exists in shared content (`packages/content/src/copy/index.ts:21-29`) and is mandatory before StoreKit (`docs/PRODUCT_REQUIREMENTS.md:18`; `docs/audits/06-final-authority.md:106`).

**Closure:** `Local` — render the centralized durability copy adjacent to scope before payment, including the correct included-slot variant. `Founder` — final per-set price/model approval remains gated on representative comprehension testing (`docs/audits/06-final-authority.md:188,227`); that gate cannot waive this local disclosure.

### P1-05 — The drawing canvas lacks the locked assistive interaction contract, while the app claims support

**Impact:** With VoiceOver, the canvas may compete with navigation gestures or become a dead end. A user cannot hear empty/non-empty state, enter/finish direct drawing mode, invoke a safe escape, or operate an equivalent accessibility action. The in-app Accessibility page turns implementation intent into an unverified positive claim.

**Evidence:** The canvas is one accessible `image` with an instruction label and a `PanResponder` that captures start/move gestures (`apps/mobile/src/components/SignatureCanvas.tsx:118-145`). It has no `accessibilityValue`, empty/stroke count state, accessibility actions, direct-interaction bridge, Start/Finish mode, or escape handler; it announces every released stroke rather than only the required meaningful state transition (`apps/mobile/src/components/SignatureCanvas.tsx:104-111,133-166`). The contract requires those behaviors (`docs/accessibility/ACCESSIBILITY_SUPPORT.md:18-26`). The app nevertheless says it “supports Dynamic Type, VoiceOver labels, Voice Control labels…” (`apps/mobile/src/app/accessibility.tsx:4-17`), contrary to the withholding rule (`docs/LOCKED_DECISIONS.md:25`).

**Closure:** `Local + Device` — implement the owned/tested native interaction contract or explicitly document/exclude unsupported drawing access; make the in-app statement provisional until proof exists. Complete physical iPhone/iPad common tasks with VoiceOver and Voice Control before any positive claim. `Founder` authorization is required only to publish final App Store accessibility answers, not to fix the canvas.

### P1-06 — Dynamic Type, compact layout, orientation, and Reduced Motion are not implemented to the locked threshold

**Impact:** Core drawing/preview/navigation can clip or become unreadably small at accessibility sizes or landscape. Motion-sensitive users always receive slide navigation. Static labels alone cannot substantiate Larger Text or Reduced Motion support.

**Evidence:** Shared headings/buttons/back cap text at multipliers of 2.0–2.4 (`apps/mobile/src/components/ui.tsx:52-83,86-177`), while the requirement is 200%/**system maximum** (`docs/accessibility/ACCESSIBILITY_SUPPORT.md:11`). Draw disables scrolling and combines a `minHeight: 280` canvas with fixed controls (`apps/mobile/src/app/draw.tsx:57,118-152`); the canvas itself has fixed min/max heights (`apps/mobile/src/components/SignatureCanvas.tsx:170-189`). Preview stacks only on width `<720`, not content-size category, and its document text remains 8–11 points in fixed/absolute geometry (`apps/mobile/src/components/DocumentComparison.tsx:32-48,70-123`). Stack navigation always uses `slide_from_right` with no Reduced Motion branch (`apps/mobile/src/app/_layout.tsx:32-44`).

**Closure:** `Local + Device` — use semantic/adaptive text, do not cap below required system categories, make Draw safely scroll/reflow, adapt comparison by content-size and compact state while preserving identical geometry, and respect Reduce Motion. Verify every Dynamic Type category, portrait/landscape, Display Zoom, iPad windows/keyboard, Increase Contrast, Reduce Transparency, and Reduced Motion on physical devices.

### P1-07 — Unproven SVG, Photos, and Copy features are exposed without a capability registry

**Impact:** Users can select or invoke formats/destinations that the locked launch scope says must remain hidden until independent interoperability/privacy/device proof passes. Copy also lacks the required local-only expiring pasteboard implementation.

**Evidence:** Paid formats always include `svg-transparent` (`apps/mobile/src/components/ExportFlow.tsx:27-33,124-147`), and the UI conditionally but unconditionally by capability offers Photos and Copy (`apps/mobile/src/components/ExportFlow.tsx:169-207`). Export service implements SVG and generic clipboard image writes (`apps/mobile/src/services/export.ts:21-46,69-89`), but there is no runtime capability registry. The locked baseline is transparent PNG, white PNG, and white JPEG; optional formats/destinations stay hidden until proven (`docs/LOCKED_DECISIONS.md:17-20`; `docs/OUT_OF_SCOPE.md:14`).

**Closure:** `Local` — hide SVG/Photos/Copy by default and drive UI from a tested release capability registry. `Device` — independently prove each format/destination, including image re-import, alpha/bounds, Photos behavior, and local-only expiring pasteboard, before enabling it. No founder decision is needed to obey the existing gate.

### P1-08 — Destination handoff and success state can misstate what happened

**Impact:** Dismissing the share sheet is counted as a completed export and can lead to `Saved Successfully!` even when no destination was chosen. Choosing Copy also ends on `Saved Successfully!`. Changing a format after files are prepared leaves the old generated files active under the new visible selector. The required destination privacy handoff is absent.

**Evidence:** `shareFile` returns after `Sharing.shareAsync` and merely announces `Share sheet closed` (`apps/mobile/src/services/export.ts:49-67`). Every resolved destination call is added to `completed` and routes to success (`apps/mobile/src/components/ExportFlow.tsx:81-109`), while success always says saved (`apps/mobile/src/app/success.tsx:25-44`). Generated files are retained even if the always-visible selectors change (`apps/mobile/src/components/ExportFlow.tsx:35-47,54-72,124-210`). Destination copy says only that Share includes Files/AirDrop (`apps/mobile/src/components/ExportFlow.tsx:169-176`), omitting the approved service-terms handoff (`docs/ux/COPY_DECK.md:72-78`).

**Closure:** `Local + Device` — model `prepared`, `shared/closed`, `saved`, and `copied` honestly; invalidate/regenerate files when format changes; use destination-specific success copy; add the centralized privacy handoff. Verify actual iOS share cancellation, Files, AirDrop, Photos, and clipboard outcomes before claiming success.

### P1-09 — Screenshot and App Preview fixtures do not produce the states named by the manifest

**Impact:** Running the current capture pipeline can capture the wrong screen/state under a truthful-looking headline: landing redirects to Saved, paid Export redirects to Purchase, and `fixture=signature|purchased|privacy` parameters have no effect. This would make App Store evidence stale or fabricated if used.

**Evidence:** The manifest requests route-specific query fixtures (`store-assets/screenshots/manifest.json:2-43`). Runtime fixture mode always injects one **draft** set with both assets (`apps/mobile/src/state/AppStateProvider.tsx:100-120`; `apps/mobile/src/domain/fixtures.ts:64-76`). The only route reading search parameters is Success's `mode`; no route consumes `fixture`. Landing redirects whenever fixture drawings exist (`apps/mobile/src/app/index.tsx:16-25`), and paid Export redirects when the fixture remains draft (`apps/mobile/src/app/export.tsx:5-8`). Capture scripts open those routes without asserting visible state (`scripts/capture-ios-screenshots.mjs:17-35`; `scripts/capture-app-preview.mjs:27-43`). No raw or final screenshot files existed under `store-assets/screenshots` at audit time.

**Closure:** `Local + Apple` — implement deterministic route/state fixtures excluded from production, assert screen/copy/state before every capture, and hash raw/final outputs. Final simulator/device capture and App Store dimension/render review remain Apple-gated.

### P1-10 — Rendered UI, accessibility trees, and locked navigation states have no automated coverage

**Impact:** Passing tests can coexist with every UI defect above. The advertised combined local check does not run the mobile package's separate domain tests, and neither suite renders React Native screens.

**Evidence:** Root `check` calls root `test` (`package.json:15-24`). Vitest includes `apps/mobile/src/**/*.test.ts`, but the mobile tests live in `apps/mobile/test` (`vitest.config.ts:3-17`; `apps/mobile/package.json:43-51`), so they run only when explicitly invoking the mobile workspace. Current E2E files cover only fresh landing/draw and one fixture preview/purchase path (`apps/mobile/e2e/fresh-install.yml:1-10`; `apps/mobile/e2e/screenshot-flow.yml:1-13`). There are no rendered-screen tests for initials-only, missing slot, free/paid export, pending/recovery, returning sets, success variants, modal focus, Dynamic Type, or accessibility semantics.

**Closure:** `Local + Device` — include mobile tests in the combined gate; add screen/state/accessibility-tree tests and deterministic E2E flows for the complete locked matrix. Native accessibility and destination behavior still require physical-device evidence.

### P1-11 — Required authorized-use acknowledgment is absent from first creation and Create New

**Impact:** The product enters a sensitive signature-creation flow without the concise, proportionate acknowledgement required by its own safety boundary. Terms and FAQ text are not a substitute at the decision point.

**Evidence:** `Get Started` goes directly to Draw (`apps/mobile/src/app/index.tsx:54-59`); Saved `Create New` and paid Export `Create New` create a draft and navigate directly to Draw (`apps/mobile/src/app/saved.tsx:170-176`; `apps/mobile/src/components/ExportFlow.tsx:212-221`). The required copy is `Use only a signature you are authorized to use.` (`docs/PRODUCT_REQUIREMENTS.md:48-54`; `docs/ux/COPY_DECK.md:62-70`), but it is absent from runtime app source.

**Closure:** `Local` — add one concise first-create/Create New acknowledgement without an onboarding wall or repeated burden, persist its completion as locally appropriate, and test both entry points. Final legal wording remains professional/founder-gated; the existing locked meaning is sufficient for implementation.

## P2 findings

### P2-01 — Returning-set identity and focus do not meet the text-first contract

Unnamed cards all render `Signature Set`, not `Signature Set N`; the global action says `Create New`; Delete confirmation does not name the target; Done does not focus/scroll to the relevant set (`apps/mobile/src/app/saved.tsx:31-43,45-123,128-176`; `apps/mobile/src/app/success.tsx:38`). Assign stable numbered defaults, include assets/per-set status/included slot in a concise card accessibility description, name destructive targets, and restore heading/relevant-card focus. This is `Local`; verify five-set VoiceOver/relaunch order on device.

### P2-02 — Several smaller copy/navigation mismatches remain

Portrait Draw says `Rotate for more room` rather than the locked optional `More room is available in landscape`; its empty message says `before continuing` rather than the approved wording (`apps/mobile/src/app/draw.tsx:38-42,68-72`). Missing Signature says `A signature is included` and then `Add them`, which is grammatically and cognitively mismatched (`apps/mobile/src/app/missing-slot.tsx:19-31`). Export's included-slot action navigates to Draw without selecting the unclaimed slot (`apps/mobile/src/components/ExportFlow.tsx:148-153`). Correct these centrally and add route assertions. This is `Local`.

### P2-03 — Preview accessibility and initials fidelity are incomplete

The locked `Compare versions` heading is absent. A non-accessible wrapper receives an `accessibilityLabel`, while each embedded drawing exposes only `Signature preview`/`Initials preview`, not whether it is white-background or transparent (`apps/mobile/src/components/DocumentComparison.tsx:32-48`; `apps/mobile/src/components/DrawingPreview.tsx:16-42`). The fictional form always labels the placement `Signature`, even for initials (`apps/mobile/src/components/DocumentComparison.tsx:14-27`). Group or label each variant with objective context, hide decorative fixture details appropriately, and preserve an equivalent text explanation. This is `Local + Device`.

### P2-04 — Modal and navigation focus behavior is not explicit

Rename and format modals set `accessibilityViewIsModal` but do not expose a dialog label/role, programmatically move focus to the heading, or restore focus to the originating control (`apps/mobile/src/app/saved.tsx:177-210`; `apps/mobile/src/components/FormatDropdown.tsx:31-73`). Route transitions likewise do not explicitly focus the new heading. Add deterministic focus management, dismiss semantics, and keyboard/VoiceOver tests. This is `Local + Device`.

### P2-05 — The review prompt can interrupt the success moment

After the second completed export, the app requests Apple's review prompt before routing to Success (`apps/mobile/src/components/ExportFlow.tsx:95-108`). A user can see a rating interruption before confirmation that the export completed, adding uncertainty for older/rushed users. Route to truthful success first and request review only at a later non-transactional moment under the ratings plan. This is `Local + Device`.

## Verified strengths and fairness observations

- The product remains narrow: no real document intake/signing UI, account, subscription, backend, analytics, ads, AI signature generation, or global premium flag was found in the inspected mobile routes.
- Free export is visible before payment (`apps/mobile/src/app/purchase.tsx:84-88`), repeatable, and limited to truthful white PNG/JPEG labels (`apps/mobile/src/components/ExportFlow.tsx:33,38-43`; `apps/mobile/src/domain/models.ts:88-93`). It uses the same capture dimensions/quality path as paid raster export (`apps/mobile/src/services/export.ts:35-43`). No intentional free-quality degradation was found.
- Purchased slots are protected from direct editing; duplication creates a separate unpaid draft and preserves the original transaction (`apps/mobile/src/domain/purchaseState.ts:10-13`; `apps/mobile/src/state/AppStateProvider.tsx:268-295`).
- A later included slot is finalized without a StoreKit purchase and becomes immutable (`apps/mobile/src/state/AppStateProvider.tsx:413-430`; `apps/mobile/src/domain/purchaseState.ts:93-120`).
- Preview white/transparent variants use the same `Agreement` component and drawing asset; the white difference is an overlay rather than degraded strokes (`apps/mobile/src/components/DocumentComparison.tsx:6-48,104-123`). Device/golden-image proof is still missing.
- Visible primary/secondary buttons generally exceed 44 points and include labels, roles, and disabled state (`apps/mobile/src/components/ui.tsx:86-162,241-285`). Static contrast calculations for core token pairs were above WCAG AA text thresholds; rendered transparency/system-setting behavior remains unverified.
- The public website's accessibility wording correctly distinguishes current website support from an app target awaiting signed-build testing (`apps/site/src/pages/accessibility.astro:11-19`).

## Local checks run for this audit

All commands ran from the exact checkout on 2026-08-25 using Node `v22.22.0` and npm `10.9.4`.

| Check                                    | Result                                                                        | What it proves / does not prove                                                                                                                   |
| ---------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run typecheck`                      | PASS; Astro reported 0 errors/warnings/hints and all TS workspaces completed. | Static type integrity only.                                                                                                                       |
| `npm run lint`                           | PASS across mobile/config/content/core/design-tokens.                         | Static lint only; no rendered accessibility.                                                                                                      |
| `npx vitest run --coverage=false`        | PASS: 7 files, 24 tests.                                                      | Core/config/export logic; not React Native screens.                                                                                               |
| `npm run test -w @only-signature/mobile` | PASS: 11 tests.                                                               | Drawing/purchase domain helpers; not included by root `npm run test`, not rendered UI.                                                            |
| `npm run verify:exports`                 | PASS: 1 file, 6 tests.                                                        | In-memory core PNG/JPEG pixel properties; not `react-native-view-shot`, iOS destinations, SVG viewers, Photos, or clipboard.                      |
| `npm run check:content`                  | PASS across 109 files.                                                        | Only the forbidden-pattern rules in `scripts/check-content-drift.mjs:14-27,49-79`; it does not compare runtime copy to `flowCopy`/`purchaseCopy`. |
| `npm run check:release`                  | PASS with `Development configuration does not claim production readiness.`    | Development fail-closed check; not a production configuration or signed archive.                                                                  |

No automated axe/Accessibility Inspector result is claimed because this is a React Native iOS app and no running signed/native UI was available. No VoiceOver, Voice Control, Dynamic Type, orientation, Reduce Motion/Transparency, keyboard, usability, StoreKit, or screenshot result is represented as passed.

## Required closure order

1. Fix P1-01 through P1-04 so price, scope, deletion, pending, recovery, and paid routing are truthful and fail-closed.
2. Fix P1-03, P1-11, and the P2 copy issues by consuming centralized state-aware copy; add rendered route/state tests.
3. Implement the accessible canvas and adaptive/reduced-motion layouts; change in-app accessibility language to unverified targets.
4. Hide SVG/Photos/Copy until a release capability registry and device evidence exist; correct handoff/success state semantics.
5. Make screenshot fixtures deterministic and self-asserting; add them to drift/evidence gates.
6. Run the complete physical iPhone/iPad matrix in `docs/accessibility/ACCESSIBILITY_SUPPORT.md:38-42`, purchase-comprehension sessions in `docs/ux/OLDER-ADULT-USABILITY.md:31-33`, signed StoreKit/destination tests, and actual screenshot capture.
7. Only after retained evidence exists may the founder authorize final price/model, Accessibility Nutrition Labels, screenshots, submission, or release.

**Final determination:** The actual repository is a credible local implementation with a fair core free path, but it is not yet product-, UX-, accessibility-, purchase-, or screenshot-truth complete. Keep release status **NO-GO** until all P1s are closed locally and the named device/founder gates pass with current evidence.

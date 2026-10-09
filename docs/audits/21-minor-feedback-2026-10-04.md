# Five minor founder-feedback changes

Source: feedback saved at 2026-10-04T22:01:32.678Z and exported at 22:01:35.579Z. Local branch: `codex/full-paper-redesign`. Existing dirty work is preserved. All fifteen active approval statuses remain Needs changes; archived transparent-confirmation feedback is retained.

## Target-to-change map

| Screen / exact annotation target                 | Implemented change                                                                                | Preserved                                                                            |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| 1 Opening support, x .6711 / y .4873             | `Your signature and initials. Ready to reuse.` with an intentional break after the first sentence | Timing, wordmark, cleaned signature, gold guide, baseline                            |
| 8 Background price, x .4934 / y .8824            | Localized amount in 21-point bold on a quiet gold highlight; 14-point one-time information        | Catalog-only retry, free fallback, no fabricated live price, no action dock          |
| 11 DIY damaged ink, x .2296 / y .6838            | Three larger proportional erased bands                                                            | Original sample, actual saved/exported ink, full decline wording                     |
| 14 White confirmation message, x .8400 / y .4439 | New line after `Your signing set is saved on this device.`                                        | Both sentences, saved ink and Done behavior                                          |
| 15 Saved Sets, x .6207 / y .9120                 | Text-only rows: stored label, original creation date, status and existing actions                 | List scrolling, empty state, pending-purchase locks, Add Initials and Export routing |

The original inspiration still controls grouping, navy/paper hierarchy and soft tinted depth, not finance content, chart geometry, typography or navigation. New spacing adapts to the real copy and actions; it does not substitute giant reference-sized cards. The updated component recipes and explicit copy changes are in `docs/visual-design-spec.md`.

## Creation-date integrity

Older records did not have immutable creation dates. `lastUsedAt` changes on editing, renaming and export, so it is not repurposed as a creation date. New sets persist optional `createdAt`; duplication records the copy's own creation time. Semantic migration preserves valid metadata and normalizes missing/invalid optional metadata to null without rejecting valid legacy ink or payment state. The disclosed fallback is `Creation date unavailable`. Labels come from existing stored text, or `Signing Set`; no names are inferred from handwriting. Fixture labels and August dates are fictional presentation data, not user records.

## Rendered corrections and evidence

- First bundle `entry-334e75f6cc93b57a6d4df7ded521a40c.js` passed targeted assertions, but manual inspection caught the orphaned final opening word. The broader responsive test caught a recovery fallback extending to y681 in a 667-point screen. Those findings were corrected, not dismissed because another test passed.
- Final bundle: `entry-0642c0a34f1ac1df0726511813e6bf4a.js`.
- Targeted output: `artifacts/minor-feedback-2026-10-04/report.json`, 50 passing layouts with no runtime exceptions and untouched feedback. Ten viewports cover 375x667, 390x844, 430x932, 768x1024, 1024x1366 and their landscape counterparts.
- Before/after pairs: `artifacts/minor-feedback-2026-10-04/*-comparison.png`; same 375x667 pixels/CSS size, scale factor 1, initial before capture on the left and corrected actual web render on the right. All five pairs were inspected, including price/labels/baselines and changed copy. Tablet renders and short-landscape initial states were inspected separately.
- Main review: 45 new actual Expo web captures, fifteen screens at three review sizes, completed at `2026-10-04T22:29:09.078Z`. No screenshot-generating DOM restyle, image-generated proof or native claim.
- Selected reference comparison: `artifacts/visual-protocol-audit/founder-reference-comparison.png`; inspected proportionally cropped source and actual Home/background/export in one input.
- Native/device acceptance and founder approval remain separate. This is a scoped minor-edit pass, not a rerun of the previous full 240-layout audit.

## Checks

Confirmed after the corrections: workspace type checks, lint, 62 root tests, 165 mobile tests; ten-size responsive action/capture checks; 36 persistent purchase-recovery layouts plus three locked Saved Sets states; focused protocol audit with 48 layouts, two dialogs and two openings, zero findings/runtime exceptions; 27 mock-payment state checks. Review-workspace zoom, markup, autosave, consolidated export and narrow mode passed across fifteen screens/three devices with intercepted test feedback. The short-landscape capture pass adds five layouts and three scrolled-action captures without replacing the full 50-layout report. These scrolled states, a small-phone interrupted-purchase state, the refreshed fifteen-screen contact sheet and the source/actual comparison board were inspected. Scoped design QA passed; founder acceptance remains pending.

Feedback hashes remained identical to the pre-edit snapshot: JSON `BF55C2CB396F5EC84AF80D512718EDEF095E2BE5EBCC992A60526C3A9043B381`; Markdown `33EA3E1ED75905227F3158FFDF3830EC3068A4C3C1B919825C7A46FE302531E6`. Dependency lock remains `0739A3B5F31801A9D1F012EB61C40A3E6E82B37B4FFB65FB1AE688F2B42AB63A`. Formatting and diff-whitespace checks are the final document gate.

New date tests cover round-trip persistence, immutable creation versus updated usage, legacy metadata, invalid optional dates and locale-aware presentation. Source regressions cover stronger copy, intentional breaks, 21-point amount, text-only list and independent duplication date.

## Files changed in this pass

Final formatting and diff-whitespace checks passed.

- UI: `apps/mobile/src/components/animated-opening.tsx`, `purchase-action.tsx`; `apps/mobile/src/app/free-export.tsx`, `success.tsx`, `saved.tsx`, `purchase.tsx`.
- Date metadata/presentation: `apps/mobile/src/domain/models.ts`, `appStateValidation.ts`, `saved-set-presentation.ts`, `fixtures.ts`; `apps/mobile/src/state/AppStateProvider.tsx`.
- Tests: `apps/mobile/test/audited-flow-ui.test.ts`, `purchase-feedback.test.ts`, `saved-set-presentation.test.ts`; `scripts/verify-minor-feedback.mjs` and its package command.
- Records: `docs/visual-design-spec.md`, `design-qa.md`, this audit, and separate read-only `tools/layout-studio/review-implementation.json` notes.
- Generated local screenshots/reports were refreshed. Founder feedback files were not edited.

## Remaining boundaries

No new dependency, real payment, GitHub push, native/cloud build, store submission or TestFlight upload. Local browser validation does not prove native rendering, finger sensitivity, Dynamic Type, VoiceOver, Photos/Share or live StoreKit. $1.99 is a U.S. screenshot fixture, not independently verified live Apple pricing. The prior security-audit failures remain a release gate; this visual pass does not resolve or claim a new dependency audit.

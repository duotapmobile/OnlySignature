# Minor-feedback design QA, October 4

Scope: the five newly written annotations saved at 2026-10-04T22:01:32.678Z. Founder approval statuses remain Needs changes.

## Visual truth and normalization

- Annotation source: `artifacts/actual-flow-preview/review-feedback.json`. Untouched founder export: `artifacts/actual-flow-preview/SCREEN-FEEDBACK.md`.
- Same-state before captures: `artifacts/minor-feedback-2026-10-04/before/` (375x667 PNGs).
- Selected source: `C:/Users/mskir/.codex/codex-remote-attachments/01a09c22-8725-79e1-82ea-1ad811307576/8F1B4C80-20E8-4050-A0C7-F8F0564D14CE/1-Photo-1.jpg`. Central finance-phone grouping, navy/paper hierarchy and soft depth are selected; finance content, charts, navigation and browser chrome are excluded.
- Actual implementation: local Expo web runtime at `http://127.0.0.1:4176`, not a recreated screenshot or image-generated mockup.
- Before/after inputs: `artifacts/minor-feedback-2026-10-04/*-comparison.png`. Each panel is 375x667 pixels at the same 375x667 CSS viewport, density 1. Sixteen pixels separate the panels; no phone chrome or app-pixel restyling is added.
- Reference-adaptation board: `artifacts/visual-protocol-audit/founder-reference-comparison.png`, with proportionally cropped source phone and actual web screenshots. This is an attribute comparison, not a pixel-identical finance clone.

## Comparison history

1. Initial source findings: weak supporting copy, quiet 13-point price, subtle DIY erased bands, running confirmation sentences, and undated preview-heavy Saved Sets. Applied the five scoped edits without changing the product flow.
2. First rendered bundle `entry-334e75f6cc93b57a6d4df7ded521a40c.js`: targeted 50 layouts passed, but manual inspection found an orphaned final opening word (P2). The broader responsive check found a purchase-recovery free option extending to y681 in the 667-point viewport (P1). The first targeted run was not accepted as completion.
3. Corrections: deliberate opening line break; 21-point price retained with six-point group gap and four-point inset. Compact recovery uses four-point outer top/bottom padding, six-point card padding and six-point option gap. Messages and targets are not shrunk. Final bundle `entry-0642c0a34f1ac1df0726511813e6bf4a.js` passed 50 targeted layouts and the complete ten-size responsive check. All five before/after inputs, tablet renders, short-landscape initial/scrolled actions, the fifteen-screen contact sheet and the refreshed reference board were inspected. The two findings are resolved; no actionable P0/P1/P2 finding remains in this minor-edit scope.

## Required fidelity surfaces

- Typography: existing Georgia headings and native/system sans preserved; stronger opening copy, bold price, 20/26 labels and 14/20 dates. Inspect deliberate breaks, clipping and wrapping.
- Spacing: content-sized text-only saved rows, intentional list scrolling, compact purchase actions. Check portrait/landscape and recovery copy.
- Colors/tokens: navy/paper/gold preserved. Pale-gold price material is distinct without heavy shadows or an action dock.
- Images: clean baseline-aligned opening asset, no Brooks underline. DIY erasure affects only the example, never stored/exported ink. Saved list intentionally omits ink previews.
- Copy/content: revised opening copy is explicitly requested. Confirmation wording remains intact. Existing labels are used, not inferred handwriting names. Original recorded creation dates are distinct from mutable last-used and purchase dates; legacy fallback is disclosed in the spec.

## Boundaries

Browser checks do not establish native iOS rendering, finger feel, Dynamic Type, VoiceOver, Photos/Share or live StoreKit. $1.99 is a screenshot fixture; real prices remain Apple-localized. No cloud/native build, publication or real purchase is authorized by this pass.

## Final verification

- Current focused protocol audit: 48 route layouts, two dialogs, two openings, zero findings/runtime exceptions; report identifies the final bundle.
- Mock payment UI: 27 catalog/state/viewport checks. Purchase recovery: 36 layouts and three locked Saved Sets states. No live Apple purchase was initiated.
- Source checks: typecheck, lint, 62 root tests and 165 mobile tests passed.
- Review workspace: fifteen screens, three sizes, zoom, markup, autosave, export and narrow mode passed with intercepted isolated feedback; founder files remained unchanged.
- Review capture: 45 actual web PNGs at three sizes, completed at 2026-10-04T22:29:09.078Z. Short-landscape scrolled control captures are in `artifacts/minor-feedback-2026-10-04/667x375/*-actions.png`.
- Full screen and focused region comparison: same-size before/after pairs give readable price, line-break, labels, baseline and missing-stroke detail in the same input. Tablet and scrolled states provide additional composition/interaction evidence. The reference board confirms selected attributes without copying unrelated finance geometry.

final result: passed

This result applies only to the five minor edits in the actual web implementation. Founder review remains open; native/device and release acceptance are not established.

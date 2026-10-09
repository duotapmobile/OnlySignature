# Founder feedback reconciliation, October 4

## Scope and source of truth

The saved founder review contains sixteen screen records: fifteen active screens and the retired transparent confirmation. All written notes, forty-three pins (forty-two active, one archived), and founder approval statuses remain untouched. Pin text is empty throughout the saved review; positions are regional evidence, not undisclosed replacement strings.

The implementation record is `tools/layout-studio/review-implementation.json`. It maps every saved screen and pin count to source files. Its source checks are explicitly **not** visual acceptance, founder approval, or native validation.

| Attribute            | Reference                                                      | Transfer                                                                             | Exclude                                                             |
| -------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| Density and material | Founder Photo 1.jpg, 8F1B4C80, central finance-app composition | Compact navy/paper hierarchy, soft tinted depth, useful content density              | Finance content, browser chrome, large unexplained empty containers |
| Branding and ink     | Existing Only Signature product                                | Navy, warm paper, restrained gold, wordmark, handwriting on its guide                | Floating artwork, decorative button arrows, heavy black shading     |
| Copy and flow        | Latest founder corrections and saved review                    | Exact requested titles/actions, split-name simplification, direct transparent export | New flows invented to simplify composition                          |

## Current batch

1. Reconcile all fifteen screens and archived feedback against source: complete as source inspection, not rendered acceptance.
2. Separate clean app screenshots from original numbered pins: implemented. Markup is hidden by default, explicitly labeled as old feedback, and can be restored without deleting it. Read-only implementation notes remain separate from editable founder feedback. Refresh screens reloads images, preserving unsaved feedback and the selected screen.
3. Correct opening density: implemented in source. Copy and baseline-aligned signature use one centered composition with a 28-point gap. The auto margin that left a large blank gap is removed. Existing timing, skip, Reduce Motion, and artwork baseline math remain unchanged.

Also corrected review save handling: a slow save cannot overwrite newer input; failed Save and next does not advance; failed saves do not start copy/export.

Annotation objects remain live after autosave, so editing a pin's note again cannot update a detached object and lose that text.

## Initial source-only checkpoint

The table below records the checkpoint before screenshot permission was received. It is superseded by the fresh rendered inspection and spacing corrections in `20-rendered-feedback-audit-2026-10-04.md`; it is retained to distinguish source inspection from visual evidence.

| Step | Screen             | Current health                                                                    |
| ---- | ------------------ | --------------------------------------------------------------------------------- |
| 1    | Animated opening   | Source corrected; fresh visual comparison pending                                 |
| 2    | Entry              | Prior requested structural corrections present; fresh comparison pending          |
| 3    | Full-name capture  | Sign title/action/input changes present; fresh comparison and iPhone feel pending |
| 4    | First-name capture | Active canvas only and Back present; fresh comparison pending                     |
| 5    | Last-name capture  | Matching split-name treatment present; fresh comparison pending                   |
| 6    | Initials           | Shared treatment present; aesthetic rejection remains open                        |
| 7    | Review             | Stored-ink baseline and shared header present; fresh comparison pending           |
| 8    | Background         | Shared document example and pricing present; fresh comparison pending             |
| 9    | Purchase recovery  | Recovery and catalog states present; native Apple testing pending                 |
| 10   | Clear background   | Document/date comparison present; fresh comparison pending                        |
| 11   | DIY warning        | Requested title/labels/actions present; fresh spacing comparison pending          |
| 12   | White export       | Shared navigation/selectors/preview present; fresh comparison pending             |
| 13   | Transparent export | Shared export recipe present; fresh comparison pending                            |
| 14   | White confirmation | Shared header/baseline/Done present; fresh comparison pending                     |
| 15   | Saved Sets         | Compact single FlatList present; fresh spacing comparison pending                 |

The retired transparent confirmation stays removed from the active flow. Its original note and pin are retained in founder feedback.

## Evidence limits

In-app browser access failed twice with the Windows sandbox ACL error. The Product Design audit skill required permission before direct Playwright use. The founder subsequently approved the existing local screenshot/test scripts. Forty-five current Expo web screenshots were then captured, inspected and corrected; the rendered audit is in `20-rendered-feedback-audit-2026-10-04.md`. In-app browser inspection and native iOS inspection are still not claimed.

No native build, cloud build, GitHub publication, store submission, payment/configuration change, ASO edit, or modification of existing TestFlight evidence was initiated.

## Checks for this batch

- Focused review tests: nine passing cases, with isolated fake requests and no browser automation or real feedback writes.
- Full workspace typecheck and lint: passed.
- Changed-file formatting and review-script syntax: checked.
- The initial local Expo web preview was `entry-2e6051006bdd793adb05bb6d323630f1.js`. It is superseded by the final rendered-correction bundle `entry-ee3cb3d49956d42824c5ee04e8a248d9.js` and refreshed captures documented in audit 20. Neither is a native build.
- The two founder feedback files retain their original SHA-256 fingerprints (`691A675F...` and `1DAA353D...`).

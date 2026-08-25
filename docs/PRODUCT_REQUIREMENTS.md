# Product Requirements

**Product:** Only Signature  
**Version:** 1.0 build authority  
**Authority date:** 2026-08-25

## Job and value order

Only Signature lets a person draw a signature and initials, preview the white-box problem on a fictional document, and export reusable local assets. Benefits are communicated in this order: create both assets; transparent export; avoid the white rectangle; no editing/cropping; place the result in another app; choose a supported format; no login; no subscription; no automatic upload.

## Core flows

1. Landing presents the product and one `Get Started` action.
2. Draw preserves independent Signature and Initials slots across switching, rotation, backgrounding, and relaunch.
3. Continue is valid when either slot exists. Empty Continue explains that a drawing is needed.
4. Preview uses the same drawing, document, scale, placement, labels, and date on white and transparent variants. White realistically obstructs nearby form content; transparent does not. No checkerboard appears.
5. If one slot is missing, the app says that the companion slot is included and offers Add or Continue without forfeiture.
6. Purchase shows StoreKit’s localized price, exact per-set scope, no-subscription statement, visible free alternative, included-slot state, and local-deletion limitation.
7. Free export provides full-quality white PNG/JPEG repeatedly.
8. Verified purchase finalizes the frozen set. Same-set export is repeatable in any verified format without payment.
9. A purchased slot is immutable. `Duplicate as New Draft` preserves the original and creates a separately payable transparent-export candidate.
10. Returning users see a simple Saved list with text-first set status, Export, Create New Set, Rename, Duplicate, Fill Included Slot, and confirmed local deletion.

## Signature Set rules

- A set contains one signature slot and one initials slot.
- Slot state is `empty`, `draft`, `finalized`, or `included_unclaimed` where applicable.
- Set purchase state is `unpurchased`, `purchase_pending`, `recovery_required`, or `purchased`; there is no global premium state.
- At least one completed slot is required to prepare a purchase.
- If both slots exist before purchase, both finalize together.
- If one exists, it finalizes and the other becomes included/unclaimed.
- Filling the included slot never invokes StoreKit and is idempotent.
- Renaming, filename changes, format changes, sharing, copying, or re-export never alters purchase state.
- App deletion may remove local reusable sets. Exported files remain at their selected destinations.

## Drawing and export quality

Canonical strokes retain segmented points, normalized coordinates, timing, available reliable pressure, source canvas dimensions/orientation, and rendering version. Rendering uses smooth antialiased paths, natural joins/caps, stable width, tight visible bounds, and proportional padding without changing handwriting.

Required launch formats:

- PNG, Transparent
- PNG, White Background
- JPEG, White Background

SVG, PDF, Photos transparency, and Copy are visible only when their independent capability tests pass. JPEG never carries a transparency claim.

## Safety, privacy, and authorized use

- No real document input or document-signing workflow.
- No account, backend, subscription, analytics, advertising, tracking, or proprietary cloud storage.
- No signature content in logs, StoreKit metadata, diagnostics, support automation, or filenames derived from local labels.
- First creation/Create New uses a concise authorized-use acknowledgment: use only a signature the user is authorized to use.
- No claim of identity verification, certificate, digital/cryptographic signature, qualified signature, notarization, audit trail, legal enforceability, or universal acceptance.

## Accessibility and older-adult acceptance

- One dominant primary action per screen; primary buttons generally at least 56 points and every target at least 44 by 44 points.
- State-aware visible labels; no icon-only primary action or swipe-only navigation.
- Dynamic Type at 200%/system maximum with stacking rather than shrinking.
- Named canvas with empty/non-empty state, instructions, safe assistive direct interaction/exit, and announcements.
- Logical VoiceOver order, Voice Control label-in-name, non-color state, reduced-motion behavior, and opaque/high-contrast glass fallbacks.
- Positive Accessibility Nutrition Labels remain unapproved until common tasks pass on each supported physical device family.

## Acceptance boundary

Local implementation and tests may complete on Windows. Signed build, StoreKit Test/sandbox, iOS file attributes, destination preservation, VoiceOver/Voice Control, performance, archive privacy report, network observation, screenshots, and App Store review remain Apple-gated and must not be reported as passed early.

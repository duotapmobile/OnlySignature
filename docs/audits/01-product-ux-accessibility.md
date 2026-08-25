# Auditor A — Product, UX, and Accessibility

**Product:** Only Signature  
**Research and audit date:** 2026-08-25  
**Audit type:** Independent pre-implementation specification audit  
**Authority reviewed:** The controlling “Zero-Context, Complete Build, Research, Compliance, ASO, Website, and App Store Readiness Contract” supplied by the founder  
**Independence statement:** This report was prepared without reading any other auditor report or conference output.

## Scope and limits

This audit covers product scope, end-to-end flows, older-adult usability, cognitive load, large-print usability, VoiceOver, Dynamic Type, Voice Control, orientation, touch-target size, error recovery, purchase clarity and fairness, returning-user behavior, multiple saved sets, free-versus-paid behavior, copy clarity, and feature creep. It treats WCAG 2.2 AA as a useful minimum reference for the mobile app and website, while Apple’s platform and App Store accessibility criteria govern iOS-specific implementation and any Accessibility Nutrition Label claim.

No implemented application UI existed in scope when this independent audit began. Therefore, no automated scan, device test, Accessibility Inspector run, VoiceOver walkthrough, contrast measurement, Dynamic Type screenshot, or usability session could truthfully be reported as passed. All implementation-dependent findings below are release gates with explicit verification methods.

## Current evidence used

Primary sources accessed on 2026-08-25:

1. [Apple Human Interface Guidelines — Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility/): Dynamic Type is the system text-sizing mechanism; Apple recommends supporting text enlargement of at least 200%, with 17 pt the iOS/iPadOS default body size.
2. [Apple Human Interface Guidelines — Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons): a button generally needs a hit region of at least 44 by 44 points and a visible pressed state.
3. [Apple Human Interface Guidelines — Layout](https://developer.apple.com/design/human-interface-guidelines/layout): interfaces should adapt to different screen sizes, orientations, Dynamic Type sizes, localization, safe areas, and iPad window sizes; Apple recommends aiming to support portrait and landscape on iOS.
4. [Apple — Overview of Accessibility Nutrition Labels](https://developer.apple.com/help/app-store-connect/manage-app-accessibility/overview-of-accessibility-nutrition-labels): a feature may be declared only when users can complete all common tasks with that feature, assessed for every supported device family.
5. [Apple — VoiceOver evaluation criteria](https://developer.apple.com/help/app-store-connect/manage-app-accessibility/voiceover-evaluation-criteria/): all common tasks must be possible with VoiceOver; custom elements require equivalent semantics, concise labels, state/value communication, complete content, and logical navigation.
6. [Apple — Voice Control evaluation criteria](https://developer.apple.com/help/app-store-connect/manage-app-accessibility/voice-control-evaluation-criteria): anything operable by touch should be operable with Voice Control, with proficient testing required before declaring support.
7. [Apple — Larger Text evaluation criteria](https://developer.apple.com/help/app-store-connect/manage-app-accessibility/larger-text-evaluation-criteria): support requires at least 200% or the system maximum, without overlap or severe truncation in common tasks.
8. [Apple — Sufficient Contrast evaluation criteria](https://developer.apple.com/help/app-store-connect/manage-app-accessibility/sufficient-contrast-evaluation-criteria): common tasks should meet contrast guidance by default, normally at least 4.5:1 for text and 3:1 for meaningful non-text UI; glass/translucency must be checked with Increase Contrast and Reduce Transparency.
9. [Apple — Reduced Motion evaluation criteria](https://developer.apple.com/help/app-store-connect/manage-app-accessibility/reduced-motion-evaluation-criteria/): depth simulations, animated blur, parallax, spinning, scaling, and continuous motion must be removed or changed when appropriate.
10. [Apple — `allowsDirectInteraction`](https://developer.apple.com/documentation/uikit/uiaccessibilitytraits/allowsdirectinteraction): a custom accessibility element can allow direct touch interaction for VoiceOver users, a relevant native behavior for a drawing surface.
11. [Apple — Supporting VoiceOver in your app](https://developer.apple.com/documentation/uikit/supporting-voiceover-in-your-app): custom elements are not automatically understood; they need labels, hints, state, grouping, and a logical traversal order.
12. [W3C — WCAG 2.2](https://www.w3.org/TR/WCAG22/) and [Understanding WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/): reference criteria include orientation, reflow, text resize, contrast, focus order/visibility, label in name, target size, error identification, consistent navigation, name/role/value, and status messages.
13. [W3C — Understanding Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html): 200% text enlargement and narrow-layout reflow must not cause loss of content or function.
14. [W3C — Understanding Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html): errors must be described in text, which particularly supports people with low vision and cognitive disabilities.
15. [U.S. National Institute on Aging — 2019 BSR Review Committee Report](https://www.nia.nih.gov/sites/default/files/2020-02/2019-BSR-Review-Committee-Report-508.pdf): older-adult technology research must account for heterogeneous sensory, cognitive, physical, linguistic, educational, and cultural factors. Age alone is not a persona.

## Severity and disposition model

| Severity | Meaning                                                                                                                                                                                                                  |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| P0       | Prevents safe or truthful release; no reasonable workaround.                                                                                                                                                             |
| P1       | Blocks a core flow, creates material purchase/accessibility unfairness, or makes a public claim materially unsupported. Must be fixed, disproven, founder-gated, or defensibly excluded before implementation authority. |
| P2       | Material usability/accessibility degradation with a workaround; fix before release unless explicitly accepted with evidence.                                                                                             |
| P3       | Improvement or validation detail that does not block the core product.                                                                                                                                                   |

Disposition vocabulary used below:

- **Fix in specification:** adopt the proposed locked behavior before or during implementation.
- **Release gate:** the design is directionally acceptable, but no support claim or release may proceed until the stated test passes.
- **Explicit exclusion:** acknowledge a deliberate limitation, document why, and do not make the corresponding support claim.

## Executive determination

The core product is coherent and appropriately narrow. It solves one understandable job: create a reusable signature/initials image without requiring the user’s document. The four-step first-use funnel is defensible, the free export is real rather than intentionally degraded, the per-set purchase scope is materially fairer than a subscription, and the returning-user model preserves purchased sets rather than overwriting them.

However, implementation authority should be conditional on resolving six P1 issues:

1. The custom drawing canvas needs an explicit assistive-technology interaction contract and device validation.
2. Slot-aware headings and actions must work for signature-only, initials-only, and both-assets flows.
3. The side-by-side comparison needs a large-text/compact-width adaptation that remains truthful and readable.
4. Purchase scope, included unused slot, local-only durability, and deletion consequences must be comprehensible before purchase without overwhelming the screen.
5. Purchase and transaction states need an idempotent, accessible, non-alarming recovery experience.
6. Accessibility Nutrition Label claims must remain unset until all common tasks pass on each declared device family.

No P0 issue is established by the specification alone.

## Findings

### A-01 — Custom drawing is the accessibility-critical control

**Severity:** P1  
**Area:** VoiceOver, Voice Control, motor accessibility, core task  
**Evidence:** Apple requires VoiceOver users to complete all common tasks and requires custom controls to provide semantics and equivalent operability. Apple provides an `allowsDirectInteraction` trait for direct-touch custom elements. The contract asks for “accessible drawing-canvas instructions” but does not yet define how a VoiceOver or Voice Control user enters, exits, clears, switches slots, perceives state, or confirms a drawing.

**Risk:** A visually excellent canvas can be a screen-reader dead end. VoiceOver gestures can compete with stroke capture; a direct-touch canvas can trap navigation; Voice Control may have no named way to activate drawing; a person with low vision may not know whether a stroke was recorded. Declaring VoiceOver support based only on labels would be misleading.

**Required correction — fix in specification:** Treat the canvas as a named custom control with:

- visible instruction and concise accessibility label: “Signature drawing area” or “Initials drawing area”;
- state/value: “empty” or “drawing saved, N strokes” (never expose points or render content in diagnostics);
- a visible, named “Start Drawing”/“Finish Drawing” mode if direct interaction otherwise conflicts with VoiceOver navigation;
- native direct-interaction behavior where technically required, implemented through the maintained drawing/native layer rather than guessed React Native semantics;
- a clear VoiceOver escape route that cannot accidentally clear work;
- named Voice Control targets matching visible text;
- an announcement when the first stroke is accepted and when the drawing becomes empty after Clear;
- no requirement to perceive the exact visual shape to operate the rest of the flow;
- all canvas-adjacent controls reachable without drawing a stroke.

**Verification:** On physical iPhone and iPad, complete fresh-install signature-only, initials-only, and both-assets flows with VoiceOver on and sighted assistance unavailable. Repeat with Voice Control and “Show Names/Numbers.” Verify direct drawing, tab switching, Clear confirmation, Continue, Back, rotation, relaunch, preview, free export, purchase mock, and re-export. Inspect the accessibility tree and focus order in Xcode. Do not claim VoiceOver or Voice Control support if the common-task test fails.

### A-02 — Slot-neutral copy is not complete

**Severity:** P1  
**Area:** User-flow completeness, copy clarity, initials-only flow  
**Evidence:** The product permits signature only, initials only, or both. Yet the locked Draw heading is “Draw Your Signature,” the preview action is “Confirm Signature,” the purchase line says “Place your signature on any document,” and the purchase scope sentence says “this signature + initials set.” These become inaccurate or confusing when the user starts with initials only.

**Risk:** The interface may imply that initials were lost, that signature is mandatory, or that the wrong asset will be purchased. The mismatch is especially harmful for a rushed user, an older first-time user, or a screen-reader user relying on the current heading to understand context.

**Required correction — fix in specification:** Make consumer copy state-aware while retaining the supplied copy where it is accurate:

| State          | Draw heading                                                       | Preview confirmation           | Purchase supporting line                           | Scope line                                                 |
| -------------- | ------------------------------------------------------------------ | ------------------------------ | -------------------------------------------------- | ---------------------------------------------------------- |
| Signature only | Draw Your Signature                                                | Confirm Signature              | Place your signature on any document.              | One purchase for this signature + included initials slot.  |
| Initials only  | Draw Your Initials                                                 | Confirm Initials               | Place your initials on any document.               | One purchase for these initials + included signature slot. |
| Both           | Draw Your Signature / Draw Your Initials according to selected tab | Confirm Signature and Initials | Place your signature and initials on any document. | One purchase for this signature + initials set.            |

The segmented control label and selected state must always agree with the heading. “Add Initials, Included” and “Add Signature, Included” must be real buttons, not decorative copy.

**Verification:** Navigation/component tests assert visible and accessible headings/actions for every asset-state permutation. A VoiceOver transcript must announce the selected tab, matching heading, asset presence, and correct confirm action.

### A-03 — Side-by-side preview conflicts with very large text and compact layouts

**Severity:** P1  
**Area:** Large print, Dynamic Type, low vision, orientation, iPad windows  
**Evidence:** The contract requires an identical-document side-by-side comparison occupying most of the screen and also requires very large Dynamic Type, landscape, iPad adaptation, and older-adult readability. Apple’s Larger Text criteria require 200%/system maximum without overlap or severe truncation. Apple’s layout guidance requires adaptation to orientations and resizable iPad windows.

**Risk:** Two full document panels plus labels in an iPhone portrait viewport can become too small to inspect, especially at accessibility text sizes. Scaling the entire preview down preserves geometry but defeats the product lesson. Horizontal clipping or forced side-scrolling raises cognitive load and can hide the paid/free distinction.

**Required correction — fix in specification:** Preserve true side-by-side at standard text sizes when both documents remain legible. At accessibility text sizes, narrow iPhone widths, Display Zoom, and constrained iPad windows, switch to a single-column comparison with the **same fixture, scale, signature size, placement, and date** in both cards. Keep “White Background” before “Transparent — Professional Export,” expose a “Compare versions” heading, and ensure both are in one vertical reading sequence. This is a presentation adaptation, not a change in comparison evidence. Do not use a carousel or swipe-only comparison.

**Verification:** Golden screenshots and manual checks at every iOS Dynamic Type category, portrait/landscape, smallest supported iPhone, iPad split/compact window, Display Zoom, Increase Contrast, and Reduce Transparency. Assert no clipped action, overlap, tiny labels, horizontal page scrolling, or change in fixture identity/placement between variants.

### A-04 — Purchase clarity needs a concise durability disclosure before payment

**Severity:** P1  
**Area:** Purchase clarity, fairness, cognitive load  
**Evidence:** The contract clearly states no subscription, one purchase per set, re-export anytime, an unused second slot included, and that deleting the app may delete reusable artwork that a consumed purchase cannot reconstruct. The proposed purchase screen states scope but not the local-only/deletion consequence.

**Risk:** A user can reasonably interpret “Re-export this set anytime” as durable account-backed availability. Because the product deliberately has no account or cloud restoration, that phrase is incomplete unless the same screen or an immediately reachable disclosure explains “while this set remains saved in the app.” This is a material purchase expectation, not a technical footnote.

**Required correction — fix in specification:** Keep the purchase screen concise, but add a short, non-alarming disclosure immediately below the scope copy or in a clearly named, adjacent “How this purchase works” disclosure:

> Saved only on this device. Deleting the app may delete this set. Exported files are not affected.

Use the localized StoreKit price only. Show the exact current set scope and the included empty slot before invoking StoreKit. The “Save with White Background, Free” action must be fully visible, enabled, high contrast, and at least 44 points high; it must not be hidden below an undisclosed scroll boundary or styled as disabled. Do not add “Restore Purchase.”

**Verification:** Moderated comprehension test: after viewing the pay screen, users must accurately answer what is bought, whether it recurs, whether initials/signature are included, whether the same saved set costs again, whether a changed set costs again, and what deletion does. UI tests assert localized price source and absence of global/lifetime language.

### A-05 — Pending, interrupted, and recovered purchases need an accessible interaction state

**Severity:** P1  
**Area:** Error recovery, purchase fairness, repeat taps  
**Evidence:** The transaction contract is strong technically but does not fully specify what the user sees or hears during pending/recovery states. Financial actions require especially clear status and error prevention. Apple’s VoiceOver criteria require timely announcements for status banners and accurate control state.

**Risk:** A pending purchase can look like a failed tap, encouraging repeated activation. A verified-but-not-yet-bound transaction can relaunch into an unpaid screen. Generic “failure” language can imply a charge was lost or invite another purchase.

**Required correction — fix in specification:** After a purchase starts, disable only duplicate purchase activation, retain Back when safe, and show a persistent text status with one VoiceOver announcement. Distinguish:

- cancelled: “Purchase cancelled. You were not charged by this attempt.” when that statement is known from StoreKit;
- pending: “Purchase pending. Apple is still processing it. This set will unlock automatically when approved.”;
- verification/recovery: “Checking your purchase. Do not purchase this set again.”;
- recovered: “Purchase recovered. Transparent export is ready for this set.”;
- failure: plain-language retry guidance without claiming charge status that StoreKit did not establish.

On relaunch, route a purchased binding to the purchased preview/format flow, never to another pay button.

**Verification:** State-machine and UI tests for cancellation, pending, duplicate callback, repeated tap, interruption, termination after charge, unfinished transaction, verification failure, offline attempt, and successful recovery. Run VoiceOver and Voice Control through each state; assert only one meaningful announcement per state transition.

### A-06 — Accessibility Nutrition Label claims must be withheld until common-task testing passes

**Severity:** P1  
**Area:** Truthful accessibility claims  
**Evidence:** Apple says users must be able to complete **all common tasks** using the indicated feature, assessed separately per supported device family. The build contract asks for accurate draft answers but also requires implementation and testing “where tooling permits.”

**Risk:** Labels based on component props, automated tests, or simulator screenshots alone would overclaim actual usability. The canvas, system share sheet, StoreKit sheet, file destination, format controls, and orientation changes are all common-task dependencies.

**Required correction — release gate:** Draft “not yet verified” for VoiceOver, Voice Control, Larger Text, Sufficient Contrast, Differentiate Without Color Alone, and Reduced Motion. Publish a positive answer only after the complete device-family matrix passes. Captions and Audio Descriptions are not applicable if the app ships no audiovisual content; that is not the same as claiming support.

**Verification:** Record dated, device-specific evidence for all common tasks under each claimed feature and archive App Store Connect answers alongside the test evidence. Re-run after meaningful UI changes.

### A-07 — Glass styling can undermine contrast and system accessibility settings

**Severity:** P2  
**Area:** Low vision, contrast, increased contrast, reduce transparency  
**Evidence:** Apple explicitly calls out translucency, blur, Increase Contrast, Bold Text, and Reduce Transparency in its Sufficient Contrast evaluation. The brand requires substantial frosting, soft highlights, shadows, dark teal backgrounds, and glass buttons.

**Risk:** Content contrast can vary with the background beneath the glass. Thin frosted borders may disappear, selected tabs may be distinguishable only by tint, and white copy can lose contrast over highlights. Decorative depth can also be mistaken for disabled state.

**Required correction — fix in specification:** Define opaque fallback fills for Reduce Transparency and higher-contrast border/text tokens for Increase Contrast. Text must render on a predictable solid or sufficiently opaque layer. Verify at least 4.5:1 for ordinary text and 3:1 for large text and meaningful non-text controls/states. Selection, paid status, destructive status, and transparent/white comparison must include text/shape, not color alone. Preserve button shapes and visible press/focus states.

**Verification:** Automated token/contrast tests plus on-device inspection with Bold Text, Increase Contrast, Reduce Transparency, grayscale, Smart Invert, and light/dark appearance if both are supported. Measure rendered colors, not token pairs alone.

### A-08 — Rotation must preserve state and must not be the only way to gain a usable canvas

**Severity:** P2  
**Area:** Orientation, mobility, cognition  
**Evidence:** Apple recommends adaptive portrait and landscape experiences. WCAG orientation guidance rejects restricting content to one orientation unless essential. The contract says “Rotate for more room,” preserves both tabs, and requires landscape/iPad behavior.

**Risk:** Some users mount devices and cannot rotate them. Rotation can reorder controls, move focus unexpectedly, or lose in-progress strokes. An orientation helper can sound mandatory.

**Required correction — fix in specification:** Phrase the helper as optional: “More room is available in landscape.” Both orientations must support the complete task. Normalize stroke coordinates across size changes; persist selected slot and both assets before layout change. Restore focus to the drawing-area element or previously focused control after rotation and announce the orientation only if it materially changes the layout. Never clear or rescale strokes destructively.

**Verification:** Rotate at empty, mid-stroke, after multiple strokes, while Initials is selected, during Clear confirmation, and after returning from background. Compare normalized hashes/bounds before and after. Repeat with VoiceOver, large text, Split View, and both landscape directions.

### A-09 — The no-Undo rule creates a known hand-tremor and error-recovery tradeoff

**Severity:** P2  
**Area:** Hand tremor, error recovery, locked simplicity  
**Evidence:** The contract explicitly forbids Undo and supplies only confirmed Clear. This minimizes controls, but a late accidental stroke forces a complete redraw. W3C target-size guidance recognizes reduced precision and tremor as important reasons for generous targets.

**Risk:** Users with tremor or accidental palm contact may lose substantial work. Clear confirmation prevents accidental deletion but does not correct a single erroneous stroke.

**Disposition recommendation — explicit exclusion unless conference changes the locked rule:** Preserve the simple no-Undo interface if product authority keeps it, but document the accessibility cost. Mitigate with palm rejection where reliable, rejection of clearly non-drawing system gestures, low-latency feedback, generous canvas, adequate edge padding, and a Clear confirmation. Do not silently remove strokes or “beautify” handwriting. Do not claim the app fully accommodates all tremor scenarios.

**Verification:** Usability sessions with participants who have reduced fine-motor precision; stylus and finger testing; accidental edge/palm contacts; long-signature redraw task. Record failure and abandonment rates without inventing a target until baseline data exists.

### A-10 — Touch targets and action hierarchy are directionally strong but need measurable constraints

**Severity:** P2  
**Area:** Older-adult usability, motor access, cognitive load  
**Evidence:** The contract requires 44-by-44-point minimum targets and 56-point primary buttons. Apple’s button guidance matches the 44-point minimum and requires space and pressed state.

**Risk:** A visible icon may be large while its actual hit region is small. The separate “← Back” text may have a narrow tap area. Segmented controls, dropdowns, menu items, close/dismiss controls, Privacy/Terms links, and thumbnail menus are common failure points.

**Required correction — fix in specification:** Enforce 44 by 44 points for every interactive element, not only primary buttons; maintain adequate spacing between destructive and primary actions; make the full Back row tappable; use at least 56-point height for the dominant action; include visible press, focus, disabled, and selected states. No icon-only primary action. The trash icon must be included in the accessible name “Clear,” not exposed as a second focus stop.

**Verification:** Automated layout assertions against measured hit rectangles plus physical-device target inspection at all Dynamic Type sizes. Perform tremor simulation/usability tests and Voice Control “Show Numbers” review for overlapping targets.

### A-11 — Preview comparison semantics must remain truthful for nonvisual users

**Severity:** P2  
**Area:** VoiceOver, fairness, product comprehension  
**Evidence:** The contract correctly requires the exact same fictional document, drawing, size, placement, date placement, and scale. It also requires a realistic white rectangle that obstructs nearby content.

**Risk:** VoiceOver may read two long copies of fictional legal text without explaining the product difference, or may announce both images merely as “image.” Conversely, an exaggerated accessibility label could overstate the white-background problem.

**Required correction — fix in specification:** Group each preview as one accessible figure. Use concise, factual alternatives, for example:

- “White Background preview. The signature image’s white rectangle covers part of the Signature label, signature line, and Date area.”
- “Transparent preview. The same signature appears in the same position while the Signature label, line, and Date area remain visible.”

Make decorative fixture text inaccessible as separate repeated elements, but provide a single optional “Sample document details” element if needed. Ensure “White Background” and “Transparent, Professional Export” remain visible text and accessible names.

**Verification:** VoiceOver order contains comparison heading, white figure/summary, transparent figure/summary, Confirm action, then Back. Visual regression/pixel tests establish identical fixture geometry and drawing placement; manual review confirms realistic rather than cartoonish obstruction.

### A-12 — “Professional Export” and paid/free visual treatment require fairness testing

**Severity:** P2  
**Area:** Free versus paid, paywall fairness, copy  
**Evidence:** The free result is high quality, accurately cropped, repeatable, and supports white PNG/JPEG. The paid result’s distinguishing feature is transparency. “Professional Export” is prescribed as a secondary label for the transparent preview.

**Risk:** If “professional” is styled as a quality badge while the free output is visually shamed or made hard to select, the screen can imply that the free image is defective rather than format-limited. Conversely, the realistic white-box comparison is legitimate product education when geometry is identical.

**Required correction — fix in specification:** Keep objective labels primary: “White Background” and “Transparent.” If “Professional Export” remains, render it as secondary descriptive copy, not a superiority badge. Never alter stroke quality, scale, crop, or document placement between comparison sides. The free action must remain fully functional and accessible without dismissing a hidden paywall.

**Verification:** Visual-diff tests enforce identical stroke geometry and fixture. Moderated comprehension tests ask users to state what differs; acceptable understanding is background behavior, not “paid has better handwriting/resolution.”

### A-13 — Returning users need names and statuses that do not depend on thumbnails or color

**Severity:** P2  
**Area:** Returning users, multiple saved sets, low vision, VoiceOver  
**Evidence:** The contract permits multiple sets and optional local labels, with signature/initials thumbnails, purchased status, unclaimed status, last-used date, Export, and Create New.

**Risk:** Multiple unlabeled thumbnails are indistinguishable to VoiceOver and hard to distinguish at low vision. “Create New” repeated on every card may sound like it modifies that card. “Purchased” alone can imply a global unlock. Date-only names are hard to remember.

**Required correction — fix in specification:** Assign a non-personal default local label such as “Signature Set 1,” incremented locally; let the user rename it. Each card’s accessibility label must concatenate the local label, assets present, “transparent export purchased for this set” or “white-background only,” included empty slot if any, and last used date where shown. Use explicit per-card “Export” and one prominent global “Create New Set.” Menus must say “Duplicate as New Draft,” never “Edit Purchased Set.” Do not expose thumbnail pixel content as a verbose inferred description.

**Verification:** Create at least five sets across every status. Navigate and operate them with VoiceOver without looking at thumbnails. Verify stable order after relaunch and that rename does not mutate hashes or purchase state.

### A-14 — Back, Done, Create New, and destructive actions need consistent destination semantics

**Severity:** P2  
**Area:** Navigation, cognitive load, recovery  
**Evidence:** The contract is explicit that Back preserves work, purchased Back never returns to unpaid state, Done exits success, and Create New preserves the original.

**Risk:** “Done” has no stated destination. Back from the system share sheet or purchase sheet may differ from in-app Back. Create New from the format screen could be mistaken for clearing the purchased set. Delete Local Set and Delete All Local Data have different scope.

**Required correction — fix in specification:** Lock destinations:

- first-use success “Done” → Saved home with the relevant set focused;
- returning-user export success “Done” → that set’s detail/format screen or Saved home, selected consistently;
- Back → previous logical in-app step with state preserved, except post-purchase where it remains within purchased state;
- Create New Set → new draft while original remains visible in Saved;
- Delete Local Set → removes one set after named confirmation;
- Delete All Saved Signatures → removes all app-local assets after explicit scope confirmation.

Move accessibility focus to the new screen heading after every navigation. Restore focus to the originating control when dismissing confirmations. Support the VoiceOver escape gesture where it maps safely to Back/dismiss.

**Verification:** Navigation state-machine tests for every entry point, deep relaunch/recovery state, modal dismissal, and success variant; VoiceOver focus trace across each transition.

### A-15 — Error messages need text, recovery action, and restrained announcements

**Severity:** P2  
**Area:** Error recovery, cognitive accessibility  
**Evidence:** The contract calls for plain-language error copy and announcements after Clear, purchase, export, failure, and success. W3C requires text identification of errors; Apple asks that important status be conveyed promptly but non-disruptively.

**Risk:** Toast-only errors disappear too quickly. Repeated live announcements become noisy. Raw StoreKit/storage concepts increase anxiety. A share-sheet cancellation is not necessarily an error.

**Required correction — fix in specification:** Every blocking error must state what happened, whether work remains safe, and the next action. Keep it visible until dismissed or resolved; send one appropriate accessibility announcement; move focus only for modal/blocking errors. Treat user cancellation as a neutral return state. Use specific local states, for example: “Couldn’t save the file. Your signature is still saved in Only Signature. Try again or choose Share.” Never show stack traces or transaction IDs.

**Verification:** Component tests assert title/body/action and focus behavior for every error in the copy deck. Manual VoiceOver tests ensure no duplicate announcements and that recovery controls are next in order.

### A-16 — Large-print layouts require content prioritization, not merely font scaling

**Severity:** P2  
**Area:** Dynamic Type, cognitive load, landscape  
**Evidence:** Apple’s Larger Text criteria reject overlap and severe truncation. The contract contains benefit cards, document previews, long purchase scope copy, independent dropdowns, card menus, and legal links.

**Risk:** Fixed heights, absolute positioning, horizontal segmented controls, two-column cards, and document overlays can clip at accessibility sizes. Shrinking copy defeats Larger Text. Keeping primary actions fixed at the bottom can obscure focused content.

**Required correction — fix in specification:** Use semantic Dynamic Type styles with font scaling enabled; allow multiline wrapping; avoid fixed text container heights; stack horizontal controls at accessibility sizes; make screens vertically scrollable; keep key actions reachable without covering focused content; use large-content alternatives for icons where appropriate. Maintain at least one clear heading and one dominant action, even when benefits stack. Do not reduce the user’s selected text size.

**Verification:** Screenshot matrix at all Dynamic Type categories plus pseudo-localization; automated assertions for clipped text where possible; manual checks with screen magnification, Display Zoom, hardware keyboard, and landscape.

### A-17 — Focus order, labels, and state must match the visual language

**Severity:** P2  
**Area:** VoiceOver, Voice Control, keyboard access  
**Evidence:** Apple requires concise labels, roles, states/values, visible text accessibility, and logical navigation. WCAG’s Label in Name supports speech-input users by requiring the accessible name to contain the visible label.

**Risk:** Custom glass cards and segmented controls can become generic “button” elements with no selected state. An accessible name that differs from visible text breaks “Tap Confirm Signature” voice commands. Decorative icons and duplicated text can add noise.

**Required correction — fix in specification:** Centralize visible and accessible strings together. Expose native roles and states for buttons, tabs/segments, dropdowns, menus, links, headings, alerts, and images. The visible phrase must be contained in the accessible name. Mark the selected Signature/Initials segment; expose asset presence separately. Hide purely decorative glass, shadows, checks, and document ornamentation from accessibility. For iPad, every common task must be possible with hardware keyboard and visible focus.

**Verification:** Accessibility-tree snapshots, keyboard-only walkthrough, Voice Control name-overlay walkthrough, and VoiceOver rotor/order review for every screen and modal.

### A-18 — Reduced motion and haptics must be supplementary

**Severity:** P3  
**Area:** Motion sensitivity, sensory alternatives  
**Evidence:** The visual style calls for three-dimensional glass, which can invite animated blur/depth/parallax. Apple calls those specific reduced-motion risks.

**Risk:** Decorative parallax, scale transitions, moving shine, or animated checker/lens effects can cause discomfort. Haptics alone cannot communicate success or failure.

**Required correction — fix in specification:** Avoid continuous movement. Respect Reduce Motion; replace parallax/scale/depth transitions with short fades or no animation. Never animate the signature strokes into a different shape. Pair every haptic with visible text and an accessibility announcement. Respect system haptic settings and avoid repeated vibration during drawing.

**Verification:** Device test with Reduce Motion enabled and disabled; inspect every transition, success state, glass effect, and orientation change. Complete the flow with haptics unavailable.

### A-19 — Privacy reassurance is ordered correctly but must not become a promise the UI cannot explain

**Severity:** P2  
**Area:** Copy clarity, privacy-conscious users, fairness  
**Evidence:** The contract wisely leads with the user’s job, not technical privacy language, and prefers “Created on your device. We do not upload it.” It distinguishes app behavior from user-selected Files, Photos, email, AirDrop, or cloud destinations.

**Risk:** “We do not upload it” may be interpreted to cover user-initiated sharing unless export destination copy states where control transfers. “No login” and “no subscription” can be buried if cards collapse at large text.

**Required correction — fix in specification:** Keep the exact preferred privacy claim. On the export destination sheet, explain once: “Only Signature creates the file on this device. The destination you choose may store or send it under that service’s terms.” Keep no-login/no-subscription visible on landing and purchase surfaces. Do not add absolute “never leaves your device” or “100% private.”

**Verification:** Copy drift tests across app, site, store metadata, privacy policy, and FAQ. Network observation confirms the claim for automatic app behavior. Usability interview checks the distinction between automatic upload and user-selected sharing.

### A-20 — Scope control is strong; optional formats are the primary feature-creep pressure

**Severity:** P3  
**Area:** Product scope, feature creep  
**Evidence:** The contract excludes documents, accounts, cloud, collaboration, AI signatures, typed fonts, templates, subscriptions, ads, analytics, and a backend. PNG and JPEG cover the core job; SVG and PDF are conditional.

**Risk:** SVG/PDF, Photos, Copy, complex Saved menus, app preview, and advanced diagnostics can delay the core signature/initials/transparent-PNG experience or create unsupported transparency claims.

**Disposition recommendation — explicit gate:** Ship only formats and destinations whose truth table passes. PNG transparent/white and JPEG white are core. SVG and PDF stay hidden unless interoperability, bounds, privacy, and alpha tests pass on target viewers. Screenshot, website, metadata, and support tooling do not justify adding app features. Do not expand into document signing to improve screenshot variety.

**Verification:** Feature inventory and dead-navigation test; production UI enumeration against the supported-format registry; no unavailable option may render.

## End-to-end flow audit

### Fresh user

1. **Landing:** Correctly establishes the job and transparency benefit before privacy/legal/StoreKit language. Ensure benefit cards stack at large text and Privacy/Terms remain reachable without appearing mandatory.
2. **Draw:** The dual-slot design is efficient and preserves work. The selected tab, presence of work in the other tab, and state-aware heading must be unmistakable. Continue is valid if either slot exists. If both are empty, an enabled Continue with a clear announced message may be more explanatory than an unexplained disabled button.
3. **Preview:** The same-document comparison is the strongest teaching moment. It must adapt per A-03 and provide nonvisual summaries per A-11.
4. **Missing slot:** “Included” must be stated before purchase. Add/Continue must be equally understandable; neither choice can imply that skipping forfeits the slot.
5. **Purchase/free choice:** The per-set scope is fair if the free action is visible and the deletion caveat is clear. The system purchase sheet must not be invoked until the local frozen-set state is durable.
6. **Format/export:** Independent format selectors are justified only for existing assets. Defaults should be safe and obvious: purchased assets default to “PNG, Transparent”; free assets to “PNG, White Background.” Never preselect JPEG under a transparency heading without the white-background label.
7. **Success:** The intentionally sparse success screen is good. The message must be asset-aware and “Done” must have a locked destination.

### Returning user and multiple sets

The Saved section is appropriate if it remains a card list rather than a file manager. Cards need default text labels, explicit per-set status, and non-color distinctions. Purchased sets are immutable; duplication as a draft is understandable when the confirmation states that the original remains and a changed transparent set needs a new purchase. A renamed set must remain the same purchased set. Delete controls must never suggest that exported files or Apple’s transaction history are deleted.

### Free versus paid

The free product is substantively useful: it retains stroke quality, crop, padding, repeat export, PNG/JPEG choices, and no login. Charging only for transparent export of a set is defensible if:

- both options are visible before purchase;
- the free artifact is not intentionally degraded;
- the visual comparison is geometrically identical;
- the paid scope is per set, not global;
- the included empty slot does not expire or trigger another charge;
- purchased sets can be re-exported in any supported format without another purchase;
- app deletion limitations are understood;
- transaction recovery cannot route a paid set back to the paywall.

### Error and recovery hierarchy

1. Preserve user strokes first.
2. Explain whether purchase state is known, pending, or being recovered.
3. Prevent duplicate financial action while status is unresolved.
4. Preserve a clear Back/Done path.
5. Offer one best recovery action and one safe alternative where applicable.
6. Announce the state once; keep text visible.

## Older-adult and situational-user walkthroughs

These are acceptance scenarios, not claims that all older adults have the same needs.

### 1. A 72-year-old first-time iPhone user

- Reads one large headline and one dominant action on landing.
- Sees Signature/Initials as labeled choices, not technical modes.
- Sees “Clear” with a trash icon but no competing Undo.
- Receives confirmation before clearing.
- Understands the exact white-background problem from matched documents.
- Can state “$localized price buys transparent export for this saved set; it is not a subscription.”
- Returns to a plainly labeled Saved card after Done.

**Failure signs:** asks where to upload a document, thinks both slots are mandatory, expects a recurring charge, cannot find the free option, or believes “re-export anytime” survives deletion automatically.

### 2. A low-vision user using very large text

- All headings, controls, status, and legal/support links scale to the maximum supported category.
- Preview changes to a legible single-column comparison rather than tiny side-by-side documents.
- Glass becomes sufficiently opaque/contrasted under accessibility display settings.
- No text truncates into ambiguous labels; no bottom action obscures focus.

**Failure signs:** document labels are tiny, format option names truncate to identical text, selected state is color-only, or Back is clipped.

### 3. A user with hand tremor

- Canvas is large and immediate; controls are spaced and at least 44 points.
- Clear requires confirmation and defaults focus to “Keep Drawing,” avoiding accidental loss.
- Rotation is optional.
- Purchase button rejects repeat taps while displaying status.

**Known limitation:** without Undo, a single accidental mark may require a full redraw; this must remain an explicit tradeoff unless product authority changes the rule.

### 4. A privacy-conscious professional

- Sees the value proposition first, then the accurate on-device/no-upload statement.
- Never provides a document, account, or typed legal name.
- Understands that user-selected destinations may transmit/store the exported file.
- Can find data/storage behavior and Delete All Saved Signatures.
- Receives no false “never leaves your device” or legal-certification claim.

### 5. A rushed user completing a form

- Can create signature only and continue without initials.
- Learns that initials remain included rather than forfeited.
- Chooses free white PNG/JPEG or paid transparent PNG without reading a paragraph.
- Uses a sensible default filename and a direct Share/Files path.
- Can re-export the same purchased set without encountering another paywall.

**Failure signs:** duplicate confirmation screens, unclear format jargon, mandatory initials, hidden free path, or an unexplained purchase pending spinner.

## Product and accessibility acceptance matrix

| Area               | Locked acceptance criterion                                                                                                        | Minimum evidence                                                             |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Product scope      | No document upload/signing/account/cloud/backend/subscription/AI signature/template flow exists.                                   | Navigation inventory, dependency/network audit, production build inspection. |
| Signature/initials | Either slot alone or both can complete; each persists independently.                                                               | State tests and relaunch/rotation tests.                                     |
| Canvas             | Vector capture works with touch; assistive-tech entry/exit/state is defined.                                                       | Physical VoiceOver/Voice Control runs and canvas performance test.           |
| Clear              | Clears selected slot only after “Clear this drawing?”; “Keep Drawing” is safe default.                                             | Unit/component/E2E plus focus restoration.                                   |
| Preview            | Exact same fixture/drawing/geometry; realistic white obstruction; adaptive accessible layout.                                      | Pixel/golden tests and manual review.                                        |
| Purchase           | Localized price; per-set scope; no subscription; included slot; deletion caveat; no duplicate tap.                                 | StoreKit UI/state tests and comprehension test.                              |
| Free export        | Full-quality white PNG/JPEG, repeatable, visible action.                                                                           | Pixel tests and independent free-flow E2E.                                   |
| Purchased export   | Same set re-exports without purchase; independent formats; purchased slots immutable.                                              | Persistence/state/E2E tests.                                                 |
| Returning user     | Multiple sets have text names and explicit per-set statuses.                                                                       | Five-set VoiceOver walkthrough and relaunch test.                            |
| Dynamic Type       | Common tasks work at 200%/system maximum without overlap or severe truncation.                                                     | All-category screenshots and physical-device run.                            |
| Contrast           | Text and meaningful UI meet measured thresholds; glass fallback works.                                                             | Rendered contrast audit under system settings.                               |
| VoiceOver          | All common tasks work without sighted help.                                                                                        | Device-family transcript; claim withheld until pass.                         |
| Voice Control      | All touch controls have operable visible-name targets.                                                                             | Device-family command walkthrough; claim withheld until pass.                |
| Orientation        | Full task works in portrait/landscape; state and focus persist.                                                                    | Rotation matrix including mid-flow and large text.                           |
| Motor access       | Every target ≥44x44 pt; dominant actions generally ≥56 pt; spacing prevents mis-taps.                                              | Measured rectangles and usability sessions.                                  |
| Error recovery     | Errors are textual, persistent, announced once, and preserve work where possible.                                                  | Error-deck component tests and manual AT test.                               |
| Reduced motion     | No required parallax/scale/continuous motion; system setting respected.                                                            | Device test with Reduce Motion.                                              |
| Keyboard/iPad      | Common tasks, except inherently freehand stroke creation, are keyboard operable with visible focus; drawing limitation documented. | Hardware-keyboard walkthrough.                                               |

## Proposed locked decisions for the conference

1. **Adopt slot-aware copy.** “Signature” cannot remain the action label for an initials-only state.
2. **Adopt an adaptive comparison exception.** Side-by-side is the default; same-fixture vertical stacking is required where large text or compact width makes side-by-side illegible.
3. **Define the canvas interaction contract before component selection.** Native direct interaction may be necessary; React Native labels alone do not prove VoiceOver access.
4. **Keep Accessibility Nutrition Labels unclaimed until physical-device common-task evidence exists.** Drafts must say “not yet verified.”
5. **Add a concise local-durability disclosure at the purchase boundary.** “Re-export anytime” must not imply cloud restoration.
6. **Keep the free action visibly accessible.** It is a genuine product path, not a paywall dismissal.
7. **Keep no Undo only as an explicit simplicity tradeoff.** Document its hand-tremor cost and validate mitigations.
8. **Use text-first Saved-set identification.** Thumbnails and color are supplementary.
9. **Treat glass as decoration, not information.** Provide opaque/high-contrast fallbacks.
10. **Lock navigation destinations and focus behavior.** Especially Done, Create New Set, post-purchase Back, and destructive confirmations.

## P0/P1 disposition register

| Finding                               | Severity | Proposed disposition before implementation authority                                                                                            | Verification gate                                       |
| ------------------------------------- | -------: | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| A-01 Canvas assistive interaction     |       P1 | Fix in specification; if full common-task access proves infeasible, explicitly exclude the VoiceOver/Voice Control label rather than overclaim. | Physical iPhone/iPad VoiceOver and Voice Control flows. |
| A-02 Slot-neutral copy gap            |       P1 | Fix in specification with state-aware headings/actions.                                                                                         | Asset-state navigation/copy tests.                      |
| A-03 Side-by-side/large-text conflict |       P1 | Fix in specification with same-fixture vertical adaptation.                                                                                     | Maximum Dynamic Type and compact-window screenshots.    |
| A-04 Purchase durability clarity      |       P1 | Fix in specification with concise local-only/deletion disclosure and visible free action.                                                       | Comprehension study and purchase-screen assertions.     |
| A-05 Purchase recovery UX             |       P1 | Fix in specification with durable visible states, duplicate-action guard, and announcements.                                                    | Transaction-state E2E/VoiceOver matrix.                 |
| A-06 Accessibility claim truthfulness |       P1 | Release-gate all positive claims on complete common-task evidence per device family.                                                            | Dated evidence and final App Store answer review.       |

## Final Auditor A authority statement

**Decision: CONDITIONAL PROCEED.** The product definition is narrow, coherent, and capable of being fair and usable. Implementation may proceed after the conference adopts explicit dispositions for A-01 through A-06. No Accessibility Nutrition Label, “accessible” marketing claim, or device-family support statement is authorized by this specification audit alone.

The most important design principle for implementation is: a simple interface is only simple if every state tells the user what they have, what will happen next, what the purchase covers, and how to get back without losing work.

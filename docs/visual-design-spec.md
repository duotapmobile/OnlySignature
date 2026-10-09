# Only Signature Visual Design Specification

Updated: 2026-10-04

## Reference attribution

| Attribute         | Source                                                                         | Transfer                                                                 | Exclude                                                       |
| ----------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------- |
| Brand palette     | Existing Only Signature product                                                | Night navy, warm paper, restrained gold, white wordmark                  | Teal, purple, gray checkerboards                              |
| Density and depth | User Photo 1.jpg, attachment 8F1B4C80, central three-phone finance composition | Compact hierarchy, useful full-screen density, soft layered elevation    | Finance content, navigation, giant empty cards, chart bubbles |
| Signature motif   | Existing Only Signature brand assets                                           | Gold baseline, fictional handwritten signature, editorial serif headings | Floating artwork, signatures detached from their baseline     |
| Flow and copy     | Current product requirements and user corrections                              | Existing routes, exact action meaning, privacy and purchase behavior     | Flow changes made only to simplify layout                     |

## System rules

- Canvas: `#02040A` night background with a warm `#F8F6EF` paper surface.
- Primary ink: `#071F5A`; primary action: `#0A3D78`; accent: `#D8B66A`.
- Shadows are layered, tinted, and low opacity. Large black drop shadows are not part of this system.
- Primary actions use content-width pills where practical, a 56-point minimum height, 19-point bold labels, and no decorative right arrows.
- Secondary text actions retain a 44-point touch area without an extra card or pill unless the action needs containment.
- Navy header and paper body are adjacent normal-flow sections, not a fixed-height decoration behind text. Back/settings and the wordmark occupy a shared 44-point navigation row. Titles follow it; body content starts below the header boundary.
- Spacing rhythm: 4/8/12/16/24 points. Card gaps use 12, compact selections 10. Radii: frame 32, preview/selection 24, compact list 18, selectors 14, primary pills 999.
- Presentation frames cap at 780 points wide and 1000 points tall on portrait tablets; the night canvas still fills the viewport. This prevents empty paper sheets from stretching to the entire iPad height.
- Real signature previews align the original 69%-height capture guide to the displayed baseline. Descenders remain below it. This is presentation-only; stored strokes, hashes, and export geometry remain unchanged.
- Sample handwriting uses the same measured baseline treatment on launch, Home, Review, and document examples. Saved-list thumbnails center their ink instead of adding an artificial baseline.
- Preview labels and Edit/Add controls share a normal-flow header row. Actions must not float over the artwork.
- Short landscape pages and enlarged native text use intentional scrolling. Labels may wrap at larger text sizes; normal-text one-line requests must not force accessibility text to shrink.
- Landscape Home uses adjacent navy and paper sections capped at 440 points tall at standard text size. Its benefit rows stay grouped, rather than being distributed across the height of an iPad. Enlarged native text removes that height cap and keeps content scrollable.
- Portrait Home also groups benefit rows with a fixed 12-point gap rather than distributing individual rows across unused height. The benefits and action groups share the remaining paper space; portrait tablet Home is capped at 860 points tall at standard text size.
- The opening's portrait tablet composition is capped at 620 points wide and 860 points tall; wider landscape uses a 1000-by-440-point cap. Its night canvas still covers the viewport. This is a responsive composition, not an enlarged empty signature card.
- Static review, comparison, export and white-confirmation groups center within available paper space when their content reaches its useful size limit. They do not create an unused tail below the last action. Capture canvases retain room for drawing and Saved Sets retains intentional list scrolling; neither is padded with invented content.
- At enlarged native text sizes, the shared header scrolls with its body so a tall title cannot consume the entire usable viewport. Full-bleed capture owns its touch surface; it is not wrapped in a scrolling gesture container. Initials retains Skip for Now in both orientations.
- Recoverable operation errors use a safe-area-aware, bounded scroll region with a reachable Dismiss action. Startup storage/artwork failures instead use a blocking, scrollable paper recovery surface; dismissing it must not expose an unhydrated draft or purchase control.
- Format dialogs and destination dialogs use the same paper, gold edge, and navy controls, with a bounded scroll region and reachable Cancel/Close actions.
- Editorial serif headings establish hierarchy. Sans-serif labels and body copy remain compact and readable.
- All customer-facing copy avoids long em dashes.

## Screen contracts

- Home keeps the headline, signature ticket, three benefits, privacy line, primary action, and small saved-set link visible together.
- Full-name capture is titled `Sign`. The canvas, Redo, split-name option, and Save Signature action stay visible in portrait. Landscape paper fills the screen, with a full-width ink region below navigation and above Save. Reserve 72 points above and 84 below the ink region; toolbar and actions must never cover handwriting or intercept a drawable area.
- Split-name capture contains only the active first- or last-name canvas, its progress, Back, Redo, and the save action. It never repeats the full-name-canvas choice.
- Review uses `Review your signing set` without a redundant eyebrow. Its supporting sentence remains clear of decorative rules.
- Background choices use one shared fictional document layout. The transparent version reveals the document; the white version visibly covers part of the date.
- Purchase actions say `Purchase Transparent Signature`, with the localized price directly below followed by `One-time purchase`.
- Comparison and warning screens reuse the same document logic, readable labels, and compact actions without a separate action dock.
- Export dropdown arrows share one fixed trailing position. Export subtitles must remain visible.
- Export controls include the actual stored signature and initials previews, so the space supports choosing a format rather than becoming an empty form. The previews do not change generated files.
- Export previews use 64-point wells on short screens and 104-to-160-point wells on taller screens. The containing surface uses the shared 24-point radius, gold edge and soft tinted card shadow. Larger previews are for inspecting actual ink, not longer buttons.
- The DIY warning compares centered ink without an invisible baseline pushing the artwork down. The intact/damaged examples retain the same framing; the intentionally removed stroke gaps remain an illustration, not edits to the customer's stored drawing.
- White confirmation uses the shared header and paper body, with baseline-aligned saved artwork and a compact Done action. It has no separate decorative button dock.
- A successful transparent purchase proceeds directly to Transparent Export; there is no intermediate transparent confirmation screen.
- Saved Sets uses compact list cards, an unclipped title, and no content overflow.
- Saved Sets owns its scrolling through FlatList, including at larger text sizes; it is not nested in another vertical scroll container.

## Interaction rules

- Drawing input uses adaptive One Euro filtering and a 5.5-point sampling threshold to reduce finger jitter while preserving deliberate curves.
- Filtering and the sampling threshold use physical screen points before mapping to the stored drawing plane. Resizing or rotating cannot silently change sensitivity; stored customer strokes, export geometry, and ink width remain unchanged.
- Drawing itself is silent. Haptics are reserved for selection, major actions, success, warning, and error feedback.
- Loading feedback waits 300 milliseconds before appearing, preserves control geometry, and never replaces recoverable user data.
- All interactive controls keep at least a 44-point touch target and respect Reduce Motion and Dynamic Type.
- Raised controls compress their shared tinted shadow on press; quiet text links and Back controls do not scale or move. Focus outlines are two points, navy on paper and light gold on navy, without changing layout geometry or native keyboard behavior.
- Background selection uses a navy ring/dot for non-text contrast on paper. Gold remains the brand edge/accent, not the sole selected-state indicator.
- Format selectors are disabled during export preparation. Format and destination dialogs suppress fades under Reduce Motion.
- Purchase background choices and fallback actions are disabled while purchase presentation is busy. Localized pricing remains visible in that state; applying an existing unbound purchase still does not display a new charge.
- Purchase is offered only after the exact Apple product and its nonempty localized price load. A 15-second, single-flight catalog request serves launch, foreground, and explicit retry. Loading and unavailable states reuse the same button geometry; new transient status labels are `Loading Apple Price...`, `Retry Apple Price`, and `Apple price unavailable`. Price retry never purchases, freezes, or navigates a set, and the free path remains enabled during catalog-only loading.
- Terminal request failure uses recoverable error feedback rather than claiming the set is frozen. Pending approval, cancellation, ambiguous interruption, verification failure, and locally unfinished delivery retain distinct messages. Success feedback requires a matching, durably bound, finished purchase; the feedback classifier does not change fulfillment or storage. Rapid purchase taps have one haptic owner and one action guard. A selected-set change during catalog preflight aborts before freezing or charging.
- A thrown operation may leave a durable purchase hold. Exception feedback defers to that live recovery status instead of covering it with a generic retry suggestion; definite cancellation or verification results retain their explicit feedback. This priority never clears, unlocks, or recharges a set.
- Reopened pending, interrupted, finishing, and other-set purchase holds use the existing status copy in one quiet, normal-flow navy-on-pale-paper message. Pending/recovery and cancellation are informational; actual operation failures use the shared error treatment. The status is derived from existing state and does not unlock, attach, finish, or charge a purchase.
- Purchase feedback retains 14-point scalable copy with polite status announcements or assertive errors. Long feedback makes the body intentionally scrollable; ready-state screens remain fixed at standard text size. Small-phone background recovery uses six-point card padding, four-point body padding, a four-point inner gap and 44-point swatches to accommodate emphasized pricing without shrinking the message. Enlarged native text does not use that compact recovery recipe.
- Destination-specific progress is inside the export destination dialog, replacing its measured guidance area after the shared delay. An overlay behind a native Modal is not sufficient feedback. Back, Done, and confirmation behavior remain unchanged.
- Shared web controls map native accessibility-state fields to the installed web runtime's individual ARIA properties. Native state props, refs, input handlers, and keyboard behavior are preserved; explicit caller ARIA values take precedence.
- Static web navigation waits for a matching hydration snapshot before mounting viewport-dependent routes. All platforms additionally wait for existing storage hydration and four bundled launch images before mounting routes. Native splash release waits for the ready navigation or blocking recovery surface to lay out, followed by two paint frames and the installed 250ms opacity handoff. Storage/provider rules are unchanged; actual native handoff timing remains unverified.
- Bundled image warmup is non-interactive and hidden from accessibility. An image error or ten-second timeout exposes a text-safe recovery surface. Storage recovery retains the provider's exact existing message and takes precedence over artwork failure. Successful hydration clears only its matching stale startup error, not unrelated operation errors.
- Sample artwork is measured in a separate frame; centered and baseline modes both use explicit image dimensions. Ink tint belongs to the Image, not the measuring View. Baseline fitting preserves descenders and never rewrites stored customer strokes.
- Hidden export raster-capture surfaces mount outside the user-facing scrolling page, retaining their exact dimensions, refs, and white/transparent settings. They must not create blank scroll space beyond Download.
- The opening uses side-by-side copy/signature in landscape, a top-right wordmark, and a 28-point portrait composition gap. Home's 27-point tagline has a 36-point line box; decorative rear edges remain inside the viewport.
- Legal Markdown display formatting is consistent across headings, paragraphs, and bullets, without editing the canonical legal wording.

## Verification boundary

- Review pins are feedback overlays, never application content. Clean screenshot view is the default; Show saved markup restores all saved pins without deleting them. Original pin positions can be stale after layout changes and are labeled accordingly. Implementation notes are a separate, read-only record, not a replacement for founder approval.
- The opening groups its copy and baseline-aligned handwriting with a deliberate 28-point gap. It does not use an auto margin to create an unexplained empty region between them.

- Coded previews cover 375x667, 390x844, 430x932, 768x1024, and 1024x1366 portrait layouts plus their matching landscape sizes. Responsive capture checks cover full-name, first-name, last-name, and initials, including the landscape Skip for Now action.
- Browser-rendered previews are preliminary visual evidence. A signed native build and physical-device review remain separate release gates.
- Do not upload a TestFlight build until the refreshed contact sheet is reviewed and the native release checks pass.
- Provisional new UI-only artwork-failure copy, explicitly disclosed rather than treated as locked content: `The opening visuals could not load. Reopen Only Signature to try again. Your saved signing sets are unchanged.` The normal loading string and protected-storage recovery message are existing app copy. This new fallback does not classify purchases or alter stored data.
- Native QA contracts must retain the same fifteen state IDs and routes as the browser review manifest, including purchase recovery and both export screens. The removed transparent-confirmation state must not return. Native split-name flow checks draw before each save and verify the empty/ink-enabled states; fixture captures are not substitutes for that interaction check. The held opening fixture proves only a final composition, not native splash handoff or animation timing. Screenshot copy is escaped as literal Maestro selectors, including the U.S. mock price; real StoreKit continues to supply localized pricing.

## Cohesion pass evidence, October 2

- Inspected the complete 15-screen contact sheet, small-phone close-ups, tablet layouts, all ten supplementary screen renders, format dialogs, and a real stored-ink Review capture.
- Main flow captures: 45 actual Expo web screenshots across small iPhone, large iPhone, and iPad preview sizes. The opening fixture holds the implementation's final animation state; capture does not restyle the DOM.
- Responsive checks: 375x667, 390x844, 430x932, 768x1024, and 1024x1366; capture uses full-bleed landscape at 667x375, 844x390, and 932x430. Short non-capture landscape screens are intentionally scrollable.
- Secondary screens: Settings, Privacy, Terms, Support, FAQ, Data and Storage, Accessibility, Licenses, included-slot recovery, and empty Saved Sets at 375x667 and 768x1024.
- Interaction checks cover format selection/cancellation, decline-to-white navigation, empty-drawing rejection, a synthetic browser drawing saved into Review without clipping, and isolated review-workspace zoom/markup/save/submit. Browser mouse input is not proof of physical-iPhone finger feel.
- User feedback and its statuses are preserved. The removed transparent-confirmation note is retained as archived feedback; it is not silently approved or discarded.
- Native iOS rendering, physical touch sensitivity, VoiceOver, and actual iOS Dynamic Type remain unverified on this Windows host. No native/cloud build, GitHub push, or TestFlight upload was initiated in this pass.
- The full local acceptance chain reached npm audit and failed on 37 reported dependency vulnerabilities, including 25 high-severity findings. Export and site release checks were run separately. Do not bypass this gate or apply forced framework downgrades as a visual fix.

## Dedicated protocol audit, October 3

The requirement-by-requirement implementation record and remaining native gates are in `docs/audits/17-visual-protocol-audit-2026-10-03.md`. Repeat the focused browser contrast/target/focus/dialog audit with `npm run verify:visual-protocol`. This is a direct audit by the implementation agent, not a second-agent review or an iOS accessibility certification. Raw findings live in `artifacts/visual-protocol-audit/report.json`; founder feedback is stored separately and is never changed by the audit.

## Founder-feedback rendered pass, October 4

### Minor annotation pass, October 4, 22:01 UTC feedback

The selected finance-reference attribution stays unchanged: useful density and grouping, navy/paper hierarchy, and soft tinted depth. Finance content, browser chrome, and chart geometry remain excluded. This pass adapts the five newly written pins without changing the capture flow, deleting feedback or approving a screen.

- Opening supporting text: `Your signature and initials. Ready to reuse.` A deliberate break after `initials.` avoids an orphaned final word. Timing, clean asset, gold guide and baseline rules are unchanged.
- Shared purchase price: Apple-localized amount at 21-point/27-line bold, beside 14-point one-time information, on pale gold `#F3E7C8` with a one-point `#D8B66A` edge and 14-point radius. No price is invented when the catalog is unavailable; applying an existing purchase does not display a new charge. The price is not a shadowed action dock.
- The DIY pin targets damaged handwriting. Three proportional blank bands at 23%, 36% and 68% make the missing-stroke example clearer. Original artwork and stored/exported drawings are unchanged. This is illustrative, not a claim that all background removal causes this exact damage.
- White confirmation preserves both sentences, with a hard line break after `device.`
- Saved Sets has text-only, content-sized rows: existing label (or `Signing Set`), creation date, background/hold status and existing actions. No handwriting OCR or inferred names. Titles are 20/26 bold, dates 14/20 muted, with a four-point label/date gap and eight-point metadata gap. Capture, review and export previews remain.
- An optional immutable `createdAt` records new creation and receives its own timestamp for duplication. Validation retains valid dates and normalizes missing/invalid legacy metadata to null without changing ink or entitlement. Never substitute mutable `lastUsedAt` or purchase dates. Disclosed new fallback: `Creation date unavailable`. Older records cannot retroactively acquire a truthful creation date from information that was not recorded.

This pass is recorded in `docs/audits/21-minor-feedback-2026-10-04.md` and `design-qa.md`. Historical all-size evidence below applies only to its stated older bundle, not the changed app.

Current evidence is in `docs/audits/20-rendered-feedback-audit-2026-10-04.md`, superseding the source-only checkpoint and earlier browser bundles. The final bundle is `entry-ee3cb3d49956d42824c5ee04e8a248d9.js`. Bounded Home/opening composition, grouped benefits, centered comparison/control groups, enlarged tall-screen export wells and separated landscape ink/control rows passed the full local browser gate. The final 240-layout matrix, ten dialogs and ten opening captures had zero findings and zero runtime exceptions; all twenty matrix contact sheets and opening/dialog sheets were inspected. Forty-five main-flow captures were refreshed at `2026-10-04T17:08:21.725Z`, and the final contact sheet and selected-reference comparison were inspected. Founder review remains open. Native rendering, physical touch feel and live StoreKit remain unverified. The refreshed dependency audit failed with 36 findings, including 24 high, so this is not full release acceptance. No native/cloud build or publication was initiated.

`npm run verify:purchase-recovery` renders four persistent purchase states on all three purchase-capable routes at 375x667, 667x375, and 768x1024, plus locked Saved Sets at those sizes. It checks complete message bounds, contrast, status semantics, disabled purchase behavior, non-empty unchanged artwork, reachable fallback targets, and retained Back navigation. These are isolated presentation fixtures, not native StoreKit, storage-durability, VoiceOver, or Dynamic Type evidence.

The preceding local bundle, `entry-04e660cde495b463e6ab70d7ead8caef.js`, passed the former consolidated browser gate, including 48 protocol layouts, two dialogs, two opening captures, 36 recovery layouts, and three locked Saved Sets layouts. All 45 main-flow screenshots were refreshed and the complete contact sheet inspected. That checkpoint had 133 passing mobile tests, 50 root tests, and six export tests. Full acceptance failed the dependency audit (37 vulnerabilities, 25 high and 12 moderate). It did not establish a per-route all-size matrix or native/device pass; this is not TestFlight or production sign-off.

The subsequent all-size pass adds `npm run verify:visual-matrix` to the consolidated gate: all 24 route/state layouts in all ten requested viewports, complete rendered text/control reachability, clipping and overflow checks, initial/scrolled contact sheets, and all-size opening/dialog checks. The first 240-layout run exposed findings, retained in `artifacts/visual-layout-matrix/pre-correction-report.json`; it is not a pass. Evidence-backed scroll-tail, Home line-box/edge, legal-formatting, and landscape-opening corrections passed the complete browser gate on `entry-e907e909d4878919655c10e4e9f8b23a.js`: 240 matrix layouts, ten dialogs, ten opening captures, zero findings, and zero runtime exceptions. All twenty matrix contact sheets and the opening/dialog state sheets were inspected, as were the refreshed main contact sheet and key small-phone close-ups. The screenshot process now rejects an unpainted Back control instead of trusting DOM bounds alone. Proportional state-sheet composition passed separately and is part of future consolidated runs. Founder review statuses remain unchanged. Full acceptance still stops at the same dependency findings, while six export tests and local website checks passed separately. No new native dependency or release action is involved; native/device validation remains open.

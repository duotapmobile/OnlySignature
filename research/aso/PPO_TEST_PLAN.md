# Product Page Optimization Test Plan

Research date: 2026-08-25  
Storefront: United States, en-US  
Status: launch-ready experiment design; no outcome or lift is claimed

## Current Apple operating rules

Apple’s Product Page Optimization (PPO) can test screenshots, app previews, descriptions, and app icons. A test can include up to three treatments and run for up to 90 days. Analytics begins reporting once at least five first-time downloads are attributed to the test. Apple uses Bayesian analysis and may label a treatment better or worse at 90% confidence; low-traffic tests may remain inconclusive. See Apple’s [PPO Analytics reference](https://developer.apple.com/help/app-store-connect-analytics/acquisition/product-page-optimization), [test overview](https://developer.apple.com/help/app-store-connect/create-product-page-optimization-tests/overview-of-product-page-optimization), and [run-a-test instructions](https://developer.apple.com/help/app-store-connect/create-product-page-optimization-tests/run-a-test/).

These are platform mechanics, not a promise that Only Signature will reach significance.

## Measurement contract

- Primary metric: Apple-reported conversion rate from product-page views to first-time downloads for the treatment versus the original product page.
- Supporting observations: impressions, product-page views, first-time downloads, Apple’s displayed confidence, and whether the treatment is marked Performing Better, Performing Worse, or Likely to be Inconclusive.
- Guardrails: ratings/review themes, refund/support complaints, and metadata accuracy after release. These are monitored separately and are not merged into a homemade conversion score.
- Attribution boundary: no analytics SDK, tracking pixel, device identifier, or signature-content telemetry is added.
- Interpretation boundary: no download, conversion, or lift number is entered until App Store Connect reports it.

## Control

Use the final production screenshot set validated against the submitted binary. Keep app name, subtitle, icon, price, description, and binary stable while a screenshot-only test is active.

Proposed first three control frames:

1. Your Signature and Initials
2. Remove the White Box
3. No Editing or Cropping

## Hypothesis 1 — Transparency problem first

- Hypothesis: leading with the visible white-rectangle problem will help high-intent visitors understand the unique outcome faster than a generic signature-maker opening.
- Changed asset: screenshots only; reorder and reframe the first three. Keep all later screenshots identical to control.
- Treatment first three:
  1. Remove the White Box
  2. Export with a Transparent Background
  3. Same Signature. Clean Result.
- Required visual proof: frame 1 uses the same implemented fictional agreement, same signature, scale, date, and placement on both sides. The white rectangle realistically obstructs the Signature label, line, and nearby date content; the transparent side preserves them. No checkerboard.
- Success metric: Apple-reported treatment conversion rate and confidence versus control.
- Minimum practical duration: at least 14 consecutive days to cover two weekly cycles, and longer if Apple has not collected enough attributed first-time downloads. Fourteen days is an operational floor, not a significance guarantee.
- Interpretation: adopt only when Apple labels the treatment Performing Better at the displayed confidence threshold and the asset remains truthful. Treat no label or Likely to be Inconclusive as no decision; do not call it a win from a raw point estimate.
- Stop conditions: misleading rendering, mismatch with shipped UI, a material export defect, Apple marks Performing Worse with persuasive confidence, a product update changes the funnel, or 90 days elapse.

## Hypothesis 2 — Simplicity and no subscription first

- Hypothesis: visitors frustrated by recurring-price document suites will respond better when the narrow job and non-subscription model appear before technical output detail.
- Changed asset: screenshots only; first three change, later frames remain identical.
- Treatment first three:
  1. Signature + Initials. Nothing Else.
  2. No Login. No Subscription.
  3. One Purchase for This Set.
- Required accuracy: the paid screenshot must display the StoreKit localized price captured in the fixture storefront, and the copy must not imply a global/lifetime unlock. The working U.S. screenshot may show $1.99 only through the approved deterministic StoreKit fixture.
- Success metric: Apple-reported treatment conversion rate and confidence versus control.
- Minimum practical duration: at least 14 consecutive days and sufficient Apple-attributed first-time downloads; extend when evidence is inconclusive.
- Interpretation: adopt only on Apple’s better-performing classification plus a copy review confirming the per-set boundary remains unmistakable. If conversion rises but support/review evidence shows purchase-scope confusion, reject and revise.
- Stop conditions: pricing or purchase-scope mismatch, a misleading “free” impression, material complaints about repeated charges, a binary/price change during the test, persuasive worse classification, or 90 days.

## Hypothesis 3 — Privacy and no document upload first

- Hypothesis: visitors who do not want to expose a contract or signature will respond to a concrete no-document-upload promise when it is explained without an absolute “never leaves your device” claim.
- Changed asset: screenshots only; first three change, later frames remain identical.
- Treatment first three:
  1. No Document Upload
  2. Created on Your Device
  3. We Do Not Upload Your Signature
- Required accuracy: final production network and SDK audit must confirm no developer-controlled signature transmission. Later user-selected sharing, Apple purchase processing, support messages, and website-host logs remain accurately disclosed in policy.
- Success metric: Apple-reported treatment conversion rate and confidence versus control.
- Minimum practical duration: at least 14 consecutive days and sufficient Apple-attributed first-time downloads; continue within Apple’s 90-day limit if inconclusive.
- Interpretation: adopt only with Apple’s better-performing classification and a fresh privacy-claim drift check. Do not infer that a better result proves a broad privacy preference.
- Stop conditions: any SDK/network behavior invalidates the claim, privacy policy or App Privacy answers drift, the screenshot could imply files cannot be shared, persuasive worse classification, or 90 days.

## Sequencing

1. Launch with the evidence-backed control.
2. Run one hypothesis at a time when traffic is limited; this isolates the message and preserves more traffic per variant.
3. If traffic is demonstrably sufficient, Apple permits up to three treatments, but do not start all three merely to finish faster.
4. Do not run PPO across a material app update, price change, major campaign change, or seasonal event unless the confound is recorded.
5. Save App Store Connect’s result export or screenshots, exact start/end timestamps, storefront, allocation, assets, and decision in the experiment log.

## Asset integrity gate

Before any treatment starts:

- capture from the submitted build or deterministic fixture mode tied to that build;
- remove screenshot alpha and confirm current device dimensions;
- inspect at App Store search-result size and with large display scaling;
- confirm every visible action exists and every claim matches code, privacy policy, IAP scope, and metadata;
- exclude ratings, awards, “#1,” fabricated testimonials, and unsupported comparative claims;
- archive the flattened files and editable sources by version.

## Inconclusive result rule

If the test reaches 90 days without a decisive Apple classification, record it as inconclusive. Do not select a winner from noise. Consider a larger truthful creative difference, a later period with more organic/authorized paid traffic, or no further test.

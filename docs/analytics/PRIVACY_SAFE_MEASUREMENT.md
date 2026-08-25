# Privacy-Safe Measurement

No analytics SDK or transmitted behavioral event stream is authorized.

## Apple-provided measurement

- App Store product-page impressions/views and conversion where Apple reports them
- downloads and active-device/usage metrics subject to Apple consent/privacy thresholds
- IAP units, proceeds, refunds, and territory data
- ratings, rating counts, review text, and release history
- Product Page Optimization results and confidence
- Apple Search Ads query/popularity/performance only after explicit authorization

## Local non-transmitted counters

Only review-prompt eligibility may use a coarse local counter such as successful export count and later reuse. It contains no signature, label, filename, exact document, destination, or transmitted identifier and is removed by Delete All where consistent with review-prompt behavior.

## Launch KPIs

- Product-page conversion and first-time downloads
- IAP units/refunds/proceeds by Apple-reported period/territory
- Rating trend and recurring praise/complaint themes
- Support themes: price scope, deletion, purchase recovery, transparency, format, accessibility
- PPO hypothesis result without invented lift target

## Experiment log

Record hypothesis, changed store asset, start/end dates, territories, exact version/assets, Apple metric, duration, stop condition, outcome, uncertainty, and decision. Do not change app behavior invisibly to create an experiment.

## Limitations

The developer intentionally cannot measure per-screen funnels, individual retention, signature behavior, or user identity. Apple metrics may be delayed, aggregated, thresholded, or opt-in. Public ratings are not downloads. Missing keyword/popularity data remains unknown, never estimated.

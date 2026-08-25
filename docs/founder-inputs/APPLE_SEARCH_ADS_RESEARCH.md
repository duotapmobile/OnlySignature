# Future Apple Ads Keyword Research Procedure

Prepared: 2026-08-25  
Purpose: obtain Apple’s current, storefront-specific keyword evidence without inventing popularity  
Current state: **not run** — an authorized Apple Ads account linked to the final App Store Connect app is an external founder input

Apple renamed the service to Apple Ads. This file keeps the requested historical filename so project references do not drift.

## What Apple currently provides

Apple’s keyword suggestion tools are available inside an authorized Apple Ads search-results campaign workflow. Apple says its Search Popularity indicator is based on how many people search for a keyword in the App Store and is displayed from **1 to 5**, where 5 is most popular. Recommendations can also include estimated installs, spend, average CPA, and recommended bids; Apple explicitly says estimates do not guarantee results. Sources: [Apple Ads keyword best practices](https://ads.apple.com/app-store/best-practices/keywords), [recommendation metrics](https://ads.apple.com/app-store/best-practices/recommendations), [add/manage keywords](https://ads.apple.com/app-store/help/keywords/0014-add-and-manage-keywords), and [manage/download recommendations](https://ads.apple.com/app-store/help/recommendations/0090-manage-recommendations).

No search-popularity score is present in this repository because no authorized account was used.

## Founder prerequisites

Provide or confirm only when ready:

1. final App Store Connect app record, bundle identifier, primary language, and approved working name;
2. Apple Ads account owned by the legal entity that will be billed and linked to App Store Connect;
3. final legal entity, tax, billing, currency, and time-zone choices (Apple says currency/time zone cannot later be changed);
4. an invited **Read & Write** or **Campaign Group Manager** user for UI research, or an appropriate read/write API role if automation is separately authorized;
5. explicit authorization for a paused draft only, and separate explicit authorization before any campaign is allowed to run or spend.

Apple’s role descriptions are in [Invite users to your account](https://ads.apple.com/app-store/help/get-started/0011-invite-users-to-your-account); account setup is in [Set up an account](https://ads.apple.com/app-store/help/get-started/0004-set-up-an-account).

Do not place Apple Account passwords, two-factor codes, payment details, API private keys, or client secrets in the repository.

## No-spend safety rule

Create the research campaign with status **Paused**. Apple warns that a campaign created before a payment method is added may automatically start once payment is later added unless the campaign is paused. Source: [Create campaigns](https://ads.apple.com/app-store/help/campaigns/0005-create-campaigns).

Before exiting the session, independently verify:

- campaign status is Paused;
- every ad group and keyword is Paused where the interface permits;
- no start date or automation can activate it;
- spend is exactly zero;
- the Apple Ads change history shows the expected state.

Do not rely on “draft” language if the interface’s actual state is runnable.

## Exact UI procedure

1. Sign in to the founder-owned Apple Ads Advanced account.
2. Verify the account/legal entity and linked App Store Connect app before doing anything.
3. Record UTC timestamp, account ID (non-secret), campaign-group ID, storefront `United States`, app/version, App Store title/subtitle, and researcher.
4. Create a Search Results campaign for Only Signature using **Manage Bids**, not Maximize Conversions.
5. Set the campaign status to **Paused** before saving. Use the smallest interface-valid budget/bid values only if required; these are configuration fields, not research conclusions.
6. Create a paused generic-research ad group for the U.S. storefront. Turn Search Match off for the controlled seed pass.
7. Open **Add Keywords**. Enter the seed list below in small batches so Apple can return suggestions.
8. For every seed and Apple-suggested keyword, record the visible Search Popularity value (1–5), recommended max CPT, estimated metrics if shown, storefront, and retrieval time. Label every estimate as Apple-provided and non-guaranteed.
9. Add both Exact and Broad only when needed to expose interface recommendations; keep their match type separate in the dataset. Apple says a keyword’s match type cannot be changed after creation, though it can be paused and re-added.
10. Open Keyword Recommendations and download the available CSV. Save the unmodified export outside source control if it contains account/campaign identifiers; add only a sanitized research extract to the repository.
11. Repeat with Search Match enabled in a separate paused discovery ad group only if Apple requires it to produce additional terms. Never mix those discoveries with manually entered terms without a `source` column.
12. Capture screenshots of the popularity legend and rows used for decisions, redacting account, billing, and personal data.
13. Confirm all campaign objects remain Paused and spend remains zero.
14. Compare the sanitized result to `research/aso/KEYWORD_MAP.csv`; update evidence and confidence, not historical raw values.

## Seed list

Use exact spelling and keep out-of-scope terms as controls rather than adopting them automatically:

- signature
- signature maker
- signature generator
- signature creator
- draw signature
- handwritten signature
- signature image
- signature PNG
- transparent signature
- transparent PNG
- remove signature background
- white background signature
- remove white box
- signature initials
- initials maker
- signature export
- signature JPEG
- signature SVG
- no subscription signature
- offline signature
- digital signature *(intent-control; likely mismatched)*
- electronic signature *(intent-control; likely mismatched)*
- sign PDF *(out-of-scope control)*
- sign documents *(out-of-scope control)*
- signature scanner *(out-of-scope control)*

Do not add competitor brand names to App Store metadata. A later paid-ads decision about competitor terms requires separate founder and counsel approval.

## Sanitized output schema

Create `research/aso/apple-ads/YYYY-MM-DD-us-keywords.csv` with:

```text
retrieved_at_utc,storefront,language,app_version,title,subtitle,keyword,match_type,source,search_popularity_1_to_5,recommended_max_cpt_currency,recommended_max_cpt,estimated_installs,estimated_spend,estimated_average_cpa,scope_fit,decision,decision_reason,mutable_before_submission
```

Rules:

- leave unavailable values blank; never use `0` for unknown;
- retain Apple’s displayed currency and units;
- use `source` values `manual-seed`, `apple-suggestion`, `apple-recommendation`, or `search-match-discovery`;
- use `scope_fit` values `direct`, `adjacent`, `out-of-scope`, or `legally-ambiguous`;
- store no Apple Account email, person name, billing information, tokens, private keys, or full account identifiers;
- record screenshots/export hashes in a companion markdown evidence log.

## Interpretation rules

1. Popularity measures search activity, not relevance, conversion, profitability, or organic ranking.
2. A high-popularity out-of-scope term such as `sign PDF` must not distort the product or metadata.
3. Prefer high-relevance terms even when their popularity is lower; the product does not sign documents or create certified/cryptographic signatures.
4. Treat suggested bids and estimated installs/spend/CPA as advertising estimates, not market size or revenue forecasts.
5. Recheck within seven days of final metadata lock because Apple recommendations update and competition changes.
6. Keep title/subtitle/keyword-field duplication rules separate from paid keyword targeting.

## Optional API route

Use the Apple Ads Campaign Management API only after the founder explicitly authorizes API access and creates an appropriately scoped API user. Generate keys in the secret manager/EAS or local secure credential store, never in Git. First reproduce a read-only account/campaign listing; then document any endpoint used for recommendations against Apple’s current API documentation. Do not rely on the older publicly indexed API 3.0 PDF without confirming the current version in the authenticated portal.

## Completion evidence

This founder input is complete only when the repository contains:

- sanitized keyword CSV and evidence log;
- retrieval timestamp and storefront;
- popularity legend proof;
- paused-state and zero-spend proof;
- exact title/subtitle used at retrieval;
- reconciliation notes for every changed keyword decision;
- confirmation that no credential or personal/billing data entered source control.

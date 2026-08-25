# Localization Plan

Research date: 2026-08-25  
Status: evidence-bounded recommendation; territory and legal-review decisions remain founder gates

## Decision

Ship version 1 with fully tested **en-US** source localization and pseudo-localization. Do not publish machine-translated product, purchase, privacy, or legal copy. After launch, prioritize **Spanish** as the first researched localization, then evaluate **Portuguese (Brazil), French, German, and Japanese** using Apple-reported storefront demand and a native-language quality review.

This order is a practical hypothesis, not a claim about keyword volume or guaranteed conversion. Public App Store pages do not expose reliable keyword volume, and Apple Ads popularity data requires an authorized account.

## Evidence

- Apple says localized metadata is shown according to the customer’s language/storefront fallback and that users can search using localized keywords. App metadata localization is separate from localizing the app binary. See [Localize app information](https://developer.apple.com/help/app-store-connect/manage-app-information/localize-app-information).
- Apple requires appropriate roles to manage localization and controls when languages are editable. A later primary-language change requires prior approved localization and screenshots. See the same [App Store Connect procedure](https://developer.apple.com/help/app-store-connect/manage-app-information/localize-app-information).
- In the current competitor shelf, multilingual distribution is already common. For example, [Signature Maker: Scan&Sign PDF](https://apps.apple.com/us/app/signature-maker-scan-sign-pdf/id6754448228) lists English plus multiple European and Asian languages. This shows competitors localize, but does not prove which locale will convert for Only Signature.
- The value proposition contains terms that require careful translation: “transparent” must mean an image alpha background, “signature set” must communicate the per-set purchase, and “digital signature” must not imply cryptographic or certified signing.

## Launch localization: en-US

Required before release:

- all mobile strings loaded from the centralized content package;
- website and App Store metadata sourced from localization-ready content;
- privacy policy, Terms, FAQ, support, App Review notes, IAP name/description, accessibility copy, and screenshots reviewed for agreement;
- en-XA-style pseudo-localization with at least 35% expansion, accented characters, long price strings, and right-edge stress;
- no hardcoded consumer copy in components;
- no hardcoded currency or decimal format in production UI;
- deterministic screenshot fixture supports localized copy and localized StoreKit price fixtures.

## Candidate expansion order

| Priority | Locale | Why it merits validation | Gate before shipping |
|---|---|---|---|
| 1 | Spanish (start with es-US or the precise App Store Connect locale supported for the chosen storefronts) | High practical relevance to U.S. users and a broad set of potential founder-selected territories; simple utility vocabulary can localize well if legal/purchase terms are reviewed | Native translator; locale-specific App Store keyword research; product and legal review; localized screenshots; VoiceOver pronunciation test |
| 2 | Portuguese (Brazil) | Large distinct Portuguese storefront and common mobile-utility category; competitor localization indicates category participation | Confirm Brazil is an approved territory; native translation; price/consumer disclosure review; Apple Ads/storefront evidence |
| 3 | French | Apple metadata supports language-based discovery across relevant storefronts; competitor set includes French | Native translation; Canada/EU territory decision; privacy/consumer-language review where applicable |
| 4 | German | Competitors localize into German and utility intent is plausible | Native translation; German compound-term/keyword research; EU trader and consumer disclosure completion |
| 5 | Japanese | Several competitors list Japanese and the App Store is a distinct high-quality localization environment | Professional translator; screenshot layout rewrite rather than literal compression; Japanese support readiness |

Do not infer that this table ranks market size. Reorder it using actual App Store Connect acquisition data, ratings/reviews language, support demand, and authorized Apple Ads popularity after launch.

## Locale research procedure

For each candidate locale:

1. Confirm the founder has authorized distribution in the relevant country or region and completed tax, banking, trader, and legal requirements.
2. Search the live local App Store storefront for the localized equivalents of signature image, transparent PNG, initials, draw signature, remove background, and sign document.
3. Separate asset-creation intent from e-signature/document-signing intent.
4. Record the first 20 directly relevant results, title/subtitle terms, rating-count demand proxies, subscriptions, first-three screenshot messages, and privacy labels.
5. Use Apple Ads popularity only through the credentialed procedure in `docs/founder-inputs/APPLE_SEARCH_ADS_RESEARCH.md`; never manufacture a score.
6. Have a native reviewer write metadata from intent, not translate the English keyword field word-for-word.
7. Test title (30 characters), subtitle (30), keyword field (100 bytes), screenshots, and IAP metadata in the actual App Store Connect locale.
8. Back-translate purchase and privacy copy. Reject anything that becomes “lifetime app access,” “all formats are transparent,” “certified digital signature,” or “never leaves your device.”

## Product-string risks

| English concept | Translation requirement |
|---|---|
| Transparent background | Must mean image transparency/alpha, not vague honesty or document visibility |
| White background | Must remain the honest PNG/JPEG free-output description |
| Signature Set | Must communicate one signature slot plus one initials slot bound to one purchase |
| No subscription | Must not be translated as free or lifetime access |
| Re-export this set anytime | Must preserve “this set” limitation |
| Initials included | Must communicate that an unused included slot may be filled later without another purchase |
| Created on your device | Must not become the absolute “never leaves your device” |
| Place on any document | Must not imply recipient acceptance or legal enforceability |

## Screenshot localization

- Keep safe areas wide enough for 35–50% text expansion.
- Store headlines as localized data, not text baked into source screenshots.
- Capture the app in the target language; do not place translated frames over an English UI.
- Preserve the identical agreement fixture in both sides of the white-versus-transparent comparison.
- Use a locale-appropriate fictional date and name that cannot be mistaken for a real document.
- Review at actual App Store search-result size and with grayscale/contrast checks.

## Legal and support gate

Product metadata and UI may be professionally localized before legal policies, but do not publish a translated privacy policy or Terms without qualified review for that language and territory. The support channel must be able to respond truthfully; if support is English-only, disclose that on the localized support page rather than implying local-language service.

## Measurement without tracking

Use App Store Connect’s storefront and product-page metrics, localized ratings/reviews, support-message language, and authorized Apple Ads data. Do not add an analytics SDK. A locale remains in pilot until copy quality, support readiness, and regional disclosures are complete; low volume is not evidence that the translation itself failed.

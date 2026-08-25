# App Privacy Answers

**Status:** Conditional draft only; not authorized for publication  
**Authority date:** 2026-08-25

## Draft answer

The intended production-binary answer is **Data Not Collected**, conditional on the exact archived app satisfying all checks below. Apple’s label concerns data transmitted off device and accessible to the developer or partners beyond the real-time service request. Local processing alone does not establish collection.

## Required answer matrix

| Question                    | Conditional draft                  | Basis and release condition                                                                                                                         |
| --------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Data used to track users    | No                                 | No ATT, tracking domains, advertising, fingerprinting, or cross-company tracking                                                                    |
| Data linked to identity     | No                                 | No account, user ID, identity verification, contact intake, or signature transmission in app runtime                                                |
| Data not linked to identity | No developer collection            | No analytics, remote diagnostics, interaction upload, device identifiers, or developer API                                                          |
| Purchases                   | Apple processes purchase           | Reassess any purchase/report data exposed to developer under Apple definitions; app sends product ID and optional random UUID only through StoreKit |
| User content                | Processed on device, not collected | Signature/initials and exports never automatically leave app; selected share destinations are user-controlled                                       |
| Diagnostics                 | Not collected by developer         | Local coarse diagnostics only; TestFlight/Apple beta processing disclosed separately                                                                |

## Conditions that invalidate the draft

- Any analytics, ads, remote crash/logging, telemetry, remote config, update check, developer API, or partner collection.
- Silent support attachment or automatic diagnostic submission.
- A dependency transmitting device, usage, purchase, signature, or file data to its developer/partner.
- A production WebView, remote asset/font, link-preview request, or undeclared domain.
- App-managed access to information Apple makes available in a way that Apple classifies as developer collection and the answer does not disclose.

## Separate policy contexts

The App Privacy label does not replace disclosure of Apple commerce processing, App Store sales/accounting records, user-selected destinations, support email and volunteered attachments, static-site host logs, EAS build-time source handling, or TestFlight beta diagnostics.

## Publication gate

Before App Store Connect entry: inventory final dependencies; inspect every archive manifest/framework; generate Xcode privacy report; validate required-reason declarations; run clean-install packet/DNS observation; inspect permissions/entitlements; compare policy/support/site behavior; and have Account Holder/Admin/App Manager approve the exact answers. Until then the accurate status is **not verified**.

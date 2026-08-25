# App Store Connect Setup

No portal change is authorized or claimed. Recheck Apple’s live fields/limits within 72 hours of the production build.

## App record

1. Account Holder/Admin/App Manager confirms agreements and creates the record.
2. Set final name, primary language `English (U.S.)`, bundle ID, and SKU from founder-approved configuration.
3. Select Utilities primary and Productivity secondary unless final market evidence changes the recommendation.
4. Enter real HTTPS Privacy, Support, and optional Marketing URLs after anonymous verification.
5. Enter version `1.0`, copyright/operator, description, subtitle, promotional text, keywords, and actual screenshots.

## Compliance and availability

- Answer the current age-rating questionnaire from the exact binary; do not mark Made for Kids.
- Publish only Accessibility Nutrition Labels backed by physical common-task evidence.
- Enter App Privacy from final archive/network evidence, not architecture intent.
- Complete encryption/export questionnaire from final linked libraries and `ITSAppUsesNonExemptEncryption` determination.
- Declare DSA trader/non-trader status; EU remains unavailable until required verification is complete.
- Explicitly select territories; U.S.-only is planning default, not an automatic portal action.
- Configure price/availability and choose manual release for 1.0 unless founder authorizes another mode.

## Consumable IAP

Create the final product ID as a consumable; add localization, planned price schedule, availability, review screenshot, and notes. Complete Paid Applications Agreement, tax, and banking. The first IAP must be selected and submitted with version 1.0. See `docs/storekit/APP_STORE_CONNECT_SETUP.md`.

## Build, TestFlight, and review

1. Upload the exact signed production build with authorized credentials.
2. Confirm processing, SDK/build metadata, export compliance, and no upload warning.
3. Run internal TestFlight; then external beta review only if authorized.
4. Retain build ID, Xcode image/SDK, TestFlight version, device/OS, and actual test evidence.
5. Attach the production build and first IAP, complete review contact/international phone, notes, and any attachments.
6. Run the reviewer path against the exact selected build and sandbox product.
7. Add for Review and Submit for Review only with founder authorization.

## Roles

- Account Holder: legal agreements and ultimate account authority.
- Account Holder/Admin/App Manager: app/IAP submission and App Privacy.
- Developer may upload builds when granted.
- Accessibility/marketing fields follow Apple’s current role table.
- DSA requires Account Holder/Admin.

Use least privilege and two-factor authentication. Never store credentials or API private keys in the repository.

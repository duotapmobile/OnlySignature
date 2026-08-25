# App Store Release Checklist

Legend: **LOCAL** can be completed in the repository; **APPLE** requires signed/macOS/device/portal evidence; **FOUNDER** requires authority or external facts.

## Repository and production configuration

- **LOCAL** Clean lockfile install; typecheck, lint, format, unit/component/service/storage/StoreKit/export/navigation/content/release tests.
- **LOCAL** No Git remote; no secrets; SBOM/license/advisory/native dependency inventory complete.
- **LOCAL** Production validator rejects placeholders, mocks, fixtures, hardcoded price, OTA, telemetry, debug domains, missing identifiers/URLs/territories.
- **LOCAL** Static scans find no global premium, Restore artwork claim, subscription, document upload, JPEG transparency, unsupported legal/privacy copy, or avoidable TODO/pseudocode.

## iOS archive and device

- **APPLE** Exact compliant Xcode/EAS image and SDK recorded; signed archive succeeds.
- **APPLE** Entitlements, Info.plist, permissions, privacy manifests, SDK signatures, required-reason APIs, binary frameworks, update config, and secrets inspected.
- **APPLE** StoreKit Test/XCTest, sandbox, termination/recovery, Delete All, optional-token, protected-data, refund, and repeat-export matrices pass.
- **APPLE** iPhone/iPad accessibility, drawing performance, orientation, file protection/backup/temp/pasteboard/app-switcher/network tests pass.
- **APPLE** Every advertised destination preserves expected file behavior; alpha verified by bytes/re-import.

## Public and legal

- **FOUNDER** Operator/address/contact/domain, legal/trademark review, territory choice, DSA status, export determination, price/model approval complete.
- **FOUNDER** Public deployment authorized.
- **APPLE** Privacy/Terms/Support/FAQ/Contact/Accessibility URLs return anonymous HTTPS 200 and work inside release build.
- **LOCAL** Policy, Terms, FAQ, app, site, metadata, paywall, and review notes pass content drift.

## Store package

- **FOUNDER** App record, bundle/SKU, roles, agreements, tax/banking, consumable ID/price/availability complete.
- **APPLE** App Privacy, age rating, accessibility labels, encryption, DSA, territory and release settings match evidence.
- **APPLE** Actual flattened iPhone/iPad screenshots and IAP screenshot match submitted build/current specs and contain no alpha.
- **APPLE** Reviewer path passes in under three minutes with no account and both free/paid routes.
- **FOUNDER** TestFlight/submission/release authorization and manual/phased/automatic decision recorded.

## Final authority

- **LOCAL/APPLE/FOUNDER** Final four-role repository audit closes every locally fixable issue and records genuine remaining gates.
- Do not mark release ready, signed, sandbox tested, submitted, approved, legally cleared, or deployed until the corresponding evidence exists.

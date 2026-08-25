# Privacy Manifest Audit

**Status:** Design and release-audit procedure; final archive not yet available  
**Target:** `PrivacyInfo.xcprivacy` in the app target plus valid manifests/signatures in embedded SDKs

## Intended declarations

- Tracking: false.
- Tracking domains: none.
- Collected-data entries: none only if final App Privacy evidence supports it.
- Required-reason APIs: declare only categories actually reached by app/native/SDK code and only an Apple-approved reason matching that use.
- ATT and `NSUserTrackingUsageDescription`: absent.

An empty app manifest does not prove privacy. A broad “just in case” required-reason list is prohibited.

## Audit procedure

1. Generate a clean production iOS native project and signed archive.
2. Enumerate the app and every executable, dynamic framework, and bundle.
3. Locate each `PrivacyInfo.xcprivacy`; validate syntax with `plutil -lint`.
4. Compare embedded SDK names/versions with Apple’s current covered-SDK list and verify required signatures/manifests.
5. Generate Xcode’s privacy report and inventory covered API categories, including file timestamps, disk space, UserDefaults, and system boot time where present.
6. Map each observed category to the exact code path and currently approved reason. Remove unused declarations; remove or replace unjustified code.
7. Confirm no tracking domain, ATT path, or data-use declaration conflicts with App Privacy or policy.
8. Validate upload and resolve every App Store warning before release.

## Expected native boundaries to inspect

- React Native/Hermes and Expo runtime
- routing and localization
- Skia/gesture drawing
- StoreKit bridge or owned module
- protected file/backup module
- share/Files modules; direct Photos is absent
- no image pasteboard module; Copy is absent
- haptics, orientation, and app lifecycle cover
- any screenshot/review helper proven absent from production

## Evidence status

| Evidence                           | Status                                                                 |
| ---------------------------------- | ---------------------------------------------------------------------- |
| App-level manifest source          | PRESENT — app config declares four reviewed required-reason categories |
| Generated iOS manifest merge       | Apple-gated                                                            |
| Per-SDK manifests/signatures       | Apple-gated final archive                                              |
| Xcode privacy report               | NOT RUN — APPLE ENVIRONMENT REQUIRED                                   |
| App Store upload diagnostics       | NOT RUN — APP STORE CONNECT REQUIRED                                   |
| Final answer/policy reconciliation | Release-blocking                                                       |

## Current source observation

At the 2026-08-25 implementation snapshot, `apps/mobile/app.config.ts` declares tracking false, no collected-data entries, and reviewed reasons for UserDefaults (`CA92.1`), file timestamps (`C617.1`), disk space (`E174.1`), and system boot time (`35F9.1`). The owned module contributes `PrivacyInfo.xcprivacy` with file-timestamp reason `C617.1`; its plugin, podspec, StoreKit bridge, protected-storage bridge, and privacy resource are present and pass the local autolink/source audit. These declarations remain archive-sensitive: clean iOS prebuild, per-bundle manifest enumeration, Xcode privacy report, and upload diagnostics require macOS/Xcode or App Store Connect and remain release gates.

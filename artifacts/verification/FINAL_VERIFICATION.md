# Final Local Verification Evidence

**Date:** 2026-08-25  
**Host:** Windows / PowerShell  
**Checkout:** `C:\Users\mskir\Desktop\Only Signature Build August`

## Passing commands

| Command | Observed result |
| --- | --- |
| `npm run check` | PASS: Prettier, all-workspace TypeScript, lint, 24 root tests, 18 mobile tests, content drift, development release gate, static network policy, native autolink, store assets, and high/critical advisory threshold |
| `npm run build` from workspace root | PASS: Astro static build; 9 pages |
| `npm run validate --workspace @only-signature/site` | PASS: 11 required outputs, 9 HTML files, internal links resolved, zero client JavaScript, no forbidden tracking/font/cookie patterns |
| `npx expo install --check` in `apps/mobile` | PASS: dependencies up to date |
| `npx expo-doctor` in `apps/mobile` | PASS: 21/21 checks |
| `npx expo export --platform ios --output-dir dist-ios-final` | PASS: 23 assets, one Hermes iOS bundle, metadata; this is not a signed native build |
| `npm run screenshots:compose` | PASS: 8 iPhone + 8 iPad flattened masters and one IAP review image |
| `npm run verify:store-assets` | PASS: 16 exact-size opaque screenshots, distinct 03/04 purchase fixtures, opaque 1024×1024 IAP review asset |
| production `expo config --type introspect --json` with complete non-secret fixtures | PASS: real StoreKit, fixture mode off, OTA off, ATS arbitrary/local loads off, production bundle ID |
| `npm run sbom` | PASS: CycloneDX 1.5 SBOM with 1,145 components |
| `git remote -v` | PASS: no output; no remote configured |

## Test counts

- Root Vitest: **7 files, 24 tests passed**.
- Mobile Node test runner: **18 tests passed**.
- Export pixel suite includes transparent alpha/outside-zero-alpha/no-opaque-rectangle/crop/padding/checkerboard checks plus white PNG and JPEG decode/background checks.
- Purchase tests cover frozen pending state, immediate verified binding, cancellation, one included slot, wrong product, duplicate transaction, mismatched token, finish-pending interlock, unverified rejection, and included-slot finalization.
- Storage tests cover versioned checksum round trip, corruption rejection, and development-only legacy acceptance; native source adds a protected previous generation.

## Advisory result

`npm audit --audit-level=high` exits successfully with **0 high and 0 critical** advisories. npm reports **12 moderate** advisories in Expo build tooling through `xcode -> uuid`; the offered force repair is a breaking/incompatible downgrade, so it was not applied.

## Expected/diagnostic failures

- A first final `npm run check` after Expo generated `expo-env.d.ts` exposed incompatibility with the experimental React Native strict-API custom condition plus one real `Body` text-style type. The experimental condition was removed without weakening TypeScript `strict`, the component type was corrected, and the complete gate then passed.
- `npm run build` and `npm run sbom` were once invoked from `apps/mobile`, which has no such workspace-local scripts. Both were rerun successfully from the workspace root.
- iOS prebuild/native signing cannot be executed locally on Windows. No signed build, StoreKit sandbox purchase, TestFlight upload, native simulator capture, physical-device accessibility test, or App Store submission is claimed.


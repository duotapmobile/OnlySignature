# Local Test Results

**Date:** 2026-08-25  
**Host:** Windows, Node 22.22.0, npm 10.9.4

| Command | Result |
| --- | --- |
| `npm run typecheck` | PASS: all 6 workspaces; Astro 0 errors/warnings/hints |
| `npm run lint` | PASS: all lint-enabled workspaces |
| `npm test` | PASS: 24/24 tests; 7/7 files |
| `npm run test --workspace @only-signature/mobile` | PASS: 18/18 tests |
| `npx expo install --check` | PASS: dependencies current for Expo SDK 57 |
| `npx expo-doctor` | PASS: 21/21 checks |
| `npx expo export --platform ios --output-dir dist-ios-final` | PASS: 23 assets, one Hermes iOS bundle, and metadata; not a signed build |
| `npx expo prebuild --platform ios --clean --no-install` | EXTERNAL GATE: Expo refused iOS generation on Windows and requested macOS/Linux |
| `npm run build --workspace @only-signature/site` | PASS: 9 static pages |
| `npm run validate --workspace @only-signature/site` | PASS: 11 outputs, links resolved, zero client JS/tracking patterns |
| `node scripts/check-content-drift.mjs` | PASS: 116 source/content files |
| `node scripts/check-production-network.mjs` | PASS: static allowlist; packet observation remains device gate |
| secret-pattern scan | PASS: no matches |
| `npm ls --all --json` | PASS: dependency tree valid |
| `npm audit` | REVIEWED: 0 critical/high, 12 moderate build-tool findings; no compatible fix |
| `node scripts/generate-sbom.mjs` | PASS: CycloneDX 1.5, 1,145 components |
| `node scripts/verify-native-autolink.mjs` | PASS: `OnlySignatureNative` pod resolves with both owned Swift modules |
| production Expo introspection | PASS: ATS arbitrary/local loads false, real StoreKit mode, OTA disabled |
| `npm run verify:store-assets` | PASS: 8 iPhone + 8 iPad web-rendered fixture masters, exact dimensions/no alpha, distinct purchase fixtures, and opaque IAP review asset; final iOS capture remains gated |
| `npm run format:check` | PASS |
| `git diff --check` | PASS |

No signed iOS archive, StoreKit sandbox transaction, TestFlight upload, physical-device alpha/destination test, runtime packet capture, or App Store submission is represented as completed.

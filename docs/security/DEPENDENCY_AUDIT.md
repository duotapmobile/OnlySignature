# Dependency and Supply-Chain Audit

**Snapshot date:** 2026-08-25  
**Status:** Direct declarations, lockfile tree, Expo compatibility, npm advisory scan, and CycloneDX SBOM are locally complete. Signed-archive framework/signature/privacy inspection remains a release gate.

## Architecture and admission policy

The mobile runtime uses Expo SDK 57, React Native 0.86, React 19, Expo Router, first-party workspace packages, maintained Expo modules for device/file/share/haptics/review behavior, React Native SVG/View Shot for drawing/export, and two small owned Swift modules for StoreKit 2 and protected storage. The site is static Astro. Root image/test/build tooling does not ship in the app.

Unused direct UI, font, image, glass, keychain, symbol, system-UI, and web-browser packages were removed. Expo Router peers remain pinned even when imported transitively. No RevenueCat, Firebase, analytics, ads, crash upload, PDF toolkit, cloud SDK, account SDK, remote config, or proprietary network client is present.

The full direct SDK inventory, purpose, privacy behavior, permissions, and native impact is in `docs/privacy/SDK_DATA_INVENTORY.csv`. Installed versions and integrity hashes are authoritative in `package-lock.json` and `artifacts/sbom.cdx.json`.

## Observed verification

| Check                      | Result                                                          |
| -------------------------- | --------------------------------------------------------------- |
| `npm ls --all --json`      | Valid dependency tree                                           |
| `npx expo install --check` | All packages current for Expo SDK 57                            |
| `npx expo-doctor`          | 21/21 checks passed                                             |
| `npm audit`                | 0 critical, 0 high, 12 moderate, 0 low                          |
| CycloneDX generation       | Spec 1.5, 1,146 unique package-version components               |
| Static network scan        | Passed; no analytics/backend/telemetry client or undeclared URL |
| Secret-pattern scan        | No matches                                                      |

## Findings and dispositions

| Finding                                                                                                                                                                                                                                   | Severity                    | Disposition                                                                                                                                                                                                          |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| All 12 npm findings trace through Expo build tooling's `xcode` dependency to `uuid <11.1.1` and its buffer-taking v3/v5/v6 advisory. npm's available forced fix downgrades the app to incompatible Expo 46.                               | P2 accepted local exception | Do not force-downgrade. The affected path is build tooling, not the app's signature runtime. Re-run before every build and adopt a compatible Expo fix when released.                                                |
| Exact `eas-cli@23.0.0` is required only for authenticated build/workflow operations. Installing it in the product workspace introduced high-severity advisories in CLI-only parsing/archive dependencies and made the product audit fail. | Closed by isolation         | Invoke the exact CLI version on demand through the release scripts; do not ship or lock it as an app/site dependency, do not use unsafe transitive overrides, and retain EAS command/build logs as release evidence. |
| A Windows-authored npm lockfile omitted Astro's transitive Apple Silicon compiler-binding package, so EAS npm ci could not run site typechecking.                                                                                         | Closed                      | Declare exact `@astrojs/compiler-binding-darwin-arm64@0.4.0` as an optional site dependency. Windows skips the binary; macOS npm ci installs the locked matching package.                                            |
| Owned Swift modules cannot compile on Windows; Expo CLI also refuses iOS prebuild on Windows.                                                                                                                                             | P1 external                 | Run the pinned EAS/macOS build, retain logs, inspect the generated native project/archive, and block TestFlight on compiler or manifest errors.                                                                      |
| Generic image clipboard and unverified direct Photos APIs cannot meet the locked privacy/alpha proof today.                                                                                                                               | Closed locally              | Copy and direct Photos are not shipped. The visible destination is the system Share sheet, including Save to Files and AirDrop.                                                                                      |
| Node pixel tests prove the pure raster contract but cannot certify React Native View Shot, Files, AirDrop, or receiving-app behavior.                                                                                                     | P1 external                 | Decode and re-import every advertised format/destination from a signed-device build before release.                                                                                                                  |
| Covered-SDK signatures, embedded manifests, entitlements, frameworks, and final archive domains are not available until a signed archive exists.                                                                                          | P1 external                 | Generate Xcode privacy report and archive inventories; reconcile them with the SDK inventory and App Privacy answers.                                                                                                |

## Package change control

For every dependency change: document purpose, exact version, license, maintenance evidence, native code, network/data behavior, permissions, privacy manifest, required-reason APIs, and removal rationale; run lockfile install, Expo Doctor, typecheck, lint, tests, audit, SBOM diff, static domain scan, and a new signed archive review. High/critical unexplained advisories, incompatible licenses, undeclared telemetry/domains, missing required manifests/signatures, or test/build packages in the production runtime block release.

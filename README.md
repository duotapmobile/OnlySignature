# Only Signature

Only Signature is a narrow iOS utility for drawing a handwritten signature and initials, comparing white-background and transparent placement, and exporting reusable image assets. It does not accept documents, sign documents, verify identity, or provide a subscription.

## Product promise

> Create your signature and initials. Export them cleanly. Nothing else.

The free path exports high-quality white-background PNG or JPEG files. One StoreKit consumable purchase unlocks transparent export for one immutable local Signature Set containing one signature slot and one initials slot. An unused included slot can be filled later without another charge. Re-exporting that same saved set never requires another purchase.

## Workspace

- `apps/mobile` — Expo React Native iOS application
- `apps/site` — static public website
- `packages/design-tokens` — shared visual tokens
- `packages/content` — authoritative product, policy, FAQ, and UI copy
- `packages/config` — typed release configuration
- `docs` — architecture, privacy, security, StoreKit, accessibility, UX, store, and release evidence
- `legal` — Privacy Policy and Terms drafts
- `research` — dated Apple, legal, competitor, ASO, and brand research
- `store-assets` — metadata, icons, screenshot sources, and flattened store outputs
- `tests` — cross-package verification
- `scripts` — cross-platform validation and asset tooling

## Toolchain

- Node.js `22.22.0`
- npm `10.9.4`
- Expo SDK 57 / React Native 0.86 / React 19.2.3
- strict TypeScript
- Expo prebuild and EAS Build preparation

Use the exact versions declared by the repository and commit the npm lockfile. Install Expo-native packages with `npx expo install` so they remain compatible with the selected Expo SDK.

## Local commands

```powershell
npm ci
npm run typecheck
npm run lint
npm test
npm run check:content
npm run check:release
npm run verify:exports
npm run verify:network
npm run format:check
npm run sbom
```

Run `npm run check` for the combined local gate. A Windows pass verifies platform-neutral code only. It does not prove an iOS compile, signed archive, StoreKit sandbox purchase, physical-device accessibility, destination alpha preservation, or App Store acceptance.

## Privacy and production boundary

The production app has no account, proprietary backend, analytics, advertising, remote logs, cloud signature storage, or Expo OTA update channel. Signature strokes and reusable sets remain in protected app-local storage. Apple processes purchases; destinations selected by the user may store or transmit exported files under their own terms.

Production configuration fails closed if required founder values remain placeholders, StoreKit is in mock mode, fixture mode is enabled, public URLs are invalid, or network/privacy policy is inconsistent.

## Current authority

Local implementation is authorized by the [Current Final Authority](docs/audits/15-current-final-authority.md). Release is not authorized until [Release Blockers](docs/RELEASE_BLOCKERS.md) and the device/archive/portal gates are closed with evidence.

External inputs are finite and listed in [Founder Inputs Required](docs/FOUNDER_INPUTS_REQUIRED.md). Missing Apple credentials or public-domain values do not block unrelated local work.

## Status language

- **Built:** code or artifact exists locally.
- **Locally verified:** the named command actually ran and its result is recorded.
- **Apple-gated:** requires signed EAS/macOS, StoreKit, physical-device, archive, or App Store Connect evidence.
- **Founder-gated:** requires identity, credential, legal, domain, territory, pricing, or submission authority.

Never convert configuration, mocks, generated native source, or an EAS profile into a claim that a signed iOS build or sandbox purchase succeeded.

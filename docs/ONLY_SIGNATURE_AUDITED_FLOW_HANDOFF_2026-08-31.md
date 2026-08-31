# Only Signature Audited Flow Handoff

## Implemented source

- Branch: `codex/only-signature-audited-flow-v4`
- Audited app-flow commit: `ba52f269ee8d7a6efed481a1af96f203b02b9e0a`
- Product: `@duotap/onlysignature`
- Expo project ID: `954b1a21-89e9-41af-8021-d7c8e66d74c8`

The real Expo app now follows the approved eight-screen flow: Entry, Signature Capture, Initials Capture, Review, Background Choice, DIY Warning, Confirmation, and My Signing Sets. The supplied wordmark and logo assets are used directly. User-reachable export, settings, information, and data-storage surfaces use the same visual system.

## Closed release blockers

- Purchased included slots now finalize once and become immutable.
- Apple transactions that are still finishing cannot announce success or export transparent files.
- Edit and completion navigation no longer leaves duplicate or completed screens on the back stack.
- Export completion records usage on both completion actions.
- Entry waits for persisted state hydration.
- Saved-set actions remain individually available to assistive technology.
- Dynamic Type and scroll behavior no longer depend on clipped fixed-height preview cards.
- Real iOS status information is retained; simulated phone chrome is absent.

## Local acceptance

Complete local acceptance passed on 2026-08-31:

- 43 repository tests
- 74 mobile tests
- 6 export tests
- TypeScript and lint across all workspaces
- Content, release configuration, network, production introspection, native autolink, store-asset composition, and source-secret gates
- 9-page / 11-output site release check
- Zero high or critical dependency advisories

The 12 known moderate Expo build-chain advisories remain. The available automated fix requires a breaking change and was not forced.

## Capture and Expo status

- A separate local package contains 8 phone and 8 tablet captures rendered from the actual Expo app. It is local preview evidence, not native iOS or App Store evidence.
- The new EAS workflow `apps/mobile/.eas/workflows/native-ios-actual-flow.yml` passed pinned `eas-cli@23.0.0` validation. It captures the same eight real screens on iPhone and iPad without composing advertising artwork.
- Expo account readback is `duotap` / `admin@duotap.app` and the linked project matches the ID above.
- The prior screenshot-only attempt was stopped before simulator allocation by the free-plan 60-minute CI/CD limit. Expo reports reset at 2026-09-01 00:00 UTC, which is 2026-08-31 20:00 EDT.
- No blind retry, paid-plan action, production build, TestFlight upload, App Review submission, or public release was dispatched.

## Protected local state

The untracked root `app.json` was not staged or edited. Its SHA-256 remains `B52872D61EA66294E0BD5D8432231876B76D9008C1CA75D42BEC89EBCBF2B0C7`.

## Remaining external gates

1. Run the validated native actual-flow screenshot workflow once after the Expo reset.
2. Inspect the resulting real iPhone and iPad frames and native export evidence.
3. Keep the production/TestFlight workflow separate until native evidence passes.
4. Complete physical-device purchase, VoiceOver, rotation, and export checks before declaring TestFlight or production readiness.

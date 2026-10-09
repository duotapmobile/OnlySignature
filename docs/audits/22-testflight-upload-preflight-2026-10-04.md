# TestFlight upload preflight — 2026-10-04

## Result

Blocked before cloud dispatch by the configured dependency-security acceptance gate. No signed build, upload, submission, or tester-group change was started in this pass.

The founder authorized a TestFlight upload. That authorization has not been treated as a waiver of the existing security gate or permission for a breaking framework downgrade.

## Current source and destination

- Checkout: `codex/full-paper-redesign`.
- HEAD: `8c0dc06f0c9d7ad32a93fe8b9bdb78f1573c5b07`.
- Origin: `https://github.com/duotapmobile/OnlySignature.git`.
- The latest UI/data changes remain in the dirty working tree; HEAD alone is not the latest implementation. No Git commit or push was made in this pass.
- Pinned EAS CLI 23.0.0 authenticated as `duotap` and read back `@duotap/onlysignature`, project `954b1a21-89e9-41af-8021-d7c8e66d74c8`.
- Configured production bundle: `com.duotap.onlysignature`; App Store Connect app: `6805606307`; Apple team: `JWXC66G9Z5`.
- The production profile selects real StoreKit and disables screenshot fixtures. Apple signing/submission credentials and current cloud quota were not independently verified in this pass.

## Blocking evidence

Fresh `npm audit --json` returned exit 1: 36 affected packages, comprising 24 high, 12 moderate, and zero critical. These are affected-package counts, not 36 distinct underlying advisories.

`apps/mobile/.eas/workflows/internal-testflight.yml` requires `npm run acceptance:local` before the signed production build. That command includes `npm audit --audit-level=high`. The workflow then inspects the exact archive before uploading to the configured internal TestFlight group, with beta review disabled.

The audit's suggested forced fixes include Expo 44.0.6 and React Native 0.72.17, while the app currently specifies Expo ~57.0.24 and React Native 0.86.3. No `npm audit fix --force`, override, lockfile change, dependency installation into the app, or security-check removal was performed. A targeted dependency-remediation assessment or explicit, documented internal-test risk decision is needed before continuing; neither is silently inferred from the upload request.

The complete acceptance suite was not rerun in this pass: its freshly checked mandatory audit component is already failing. Previous browser checks do not establish native rendering, live StoreKit, Apple processing, or TestFlight distribution.

## Next release steps

1. Resolve the dependency-security gate without an unreviewed framework downgrade, then rerun complete acceptance.
2. Reconcile and synchronize the exact release source, preserving unrelated user-owned changes.
3. Verify current signing/submission access and cloud allowance; dispatch one authorized internal-TestFlight workflow from the exact source revision.
4. Report the build, archive inspection, upload, Apple processing, internal-group assignment, and physical-device checks as separate evidence states.

Founder feedback files and review statuses were not modified.

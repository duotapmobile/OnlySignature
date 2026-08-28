# Only Signature TestFlight Launch Ledger

Authorized terminal boundary: complete App Store Connect launch record plus a verified internal TestFlight build. App Review submission and public release are forbidden in this run.

## Immutable starting evidence

| Time (America/New_York) | Action                                      | Result                                                                                                                                      |
| ----------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-08-28 13:38        | Git top-level/status/HEAD/origin comparison | Clean `main`; HEAD `759212dd6561ce19bf682e019004e7c3bb02c1f9`; origin/main `c38ea04bc28a4432594e32587d37c92869bffb18`; 0 behind/1 ahead     |
| 2026-08-28 13:38        | Create isolated branch                      | Switched to `codex/only-signature-testflight-readiness-2026-08-28`; remote main untouched                                                   |
| 2026-08-28 13:41–13:43  | `npm run check` on Node 22.22.0/npm 10.9.4  | Exit 0; 27 root tests and 42 mobile tests passed; 12 moderate Expo build-chain advisories retained; no high/critical failure                |
| 2026-08-28 13:46        | `npm view eas-cli version`                  | Current published version `23.0.0`; exact version pinned for this release path                                                              |
| 2026-08-28 13:47        | Pinned EAS identity inspection              | Initial session was stale and could not see DuoTap; no project was created or linked under the wrong account                                |
| 2026-08-28 14:15        | Full local gate after workflow changes      | Exit 0; 28 root tests and 42 mobile tests; every configured local release gate passed                                                       |
| 2026-08-28 15:02        | Expo identity and project readback          | `duotap` / `admin@duotap.app`; `@duotap/onlysignature`; ID `954b1a21-89e9-41af-8021-d7c8e66d74c8`; no duplicate created                     |
| 2026-08-28 15:18        | Pinned EAS workflow validation              | Both native-screenshot and internal-TestFlight YAML files passed `eas-cli@23.0.0 workflow:validate` after the manual-dispatch schema fix    |
| 2026-08-28 15:46        | Coordination conflict hold                  | Primary executor paused all mutations, created the required durable inbox notice, and resumed only after the matching coordinator clearance |
| 2026-08-28 15:4815:51   | Network-policy correction                   | Exact GitHub privacy-statement URL admitted for the legal disclosure; unrelated GitHub URLs remain blocked by a regression test             |
| 2026-08-28 15:5816:02   | Full local acceptance                       | Exit 0; 34 root tests, 51 mobile tests, 6 export tests, all configured checks, audit threshold, and site release check passed               |
| 2026-08-28 16:03        | SBOM and EAS readback                       | 1,145-component SBOM; both workflows valid; `duotap` project readback matched exact existing project ID                                     |

## External mutations

- Founder created/confirmed Expo organization `duotap` and existing project slug `onlysignature`. The checkout is bound by exact existing project ID. The coordinator changed the existing GitHub connection base directory from `/` to `/apps/mobile` and verified the post-mutation readback; no workflow was dispatched.
- Founder created one App Store Connect team API key and secured its one-time download outside Git with inheritance removed. Only the non-secret key metadata was passed to the executor.
- No Apple signing credential mutation, cloud build, upload, TestFlight group mutation, App Review submission, or public release has occurred.

## Prepared workflow

- Simulator profile: `apps/mobile/eas.json` → `screenshot`, credentials-free, iOS Simulator, Xcode 26.6, fixture mode on, mock StoreKit.
- Native workflow: `apps/mobile/.eas/workflows/native-ios-screenshots.yml`.
- Signed archive workflow: `apps/mobile/.eas/workflows/internal-testflight.yml`; archive inspection must pass before the internal-TestFlight-only upload job, and beta review is explicitly disabled.
- Production profile remains real StoreKit, fixture-off, OTA-off, and fails closed without the EAS project ID/release values.
- App Store Connect numeric Apple ID: `6805606307`; bundle `com.duotap.onlysignature`; team `JWXC66G9Z5`; Apple-valid product `com.duotap.onlysignature.transparent_set_v1`.

## Evidence still required

| Gate                             | Required evidence                                                                                          | Status                      |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------- | --------------------------- |
| Expo project and workflows       | Exact project readback, `/apps/mobile` base directory, and pinned schema validation                        | PASS                        |
| Native screenshots               | EAS build/workflow IDs; 16 native raw/final captures; exact models/runtime/routes/hashes; native IAP image | Not run                     |
| Signing archive                  | Production EAS build ID/log; downloaded archive inspection                                                 | Not run                     |
| Apple upload                     | App Store Connect build ID and processing state                                                            | Not run                     |
| Internal TestFlight              | Group/build visible and assigned; What to Test entered                                                     | Not run                     |
| StoreKit sandbox/physical device | Explicit run evidence only                                                                                 | Withheld until actually run |

Secrets are never recorded in this ledger.

# Only Signature TestFlight Launch Ledger

Authorized terminal boundary: complete App Store Connect launch record plus a verified internal TestFlight build. App Review submission and public release are forbidden in this run.

## Immutable starting evidence

| Time (America/New_York) | Action                                      | Result                                                                                                                                                                                |
| ----------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-08-28 13:38        | Git top-level/status/HEAD/origin comparison | Clean `main`; HEAD `759212dd6561ce19bf682e019004e7c3bb02c1f9`; origin/main `c38ea04bc28a4432594e32587d37c92869bffb18`; 0 behind/1 ahead                                               |
| 2026-08-28 13:38        | Create isolated branch                      | Switched to `codex/only-signature-testflight-readiness-2026-08-28`; remote main untouched                                                                                             |
| 2026-08-28 13:41–13:43  | `npm run check` on Node 22.22.0/npm 10.9.4  | Exit 0; 27 root tests and 42 mobile tests passed; 12 moderate Expo build-chain advisories retained; no high/critical failure                                                          |
| 2026-08-28 13:46        | `npm view eas-cli version`                  | Current published version `23.0.0`; exact version pinned for this release path                                                                                                        |
| 2026-08-28 13:47        | Pinned EAS identity inspection              | Initial session was stale and could not see DuoTap; no project was created or linked under the wrong account                                                                          |
| 2026-08-28 14:15        | Full local gate after workflow changes      | Exit 0; 28 root tests and 42 mobile tests; every configured local release gate passed                                                                                                 |
| 2026-08-28 15:02        | Expo identity and project readback          | `duotap` / `admin@duotap.app`; `@duotap/onlysignature`; ID `954b1a21-89e9-41af-8021-d7c8e66d74c8`; no duplicate created                                                               |
| 2026-08-28 15:18        | Pinned EAS workflow validation              | Both native-screenshot and internal-TestFlight YAML files passed `eas-cli@23.0.0 workflow:validate` after the manual-dispatch schema fix                                              |
| 2026-08-28 15:46        | Coordination conflict hold                  | Primary executor paused all mutations, created the required durable inbox notice, and resumed only after the matching coordinator clearance                                           |
| 2026-08-28 15:4815:51   | Network-policy correction                   | Exact GitHub privacy-statement URL admitted for the legal disclosure; unrelated GitHub URLs remain blocked by a regression test                                                       |
| 2026-08-28 15:5816:02   | Full local acceptance                       | Exit 0; 34 root tests, 51 mobile tests, 6 export tests, all configured checks, audit threshold, and site release check passed                                                         |
| 2026-08-28 16:03        | SBOM and EAS readback                       | 1,145-component SBOM; both workflows valid; `duotap` project readback matched exact existing project ID                                                                               |
| 2026-08-28 16:16-16:17  | Native screenshot workflow attempt 1        | Workflow `01a04a04-4d70-716e-a1f1-7d6b3be9fa38`; source job `01a04a04-502f-7475-99be-63bbf30ed883`; build `01a04a04-502f-7ffb-9f5c-746f8eab9e8e`; failed before simulator build       |
| 2026-08-28 16:20-16:26  | macOS portability correction                | Explicit app-config callback type; exact optional Apple Silicon Astro binding locked; full local acceptance passed; SBOM now 1,146 components                                         |
| 2026-08-28 16:30-16:31  | Native screenshot workflow attempt 2        | Workflow `01a04a11-4b4c-7c03-9bcb-605d3de35e51`; source job `01a04a11-4e1f-7645-84a2-3a87a7f65e0e`; environment `01a04a11-4e1f-748f-bba9-aa7aabb215a0`; failed before simulator build |
| 2026-08-28 16:36-16:41  | Satteri macOS portability correction        | Exact optional `@bruits/satteri-darwin-arm64@0.10.5` binding locked; focused site checks and full local acceptance passed; SBOM now 1,147 components                                  |

## External mutations

- Founder created/confirmed Expo organization `duotap` and existing project slug `onlysignature`. The checkout is bound by exact existing project ID. The coordinator changed the existing GitHub connection base directory from `/` to `/apps/mobile` and verified the post-mutation readback; no workflow was dispatched.
- Founder created one App Store Connect team API key and secured its one-time download outside Git with inheritance removed. Only the non-secret key metadata was passed to the executor.
- No Apple signing credential mutation, production archive build, upload, TestFlight group mutation, App Review submission, or public release has occurred.
- Native screenshot workflow attempt 1 was dispatched from exact commit `07e94d825280f53006bcdc44769a86a4a41eb5a8`. Its source-acceptance job failed; simulator build and capture jobs were skipped, so no screenshot artifact was produced.
- Native screenshot workflow attempt 2 was dispatched from exact commit `1ba067bdbd4c3f3d0cc10ddf32eb2cbb2e4459c7`. Its source-acceptance job passed types, lint, tests, audit, and export verification before Astro's production build exposed a second Windows-lockfile omission: `@bruits/satteri-darwin-arm64`. The simulator build and capture jobs were skipped, so no screenshot artifact was produced.

## Prepared workflow

- Simulator profile: `apps/mobile/eas.json` → `screenshot`, credentials-free, iOS Simulator, Xcode 26.6, fixture mode on, mock StoreKit.
- Native workflow: `apps/mobile/.eas/workflows/native-ios-screenshots.yml`.
- Signed archive workflow: `apps/mobile/.eas/workflows/internal-testflight.yml`; archive inspection must pass before the internal-TestFlight-only upload job, and beta review is explicitly disabled.
- Production profile remains real StoreKit, fixture-off, OTA-off, and fails closed without the EAS project ID/release values.
- App Store Connect numeric Apple ID: `6805606307`; bundle `com.duotap.onlysignature`; team `JWXC66G9Z5`; Apple-valid product `com.duotap.onlysignature.transparent_set_v1`.

## Evidence still required

| Gate                             | Required evidence                                                                                          | Status                                                    |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Expo project and workflows       | Exact project readback, `/apps/mobile` base directory, and pinned schema validation                        | PASS                                                      |
| Native screenshots               | EAS build/workflow IDs; 16 native raw/final captures; exact models/runtime/routes/hashes; native IAP image | Attempts 1-2 failed before build; corrected rerun pending |
| Signing archive                  | Production EAS build ID/log; downloaded archive inspection                                                 | Not run                                                   |
| Apple upload                     | App Store Connect build ID and processing state                                                            | Not run                                                   |
| Internal TestFlight              | Group/build visible and assigned; What to Test entered                                                     | Not run                                                   |
| StoreKit sandbox/physical device | Explicit run evidence only                                                                                 | Withheld until actually run                               |

Secrets are never recorded in this ledger.

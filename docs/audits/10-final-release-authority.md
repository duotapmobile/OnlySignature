# Final Four-Role Repository Authority

**Audit date:** 2026-08-25  
**Repository:** `C:\Users\mskir\Desktop\Only Signature Build August`  
**Scope:** Actual final local source, generated static site, research/legal/store package, and Windows verification evidence  
**Decision:** **LOCAL BUILD AUTHORIZED; PUBLIC RELEASE NO-GO UNTIL THE FINITE EXTERNAL GATES PASS**

This is the required second four-role review against the implemented repository. Reports 07–09 preserve the independent adversarial findings as they existed before remediation. This authority records their final dispositions after source fixes and rerun evidence; it does not rewrite those point-in-time reports.

## Role decisions

### Product, UX, and accessibility

The narrow five-screen job is implemented with signature/initials independence, missing-slot fairness, a functional free path, per-set purchase scope, purchased-set immutability, duplicate-as-new behavior, returning Saved cards, settings/data deletion, state-aware copy, and an authorization acknowledgment. The preview now compares the same fictional document, drawing, scale, date, and placement side by side; only the white rectangle differs and it partially obstructs the field label, line, and date area. Share-sheet closure is not called a successful save until the user confirms `I Saved It`.

**Local disposition:** all identified local P0/P1 defects fixed.  
**External gate:** VoiceOver, Voice Control, maximum Dynamic Type, Reduce Motion/Contrast, rotation, iPad keyboard/focus, tremor, and older-adult comprehension must be exercised on signed iPhone/iPad builds before Accessibility Nutrition Label claims are submitted.

### Engineering, StoreKit, security, and privacy

The owned Expo module resolves as an Apple pod and contains StoreKit 2 and protected-storage bridges. A purchase freezes and hashes one immutable local set, persists a pending UUID, calls StoreKit with an app-account token where supported, validates verified/product/transaction identity, commits and reads back a checksummed binding, marks finish pending, then finishes. Writes and reconciliation are serialized. Cancellation alone unlocks immediately; ambiguous, failed-unverified, mismatched-token, or unmatched verified outcomes remain fail-closed and un-finished. A verified transaction finished before its final local marker is recovered through StoreKit transaction history. New drafts and Delete All are blocked while recovery exists.

Production storage fails closed without the native bridge, uses `NSFileProtectionComplete`, excludes the app-support directory from backup, stages atomic writes, preserves a protected previous generation, validates a versioned SHA-256 envelope, and falls back only to a checksum-valid previous generation. Export files use randomized protected temporary directories and next-launch cleanup. Production OTA is disabled, ATS arbitrary/local loads are false, and the static network allowlist finds no developer backend, analytics, ads, tracking, or remote logging.

**Local disposition:** native-link, purchase-state, corruption-generation, network-policy, mock-exclusion, and configuration source defects fixed or disproven by current code/tests.  
**External gate:** EAS/macOS compilation, StoreKit Test/sandbox, lock/low-disk/termination fault injection, archive privacy inspection, packet observation, and destination re-import are required. A truly unmatched verified consumable intentionally remains unfinished instead of being guessed onto unrelated artwork; sandbox review must prove the expected recovery path before release.

### App Store, legal preparation, website, and ASO

Current Apple research is dated and source-indexed. The static Astro site builds nine pages with Privacy, Terms, Support, FAQ, Accessibility, Contact, download placeholder, 404, robots, sitemap, metadata, and no client JavaScript/tracking pattern. App/site/metadata copy no longer promises direct Photos, image Copy, SVG, PDF, restore, lifetime app access, document signing, identity verification, or universal legal acceptance. Launch formats are transparent PNG, white PNG, and white JPEG. The SDK inventory and privacy-manifest audit match the current source.

Eight iPhone and eight iPad implemented-UI fixture masters are present, opaque, exact-size, and machine-checked; the purchase stories are hash-distinct and an opaque 1024×1024 IAP review asset exists. These remain composition proofs, not native capture evidence.

**Local disposition:** website/FAQ drift, disabled-format claims, stale inventory/manifest notes, screenshot framing/duplication, and missing IAP review asset fixed.  
**External gate:** final operator/address/support/domain values, legal review, name clearance, territory/DSA decisions, live URLs, exact binary App Privacy/age/accessibility answers, native screenshots, IAP/App Store Connect records, and submission authorization.

### Tenth man

The adversarial review remains controlling on product necessity, pricing fairness, deletion limits, misuse, Windows limits, export truth, no-backend limitations, name risk, and free competitors. The implementation answers those objections by keeping the free output useful, charging once per local set rather than per export, including both slots, displaying deletion risk before payment, prohibiting unauthorized use without claiming verification, avoiding document upload, removing unsupported destinations/formats, and withholding release claims that require Apple hardware or portals.

**Disposition:** no locally fixable P0/P1 remains open. The tenth man concurs with local build authority only because the release gate remains fail-closed.

## Final closure matrix

| Concern                         | Final disposition                                       | Verification                                                                              |
| ------------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Global premium or repeat charge | Fixed                                                   | Per-set state tests; no global premium flag; same-set Export route                        |
| Lost/duplicate purchase         | Fixed in local source; Apple proof gated                | 18 mobile tests, durable read-back, finish-pending history recovery, single-flight/queues |
| Corrupt/truncated state         | Fixed in local source; device proof gated               | SHA-256 envelope tests and protected previous generation                                  |
| Delete during recovery          | Fixed                                                   | Global recovery interlock and serialized clear                                            |
| Unsupported Copy/Photos/SVG     | Fixed                                                   | Runtime and consumer-copy scan; only Share/Files/AirDrop wording and PNG/JPEG formats     |
| Misleading white comparison     | Fixed                                                   | Actual-size visual inspection of the same fixture and partial obstruction                 |
| Screenshot duplication/framing  | Fixed locally                                           | 16 exact-size opaque assets; distinct purchase raw hashes; IAP asset check                |
| Privacy/network overclaim       | Fixed locally; packet proof gated                       | static allowlist, OTA off, ATS off, policy distinction for user-selected destinations     |
| App-review/legal claim risk     | Fixed locally; counsel/portal gated                     | narrow metadata, legal-claim research, Terms, Privacy, review notes                       |
| Trademark/name clearance        | Founder/legal gate                                      | centralized strings; preliminary risk report and alternatives                             |
| Windows completeness            | Disproven for source/package, confirmed for Apple proof | JS iOS export and all Windows gates pass; signed archive/device evidence not claimed      |

## Authority

The four roles authorize the repository as a complete locally achievable build and launch-preparation package. They do **not** authorize App Store submission, public deployment, production purchase activation, Accessibility Nutrition Label claims, legal certification, or trademark clearance until every item in `docs/RELEASE_BLOCKERS.md` is evidenced.

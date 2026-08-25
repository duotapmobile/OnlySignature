# Local Storage Security

## Stored material

Canonical signature/initial strokes, rendering version, bounds/preview metadata, set/slot state, unclaimed slot, local label, transaction association, export preferences, and local review-prompt counters are app-local. No account or developer cloud exists.

## Layout and controls

- App-only `Library/Application Support/OnlySignature`.
- `NSFileProtectionComplete` on reusable assets, derived sensitive files, and purchase journals.
- Backup exclusion on the reusable-signature directory.
- Same-directory randomized temporary write, synchronize, checksum, atomic replacement, and read-back.
- At least one checksum-valid prior generation for corruption/fault recovery.
- Random opaque set IDs and temp names; no local label in a filename.
- No sensitive data in AsyncStorage, UserDefaults, SecureStore, app groups, Spotlight, logs, or unprotected caches.

## Protected-data and purchase behavior

If protected data is unavailable, StoreKit delivery is queued/deferred and remains unfinished. The UI blocks repurchase and Delete All, registers for availability, then reconciles idempotently after unlock. Process death relies on StoreKit unfinished redelivery; an in-memory queue is not durable evidence.

## Temporary files

Exports are created only when requested, in a protected randomized app-owned temp subdirectory. A cleanup journal supports deletion after safe handoff and at next launch after success, cancellation, crash, or reboot. Failed cleanup produces a coarse local diagnostic and retries without exposing paths/labels.

## Deletion

- Delete Local Set removes that set’s local canonical/derived files and preferences after named confirmation.
- Delete All explains that exported files are not deleted and consumed purchases cannot reconstruct artwork.
- Delete All is deferred while active/pending/unfinished/recovery/protected-unavailable transaction state requires recovery material.
- Do not claim secure erasure from flash storage.

## Verification

Local domain/storage fault tests are necessary but insufficient. Native XCTest and physical-device evidence must prove file attributes, lock behavior, backup exclusion, atomic old-or-new recovery, low disk, corruption, cleanup, and deletion.

## Current implementation observation

At the 2026-08-25 final source snapshot, production fails closed without the owned native module. The module uses app-only Application Support, `NSFileProtectionComplete`, backup exclusion, same-directory staging, and a protected prior generation. The JavaScript layer uses a versioned SHA-256 envelope, validates reads, falls back only to a checksum-valid previous generation, and keeps development-only Expo filesystem behavior out of production. Purchase writes are serialized and read back before StoreKit finish; a finish-pending binding is reconciled from verified StoreKit history if finishing succeeded before the final local write. Native fault injection, filesystem synchronization behavior, file attributes, low-disk handling, and lock/backup behavior remain physical-device/macOS release gates.

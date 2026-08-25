# ADR-003 — Local Storage

**Status:** Accepted  
**Date:** 2026-08-25

## Decision

Store canonical strokes, set state, unclaimed-slot state, purchase journal, local labels, and set-bound preferences in app-only `Library/Application Support/OnlySignature` using `NSFileProtectionComplete`, backup exclusion, same-directory atomic replacement, recovery generations, checksum validation, and read-back before reporting durability.

Derived thumbnails/previews are protected and reproducible. Randomized protected temporary exports live only as long as needed, are tracked by a cleanup journal, and are cleaned after safe handoff and at launch.

## Exclusions

Do not store sensitive set data in AsyncStorage, UserDefaults, SecureStore, shared app groups, Spotlight, logs, public caches, or filename labels. SecureStore may be used only for small nonsensitive secrets if later justified; it is not the set database.

## Recovery rules

- Corrupt current generation falls back to a checksum-valid prior generation.
- Low disk never replaces valid data with partial data.
- Protected-data-unavailable purchase delivery remains unfinished, blocks repurchase/deletion, and retries idempotently after unlock.
- Delete one set and Delete All never imply exported files are deleted.
- Delete All is deferred while purchase recovery material is technically required.

## Consequences

App deletion may remove reusable sets. Backup exclusion intentionally limits cloud reconstruction. Physical-device lock, backup, corruption, cleanup, low-disk, and deletion tests are release gates.

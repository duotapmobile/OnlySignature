# Current Code Defect Audit

Date: 2026-08-25

Scope: clean `main` baseline at `93dca1d`, before the corrective worktree diff.

## Verdict

No P0 defect was found. The independent engineering audit found four P1 areas:

1. A crash after StoreKit finishes a consumable but before the local finish flag is cleared can leave a purchased set recovery-locked. `Transaction.all` is not valid proof because finished consumables are excluded by default. Enabling finished-consumable history was rejected because Apple warns that it needs durable server reconciliation, while Only Signature intentionally has no backend.
2. A thrown purchase request can leave the frozen pending purchase ID locked indefinitely when no transaction exists.
3. Changing canvas layout dimensions changes the normalization and hash of existing strokes.
4. Existing tests primarily exercise a parallel core library rather than the shipped Provider, native StoreKit/storage bridges, ViewShot export, and navigation lifecycle.

P2 findings covered session-long temporary exports, checksum-only state validation, navigation after blocked actions, production release validation placement, and 12 moderate build-chain advisories.

## Baseline verification

- Repository check: passed.
- Root tests: 24 passed.
- Mobile tests: 18 passed.
- Expo Doctor: 21/21 checks passed.
- Native autolinking: passed.
- No Git remote: confirmed.

Signed iOS, StoreKit sandbox, physical-device accessibility, actual iOS export pixels, and runtime network observation remained external gates.

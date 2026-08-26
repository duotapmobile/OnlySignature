# Current Tenth-Man Review

Date: 2026-08-25

The tenth man reviewed the recorded council at `docs/audits/13-current-four-person-council.md`, assumed its consensus was wrong, and inspected the actual corrective worktree.

## Verdict

HOLD. No P0 was proven. The council P1s were confirmed, with these material corrections to the proposed remedy:

1. UUID correlation has a concrete casing defect: Expo Crypto creates lowercase UUID strings while Swift `UUID.uuidString` is uppercase by default. StoreKit tokens must be normalized at the native boundary and at every comparison.
2. Treating every request error as indefinitely ambiguous would permanently lock paid export and retain hidden strokes. Explicit StoreKit cancellation and terminal request failure must be separated from genuinely interrupted bridge/session state.
3. The serialized queue must not be held across the system purchase sheet and must use an internal transaction processor to avoid enqueueing behind itself.
4. Snapshot and finish operations must be bounded. A timeout may retain recovery state, but it must never be treated as transaction absence.
5. Tokenless fallback requires the correct product and exactly one unresolved frozen intent; multiple or conflicting intents fail closed.
6. Delete All must share the purchase-transition queue to avoid a check-then-callback race.
7. An app deleted during an in-flight purchase cannot recover its local artwork in a no-backend design. The app must not finish an unmatched transaction or claim it can restore the artwork; refund/support guidance remains an external behavior to test and document.

The tenth man also confirmed the council findings for false charge copy, paid retry, same-session activation, included-slot gating, letterbox touches, large-text comparison, EAS hook placement, partial export cleanup, and Windows-only evidence limits.

## Required verification

- Uppercase, lowercase, and mixed-case token tests.
- Serialized callback/snapshot/delete barriers without deadlock.
- Cancellation, terminal failure, pending, interruption, restart, and late-callback state tests.
- Letterbox margin and orientation tests.
- Mobile app-root EAS lifecycle negative test.
- EAS/macOS Swift compile, StoreKit Test/sandbox, physical-device accessibility, export alpha, file protection, archive, and runtime network evidence before release.

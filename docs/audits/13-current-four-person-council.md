# Current Four-Person Council

Date: 2026-08-25

Participants:

- Product, UX, and Accessibility
- Engineering, StoreKit, Storage, and Security
- App Store, Privacy, Legal Preparation, and Release Configuration
- Final Authority

Reviewed state: the corrective worktree diff after the two sequential agent reviews. The complete local repository gate passed with 24 root tests and 25 mobile tests.

## Council decision

HOLD before release authority. No P0 was found. The council reached consensus on these locally fixable P1 corrections:

1. An ambiguous purchase journal must block another paid attempt and destructive deletion until it is resolved. Free white-background export may remain available.
2. Copy must not say the customer was not charged while a late verified transaction is still considered possible.
3. A tokenless verified callback must be able to bind the sole unresolved frozen intent; an app-account token improves correlation but cannot be required for correctness.
4. Snapshot processing, observer callbacks, absence decisions, and request-failure reconciliation must share one serialized queue.
5. Same-session purchase presentation must not be abandoned merely because the app becomes active while StoreKit is still returning control.
6. The EAS release hook must live in `apps/mobile/package.json`, the EAS project root.
7. Touches in aspect-fit letterbox margins must not be clamped into remote drawing edges.
8. Included-slot actions must remain unavailable while transaction finishing is unresolved; the UI must not present an editable canvas whose state writes are rejected.
9. The purchase comparison needs an adaptive, semantically described large-text layout.

## P2 consensus

- Clean partial multi-asset exports on failure.
- Extend semantic state invariants.
- Update local-storage and data-flow documentation for unfinished-snapshot recovery and any retained frozen purchase intent.
- Keep Provider/native bridge race tests and physical-device checks explicit release gates when Windows cannot execute them.

## Disagreements resolved

- `finish(false)` is not itself a failure. A successfully completed `Transaction.unfinished` enumeration that does not contain the durably bound transaction is authoritative absence; no `Transaction.all` fallback is needed.
- Local abandoned-intent storage does not change the App Privacy label, but its retention and deletion behavior must be accurately disclosed.
- The per-set repeatable product remains a consumable; no Restore Purchase control is added.

## Decision for adversarial review

The council consensus is now fixed for a tenth-man challenge. No council P1 may be waived merely because the existing automated gates are green.

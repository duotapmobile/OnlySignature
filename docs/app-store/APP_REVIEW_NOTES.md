# App Review Notes

## Draft reviewer note

Only Signature creates a reusable image asset from a signature or initials drawn inside the app. It does not request, upload, edit, store, or sign the reviewer’s documents. It has no account, login, subscription, advertising, analytics, or developer cloud.

The free path exports a full-quality PNG or JPEG with a white background. The in-app purchase is one consumable that finalizes transparent-export rights for the current local Signature Set. One set includes one signature slot and one initials slot. If the reviewer purchases with one slot empty, that companion slot remains included and can be filled later without another purchase. A purchased saved set can be re-exported repeatedly and in any verified format without another charge. Changing finalized strokes creates a separate new draft and preserves the purchased original.

There is no Restore Purchase control because a finished consumable does not reconstruct deleted local signature artwork. Unfinished verified transactions are recovered automatically. Deleting the app may delete local sets; exported files remain wherever the user saved them. This limitation is disclosed before purchase and in FAQ, Privacy, Terms, Support, and Data and Storage.

## Reviewer path

1. Tap `Get Started`.
2. Draw in Signature or switch to Initials; only one is required.
3. Tap `Continue`.
4. Compare the same fictional agreement with White Background and Transparent placement.
5. Tap the asset-aware Confirm action.
6. If one slot is empty, choose Continue to see that the other slot remains included.
7. On Transparent Export, observe the localized StoreKit price, one-set scope, no-subscription statement, deletion disclosure, and visible `Save with White Background, Free` action.
8. Test the free action without purchase.
9. Return and purchase the consumable in the sandbox environment; select separate formats and export.
10. Reopen the saved set and export again; no second purchase appears.

No demo credentials are required. Portrait and landscape both preserve drawings; rotation is optional. At accessibility text sizes the matched comparison stacks vertically without changing geometry.

## Mock versus sandbox

Mock StoreKit exists only in nonproduction test/fixture builds. The submitted production build must fail closed unless real StoreKit mode is active and must contain no fixture activation path. Review uses Apple sandbox behavior.

## Review contact and links

- Contact: `[FOUNDER_INPUT:APP_REVIEW_CONTACT]`
- International phone: `[FOUNDER_INPUT:APP_REVIEW_PHONE]`
- Privacy: `[FOUNDER_INPUT:PRIVACY_URL]`
- Support: `[FOUNDER_INPUT:SUPPORT_URL]`
- Terms: `[FOUNDER_INPUT:TERMS_URL]`

These markers are forbidden in the submitted metadata and production bundle.

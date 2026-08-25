# Copy Deck

Authoritative runtime strings live in the centralized content package. This deck records the approved English meaning and drift checks.

## Landing

- Heading: `Signature and Initials`
- Supporting: `Export in the format you need.`
- Primary statement: `EXPORT WITH A TRANSPARENT BACKGROUND`
- Benefits: `No white box`; `No editing or cropping`; `Created on your device. We do not upload it.`; `No login. No subscription.`
- Action: `Get Started`

## Draw and preview

- Headings: `Draw Your Signature`; `Draw Your Initials`
- Segments: `Signature`; `Initials`
- Orientation: `More room is available in landscape.`
- Actions: `Clear`; `Continue`
- Clear alert: `Clear this drawing?`; `Clear`; `Keep Drawing`
- Empty: `Draw your signature or initials to continue.`
- Preview: `Preview on Document`; `See exactly how your signature will look.`
- Comparison: `Compare versions`; `White Background`; `Transparent`; `Professional Export`
- Confirm: `Confirm Signature`; `Confirm Initials`; `Confirm Signature and Initials`
- Navigation: `← Back`

## Missing slot

- `Initials are included. Add them now or later.` / `Signature is included. Add it now or later.`
- `Add Initials`; `Add Signature`; `Continue`

## Purchase

- Title: `Transparent Export`
- Supporting, state-aware: `Place your signature on any document.` / `Place your initials on any document.` / `Place your signature and initials on any document.`
- Value: `No editing or cropping`
- Button: `Purchase for {localized price}`
- Scope: `One purchase for this signature + initials set.` State-aware included-slot variants are required.
- `No subscription. Re-export this set anytime.`
- `Saved only on this device. Deleting the app may delete this set. Exported files are not affected.`
- Free: `Save with White Background, Free`

## Purchase status

- Cancelled: `Purchase cancelled.` Add `You were not charged by this attempt.` only when StoreKit establishes that fact.
- Pending: `Purchase pending. Apple is still processing it. This set will unlock automatically when approved.`
- Checking: `Checking your purchase. Do not purchase this set again.`
- Recovered: `Purchase recovered. Transparent export is ready for this set.`
- Product unavailable: `Transparent export is unavailable right now. You can still save with a white background.`
- Verification failure: `We could not verify this purchase yet. Do not purchase this set again. We will keep checking.`
- Offline: `Connect to the internet to purchase transparent export. Free white-background export is still available.`

## Format and success

- `Thanks for your purchase`; `Choose your export format.`
- `PNG, Transparent`; `PNG, White Background`; `JPEG, White Background`
- Conditional only after verification: `SVG, Transparent`; `PDF, Transparent`
- `Add Initials, Included`; `Add Signature, Included`
- `Export`; `Create New`
- `Saved Successfully!`; `Your signature and initials are saved.`; single-asset variants; `Done`
- Free upsell: `Export Transparent for {localized price}` only for unpurchased set.

## Saved and destructive actions

- Default: `Signature Set {number}`
- `Export`; `Create New Set`; `Fill Included Slot`; `Rename`; `Duplicate as New Draft`; `Delete Local Set`
- Duplicate explanation: `Your original stays saved. Transparent export of the new version requires a new purchase.`
- Delete All: `Delete All Saved Signatures`
- Scope: `This removes signatures and initials stored inside Only Signature. Files you already exported are not deleted.`
- Deferred deletion: `A purchase is still being processed or recovered. Delete All will be available after it is resolved. Do not purchase this set again.`
- Authorized use: `Use only a signature you are authorized to use.`

## Export and errors

- Handoff: `Only Signature creates the file on this device. The destination you choose may store or send it under that service’s terms.`
- Export failure: `Couldn’t create the file. Your drawing is still saved. Try again.`
- Files failure: `Couldn’t save to Files. Your drawing is still saved. Try again or choose Share.`
- Destination unavailable: `That share destination was not available. Choose Files or another Share option.`
- Share cancellation: neutral return; no failure alert.
- Insufficient storage: `There isn’t enough storage to save this file. Free some space and try again. Your drawing is still saved.`
- Corrupt set: `This saved set could not be opened safely. Try the recovered version or create a new draft.`
- Unsupported format: `That format is not available for this export. Choose another format.`
- Cleanup failure: `A temporary file will be cleaned up the next time Only Signature opens.`

## Prohibited copy

Never use `100% Private`, `Never leaves your device`, `Lifetime Pro`, `Premium Forever`, `Unlock the App Forever`, `Unlimited Forever`, universal transparency for JPEG, `legally binding`, `verified`, `certified`, `digital signature` as a product claim, `notarized`, `audit trail`, `accepted everywhere`, or competitor/famous-brand traffic terms.

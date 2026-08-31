# Only Signature local launch asset inventory

Verified on August 31, 2026 in the repository root:

`C:\Users\mskir\Desktop\Only Signature Build August`

## Source-controlled launch materials

- `artifacts/actual-flow-preview/` contains 16 actual Expo-rendered product-flow screens, contact sheets, and a provenance manifest.
- `artifacts/app-store-screenshots-v1/` contains 16 App Store design previews at the accepted iPhone 6.9-inch and iPad 13-inch portrait dimensions, contact sheets, and a hash manifest.
- `scripts/compose-local-aso-preview.mjs` regenerates the App Store design previews from the actual-flow screens.
- `artifacts/expo-production-introspect.json` records the production Expo configuration against the current application revision.

These screenshots are design and composition evidence. Their manifests intentionally identify the source screens as local Expo-rendered previews. They must be replaced by the governed native iOS capture workflow before they are treated as final App Store submission evidence.

## Local downloadable handoff packages

These packages remain in the repository root for immediate access but are deliberately excluded from Git because they duplicate the source-controlled folders above.

| Package                                       |            Size | SHA-256                                                            |
| --------------------------------------------- | --------------: | ------------------------------------------------------------------ |
| `Only-Signature-Actual-Flow-Screens.zip`      |   589,988 bytes | `59D25C564A62B33AA89561369026BF11452CCE8F013939BC564E7F59AD494B83` |
| `Only-Signature-App-Store-Screenshots-v1.zip` | 3,772,143 bytes | `F0B2DE20AF762556358A19E4D0076AB7AC870DCA09858C8FB18E4DF5113FF250` |

## Protected local-only material

- `app.json` remains local and excluded from Git. Its SHA-256 at verification was `B52872D61EA66294E0BD5D8432231876B76D9008C1CA75D42BEC89EBCBF2B0C7`.
- `artifacts/aso-before-click-reference/` remains local as third-party visual research. It is not product source and is not published to GitHub.

## Canonical final submission paths

The governed native workflow writes final evidence under:

- `store-assets/screenshots/native/`
- `store-assets/app-review/native/`

The repository verifier will reject incomplete or non-native content when run with the native requirement enabled.

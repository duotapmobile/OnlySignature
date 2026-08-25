# Data Flow

## Data classes

| Data                                    | Source           | Processing/storage                  | Automatic transmission                                          | Deletion                                                            |
| --------------------------------------- | ---------------- | ----------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------- |
| Signature/initial stroke points         | User drawing     | Protected app-local canonical set   | None permitted                                                  | Per-set or Delete All, subject to unresolved-purchase retention     |
| Derived previews/thumbnails             | Local renderer   | Protected app-local derived files   | None permitted                                                  | With set/Delete All; regenerable                                    |
| Temporary exports                       | Local renderer   | Randomized protected temp directory | Only after explicit OS share/save choice                        | After safe handoff and launch cleanup                               |
| Local label                             | User, optional   | Protected app-local metadata        | Never StoreKit/log/diagnostics/filename by default              | Rename, set deletion, Delete All                                    |
| Purchase intent/transaction association | App and StoreKit | Protected durable journal           | Product ID and optional random UUID through Apple StoreKit only | Retained while technically required; no artwork restoration promise |
| Export preferences/review counters      | User behavior    | Local only                          | None                                                            | Set deletion/Delete All as applicable                               |
| Local diagnostics                       | App/system facts | Voluntary on-screen/copyable text   | None automatically                                              | Ephemeral/user-controlled                                           |

## Automatic app flow

```text
Touch/stylus → canonical strokes → protected local set
                              ↘ local preview/thumbnail
                               ↘ local export renderer → protected temp file
```

No signature, initials, thumbnail, stroke, label, or exported file is automatically sent to the developer or a developer-controlled service.

## Purchase flow

```text
Frozen local snapshot + protected journal
        ↓
Apple StoreKit: product ID + optional bridge-proven random UUID only
        ↓ verified transaction
Atomic local binding/read-back
        ↓
Finish transaction
```

Apple processes commerce. No artwork, artwork hash, label, filename, or typed name enters StoreKit metadata. If protected storage is unavailable, delivery remains queued and unfinished until unlock. Delete All is deferred while recovery is unresolved.

## User-selected handoff

The user may explicitly choose Files, AirDrop, or another destination offered through Apple’s system share sheet. At handoff, the selected OS extension/service may store or transmit the file, including to cloud-backed locations. Only Signature does not control that destination. Direct Photos and image Copy are not shipped.

## Website and support

The static website does not receive app signatures. Its host may process ordinary request logs such as IP address, time, path, and user agent. A support email provider processes the message and any attachment the user voluntarily sends. The app never silently attaches signature content or diagnostics.

## Build-time flow

EAS may receive a source bundle to compile iOS. `.easignore` and secret scanning must exclude credentials and private founder data. Build-time upload is distinct from production runtime behavior.

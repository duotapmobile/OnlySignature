# Threat Model

## Security objectives

Keep signature content local by default, prevent accidental disclosure, preserve paid-set integrity, avoid duplicate charging, minimize permissions/dependencies, and state unavoidable platform/user risks honestly.

| Threat                                  | Impact                                       | Control                                                                                   | Residual limitation / verification                         |
| --------------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Unlocked-device access                  | Another person sees/exports sets             | App-local protection, privacy cover, simple delete                                        | No app login by design; OS device security remains primary |
| App-switcher preview                    | Signature visible in snapshot                | Native/root opaque cover on inactive/background                                           | Slow-motion physical-device verification                   |
| Backup/cloud reconstruction             | Sensitive set copied to backup               | Backup exclusion on reusable directory                                                    | Inspect actual device backup                               |
| Locked-device file access               | Data accessible or transaction mishandled    | `NSFileProtectionComplete`; defer StoreKit finish until unlock                            | Physical lock/unlock plus StoreKit tests                   |
| Temp-file residue                       | Export remains after share/cancel/crash      | Protected randomized temp, cleanup journal, launch cleanup                                | Container inspection across lifecycle cases                |
| Clipboard/Handoff exposure              | Signature copied indefinitely/across devices | Image Copy is not shipped                                                                 | Re-audit before adding any pasteboard feature              |
| Files/share/cloud destination           | Export syncs outside device                  | Explicit system-share choice and truthful handoff copy                                    | App cannot control selected provider; policy disclosure    |
| Logs/crash reports                      | Points/images/labels leak                    | No remote crash SDK; structured redacted local categories; production console suppression | Device-console/static scan                                 |
| Dependency telemetry                    | Hidden runtime transmission                  | Minimal pinned graph, SBOM, archive/domain/packet audit                                   | Re-audit every version change                              |
| Transaction tampering/unverified result | Unpaid access or wrong binding               | StoreKit verification, product/environment check, unique transaction, journal             | StoreKit Test/XCTest                                       |
| Charge succeeds before local delivery   | Lost purchase/repurchase                     | Frozen generations, finish-last, recovery-required, redraw-bind without recharge          | Fault injection at every transition                        |
| Delete All during purchase              | Orphaned verified transaction                | Block/defer deletion and retain minimum protected recovery material                       | TM-16 matrix                                               |
| Optional token absent/misused           | Wrong correlation                            | Journal+transaction ID authoritative; token optional valid UUID hint only                 | Present/absent/mismatch tests                              |
| Jailbroken/compromised device           | OS protections bypassed                      | No absolute claim; integrity checks and minimal data                                      | Cannot be fully mitigated by app                           |
| App deletion                            | Local artwork lost                           | Pre-purchase disclosure and exported-file guidance                                        | No false Restore or cloud promise                          |
| Unauthorized signature imitation        | Fraud/reputation harm                        | Concise authorized-use acknowledgment, Terms prohibition, no document workflow            | Identity verification intentionally excluded               |
| Malicious/accidental sharing            | Asset disclosed                              | Explicit OS action, temporary cleanup, clear destination language                         | User-selected recipient/provider is outside app control    |
| Screenshots/screen recording            | Signature captured                           | App-switcher cover only                                                                   | Do not claim prevention; iOS/user controls govern          |

## Trust boundaries

The app trusts Apple StoreKit verification and iOS protection APIs, not raw bridge success flags. OS share destinations, Files/iCloud Drive, Photos sync, email, and third-party extensions are external user-selected boundaries. EAS is a build-time processor. The static website/support provider is separate from app signature processing.

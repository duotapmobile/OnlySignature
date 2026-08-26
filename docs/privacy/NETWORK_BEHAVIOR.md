# Production Network Behavior

## Allowlist

| Activity                                                                     |          Allowed | Trigger                                       | Signature content                               |
| ---------------------------------------------------------------------------- | ---------------: | --------------------------------------------- | ----------------------------------------------- |
| Apple StoreKit product/purchase traffic                                      |              Yes | Explicit purchase/product load via system API | Never; product ID and optional random UUID only |
| System Share, Files, AirDrop, receiving apps                                 |              Yes | Explicit destination choice                   | Selected export, controlled by OS/destination   |
| `onlysignature.app` Privacy, Terms, Support, marketing/App Store HTTPS links |              Yes | Explicit tap                                  | None attached                                   |
| EAS Build source upload                                                      |  Build time only | Authorized build                              | Source after ignore/secret scan; not runtime    |
| Expo OTA/update request                                                      | No in production | N/A                                           | N/A                                             |
| Analytics, advertising, crash upload, remote logging                         |               No | N/A                                           | N/A                                             |
| Developer backend/cloud storage/account                                      |               No | N/A                                           | N/A                                             |
| Remote fonts/images/config/WebView                                           |               No | N/A                                           | N/A                                             |

## Enforcement

- Production `updates.enabled=false`; embedded bundle only.
- No update URL/channel/runtime publication in release config.
- HTTPS legal/support URLs are centralized and user initiated.
- Runtime dependencies are audited for domains and telemetry.
- Production config and bundle scans reject mock/debug endpoints, remote assets, tracking keys, and unexpected domains.

## Observation protocol

Observe packet and DNS behavior on the exact release build during clean launch, drawing, preview, local white export, purchased-set local export, relaunch, Saved, Settings, and Delete All. Run StoreKit, external links, and share destinations as separate marked phases. Record device, OS, app version/build, capture tool, start/end time, domains/process attribution, and disposition.

**Current result:** NOT RUN — SIGNED RELEASE BUILD AND APPLE DEVICE REQUIRED. Architecture intent is not observation evidence.

# ADR-001 — Mobile Architecture

**Status:** Accepted  
**Date:** 2026-08-25

## Context

Primary development is on Windows. The app needs native iOS StoreKit, protected files, pasteboard controls, lifecycle privacy, drawing, orientation, Files/Share, and optional Photos behavior. Final signed/native evidence requires EAS/macOS and Apple devices.

## Options

| Option                       | Windows productivity                                         | Native access                                  | iOS verification burden                                     | Decision     |
| ---------------------------- | ------------------------------------------------------------ | ---------------------------------------------- | ----------------------------------------------------------- | ------------ |
| Expo React Native + prebuild | Strong TypeScript, tests, web/site, prebuild; EAS hosted iOS | Config plugins and narrow owned native modules | Moderate and explicit                                       | **Selected** |
| Bare React Native            | Similar JS path but more manual native ownership             | Full                                           | Higher with no product benefit                              | Rejected     |
| SwiftUI                      | Direct Apple APIs                                            | Strongest                                      | Windows cannot compile/run it; product/site sharing reduced | Rejected     |

## Decision

Use npm workspaces, Node 22.22.0, Expo SDK 57, React Native 0.86, React 19.2.3, strict TypeScript, Expo prebuild/Continuous Native Generation, development builds, and EAS. Use maintained Expo packages where their contracts suffice; use narrow owned native modules for StoreKit, protected/backup-excluded atomic storage, expiring local-only image pasteboard, and native lifecycle privacy where necessary.

Canonical strokes and purchase state remain platform-neutral domain code. Native adapters are isolated and contract-tested. Expo Go is not evidence for any native boundary.

## Consequences

Windows can complete product code and deterministic local suites. It cannot certify Xcode compilation, StoreKit, archive privacy, iOS accessibility, file attributes, performance, or destination behavior. EAS compilation proves compilation only. Release requires retained signed-build and physical-device evidence.

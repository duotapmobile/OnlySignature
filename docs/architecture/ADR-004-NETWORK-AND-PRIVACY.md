# ADR-004 — Network and Privacy

**Status:** Accepted  
**Date:** 2026-08-25

## Decision

The production app contains no developer-controlled runtime network service. Expo Updates is disabled and the production bundle is embedded. No analytics, ads, remote logging/crash upload, remote configuration, remote font/image, WebView, account, backend, or cloud signature storage is permitted.

Allowed behavior is limited to Apple StoreKit, explicit user-selected OS sharing/saving, and explicit opening of configured HTTPS legal/support/App Store links. EAS source upload is build-time behavior, protected by `.easignore` and secret scanning, and is not described as runtime app behavior.

## Privacy copy

“Created on your device. We do not upload it.” is authorized only after release-binary observation confirms no automatic signature-content transmission. It does not cover destinations the user selects, Apple purchase processing, support correspondence, website host logs, or build services; policies distinguish each context.

## Enforcement

Production config fails on OTA/update URLs, mock purchase mode, placeholder URLs, unexpected domains, telemetry dependencies, or tracking declarations. App Privacy and manifest answers derive from the final archive and observed runtime, not this ADR alone.

## Consequences

No cross-device art recovery, server transaction ledger, remote diagnostics, or near-real-time refund notification exists. These limitations preserve the product boundary and are disclosed. Final packet/DNS observation and archive inspection are release gates.

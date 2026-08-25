# Only Signature Mobile

Expo SDK 57 / React Native 0.86 iOS application for creating and exporting one handwritten signature plus one initials asset per local set.

## Local verification

```powershell
npm run typecheck
npm run lint
npm test
npx expo config --type public
npx expo export --platform ios --output-dir dist/ios-bundle
```

Production configuration is fail-closed. Copy `.env.example` into an untracked environment source and replace the legal, public URL, bundle, StoreKit, Apple Team, and EAS values before a production EAS build. Production uses the native StoreKit 2 and protected-storage modules; mock StoreKit and screenshot fixtures are rejected.

Signed builds, sandbox purchases, physical-device alpha preservation, VoiceOver, Photos behavior, and final simulator screenshots require the founder's Apple credentials and/or macOS device environment.

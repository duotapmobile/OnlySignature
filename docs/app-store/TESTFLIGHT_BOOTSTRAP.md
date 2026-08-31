# TestFlight Bootstrap — One-Time Human Actions

Boundary: internal TestFlight only. Do not submit the app version or IAP for App Review and do not release publicly.

## 1. Expo organization

1. While signed in to Expo as `notebox`, open `https://expo.dev/create-organization`.
2. Create a **free** organization with display name `DuoTap` and preferred username `duotapmobile`.
3. Stop if Expo requests payment. Do not link Only Signature to `notebox` or `noteboxs-team`.
4. The executor must rerun pinned `eas-cli@23.0.0 whoami` and see the exact DuoTap organization before `eas init` or project linking.

## 2. EAS project link and Apple signing

1. The executor runs the pinned EAS CLI from `apps/mobile`, selects the verified DuoTap owner, and records the generated EAS project ID in Expo-managed configuration.
2. For the production credentials setup, the founder completes Apple browser login and 2FA directly when EAS opens/prompts. Passwords and verification codes are never sent in chat or committed.
3. Select Apple team **DuoTap LLC — JWXC66G9Z5**, bundle identifier `com.duotap.onlysignature`, and allow EAS to create or reuse the App Store distribution certificate and provisioning profile.
4. No push-notification key is required because Only Signature has no push feature.

## 3. App Store Connect API key

1. In App Store Connect, open **Users and Access → Integrations → App Store Connect API → Team Keys**.
2. If API access has not been requested, the Account Holder must request it and wait for Apple approval.
3. Generate one team key named `Only Signature EAS` with **App Manager** access unless Apple/EAS demonstrates a narrower working role. Do not use an Admin key merely for convenience.
4. Download the `.p8` file once. Keep it outside the repository in a founder-controlled credential folder. Do not paste its contents into chat.
5. Record the non-secret Key ID and Issuer ID privately. Configure EAS through `eas credentials --platform ios` or EAS encrypted file credentials; never commit the `.p8` path or key.

## 4. Internal TestFlight

After the signed archive is inspected and uploaded, create one internal group named `Only Signature Internal`, add only App Store Connect users, enter the prepared What to Test copy, and add the processed build. Do not enable external testing and do not submit any review item.

Current sources, accessed 2026-08-28: [Apple API keys](https://developer.apple.com/documentation/appstoreconnectapi/creating-api-keys-for-app-store-connect-api), [Apple roles](https://developer.apple.com/help/app-store-connect/reference/account-management/role-permissions), [Expo iOS submit](https://docs.expo.dev/submit/ios/), [Expo iOS credentials](https://docs.expo.dev/app-signing/app-credentials/), and [Apple internal testers](https://developer.apple.com/help/app-store-connect/test-a-beta-version/add-internal-testers/).

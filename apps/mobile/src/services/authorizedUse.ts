import { Alert } from "react-native";

export function confirmAuthorizedUse(onContinue: () => void): void {
  Alert.alert(
    "Authorized use only",
    "Use only a signature you are authorized to use. Do not use Only Signature for forgery, impersonation, fraud, or misrepresentation.",
    [
      { text: "Cancel", style: "cancel" },
      { text: "Continue", onPress: onContinue },
    ],
  );
}

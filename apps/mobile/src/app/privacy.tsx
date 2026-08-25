import { Linking, Pressable, StyleSheet, Text } from "react-native";
import Constants from "expo-constants";
import { InfoPage } from "@/components/InfoPage";
import { MarkdownDocument } from "@/components/MarkdownDocument";
import { sharedCopy, theme } from "@/integrations/workspace";

export default function PrivacyScreen() {
  const url = (
    Constants.expoConfig?.extra as { privacyUrl?: string } | undefined
  )?.privacyUrl;
  return (
    <InfoPage title="Privacy Policy">
      <MarkdownDocument markdown={sharedCopy.privacyPolicyMarkdown} />
      {url ? (
        <Pressable
          accessibilityRole="link"
          onPress={() => {
            void Linking.openURL(url);
          }}
          style={styles.linkButton}
        >
          <Text style={styles.link}>Open public Privacy Policy</Text>
        </Pressable>
      ) : null}
    </InfoPage>
  );
}
const styles = StyleSheet.create({
  linkButton: { minHeight: 52, justifyContent: "center", marginTop: 12 },
  link: {
    color: theme.colors.primary,
    fontSize: 17,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});

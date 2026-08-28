import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import Constants from "expo-constants";
import { useLocalSearchParams } from "expo-router";
import { InfoPage } from "@/components/InfoPage";
import { MarkdownDocument } from "@/components/MarkdownDocument";
import { sharedCopy, theme } from "@/integrations/workspace";
import { isAuthorizedScreenshotFixture } from "@/config/screenshotFixtures";

export default function PrivacyScreen() {
  const { fixture } = useLocalSearchParams<{ fixture?: string }>();
  const url = (
    Constants.expoConfig?.extra as { privacyUrl?: string } | undefined
  )?.privacyUrl;
  if (isAuthorizedScreenshotFixture(fixture, "privacy"))
    return (
      <InfoPage title="Privacy Policy">
        <View style={styles.fixtureCard}>
          <Text style={styles.fixtureHeading}>Created on your device</Text>
          <Text style={styles.fixtureStatement}>
            The operator does not receive your signature or initials content.
          </Text>
          <Text style={styles.fixtureDetail}>
            Only Signature does not ask you to upload a document, create an
            account, or send your drawing to a developer-controlled server.
          </Text>
        </View>
      </InfoPage>
    );
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
  fixtureCard: {
    borderRadius: 22,
    borderWidth: 2,
    borderColor: theme.colors.glassBorder,
    backgroundColor: theme.colors.offWhite,
    padding: 24,
    gap: 14,
  },
  fixtureHeading: {
    color: theme.colors.primary,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
  },
  fixtureStatement: {
    color: theme.colors.text,
    fontSize: 22,
    lineHeight: 31,
    fontWeight: "700",
  },
  fixtureDetail: {
    color: theme.colors.muted,
    fontSize: 18,
    lineHeight: 27,
  },
  linkButton: { minHeight: 52, justifyContent: "center", marginTop: 12 },
  link: {
    color: theme.colors.primary,
    fontSize: 17,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});

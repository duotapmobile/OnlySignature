import { Linking, Platform, Pressable, StyleSheet, Text } from "react-native";
import Constants from "expo-constants";
import * as Device from "expo-device";
import { InfoPage, Section } from "@/components/InfoPage";
import { theme } from "@/integrations/workspace";

export default function SupportScreen() {
  const extra = Constants.expoConfig?.extra as
    | { supportEmail?: string; supportUrl?: string }
    | undefined;
  const diagnostics = `Only Signature diagnostics\nApp version: ${Constants.expoConfig?.version ?? "1.0.0"}\nBuild: ${Constants.expoConfig?.ios?.buildNumber ?? "1"}\nDevice: ${Device.modelName ?? "Unknown"}\nOS: ${Platform.OS} ${String(Platform.Version)}\nError category: none selected\nStoreKit state: not included\nExport format: not included`;
  return (
    <InfoPage title="Support">
      <Section title="Email support">
        You choose what to include in a support message. Do not attach a
        signature unless it is necessary and you intend to share it.
      </Section>
      <Pressable
        accessibilityRole="link"
        onPress={() => {
          void Linking.openURL(
            `mailto:${extra?.supportEmail ?? "support@example.invalid"}?subject=Only%20Signature%20Support`,
          );
        }}
        style={styles.linkButton}
      >
        <Text style={styles.link}>Email Support</Text>
      </Pressable>
      <Section title="Privacy-safe diagnostics">
        Diagnostics include only app/build, device model, OS version, and
        non-sensitive status categories. They never include drawings, stroke
        points, local labels, or file contents.
      </Section>
      <Text selectable accessibilityLabel="Diagnostic information">
        {diagnostics}
      </Text>
      {extra?.supportUrl ? (
        <Pressable
          accessibilityRole="link"
          onPress={() => {
            void Linking.openURL(extra.supportUrl!);
          }}
          style={styles.linkButton}
        >
          <Text style={styles.link}>Open Support Website</Text>
        </Pressable>
      ) : null}
    </InfoPage>
  );
}
const styles = StyleSheet.create({
  linkButton: { minHeight: 52, justifyContent: "center" },
  link: {
    color: theme.colors.primary,
    fontSize: 18,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});

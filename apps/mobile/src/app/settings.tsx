import { Alert, Pressable, StyleSheet, Text } from "react-native";
import Constants from "expo-constants";
import { router } from "expo-router";
import { BackLink, GlassCard, Heading, Screen } from "@/components/ui";
import { theme } from "@/integrations/workspace";
import { useAppState } from "@/state/AppStateProvider";

const rows = [
  { label: "Privacy Policy", route: "/privacy" },
  { label: "Terms of Use", route: "/terms" },
  { label: "Support", route: "/support" },
  { label: "Purchase FAQ", route: "/faq" },
  { label: "Data and Storage", route: "/data-storage" },
  { label: "Accessibility Information", route: "/accessibility" },
  { label: "Open-Source Licenses", route: "/licenses" },
] as const;

export default function SettingsScreen() {
  const { deleteAll } = useAppState();
  const confirmDelete = () =>
    Alert.alert(
      "Delete All Saved Signatures?",
      "This removes signatures and initials stored inside Only Signature. Files you already exported are not deleted.",
      [
        { text: "Keep Saved Signatures", style: "cancel" },
        {
          text: "Delete All Local Data",
          style: "destructive",
          onPress: () => {
            void deleteAll()
              .then(() => router.replace("/"))
              .catch(() =>
                Alert.alert(
                  "Purchase recovery in progress",
                  "Wait for Apple purchase recovery to finish before deleting local data.",
                ),
              );
          },
        },
      ],
    );
  return (
    <Screen>
      <Heading>Settings and About</Heading>
      <GlassCard style={styles.list}>
        {rows.map((row) => (
          <Pressable
            key={row.route}
            accessibilityRole="button"
            onPress={() => router.push(row.route)}
            style={styles.row}
          >
            <Text style={styles.rowLabel}>{row.label}</Text>
            <Text style={styles.arrow}>›</Text>
          </Pressable>
        ))}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Delete All Saved Signatures"
          onPress={confirmDelete}
          style={styles.row}
        >
          <Text style={styles.delete}>Delete All Saved Signatures</Text>
        </Pressable>
      </GlassCard>
      <Text style={styles.version}>
        Version {Constants.expoConfig?.version ?? "1.0.0"} · Build{" "}
        {Constants.expoConfig?.ios?.buildNumber ?? "1"}
      </Text>
      <BackLink onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { paddingVertical: 7 },
  row: {
    minHeight: 58,
    borderBottomWidth: 1,
    borderBottomColor: "#D9E2E5",
    paddingVertical: 12,
    paddingHorizontal: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  rowLabel: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
  },
  arrow: { color: theme.colors.primary, fontSize: 30 },
  delete: { color: theme.colors.destructive, fontSize: 18, fontWeight: "700" },
  version: { color: theme.colors.white, fontSize: 16, textAlign: "center" },
});

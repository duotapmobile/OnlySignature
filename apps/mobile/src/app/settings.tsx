import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import Constants from "expo-constants";
import { router } from "expo-router";
import {
  FlowBackButton,
  FlowHeading,
  FlowScreen,
  flowColors,
} from "@/components/flow-ui";
import { useAppState } from "@/state/AppStateProvider";
import { hapticError, hapticSuccess, hapticWarning } from "@/services/haptics";

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
            void hapticWarning();
            void deleteAll()
              .then(() => {
                void hapticSuccess();
                router.replace("/");
              })
              .catch(() => {
                void hapticError();
                Alert.alert(
                  "Purchase recovery in progress",
                  "Wait for Apple purchase recovery to finish before deleting local data.",
                );
              });
          },
        },
      ],
    );
  return (
    <FlowScreen contentStyle={styles.content} testID="settings-screen">
      <View style={styles.back}>
        <FlowBackButton onPress={() => router.back()} />
      </View>
      <FlowHeading>Settings and About</FlowHeading>
      <View style={styles.list}>
        {rows.map((row) => (
          <Pressable
            key={row.route}
            accessibilityRole="button"
            onPress={() => router.push(row.route)}
            style={styles.row}
          >
            <Text style={styles.rowLabel}>{row.label}</Text>
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
      </View>
      <Text style={styles.version}>
        Version {Constants.expoConfig?.version ?? "1.0.0"} · Build{" "}
        {Constants.expoConfig?.ios?.buildNumber ?? "1"}
      </Text>
    </FlowScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 28 },
  back: { height: 32, alignSelf: "flex-start" },
  list: {
    marginTop: 16,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(216,182,106,0.68)",
    backgroundColor: flowColors.card,
    boxShadow: "0 8px 20px rgba(2,4,10,0.16)",
  },
  row: {
    minHeight: 58,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(216,182,106,0.28)",
    paddingVertical: 12,
    paddingHorizontal: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  rowLabel: {
    color: flowColors.cardText,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
    flex: 1,
  },
  delete: {
    color: flowColors.destructive,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
  },
  version: {
    color: flowColors.muted,
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
    marginTop: 16,
  },
});

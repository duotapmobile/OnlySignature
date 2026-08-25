import { Alert } from "react-native";
import { router } from "expo-router";
import { InfoPage, Section } from "@/components/InfoPage";
import { SecondaryButton } from "@/components/ui";
import { useAppState } from "@/state/AppStateProvider";

export default function DataStorageScreen() {
  const { deleteAll } = useAppState();
  const remove = () =>
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
    <InfoPage title="Data and Storage">
      <Section title="Stored in the app">
        Drafts, purchased sets, local labels, purchase associations, and export
        preferences are stored locally with iOS file protection. Reusable
        signature data is excluded from backup where iOS permits.
      </Section>
      <Section title="Exports">
        Files you save through Files, AirDrop, email, or another destination
        offered by Apple’s share sheet are controlled by that destination.
        Deleting data here does not delete those exports.
      </Section>
      <Section title="App deletion">
        Deleting Only Signature may delete all reusable sets inside it. A
        consumed purchase cannot recreate deleted signature artwork.
      </Section>
      <Section title="Secure deletion">
        The app removes its local files, but does not claim secure erasure from
        flash storage.
      </Section>
      <SecondaryButton
        label="Delete All Saved Signatures"
        destructive
        onPress={remove}
      />
    </InfoPage>
  );
}

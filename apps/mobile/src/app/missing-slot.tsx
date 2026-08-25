import { router } from "expo-router";
import {
  BackLink,
  Body,
  GlassCard,
  Heading,
  PrimaryButton,
  Screen,
  SecondaryButton,
} from "@/components/ui";
import { hasDrawing } from "@/domain/models";
import { useAppState } from "@/state/AppStateProvider";

export default function MissingSlotScreen() {
  const { activeSet, setSelectedAsset } = useAppState();
  const missing = hasDrawing(activeSet.signature) ? "initials" : "signature";
  return (
    <Screen>
      <Heading>
        {missing === "initials"
          ? "Initials are included."
          : "A signature is included."}
      </Heading>
      <Body>
        Add {missing === "initials" ? "them" : "it"} now or later. You will not
        pay again just to fill this included slot.
      </Body>
      <GlassCard>
        <Body dark>
          One purchase includes one signature slot and one initials slot in this
          set.
        </Body>
      </GlassCard>
      <PrimaryButton
        label={missing === "initials" ? "Add Initials" : "Add Signature"}
        onPress={() => {
          setSelectedAsset(missing);
          router.replace("/draw");
        }}
      />
      <SecondaryButton
        label="Continue"
        onPress={() => router.push("/purchase")}
      />
      <BackLink onPress={() => router.back()} />
    </Screen>
  );
}

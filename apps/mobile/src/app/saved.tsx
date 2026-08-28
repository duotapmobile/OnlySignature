import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import * as StoreReview from "expo-store-review";
import { DrawingPreview } from "@/components/DrawingPreview";
import {
  GlassCard,
  Heading,
  PrimaryButton,
  Screen,
  SecondaryButton,
} from "@/components/ui";
import { hasDrawing, type SignatureSet } from "@/domain/models";
import { theme } from "@/integrations/workspace";
import { useAppState } from "@/state/AppStateProvider";

function SetCard({ item, onRename }: { item: SignatureSet; onRename(): void }) {
  const { selectSet, setSelectedAsset, duplicateSet, deleteSet } =
    useAppState();
  const purchaseRecovery = Boolean(
    item.pendingPurchaseId || item.transactionFinishPending,
  );
  const displayName = item.label || "Signature Set";
  const includedName =
    item.unclaimedSlot === "initials" ? "Initials" : "Signature";
  const open = () => {
    selectSet(item.id);
    router.push(
      purchaseRecovery
        ? "/purchase"
        : item.status === "purchased"
          ? "/export"
          : "/draw",
    );
  };
  const remove = () =>
    Alert.alert(
      "Delete this local set?",
      `${displayName} will be removed from Only Signature. Files you already exported are not deleted.${item.status === "purchased" ? " The consumed purchase cannot restore this artwork after deletion." : ""}`,
      [
        { text: "Keep Set", style: "cancel" },
        {
          text: "Delete Local Set",
          style: "destructive",
          onPress: () => deleteSet(item.id),
        },
      ],
    );
  return (
    <GlassCard style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleGroup}>
          <Text style={styles.title}>{displayName}</Text>
          <Text style={styles.status}>
            {purchaseRecovery
              ? "Purchase pending — do not purchase again"
              : item.status === "purchased"
                ? "Transparent export purchased"
                : "Draft"}
          </Text>
          {item.unclaimedSlot ? (
            <Text style={styles.included}>
              {item.transactionFinishPending
                ? `${includedName} included — available after Apple finishes processing`
                : `${includedName} included — add anytime`}
            </Text>
          ) : null}
        </View>
      </View>
      <View style={styles.thumbnails}>
        {hasDrawing(item.signature) ? (
          <View style={styles.thumb}>
            <Text style={styles.thumbLabel}>Signature</Text>
            <DrawingPreview asset={item.signature} />
          </View>
        ) : null}
        {hasDrawing(item.initials) ? (
          <View style={styles.thumb}>
            <Text style={styles.thumbLabel}>Initials</Text>
            <DrawingPreview asset={item.initials} />
          </View>
        ) : null}
      </View>
      <PrimaryButton
        label={
          purchaseRecovery
            ? "View Purchase Status"
            : item.status === "purchased"
              ? "Export"
              : "Continue Drawing"
        }
        onPress={open}
      />
      {item.unclaimedSlot && !item.transactionFinishPending ? (
        <SecondaryButton
          label={`Fill Included ${item.unclaimedSlot === "initials" ? "Initials" : "Signature"}`}
          onPress={() => {
            selectSet(item.id);
            setSelectedAsset(item.unclaimedSlot!);
            router.push("/draw");
          }}
        />
      ) : null}
      <View style={styles.cardActions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Rename ${displayName}`}
          onPress={onRename}
          style={styles.textAction}
        >
          <Text style={styles.textActionLabel}>Rename</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Duplicate ${displayName} as New Draft`}
          onPress={() => {
            if (duplicateSet(item.id)) router.push("/draw");
          }}
          style={styles.textAction}
        >
          <Text style={styles.textActionLabel}>Duplicate as New Draft</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Delete ${displayName} from this device`}
          onPress={remove}
          style={styles.textAction}
        >
          <Text style={styles.deleteLabel}>Delete Local Set</Text>
        </Pressable>
      </View>
      {item.status === "purchased" ? (
        <Text style={styles.explain}>
          Your original stays saved. Transparent export of a changed duplicate
          requires a new purchase.
        </Text>
      ) : null}
    </GlassCard>
  );
}

export default function SavedScreen() {
  const { data, createNew, renameSet, markReviewPrompted } = useAppState();
  const [renaming, setRenaming] = useState<SignatureSet | null>(null);
  const [label, setLabel] = useState("");
  const visible = data.sets.filter(
    (set) =>
      hasDrawing(set.signature) ||
      hasDrawing(set.initials) ||
      set.status === "purchased",
  );
  useEffect(() => {
    if (data.reviewPrompted || !data.sets.some((set) => set.exportCount >= 2))
      return;
    const timer = setTimeout(() => {
      void StoreReview.isAvailableAsync().then((available) => {
        if (!available) return;
        markReviewPrompted();
        return StoreReview.requestReview();
      });
    }, 1500);
    return () => clearTimeout(timer);
  }, [data.reviewPrompted, data.sets, markReviewPrompted]);
  return (
    <Screen testID="saved-screen">
      <View style={styles.top}>
        <Heading>Saved</Heading>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Settings and About"
          onPress={() => router.push("/settings")}
          style={styles.settings}
        >
          <Text style={styles.settingsText}>Settings</Text>
        </Pressable>
      </View>
      {visible.length === 0 ? (
        <GlassCard>
          <Text style={styles.emptyTitle}>No saved signatures yet</Text>
          <Text style={styles.emptyBody}>
            Create a signature or initials when you are ready.
          </Text>
        </GlassCard>
      ) : (
        visible.map((item) => (
          <SetCard
            key={item.id}
            item={item}
            onRename={() => {
              setRenaming(item);
              setLabel(item.label);
            }}
          />
        ))
      )}
      <PrimaryButton
        label="Create New"
        onPress={() => {
          if (createNew()) router.push("/draw");
        }}
      />
      <Modal
        visible={Boolean(renaming)}
        transparent
        animationType="fade"
        onRequestClose={() => setRenaming(null)}
      >
        <View style={styles.modalBackdrop}>
          <View accessibilityViewIsModal style={styles.modal}>
            <Text accessibilityRole="header" style={styles.modalTitle}>
              Rename local set
            </Text>
            <Text style={styles.modalBody}>
              This label stays on your device.
            </Text>
            <TextInput
              accessibilityLabel="Local set label"
              autoFocus
              value={label}
              maxLength={60}
              onChangeText={setLabel}
              placeholder="Example: My Signature"
              style={styles.input}
            />
            <PrimaryButton
              label="Save Name"
              onPress={() => {
                if (renaming) renameSet(renaming.id, label);
                setRenaming(null);
              }}
            />
            <SecondaryButton label="Cancel" onPress={() => setRenaming(null)} />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  settings: { minHeight: 48, paddingHorizontal: 10, justifyContent: "center" },
  settingsText: {
    color: theme.colors.white,
    fontSize: 17,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  card: { gap: 14 },
  cardHeader: { flexDirection: "row" },
  cardTitleGroup: { flex: 1 },
  title: { color: theme.colors.text, fontSize: 23, fontWeight: "800" },
  status: { color: theme.colors.muted, fontSize: 16, marginTop: 3 },
  included: {
    color: theme.colors.success,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
    marginTop: 5,
  },
  thumbnails: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  thumb: {
    flex: 1,
    minWidth: 130,
    borderWidth: 1,
    borderColor: "#D3DEE2",
    borderRadius: theme.radii.sm,
    padding: 8,
    height: 112,
  },
  thumbLabel: { color: theme.colors.muted, fontSize: 13, fontWeight: "700" },
  cardActions: { gap: 2 },
  textAction: { minHeight: 48, justifyContent: "center" },
  textActionLabel: {
    color: theme.colors.primary,
    fontSize: 17,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  deleteLabel: {
    color: theme.colors.destructive,
    fontSize: 17,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  explain: { color: theme.colors.muted, fontSize: 15, lineHeight: 21 },
  emptyTitle: { color: theme.colors.text, fontSize: 22, fontWeight: "800" },
  emptyBody: {
    color: theme.colors.muted,
    fontSize: 17,
    lineHeight: 24,
    marginTop: 6,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(2,17,24,0.66)",
    justifyContent: "center",
    padding: 24,
  },
  modal: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.lg,
    padding: 22,
    gap: 12,
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
  },
  modalTitle: { color: theme.colors.text, fontSize: 25, fontWeight: "800" },
  modalBody: { color: theme.colors.muted, fontSize: 17 },
  input: {
    minHeight: 56,
    borderWidth: 2,
    borderColor: "#9BB2BD",
    borderRadius: theme.radii.md,
    paddingHorizontal: 14,
    fontSize: 18,
    color: theme.colors.text,
  },
});

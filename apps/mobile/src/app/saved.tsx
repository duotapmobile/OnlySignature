import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import * as StoreReview from "expo-store-review";
import { DrawingPreview } from "@/components/DrawingPreview";
import {
  FlowHeading,
  FlowPrimaryButton,
  FlowScreen,
  flowColors,
} from "@/components/flow-ui";
import { hasDrawing, type SignatureSet } from "@/domain/models";
import { useAppState } from "@/state/AppStateProvider";

function MiniButton({ label, onPress }: { label: string; onPress(): void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.miniButton, pressed && styles.pressed]}
    >
      <Text style={styles.miniButtonText}>{label}</Text>
    </Pressable>
  );
}

function SigningSetCard({ item }: { item: SignatureSet }) {
  const { selectSet, setSelectedAsset } = useAppState();
  const signatureExists = hasDrawing(item.signature);
  const initialsExists = hasDrawing(item.initials);
  const purchaseLocked =
    Boolean(item.pendingPurchaseId) || item.transactionFinishPending;
  const transparent = item.status === "purchased" && !purchaseLocked;
  const title = item.label.trim() || "Signing Set";

  const select = () => selectSet(item.id);

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.signatureSlot}>
          {signatureExists && item.signature ? (
            <DrawingPreview asset={item.signature} style={styles.signature} />
          ) : (
            <Text style={styles.empty}>—</Text>
          )}
        </View>
        <View style={styles.initialsSlot}>
          {initialsExists && item.initials ? (
            <DrawingPreview asset={item.initials} style={styles.initials} />
          ) : (
            <Text style={styles.empty}>—</Text>
          )}
        </View>
      </View>
      <View style={styles.cardMeta}>
        <View
          accessible
          accessibilityLabel={`${title}. ${purchaseLocked ? "Apple purchase finishing" : transparent ? "Transparent" : "White Background"}${initialsExists ? "" : ". Initials not added"}`}
          style={styles.metaCopy}
        >
          <Text selectable numberOfLines={1} style={styles.setName}>
            {title}
          </Text>
          <Text selectable numberOfLines={1} style={styles.setStatus}>
            {purchaseLocked
              ? "Apple purchase finishing"
              : transparent
                ? "Transparent"
                : "White Background"}
            {initialsExists ? "" : " · Initials not added"}
          </Text>
        </View>
        <View style={styles.cardActions}>
          {!initialsExists && !purchaseLocked ? (
            <MiniButton
              label="Add Initials"
              onPress={() => {
                select();
                setSelectedAsset("initials");
                router.push({
                  pathname: "/draw",
                  params: { returnTo: "saved" },
                });
              }}
            />
          ) : null}
          {(signatureExists || initialsExists) && !purchaseLocked ? (
            <MiniButton
              label="Export"
              onPress={() => {
                select();
                router.push(
                  (transparent ? "/export" : "/white-export") as never,
                );
              }}
            />
          ) : null}
          {item.status === "draft" && !purchaseLocked && signatureExists ? (
            <MiniButton
              label="Unlock"
              onPress={() => {
                select();
                router.push("/purchase");
              }}
            />
          ) : null}
        </View>
      </View>
    </View>
  );
}

export default function SavedSetsScreen() {
  const { data, createNew, setSelectedAsset, markReviewPrompted } =
    useAppState();
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
    <FlowScreen contentStyle={styles.content} testID="saved-sets-screen">
      <View style={styles.header}>
        <FlowHeading>My Signing Sets</FlowHeading>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open settings"
          onPress={() => router.push("/settings")}
          style={({ pressed }) => [styles.settings, pressed && styles.pressed]}
        >
          <Text style={styles.settingsIcon}>⚙</Text>
        </Pressable>
      </View>
      <View style={styles.list}>
        {visible.length ? (
          visible.map((item) => <SigningSetCard key={item.id} item={item} />)
        ) : (
          <View style={styles.emptyCard}>
            <Text selectable style={styles.emptyTitle}>
              No saved signing sets yet
            </Text>
            <Text selectable style={styles.emptyBody}>
              Create a reusable signature when you are ready.
            </Text>
          </View>
        )}
      </View>
      <View style={styles.create}>
        <FlowPrimaryButton
          label="Create New Signing Set"
          onPress={() => {
            if (!createNew()) return;
            setSelectedAsset("signature");
            router.push("/draw");
          }}
        />
      </View>
    </FlowScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 28 },
  header: {
    minHeight: 44,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  settings: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  settingsIcon: { color: flowColors.white, fontSize: 22, lineHeight: 26 },
  list: { gap: 12 },
  card: {
    minHeight: 112,
    borderRadius: 16,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 10,
    paddingTop: 9,
    paddingBottom: 7,
    overflow: "hidden",
  },
  cardTop: { height: 48, flexDirection: "row", alignItems: "center" },
  signatureSlot: { flex: 1, height: 45 },
  initialsSlot: {
    width: 72,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  signature: { width: "100%", height: 45 },
  initials: { width: 64, height: 46 },
  empty: { color: flowColors.cardText, fontSize: 20, textAlign: "center" },
  cardMeta: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaCopy: { flex: 1, minWidth: 0 },
  setName: {
    color: flowColors.cardText,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700",
  },
  setStatus: {
    color: flowColors.accessibleLink,
    fontSize: 10,
    lineHeight: 13,
    marginTop: 2,
  },
  cardActions: { flexDirection: "row", gap: 6 },
  miniButton: {
    minWidth: 76,
    height: 44,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#007C96",
    borderRadius: 22,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },
  miniButtonText: {
    color: flowColors.accessibleLink,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700",
  },
  pressed: { opacity: 0.72 },
  emptyCard: { borderRadius: 16, backgroundColor: "#FAFAFA", padding: 18 },
  emptyTitle: {
    color: flowColors.cardText,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "800",
  },
  emptyBody: {
    color: flowColors.cardMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 5,
  },
  create: { marginTop: "auto", paddingTop: 16 },
});

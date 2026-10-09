import { useEffect } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LayoutSlot } from "@/components/layout-slot";
import * as StoreReview from "expo-store-review";

import { FocusPressable as Pressable } from "@/components/FocusPressable";
import {
  FlowPrimaryButton,
  FlowScreen,
  flowColors,
} from "@/components/flow-ui";
import { isAuthorizedScreenshotFixture } from "@/config/screenshotFixtures";
import { screenshotFixtureSetsFor } from "@/domain/fixtures";
import { hasDrawing, type SignatureSet } from "@/domain/models";
import { savedSetCreationLabel } from "@/domain/saved-set-presentation";
import { useAppState } from "@/state/AppStateProvider";
import { InlineStatus } from "@/components/feedback-ui";

function GearIcon() {
  return (
    <Text accessibilityElementsHidden aria-hidden style={styles.settingsIcon}>
      ⚙︎
    </Text>
  );
}

function MiniButton({
  label,
  onPress,
  layoutId,
  labelLayoutId,
  wide = false,
}: {
  label: string;
  onPress(): void;
  layoutId?: string;
  labelLayoutId?: string;
  wide?: boolean;
}) {
  const { fontScale } = useWindowDimensions();
  const labelNode = (
    <Text
      adjustsFontSizeToFit={fontScale <= 1.15}
      minimumFontScale={0.85}
      numberOfLines={fontScale > 1.15 ? undefined : 1}
      style={styles.miniButtonText}
    >
      {label}
    </Text>
  );
  const button = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.miniButton,
        wide && styles.wideMiniButton,
        pressed && styles.pressed,
      ]}
    >
      {labelLayoutId ? (
        <LayoutSlot id={labelLayoutId}>{labelNode}</LayoutSlot>
      ) : (
        labelNode
      )}
    </Pressable>
  );
  return layoutId ? <LayoutSlot id={layoutId}>{button}</LayoutSlot> : button;
}
function SigningSetCard({
  item,
  layerPrefix,
}: {
  item: SignatureSet;
  layerPrefix: string;
}) {
  const { fontScale } = useWindowDimensions();
  const { selectSet, setSelectedAsset } = useAppState();
  const signatureExists = hasDrawing(item.signature);
  const initialsExists = hasDrawing(item.initials);
  const purchaseLocked =
    Boolean(item.pendingPurchaseId) || item.transactionFinishPending;
  const transparent = item.status === "purchased" && !purchaseLocked;
  const canUnlock =
    item.status === "draft" &&
    !purchaseLocked &&
    signatureExists &&
    initialsExists;
  const title = item.label.trim() || "Signing Set";
  const creationLabel = savedSetCreationLabel(item);
  const select = () => selectSet(item.id);

  return (
    <LayoutSlot id={`${layerPrefix}.group`} style={styles.card}>
      <View style={styles.cardHeading}>
        <LayoutSlot id={`${layerPrefix}.title`}>
          <Text selectable style={styles.setTitle}>
            {title}
          </Text>
        </LayoutSlot>
        <LayoutSlot id={`${layerPrefix}.date`}>
          <Text selectable style={styles.creationDate}>
            {creationLabel}
          </Text>
        </LayoutSlot>
      </View>
      <View style={[styles.cardMeta, fontScale > 1.15 && styles.largeMeta]}>
        <View
          accessible
          accessibilityLabel={`${purchaseLocked ? "Apple purchase finishing" : transparent ? "Transparent Unlocked" : "White Background"}${initialsExists ? "" : ". Initials not added"}`}
          style={styles.metaCopy}
        >
          <LayoutSlot id={`${layerPrefix}.status`}>
            {purchaseLocked ? (
              <InlineStatus
                message="Checking your Apple purchase"
                tone="light"
              />
            ) : (
              <Text selectable style={styles.setStatus}>
                {transparent ? "Transparent Unlocked" : "White Background"}
              </Text>
            )}
          </LayoutSlot>
          {!initialsExists ? (
            <LayoutSlot id={`${layerPrefix}.missing-initials`}>
              <Text selectable style={styles.missingStatus}>
                Initials not added
              </Text>
            </LayoutSlot>
          ) : null}
        </View>
        <View style={styles.cardActions}>
          {!initialsExists && !purchaseLocked ? (
            <MiniButton
              label="Add Initials"
              layoutId={`${layerPrefix}.add-initials.button`}
              labelLayoutId={`${layerPrefix}.add-initials.label`}
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
          {transparent ? (
            <MiniButton
              label="Export"
              layoutId={`${layerPrefix}.export.button`}
              labelLayoutId={`${layerPrefix}.export.label`}
              onPress={() => {
                select();
                router.push("/export");
              }}
            />
          ) : null}
        </View>
      </View>
      {canUnlock ? (
        <View style={styles.unlockRow}>
          <MiniButton
            wide
            label="Purchase Transparent Signature"
            layoutId={`${layerPrefix}.unlock.button`}
            labelLayoutId={`${layerPrefix}.unlock.label`}
            onPress={() => {
              select();
              router.push("/purchase");
            }}
          />
        </View>
      ) : null}
    </LayoutSlot>
  );
}
export default function SavedSetsScreen() {
  const { data, createNew, setSelectedAsset, markReviewPrompted } =
    useAppState();
  const { fixture } = useLocalSearchParams<{ fixture?: string }>();
  const savedHomeFixture = isAuthorizedScreenshotFixture(fixture, "saved-home");
  const sourceSets = savedHomeFixture
    ? screenshotFixtureSetsFor(fixture)
    : data.sets;
  const visible = sourceSets.filter(
    (set) =>
      hasDrawing(set.signature) ||
      hasDrawing(set.initials) ||
      set.status === "purchased",
  );

  useEffect(() => {
    if (savedHomeFixture) return;
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
  }, [data.reviewPrompted, data.sets, markReviewPrompted, savedHomeFixture]);

  const listHeader = (
    <>
      <LayoutSlot id="saved.actions" style={styles.create}>
        <FlowPrimaryButton
          label="Create New Signing Set"
          layoutId="saved.create.button"
          labelLayoutId="saved.create.label"
          onPress={() => {
            if (!createNew()) return;
            setSelectedAsset("signature");
            router.push("/draw");
          }}
        />
      </LayoutSlot>
    </>
  );

  return (
    <FlowScreen
      scroll={false}
      scrollContainer="child"
      contentStyle={styles.content}
      testID="saved-sets-screen"
      navigation={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open settings"
          focusTone="navy"
          onPress={() => router.push("/settings")}
          style={({ pressed }) => [styles.settings, pressed && styles.pressed]}
        >
          <LayoutSlot id="saved.settings.icon">
            <GearIcon />
          </LayoutSlot>
        </Pressable>
      }
      header={
        <LayoutSlot id="saved.header">
          <LayoutSlot id="saved.title" style={styles.titleSlot}>
            <Text
              accessibilityRole="header"
              selectable
              style={styles.headingText}
            >
              My Signing Sets
            </Text>
          </LayoutSlot>
        </LayoutSlot>
      }
    >
      <LayoutSlot id="saved.list" style={styles.list}>
        <FlatList
          data={visible}
          contentInsetAdjustmentBehavior="automatic"
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <SigningSetCard
              item={item}
              layerPrefix={`saved.card-${index + 1}`}
            />
          )}
          ListHeaderComponent={listHeader}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <LayoutSlot id="saved.empty.title">
                <Text selectable style={styles.emptyTitle}>
                  No saved signing sets yet
                </Text>
              </LayoutSlot>
              <LayoutSlot id="saved.empty.subtitle">
                <Text selectable style={styles.emptyBody}>
                  Create a reusable signature when you are ready.
                </Text>
              </LayoutSlot>
            </View>
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </LayoutSlot>
    </FlowScreen>
  );
}

const styles = StyleSheet.create({
  titleSlot: { flex: 1, minWidth: 0 },
  headingText: {
    color: flowColors.white,
    fontFamily: "Georgia",
    fontSize: 30,
    lineHeight: 35,
    fontWeight: "700",
    letterSpacing: -1.1,
  },
  content: { paddingTop: 14, paddingBottom: 8 },
  settings: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  settingsIcon: { color: flowColors.white, fontSize: 24, lineHeight: 28 },
  list: { flex: 1 },
  listContent: { paddingBottom: 20 },
  separator: { height: 14 },
  card: {
    borderRadius: 18,
    backgroundColor: flowColors.card,
    borderWidth: 1,
    borderColor: "rgba(216,182,106,0.62)",
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 14,
    overflow: "hidden",
    boxShadow: "0 6px 16px rgba(7,31,90,0.11)",
  },
  cardHeading: { gap: 4, marginBottom: 8 },
  setTitle: {
    color: flowColors.cardText,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "800",
  },
  creationDate: { color: flowColors.cardMuted, fontSize: 14, lineHeight: 20 },
  cardMeta: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  largeMeta: { flexDirection: "column", alignItems: "stretch" },
  metaCopy: { flex: 1, minWidth: 0 },
  setStatus: {
    color: flowColors.accessibleLink,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "700",
  },
  missingStatus: {
    color: flowColors.cardMuted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 1,
  },
  cardActions: { flexDirection: "row", gap: 6 },
  unlockRow: { marginTop: 8 },
  miniButton: {
    minWidth: 82,
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: flowColors.cyan,
    borderRadius: 22,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },
  wideMiniButton: { maxWidth: "100%", alignSelf: "center" },
  miniButtonText: {
    color: flowColors.accessibleLink,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  pressed: { opacity: 0.72 },
  emptyCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(216,182,106,0.62)",
    backgroundColor: flowColors.card,
    padding: 18,
    boxShadow: "0 7px 18px rgba(7,31,90,0.12)",
  },
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
  create: { marginBottom: 12 },
});

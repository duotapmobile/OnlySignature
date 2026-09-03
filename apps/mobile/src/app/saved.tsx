import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LayoutSlot } from "@/components/layout-slot";
import * as StoreReview from "expo-store-review";
import Svg, { Circle, Path } from "react-native-svg";
import { DrawingPreview } from "@/components/DrawingPreview";
import {
  FlowHeading,
  FlowPrimaryButton,
  FlowScreen,
  flowColors,
} from "@/components/flow-ui";
import { isAuthorizedScreenshotFixture } from "@/config/screenshotFixtures";
import { screenshotFixtureSetsFor } from "@/domain/fixtures";
import { hasDrawing, type SignatureSet } from "@/domain/models";
import { useAppState } from "@/state/AppStateProvider";

function GearIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Circle
        cx={12}
        cy={12}
        r={3}
        fill="none"
        stroke={flowColors.white}
        strokeWidth={1.7}
      />
      <Path
        d="M12 2.8v2.1M12 19.1v2.1M21.2 12h-2.1M4.9 12H2.8M18.5 5.5 17 7M7 17l-1.5 1.5M18.5 18.5 17 17M7 7 5.5 5.5M8.8 4.9l.7 2M14.5 17.1l.7 2M19.1 8.8l-2 .7M6.9 14.5l-2 .7M15.2 4.9l-.7 2M9.5 17.1l-.7 2M19.1 15.2l-2-.7M6.9 9.5l-2-.7"
        fill="none"
        stroke={flowColors.white}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function MiniButton({
  label,
  onPress,
  layoutId,
  labelLayoutId,
}: {
  label: string;
  onPress(): void;
  layoutId?: string;
  labelLayoutId?: string;
}) {
  const labelNode = <Text style={styles.miniButtonText}>{label}</Text>;
  const button = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.miniButton, pressed && styles.pressed]}
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
  const { product, selectSet, setSelectedAsset } = useAppState();
  const signatureExists = hasDrawing(item.signature);
  const initialsExists = hasDrawing(item.initials);
  const purchaseLocked =
    Boolean(item.pendingPurchaseId) || item.transactionFinishPending;
  const transparent = item.status === "purchased" && !purchaseLocked;
  const title = item.label.trim() || "Signing Set";
  const select = () => selectSet(item.id);

  return (
    <LayoutSlot id={`${layerPrefix}.group`} style={styles.card}>
      <View style={styles.cardTop}>
        <LayoutSlot
          id={`${layerPrefix}.signature`}
          style={styles.signatureSlot}
        >
          {signatureExists && item.signature ? (
            <DrawingPreview asset={item.signature} style={styles.signature} />
          ) : (
            <Text style={styles.empty}>—</Text>
          )}
        </LayoutSlot>
        <LayoutSlot id={`${layerPrefix}.initials`} style={styles.initialsSlot}>
          {initialsExists && item.initials ? (
            <DrawingPreview asset={item.initials} style={styles.initials} />
          ) : (
            <Text style={styles.empty}>—</Text>
          )}
        </LayoutSlot>
      </View>
      <View style={styles.cardMeta}>
        <View
          accessible
          accessibilityLabel={`${title}. ${purchaseLocked ? "Apple purchase finishing" : transparent ? "Transparent Unlocked" : "White Background"}${initialsExists ? "" : ". Initials not added"}`}
          style={styles.metaCopy}
        >
          <LayoutSlot id={`${layerPrefix}.status`}>
            <Text selectable numberOfLines={1} style={styles.setStatus}>
              {purchaseLocked
                ? "Apple purchase finishing"
                : transparent
                  ? "Transparent Unlocked"
                  : "White Background"}
            </Text>
          </LayoutSlot>
          {!initialsExists ? (
            <LayoutSlot id={`${layerPrefix}.missing-initials`}>
              <Text selectable numberOfLines={1} style={styles.missingStatus}>
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
          {item.status === "draft" &&
          !purchaseLocked &&
          signatureExists &&
          initialsExists ? (
            <MiniButton
              label={`Unlock Transparent · ${product.displayPrice || "$1.99"}`}
              layoutId={`${layerPrefix}.unlock.button`}
              labelLayoutId={`${layerPrefix}.unlock.label`}
              onPress={() => {
                select();
                router.push("/purchase");
              }}
            />
          ) : null}
        </View>
      </View>
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

  return (
    <FlowScreen contentStyle={styles.content} testID="saved-sets-screen">
      <LayoutSlot id="saved.header" style={styles.header}>
        <FlowHeading style={styles.headingText} layoutId="saved.title">
          My Signing Sets
        </FlowHeading>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open settings"
          onPress={() => router.push("/settings")}
          style={({ pressed }) => [styles.settings, pressed && styles.pressed]}
        >
          <LayoutSlot id="saved.settings.icon">
            <GearIcon />
          </LayoutSlot>
        </Pressable>
      </LayoutSlot>
      <LayoutSlot id="saved.list" style={styles.list}>
        {visible.length ? (
          visible.map((item, index) => (
            <SigningSetCard
              key={item.id}
              item={item}
              layerPrefix={`saved.card-${index + 1}`}
            />
          ))
        ) : (
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
        )}
      </LayoutSlot>
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
    </FlowScreen>
  );
}

const styles = StyleSheet.create({
  headingText: { fontSize: 32, lineHeight: 38 },
  content: { paddingTop: 38, paddingBottom: 30 },
  header: {
    minHeight: 52,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  settings: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  list: { gap: 18 },
  card: {
    minHeight: 154,
    borderRadius: 18,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
    overflow: "hidden",
    boxShadow: "0 14px 30px rgba(0, 0, 0, 0.28)",
  },
  cardTop: { height: 78, flexDirection: "row", alignItems: "center" },
  signatureSlot: { flex: 1, height: 70 },
  initialsSlot: {
    width: 94,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  signature: { width: "100%", height: 70 },
  initials: { width: 84, height: 66 },
  empty: { color: flowColors.cardText, fontSize: 22, textAlign: "center" },
  cardMeta: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
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
  miniButton: {
    minWidth: 82,
    height: 44,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#007C96",
    borderRadius: 22,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },
  miniButtonText: {
    color: flowColors.accessibleLink,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "700",
  },
  pressed: { opacity: 0.72 },
  emptyCard: { borderRadius: 14, backgroundColor: "#FAFAFA", padding: 18 },
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
  create: { marginTop: "auto", paddingTop: 24, marginBottom: 72 },
});

import type { PropsWithChildren, ReactNode } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ImageStyle,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { LayoutSlot } from "@/components/layout-slot";
import { AppBackdrop, PaperSurface } from "@/components/paper-ui";
import { hapticLightImpact } from "@/services/haptics";

export const flowColors = {
  night: "#02040A",
  ink: "#071F5A",
  inkPlate: "#081A35",
  inkRaised: "#10234D",
  action: "#0A3D78",
  gold: "#D8B66A",
  goldText: "#FFE2A0",
  paper: "#F8F6EF",
  bodyText: "#E9E6DC",
  cyan: "#D8B66A",
  cyanText: "#FFE2A0",
  white: "#FBFAF5",
  muted: "#D7E6E5",
  card: "#FBFAF5",
  cardText: "#071F5A",
  cardMuted: "#425269",
  outline: "#AFA58C",
  accessibleLink: "#17386D",
  destructive: "#A32626",
} as const;

const brandSources = {
  wordmark: require("../../assets/brand/only-signature-wordmark.png"),
} as const;

export type ScriptAsset = "sign" | "initial" | "review" | "select" | "before";

export function FlowScreen({
  children,
  scroll = true,
  contentStyle,
  testID,
  tone = "dark",
  chrome = "stacked",
}: PropsWithChildren<{
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  testID?: string;
  tone?: "dark" | "light";
  chrome?: "stacked" | "none";
}>) {
  const light = tone === "light";
  const branded = !light && chrome === "stacked";
  const content = (
    <View
      style={[
        styles.screenContent,
        contentStyle,
        branded && styles.brandedContent,
      ]}
    >
      {children}
    </View>
  );
  return (
    <SafeAreaView
      style={[styles.safe, light && styles.lightSafe]}
      edges={["top", "right", "bottom", "left"]}
    >
      {light ? (
        <View style={[styles.background, styles.lightBackground]} />
      ) : (
        <AppBackdrop style={styles.background} />
      )}
      {branded ? (
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          pointerEvents="none"
          style={styles.flowChrome}
        >
          <View style={styles.flowRearPlate} />
          <PaperSurface style={styles.flowPaperStage} />
          <View style={styles.flowInkStage}>
            <View style={styles.flowTopHighlight} />
            <View style={styles.flowSignatureMotif}>
              <View style={styles.flowSignatureDot} />
              <View style={styles.flowSignatureLine} />
            </View>
          </View>
          <Wordmark accessibilityLabel="" style={styles.flowWordmark} />
        </View>
      ) : null}
      {scroll ? (
        <ScrollView
          style={styles.screenScroll}
          testID={testID}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      ) : (
        <View testID={testID} style={styles.fill}>
          {content}
        </View>
      )}
    </SafeAreaView>
  );
}

export function Wordmark({
  accessibilityLabel = "Only Signature",
  style,
}: {
  accessibilityLabel?: string;
  style?: StyleProp<ImageStyle>;
}) {
  return (
    <Image
      source={brandSources.wordmark}
      accessibilityLabel={accessibilityLabel}
      resizeMode="contain"
      style={[styles.wordmark, style]}
    />
  );
}

export function ScriptLabel({
  asset,
  style,
  layoutId,
}: {
  asset: ScriptAsset;
  style?: StyleProp<TextStyle>;
  layoutId?: string;
}) {
  const labels: Record<ScriptAsset, string> = {
    sign: "YOUR SIGNATURE",
    initial: "YOUR INITIALS",
    review: "REVIEW YOUR SET",
    select: "CHOOSE A BACKGROUND",
    before: "BEFORE YOU DOWNLOAD",
  };
  const label = (
    <Text selectable style={[styles.scriptLabel, style]}>
      {labels[asset]}
    </Text>
  );
  return layoutId ? <LayoutSlot id={layoutId}>{label}</LayoutSlot> : label;
}

export function FlowHeading({
  children,
  layoutId,
  style,
}: PropsWithChildren<{
  layoutId?: string;
  style?: StyleProp<TextStyle>;
}>) {
  const heading = (
    <Text accessibilityRole="header" selectable style={[styles.heading, style]}>
      {children}
    </Text>
  );
  return layoutId ? <LayoutSlot id={layoutId}>{heading}</LayoutSlot> : heading;
}

export function FlowBody({
  children,
  style,
  layoutId,
}: PropsWithChildren<{
  style?: StyleProp<TextStyle>;
  layoutId?: string;
}>) {
  const body = (
    <Text selectable style={[styles.body, style]}>
      {children}
    </Text>
  );
  return layoutId ? <LayoutSlot id={layoutId}>{body}</LayoutSlot> : body;
}

export function FlowPrimaryButton({
  label,
  onPress,
  disabled = false,
  accessibilityHint,
  testID,
  layoutId,
  labelLayoutId,
  labelStyle,
  loading = false,
}: {
  label: string;
  onPress(): void;
  disabled?: boolean;
  accessibilityHint?: string;
  testID?: string;
  layoutId?: string;
  labelLayoutId?: string;
  labelStyle?: StyleProp<TextStyle>;
  loading?: boolean;
}) {
  const labelNode = (
    <Text
      adjustsFontSizeToFit
      minimumFontScale={0.6}
      numberOfLines={1}
      style={[
        styles.primaryButtonText,
        label.length > 24 && { transform: [{ scaleX: 0.91 }] },
        labelStyle,
      ]}
    >
      {label}
    </Text>
  );
  const button = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={() => {
        void hapticLightImpact();
        onPress();
      }}
      testID={testID}
      style={({ pressed }) => [
        styles.primaryButton,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <View style={styles.primaryLabelWrap}>
        {loading ? (
          <View
            accessibilityRole="progressbar"
            accessibilityLabel={label}
            style={styles.buttonLoading}
          >
            <View style={styles.buttonLoadingDot} />
            <View style={styles.buttonLoadingLine} />
            {labelNode}
          </View>
        ) : labelLayoutId ? (
          <LayoutSlot id={labelLayoutId}>{labelNode}</LayoutSlot>
        ) : (
          labelNode
        )}
      </View>
      <View accessibilityElementsHidden style={styles.primaryArrow}>
        <Text style={styles.primaryArrowText}>→</Text>
      </View>
    </Pressable>
  );
  return layoutId ? <LayoutSlot id={layoutId}>{button}</LayoutSlot> : button;
}

export function FlowTextButton({
  label,
  onPress,
  disabled = false,
  testID,
  layoutId,
  labelLayoutId,
  labelStyle,
}: {
  label: string;
  onPress(): void;
  disabled?: boolean;
  testID?: string;
  layoutId?: string;
  labelLayoutId?: string;
  labelStyle?: StyleProp<TextStyle>;
}) {
  const labelNode = (
    <Text style={[styles.textButtonText, labelStyle]}>{label}</Text>
  );
  const button = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.textButton,
        pressed && styles.pressed,
        disabled && styles.disabled,
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

export function FlowBackButton({
  onPress,
  layoutId,
}: {
  onPress(): void;
  layoutId?: string;
}) {
  const button = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Go back"
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
    >
      <Svg width={23} height={23} viewBox="0 0 24 24">
        <Path
          d="m15 5-7 7 7 7"
          fill="none"
          stroke={flowColors.white}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </Pressable>
  );
  return layoutId ? <LayoutSlot id={layoutId}>{button}</LayoutSlot> : button;
}

export function FlowSheet({
  children,
  label,
  style,
  layoutId,
  handleLayoutId,
}: PropsWithChildren<{
  label: string;
  style?: StyleProp<ViewStyle>;
  layoutId?: string;
  handleLayoutId?: string;
}>) {
  const handle = <View accessibilityElementsHidden style={styles.handle} />;
  const content = (
    <>
      {handleLayoutId ? (
        <LayoutSlot id={handleLayoutId}>{handle}</LayoutSlot>
      ) : (
        handle
      )}
      <ScrollView
        style={styles.sheetScroll}
        contentContainerStyle={styles.sheetContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </>
  );
  return layoutId ? (
    <LayoutSlot
      id={layoutId}
      accessibilityViewIsModal
      accessibilityLabel={label}
      style={[styles.sheet, style]}
    >
      {content}
    </LayoutSlot>
  ) : (
    <View
      accessibilityViewIsModal
      accessibilityLabel={label}
      style={[styles.sheet, style]}
    >
      {content}
    </View>
  );
}

export function EntryBackdrop() {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.backdrop}
    >
      <ScriptLabel asset="sign" />
      <FlowHeading>Without the sign-up.</FlowHeading>
      <FlowBody>Create your reusable signature + initials.</FlowBody>
    </View>
  );
}

export function ReviewBackdrop() {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.backdrop}
    >
      <ScriptLabel asset="review" />
      <FlowHeading>Confirm Your Signing Set</FlowHeading>
      <FlowBody>Check carefully before choosing a background.</FlowBody>
      <View style={styles.backdropCard} />
      <View style={styles.backdropCard} />
    </View>
  );
}

export function CaptureBackdrop({ initial = false }: { initial?: boolean }) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.backdrop}
    >
      <ScriptLabel asset={initial ? "initial" : "sign"} />
      <FlowHeading>
        {initial ? "Write your initials" : "Write your full name"}
      </FlowHeading>
      <FlowBody>Use the line to keep your writing straight.</FlowBody>
      <View style={styles.backdropCanvas} />
    </View>
  );
}

export function PreviewCard({
  label,
  actionLabel,
  onAction,
  children,
  labelLayoutId,
  actionLayoutId,
  contentLayoutId,
}: PropsWithChildren<{
  label: string;
  actionLabel?: string;
  onAction?(): void;
  labelLayoutId?: string;
  actionLayoutId?: string;
  contentLayoutId?: string;
}>) {
  const labelNode = (
    <Text selectable style={styles.previewLabel}>
      {label}
    </Text>
  );
  const actionNode =
    actionLabel && onAction ? (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${actionLabel} ${label.toLowerCase()}`}
        onPress={onAction}
        style={styles.previewAction}
      >
        <Text style={styles.previewActionText}>{actionLabel}</Text>
      </Pressable>
    ) : null;
  const contentNode = <View style={styles.previewContent}>{children}</View>;
  return (
    <PaperSurface style={styles.previewCard}>
      {labelLayoutId ? (
        <LayoutSlot id={labelLayoutId}>{labelNode}</LayoutSlot>
      ) : (
        labelNode
      )}
      {actionNode && actionLayoutId ? (
        <LayoutSlot id={actionLayoutId}>{actionNode}</LayoutSlot>
      ) : (
        actionNode
      )}
      {contentLayoutId ? (
        <LayoutSlot id={contentLayoutId}>{contentNode}</LayoutSlot>
      ) : (
        contentNode
      )}
    </PaperSurface>
  );
}

export type FeatureKind = "subscription" | "upload" | "account";

export function Feature({
  kind,
  children,
  iconLayoutId,
  labelLayoutId,
}: PropsWithChildren<{
  kind: FeatureKind;
  iconLayoutId?: string;
  labelLayoutId?: string;
}>) {
  const icon = <View style={styles.featureIcon}>{featureIcon(kind)}</View>;
  const label = (
    <Text selectable style={styles.featureText}>
      {children}
    </Text>
  );
  return (
    <View style={styles.feature}>
      {iconLayoutId ? <LayoutSlot id={iconLayoutId}>{icon}</LayoutSlot> : icon}
      {labelLayoutId ? (
        <LayoutSlot id={labelLayoutId}>{label}</LayoutSlot>
      ) : (
        label
      )}
    </View>
  );
}

function featureIcon(kind: FeatureKind): ReactNode {
  if (kind === "subscription") {
    return (
      <Svg width={40} height={40} viewBox="0 0 32 32">
        <Path
          d="M17 5v22M21 9c-1.2-1.1-2.7-1.7-4.5-1.7-2.7 0-4.7 1.5-4.7 3.8 0 5.8 9.4 2.7 9.4 8.4 0 2.7-2.1 4.4-5.1 4.4-2.1 0-3.9-.8-5.3-2.1M6 6l20 20"
          fill="none"
          stroke="#fff"
          strokeWidth={1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }
  if (kind === "upload") {
    return (
      <Svg width={40} height={40} viewBox="0 0 32 32">
        <Path
          d="M7 3.5h12l6 6V28H7zM19 3.5v6h6M16 23V12M11.5 16.5 16 12l4.5 4.5"
          fill="none"
          stroke="#fff"
          strokeWidth={1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }
  return (
    <Svg width={40} height={40} viewBox="0 0 32 32">
      <Circle
        cx={16}
        cy={10}
        r={5}
        fill="none"
        stroke="#fff"
        strokeWidth={1.7}
      />
      <Path
        d="M6.5 28c.8-7 4.2-10.5 9.5-10.5S24.7 21 25.5 28"
        fill="none"
        stroke="#fff"
        strokeWidth={1.7}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function LockLine({
  children,
  iconLayoutId,
  textLayoutId,
}: PropsWithChildren<{
  iconLayoutId?: string;
  textLayoutId?: string;
}>) {
  const icon = (
    <Svg width={18} height={18} viewBox="0 0 20 20">
      <Rect
        x={4}
        y={8}
        width={12}
        height={9}
        rx={1.5}
        fill="none"
        stroke={flowColors.cyan}
        strokeWidth={1.8}
      />
      <Path
        d="M6.5 8V5.7a3.5 3.5 0 0 1 7 0V8M10 11v3"
        fill="none"
        stroke={flowColors.cyan}
        strokeWidth={1.8}
      />
    </Svg>
  );
  const text = (
    <Text selectable style={styles.lockText}>
      {children}
    </Text>
  );
  return (
    <View style={styles.lockLine}>
      {iconLayoutId ? <LayoutSlot id={iconLayoutId}>{icon}</LayoutSlot> : icon}
      {textLayoutId ? <LayoutSlot id={textLayoutId}>{text}</LayoutSlot> : text}
    </View>
  );
}

export function CheckMark({ layoutId }: { layoutId?: string } = {}) {
  const mark = (
    <View accessible accessibilityLabel="Success" style={styles.checkMark}>
      <Svg width={29} height={29} viewBox="0 0 24 24">
        <Path
          d="m6 12 4 4 8-9"
          fill="none"
          stroke={flowColors.cyan}
          strokeWidth={2.1}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
  return layoutId ? <LayoutSlot id={layoutId}>{mark}</LayoutSlot> : mark;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: flowColors.night },
  lightSafe: { backgroundColor: "#F8F6EF" },
  fill: { flex: 1, zIndex: 2 },
  background: {
    ...StyleSheet.absoluteFill,
    overflow: "hidden",
  },
  lightBackground: { backgroundColor: "#F8F6EF" },
  screenScroll: { flex: 1, zIndex: 2 },
  sheetScroll: { flex: 1 },
  scroll: { flexGrow: 1 },
  screenContent: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    paddingHorizontal: 26,
    paddingTop: 24,
    paddingBottom: 28,
  },
  brandedContent: {
    position: "relative",
    zIndex: 3,
    paddingHorizontal: 32,
    paddingTop: 74,
    paddingBottom: 18,
  },
  flowChrome: {
    ...StyleSheet.absoluteFill,
    zIndex: 1,
  },
  flowRearPlate: {
    position: "absolute",
    left: 16,
    right: 3,
    top: 18,
    bottom: 3,
    borderRadius: 42,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: "rgba(216,182,106,0.34)",
    backgroundColor: "#081A35",
    boxShadow: "0 38px 72px rgba(0,0,0,0.72), 0 12px 24px rgba(0,0,0,0.58)",
  },
  flowInkStage: {
    position: "absolute",
    left: 6,
    right: 6,
    top: 3,
    height: 238,
    overflow: "hidden",
    borderRadius: 40,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: "rgba(216,182,106,0.58)",
    backgroundColor: "#0A3D78",
    boxShadow:
      "0 30px 46px rgba(0,0,0,0.60), 0 9px 16px rgba(0,0,0,0.34), inset 0 2px 0 rgba(255,255,255,0.20), inset 0 -2px 0 rgba(2,4,10,0.34)",
  },
  flowPaperStage: {
    position: "absolute",
    left: 6,
    right: 6,
    top: 192,
    bottom: 3,
    borderRadius: 40,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.96)",
    backgroundColor: "#F8F6EF",
    boxShadow:
      "0 28px 50px rgba(0,0,0,0.50), inset 0 2px 0 rgba(255,255,255,0.98), inset 0 -2px 0 rgba(7,31,90,0.12)",
  },
  flowTopHighlight: {
    position: "absolute",
    left: 36,
    right: 36,
    top: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.30)",
  },
  flowWordmark: {
    position: "absolute",
    right: 30,
    top: 12,
    zIndex: 4,
    width: 112,
    height: 44,
  },
  flowSignatureMotif: {
    position: "absolute",
    left: 29,
    right: 29,
    bottom: 29,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  flowSignatureDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#D8B66A",
    boxShadow: "0 0 12px rgba(216,182,106,0.72)",
  },
  flowSignatureLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(216,182,106,0.46)",
  },
  wordmark: { width: 244, height: 134, alignSelf: "center" },
  scriptLabel: {
    alignSelf: "flex-start",
    color: "#FFE2A0",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
    letterSpacing: 1.35,
  },
  heading: {
    color: flowColors.white,
    fontFamily: "Georgia",
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "700",
    letterSpacing: -1.1,
  },
  body: { color: "#E9E6DC", fontSize: 17, lineHeight: 24 },
  primaryButton: {
    width: "100%",
    minHeight: 60,
    paddingLeft: 22,
    paddingRight: 9,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    backgroundColor: "#0A3D78",
    boxShadow:
      "0 14px 26px rgba(7,31,90,0.30), inset 0 1px 0 rgba(255,255,255,0.18)",
  },
  primaryButtonText: {
    flexShrink: 1,
    color: "#FFFFFF",
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "700",
    textAlign: "center",
  },
  primaryArrow: {
    width: 42,
    height: 42,
    marginLeft: 8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.38)",
    backgroundColor: "rgba(216,182,106,0.24)",
  },
  primaryLabelWrap: {
    flex: 1,
    alignItems: "center",
    paddingLeft: 4,
  },
  buttonLoading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  buttonLoadingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: flowColors.gold,
  },
  buttonLoadingLine: {
    width: 20,
    height: 1.5,
    borderRadius: 2,
    backgroundColor: flowColors.gold,
  },
  primaryArrowText: {
    color: "#FFFFFF",
    fontSize: 23,
    lineHeight: 25,
    fontWeight: "500",
  },
  primaryButtonTextCompact: { fontSize: 22, lineHeight: 29 },
  textButton: {
    width: "100%",
    minHeight: 44,
    paddingHorizontal: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  textButtonText: {
    color: "#17386D",
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "700",
    textAlign: "center",
  },
  pressed: { opacity: 0.8, transform: [{ scale: 0.985 }] },
  disabled: { opacity: 0.46 },
  backButton: {
    width: 44,
    height: 44,
    marginLeft: -12,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(216,182,106,0.44)",
    backgroundColor: "rgba(8,26,53,0.72)",
    alignItems: "center",
    justifyContent: "center",
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: "88%",
    paddingTop: 12,
    paddingBottom: 8,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: "#D8B66A",
    backgroundColor: "#FBFAF5",
    boxShadow:
      "0 -22px 54px rgba(2, 4, 10, 0.45), 0 -1px 0 rgba(216, 182, 106, 0.35)",
  },
  sheetContent: {
    flexGrow: 1,
    paddingHorizontal: 30,
    paddingBottom: 16,
  },
  handle: {
    width: 45,
    height: 4,
    borderRadius: 5,
    backgroundColor: "#B5A985",
    alignSelf: "center",
    marginBottom: 10,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    paddingHorizontal: 26,
    paddingTop: 46,
    opacity: 0.25,
  },
  backdropCard: {
    minHeight: 96,
    borderRadius: 14,
    backgroundColor: flowColors.card,
    marginTop: 12,
  },
  backdropCanvas: {
    height: 230,
    borderRadius: 14,
    backgroundColor: flowColors.card,
    marginTop: 18,
  },
  previewCard: {
    minHeight: 150,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "rgba(216,182,106,0.58)",
    boxShadow: "0 16px 34px rgba(2, 4, 10, 0.3)",
  },
  previewLabel: {
    color: flowColors.cardText,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "600",
  },
  previewAction: {
    position: "absolute",
    right: 6,
    top: 2,
    minWidth: 60,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  previewActionText: {
    color: flowColors.accessibleLink,
    fontSize: 14,
    fontWeight: "700",
  },
  previewContent: {
    flex: 1,
    minHeight: 82,
    justifyContent: "center",
    alignItems: "center",
  },
  feature: {
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureIcon: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: flowColors.cyan,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  featureText: {
    color: flowColors.white,
    fontSize: 20,
    lineHeight: 27,
    fontWeight: "500",
  },
  lockLine: {
    minHeight: 44,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  lockText: { color: "#F3F0E8", fontSize: 14, lineHeight: 20 },
  checkMark: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: flowColors.cyan,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
});

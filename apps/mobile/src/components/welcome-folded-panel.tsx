import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { LayoutSlot } from "@/components/layout-slot";
import { PaperSurface } from "@/components/paper-ui";
import { Wordmark } from "@/components/flow-ui";

const benefits = [
  {
    label: "No Account",
    iconLayoutId: "entry.account.icon",
    labelLayoutId: "entry.account.label",
  },
  {
    label: "No Subscription",
    iconLayoutId: "entry.subscription.icon",
    labelLayoutId: "entry.subscription.label",
  },
  {
    label: "No Document Upload",
    iconLayoutId: "entry.upload.icon",
    labelLayoutId: "entry.upload.label",
  },
] as const;

export function WelcomeFoldedPanel({
  disabled,
  onBegin,
  onOpenSaved,
}: {
  disabled: boolean;
  onBegin(): void;
  onOpenSaved(): void;
}) {
  const { width, height } = useWindowDimensions();
  const compact = height < 740 || width < 370;
  const inkHeight = Math.min(360, Math.max(compact ? 250 : 280, height * 0.41));
  return (
    <View style={[styles.shell, compact && styles.compactShell]}>
      <View pointerEvents="none" style={styles.rearPlate} />
      <View style={styles.deviceFrame}>
        <View
          style={[
            styles.inkPanel,
            { height: inkHeight },
            compact && styles.compactInkPanel,
          ]}
        >
          <View pointerEvents="none" style={styles.topEdgeHighlight} />
          <View style={styles.wordmarkStack}>
            <View
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              pointerEvents="none"
              style={styles.wordmarkEcho}
            >
              <Wordmark accessibilityLabel="" style={styles.wordmark} />
            </View>
            <Wordmark style={styles.wordmark} />
          </View>

          <View style={[styles.copy, compact && styles.compactCopy]}>
            <LayoutSlot id="entry.sign">
              <Text
                selectable
                style={[styles.sign, compact && styles.compactSign]}
              >
                Sign.
              </Text>
            </LayoutSlot>
            <LayoutSlot id="entry.title">
              <Text
                selectable
                style={[styles.title, compact && styles.compactTitle]}
              >
                Without the sign-up.
              </Text>
            </LayoutSlot>
            <LayoutSlot id="entry.subtitle">
              <Text
                adjustsFontSizeToFit
                minimumFontScale={0.9}
                numberOfLines={1}
                selectable
                style={[styles.subtitle, compact && styles.compactSubtitle]}
              >
                Create your signature and initials.
              </Text>
            </LayoutSlot>
          </View>

          <View pointerEvents="none" style={styles.signatureMotif}>
            <View style={styles.signatureDot} />
            <View style={styles.signatureLine} />
          </View>
        </View>

        <PaperSurface
          style={[styles.whitePanel, compact && styles.compactWhitePanel]}
        >
          <View pointerEvents="none" style={styles.paperLip}>
            <View style={styles.paperLipHighlight} />
          </View>
          <LayoutSlot
            id="entry.features"
            style={styles.benefits}
            accessibilityLabel="Privacy benefits"
          >
            <Text selectable style={styles.benefitsEyebrow}>
              SIMPLE BY DESIGN
            </Text>
            {benefits.map((benefit) => (
              <View key={benefit.label} style={styles.benefitRow}>
                <LayoutSlot id={benefit.iconLayoutId}>
                  <View style={styles.checkCircle}>
                    <Text selectable style={styles.checkMark}>
                      ✓
                    </Text>
                  </View>
                </LayoutSlot>
                <LayoutSlot
                  id={benefit.labelLayoutId}
                  style={styles.benefitLabelSlot}
                >
                  <Text selectable style={styles.benefitLabel}>
                    {benefit.label}
                  </Text>
                </LayoutSlot>
              </View>
            ))}

            <View style={styles.privacyLine}>
              <LayoutSlot id="entry.privacy.icon">
                <Text selectable style={styles.lock}>
                  ●
                </Text>
              </LayoutSlot>
              <LayoutSlot id="entry.privacy.label">
                <Text selectable style={styles.privacyText}>
                  Saved privately on your device.
                </Text>
              </LayoutSlot>
            </View>
          </LayoutSlot>

          <LayoutSlot id="entry.actions" style={styles.actions}>
            <LayoutSlot id="entry.create.button">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Create My FREE Signing Set"
                accessibilityHint="Opens the signature drawing screen"
                accessibilityState={{ disabled }}
                disabled={disabled}
                onPress={onBegin}
                testID="create-signing-set"
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.buttonPressed,
                  disabled && styles.buttonDisabled,
                ]}
              >
                <LayoutSlot id="entry.create.label">
                  <Text
                    adjustsFontSizeToFit
                    minimumFontScale={0.82}
                    numberOfLines={1}
                    selectable
                    style={styles.primaryLabel}
                  >
                    Create My FREE Signing Set
                  </Text>
                </LayoutSlot>
                <View style={styles.buttonArrow}>
                  <Text selectable style={styles.buttonArrowText}>
                    →
                  </Text>
                </View>
              </Pressable>
            </LayoutSlot>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="View my Signing Sets"
              testID="view-signing-sets"
              disabled={disabled}
              onPress={onOpenSaved}
              style={({ pressed }) => [
                styles.savedButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text selectable style={styles.savedButtonText}>
                View my Signing Sets
              </Text>
            </Pressable>
          </LayoutSlot>
        </PaperSurface>
      </View>
      <View pointerEvents="none" style={styles.bottomEdgeHighlight} />
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 8,
  },
  compactShell: { paddingHorizontal: 8, paddingTop: 5, paddingBottom: 5 },
  rearPlate: {
    position: "absolute",
    left: 13,
    right: -3,
    top: 22,
    bottom: 8,
    borderRadius: 50,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: "rgba(216,182,106,0.34)",
    backgroundColor: "#081A35",
    boxShadow: "0 38px 72px rgba(0,0,0,0.78), 0 12px 24px rgba(0,0,0,0.62)",
  },
  deviceFrame: {
    flex: 1,
    width: "100%",
    borderRadius: 48,
    borderCurve: "continuous",
    boxShadow: "0 1px 0 rgba(255,255,255,0.12)",
  },
  inkPanel: {
    paddingHorizontal: 27,
    paddingTop: 18,
    paddingBottom: 48,
    overflow: "hidden",
    borderRadius: 48,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: "rgba(216, 182, 106, 0.58)",
    backgroundColor: "#0A3D78",
    boxShadow:
      "0 32px 48px rgba(0,0,0,0.68), 0 9px 16px rgba(0,0,0,0.38), inset 0 2px 0 rgba(255,255,255,0.22), inset 0 -2px 0 rgba(2,4,10,0.34)",
    zIndex: 5,
  },
  compactInkPanel: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 38,
    borderRadius: 38,
  },
  topEdgeHighlight: {
    position: "absolute",
    left: 35,
    right: 35,
    top: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.32)",
  },
  wordmarkStack: {
    width: 132,
    height: 50,
    alignSelf: "flex-end",
    zIndex: 3,
  },
  wordmarkEcho: {
    position: "absolute",
    left: 0.8,
    top: 0.65,
    opacity: 0.78,
  },
  wordmark: {
    width: 132,
    height: 50,
  },
  copy: { paddingTop: 24, zIndex: 3 },
  compactCopy: { paddingTop: 10 },
  sign: {
    color: "#FFFFFF",
    fontFamily: "Georgia",
    fontSize: 54,
    lineHeight: 59,
    fontWeight: "700",
    letterSpacing: -2.4,
  },
  compactSign: { fontSize: 46, lineHeight: 50 },
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    letterSpacing: -0.9,
    marginTop: 5,
  },
  compactTitle: { fontSize: 24, lineHeight: 29, marginTop: 2 },
  subtitle: {
    maxWidth: 360,
    color: "#E9E6DC",
    fontSize: 18,
    lineHeight: 25,
    marginTop: 9,
  },
  compactSubtitle: { fontSize: 16, lineHeight: 22, marginTop: 5 },
  signatureMotif: {
    position: "absolute",
    left: 28,
    right: 28,
    bottom: 26,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  signatureDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#D8B66A",
    boxShadow: "0 0 12px rgba(216,182,106,0.72)",
  },
  signatureLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(216,182,106,0.48)",
  },
  whitePanel: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 62,
    paddingBottom: 14,
    marginTop: -42,
    borderRadius: 48,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.96)",
    backgroundColor: "#F8F6EF",
    boxShadow:
      "0 30px 54px rgba(0,0,0,0.56), inset 0 2px 0 rgba(255,255,255,0.98), inset 0 -2px 0 rgba(7,31,90,0.12)",
    zIndex: 2,
  },
  compactWhitePanel: {
    paddingHorizontal: 22,
    paddingTop: 50,
    paddingBottom: 8,
    marginTop: -34,
    borderRadius: 38,
  },
  paperLip: {
    position: "absolute",
    left: 47,
    right: 47,
    top: 39,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(7,31,90,0.14)",
    boxShadow:
      "0 2px 5px rgba(7,31,90,0.18), inset 0 1px 0 rgba(255,255,255,0.82)",
  },
  paperLipHighlight: {
    width: "58%",
    height: 1,
    alignSelf: "center",
    backgroundColor: "rgba(216,182,106,0.66)",
  },
  bottomEdgeHighlight: {
    position: "absolute",
    left: 58,
    right: 58,
    bottom: 24,
    height: 2,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.62)",
    boxShadow: "0 2px 8px rgba(216,182,106,0.22)",
  },
  benefits: { gap: 7 },
  benefitsEyebrow: {
    color: "#766B55",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "800",
    letterSpacing: 1.35,
    marginBottom: 1,
  },
  benefitRow: {
    minHeight: 31,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkCircle: {
    width: 27,
    height: 27,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(7,31,90,0.20)",
    backgroundColor: "#EEE8D9",
    boxShadow: "0 5px 12px rgba(7,31,90,0.10)",
  },
  checkMark: {
    color: "#071F5A",
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "800",
  },
  benefitLabelSlot: { flex: 1 },
  benefitLabel: {
    color: "#10234D",
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  actions: { gap: 2, marginTop: "auto" },
  primaryButton: {
    width: "100%",
    minHeight: 56,
    paddingLeft: 22,
    paddingRight: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    backgroundColor: "#0A3D78",
    boxShadow:
      "0 14px 26px rgba(7,31,90,0.30), inset 0 1px 0 rgba(255,255,255,0.18)",
  },
  primaryLabel: {
    color: "#FFFFFF",
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "700",
  },
  buttonArrow: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.38)",
    backgroundColor: "rgba(216,182,106,0.24)",
  },
  buttonArrowText: {
    color: "#FFFFFF",
    fontSize: 23,
    lineHeight: 25,
    fontWeight: "500",
  },
  buttonPressed: { opacity: 0.8, transform: [{ scale: 0.985 }] },
  buttonDisabled: { opacity: 0.52 },
  savedButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  savedButtonText: {
    color: "#17386D",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "700",
  },
  privacyLine: {
    minHeight: 28,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 4,
    gap: 7,
  },
  lock: {
    color: "#8B7445",
    fontSize: 7,
    lineHeight: 9,
  },
  privacyText: {
    color: "#686052",
    fontSize: 12,
    lineHeight: 16,
  },
});

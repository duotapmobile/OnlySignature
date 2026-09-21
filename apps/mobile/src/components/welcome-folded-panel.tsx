import { Pressable, StyleSheet, Text, View } from "react-native";
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
  hasSavedWork,
  onBegin,
  onOpenSaved,
}: {
  disabled: boolean;
  hasSavedWork: boolean;
  onBegin(): void;
  onOpenSaved(): void;
}) {
  return (
    <View style={styles.shell}>
      <View pointerEvents="none" style={styles.rearPlate} />
      <View style={styles.deviceFrame}>
        <View style={styles.inkPanel}>
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

          <View style={styles.copy}>
            <LayoutSlot id="entry.sign">
              <Text selectable style={styles.sign}>
                Sign.
              </Text>
            </LayoutSlot>
            <LayoutSlot id="entry.title">
              <Text selectable style={styles.title}>
                Without the sign-up.
              </Text>
            </LayoutSlot>
            <LayoutSlot id="entry.subtitle">
              <Text
                adjustsFontSizeToFit
                minimumFontScale={0.9}
                numberOfLines={1}
                selectable
                style={styles.subtitle}
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

        <PaperSurface style={styles.whitePanel}>
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
          </LayoutSlot>

          <LayoutSlot id="entry.actions" style={styles.actions}>
            <LayoutSlot id="entry.create.button">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Create My Signing Set — Free"
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
                    Create My Signing Set — FREE
                  </Text>
                </LayoutSlot>
                <View style={styles.buttonArrow}>
                  <Text selectable style={styles.buttonArrowText}>
                    →
                  </Text>
                </View>
              </Pressable>
            </LayoutSlot>

            {hasSavedWork ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="My Signing Sets"
                disabled={disabled}
                onPress={onOpenSaved}
                style={({ pressed }) => [
                  styles.savedButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text selectable style={styles.savedButtonText}>
                  My Signing Sets
                </Text>
              </Pressable>
            ) : null}

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
        </PaperSurface>
      </View>
      <View pointerEvents="none" style={styles.bottomEdgeHighlight} />
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    paddingHorizontal: 5,
    paddingTop: 8,
    paddingBottom: 24,
  },
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
    width: "100%",
    borderRadius: 48,
    borderCurve: "continuous",
    boxShadow: "0 1px 0 rgba(255,255,255,0.12)",
  },
  inkPanel: {
    minHeight: 365,
    paddingHorizontal: 27,
    paddingTop: 22,
    paddingBottom: 62,
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
  topEdgeHighlight: {
    position: "absolute",
    left: 35,
    right: 35,
    top: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.32)",
  },
  wordmarkStack: {
    width: 148,
    height: 58,
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
    width: 148,
    height: 58,
  },
  copy: { paddingTop: 42, zIndex: 3 },
  sign: {
    color: "#FFFFFF",
    fontFamily: "Georgia",
    fontSize: 60,
    lineHeight: 66,
    fontWeight: "700",
    letterSpacing: -2.4,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "800",
    letterSpacing: -0.9,
    marginTop: 8,
  },
  subtitle: {
    maxWidth: 360,
    color: "#E9E6DC",
    fontSize: 20,
    lineHeight: 28,
    marginTop: 13,
  },
  signatureMotif: {
    position: "absolute",
    left: 28,
    right: 28,
    bottom: 34,
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
    minHeight: 382,
    paddingHorizontal: 28,
    paddingTop: 76,
    paddingBottom: 22,
    marginTop: -50,
    borderRadius: 48,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.96)",
    backgroundColor: "#F8F6EF",
    boxShadow:
      "0 30px 54px rgba(0,0,0,0.56), inset 0 2px 0 rgba(255,255,255,0.98), inset 0 -2px 0 rgba(7,31,90,0.12)",
    zIndex: 2,
  },
  paperLip: {
    position: "absolute",
    left: 47,
    right: 47,
    top: 49,
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
  benefits: { gap: 11 },
  benefitsEyebrow: {
    color: "#766B55",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "800",
    letterSpacing: 1.35,
    marginBottom: 4,
  },
  benefitRow: {
    minHeight: 35,
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
  actions: { gap: 9, marginTop: 21 },
  primaryButton: {
    width: "100%",
    minHeight: 60,
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
    minHeight: 36,
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
    minHeight: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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

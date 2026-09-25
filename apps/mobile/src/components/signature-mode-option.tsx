import { Pressable, StyleSheet, Text, View } from "react-native";
import { LayoutSlot } from "@/components/layout-slot";
import { flowColors } from "@/components/flow-ui";

export function SignatureModeOption({
  eyebrow,
  title,
  detail,
  onPress,
  disabled = false,
  layoutId,
  compact = false,
}: {
  eyebrow?: string;
  title: string;
  detail: string;
  onPress: () => void;
  disabled?: boolean;
  layoutId: string;
  compact?: boolean;
}) {
  return (
    <LayoutSlot
      id={layoutId}
      style={[styles.slot, compact && styles.compactSlot]}
    >
      {eyebrow ? (
        <Text
          selectable
          style={[styles.eyebrow, compact && styles.compactEyebrow]}
        >
          {eyebrow}
        </Text>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${title}. ${detail}`}
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          compact && styles.compactCard,
          pressed && styles.pressed,
          disabled && styles.disabled,
        ]}
      >
        <View
          style={[styles.numberMark, compact && styles.compactNumberMark]}
          accessibilityElementsHidden
        >
          <Text selectable={false} style={styles.numberText}>
            1+2
          </Text>
        </View>
        <View style={styles.copy}>
          <Text
            selectable
            style={[styles.title, compact && styles.compactTitle]}
          >
            {title}
          </Text>
          <Text
            selectable
            style={[styles.detail, compact && styles.compactDetail]}
          >
            {detail}
          </Text>
        </View>
      </Pressable>
    </LayoutSlot>
  );
}

const styles = StyleSheet.create({
  slot: { marginTop: 18, gap: 9 },
  compactSlot: { marginTop: 5, gap: 3 },
  eyebrow: {
    color: flowColors.ink,
    fontFamily: "Georgia",
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  compactEyebrow: { fontSize: 17, lineHeight: 20 },
  card: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.24)",
    backgroundColor: flowColors.action,
    boxShadow:
      "0 7px 18px rgba(2,4,10,0.18), inset 0 1px 0 rgba(255,255,255,0.18)",
  },
  compactCard: {
    minHeight: 54,
    gap: 10,
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 17,
  },
  numberMark: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: flowColors.gold,
  },
  compactNumberMark: { width: 34, height: 34, borderRadius: 17 },
  numberText: {
    color: flowColors.ink,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
    letterSpacing: -0.4,
  },
  copy: { flex: 1, gap: 2 },
  title: {
    color: flowColors.white,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "800",
  },
  compactTitle: { fontSize: 15, lineHeight: 18 },
  detail: { color: flowColors.bodyText, fontSize: 13, lineHeight: 18 },
  compactDetail: { fontSize: 12, lineHeight: 15 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.992 }] },
  disabled: { opacity: 0.42 },
});

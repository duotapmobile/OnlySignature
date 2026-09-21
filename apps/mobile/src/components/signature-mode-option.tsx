import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { LayoutSlot } from "@/components/layout-slot";
import { flowColors } from "@/components/flow-ui";

export function SignatureModeOption({
  eyebrow,
  title,
  detail,
  onPress,
  disabled = false,
  layoutId,
}: {
  eyebrow?: string;
  title: string;
  detail: string;
  onPress: () => void;
  disabled?: boolean;
  layoutId: string;
}) {
  return (
    <LayoutSlot id={layoutId} style={styles.slot}>
      {eyebrow ? (
        <Text selectable style={styles.eyebrow}>
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
          pressed && styles.pressed,
          disabled && styles.disabled,
        ]}
      >
        <View style={styles.numberMark} accessibilityElementsHidden>
          <Text selectable={false} style={styles.numberText}>
            1+2
          </Text>
        </View>
        <View style={styles.copy}>
          <Text selectable style={styles.title}>
            {title}
          </Text>
          <Text selectable style={styles.detail}>
            {detail}
          </Text>
        </View>
        <Svg
          accessibilityElementsHidden
          width={18}
          height={18}
          viewBox="0 0 18 18"
        >
          <Path
            d="m6.75 3.75 5.25 5.25-5.25 5.25"
            fill="none"
            stroke={flowColors.white}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </Pressable>
    </LayoutSlot>
  );
}

const styles = StyleSheet.create({
  slot: { marginTop: 18, gap: 9 },
  eyebrow: {
    color: flowColors.goldText,
    fontFamily: "Georgia",
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
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
      "0 14px 28px rgba(2,4,10,0.34), inset 0 1px 0 rgba(255,255,255,0.18)",
  },
  numberMark: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: flowColors.gold,
  },
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
  detail: { color: flowColors.bodyText, fontSize: 13, lineHeight: 18 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.992 }] },
  disabled: { opacity: 0.42 },
});

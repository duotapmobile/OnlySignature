import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { LayoutSlot } from "@/components/layout-slot";

export function SignatureModeOption({
  title,
  detail,
  onPress,
  disabled = false,
  layoutId,
}: {
  title: string;
  detail: string;
  onPress: () => void;
  disabled?: boolean;
  layoutId: string;
}) {
  return (
    <LayoutSlot id={layoutId} style={styles.slot}>
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
            stroke="#071F5A"
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
  slot: { marginTop: 14 },
  card: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: "rgba(216,182,106,0.72)",
    backgroundColor: "#FBFAF5",
    boxShadow: "0 12px 28px rgba(7,31,90,0.18)",
  },
  numberMark: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D8B66A",
  },
  numberText: {
    color: "#071F5A",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
    letterSpacing: -0.4,
  },
  copy: { flex: 1, gap: 2 },
  title: {
    color: "#10234D",
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "800",
  },
  detail: { color: "#425269", fontSize: 13, lineHeight: 18 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.992 }] },
  disabled: { opacity: 0.42 },
});

import { Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "@/integrations/workspace";

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: readonly { value: T; label: string }[];
  onChange(value: T): void;
  label: string;
}) {
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={label}
      style={styles.row}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={option.label}
            onPress={() => onChange(option.value)}
            style={[styles.segment, selected && styles.selected]}
          >
            <Text
              allowFontScaling
              style={[styles.text, selected && styles.selectedText]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    backgroundColor: "#DCE7EA",
    borderRadius: theme.radii.md,
    padding: 4,
  },
  segment: {
    flex: 1,
    minHeight: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: theme.radii.sm,
    paddingHorizontal: 10,
  },
  selected: {
    backgroundColor: theme.colors.primary,
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 5,
    elevation: 2,
  },
  text: { color: theme.colors.text, fontSize: 17, fontWeight: "700" },
  selectedText: { color: theme.colors.white },
});

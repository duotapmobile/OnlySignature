import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { formatLabel, type ExportFormat } from "@/domain/models";
import { theme } from "@/integrations/workspace";

export function FormatDropdown({
  label,
  value,
  formats,
  onChange,
}: {
  label: string;
  value: ExportFormat;
  formats: ExportFormat[];
  onChange(value: ExportFormat): void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label} format. ${formatLabel[value]}`}
        accessibilityHint="Opens the format choices"
        onPress={() => setOpen(true)}
        style={styles.trigger}
      >
        <Text style={styles.triggerText}>{formatLabel[value]}</Text>
        <Text style={styles.chevron}>⌄</Text>
      </Pressable>
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.backdrop}>
          <View accessibilityViewIsModal style={styles.dialog}>
            <Text accessibilityRole="header" style={styles.dialogTitle}>
              Choose {label.toLowerCase()} format
            </Text>
            {formats.map((format) => (
              <Pressable
                key={format}
                accessibilityRole="radio"
                accessibilityState={{ selected: format === value }}
                onPress={() => {
                  onChange(format);
                  setOpen(false);
                }}
                style={[styles.option, format === value && styles.selected]}
              >
                <Text
                  style={[
                    styles.optionText,
                    format === value && styles.selectedText,
                  ]}
                >
                  {formatLabel[format]}
                </Text>
                {format === value ? <Text style={styles.check}>✓</Text> : null}
              </Pressable>
            ))}
            <Pressable
              accessibilityRole="button"
              onPress={() => setOpen(false)}
              style={styles.cancel}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: 8 },
  label: { color: theme.colors.text, fontSize: 20, fontWeight: "800" },
  trigger: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: "#9BB2BD",
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.white,
  },
  triggerText: { color: theme.colors.text, fontSize: 18, fontWeight: "600" },
  chevron: { color: theme.colors.primary, fontSize: 28, fontWeight: "800" },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(2,17,24,0.66)",
    justifyContent: "center",
    padding: 24,
  },
  dialog: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.lg,
    padding: 20,
    gap: 8,
  },
  dialogTitle: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 8,
  },
  option: {
    minHeight: 56,
    paddingHorizontal: 14,
    borderRadius: theme.radii.sm,
    borderWidth: 1,
    borderColor: "#B8C7CD",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  optionText: { color: theme.colors.text, fontSize: 17, fontWeight: "600" },
  selectedText: { color: theme.colors.white },
  check: { color: theme.colors.white, fontSize: 20, fontWeight: "900" },
  cancel: {
    minHeight: 52,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  cancelText: { color: theme.colors.primary, fontSize: 18, fontWeight: "700" },
});

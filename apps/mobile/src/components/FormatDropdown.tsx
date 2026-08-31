import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import {
  formatControlAccessibilityLabel,
  formatLabel,
  type ExportFormat,
} from "@/domain/models";
import { flowColors } from "./flow-ui";

function Chevron({ up = false }: { up?: boolean }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20">
      <Path
        d={up ? "m5 12 5-5 5 5" : "m5 8 5 5 5-5"}
        fill="none"
        stroke={flowColors.accessibleLink}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function SelectedMark() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20">
      <Path
        d="m4.5 10 3.5 3.5 7.5-8"
        fill="none"
        stroke={flowColors.white}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

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
        accessibilityLabel={formatControlAccessibilityLabel(label, value)}
        accessibilityHint="Opens the format choices"
        onPress={() => setOpen(true)}
        style={styles.trigger}
      >
        <Text style={styles.triggerText}>{formatLabel[value]}</Text>
        <Chevron />
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
                accessibilityState={{ checked: format === value }}
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
                {format === value ? <SelectedMark /> : null}
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
  label: {
    color: flowColors.cardText,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "800",
  },
  trigger: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#A8B9C0",
    borderRadius: 14,
    backgroundColor: flowColors.card,
  },
  triggerText: {
    color: flowColors.cardText,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "600",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(2,11,18,0.72)",
    justifyContent: "center",
    padding: 24,
  },
  dialog: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    backgroundColor: flowColors.card,
    borderRadius: 18,
    padding: 18,
    gap: 8,
  },
  dialogTitle: {
    color: flowColors.cardText,
    fontSize: 22,
    lineHeight: 27,
    fontWeight: "800",
    marginBottom: 8,
  },
  option: {
    minHeight: 54,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#B8C7CD",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selected: {
    backgroundColor: "#086F84",
    borderColor: "#086F84",
  },
  optionText: {
    color: flowColors.cardText,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "600",
  },
  selectedText: { color: flowColors.white },
  cancel: {
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6,
  },
  cancelText: {
    color: flowColors.accessibleLink,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "700",
  },
});

import { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import {
  formatControlAccessibilityLabel,
  formatLabel,
  type ExportFormat,
} from "@/domain/models";
import { flowColors } from "./flow-ui";
import { hapticSelection } from "@/services/haptics";
import { useReducedMotion } from "react-native-reanimated";
import { FocusPressable as Pressable } from "./FocusPressable";

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
        stroke="#FFFDF7"
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
  disabled = false,
}: {
  label: string;
  value: ExportFormat;
  formats: ExportFormat[];
  onChange(value: ExportFormat): void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const reducedMotion = useReducedMotion();
  const { fontScale } = useWindowDimensions();
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={formatControlAccessibilityLabel(label, value)}
        accessibilityHint="Opens the format choices"
        accessibilityState={{ expanded: open, disabled }}
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.trigger,
          pressed && styles.pressed,
          disabled && styles.disabled,
        ]}
      >
        <Text
          numberOfLines={fontScale > 1.15 ? undefined : 1}
          adjustsFontSizeToFit={fontScale <= 1.15}
          minimumFontScale={0.86}
          style={styles.triggerText}
        >
          {formatLabel[value]}
        </Text>
        <View style={styles.chevron}>
          <Chevron />
        </View>
      </Pressable>
      <Modal
        visible={open}
        transparent
        animationType={reducedMotion ? "none" : "fade"}
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.backdrop}>
          <ScrollView
            accessibilityViewIsModal
            style={styles.dialog}
            contentContainerStyle={styles.dialogContent}
          >
            <Text accessibilityRole="header" style={styles.dialogTitle}>
              Choose {label.toLowerCase()} format
            </Text>
            {formats.map((format) => (
              <Pressable
                key={format}
                accessibilityRole="radio"
                accessibilityState={{ checked: format === value }}
                onPress={() => {
                  void hapticSelection();
                  onChange(format);
                  setOpen(false);
                }}
                style={({ pressed }) => [
                  styles.option,
                  format === value && styles.selected,
                  pressed && styles.pressed,
                ]}
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
          </ScrollView>
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
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#BDB295",
    borderRadius: 14,
    backgroundColor: flowColors.card,
  },
  triggerText: {
    flex: 1,
    color: flowColors.cardText,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "600",
  },
  chevron: {
    width: 24,
    marginLeft: 10,
    alignItems: "flex-end",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(2,4,10,0.78)",
    justifyContent: "center",
    padding: 24,
  },
  dialog: {
    flexGrow: 0,
    width: "100%",
    maxWidth: 480,
    maxHeight: "90%",
    alignSelf: "center",
    backgroundColor: flowColors.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: flowColors.cyan,
  },
  dialogContent: { padding: 18, gap: 8 },
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
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CFC6AD",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selected: {
    backgroundColor: "#071F5A",
    borderColor: "#071F5A",
  },
  optionText: {
    flexShrink: 1,
    color: flowColors.cardText,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "600",
  },
  selectedText: { color: flowColors.white },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.55 },
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

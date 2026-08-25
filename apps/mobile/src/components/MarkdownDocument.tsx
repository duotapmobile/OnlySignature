import { StyleSheet, Text, View } from "react-native";
import { theme } from "@/integrations/workspace";

export function MarkdownDocument({ markdown }: { markdown: string }) {
  const blocks = markdown.replace(/\r/g, "").split("\n");
  return (
    <View accessibilityRole="text">
      {blocks.map((line, index) => {
        if (!line.trim()) return <View key={index} style={styles.space} />;
        const heading = line.match(/^(#{1,3})\s+(.+)$/);
        if (heading)
          return (
            <Text
              key={index}
              accessibilityRole="header"
              selectable
              style={heading[1]?.length === 1 ? styles.h1 : styles.heading}
            >
              {heading[2]}
            </Text>
          );
        if (/^[-*]\s+/.test(line))
          return (
            <View key={index} style={styles.bulletRow}>
              <Text style={styles.bullet}>•</Text>
              <Text selectable style={styles.body}>
                {line.replace(/^[-*]\s+/, "")}
              </Text>
            </View>
          );
        return (
          <Text key={index} selectable style={styles.body}>
            {line.replace(/\*\*/g, "").replace(/`/g, "")}
          </Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  h1: {
    color: theme.colors.text,
    fontSize: 26,
    lineHeight: 33,
    fontWeight: "900",
    marginBottom: 8,
  },
  heading: {
    color: theme.colors.text,
    fontSize: 21,
    lineHeight: 28,
    fontWeight: "800",
    marginTop: 12,
    marginBottom: 4,
  },
  body: {
    color: theme.colors.muted,
    fontSize: 17,
    lineHeight: 25,
    flexShrink: 1,
  },
  space: { height: 8 },
  bulletRow: { flexDirection: "row", gap: 9, paddingLeft: 4, marginBottom: 4 },
  bullet: { color: theme.colors.primary, fontSize: 20, fontWeight: "900" },
});

import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { FlowBackButton, FlowHeading, FlowScreen, flowColors } from "./flow-ui";

export function InfoPage({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <FlowScreen contentStyle={styles.content}>
      <View style={styles.back}>
        <FlowBackButton onPress={() => router.back()} />
      </View>
      <FlowHeading>{title}</FlowHeading>
      <View style={styles.card}>{children}</View>
    </FlowScreen>
  );
}
export function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <>
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      <Text selectable style={styles.body}>
        {children}
      </Text>
    </>
  );
}
const styles = StyleSheet.create({
  content: { paddingTop: 28 },
  back: { height: 32, alignSelf: "flex-start" },
  card: {
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D6E0E3",
    backgroundColor: flowColors.card,
    padding: 18,
  },
  title: {
    color: flowColors.cardText,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800",
    marginTop: 12,
    marginBottom: 4,
  },
  body: {
    color: flowColors.cardMuted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  link: {
    color: flowColors.accessibleLink,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});
export const infoStyles = styles;

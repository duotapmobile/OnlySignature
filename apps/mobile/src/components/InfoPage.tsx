import type { ReactNode } from "react";
import { StyleSheet, Text } from "react-native";
import { router } from "expo-router";
import { BackLink, GlassCard, Heading, Screen } from "./ui";
import { theme } from "@/integrations/workspace";

export function InfoPage({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Screen>
      <Heading>{title}</Heading>
      <GlassCard>{children}</GlassCard>
      <BackLink onPress={() => router.back()} />
    </Screen>
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
  title: {
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
    marginBottom: 8,
  },
  link: {
    color: theme.colors.primary,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});
export const infoStyles = styles;

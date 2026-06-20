import { StyleSheet, TextStyle } from "react-native";
import {
  COLORS,
  RADIUS,
  SHADOWS,
  SPACING,
  TYPOGRAPHY,
} from "@/constants/theme";

export const authStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    padding: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    ...SHADOWS.card,
  },
  title: {
    ...(TYPOGRAPHY.h1 as TextStyle),
    color: COLORS.onSurface,
    textAlign: "center",
    marginBottom: SPACING.xs,
  },
  subtitle: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
    marginBottom: SPACING.xl,
  },
  label: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    fontWeight: "600",
    color: COLORS.onSurface,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: RADIUS.md,
    height: 48,
    paddingHorizontal: SPACING.md,
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    color: COLORS.onSurface,
    marginBottom: SPACING.lg,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: SPACING.md,
  },
  buttonDisabled: {
    backgroundColor: COLORS.neutralLight,
    opacity: 0.7,
  },
  buttonText: {
    color: COLORS.onPrimary,
    ...(TYPOGRAPHY.button as TextStyle),
  },
  link: {
    marginTop: SPACING.xl,
    alignItems: "center",
  },
  linkText: {
    color: COLORS.onSurfaceVariant,
    ...(TYPOGRAPHY.bodySm as TextStyle),
  },
  linkTextBold: {
    color: COLORS.primary,
    fontWeight: "600",
  },
});

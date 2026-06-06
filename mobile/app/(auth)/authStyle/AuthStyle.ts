// styles/authStyles.ts
import { StyleSheet, TextStyle } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '@/constants/theme';

export const authStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg, // Corregido: antes ROUNDNESS.lg
    padding: SPACING.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    ...(TYPOGRAPHY.h1 as TextStyle), // Corregido: usa tu escala tipográfica real h1 (36px)
    color: COLORS.onSurface,          // Corregido: antes COLORS.textPrimary
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    ...(TYPOGRAPHY.bodyMd as TextStyle), // Corregido: antes FONT_SIZES.md
    color: COLORS.onSurfaceVariant,      // Corregido: antes COLORS.textSecondary
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  label: {
    ...(TYPOGRAPHY.bodySm as TextStyle), // Corregido: antes FONT_SIZES.sm
    fontWeight: '600',
    color: COLORS.onSurface,             // Corregido: antes COLORS.textPrimary
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,  // Corregido: antes COLORS.border
    borderRadius: RADIUS.md,             // Corregido: antes ROUNDNESS.md
    height: 48,
    paddingHorizontal: SPACING.md,
    ...(TYPOGRAPHY.bodyMd as TextStyle), // Corregido: antes FONT_SIZES.md
    color: COLORS.onSurface,             // Corregido: antes COLORS.textPrimary
    marginBottom: SPACING.lg,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,             // Corregido: antes ROUNDNESS.md
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  buttonDisabled: {
    backgroundColor: COLORS.neutralLight, // Corregido: antes COLORS.textSecondary
    opacity: 0.7,
  },
  buttonText: {
    color: COLORS.onPrimary,              // Corregido: antes COLORS.textLight
    ...(TYPOGRAPHY.button as TextStyle),  // Corregido: antes FONT_SIZES.md genérico
  },
  link: {
    marginTop: SPACING.xl,
    alignItems: 'center',
  },
  linkText: {
    color: COLORS.onSurfaceVariant,      // Corregido: antes COLORS.textSecondary
    ...(TYPOGRAPHY.bodySm as TextStyle), // Corregido: antes FONT_SIZES.sm
  },
  linkTextBold: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
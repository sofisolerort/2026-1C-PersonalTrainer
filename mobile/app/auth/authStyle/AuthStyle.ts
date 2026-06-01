// styles/authStyles.ts
import { COLORS, FONT_SIZES, ROUNDNESS, SPACING } from '@/constants/theme';
import { StyleSheet } from 'react-native';


export const authStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDNESS.lg,
    padding: SPACING.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: ROUNDNESS.md,
    height: 48,
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: ROUNDNESS.md,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  buttonDisabled: {
    backgroundColor: COLORS.textSecondary,
    opacity: 0.7,
  },
  buttonText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  link: {
    marginTop: SPACING.xl,
    alignItems: 'center',
  },
  linkText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
  },
  linkTextBold: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
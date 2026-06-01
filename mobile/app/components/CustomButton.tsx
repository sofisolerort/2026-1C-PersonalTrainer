// components/CustomButton.tsx
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps, ActivityIndicator } from 'react-native';
import { COLORS, FONT_SIZES, ROUNDNESS, SPACING } from '@/constants/theme';

interface CustomButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
}

export const CustomButton: React.FC<CustomButtonProps> = ({ title, loading = false, disabled, style, ...restProps }) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        (disabled || loading) && styles.buttonDisabled,
        style // Permite sobreescribir o añadir estilos externos si fuera necesario
      ]}
      disabled={disabled || loading}
      {...restProps}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.textLight} />
      ) : (
        <Text style={styles.buttonText}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
});
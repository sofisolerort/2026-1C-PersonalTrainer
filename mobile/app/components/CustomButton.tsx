import React from 'react';
import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps, ActivityIndicator, TextStyle } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '@/constants/theme';

interface CustomButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
}

export const CustomButton: React.FC<CustomButtonProps> = ({ 
  title, 
  loading = false, 
  disabled, 
  style, 
  ...restProps 
}) => {
  const isButtonDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isButtonDisabled && styles.buttonDisabled,
        style 
      ]}
      disabled={isButtonDisabled}
      activeOpacity={0.8}
      {...restProps}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.onPrimary} />
      ) : (
        <Text style={styles.buttonText}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    height: 50,
    justifyContent: 'center', // Arreglado el error que rompía el StyleSheet
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  buttonDisabled: {
    backgroundColor: COLORS.neutralLight,
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.onPrimary,
    ...(TYPOGRAPHY.button as TextStyle), 
  },
});
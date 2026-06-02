import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '@/constants/theme';

interface CustomInputProps extends TextInputProps {
  label: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export const CustomInput: React.FC<CustomInputProps> = ({ 
  label, 
  containerStyle, 
  style, 
  ...restProps 
 }) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor={COLORS.onSurfaceVariant}
        {...restProps}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
    width: '100%',
  },
  label: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.onSurface,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: RADIUS.md,
    height: 48,
    paddingHorizontal: SPACING.md,
    color: COLORS.onSurface,
    ...(TYPOGRAPHY.bodyMd as TextStyle),
  },
});
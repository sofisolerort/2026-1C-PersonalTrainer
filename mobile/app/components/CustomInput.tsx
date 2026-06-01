// components/CustomInput.tsx
import { COLORS, FONT_SIZES, ROUNDNESS, SPACING } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';


// Nuestra interfaz hereda absolutamente todo lo que tiene un TextInput nativo
interface CustomInputProps extends TextInputProps {
  label: string;
}

export const CustomInput: React.FC<CustomInputProps> = ({ label, ...restProps }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholderTextColor={COLORS.textSecondary}
        {...restProps} // Con el operador rest esparcimos el resto de las props nativas automáticamente
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
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
  },
});
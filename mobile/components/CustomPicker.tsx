import React from "react";
import { View, Text, StyleSheet, TextStyle } from "react-native";
import { Picker } from "@react-native-picker/picker";

import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from "@/constants/theme";

type Props<T> = {
  label: string;
  selectedValue: T;
  onValueChange: (value: T) => void;
  items: { label: string; value: T }[];
  error?: string;
};

export default function CustomPicker<T>({
  label,
  selectedValue,
  onValueChange,
  items,
  error,
}: Props<T>) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.wrapper}>
        <Picker
          selectedValue={selectedValue}
          onValueChange={(value) => onValueChange(value)}
          dropdownIconColor={COLORS.onSurface}
          style={styles.picker}
        >
          {items.map((item) => (
            <Picker.Item
              key={String(item.value)}
              label={item.label}
              value={item.value}
            />
          ))}
        </Picker>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: SPACING.md,
  },

  label: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    color: COLORS.onSurface,
    marginBottom: SPACING.xs,
    fontWeight: "600",
  },

  wrapper: {
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    overflow: "hidden",
  },

  picker: {
    color: COLORS.onSurface,
  },

  error: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
});
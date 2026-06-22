import { TouchableOpacity, Text, StyleSheet, TextStyle } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from "@/constants/theme";

type Props = {
  label?: string;
  onPress: () => void;
  disabled?: boolean;
};

// Botón de "volver" reutilizable: pill con flecha + texto, en color de marca.
export default function BackButton({
  label = "Volver",
  onPress,
  disabled,
}: Props) {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <MaterialIcons name="arrow-back" size={18} color={COLORS.primary} />
      <Text style={styles.text}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs,
    alignSelf: "center",
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    marginTop: SPACING.md,
  },
  text: {
    ...(TYPOGRAPHY.button as TextStyle),
    color: COLORS.primary,
  },
});

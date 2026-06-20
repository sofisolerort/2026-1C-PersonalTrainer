import {
  View,
  Text,
  Switch,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextStyle,
} from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from "@/constants/theme";

export default function ConfiguracionCliente() {
  const [notificaciones, setNotificaciones] = useState(true);
  const [modoOscuro, setModoOscuro] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.option}>
        <Text style={styles.optionText}>Notificaciones push</Text>
        <Switch value={notificaciones} onValueChange={setNotificaciones} />
      </View>
      <View style={styles.option}>
        <Text style={styles.optionText}>Modo oscuro</Text>
        <Switch value={modoOscuro} onValueChange={setModoOscuro} />
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => Alert.alert("Guardado", "Preferencias actualizadas")}
      >
        <Text style={styles.buttonText}>Guardar configuración</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>Volver</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  optionText: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    color: COLORS.onSurface,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: "center",
    marginTop: SPACING.lg,
  },
  buttonText: {
    ...(TYPOGRAPHY.button as TextStyle),
    color: COLORS.onPrimary,
  },
  backButton: { marginTop: SPACING.lg, alignItems: "center" },
  backText: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    color: COLORS.primary,
  },
});

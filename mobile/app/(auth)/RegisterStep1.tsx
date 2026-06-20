import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextStyle,
} from "react-native";
import { router } from "expo-router";
import { useRegister1 } from "../../hooks/auth/useRegister1";
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from "@/constants/theme";

export default function RegisterStep1() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    errors,
    validate,
  } = useRegister1();

  const handleNext = () => {
    if (validate()) {
      router.push({
        pathname: "/(auth)/RegisterStep2",
        params: { email, password },
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro - Paso 1</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={COLORS.onSurfaceVariant}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      {errors.email && <Text style={styles.error}>{errors.email}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor={COLORS.onSurfaceVariant}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {errors.password && <Text style={styles.error}>{errors.password}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Repetir contraseña"
        placeholderTextColor={COLORS.onSurfaceVariant}
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      {errors.confirmPassword && (
        <Text style={styles.error}>{errors.confirmPassword}</Text>
      )}

      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Siguiente</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.link}>Volver al login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  title: {
    ...(TYPOGRAPHY.h3 as TextStyle),
    color: COLORS.onSurface,
    marginBottom: SPACING.lg,
    textAlign: "center",
  },
  input: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: SPACING.md,
    marginBottom: SPACING.xs,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    color: COLORS.onSurface,
  },
  error: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.error,
    marginBottom: SPACING.sm,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: "center",
    marginTop: SPACING.sm,
  },
  buttonText: {
    ...(TYPOGRAPHY.button as TextStyle),
    color: COLORS.onPrimary,
  },
  link: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    marginTop: SPACING.md,
    textAlign: "center",
    color: COLORS.primary,
  },
});

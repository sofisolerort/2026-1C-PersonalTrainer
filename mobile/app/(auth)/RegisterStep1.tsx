import {
  Text,
  StyleSheet,
  TextStyle,
} from "react-native";
import { router } from "expo-router";

import { useRegister1 } from "../../hooks/auth/useRegister1";

import { KeyboardScreen } from "@/components/KeyboardScreen";
import BackButton from "@/components/BackButton";
import { CustomInput } from "@/components/CustomInput";
import { CustomButton } from "@/components/CustomButton";

import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
} from "@/constants/theme";

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
    <KeyboardScreen contentContainerStyle={styles.content}>
      <Text style={styles.title}>Registro - Paso 1</Text>

      <CustomInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="ejemplo@gmail.com"
        autoCapitalize="none"
        keyboardType="email-address"
      />
      {errors.email && <Text style={styles.error}>{errors.email}</Text>}

      <CustomInput
        label="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {errors.password && (
        <Text style={styles.error}>{errors.password}</Text>
      )}

      <CustomInput
        label="Repetir contraseña"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      {errors.confirmPassword && (
        <Text style={styles.error}>{errors.confirmPassword}</Text>
      )}

      <CustomButton
        title="Siguiente"
        onPress={handleNext}
      />

      <BackButton
        label="Volver al login"
        onPress={() => router.back()}
      />
    </KeyboardScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: "center",
  },
  title: {
    ...(TYPOGRAPHY.h3 as TextStyle),
    color: COLORS.onSurface,
    marginBottom: SPACING.xl,
    textAlign: "center",
  },
  error: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.error,
    marginBottom: SPACING.sm,
  },
});
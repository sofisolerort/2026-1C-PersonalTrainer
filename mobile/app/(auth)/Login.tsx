import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextStyle,
  Image,
} from "react-native";
import { router } from "expo-router";

import { useAuth } from "@/context/AuthContext";

import { KeyboardScreen } from "@/components/KeyboardScreen";
import { CustomInput } from "@/components/CustomInput";
import { CustomButton } from "@/components/CustomButton";

import {
  COLORS,
  SPACING,
  RADIUS,
  SHADOWS,
  TYPOGRAPHY,
} from "@/constants/theme";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (loading) return;

    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Ingresá email y contraseña");
      return;
    }

    setLoading(true);

    const { error } = await signIn(email.trim(), password);

    if (error) {
      Alert.alert("Error", error.message);
      setLoading(false);
      return;
    }

    setLoading(false);

    /*
      No buscamos session ni role acá.
      Eso ya lo maneja AuthContext.
      Mandamos al index y el index redirige según role.
    */
    router.replace("/");
  };

  return (
    <KeyboardScreen contentContainerStyle={styles.content}>
      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.appName}>FitnessApp</Text>

        <Text style={styles.subtitle}>
          Ingresá para continuar con tu entrenamiento
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Iniciar sesión</Text>

        <CustomInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="ejemplo@gmail.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <CustomInput
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          placeholder="Tu contraseña"
          secureTextEntry
        />

        <CustomButton
          title={loading ? "Ingresando..." : "Ingresar"}
          onPress={handleLogin}
          loading={loading}
          variant="primary"
          size="md"
        />

        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => router.push("/(auth)/RegisterStep1")}
          disabled={loading}
          activeOpacity={0.75}
        >
          <Text style={styles.registerText}>
            ¿No tenés cuenta?{" "}
            <Text style={styles.registerHighlight}>Registrate</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.background,
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: SPACING.xl,
  },

  logoCircle: {
    width: 112,
    height: 112,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    ...SHADOWS.card,
  },

  logo: {
    width: 76,
    height: 76,
  },

  appName: {
    ...(TYPOGRAPHY.h2 as TextStyle),
    color: COLORS.onSurface,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: SPACING.xs,
  },

  subtitle: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
    lineHeight: 21,
  },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    ...SHADOWS.card,
  },

  title: {
    ...(TYPOGRAPHY.h3 as TextStyle),
    color: COLORS.onSurface,
    marginBottom: SPACING.lg,
    textAlign: "center",
    fontWeight: "800",
  },

  registerButton: {
    marginTop: SPACING.lg,
    alignItems: "center",
  },

  registerText: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
  },

  registerHighlight: {
    color: COLORS.primary,
    fontWeight: "800",
  },
});
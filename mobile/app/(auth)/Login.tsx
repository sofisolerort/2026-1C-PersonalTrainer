import { useState } from "react";
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextStyle,
} from "react-native";
import { router } from "expo-router";

import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/utils/Supabase";

import { KeyboardScreen } from "@/components/KeyboardScreen";
import { CustomInput } from "@/components/CustomInput";
import { CustomButton } from "@/components/CustomButton";

import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
} from "@/constants/theme";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (loading) return;
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      Alert.alert("Error", error.message);
      setLoading(false);
      return;
    }

    // Tu lógica original (la dejamos igual)
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      Alert.alert("Error", "No se pudo obtener la sesión");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    const userRole = profile?.role;

    if (userRole === "entrenador") {
      router.replace("/(trainer)/Home");
    } else if (userRole === "cliente") {
      router.replace("/(client)/Home");
    } else {
      Alert.alert(
        "Aviso",
        "Tu cuenta no tiene un rol asignado. Contactá al administrador."
      );
      setLoading(false);
    }
  };

  return (
    <KeyboardScreen contentContainerStyle={styles.content}>
      <Text style={styles.title}>Iniciar Sesión</Text>

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
        secureTextEntry
      />

      <CustomButton
        title="Ingresar"
        onPress={handleLogin}
        loading={loading}
      />

      <TouchableOpacity
        onPress={() => router.push("/(auth)/RegisterStep1")}
        disabled={loading}
      >
        <Text style={styles.link}>
          ¿No tienes cuenta? Regístrate
        </Text>
      </TouchableOpacity>
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
  link: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    marginTop: SPACING.lg,
    textAlign: "center",
    color: COLORS.primary,
  },
});
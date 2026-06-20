import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextStyle,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../utils/Supabase";
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from "@/constants/theme";

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

    // Despues del signIn, pedir el rol directo a Supabase (no usar el context)
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) {
      Alert.alert("Error", "No se pudo obtener la sesion");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    const userRole = profile?.role;

    // Redirigir segun rol
    if (userRole === "entrenador") {
      router.replace("/(trainer)/Home");
    } else if (userRole === "cliente") {
      router.replace("/(client)/Home");
    } else {
      Alert.alert(
        "Aviso",
        "Tu cuenta no tiene un rol asignado. Contactá al administrador.",
      );
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión</Text>
      <TextInput
        placeholder="Email"
        placeholderTextColor={COLORS.onSurfaceVariant}
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
        editable={!loading}
      />
      <TextInput
        placeholder="Contraseña"
        placeholderTextColor={COLORS.onSurfaceVariant}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        editable={!loading}
      />
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.onPrimary} />
        ) : (
          <Text style={styles.buttonText}>Ingresar</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.push("/(auth)/RegisterStep1")}
        disabled={loading}
      >
        <Text style={styles.link}>¿No tienes cuenta? Regístrate</Text>
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
    marginBottom: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    color: COLORS.onSurface,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.6 },
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

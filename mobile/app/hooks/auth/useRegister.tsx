import { useState } from "react";
import { Alert } from "react-native";
import { supabase } from "@/app/utils/Supabase";

export const useRegister = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function signUpWithEmail() {
    if (!email.trim() || !password.trim()) {
      Alert.alert(
        "Campos obligatorios",
        "Debes completar email y contraseña."
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "Contraseña inválida",
        "La contraseña debe tener al menos 6 caracteres."
      );
      return;
    }

    try {
      setLoading(true);

      const {
        data: { session },
        error,
      } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error("Supabase Error:", error);

        Alert.alert(
          "Error al registrarse",
          error.message
        );
        return;
      }

      if (!session) {
        Alert.alert(
          "Registro exitoso",
          "Revisa tu correo electrónico para confirmar la cuenta."
        );
        return;
      }

      Alert.alert(
        "Registro exitoso",
        "Tu cuenta fue creada correctamente."
      );

    } catch (error) {
      console.error("Unexpected Error:", error);

      Alert.alert(
        "Error de conexión",
        "No se pudo conectar con el servidor. Verifica tu conexión a internet."
      );
    } finally {
      setLoading(false);
    }
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    signUpWithEmail,
  };
};
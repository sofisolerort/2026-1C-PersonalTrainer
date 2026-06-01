// hooks/useRegister.ts
import { useState } from "react";
import { Alert } from "react-native";
import { supabase } from "@/app/utils/Supabase";

export const useRegister = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signUpWithEmail() {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
      return;
    }

    setLoading(true);
    const { data: { session }, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      Alert.alert('Error', error.message);
    } else if (!session) {
      Alert.alert('Éxito', '¡Por favor verifica tu correo electrónico si está activado el flujo de confirmación!');
    }
    setLoading(false);
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
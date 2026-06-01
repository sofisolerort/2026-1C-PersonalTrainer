// hooks/useLogin.ts
import { useState } from "react";
import { Alert } from "react-native";
import { supabase } from "@/app/utils/Supabase";

export const useLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
      return;
    }
    
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      Alert.alert('Error', error.message);
    }
    setLoading(false);
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    signInWithEmail
  };
};
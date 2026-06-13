// hooks/useRegister2.ts
import { supabase } from "@/utils/Supabase";
import { useState } from "react";

import { Alert } from "react-native";

type FormData = {
  nombre_completo: string;
  fecha_nacimiento: string; // formato YYYY-MM-DD
  cant_dias_que_entrena: number;
  lugar_entrenamiento: string;
  objetivo: string;
  nivel: string;
};

type RegisterData = {
  email: string;
  password: string;
};

export const useRegister2 = (registerData: RegisterData) => {
  const [form, setForm] = useState<FormData>({
    nombre_completo: "",
    fecha_nacimiento: "",
    cant_dias_que_entrena: 3,
    lugar_entrenamiento: "gym",
    objetivo: "perdida de peso",
    nivel: "principiante",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {},
  );

  const updateField = <K extends keyof FormData>(
    field: K,
    value: FormData[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Limpiar error de ese campo si existe
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!form.nombre_completo.trim())
      newErrors.nombre_completo = "Nombre completo requerido";
    if (!form.fecha_nacimiento)
      newErrors.fecha_nacimiento = "Fecha de nacimiento requerida";
    if (form.cant_dias_que_entrena < 1 || form.cant_dias_que_entrena > 6)
      newErrors.cant_dias_que_entrena = "Selecciona entre 1 y 6 días";
    if (!form.lugar_entrenamiento)
      newErrors.lugar_entrenamiento = "Selecciona un lugar";
    if (!form.objetivo) newErrors.objetivo = "Selecciona un objetivo";
    if (!form.nivel) newErrors.nivel = "Selecciona un nivel";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const registerComplete = async (onSuccess: () => void) => {
    if (!validate()) return;

    setLoading(true);
    try {
      // 1. Crear usuario en Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp(
        {
          email: registerData.email,
          password: registerData.password,
        },
      );

      if (signUpError) throw new Error(signUpError.message);
      if (!authData.user) throw new Error("No se pudo crear el usuario");

      // 2. Iniciar sesión automáticamente (necesario para RLS)
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: registerData.email,
        password: registerData.password,
      });
      if (signInError)
        throw new Error(`Error al iniciar sesión: ${signInError.message}`);

      // 3. Insertar el perfil en la tabla profiles
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        email: registerData.email,
        nombre_completo: form.nombre_completo,
        fecha_nacimiento: form.fecha_nacimiento,
        role: "cliente", // Rol por defecto
        cant_dias_que_entrena: form.cant_dias_que_entrena,
        lugar_entrenamiento: form.lugar_entrenamiento,
        objetivo: form.objetivo,
        nivel: form.nivel,
      });

      if (profileError) {
        throw new Error(`Error al guardar perfil: ${profileError.message}`);
      }

      Alert.alert("Éxito", "Registro completado. Serás redirigido al inicio.");
      onSuccess(); // Redirige a la pantalla que le pases (home-cliente, login, etc.)
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    updateField,
    errors,
    loading,
    registerComplete,
  };
};

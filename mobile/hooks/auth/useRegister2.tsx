import { supabase } from "@/utils/Supabase";
import { useState } from "react";
import { Alert } from "react-native";

type FormData = {
  full_name: string;
  birth_date: string; // YYYY-MM-DD
  training_days: number;
  training_place: string;
  objective: string;
  level: string;
};

type RegisterData = {
  email: string;
  password: string;
};

export const useRegister2 = (registerData: RegisterData) => {
  const [form, setForm] = useState<FormData>({
    full_name: "",
    birth_date: "",
    training_days: 3,
    training_place: "gym",
    objective: "perdida de peso",
    level: "principiante",
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

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!form.full_name.trim()) {
      newErrors.full_name = "Nombre completo requerido";
    }

    if (!form.birth_date) {
      newErrors.birth_date = "Fecha de nacimiento requerida";
    }

    if (form.training_days < 1 || form.training_days > 6) {
      newErrors.training_days = "Selecciona entre 1 y 6 días";
    }

    if (!form.training_place) {
      newErrors.training_place = "Selecciona un lugar";
    }

    if (!form.objective) {
      newErrors.objective = "Selecciona un objetivo";
    }

    if (!form.level) {
      newErrors.level = "Selecciona un nivel";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const registerComplete = async (onSuccess: () => void) => {
    if (!validate()) return;

    setLoading(true);

    try {
      // 1) Crear usuario en auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp(
        {
          email: registerData.email,
          password: registerData.password,
        },
      );

      if (signUpError) {
        throw new Error(signUpError.message);
      }

      if (!authData.user) {
        throw new Error("No se pudo crear el usuario");
      }

      // 2) Login automático
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: registerData.email,
        password: registerData.password,
      });

      if (signInError) {
        throw new Error(`Error al iniciar sesión: ${signInError.message}`);
      }

      // 3) Buscar al entrenador por rol. Si todavía no existe ningún entrenador (ej: al registrar al propio trainer), trainer_id queda null.
      const { data: trainer } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "entrenador")
        .limit(1)
        .maybeSingle();

      const trainerId = trainer?.id ?? null;

      // 4) Crear perfil
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        email: registerData.email,
        full_name: form.full_name,
        birth_date: form.birth_date,
        role: "cliente",
        trainer_id: trainerId,

        training_days: form.training_days,
        training_place: form.training_place,
        objective: form.objective,
        level: form.level,
      });

      if (profileError) {
        throw new Error(`Error al guardar perfil: ${profileError.message}`);
      }

      Alert.alert("Éxito", "Registro completado. Serás redirigido al inicio.");

      onSuccess();
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

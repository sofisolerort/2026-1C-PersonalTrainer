import {
  Text,
  StyleSheet,
  TextStyle,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useState } from "react";

import { useRegister2 } from "../../hooks/auth/useRegister2";

import { KeyboardScreen } from "@/components/KeyboardScreen";
import BackButton from "@/components/BackButton";
import CustomPicker from "@/components/CustomPicker";
import { CustomButton } from "@/components/CustomButton";
import { CustomInput } from "@/components/CustomInput";

import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
} from "@/constants/theme";

export default function RegisterStep2() {
  const { email, password } = useLocalSearchParams<{
    email: string;
    password: string;
  }>();

  const { form, updateField, errors, loading, registerComplete } =
    useRegister2({ email, password });

  const [showDatePicker, setShowDatePicker] = useState(false);

  if (!email || !password) {
    router.replace("/(auth)/RegisterStep1");
    return null;
  }

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);

    if (selectedDate) {
      const formatted = selectedDate.toISOString().split("T")[0];
      updateField("birth_date", formatted);
    }
  };

  const handleFinalRegister = async () => {
    try {
      await registerComplete(() => {
        router.replace("/(auth)/Login");
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo completar el registro";

      Alert.alert("Error", message);
    }
  };

  return (
    <KeyboardScreen contentContainerStyle={styles.content}>
      <Text style={styles.title}>Registro - Paso 2</Text>

      {/* NAME */}
      <CustomInput
        label="Nombre completo"
        value={form.full_name}
        onChangeText={(v) => updateField("full_name", v)}
        placeholder="Juan Pérez"
      />
      {errors.full_name && (
        <Text style={styles.error}>{errors.full_name}</Text>
      )}

      {/* PHONE */}
      <CustomInput
        label="Teléfono"
        value={form.phone}
        onChangeText={(v) => updateField("phone", v)}
        placeholder="11 1234 5678"
        keyboardType="phone-pad"
      />
      {errors.phone && (
        <Text style={styles.error}>{errors.phone}</Text>
      )}

      {/* DATE */}
      <Text style={styles.label}>Fecha de nacimiento</Text>

      <CustomButton
        title={form.birth_date || "Seleccionar fecha"}
        onPress={() => setShowDatePicker(true)}
      />

      {showDatePicker && (
        <DateTimePicker
          value={
            form.birth_date
              ? new Date(form.birth_date)
              : new Date()
          }
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      {errors.birth_date && (
        <Text style={styles.error}>{errors.birth_date}</Text>
      )}

      {/* DAYS */}
      <CustomPicker
        label="Días que entrenas por semana"
        selectedValue={form.training_days}
        onValueChange={(v) => updateField("training_days", v)}
        items={[1, 2, 3, 4, 5, 6].map((d) => ({
          label: d.toString(),
          value: d,
        }))}
        error={errors.training_days}
      />

      {/* PLACE */}
      <CustomPicker
        label="Lugar de entrenamiento"
        selectedValue={form.training_place}
        onValueChange={(v) => updateField("training_place", v)}
        items={[
          { label: "Gimnasio", value: "gym" },
          { label: "Casa", value: "casa" },
          { label: "Parque", value: "parque" },
        ]}
      />

      {/* OBJECTIVE */}
      <CustomPicker
        label="Objetivo principal"
        selectedValue={form.objective}
        onValueChange={(v) => updateField("objective", v)}
        items={[
          { label: "Pérdida de peso", value: "perdida de peso" },
          { label: "Aumento de masa muscular", value: "aumento de masa muscular" },
          { label: "Mejorar resistencia", value: "mejorar resistencia" },
        ]}
      />

      {/* LEVEL */}
      <CustomPicker
        label="Nivel"
        selectedValue={form.level}
        onValueChange={(v) => updateField("level", v)}
        items={[
          { label: "Principiante", value: "principiante" },
          { label: "Intermedio", value: "intermedio" },
          { label: "Avanzado", value: "avanzado" },
        ]}
      />

      {/* SUBMIT */}
      <CustomButton
        title={loading ? "Registrando..." : "Completar registro"}
        onPress={handleFinalRegister}
        loading={loading}
      />

      <BackButton
        label="Volver"
        onPress={() => router.back()}
        disabled={loading}
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
  label: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    fontWeight: "600",
    color: COLORS.onSurface,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  error: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
});
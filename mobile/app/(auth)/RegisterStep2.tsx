import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextStyle,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { useRegister2 } from "../../hooks/auth/useRegister2";
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from "@/constants/theme";
import { KeyboardScreen } from "@/components/KeyboardScreen";
import BackButton from "@/components/BackButton";

export default function RegisterStep2() {
  const { email, password } = useLocalSearchParams<{
    email: string;
    password: string;
  }>();
  const { form, updateField, errors, loading, registerComplete } = useRegister2(
    { email, password },
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Si faltan datos del paso 1, redirigir al inicio del registro
  if (!email || !password) {
    router.replace("/(auth)/RegisterStep1");
    return null;
  }

  const onDateChange = (event: any, selectedDate?: Date) => {
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
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.message || "No se pudo completar el registro",
      );
    }
  };

  return (
    <KeyboardScreen>
      <Text style={styles.title}>Registro - Paso 2</Text>

      <Text style={styles.label}>Nombre completo</Text>
      <TextInput
        style={styles.input}
        value={form.full_name}
        onChangeText={(v) => updateField("full_name", v)}
        placeholder="Juan Pérez"
        placeholderTextColor={COLORS.onSurfaceVariant}
      />
      {errors.full_name && <Text style={styles.error}>{errors.full_name}</Text>}

      <Text style={styles.label}>Fecha de nacimiento</Text>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Text
          style={form.birth_date ? styles.dateText : styles.placeholderText}
        >
          {form.birth_date || "Seleccionar fecha"}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={form.birth_date ? new Date(form.birth_date) : new Date()}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
      {errors.birth_date && (
        <Text style={styles.error}>{errors.birth_date}</Text>
      )}

      <Text style={styles.label}>Días que entrenas por semana (1-6)</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={form.training_days}
          onValueChange={(v) => updateField("training_days", v)}
          itemStyle={styles.pickerItem}
        >
          {[1, 2, 3, 4, 5, 6].map((d) => (
            <Picker.Item key={d} label={d.toString()} value={d} />
          ))}
        </Picker>
      </View>
      {errors.training_days && (
        <Text style={styles.error}>{errors.training_days}</Text>
      )}

      <Text style={styles.label}>Lugar de entrenamiento</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={form.training_place}
          onValueChange={(v) => updateField("training_place", v)}
          itemStyle={styles.pickerItem}
        >
          <Picker.Item label="Gimnasio" value="gym" />
          <Picker.Item label="Casa" value="casa" />
          <Picker.Item label="Parque" value="parque" />
        </Picker>
      </View>

      <Text style={styles.label}>Objetivo principal</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={form.objective}
          onValueChange={(v) => updateField("objective", v)}
          itemStyle={styles.pickerItem}
        >
          <Picker.Item label="Pérdida de peso" value="perdida de peso" />
          <Picker.Item
            label="Aumento de masa muscular"
            value="aumento de masa muscular"
          />
          <Picker.Item
            label="Mejorar la resistencia"
            value="mejorar la resistencia"
          />
        </Picker>
      </View>

      <Text style={styles.label}>Nivel</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={form.level}
          onValueChange={(v) => updateField("level", v)}
          itemStyle={styles.pickerItem}
        >
          <Picker.Item label="Principiante" value="principiante" />
          <Picker.Item label="Intermedio" value="intermedio" />
          <Picker.Item label="Avanzado" value="avanzado" />
        </Picker>
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleFinalRegister}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Registrando..." : "Completar registro"}
        </Text>
      </TouchableOpacity>

      <BackButton
        label="Volver al paso 1"
        onPress={() => router.back()}
        disabled={loading}
      />
    </KeyboardScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    ...(TYPOGRAPHY.h3 as TextStyle),
    color: COLORS.onSurface,
    marginBottom: SPACING.lg,
    textAlign: "center",
  },
  label: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    fontWeight: "600",
    color: COLORS.onSurface,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  input: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    color: COLORS.onSurface,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceContainer,
  },
  dateText: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    color: COLORS.onSurface,
  },
  placeholderText: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    color: COLORS.onSurfaceVariant,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    overflow: "hidden",
    justifyContent: "center",
  },
  pickerItem: {
    color: COLORS.onSurface,
    fontSize: 16,
  },
  error: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: "center",
    marginTop: SPACING.xl,
  },
  buttonDisabled: {
    backgroundColor: COLORS.primaryLight,
  },
  buttonText: {
    ...(TYPOGRAPHY.button as TextStyle),
    color: COLORS.onPrimary,
  },
});

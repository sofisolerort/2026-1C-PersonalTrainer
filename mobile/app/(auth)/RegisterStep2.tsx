import {
  View,
  Text,
  StyleSheet,
  TextStyle,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";

import { useRegister2 } from "../../hooks/auth/useRegister2";

import { KeyboardScreen } from "@/components/KeyboardScreen";
import BackButton from "@/components/BackButton";
import CustomPicker from "@/components/CustomPicker";
import { CustomButton } from "@/components/CustomButton";
import { CustomInput } from "@/components/CustomInput";

import {
  COLORS,
  SPACING,
  RADIUS,
  SHADOWS,
  TYPOGRAPHY,
} from "@/constants/theme";

export default function RegisterStep2() {
  const { email, password } = useLocalSearchParams<{
    email: string;
    password: string;
  }>();

  const { form, updateField, errors, loading, registerComplete } = useRegister2({
    email,
    password,
  });

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
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <MaterialIcons
            name="assignment-ind"
            size={34}
            color={COLORS.onPrimary}
          />
        </View>

        <Text style={styles.appName}>FitnessApp</Text>

        <Text style={styles.subtitle}>
          Ahora completá tus datos físicos y de entrenamiento para personalizar
          tu rutina.
        </Text>
      </View>

      <View style={styles.stepsCard}>
        <View style={styles.stepCompleted}>
          <MaterialIcons name="check" size={18} color={COLORS.onPrimary} />
        </View>

        <View style={styles.stepLineActive} />

        <View style={styles.stepActive}>
          <Text style={styles.stepNumberActive}>2</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="person" size={21} color={COLORS.primary} />

          <Text style={styles.sectionTitle}>Datos personales</Text>
        </View>

        <Text style={styles.description}>
          Estos datos ayudan al entrenador a conocer mejor tu perfil.
        </Text>

        <CustomInput
          label="Nombre completo"
          value={form.full_name}
          onChangeText={(value) => updateField("full_name", value)}
          placeholder="Juan Pérez"
        />
        {errors.full_name && (
          <Text style={styles.error}>{errors.full_name}</Text>
        )}

        <CustomInput
          label="Teléfono"
          value={form.phone}
          onChangeText={(value) => updateField("phone", value)}
          placeholder="11 1234 5678"
          keyboardType="phone-pad"
        />
        {errors.phone && <Text style={styles.error}>{errors.phone}</Text>}

        <Text style={styles.label}>Fecha de nacimiento</Text>

        <CustomButton
          title={form.birth_date || "Seleccionar fecha"}
          onPress={() => setShowDatePicker(true)}
          variant="secondary"
          size="md"
        />

        {showDatePicker && (
          <DateTimePicker
            value={form.birth_date ? new Date(form.birth_date) : new Date()}
            mode="date"
            display="default"
            maximumDate={new Date()}
            onChange={onDateChange}
          />
        )}

        {errors.birth_date && (
          <Text style={styles.error}>{errors.birth_date}</Text>
        )}
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <MaterialIcons
            name="fitness-center"
            size={21}
            color={COLORS.primary}
          />

          <Text style={styles.sectionTitle}>Entrenamiento</Text>
        </View>

        <Text style={styles.description}>
          Contanos cómo entrenás para adaptar mejor el seguimiento.
        </Text>

        <CustomPicker
          label="Días que entrenás por semana"
          selectedValue={form.training_days}
          onValueChange={(value) => updateField("training_days", value)}
          items={[1, 2, 3, 4, 5, 6].map((day) => ({
            label: `${day} ${day === 1 ? "día" : "días"}`,
            value: day,
          }))}
          error={errors.training_days}
        />

        <CustomPicker
          label="Lugar de entrenamiento"
          selectedValue={form.training_place}
          onValueChange={(value) => updateField("training_place", value)}
          items={[
            { label: "Gimnasio", value: "gym" },
            { label: "Casa", value: "casa" },
            { label: "Parque", value: "parque" },
          ]}
        />

        <CustomPicker
          label="Objetivo principal"
          selectedValue={form.objective}
          onValueChange={(value) => updateField("objective", value)}
          items={[
            { label: "Pérdida de peso", value: "perdida de peso" },
            {
              label: "Aumento de masa muscular",
              value: "aumento de masa muscular",
            },
            { label: "Mejorar resistencia", value: "mejorar resistencia" },
          ]}
        />

        <CustomPicker
          label="Nivel"
          selectedValue={form.level}
          onValueChange={(value) => updateField("level", value)}
          items={[
            { label: "Principiante", value: "principiante" },
            { label: "Intermedio", value: "intermedio" },
            { label: "Avanzado", value: "avanzado" },
          ]}
        />
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <MaterialIcons
            name="healing"
            size={21}
            color={COLORS.primary}
          />

          <Text style={styles.sectionTitle}>Salud y limitaciones</Text>
        </View>

        <Text style={styles.description}>
          Opcional. Podés aclarar lesiones, molestias o ejercicios que preferís
          evitar.
        </Text>

        <CustomInput
          label="Lesiones o limitaciones"
          value={form.injuries}
          onChangeText={(value) => updateField("injuries", value)}
          placeholder="Ej: molestia en la rodilla derecha"
          multiline
        />
      </View>

      <View style={styles.summaryCard}>
        <MaterialIcons
          name="verified-user"
          size={22}
          color={COLORS.primary}
        />

        <Text style={styles.summaryText}>
          Al completar el registro, tu cuenta se crea como cliente y queda
          asociada al entrenador disponible.
        </Text>
      </View>

      <CustomButton
        title={loading ? "Registrando..." : "Completar registro"}
        onPress={handleFinalRegister}
        loading={loading}
        variant="primary"
        size="md"
      />

      <View style={styles.backWrapper}>
        <BackButton
          label="Volver"
          onPress={() => router.back()}
          disabled={loading}
        />
      </View>
    </KeyboardScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.background,
  },

  header: {
    alignItems: "center",
    marginBottom: SPACING.lg,
  },

  iconCircle: {
    width: 86,
    height: 86,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.md,
    ...SHADOWS.card,
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
    maxWidth: 330,
  },

  stepsCard: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: SPACING.lg,
  },

  stepCompleted: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  stepActive: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  stepLineActive: {
    width: 56,
    height: 2,
    backgroundColor: COLORS.primary,
  },

  stepNumberActive: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.onPrimary,
    fontWeight: "900",
  },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    ...SHADOWS.card,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },

  sectionTitle: {
    ...(TYPOGRAPHY.bodyLg as TextStyle),
    color: COLORS.onSurface,
    fontWeight: "900",
  },

  description: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.onSurfaceVariant,
    lineHeight: 19,
    marginBottom: SPACING.lg,
  },

  label: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    fontWeight: "700",
    color: COLORS.onSurface,
    marginBottom: SPACING.xs,
  },

  error: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.error,
    marginTop: -SPACING.xs,
    marginBottom: SPACING.sm,
    fontWeight: "700",
  },

  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    marginBottom: SPACING.lg,
  },

  summaryText: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.onSurfaceVariant,
    flex: 1,
    lineHeight: 18,
    fontWeight: "600",
  },

  backWrapper: {
    alignItems: "center",
    marginTop: SPACING.lg,
  },
});
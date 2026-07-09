import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextStyle,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

import { supabase } from "@/utils/Supabase";
import { CustomInput } from "@/components/CustomInput";
import { CustomButton } from "@/components/CustomButton";

import {
  COLORS,
  SPACING,
  RADIUS,
  SHADOWS,
  TYPOGRAPHY,
} from "@/constants/theme";

type RoutineDay = {
  id: string;
  day_number: number;
  day_name: string;
};

export default function CrearEjercicio() {
  const { dayId, weekNumber } = useLocalSearchParams<{
    dayId: string;
    weekNumber?: string;
  }>();

  const selectedWeek = Number(weekNumber ?? 1);

  const [day, setDay] = useState<RoutineDay | null>(null);

  const [name, setName] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [suggestedWeight, setSuggestedWeight] = useState("");
  const [rpe, setRpe] = useState("");
  const [rest, setRest] = useState("");

  const [loadingInitialData, setLoadingInitialData] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDay();
  }, [dayId]);

  const fetchDay = async () => {
    if (!dayId) {
      setLoadingInitialData(false);
      return;
    }

    setLoadingInitialData(true);

    const { data, error } = await supabase
      .from("routine_days")
      .select("id, day_number, day_name")
      .eq("id", dayId)
      .maybeSingle();

    if (error || !data) {
      setDay(null);
      setLoadingInitialData(false);
      return;
    }

    setDay(data);
    setLoadingInitialData(false);
  };

  const createExercise = async () => {
    if (!dayId) {
      Alert.alert("Error", "No se encontró el día");
      return;
    }

    if (!name.trim()) {
      Alert.alert("Error", "Ingresá el nombre del ejercicio");
      return;
    }

    if (!sets.trim() || !reps.trim()) {
      Alert.alert("Error", "Series y repeticiones son obligatorias");
      return;
    }

    const parsedSets = Number(sets);
    const parsedReps = Number(reps);

    if (Number.isNaN(parsedSets) || parsedSets <= 0) {
      Alert.alert("Error", "Las series deben ser un número mayor a 0");
      return;
    }

    if (Number.isNaN(parsedReps) || parsedReps <= 0) {
      Alert.alert("Error", "Las repeticiones deben ser un número mayor a 0");
      return;
    }

    const parsedWeight =
      suggestedWeight.trim() === ""
        ? null
        : Number(suggestedWeight.replace(",", "."));

    if (suggestedWeight.trim() !== "" && Number.isNaN(parsedWeight)) {
      Alert.alert("Error", "El peso debe ser un número válido");
      return;
    }

    const parsedRpe = rpe.trim() === "" ? null : Number(rpe.replace(",", "."));

    if (rpe.trim() !== "" && Number.isNaN(parsedRpe)) {
      Alert.alert("Error", "El RPE debe ser un número válido");
      return;
    }

    const parsedRest =
      rest.trim() === "" ? null : Number(rest.replace(",", "."));

    if (parsedRest !== null && (Number.isNaN(parsedRest) || parsedRest < 0)) {
      Alert.alert(
        "Error",
        "El descanso debe ser un número válido (en segundos)",
      );
      return;
    }

    setLoading(true);

    const { data: exerciseData, error: exerciseError } = await supabase
      .from("exercises")
      .insert({
        routine_day_id: dayId,
        name: name.trim(),
        notes: null,
      })
      .select("id")
      .single();

    if (exerciseError || !exerciseData) {
      setLoading(false);
      Alert.alert(
        "Error",
        exerciseError?.message ?? "No se pudo crear el ejercicio",
      );
      return;
    }

    const { error: progressionError } = await supabase
      .from("exercise_progressions")
      .insert({
        exercise_id: exerciseData.id,
        week_number: selectedWeek,
        sets: parsedSets,
        reps: parsedReps,
        suggested_weight: parsedWeight,
        rpe: parsedRpe,
        rest_seconds: parsedRest,
        hidden: false,
      });

    if (progressionError) {
      await supabase.from("exercises").delete().eq("id", exerciseData.id);

      setLoading(false);
      Alert.alert("Error", progressionError.message);
      return;
    }

    setLoading(false);

    Alert.alert("Éxito", "Ejercicio creado con su progresión inicial");
    router.back();
  };

  const previewText = () => {
    const setsText = sets.trim() || "-";
    const repsText = reps.trim() || "-";
    const weightText = suggestedWeight.trim()
      ? ` @ ${suggestedWeight.trim()} kg`
      : "";
    const rpeText = rpe.trim() ? ` · RPE ${rpe.trim()}` : "";
    const restText = rest.trim() ? ` · ${rest.trim()}s desc.` : "";

    return `${setsText}x${repsText}${weightText}${rpeText}${restText}`;
  };

  if (loadingInitialData) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!day) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>No se encontró el día</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.kicker}>Nuevo ejercicio</Text>

        <Text style={styles.title}>Cargar ejercicio</Text>

        <Text style={styles.subtitle}>
          Día {day.day_number}: {day.day_name}
        </Text>
      </View>

      <View style={styles.contextCard}>
        <View style={styles.contextIcon}>
          <MaterialIcons name="event-note" size={26} color={COLORS.onPrimary} />
        </View>

        <View style={styles.contextInfo}>
          <Text style={styles.contextTitle}>Semana {selectedWeek}</Text>

          <Text style={styles.contextDescription}>
            Este ejercicio se va a crear con una progresión inicial para esta
            semana.
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <MaterialIcons
            name="fitness-center"
            size={20}
            color={COLORS.primary}
          />

          <Text style={styles.sectionTitle}>Datos del ejercicio</Text>
        </View>

        <CustomInput
          label="Nombre del ejercicio"
          value={name}
          onChangeText={setName}
          placeholder="Ej: Sentadilla"
        />
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="trending-up" size={20} color={COLORS.primary} />

          <Text style={styles.sectionTitle}>Progresión inicial</Text>
        </View>

        <View style={styles.row}>
          <View style={styles.half}>
            <CustomInput
              label="Series"
              value={sets}
              onChangeText={setSets}
              placeholder="3"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.half}>
            <CustomInput
              label="Reps"
              value={reps}
              onChangeText={setReps}
              placeholder="3"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.half}>
            <CustomInput
              label="Peso inicial"
              value={suggestedWeight}
              onChangeText={setSuggestedWeight}
              placeholder="140"
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.half}>
            <CustomInput
              label="RPE"
              value={rpe}
              onChangeText={setRpe}
              placeholder="8"
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <CustomInput
          label="Descanso (segundos)"
          value={rest}
          onChangeText={setRest}
          placeholder="90"
          keyboardType="numeric"
        />

        <View style={styles.previewBox}>
          <Text style={styles.previewLabel}>Vista previa</Text>

          <Text style={styles.previewText}>{previewText()}</Text>
        </View>
      </View>

      <CustomButton
        title={loading ? "Creando..." : "Crear ejercicio"}
        variant="primary"
        size="md"
        onPress={createExercise}
        loading={loading}
      />

      <View style={styles.cancelWrapper}>
        <CustomButton
          title="Cancelar"
          variant="ghost"
          size="sm"
          fullWidth={false}
          onPress={() => router.back()}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },

  header: {
    marginBottom: SPACING.lg,
  },

  kicker: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.primary,
    fontWeight: "700",
    marginBottom: SPACING.xs,
  },

  title: {
    ...(TYPOGRAPHY.h2 as TextStyle),
    color: COLORS.onSurface,
    marginBottom: SPACING.xs,
  },

  subtitle: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    color: COLORS.onSurfaceVariant,
    fontWeight: "600",
  },

  contextCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    ...SHADOWS.card,
  },

  contextIcon: {
    width: 50,
    height: 50,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },

  contextInfo: {
    flex: 1,
  },

  contextTitle: {
    ...(TYPOGRAPHY.bodyLg as TextStyle),
    color: COLORS.onSurface,
    fontWeight: "800",
    marginBottom: SPACING.xs,
  },

  contextDescription: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.onSurfaceVariant,
    lineHeight: 19,
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
    marginBottom: SPACING.md,
  },

  sectionTitle: {
    ...(TYPOGRAPHY.bodyLg as TextStyle),
    color: COLORS.onSurface,
    fontWeight: "800",
  },

  row: {
    flexDirection: "row",
    gap: SPACING.md,
  },

  half: {
    flex: 1,
  },

  previewBox: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  previewLabel: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.onSurfaceVariant,
    marginBottom: SPACING.xs,
    fontWeight: "600",
  },

  previewText: {
    ...(TYPOGRAPHY.bodyLg as TextStyle),
    color: COLORS.onSurface,
    fontWeight: "900",
  },

  cancelWrapper: {
    alignItems: "center",
    marginTop: SPACING.md,
  },

  empty: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
  },
});

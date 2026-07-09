import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Switch,
  ScrollView,
  TextStyle,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";

import { supabase } from "@/utils/Supabase";
import { CustomInput } from "@/components/CustomInput";
import { CustomButton } from "@/components/CustomButton";

import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from "@/constants/theme";

type Exercise = {
  id: string;
  name: string;
  notes: string | null;
};

type ExerciseProgression = {
  id: string;
  exercise_id: string;
  week_number: number;
  sets: number;
  reps: number;
  suggested_weight: number | null;
  rpe: number | null;
  rest_seconds: number | null;
  hidden: boolean | null;
};

export default function EditarProgresion() {
  const { exerciseId, weekNumber } = useLocalSearchParams<{
    exerciseId: string;
    weekNumber?: string;
  }>();

  const selectedWeek = Number(weekNumber ?? 1);

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [progressionId, setProgressionId] = useState<string | null>(null);

  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [suggestedWeight, setSuggestedWeight] = useState("");
  const [rpe, setRpe] = useState("");
  const [rest, setRest] = useState("");
  const [hidden, setHidden] = useState(false);

  const [loadingInitialData, setLoadingInitialData] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, [exerciseId, selectedWeek]);

  const fetchInitialData = async () => {
    if (!exerciseId) {
      setLoadingInitialData(false);
      return;
    }

    setLoadingInitialData(true);

    const { data: exerciseData, error: exerciseError } = await supabase
      .from("exercises")
      .select("id, name, notes")
      .eq("id", exerciseId)
      .maybeSingle();

    if (exerciseError || !exerciseData) {
      setExercise(null);
      setLoadingInitialData(false);
      return;
    }

    setExercise(exerciseData);

    const { data: progressionData, error: progressionError } = await supabase
      .from("exercise_progressions")
      .select("*")
      .eq("exercise_id", exerciseId)
      .eq("week_number", selectedWeek)
      .maybeSingle();

    if (progressionError) {
      Alert.alert("Error", progressionError.message);
      setLoadingInitialData(false);
      return;
    }

    if (progressionData) {
      const progression = progressionData as ExerciseProgression;

      setProgressionId(progression.id);
      setSets(String(progression.sets));
      setReps(String(progression.reps));
      setSuggestedWeight(
        progression.suggested_weight !== null
          ? String(progression.suggested_weight)
          : "",
      );
      setRpe(progression.rpe !== null ? String(progression.rpe) : "");
      setRest(
        progression.rest_seconds !== null
          ? String(progression.rest_seconds)
          : "",
      );
      setHidden(progression.hidden ?? false);
    } else {
      setProgressionId(null);
      setSets("");
      setReps("");
      setSuggestedWeight("");
      setRpe("");
      setRest("");
      setHidden(false);
    }

    setLoadingInitialData(false);
  };

  const saveProgression = async () => {
    if (!exerciseId) {
      Alert.alert("Error", "No se encontró el ejercicio");
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
      suggestedWeight.trim() === "" ? null : Number(suggestedWeight);

    if (suggestedWeight.trim() !== "" && Number.isNaN(parsedWeight)) {
      Alert.alert("Error", "El peso sugerido debe ser un número válido");
      return;
    }

    const parsedRpe = rpe.trim() === "" ? null : Number(rpe);

    if (rpe.trim() !== "" && Number.isNaN(parsedRpe)) {
      Alert.alert("Error", "El RPE debe ser un número válido");
      return;
    }

    const parsedRest = rest.trim() === "" ? null : Number(rest);

    if (parsedRest !== null && (Number.isNaN(parsedRest) || parsedRest < 0)) {
      Alert.alert(
        "Error",
        "El descanso debe ser un número válido (en segundos)",
      );
      return;
    }

    setSaving(true);

    const payload = {
      exercise_id: exerciseId,
      week_number: selectedWeek,
      sets: parsedSets,
      reps: parsedReps,
      suggested_weight: parsedWeight,
      rpe: parsedRpe,
      rest_seconds: parsedRest,
      hidden,
    };

    if (progressionId) {
      const { error } = await supabase
        .from("exercise_progressions")
        .update(payload)
        .eq("id", progressionId);

      setSaving(false);

      if (error) {
        Alert.alert("Error", error.message);
        return;
      }

      Alert.alert("Éxito", "Progresión actualizada");
      router.back();
      return;
    }

    const { error } = await supabase
      .from("exercise_progressions")
      .insert(payload);

    setSaving(false);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    Alert.alert("Éxito", "Progresión creada");
    router.back();
  };

  if (loadingInitialData) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!exercise) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>No se encontró el ejercicio</Text>
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
      <Text style={styles.title}>Editar Progresión</Text>

      <Text style={styles.exerciseName}>{exercise.name}</Text>

      <Text style={styles.weekText}>Semana {selectedWeek}</Text>

      {exercise.notes ? (
        <Text style={styles.notes}>Notas: {exercise.notes}</Text>
      ) : null}

      <View style={styles.formCard}>
        <CustomInput
          label="Series"
          value={sets}
          onChangeText={setSets}
          placeholder="Ej: 5"
          keyboardType="numeric"
        />

        <CustomInput
          label="Repeticiones"
          value={reps}
          onChangeText={setReps}
          placeholder="Ej: 5"
          keyboardType="numeric"
        />

        <CustomInput
          label="Peso sugerido"
          value={suggestedWeight}
          onChangeText={setSuggestedWeight}
          placeholder="Ej: 140"
          keyboardType="numeric"
        />

        <CustomInput
          label="RPE"
          value={rpe}
          onChangeText={setRpe}
          placeholder="Ej: 7.5"
          keyboardType="numeric"
        />

        <CustomInput
          label="Descanso (segundos)"
          value={rest}
          onChangeText={setRest}
          placeholder="Ej: 90"
          keyboardType="numeric"
        />

        <View style={styles.switchRow}>
          <View style={styles.switchTextContainer}>
            <Text style={styles.switchTitle}>Ocultar esta semana</Text>
            <Text style={styles.switchDescription}>
              Si está activo, este ejercicio no se muestra en esta semana.
            </Text>
          </View>

          <Switch
            value={hidden}
            onValueChange={setHidden}
            thumbColor={hidden ? COLORS.primary : COLORS.surface}
            trackColor={{
              false: COLORS.outlineVariant,
              true: COLORS.primary,
            }}
          />
        </View>
      </View>

      <CustomButton
        title={saving ? "Guardando..." : "Guardar progresión"}
        onPress={saveProgression}
        loading={saving}
      />
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

  title: {
    ...(TYPOGRAPHY.h2 as TextStyle),
    color: COLORS.onSurface,
    marginBottom: SPACING.sm,
  },

  exerciseName: {
    ...(TYPOGRAPHY.bodyLg as TextStyle),
    color: COLORS.onSurface,
    fontWeight: "700",
    marginBottom: SPACING.xs,
  },

  weekText: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    color: COLORS.onSurfaceVariant,
    marginBottom: SPACING.sm,
  },

  notes: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.onSurfaceVariant,
    marginBottom: SPACING.lg,
  },

  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },

  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },

  switchTextContainer: {
    flex: 1,
  },

  switchTitle: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    color: COLORS.onSurface,
    fontWeight: "700",
    marginBottom: SPACING.xs,
  },

  switchDescription: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.onSurfaceVariant,
  },

  empty: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
  },
});

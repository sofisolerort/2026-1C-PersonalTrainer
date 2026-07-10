import { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextStyle,
} from "react-native";
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../utils/Supabase";
import {
  COLORS,
  SPACING,
  RADIUS,
  SHADOWS,
  TYPOGRAPHY,
} from "@/constants/theme";

type Progression = {
  sets: number;
  reps: number;
  suggested_weight: number | null;
  rpe: number | null;
  rest_seconds: number | null;
};

type Exercise = {
  id: string;
  name: string;
  notes: string | null;
  progression: Progression | null;
};

type LogState = {
  completed: boolean;
  weightUsed: string;
};

export default function EjerciciosCliente() {
  const { user } = useAuth();

  const { id, dayName, weekNumber } = useLocalSearchParams<{
    id: string;
    dayName?: string;
    weekNumber?: string;
  }>();

  const selectedWeek = Number(weekNumber ?? 1);

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [logs, setLogs] = useState<Record<string, LogState>>({});
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchExercises();
    }, [id, selectedWeek, user?.id]),
  );

  const fetchExercises = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data: exercisesData } = await supabase
      .from("exercises")
      .select("*")
      .eq("routine_day_id", id);

    const base = exercisesData ?? [];

    if (base.length === 0) {
      setExercises([]);
      setLogs({});
      setLoading(false);
      return;
    }

    const ids = base.map((e) => e.id);

    const { data: progressionsData } = await supabase
      .from("exercise_progressions")
      .select("*")
      .in("exercise_id", ids)
      .eq("week_number", selectedWeek)
      .or("hidden.is.null,hidden.eq.false");

    const merged: Exercise[] = base.map((e) => ({
      ...e,
      progression:
        progressionsData?.find((p) => p.exercise_id === e.id) ?? null,
    }));

    setExercises(merged);

    let logsData: any[] = [];
    if (user?.id) {
      const { data } = await supabase
        .from("exercise_logs")
        .select("*")
        .eq("client_id", user.id)
        .eq("week_number", selectedWeek)
        .in("exercise_id", ids);
      logsData = data ?? [];
    }

    const logsMap: Record<string, LogState> = {};
    for (const e of base) {
      const existing = logsData.find((l) => l.exercise_id === e.id);
      logsMap[e.id] = {
        completed: existing?.completed ?? false,
        weightUsed:
          existing?.weight_used !== null && existing?.weight_used !== undefined
            ? String(existing.weight_used)
            : "",
      };
    }
    setLogs(logsMap);

    setLoading(false);
  };

  const saveOne = async (
    exerciseId: string,
    completed: boolean,
    weightUsed: string,
  ) => {
    if (!user?.id) return;

    const w = weightUsed.trim();
    if (w !== "" && Number.isNaN(Number(w.replace(",", ".")))) {
      Alert.alert("Error", "El peso usado debe ser un número válido");
      return;
    }

    const { error } = await supabase.from("exercise_logs").upsert(
      {
        exercise_id: exerciseId,
        client_id: user.id,
        week_number: selectedWeek,
        completed,
        weight_used: w === "" ? null : Number(w.replace(",", ".")),
        logged_at: new Date().toISOString(),
      },
      { onConflict: "exercise_id,client_id,week_number" },
    );

    if (error) {
      Alert.alert("Error", error.message);
    }
  };

  const toggleCompleted = (exerciseId: string) => {
    const current = logs[exerciseId] ?? { completed: false, weightUsed: "" };
    const newCompleted = !current.completed;

    setLogs((prev) => ({
      ...prev,
      [exerciseId]: { ...current, completed: newCompleted },
    }));

    saveOne(exerciseId, newCompleted, current.weightUsed);
  };

  const setWeightUsed = (exerciseId: string, value: string) => {
    setLogs((prev) => ({
      ...prev,
      [exerciseId]: {
        completed: prev[exerciseId]?.completed ?? false,
        weightUsed: value,
      },
    }));
  };

  const onWeightBlur = (exerciseId: string) => {
    const current = logs[exerciseId] ?? { completed: false, weightUsed: "" };
    saveOne(exerciseId, current.completed, current.weightUsed);
  };

  const progressionText = (p: Progression | null) => {
    if (!p) return "Sin progresión para esta semana";

    const weight =
      p.suggested_weight !== null ? ` @ ${p.suggested_weight} kg` : "";
    const rpe = p.rpe !== null ? ` · RPE ${p.rpe}` : "";
    const rest = p.rest_seconds !== null ? ` · ${p.rest_seconds}s desc.` : "";

    return `${p.sets}x${p.reps}${weight}${rpe}${rest}`;
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      data={exercises}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View>
          {dayName ? <Text style={styles.title}>{dayName}</Text> : null}
          <Text style={styles.subtitle}>Semana {selectedWeek}</Text>
        </View>
      }
      ListEmptyComponent={
        <Text style={styles.muted}>Este día todavía no tiene ejercicios.</Text>
      }
      renderItem={({ item }) => {
        const log = logs[item.id] ?? { completed: false, weightUsed: "" };

        return (
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <View style={styles.cardLeft}>
                <Text style={styles.exerciseName}>{item.name}</Text>
                <Text style={styles.prescribed}>
                  Objetivo: {progressionText(item.progression)}
                </Text>

                <View style={styles.weightWrapper}>
                  <TextInput
                    style={styles.weightInput}
                    value={log.weightUsed}
                    onChangeText={(v) => setWeightUsed(item.id, v)}
                    onBlur={() => onWeightBlur(item.id)}
                    placeholder={
                      item.progression?.suggested_weight != null
                        ? String(item.progression.suggested_weight)
                        : "Peso"
                    }
                    placeholderTextColor={COLORS.neutralLight}
                    keyboardType="decimal-pad"
                  />
                  <Text style={styles.kg}>kg usados</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => toggleCompleted(item.id)}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.checkButton}
              >
                <MaterialIcons
                  name={
                    log.completed ? "check-circle" : "radio-button-unchecked"
                  }
                  size={40}
                  color={log.completed ? COLORS.secondary : COLORS.neutralLight}
                />
              </TouchableOpacity>
            </View>
          </View>
        );
      }}
    />
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
    marginBottom: SPACING.xs,
  },
  subtitle: {
    ...(TYPOGRAPHY.bodyLg as TextStyle),
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  exerciseName: {
    ...(TYPOGRAPHY.bodyLg as TextStyle),
    color: COLORS.onSurface,
    fontWeight: "800",
    marginBottom: SPACING.xs,
  },
  prescribed: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    color: COLORS.onSurfaceVariant,
    marginBottom: SPACING.md,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardLeft: {
    flex: 1,
  },
  checkButton: {
    marginLeft: SPACING.md,
  },
  weightWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  weightInput: {
    fontSize: 16,
    fontWeight: "600",
    minWidth: 64,
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 0,
    backgroundColor: COLORS.background,
    color: COLORS.onSurface,
    textAlign: "center",
    textAlignVertical: "center",
    includeFontPadding: false,
  },
  kg: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.onSurfaceVariant,
  },
  muted: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
  },
});

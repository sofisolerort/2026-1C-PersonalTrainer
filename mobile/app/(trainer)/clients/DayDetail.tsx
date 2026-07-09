import { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Alert,
  TouchableOpacity,
  TextStyle,
} from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

import { supabase } from "@/utils/Supabase";
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
  block_id: string;
  day_number: number;
  day_name: string;
};

type Exercise = {
  id: string;
  routine_day_id: string;
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

type ExerciseWithProgression = Exercise & {
  progression: ExerciseProgression | null;
};

export default function DayDetail() {
  const router = useRouter();

  const { dayId, dayName, weekNumber } = useLocalSearchParams<{
    dayId: string;
    dayName?: string;
    weekNumber?: string;
  }>();

  const selectedWeek = Number(weekNumber ?? 1);

  const [day, setDay] = useState<RoutineDay | null>(null);
  const [exercises, setExercises] = useState<ExerciseWithProgression[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchDayDetail();
    }, [dayId, selectedWeek]),
  );

  const fetchDayDetail = async () => {
    if (!dayId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data: dayData, error: dayError } = await supabase
      .from("routine_days")
      .select("*")
      .eq("id", dayId)
      .maybeSingle();

    if (dayError || !dayData) {
      setDay(null);
      setExercises([]);
      setLoading(false);
      return;
    }

    setDay(dayData);

    const { data: exercisesData, error: exercisesError } = await supabase
      .from("exercises")
      .select("*")
      .eq("routine_day_id", dayId);

    if (exercisesError) {
      Alert.alert("Error", exercisesError.message);
      setExercises([]);
      setLoading(false);
      return;
    }

    const baseExercises = exercisesData ?? [];

    if (baseExercises.length === 0) {
      setExercises([]);
      setLoading(false);
      return;
    }

    const exerciseIds = baseExercises.map((exercise) => exercise.id);

    const { data: progressionsData, error: progressionsError } = await supabase
      .from("exercise_progressions")
      .select("*")
      .in("exercise_id", exerciseIds)
      .eq("week_number", selectedWeek)
      .or("hidden.is.null,hidden.eq.false");

    if (progressionsError) {
      Alert.alert("Error", progressionsError.message);

      setExercises(
        baseExercises.map((exercise) => ({
          ...exercise,
          progression: null,
        })),
      );

      setLoading(false);
      return;
    }

    const exercisesWithProgression = baseExercises.map((exercise) => {
      const progression =
        progressionsData?.find(
          (progression) => progression.exercise_id === exercise.id,
        ) ?? null;

      return {
        ...exercise,
        progression,
      };
    });

    setExercises(exercisesWithProgression);
    setLoading(false);
  };

  const deleteExercise = async (exerciseId: string) => {
    Alert.alert(
      "Eliminar ejercicio",
      "Se eliminará el ejercicio con sus progresiones.",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase
              .from("exercises")
              .delete()
              .eq("id", exerciseId);

            if (error) {
              Alert.alert("Error", error.message);
              return;
            }

            fetchDayDetail();
          },
        },
      ],
    );
  };

  const goToCreateExercise = () => {
    if (!day) return;

    router.push({
      pathname: "/(trainer)/clients/CrearEjercicio",
      params: {
        dayId: day.id,
        weekNumber: String(selectedWeek),
      },
    } as any);
  };

  const goToProgression = (exerciseId: string) => {
    router.push({
      pathname: "/(trainer)/clients/EditarProgresion",
      params: {
        exerciseId,
        weekNumber: String(selectedWeek),
      },
    } as any);
  };

  const renderProgressionText = (progression: ExerciseProgression | null) => {
    if (!progression) {
      return "Sin progresión cargada";
    }

    const weightText =
      progression.suggested_weight !== null
        ? ` @ ${progression.suggested_weight} kg`
        : "";

    const rpeText = progression.rpe !== null ? ` · RPE ${progression.rpe}` : "";

    const restText =
      progression.rest_seconds !== null
        ? ` · ${progression.rest_seconds}s desc.`
        : "";

    return `${progression.sets}x${progression.reps}${weightText}${rpeText}${restText}`;
  };

  const getProgressionStatus = (progression: ExerciseProgression | null) => {
    return progression ? "Cargada" : "Pendiente";
  };

  const loadedProgressions = exercises.filter(
    (exercise) => exercise.progression,
  ).length;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!day) {
    return (
      <View style={styles.center}>
        <View style={styles.emptyState}>
          <MaterialIcons
            name="event-busy"
            size={42}
            color={COLORS.onSurfaceVariant}
          />

          <Text style={styles.emptyTitle}>No se encontró el día</Text>

          <Text style={styles.emptyDescription}>
            Volvé al bloque e intentá abrirlo nuevamente.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          exercises.length === 0 ? styles.emptyListContent : styles.listContent
        }
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <Text style={styles.kicker}>Detalle del día</Text>

              <Text style={styles.title}>
                Día {day.day_number}: {dayName || day.day_name}
              </Text>
            </View>

            <View style={styles.heroCard}>
              <View style={styles.heroTop}>
                <View style={styles.heroIcon}>
                  <MaterialIcons
                    name="event-note"
                    size={28}
                    color={COLORS.onPrimary}
                  />
                </View>

                <View style={styles.heroContent}>
                  <Text style={styles.heroTitle}>Semana {selectedWeek}</Text>

                  <Text style={styles.heroDescription}>
                    Acá cargás los ejercicios del día y su progresión para esta
                    semana.
                  </Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{exercises.length}</Text>
                  <Text style={styles.statLabel}>
                    {exercises.length === 1 ? "ejercicio" : "ejercicios"}
                  </Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{loadedProgressions}</Text>
                  <Text style={styles.statLabel}>progresiones</Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{selectedWeek}</Text>
                  <Text style={styles.statLabel}>semana</Text>
                </View>
              </View>
            </View>

            <View style={styles.actionWrapper}>
              <CustomButton
                title="Agregar ejercicio"
                variant="primary"
                size="md"
                onPress={goToCreateExercise}
              />
            </View>

            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Ejercicios</Text>
                <Text style={styles.sectionSubtitle}>
                  Tocá una progresión para cargar o editar la semana actual
                </Text>
              </View>

              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{exercises.length}</Text>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyExercises}>
            <View style={styles.emptyIcon}>
              <MaterialIcons
                name="fitness-center"
                size={34}
                color={COLORS.onSurfaceVariant}
              />
            </View>

            <Text style={styles.emptyTitle}>Todavía no hay ejercicios</Text>

            <Text style={styles.emptyDescription}>
              Agregá el primer ejercicio del día. Después vas a poder cargar la
              progresión de la semana {selectedWeek}.
            </Text>
          </View>
        }
        renderItem={({ item, index }) => {
          const hasProgression = !!item.progression;

          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.exerciseNumber}>
                  <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                </View>

                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{item.name}</Text>

                  {item.notes ? (
                    <Text style={styles.notes}>{item.notes}</Text>
                  ) : (
                    <Text style={styles.notesMuted}>Sin notas cargadas</Text>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteExercise(item.id)}
                >
                  <MaterialIcons
                    name="delete-outline"
                    size={22}
                    color={COLORS.error}
                  />
                </TouchableOpacity>
              </View>

              <View
                style={[
                  styles.progressionBox,
                  hasProgression && styles.progressionBoxLoaded,
                ]}
              >
                <View style={styles.progressionHeader}>
                  <View style={styles.progressionInfo}>
                    <Text style={styles.progressionLabel}>
                      Progresión semana {selectedWeek}
                    </Text>

                    <Text style={styles.progressionText}>
                      {renderProgressionText(item.progression)}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusPill,
                      hasProgression
                        ? styles.statusPillLoaded
                        : styles.statusPillPending,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        hasProgression
                          ? styles.statusPillLoadedText
                          : styles.statusPillPendingText,
                      ]}
                    >
                      {getProgressionStatus(item.progression)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.cardActions}>
                <CustomButton
                  title={
                    hasProgression ? "Editar progresión" : "Cargar progresión"
                  }
                  variant={hasProgression ? "outline" : "secondary"}
                  size="sm"
                  fullWidth={false}
                  onPress={() => goToProgression(item.id)}
                />
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },

  listContent: {
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },

  emptyListContent: {
    flexGrow: 1,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl,
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
  },

  heroCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    ...SHADOWS.card,
  },

  heroTop: {
    flexDirection: "row",
    marginBottom: SPACING.lg,
  },

  heroIcon: {
    width: 54,
    height: 54,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },

  heroContent: {
    flex: 1,
  },

  heroTitle: {
    ...(TYPOGRAPHY.bodyLg as TextStyle),
    color: COLORS.onSurface,
    fontWeight: "800",
    marginBottom: SPACING.xs,
  },

  heroDescription: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    color: COLORS.onSurfaceVariant,
    lineHeight: 21,
  },

  statsRow: {
    flexDirection: "row",
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
  },

  statItem: {
    flex: 1,
    alignItems: "center",
  },

  statNumber: {
    fontSize: 26,
    fontWeight: "900",
    color: COLORS.primary,
    marginBottom: 2,
  },

  statLabel: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.onSurfaceVariant,
    fontWeight: "600",
  },

  statDivider: {
    width: 1,
    backgroundColor: COLORS.outlineVariant,
  },

  actionWrapper: {
    marginBottom: SPACING.xl,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.md,
  },

  sectionTitle: {
    ...(TYPOGRAPHY.bodyLg as TextStyle),
    color: COLORS.onSurface,
    fontWeight: "800",
  },

  sectionSubtitle: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
    maxWidth: 260,
  },

  countBadge: {
    minWidth: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    justifyContent: "center",
    alignItems: "center",
  },

  countBadgeText: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.onSurfaceVariant,
    fontWeight: "800",
  },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    ...SHADOWS.card,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: SPACING.md,
  },

  exerciseNumber: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },

  exerciseNumberText: {
    ...(TYPOGRAPHY.bodyLg as TextStyle),
    color: COLORS.primary,
    fontWeight: "900",
  },

  exerciseInfo: {
    flex: 1,
    paddingRight: SPACING.sm,
  },

  exerciseName: {
    ...(TYPOGRAPHY.bodyLg as TextStyle),
    fontWeight: "800",
    color: COLORS.onSurface,
    marginBottom: SPACING.xs,
  },

  notes: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.onSurfaceVariant,
    lineHeight: 19,
  },

  notesMuted: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.onSurfaceVariant,
    opacity: 0.7,
  },

  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },

  progressionBox: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  progressionBoxLoaded: {
    borderColor: COLORS.primary,
  },

  progressionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: SPACING.md,
  },

  progressionInfo: {
    flex: 1,
  },

  progressionLabel: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.onSurfaceVariant,
    marginBottom: SPACING.xs,
    fontWeight: "600",
  },

  progressionText: {
    ...(TYPOGRAPHY.bodyLg as TextStyle),
    color: COLORS.onSurface,
    fontWeight: "900",
  },

  statusPill: {
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 5,
    flexShrink: 0,
  },

  statusPillLoaded: {
    backgroundColor: "rgba(46, 125, 50, 0.12)",
  },

  statusPillPending: {
    backgroundColor: "rgba(245, 124, 0, 0.12)",
  },

  statusPillText: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    fontWeight: "800",
  },

  statusPillLoadedText: {
    color: "#2E7D32",
  },

  statusPillPendingText: {
    color: "#F57C00",
  },

  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },

  emptyExercises: {
    alignItems: "center",
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
  },

  emptyState: {
    alignItems: "center",
  },

  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.md,
  },

  emptyTitle: {
    ...(TYPOGRAPHY.bodyLg as TextStyle),
    color: COLORS.onSurface,
    fontWeight: "800",
    textAlign: "center",
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },

  emptyDescription: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
    lineHeight: 21,
  },
});

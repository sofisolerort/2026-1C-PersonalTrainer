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
import { CustomButton } from "@/components/CustomButton";

import {
  COLORS,
  SPACING,
  RADIUS,
  SHADOWS,
  TYPOGRAPHY,
} from "@/constants/theme";

type Exercise = {
  id: string;
  routine_day_id: string;
  name: string;
  notes: string | null;
};

type RoutineDay = {
  id: string;
  day_number: number;
  day_name: string;
};

type ProgressionRow = {
  id: string;
};

export default function EliminarEjercicio() {
  const { exerciseId } = useLocalSearchParams<{
    exerciseId: string;
  }>();

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [day, setDay] = useState<RoutineDay | null>(null);

  const [progressionsCount, setProgressionsCount] = useState(0);

  const [loadingInitialData, setLoadingInitialData] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchExercise();
  }, [exerciseId]);

  const fetchExercise = async () => {
    if (!exerciseId) {
      setLoadingInitialData(false);
      return;
    }

    setLoadingInitialData(true);

    const { data: exerciseData, error: exerciseError } = await supabase
      .from("exercises")
      .select("id, routine_day_id, name, notes")
      .eq("id", exerciseId)
      .maybeSingle();

    if (exerciseError || !exerciseData) {
      setExercise(null);
      setDay(null);
      setProgressionsCount(0);
      setLoadingInitialData(false);
      return;
    }

    const currentExercise = exerciseData as Exercise;

    setExercise(currentExercise);

    const { data: dayData } = await supabase
      .from("routine_days")
      .select("id, day_number, day_name")
      .eq("id", currentExercise.routine_day_id)
      .maybeSingle();

    setDay((dayData as RoutineDay | null) ?? null);

    const { data: progressionsData } = await supabase
      .from("exercise_progressions")
      .select("id")
      .eq("exercise_id", currentExercise.id);

    setProgressionsCount(
      ((progressionsData as ProgressionRow[] | null) ?? []).length
    );

    setLoadingInitialData(false);
  };

  const confirmDelete = () => {
    if (!exercise) return;

    Alert.alert(
      "Eliminar ejercicio",
      `¿Seguro que querés eliminar "${exercise.name}"? Esta acción no se puede deshacer.`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: deleteExercise,
        },
      ]
    );
  };

  const deleteExercise = async () => {
    if (!exercise) return;

    setDeleting(true);

    const { error } = await supabase
      .from("exercises")
      .delete()
      .eq("id", exercise.id);

    setDeleting(false);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    Alert.alert("Éxito", "Ejercicio eliminado correctamente");
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
        <View style={styles.emptyState}>
          <MaterialIcons
            name="fitness-center"
            size={46}
            color={COLORS.onSurfaceVariant}
          />

          <Text style={styles.emptyTitle}>No se encontró el ejercicio</Text>

          <Text style={styles.emptyDescription}>
            Volvé al día e intentá abrirlo nuevamente.
          </Text>

          <CustomButton
            title="Volver"
            variant="secondary"
            size="sm"
            fullWidth={false}
            onPress={() => router.back()}
          />
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.kicker}>Eliminar ejercicio</Text>

        <Text style={styles.title}>{exercise.name}</Text>

        <Text style={styles.subtitle}>
          {day
            ? `Día ${day.day_number}: ${day.day_name}`
            : "Día no encontrado"}
        </Text>
      </View>

      <View style={styles.warningCard}>
        <View style={styles.warningIcon}>
          <MaterialIcons name="warning" size={30} color={COLORS.onPrimary} />
        </View>

        <Text style={styles.warningTitle}>Esta acción es permanente</Text>

        <Text style={styles.warningDescription}>
          Al eliminar este ejercicio también se eliminarán sus progresiones
          asociadas si están vinculadas por cascade.
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <MaterialIcons
            name="fitness-center"
            size={20}
            color={COLORS.primary}
          />

          <Text style={styles.sectionTitle}>Resumen del ejercicio</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Nombre</Text>

          <Text style={styles.infoValue}>{exercise.name}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Día</Text>

          <Text style={styles.infoValue}>
            {day
              ? `Día ${day.day_number}: ${day.day_name}`
              : "Día no encontrado"}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Notas</Text>

          <Text style={styles.infoValue}>
            {exercise.notes || "Sin notas cargadas"}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Progresiones asociadas</Text>

          <Text style={styles.infoValue}>{progressionsCount}</Text>
        </View>
      </View>

      <CustomButton
        title={deleting ? "Eliminando..." : "Eliminar ejercicio"}
        variant="danger"
        size="md"
        onPress={confirmDelete}
        loading={deleting}
      />

      <View style={styles.cancelWrapper}>
        <CustomButton
          title="Cancelar"
          variant="ghost"
          size="sm"
          fullWidth={false}
          onPress={() => router.back()}
          disabled={deleting}
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
    padding: SPACING.lg,
  },

  header: {
    marginBottom: SPACING.lg,
  },

  kicker: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.error,
    fontWeight: "800",
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

  warningCard: {
    backgroundColor: COLORS.error,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    alignItems: "center",
    ...SHADOWS.card,
  },

  warningIcon: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.full,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.md,
  },

  warningTitle: {
    ...(TYPOGRAPHY.bodyLg as TextStyle),
    color: COLORS.onPrimary,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: SPACING.xs,
  },

  warningDescription: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    color: COLORS.onPrimary,
    textAlign: "center",
    lineHeight: 21,
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
    fontWeight: "900",
  },

  infoRow: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },

  infoLabel: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.onSurfaceVariant,
    fontWeight: "700",
    marginBottom: SPACING.xs,
  },

  infoValue: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    color: COLORS.onSurface,
    fontWeight: "700",
  },

  cancelWrapper: {
    alignItems: "center",
    marginTop: SPACING.md,
  },

  emptyState: {
    alignItems: "center",
  },

  emptyTitle: {
    ...(TYPOGRAPHY.bodyLg as TextStyle),
    color: COLORS.onSurface,
    fontWeight: "900",
    textAlign: "center",
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },

  emptyDescription: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: SPACING.lg,
  },
});
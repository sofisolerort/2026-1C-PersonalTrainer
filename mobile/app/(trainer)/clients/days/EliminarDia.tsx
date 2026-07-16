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

type RoutineDay = {
  id: string;
  block_id: string;
  day_number: number;
  day_name: string;
};

type Block = {
  id: string;
  name: string;
};

type ExerciseRow = {
  id: string;
};

export default function EliminarDia() {
  const { dayId } = useLocalSearchParams<{
    dayId: string;
  }>();

  const [day, setDay] = useState<RoutineDay | null>(null);
  const [block, setBlock] = useState<Block | null>(null);

  const [exercisesCount, setExercisesCount] = useState(0);
  const [progressionsCount, setProgressionsCount] = useState(0);

  const [loadingInitialData, setLoadingInitialData] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchDay();
  }, [dayId]);

  const fetchDay = async () => {
    if (!dayId) {
      setLoadingInitialData(false);
      return;
    }

    setLoadingInitialData(true);

    const { data: dayData, error: dayError } = await supabase
      .from("routine_days")
      .select("id, block_id, day_number, day_name")
      .eq("id", dayId)
      .maybeSingle();

    if (dayError || !dayData) {
      setDay(null);
      setBlock(null);
      setExercisesCount(0);
      setProgressionsCount(0);
      setLoadingInitialData(false);
      return;
    }

    const currentDay = dayData as RoutineDay;
    setDay(currentDay);

    const { data: blockData } = await supabase
      .from("blocks")
      .select("id, name")
      .eq("id", currentDay.block_id)
      .maybeSingle();

    setBlock((blockData as Block | null) ?? null);

    const { data: exercisesData } = await supabase
      .from("exercises")
      .select("id")
      .eq("routine_day_id", currentDay.id);

    const exerciseRows = (exercisesData as ExerciseRow[] | null) ?? [];
    setExercisesCount(exerciseRows.length);

    if (exerciseRows.length > 0) {
      const exerciseIds = exerciseRows.map((exercise) => exercise.id);

      const { data: progressionsData } = await supabase
        .from("exercise_progressions")
        .select("id")
        .in("exercise_id", exerciseIds);

      setProgressionsCount(progressionsData?.length ?? 0);
    } else {
      setProgressionsCount(0);
    }

    setLoadingInitialData(false);
  };

  const confirmDelete = () => {
    if (!day) return;

    Alert.alert(
      "Eliminar día",
      `¿Seguro que querés eliminar el Día ${day.day_number}: ${day.day_name}? Esta acción no se puede deshacer.`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: deleteDay,
        },
      ]
    );
  };

  const deleteDay = async () => {
    if (!day) return;

    setDeleting(true);

    const { error } = await supabase
      .from("routine_days")
      .delete()
      .eq("id", day.id);

    setDeleting(false);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    Alert.alert("Éxito", "Día eliminado correctamente");
    router.back();
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
        <View style={styles.emptyState}>
          <MaterialIcons
            name="event-busy"
            size={46}
            color={COLORS.onSurfaceVariant}
          />

          <Text style={styles.emptyTitle}>No se encontró el día</Text>

          <Text style={styles.emptyDescription}>
            Volvé al bloque e intentá abrirlo nuevamente.
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
        <Text style={styles.kicker}>Eliminar día</Text>

        <Text style={styles.title}>
          Día {day.day_number}: {day.day_name}
        </Text>

        <Text style={styles.subtitle}>
          {block ? `Bloque: ${block.name}` : "Bloque no encontrado"}
        </Text>
      </View>

      <View style={styles.warningCard}>
        <View style={styles.warningIcon}>
          <MaterialIcons name="warning" size={30} color={COLORS.onPrimary} />
        </View>

        <Text style={styles.warningTitle}>Esta acción es permanente</Text>

        <Text style={styles.warningDescription}>
          Al eliminar este día también se eliminarán sus ejercicios,
          progresiones y registros relacionados si están vinculados por cascade.
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="event-note" size={20} color={COLORS.primary} />

          <Text style={styles.sectionTitle}>Resumen del día</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Día</Text>

          <Text style={styles.infoValue}>
            Día {day.day_number}: {day.day_name}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Bloque</Text>

          <Text style={styles.infoValue}>
            {block?.name ?? "Bloque no encontrado"}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Ejercicios cargados</Text>

          <Text style={styles.infoValue}>{exercisesCount}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Progresiones asociadas</Text>

          <Text style={styles.infoValue}>{progressionsCount}</Text>
        </View>
      </View>

      <CustomButton
        title={deleting ? "Eliminando..." : "Eliminar día"}
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
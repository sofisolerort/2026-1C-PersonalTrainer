import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TextStyle,
} from "react-native";
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import { supabase } from "../../../utils/Supabase";
import {
  COLORS,
  SPACING,
  RADIUS,
  SHADOWS,
  TYPOGRAPHY,
} from "@/constants/theme";

type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: number;
  suggested_weight: number;
};

export default function EjerciciosDia() {
  // `id` es el routine_day_id (viene del [id] de la ruta). `dayName` es opcional.
  const { id, dayName } = useLocalSearchParams<{
    id: string;
    dayName?: string;
  }>();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchExercises();
    }, [id]),
  );

  const fetchExercises = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("exercises")
      .select("*")
      .eq("routine_day_id", id);

    if (!error && data) {
      setExercises(data);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {dayName ? <Text style={styles.title}>{dayName}</Text> : null}

      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Este día todavía no tiene ejercicios cargados.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.exerciseName}>{item.name}</Text>
            <Text style={styles.exerciseInfo}>
              {item.sets} series × {item.reps} reps
            </Text>
            <Text style={styles.exerciseInfo}>
              Peso sugerido: {item.suggested_weight} kg
            </Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: SPACING.lg }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  title: {
    ...(TYPOGRAPHY.h3 as TextStyle),
    color: COLORS.onSurface,
    marginBottom: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  exerciseName: {
    ...(TYPOGRAPHY.bodyLg as TextStyle),
    fontWeight: "600",
    color: COLORS.onSurface,
    marginBottom: SPACING.xs,
  },
  exerciseInfo: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.onSurfaceVariant,
    marginTop: SPACING.xs,
  },
  emptyText: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
    marginTop: SPACING.xl,
  },
});

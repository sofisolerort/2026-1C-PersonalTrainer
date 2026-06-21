import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextStyle,
} from "react-native";
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";
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

export default function DayDetail() {
  const { dayId, dayName } = useLocalSearchParams();

  const [exercises, setExercises] = useState<Exercise[]>([]);

  useFocusEffect(
    useCallback(() => {
      fetchExercises();
    }, []),
  );

  const fetchExercises = async () => {
    const { data, error } = await supabase
      .from("exercises")
      .select("*")
      .eq("routine_day_id", dayId);

    if (error) {
      return;
    }

    if (data) {
      setExercises(data);
    }
  };

  const deleteExercise = async (exerciseId: string) => {
    Alert.alert(
      "Eliminar ejercicio",
      "¿Seguro que querés eliminar este ejercicio?",
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

            fetchExercises();
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{dayName}</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          router.push({
            pathname: "/(trainer)/clients/CrearEjercicio",
            params: { dayId },
          } as any)
        }
      >
        <Text style={styles.buttonText}>Agregar Ejercicio</Text>
      </TouchableOpacity>

      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.muted}>No hay ejercicios todavía</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.exerciseName}>{item.name}</Text>

            <Text style={styles.exerciseInfo}>
              {item.sets} x {item.reps}
            </Text>

            <Text style={styles.exerciseInfo}>
              Peso sugerido: {item.suggested_weight} kg
            </Text>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() =>
                  router.push({
                    pathname: "/(trainer)/clients/EditarEjercicio",
                    params: { exerciseId: item.id },
                  } as any)
                }
              >
                <Text style={styles.actionText}>Editar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteExercise(item.id)}
              >
                <Text style={styles.actionText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  title: {
    ...(TYPOGRAPHY.h2 as TextStyle),
    color: COLORS.onSurface,
    marginBottom: SPACING.lg,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.lg,
  },
  buttonText: {
    ...(TYPOGRAPHY.button as TextStyle),
    color: COLORS.onPrimary,
    textAlign: "center",
  },
  card: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    ...SHADOWS.card,
    marginBottom: SPACING.md,
  },
  exerciseName: {
    ...(TYPOGRAPHY.bodyLg as TextStyle),
    fontWeight: "700",
    color: COLORS.onSurface,
    marginBottom: SPACING.sm,
  },
  exerciseInfo: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    color: COLORS.onSurfaceVariant,
    marginBottom: SPACING.xs,
  },
  actions: {
    flexDirection: "row",
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  editButton: {
    flex: 1,
    backgroundColor: COLORS.tertiary,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: COLORS.error,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  actionText: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    fontWeight: "700",
    color: COLORS.onPrimary,
    textAlign: "center",
  },
  muted: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    color: COLORS.onSurfaceVariant,
  },
});

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextStyle,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../utils/Supabase";
import {
  COLORS,
  SPACING,
  RADIUS,
  SHADOWS,
  TYPOGRAPHY,
} from "@/constants/theme";

type Routine = {
  id: string;
  title: string;
  description: string;
};

type RoutineDay = {
  id: string;
  day_number: number;
  day_name: string;
};

export default function RutinasCliente() {
  const { user } = useAuth();

  const [routine, setRoutine] = useState<Routine | null>(null);
  const [days, setDays] = useState<RoutineDay[]>([]);
  const [loading, setLoading] = useState(true);

  // Refetch cada vez que la pantalla recupera el foco (mismo patrón que el trainer).
  useFocusEffect(
    useCallback(() => {
      fetchRoutine();
    }, [user?.id]),
  );

  const fetchRoutine = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // 1) Mi rutina: la que el entrenador asignó a este cliente.
    const { data: routineData, error: routineError } = await supabase
      .from("routines")
      .select("*")
      .eq("client_id", user.id)
      .maybeSingle();

    if (routineError || !routineData) {
      setRoutine(null);
      setDays([]);
      setLoading(false);
      return;
    }

    setRoutine(routineData);

    // 2) Los días de esa rutina, ordenados.
    const { data: daysData, error: daysError } = await supabase
      .from("routine_days")
      .select("*")
      .eq("routine_id", routineData.id)
      .order("day_number", { ascending: true });

    if (!daysError && daysData) {
      setDays(daysData);
    }

    setLoading(false);
  };

  const verDia = (day: RoutineDay) => {
    router.push({
      pathname: "/(client)/ejercicios/[id]",
      params: { id: day.id, dayName: day.day_name },
    } as any);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!routine) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>
          Tu entrenador todavía no te asignó una rutina.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{routine.title}</Text>
      {routine.description ? (
        <Text style={styles.description}>{routine.description}</Text>
      ) : null}

      <Text style={styles.subtitle}>Días de entrenamiento</Text>

      <FlatList
        data={days}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Todavía no hay días cargados en tu rutina.
          </Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => verDia(item)}>
            <Text style={styles.dayText}>
              Día {item.day_number}: {item.day_name}
            </Text>
            <Text style={styles.dayHint}>Ver ejercicios ›</Text>
          </TouchableOpacity>
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
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  title: {
    ...(TYPOGRAPHY.h3 as TextStyle),
    color: COLORS.onSurface,
    marginBottom: SPACING.xs,
  },
  description: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    color: COLORS.onSurfaceVariant,
    marginBottom: SPACING.lg,
  },
  subtitle: {
    ...(TYPOGRAPHY.bodyLg as TextStyle),
    fontWeight: "600",
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
  dayText: {
    ...(TYPOGRAPHY.bodyLg as TextStyle),
    fontWeight: "600",
    color: COLORS.onSurface,
  },
  dayHint: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  emptyText: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
  },
});

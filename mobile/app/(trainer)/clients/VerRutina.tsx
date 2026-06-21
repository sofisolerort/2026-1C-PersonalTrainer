import { useState, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextStyle,
  Alert,
} from "react-native";
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";
import { supabase } from "../../../utils/Supabase";
import { MaterialIcons } from "@expo/vector-icons";
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

export default function VerRutina() {
  const { clientId } = useLocalSearchParams();

  const [routine, setRoutine] = useState<Routine | null>(null);
  const [days, setDays] = useState<RoutineDay[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchRoutine();
    }, [clientId]),
  );

  const fetchRoutine = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("routines")
      .select("*")
      .eq("client_id", clientId)
      .maybeSingle();

    if (error || !data) {
      setLoading(false);
      return;
    }

    setRoutine(data);

    const { data: daysData, error: daysError } = await supabase
      .from("routine_days")
      .select("*")
      .eq("routine_id", data.id)
      .order("day_number", { ascending: true });

    if (!daysError && daysData) {
      setDays(daysData);
    }

    setLoading(false);
  };

  const deleteRoutine = async () => {
    if (!routine) return;

    Alert.alert(
      "Eliminar rutina",
      "Se eliminarán la rutina, sus días y todos los ejercicios.",
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
              .from("routines")
              .delete()
              .eq("id", routine.id);

            if (error) {
              Alert.alert("Error", error.message);
              return;
            }

            Alert.alert("Éxito", "Rutina eliminada");
            router.back();
          },
        },
      ],
    );
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
        <Text>Este cliente todavía no tiene rutina</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{routine.title}</Text>

        <View style={styles.headerButtons}>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/(trainer)/clients/EditarInfoGeneral",
                params: { clientId },
              } as any)
            }
          >
            <MaterialIcons name="edit" size={24} color={COLORS.onSurface} />
          </TouchableOpacity>

          <TouchableOpacity onPress={deleteRoutine}>
            <MaterialIcons name="delete" size={24} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.description}>
        {routine.description || "Sin descripción"}
      </Text>

      <Text style={styles.subtitle}>Días de entrenamiento</Text>

      {days.length === 0 ? (
        <Text style={styles.muted}>No hay días cargados todavía</Text>
      ) : (
        <FlatList
          data={days}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.dayCard}
              onPress={() =>
                router.push({
                  pathname: "/(trainer)/clients/DayDetail",
                  params: {
                    dayId: item.id,
                    dayName: item.day_name,
                  },
                } as any)
              }
            >
              <Text style={styles.dayText}>
                Día {item.day_number}: {item.day_name}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },

  headerButtons: {
    flexDirection: "row",
    gap: SPACING.md,
    alignItems: "center",
  },

  title: {
    ...(TYPOGRAPHY.h2 as TextStyle),
    color: COLORS.onSurface,
  },

  description: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    color: COLORS.onSurfaceVariant,
    marginBottom: SPACING.lg,
  },

  subtitle: {
    ...(TYPOGRAPHY.bodyLg as TextStyle),
    fontWeight: "700",
    color: COLORS.onSurface,
    marginBottom: SPACING.md,
  },

  dayCard: {
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    ...SHADOWS.card,
    marginBottom: SPACING.md,
  },

  dayText: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    fontWeight: "600",
    color: COLORS.onSurface,
  },

  muted: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    color: COLORS.onSurfaceVariant,
  },
});

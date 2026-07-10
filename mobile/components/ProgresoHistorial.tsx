import { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TextStyle,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { supabase } from "@/utils/Supabase";
import {
  COLORS,
  SPACING,
  RADIUS,
  SHADOWS,
  TYPOGRAPHY,
} from "@/constants/theme";

type Log = {
  exercise_id: string;
  week_number: number;
  weight_used: number | null;
  completed: boolean;
};

type Entry = { week: number; weight: number | null; completed: boolean };

type ExerciseHistory = {
  id: string;
  name: string;
  dayId: string;
  entries: Entry[];
};

type DayHistory = {
  id: string;
  name: string;
  dayNumber: number;
  blockId: string;
  exercises: ExerciseHistory[];
};

type BlockHistory = {
  id: string;
  name: string;
  order: number;
  days: DayHistory[];
};

// Historial de progreso agrupado por bloque → día → ejercicio → semana.
// Recibe el clientId (el cliente ve el suyo; el entrenador el de su cliente).
export default function ProgresoHistorial({ clientId }: { clientId?: string }) {
  const [blocks, setBlocks] = useState<BlockHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [clientId]),
  );

  const fetchHistory = async () => {
    if (!clientId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // 1) Logs del cliente
    const { data: logsData } = await supabase
      .from("exercise_logs")
      .select("exercise_id, week_number, weight_used, completed")
      .eq("client_id", clientId)
      .order("week_number", { ascending: true });

    const logs = (logsData ?? []) as Log[];

    if (logs.length === 0) {
      setBlocks([]);
      setLoading(false);
      return;
    }

    // 2) Ejercicios (con su día)
    const exerciseIds = [...new Set(logs.map((l) => l.exercise_id))];
    const { data: exercisesData } = await supabase
      .from("exercises")
      .select("id, name, routine_day_id")
      .in("id", exerciseIds);
    const exercises = exercisesData ?? [];

    // 3) Días (con su bloque)
    const dayIds = [...new Set(exercises.map((e) => e.routine_day_id))];
    const { data: daysData } = await supabase
      .from("routine_days")
      .select("id, block_id, day_name, day_number")
      .in("id", dayIds);
    const days = daysData ?? [];

    // 4) Bloques
    const blockIds = [...new Set(days.map((d) => d.block_id))];
    const { data: blocksData } = await supabase
      .from("blocks")
      .select("id, name, order_index")
      .in("id", blockIds);
    const blocksMeta = blocksData ?? [];

    // Mapas de apoyo
    const dayById: Record<string, any> = {};
    for (const d of days) dayById[d.id] = d;
    const blockById: Record<string, any> = {};
    for (const b of blocksMeta) blockById[b.id] = b;

    // Historia por ejercicio
    const exHistById: Record<string, ExerciseHistory> = {};
    for (const e of exercises) {
      exHistById[e.id] = {
        id: e.id,
        name: e.name,
        dayId: e.routine_day_id,
        entries: [],
      };
    }
    for (const log of logs) {
      const eh = exHistById[log.exercise_id];
      if (eh) {
        eh.entries.push({
          week: log.week_number,
          weight: log.weight_used,
          completed: log.completed,
        });
      }
    }
    Object.values(exHistById).forEach((eh) =>
      eh.entries.sort((a, b) => a.week - b.week),
    );

    // Agrupar ejercicios por día
    const dayMap: Record<string, DayHistory> = {};
    for (const eh of Object.values(exHistById)) {
      const day = dayById[eh.dayId];
      const dId = eh.dayId ?? "sin-dia";
      if (!dayMap[dId]) {
        dayMap[dId] = {
          id: dId,
          name: day?.day_name ?? "",
          dayNumber: day?.day_number ?? 0,
          blockId: day?.block_id ?? "sin-bloque",
          exercises: [],
        };
      }
      dayMap[dId].exercises.push(eh);
    }

    // Agrupar días por bloque
    const blockMap: Record<string, BlockHistory> = {};
    for (const day of Object.values(dayMap)) {
      const bId = day.blockId;
      if (!blockMap[bId]) {
        const meta = blockById[bId];
        blockMap[bId] = {
          id: bId,
          name: meta?.name ?? "Sin bloque",
          order: meta?.order_index ?? 999,
          days: [],
        };
      }
      blockMap[bId].days.push(day);
    }

    // Ordenar días dentro de cada bloque, y bloques entre sí
    Object.values(blockMap).forEach((b) =>
      b.days.sort((a, b) => a.dayNumber - b.dayNumber),
    );
    const result = Object.values(blockMap).sort((a, b) => a.order - b.order);

    setBlocks(result);
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const dayLabel = (day: DayHistory) =>
    day.name ? `Día ${day.dayNumber}: ${day.name}` : `Día ${day.dayNumber}`;

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={blocks}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={
        <Text style={styles.muted}>
          Todavía no hay registros de progreso. Marcá ejercicios como hechos y
          cargá el peso usado desde tu rutina.
        </Text>
      }
      renderItem={({ item: block }) => (
        <View style={styles.blockSection}>
          <Text style={styles.blockTitle}>{block.name}</Text>

          {block.days.map((day) => (
            <View key={day.id} style={styles.daySection}>
              <Text style={styles.dayTitle}>{dayLabel(day)}</Text>

              {day.exercises.map((ex) => (
                <View key={ex.id} style={styles.card}>
                  <Text style={styles.exerciseName}>{ex.name}</Text>

                  {ex.entries.map((e) => (
                    <View key={e.week} style={styles.entryRow}>
                      <Text style={styles.week}>Semana {e.week}</Text>
                      <Text style={styles.weight}>
                        {e.weight != null ? `${e.weight} kg` : "sin peso"}
                      </Text>
                      <MaterialIcons
                        name={
                          e.completed
                            ? "check-circle"
                            : "radio-button-unchecked"
                        }
                        size={20}
                        color={
                          e.completed ? COLORS.secondary : COLORS.neutralLight
                        }
                      />
                    </View>
                  ))}
                </View>
              ))}
            </View>
          ))}
        </View>
      )}
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
  blockSection: {
    marginBottom: SPACING.lg,
  },
  blockTitle: {
    ...(TYPOGRAPHY.h3 as TextStyle),
    color: COLORS.onSurface,
    marginBottom: SPACING.md,
  },
  daySection: {
    marginBottom: SPACING.md,
  },
  dayTitle: {
    ...(TYPOGRAPHY.bodyLg as TextStyle),
    color: COLORS.primary,
    fontWeight: "700",
    marginBottom: SPACING.sm,
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
  entryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.outlineVariant,
  },
  week: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    color: COLORS.onSurfaceVariant,
    flex: 1,
  },
  weight: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    color: COLORS.onSurface,
    fontWeight: "700",
    marginRight: SPACING.md,
  },
  muted: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
  },
});

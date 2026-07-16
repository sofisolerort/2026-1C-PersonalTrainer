import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Alert,
  TextStyle,
} from "react-native";
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";
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

type Routine = {
  id: string;
  title: string;
  description: string | null;
};

type Block = {
  id: string;
  name: string;
  description: string | null;
  order_index: number;
  weeks: number;
};

export default function VerRutina() {
  const { clientId } = useLocalSearchParams<{ clientId: string }>();

  const [routine, setRoutine] = useState<Routine | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchRoutine();
    }, [clientId])
  );

  const fetchRoutine = async () => {
    setLoading(true);

    const { data: routineData, error } = await supabase
      .from("routines")
      .select("*")
      .eq("client_id", clientId)
      .maybeSingle();

    if (error || !routineData) {
      setRoutine(null);
      setBlocks([]);
      setLoading(false);
      return;
    }

    setRoutine(routineData);

    const { data: blocksData, error: blocksError } = await supabase
      .from("blocks")
      .select("*")
      .eq("routine_id", routineData.id)
      .order("order_index");

    if (blocksError) {
      Alert.alert("Error", blocksError.message);
      setBlocks([]);
    } else {
      setBlocks(blocksData ?? []);
    }

    setLoading(false);
  };

  const deleteRoutine = async () => {
    if (!routine) return;

    Alert.alert(
      "Eliminar rutina",
      "Se eliminarán la rutina, sus bloques, días, ejercicios y progresiones.",
      [
        { text: "Cancelar", style: "cancel" },
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
      ]
    );
  };

  const goToCreateBlock = () => {
    if (!routine) return;

    router.push({
      pathname: "/(trainer)/clients/blocks/CrearBloque",
      params: {
        routineId: routine.id,
      },
    } as any);
  };

  const goToBlock = (blockId: string) => {
    router.push({
      pathname: "/(trainer)/clients/blocks/VerBloque",
      params: {
        blockId,
      },
    } as any);
  };

  const totalWeeks = blocks.reduce((acc, block) => acc + block.weeks, 0);

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
        <View style={styles.emptyState}>
          <MaterialIcons
            name="assignment-late"
            size={42}
            color={COLORS.onSurfaceVariant}
          />

          <Text style={styles.emptyTitle}>No existe rutina</Text>

          <Text style={styles.emptyDescription}>
            Este cliente todavía no tiene una rutina creada.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={blocks}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View>
                <Text style={styles.kicker}>Planificación</Text>
                <Text style={styles.title}>Rutina del cliente</Text>
              </View>
            </View>

            <View style={styles.routineCard}>
              <View style={styles.routineIcon}>
                <MaterialIcons
                  name="fitness-center"
                  size={28}
                  color={COLORS.onPrimary}
                />
              </View>

              <View style={styles.routineContent}>
                <Text style={styles.routineTitle}>{routine.title}</Text>

                <Text style={styles.routineDescription}>
                  {routine.description || "Sin descripción cargada"}
                </Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{blocks.length}</Text>
                <Text style={styles.statLabel}>
                  {blocks.length === 1 ? "bloque" : "bloques"}
                </Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{totalWeeks}</Text>
                <Text style={styles.statLabel}>
                  {totalWeeks === 1 ? "semana" : "semanas totales trabajadas"}
                </Text>
              </View>
            </View>

            <View style={styles.primaryAction}>
              <CustomButton
                title="Crear bloque"
                variant="primary"
                size="md"
                onPress={goToCreateBlock}
              />
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Bloques de entrenamiento</Text>

              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{blocks.length}</Text>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyBlocks}>
            <View style={styles.emptyIcon}>
              <MaterialIcons
                name="view-week"
                size={34}
                color={COLORS.onSurfaceVariant}
              />
            </View>

            <Text style={styles.emptyTitle}>Todavía no hay bloques</Text>

            <Text style={styles.emptyDescription}>
              Creá el primer bloque para empezar a organizar la rutina por
              semanas.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.blockNumber}>
                <Text style={styles.blockNumberText}>
                  {item.order_index}
                </Text>
              </View>

              <View style={styles.blockInfo}>
                <Text style={styles.blockTitle}>{item.name}</Text>

                <Text style={styles.blockDescription}>
                  {item.description || "Sin descripción"}
                </Text>
              </View>
            </View>

            <View style={styles.blockMetaRow}>
              <View style={styles.metaPill}>
                <MaterialIcons
                  name="calendar-month"
                  size={16}
                  color={COLORS.primary}
                />

                <Text style={styles.metaPillText}>
                  {item.weeks} {item.weeks === 1 ? "semana" : "semanas"}
                </Text>
              </View>

              <View style={styles.metaPillSoft}>
                <Text style={styles.metaPillSoftText}>
                  Bloque {item.order_index}
                </Text>
              </View>
            </View>

            <View style={styles.cardActions}>
              <CustomButton
                title="Abrir bloque"
                variant="secondary"
                size="sm"
                fullWidth={false}
                onPress={() => goToBlock(item.id)}
              />
            </View>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            <CustomButton
              title="Eliminar rutina"
              variant="danger"
              size="sm"
              fullWidth={false}
              onPress={deleteRoutine}
            />
          </View>
        }
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

  listContent: {
    paddingTop: SPACING.lg,
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
    color: COLORS.primary,
    fontWeight: "700",
    marginBottom: SPACING.xs,
  },

  title: {
    ...(TYPOGRAPHY.h2 as TextStyle),
    color: COLORS.onSurface,
  },

  routineCard: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    ...SHADOWS.card,
  },

  routineIcon: {
    width: 54,
    height: 54,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },

  routineContent: {
    flex: 1,
  },

  routineTitle: {
    ...(TYPOGRAPHY.bodyLg as TextStyle),
    color: COLORS.onSurface,
    fontWeight: "800",
    marginBottom: SPACING.xs,
  },

  routineDescription: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    color: COLORS.onSurfaceVariant,
    lineHeight: 21,
  },

  statsRow: {
    flexDirection: "row",
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },

  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  statNumber: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },

  statLabel: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.onSurfaceVariant,
    fontWeight: "600",
  },

  primaryAction: {
    marginBottom: SPACING.xl,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },

  sectionTitle: {
    ...(TYPOGRAPHY.bodyLg as TextStyle),
    color: COLORS.onSurface,
    fontWeight: "800",
  },

  countBadge: {
    minWidth: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  countBadgeText: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.onSurfaceVariant,
    fontWeight: "700",
  },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    ...SHADOWS.card,
  },

  cardHeader: {
    flexDirection: "row",
    marginBottom: SPACING.md,
  },

  blockNumber: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  blockNumberText: {
    ...(TYPOGRAPHY.bodyLg as TextStyle),
    color: COLORS.primary,
    fontWeight: "900",
  },

  blockInfo: {
    flex: 1,
  },

  blockTitle: {
    ...(TYPOGRAPHY.bodyLg as TextStyle),
    fontWeight: "800",
    color: COLORS.onSurface,
    marginBottom: SPACING.xs,
  },

  blockDescription: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.onSurfaceVariant,
    lineHeight: 20,
  },

  blockMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },

  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },

  metaPillText: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.onSurface,
    fontWeight: "700",
  },

  metaPillSoft: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },

  metaPillSoftText: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.onSurfaceVariant,
    fontWeight: "600",
  },

  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },

  emptyBlocks: {
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

  footer: {
    marginTop: SPACING.lg,
    alignItems: "center",
  },
});
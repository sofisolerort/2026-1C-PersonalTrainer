import { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Alert,
  TextStyle,
  ScrollView,
} from "react-native";
import {
  useLocalSearchParams,
  router,
  useFocusEffect,
} from "expo-router";
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

type Block = {
  id: string;
  routine_id: string;
  name: string;
  description: string | null;
  order_index: number;
  weeks: number;
};

type RoutineDay = {
  id: string;
  block_id: string;
  day_number: number;
  day_name: string;
};

export default function VerBloque() {
  const { blockId } = useLocalSearchParams<{
    blockId: string;
  }>();

  const [block, setBlock] = useState<Block | null>(null);
  const [days, setDays] = useState<RoutineDay[]>([]);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchBlock();
    }, [blockId])
  );

  const fetchBlock = async () => {
    if (!blockId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data: blockData, error: blockError } = await supabase
      .from("blocks")
      .select("*")
      .eq("id", blockId)
      .maybeSingle();

    if (blockError || !blockData) {
      setBlock(null);
      setDays([]);
      setLoading(false);
      return;
    }

    setBlock(blockData);

    const { data: daysData, error: daysError } = await supabase
      .from("routine_days")
      .select("*")
      .eq("block_id", blockData.id)
      .order("day_number", { ascending: true });

    if (daysError) {
      Alert.alert("Error", daysError.message);
      setDays([]);
    } else {
      setDays(daysData ?? []);
    }

    setLoading(false);
  };

  const deleteBlock = async () => {
    if (!block) return;

    Alert.alert(
      "Eliminar bloque",
      "Se eliminará el bloque con sus días, ejercicios y progresiones.",
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
              .from("blocks")
              .delete()
              .eq("id", block.id);

            if (error) {
              Alert.alert("Error", error.message);
              return;
            }

            Alert.alert("Éxito", "Bloque eliminado");
            router.back();
          },
        },
      ]
    );
  };

  const goToCreateDay = () => {
    if (!block) return;

    router.push({
      pathname: "/(trainer)/clients/CrearDia",
      params: {
        blockId: block.id,
      },
    } as any);
  };

  const goToDayDetail = (day: RoutineDay) => {
    router.push({
      pathname: "/(trainer)/clients/DayDetail",
      params: {
        dayId: day.id,
        dayName: day.day_name,
        weekNumber: String(selectedWeek),
      },
    } as any);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!block) {
    return (
      <View style={styles.center}>
        <View style={styles.emptyState}>
          <MaterialIcons
            name="view-week"
            size={42}
            color={COLORS.onSurfaceVariant}
          />

          <Text style={styles.emptyTitle}>No se encontró el bloque</Text>

          <Text style={styles.emptyDescription}>
            Volvé a la rutina e intentá abrirlo nuevamente.
          </Text>
        </View>
      </View>
    );
  }

  const weeks = Array.from(
    { length: block.weeks },
    (_, index) => index + 1
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={days}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          days.length === 0
            ? styles.emptyListContent
            : styles.listContent
        }
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <Text style={styles.kicker}>Bloque de entrenamiento</Text>
              <Text style={styles.title}>{block.name}</Text>
            </View>

            <View style={styles.heroCard}>
              <View style={styles.heroTop}>
                <View style={styles.heroIcon}>
                  <MaterialIcons
                    name="fitness-center"
                    size={28}
                    color={COLORS.onPrimary}
                  />
                </View>

                <View style={styles.heroContent}>
                  <Text style={styles.heroTitle}>
                    Bloque {block.order_index}
                  </Text>

                  <Text style={styles.heroDescription}>
                    {block.description || "Sin descripción cargada"}
                  </Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{block.weeks}</Text>
                  <Text style={styles.statLabel}>
                    {block.weeks === 1 ? "semana" : "semanas"}
                  </Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{days.length}</Text>
                  <Text style={styles.statLabel}>
                    {days.length === 1 ? "día" : "días"}
                  </Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{selectedWeek}</Text>
                  <Text style={styles.statLabel}> semana actual</Text>
                </View>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Semanas</Text>
                <Text style={styles.sectionSubtitle}>
                  Elegí la semana que querés planificar
                </Text>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.weeksScroll}
            >
              {weeks.map((week) => {
                const isSelected = selectedWeek === week;

                return (
                  <TouchableOpacity
                    key={week}
                    activeOpacity={0.8}
                    style={[
                      styles.weekChip,
                      isSelected && styles.weekChipSelected,
                    ]}
                    onPress={() => setSelectedWeek(week)}
                  >
                    <Text
                      style={[
                        styles.weekNumber,
                        isSelected && styles.weekNumberSelected,
                      ]}
                    >
                      {week}
                    </Text>

                    <Text
                      style={[
                        styles.weekLabel,
                        isSelected && styles.weekLabelSelected,
                      ]}
                    >
                      Semana
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.selectedWeekCard}>
              <MaterialIcons
                name="calendar-today"
                size={20}
                color={COLORS.primary}
              />

              <Text style={styles.selectedWeekText}>
                Estás viendo la planificación de la semana {selectedWeek}
              </Text>
            </View>

            <View style={styles.actionRow}>
              <CustomButton
                title="Crear día"
                variant="primary"
                size="md"
                onPress={goToCreateDay}
              />
            </View>

            <View style={styles.daysHeader}>
              <View>
                <Text style={styles.sectionTitle}>Días del bloque</Text>
                <Text style={styles.sectionSubtitle}>
                  Entrá a un día para cargar ejercicios y progresiones
                </Text>
              </View>

              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{days.length}</Text>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyDays}>
            <View style={styles.emptyIcon}>
              <MaterialIcons
                name="event-note"
                size={34}
                color={COLORS.onSurfaceVariant}
              />
            </View>

            <Text style={styles.emptyTitle}>
              Todavía no hay días cargados
            </Text>

            <Text style={styles.emptyDescription}>
              Creá el primer día del bloque. Después vas a poder agregar
              ejercicios y progresiones por semana.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.dayCard}
            onPress={() => goToDayDetail(item)}
          >
            <View style={styles.dayCardTop}>
              <View style={styles.dayNumberBox}>
                <Text style={styles.dayNumberText}>
                  {item.day_number}
                </Text>
              </View>

              <View style={styles.dayInfo}>
                <Text style={styles.dayTitle}>{item.day_name}</Text>

                <Text style={styles.dayMeta}>
                  Semana seleccionada: {selectedWeek}
                </Text>
              </View>

              <MaterialIcons
                name="chevron-right"
                size={26}
                color={COLORS.onSurfaceVariant}
              />
            </View>

            <View style={styles.dayFooter}>
              <View style={styles.dayPill}>
                <MaterialIcons
                  name="schedule"
                  size={15}
                  color={COLORS.primary}
                />

                <Text style={styles.dayPillText}>
                  Día {item.day_number}
                </Text>
              </View>

              <CustomButton
                title="Abrir"
                variant="secondary"
                size="sm"
                fullWidth={false}
                onPress={() => goToDayDetail(item)}
              />
            </View>
          </TouchableOpacity>
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            <CustomButton
              title="Eliminar bloque"
              variant="danger"
              size="sm"
              fullWidth={false}
              onPress={deleteBlock}
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
    marginBottom: SPACING.xl,
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

  sectionHeader: {
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
  },

  weeksScroll: {
    gap: SPACING.sm,
    paddingBottom: SPACING.md,
  },

  weekChip: {
    minWidth: 76,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    alignItems: "center",
  },

  weekChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  weekNumber: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.onSurface,
    marginBottom: 2,
  },

  weekNumberSelected: {
    color: COLORS.onPrimary,
  },

  weekLabel: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.onSurfaceVariant,
    fontWeight: "600",
  },

  weekLabelSelected: {
    color: COLORS.onPrimary,
  },

  selectedWeekCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },

  selectedWeekText: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.onSurfaceVariant,
    flex: 1,
    fontWeight: "600",
  },

  actionRow: {
    marginBottom: SPACING.xl,
  },

  daysHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.md,
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

  dayCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    ...SHADOWS.card,
  },

  dayCardTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },

  dayNumberBox: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },

  dayNumberText: {
    ...(TYPOGRAPHY.bodyLg as TextStyle),
    color: COLORS.primary,
    fontWeight: "900",
  },

  dayInfo: {
    flex: 1,
  },

  dayTitle: {
    ...(TYPOGRAPHY.bodyLg as TextStyle),
    fontWeight: "800",
    color: COLORS.onSurface,
    marginBottom: SPACING.xs,
  },

  dayMeta: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.onSurfaceVariant,
    fontWeight: "600",
  },

  dayFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  dayPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },

  dayPillText: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.onSurface,
    fontWeight: "700",
  },

  emptyDays: {
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
    alignItems: "center",
    marginTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
});
import { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TextStyle,
} from "react-native";
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { supabase } from "../../../utils/Supabase";
import {
  COLORS,
  SPACING,
  RADIUS,
  SHADOWS,
  TYPOGRAPHY,
} from "@/constants/theme";

type Block = {
  id: string;
  name: string;
  description: string | null;
  weeks: number;
};

type RoutineDay = {
  id: string;
  block_id: string;
  day_number: number;
  day_name: string;
};

export default function BloqueCliente() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [block, setBlock] = useState<Block | null>(null);
  const [days, setDays] = useState<RoutineDay[]>([]);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchBlock();
    }, [id]),
  );

  const fetchBlock = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data: blockData, error } = await supabase
      .from("blocks")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !blockData) {
      setBlock(null);
      setDays([]);
      setLoading(false);
      return;
    }

    setBlock(blockData);

    const { data: daysData } = await supabase
      .from("routine_days")
      .select("*")
      .eq("block_id", blockData.id)
      .order("day_number", { ascending: true });

    setDays(daysData ?? []);
    setLoading(false);
  };

  const openDay = (day: RoutineDay) => {
    router.push({
      pathname: "/(client)/ejercicios/[id]",
      params: {
        id: day.id,
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
        <Text style={styles.muted}>No se encontró el bloque</Text>
      </View>
    );
  }

  const weeks = Array.from({ length: block.weeks }, (_, i) => i + 1);

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={days}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={
        <Text style={styles.muted}>Este bloque todavía no tiene días.</Text>
      }
      ListHeaderComponent={
        <View>
          <Text style={styles.title}>{block.name}</Text>
          {block.description ? (
            <Text style={styles.description}>{block.description}</Text>
          ) : null}

          <Text style={styles.subtitle}>Elegí la semana</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.weeksRow}
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
                      styles.weekChipText,
                      isSelected && styles.weekChipTextSelected,
                    ]}
                  >
                    Semana {week}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={styles.subtitle}>Días</Text>
        </View>
      }
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => openDay(item)}>
          <View style={styles.cardNumber}>
            <Text style={styles.cardNumberText}>{item.day_number}</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{item.day_name}</Text>
            <Text style={styles.cardSub}>Semana {selectedWeek}</Text>
          </View>
          <MaterialIcons
            name="chevron-right"
            size={24}
            color={COLORS.onSurfaceVariant}
          />
        </TouchableOpacity>
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
    paddingBottom: SPACING.xl,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  title: {
    ...(TYPOGRAPHY.h2 as TextStyle),
    color: COLORS.onSurface,
    marginBottom: SPACING.xs,
  },
  description: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    color: COLORS.onSurfaceVariant,
    marginBottom: SPACING.md,
  },
  subtitle: {
    ...(TYPOGRAPHY.bodyLg as TextStyle),
    fontWeight: "700",
    color: COLORS.onSurface,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  weeksRow: {
    gap: SPACING.sm,
    paddingBottom: SPACING.xs,
    alignItems: "flex-start",
  },
  weekChip: {
    minWidth: 90,
    alignItems: "center",
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surface,
  },
  weekChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  weekChipText: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    color: COLORS.onSurface,
    fontWeight: "600",
  },
  weekChipTextSelected: {
    color: COLORS.onPrimary,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  cardNumber: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  cardNumberText: {
    ...(TYPOGRAPHY.bodyLg as TextStyle),
    color: COLORS.primary,
    fontWeight: "800",
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    ...(TYPOGRAPHY.bodyLg as TextStyle),
    color: COLORS.onSurface,
    fontWeight: "700",
  },
  cardSub: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.onSurfaceVariant,
    marginTop: SPACING.xs,
  },
  muted: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
  },
});

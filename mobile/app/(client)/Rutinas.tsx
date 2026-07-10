import { useCallback, useState } from "react";
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
import { MaterialIcons } from "@expo/vector-icons";
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

type Block = {
  id: string;
  name: string;
  description: string | null;
  weeks: number;
  order_index: number;
};

export default function RutinasCliente() {
  const { user } = useAuth();

  const [routine, setRoutine] = useState<Routine | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);

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

    // 1) Mi rutina
    const { data: routineData, error } = await supabase
      .from("routines")
      .select("*")
      .eq("client_id", user.id)
      .maybeSingle();

    if (error || !routineData) {
      setRoutine(null);
      setBlocks([]);
      setLoading(false);
      return;
    }

    setRoutine(routineData);

    // 2) Los bloques de esa rutina
    const { data: blocksData } = await supabase
      .from("blocks")
      .select("*")
      .eq("routine_id", routineData.id)
      .order("order_index");

    setBlocks(blocksData ?? []);
    setLoading(false);
  };

  const openBlock = (block: Block) => {
    router.push({
      pathname: "/(client)/bloque/[id]",
      params: { id: block.id, blockName: block.name },
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
        <Text style={styles.muted}>
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

      <Text style={styles.subtitle}>Bloques</Text>

      <FlatList
        data={blocks}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.muted}>Todavía no hay bloques en tu rutina.</Text>
        }
        contentContainerStyle={{ paddingBottom: SPACING.xl }}
        renderItem={({ item, index }) => (
          <TouchableOpacity style={styles.card} onPress={() => openBlock(item)}>
            <View style={styles.cardNumber}>
              <Text style={styles.cardNumberText}>{index + 1}</Text>
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardSub}>
                {item.weeks} {item.weeks === 1 ? "semana" : "semanas"}
              </Text>
            </View>
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={COLORS.onSurfaceVariant}
            />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
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
    marginBottom: SPACING.md,
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

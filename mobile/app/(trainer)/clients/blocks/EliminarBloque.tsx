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

type Block = {
  id: string;
  routine_id: string;
  name: string;
  description: string | null;
  weeks: number;
  order_index: number;
};

type RoutineDay = {
  id: string;
};

export default function EliminarBloque() {
  const { blockId } = useLocalSearchParams<{
    blockId: string;
  }>();

  const [block, setBlock] = useState<Block | null>(null);
  const [daysCount, setDaysCount] = useState(0);

  const [loadingInitialData, setLoadingInitialData] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchBlock();
  }, [blockId]);

  const fetchBlock = async () => {
    if (!blockId) {
      setLoadingInitialData(false);
      return;
    }

    setLoadingInitialData(true);

    const { data: blockData, error: blockError } = await supabase
      .from("blocks")
      .select("*")
      .eq("id", blockId)
      .maybeSingle();

    if (blockError || !blockData) {
      setBlock(null);
      setDaysCount(0);
      setLoadingInitialData(false);
      return;
    }

    const { data: daysData, error: daysError } = await supabase
      .from("routine_days")
      .select("id")
      .eq("block_id", blockId);

    if (daysError) {
      setDaysCount(0);
    } else {
      setDaysCount((daysData as RoutineDay[] | null)?.length ?? 0);
    }

    setBlock(blockData as Block);
    setLoadingInitialData(false);
  };

  const confirmDelete = () => {
    if (!block) return;

    Alert.alert(
      "Eliminar bloque",
      `¿Seguro que querés eliminar "${block.name}"? Esta acción no se puede deshacer.`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: deleteBlock,
        },
      ]
    );
  };

  const deleteBlock = async () => {
    if (!block) return;

    setDeleting(true);

    const { error } = await supabase
      .from("blocks")
      .delete()
      .eq("id", block.id);

    setDeleting(false);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    Alert.alert("Éxito", "Bloque eliminado correctamente");
    router.back();
  };

  if (loadingInitialData) {
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
            name="error-outline"
            size={46}
            color={COLORS.onSurfaceVariant}
          />

          <Text style={styles.emptyTitle}>No se encontró el bloque</Text>

          <Text style={styles.emptyDescription}>
            Volvé a la rutina e intentá abrirlo nuevamente.
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
        <Text style={styles.kicker}>Eliminar bloque</Text>

        <Text style={styles.title}>{block.name}</Text>

        <Text style={styles.subtitle}>
          Bloque {block.order_index} · {block.weeks} semanas
        </Text>
      </View>

      <View style={styles.warningCard}>
        <View style={styles.warningIcon}>
          <MaterialIcons
            name="warning"
            size={30}
            color={COLORS.onPrimary}
          />
        </View>

        <Text style={styles.warningTitle}>Esta acción es permanente</Text>

        <Text style={styles.warningDescription}>
          Al eliminar este bloque también se eliminarán sus días, ejercicios y
          progresiones asociadas.
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="view-week" size={20} color={COLORS.primary} />

          <Text style={styles.sectionTitle}>Resumen del bloque</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Nombre</Text>
          <Text style={styles.infoValue}>{block.name}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Descripción</Text>
          <Text style={styles.infoValue}>
            {block.description || "Sin descripción"}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Duración</Text>
          <Text style={styles.infoValue}>
            {block.weeks} {block.weeks === 1 ? "semana" : "semanas"}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Días cargados</Text>
          <Text style={styles.infoValue}>{daysCount}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <CustomButton
          title={deleting ? "Eliminando..." : "Eliminar bloque"}
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

  actions: {
    marginTop: SPACING.sm,
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
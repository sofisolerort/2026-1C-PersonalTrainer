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
import { CustomInput } from "@/components/CustomInput";
import { CustomButton } from "@/components/CustomButton";

import {
  COLORS,
  SPACING,
  RADIUS,
  SHADOWS,
  TYPOGRAPHY,
} from "@/constants/theme";

type RoutineDay = {
  id: string;
  block_id: string;
  day_number: number;
  day_name: string;
};

type Block = {
  id: string;
  name: string;
};

export default function EditarDia() {
  const { dayId } = useLocalSearchParams<{
    dayId: string;
  }>();

  const [day, setDay] = useState<RoutineDay | null>(null);
  const [block, setBlock] = useState<Block | null>(null);

  const [dayName, setDayName] = useState("");

  const [loadingInitialData, setLoadingInitialData] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDay();
  }, [dayId]);

  const fetchDay = async () => {
    if (!dayId) {
      setLoadingInitialData(false);
      return;
    }

    setLoadingInitialData(true);

    const { data: dayData, error: dayError } = await supabase
      .from("routine_days")
      .select("id, block_id, day_number, day_name")
      .eq("id", dayId)
      .maybeSingle();

    if (dayError || !dayData) {
      setDay(null);
      setBlock(null);
      setLoadingInitialData(false);
      return;
    }

    const currentDay = dayData as RoutineDay;

    setDay(currentDay);
    setDayName(currentDay.day_name);

    const { data: blockData } = await supabase
      .from("blocks")
      .select("id, name")
      .eq("id", currentDay.block_id)
      .maybeSingle();

    setBlock((blockData as Block | null) ?? null);

    setLoadingInitialData(false);
  };

  const updateDay = async () => {
    if (!day) {
      Alert.alert("Error", "No se encontró el día");
      return;
    }

    if (!dayName.trim()) {
      Alert.alert("Error", "Ingresá un nombre para el día");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("routine_days")
      .update({
        day_name: dayName.trim(),
      })
      .eq("id", day.id);

    setSaving(false);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    Alert.alert("Éxito", "Día actualizado correctamente");
    router.back();
  };

  if (loadingInitialData) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!day) {
    return (
      <View style={styles.center}>
        <View style={styles.emptyState}>
          <MaterialIcons
            name="event-busy"
            size={46}
            color={COLORS.onSurfaceVariant}
          />

          <Text style={styles.emptyTitle}>No se encontró el día</Text>

          <Text style={styles.emptyDescription}>
            Volvé al bloque e intentá abrirlo nuevamente.
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
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.kicker}>Editar día</Text>

        <Text style={styles.title}>Día {day.day_number}</Text>

        <Text style={styles.subtitle}>
          {block ? `Bloque: ${block.name}` : "Bloque no encontrado"}
        </Text>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoIcon}>
          <MaterialIcons name="edit" size={24} color={COLORS.onPrimary} />
        </View>

        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>Modificar nombre</Text>

          <Text style={styles.infoDescription}>
            El número del día se mantiene fijo para conservar el orden del
            bloque.
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="event-note" size={20} color={COLORS.primary} />

          <Text style={styles.sectionTitle}>Datos del día</Text>
        </View>

        <View style={styles.dayNumberBox}>
          <Text style={styles.dayNumberLabel}>Número del día</Text>

          <Text style={styles.dayNumberText}>Día {day.day_number}</Text>
        </View>

        <CustomInput
          label="Nombre del día"
          value={dayName}
          onChangeText={setDayName}
          placeholder="Ej: Lower A, Upper A, Sentadilla + banca"
        />

        <View style={styles.previewBox}>
          <Text style={styles.previewLabel}>Vista previa</Text>

          <Text style={styles.previewTitle}>
            Día {day.day_number}: {dayName.trim() || "Nombre del día"}
          </Text>
        </View>
      </View>

      <CustomButton
        title={saving ? "Guardando..." : "Guardar cambios"}
        variant="primary"
        size="md"
        onPress={updateDay}
        loading={saving}
      />

      <View style={styles.cancelWrapper}>
        <CustomButton
          title="Cancelar"
          variant="ghost"
          size="sm"
          fullWidth={false}
          onPress={() => router.back()}
          disabled={saving}
        />
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
    color: COLORS.primary,
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

  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    ...SHADOWS.card,
  },

  infoIcon: {
    width: 50,
    height: 50,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    ...(TYPOGRAPHY.bodyLg as TextStyle),
    color: COLORS.onSurface,
    fontWeight: "900",
    marginBottom: SPACING.xs,
  },

  infoDescription: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.onSurfaceVariant,
    lineHeight: 19,
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

  dayNumberBox: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    marginBottom: SPACING.md,
  },

  dayNumberLabel: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.onSurfaceVariant,
    fontWeight: "700",
    marginBottom: SPACING.xs,
  },

  dayNumberText: {
    ...(TYPOGRAPHY.bodyLg as TextStyle),
    color: COLORS.primary,
    fontWeight: "900",
  },

  previewBox: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  previewLabel: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.onSurfaceVariant,
    fontWeight: "700",
    marginBottom: SPACING.xs,
  },

  previewTitle: {
    ...(TYPOGRAPHY.bodyLg as TextStyle),
    color: COLORS.onSurface,
    fontWeight: "900",
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
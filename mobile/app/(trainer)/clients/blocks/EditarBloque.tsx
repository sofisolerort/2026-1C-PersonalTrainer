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
import CustomPicker from "@/components/CustomPicker";
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

export default function EditarBloque() {
  const { blockId } = useLocalSearchParams<{
    blockId: string;
  }>();

  const [block, setBlock] = useState<Block | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [weeks, setWeeks] = useState(4);

  const [loadingInitialData, setLoadingInitialData] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBlock();
  }, [blockId]);

  const fetchBlock = async () => {
    if (!blockId) {
      setLoadingInitialData(false);
      return;
    }

    setLoadingInitialData(true);

    const { data, error } = await supabase
      .from("blocks")
      .select("*")
      .eq("id", blockId)
      .maybeSingle();

    if (error || !data) {
      setBlock(null);
      setLoadingInitialData(false);
      return;
    }

    const currentBlock = data as Block;

    setBlock(currentBlock);
    setName(currentBlock.name);
    setDescription(currentBlock.description ?? "");
    setWeeks(currentBlock.weeks);

    setLoadingInitialData(false);
  };

  const updateBlock = async () => {
    if (!block) {
      Alert.alert("Error", "No se encontró el bloque");
      return;
    }

    if (!name.trim()) {
      Alert.alert("Error", "Ingresá un nombre para el bloque");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("blocks")
      .update({
        name: name.trim(),
        description: description.trim() || null,
        weeks,
      })
      .eq("id", block.id);

    setSaving(false);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    Alert.alert("Éxito", "Bloque actualizado");
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
            name="view-week"
            size={42}
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
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.kicker}>Editar bloque</Text>

        <Text style={styles.title}>{block.name}</Text>

        <Text style={styles.subtitle}>
          Bloque {block.order_index} · {block.weeks} semanas
        </Text>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoIcon}>
          <MaterialIcons name="edit" size={24} color={COLORS.onPrimary} />
        </View>

        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>Modificar bloque</Text>

          <Text style={styles.infoDescription}>
            Podés cambiar el nombre, la descripción y la cantidad de semanas del
            bloque.
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="view-week" size={20} color={COLORS.primary} />

          <Text style={styles.sectionTitle}>Datos del bloque</Text>
        </View>

        <CustomInput
          label="Nombre del bloque"
          value={name}
          onChangeText={setName}
          placeholder="Ej: Bloque de fuerza"
        />

        <CustomInput
          label="Descripción"
          value={description}
          onChangeText={setDescription}
          placeholder="Objetivo del bloque"
          multiline
        />

        <CustomPicker
          label="Cantidad de semanas"
          selectedValue={weeks}
          onValueChange={(value) => setWeeks(value)}
          items={[4, 5, 6, 7, 8].map((week) => ({
            label: `${week} semanas`,
            value: week,
          }))}
        />

        <View style={styles.previewBox}>
          <Text style={styles.previewLabel}>Vista previa</Text>

          <Text style={styles.previewTitle}>
            {name.trim() || "Nombre del bloque"}
          </Text>

          <Text style={styles.previewDescription}>
            {description.trim() || "Sin descripción"}
          </Text>

          <Text style={styles.previewWeeks}>
            Duración: {weeks} {weeks === 1 ? "semana" : "semanas"}
          </Text>
        </View>
      </View>

      <CustomButton
        title={saving ? "Guardando..." : "Guardar cambios"}
        variant="primary"
        size="md"
        onPress={updateBlock}
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

  previewBox: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    marginTop: SPACING.sm,
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
    marginBottom: SPACING.xs,
  },

  previewDescription: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.onSurfaceVariant,
    lineHeight: 19,
    marginBottom: SPACING.sm,
  },

  previewWeeks: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.primary,
    fontWeight: "800",
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
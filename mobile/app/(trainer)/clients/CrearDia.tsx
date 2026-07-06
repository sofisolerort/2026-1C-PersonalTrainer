import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextStyle,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";

import { supabase } from "@/utils/Supabase";
import { CustomInput } from "@/components/CustomInput";
import { CustomButton } from "@/components/CustomButton";

import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
} from "@/constants/theme";

type Block = {
  id: string;
  name: string;
};

export default function CrearDia() {
  const { blockId } = useLocalSearchParams<{
    blockId: string;
  }>();

  const [block, setBlock] = useState<Block | null>(null);
  const [dayName, setDayName] = useState("");
  const [nextDayNumber, setNextDayNumber] = useState(1);
  const [loadingInitialData, setLoadingInitialData] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, [blockId]);

  const fetchInitialData = async () => {
    if (!blockId) {
      setLoadingInitialData(false);
      return;
    }

    setLoadingInitialData(true);

    const { data: blockData, error: blockError } = await supabase
      .from("blocks")
      .select("id, name")
      .eq("id", blockId)
      .maybeSingle();

    if (blockError || !blockData) {
      setBlock(null);
      setLoadingInitialData(false);
      return;
    }

    setBlock(blockData);

    const { data: daysData, error: daysError } = await supabase
      .from("routine_days")
      .select("day_number")
      .eq("block_id", blockId)
      .order("day_number", { ascending: false })
      .limit(1);

    if (daysError) {
      Alert.alert("Error", daysError.message);
      setNextDayNumber(1);
    } else {
      const lastDayNumber = daysData?.[0]?.day_number ?? 0;
      setNextDayNumber(lastDayNumber + 1);
    }

    setLoadingInitialData(false);
  };

  const createDay = async () => {
    if (!blockId) {
      Alert.alert("Error", "No se encontró el bloque");
      return;
    }

    if (!dayName.trim()) {
      Alert.alert("Error", "Ingresá un nombre para el día");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("routine_days")
      .insert({
        block_id: blockId,
        day_number: nextDayNumber,
        day_name: dayName.trim(),
      });

    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    Alert.alert("Éxito", "Día creado correctamente");
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
        <Text style={styles.empty}>No se encontró el bloque</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Día</Text>

      <Text style={styles.subtitle}>
        Bloque: {block.name}
      </Text>

      <View style={styles.dayNumberBox}>
        <Text style={styles.dayNumberLabel}>
          Se creará como:
        </Text>

        <Text style={styles.dayNumberText}>
          Día {nextDayNumber}
        </Text>
      </View>

      <CustomInput
        label="Nombre del día"
        value={dayName}
        onChangeText={setDayName}
        placeholder="Ej: Lower A, Upper A, Sentadilla + banca"
      />

      <CustomButton
        title={loading ? "Creando..." : "Crear día"}
        onPress={createDay}
        loading={loading}
      />
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

  title: {
    ...(TYPOGRAPHY.h2 as TextStyle),
    color: COLORS.onSurface,
    marginBottom: SPACING.sm,
  },

  subtitle: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    color: COLORS.onSurfaceVariant,
    marginBottom: SPACING.lg,
  },

  dayNumberBox: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.lg,
  },

  dayNumberLabel: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.onSurfaceVariant,
    marginBottom: SPACING.xs,
  },

  dayNumberText: {
    ...(TYPOGRAPHY.bodyLg as TextStyle),
    color: COLORS.onSurface,
    fontWeight: "700",
  },

  empty: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
  },
});
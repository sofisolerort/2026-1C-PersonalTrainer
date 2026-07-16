import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TextStyle,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { supabase } from "@/utils/Supabase";

import { CustomInput } from "@/components/CustomInput";
import CustomPicker from "@/components/CustomPicker";
import { CustomButton } from "@/components/CustomButton";

import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
} from "@/constants/theme";

export default function CrearBloque() {
  const { routineId } = useLocalSearchParams<{
    routineId: string;
  }>();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [weeks, setWeeks] = useState(4);
  const [loading, setLoading] = useState(false);

  const createBlock = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Ingresá un nombre para el bloque");
      return;
    }

    setLoading(true);

    // calcular order_index
    const { data: existingBlocks } = await supabase
      .from("blocks")
      .select("id")
      .eq("routine_id", routineId);

    const nextOrder = (existingBlocks?.length ?? 0) + 1;

    const { error } = await supabase
      .from("blocks")
      .insert({
        routine_id: routineId,
        name,
        description,
        weeks,
        order_index: nextOrder,
      });

    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    Alert.alert("Éxito", "Bloque creado");
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Bloque</Text>

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
      />

      <CustomPicker
        label="Cantidad de semanas"
        selectedValue={weeks}
        onValueChange={(value) => setWeeks(value)}
        items={[4, 5, 6, 7, 8].map((w) => ({
          label: `${w} semanas`,
          value: w,
        }))}
      />

      <CustomButton
        title={loading ? "Creando..." : "Crear bloque"}
        onPress={createBlock}
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

  title: {
    ...(TYPOGRAPHY.h2 as TextStyle),
    color: COLORS.onSurface,
    marginBottom: SPACING.xl,
  },
});
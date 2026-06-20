import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextStyle,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { supabase } from "../../../utils/Supabase";
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from "@/constants/theme";

export default function CrearRutina() {
  const { clientId } = useLocalSearchParams();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const createRoutine = async () => {
    try {
      if (!title.trim()) {
        Alert.alert("Error", "Ingresá un título");
        return;
      }

      // STEP 1: traer cliente (para saber cuántos días entrena)
      const { data: clientData, error: clientError } = await supabase
        .from("profiles")
        .select("training_days")
        .eq("id", clientId)
        .single();

      if (clientError) {
        Alert.alert("Error cliente", clientError.message);
        return;
      }

      const dias = clientData?.training_days;

      // STEP 2: crear rutina
      const { data: routineData, error: routineError } = await supabase
        .from("routines")
        .insert({
          client_id: clientId,
          title,
          description,
        })
        .select()
        .single();

      if (routineError) {
        Alert.alert("Error rutina", routineError.message);
        return;
      }

      // STEP 3: armar días
      const daysToInsert = [];

      for (let i = 1; i <= dias; i++) {
        daysToInsert.push({
          routine_id: routineData.id,
          day_number: i,
          day_name: `Día ${i}`,
        });
      }

      // STEP 4: insertar días
      const { error: daysError } = await supabase
        .from("routine_days")
        .insert(daysToInsert)
        .select();

      if (daysError) {
        Alert.alert("Error días", daysError.message);
        return;
      }

      Alert.alert("Éxito", "Rutina y días creados");
      router.back();
    } catch (error: any) {
      Alert.alert("Error inesperado", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Rutina</Text>

      <TextInput
        placeholder="Título"
        placeholderTextColor={COLORS.onSurfaceVariant}
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />

      <TextInput
        placeholder="Descripción"
        placeholderTextColor={COLORS.onSurfaceVariant}
        value={description}
        onChangeText={setDescription}
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={createRoutine}>
        <Text style={styles.buttonText}>Guardar Rutina</Text>
      </TouchableOpacity>
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
    marginBottom: SPACING.lg,
  },
  input: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    color: COLORS.onSurface,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  buttonText: {
    ...(TYPOGRAPHY.button as TextStyle),
    color: COLORS.onPrimary,
    textAlign: "center",
  },
});

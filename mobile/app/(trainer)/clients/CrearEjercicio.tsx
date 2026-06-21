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

export default function CrearEjercicio() {
  const { dayId } = useLocalSearchParams();

  const [name, setName] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");

  const createExercise = async () => {
    const { error } = await supabase.from("exercises").insert({
      routine_day_id: dayId,
      name,
      sets: Number(sets),
      reps: Number(reps),
      suggested_weight: Number(weight),
    });

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    Alert.alert("Éxito", "Ejercicio creado");
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Ejercicio</Text>

      <TextInput
        placeholder="Ejercicio"
        placeholderTextColor={COLORS.onSurfaceVariant}
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <TextInput
        placeholder="Sets"
        placeholderTextColor={COLORS.onSurfaceVariant}
        value={sets}
        onChangeText={setSets}
        keyboardType="numeric"
        style={styles.input}
      />

      <TextInput
        placeholder="Reps"
        placeholderTextColor={COLORS.onSurfaceVariant}
        value={reps}
        onChangeText={setReps}
        keyboardType="numeric"
        style={styles.input}
      />

      <TextInput
        placeholder="Peso sugerido"
        placeholderTextColor={COLORS.onSurfaceVariant}
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={createExercise}>
        <Text style={styles.buttonText}>Guardar</Text>
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

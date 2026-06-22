import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextStyle,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { supabase } from "../../../utils/Supabase";
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from "@/constants/theme";
import { KeyboardScreen } from "@/components/KeyboardScreen";

export default function EditarEjercicio() {
  const { exerciseId } = useLocalSearchParams();

  const [name, setName] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExercise();
  }, []);

  const fetchExercise = async () => {
    const { data, error } = await supabase
      .from("exercises")
      .select("*")
      .eq("id", exerciseId)
      .single();

    if (error) {
      Alert.alert("Error", error.message);
      setLoading(false);
      return;
    }

    setName(data.name ?? "");
    setSets(String(data.sets ?? ""));
    setReps(String(data.reps ?? ""));
    setWeight(String(data.suggested_weight ?? ""));
    setLoading(false);
  };

  const updateExercise = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Ingresá un nombre");
      return;
    }

    const { error } = await supabase
      .from("exercises")
      .update({
        name,
        sets: Number(sets),
        reps: Number(reps),
        suggested_weight: Number(weight),
      })
      .eq("id", exerciseId);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    Alert.alert("Éxito", "Ejercicio actualizado");
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <KeyboardScreen>
      <Text style={styles.title}>Editar Ejercicio</Text>

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

      <TouchableOpacity style={styles.button} onPress={updateExercise}>
        <Text style={styles.buttonText}>Guardar Cambios</Text>
      </TouchableOpacity>
    </KeyboardScreen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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

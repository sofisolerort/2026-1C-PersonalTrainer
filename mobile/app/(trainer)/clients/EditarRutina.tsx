import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextStyle,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { supabase } from "../../../utils/Supabase";
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from "@/constants/theme";

export default function EditarRutina() {
  const { clientId } = useLocalSearchParams();

  const [routineId, setRoutineId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoutine();
  }, []);

  const fetchRoutine = async () => {
    const { data, error } = await supabase
      .from("routines")
      .select("*")
      .eq("client_id", clientId)
      .single();

    if (error) {
      Alert.alert("Error", error.message);
      setLoading(false);
      return;
    }

    setRoutineId(data.id);
    setTitle(data.title ?? "");
    setDescription(data.description ?? "");
    setLoading(false);
  };

  const updateRoutine = async () => {
    if (!routineId) return;

    if (!title.trim()) {
      Alert.alert("Error", "Ingresá un título");
      return;
    }

    const { error } = await supabase
      .from("routines")
      .update({
        title,
        description,
      })
      .eq("id", routineId);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    Alert.alert("Éxito", "Rutina actualizada");
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
    <View style={styles.container}>
      <Text style={styles.title}>Editar info general de la Rutina</Text>

      <TextInput
        style={styles.input}
        placeholder="Título"
        placeholderTextColor={COLORS.onSurfaceVariant}
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={styles.input}
        placeholder="Descripción"
        placeholderTextColor={COLORS.onSurfaceVariant}
        value={description}
        onChangeText={setDescription}
      />

      <TouchableOpacity style={styles.button} onPress={updateRoutine}>
        <Text style={styles.buttonText}>Guardar cambios</Text>
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

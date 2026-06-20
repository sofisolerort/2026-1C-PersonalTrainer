import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { supabase } from "../../../utils/Supabase";

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
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Ejercicio</Text>

      <TextInput
        placeholder="Ejercicio"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <TextInput
        placeholder="Sets"
        value={sets}
        onChangeText={setSets}
        keyboardType="numeric"
        style={styles.input}
      />

      <TextInput
        placeholder="Reps"
        value={reps}
        onChangeText={setReps}
        keyboardType="numeric"
        style={styles.input}
      />

      <TextInput
        placeholder="Peso sugerido"
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={updateExercise}>
        <Text style={styles.buttonText}>Guardar Cambios</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },

  button: {
    backgroundColor: "#2563EB",
    padding: 16,
    borderRadius: 12,
  },

  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
});
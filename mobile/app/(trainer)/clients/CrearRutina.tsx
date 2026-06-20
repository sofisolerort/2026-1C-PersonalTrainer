import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { supabase } from "../../../utils/Supabase";

export default function CrearRutina() {
  const { clientId } = useLocalSearchParams();
  console.log("CREATE clientId:", clientId);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const createRoutine = async () => {
    try {
      console.log("=== INICIO createRoutine ===");

      if (!title.trim()) {
        Alert.alert("Error", "Ingresá un título");
        return;
      }

      // STEP 1: traer cliente
      const { data: clientData, error: clientError } = await supabase
        .from("profiles")
        .select("cant_dias_que_entrena")
        .eq("id", clientId)
        .single();

      console.log("clientData:", clientData);
      console.log("clientError:", clientError);

      if (clientError) {
        Alert.alert("Error cliente", clientError.message);
        return;
      }

      const dias = clientData?.cant_dias_que_entrena;
      console.log("Dias del cliente:", dias);

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

      console.log("routineData:", routineData);
      console.log("routineError:", routineError);

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

      console.log("daysToInsert:", daysToInsert);

      // STEP 4: insertar días
      const { data: insertedDays, error: daysError } = await supabase
        .from("routine_days")
        .insert(daysToInsert)
        .select();

      console.log("insertedDays:", insertedDays);
      console.log("daysError:", daysError);

      if (daysError) {
        Alert.alert("Error días", daysError.message);
        return;
      }

      console.log("=== FIN OK ===");
      Alert.alert("Éxito", "Rutina y días creados");
      router.back();
    } catch (error: any) {
      console.log("CATCH ERROR:", error);
      Alert.alert("Error inesperado", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Rutina</Text>

      <TextInput
        placeholder="Título"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />

      <TextInput
        placeholder="Descripción"
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
  container: { flex: 1, padding: 20 },
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
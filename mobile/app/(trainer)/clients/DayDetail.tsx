import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  useLocalSearchParams,
  router,
  useFocusEffect,
} from "expo-router";
import { supabase } from "../../../utils/Supabase";

type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: number;
  suggested_weight: number;
};

export default function DayDetail() {
  const { dayId, dayName, clientId } = useLocalSearchParams();

  const [exercises, setExercises] = useState<Exercise[]>([]);

  useFocusEffect(
    useCallback(() => {
      fetchExercises();
    }, [])
  );

  const fetchExercises = async () => {
    console.log("Refetching exercises...");

    const { data, error } = await supabase
      .from("exercises")
      .select("*")
      .eq("routine_day_id", dayId);

    if (error) {
      console.log("Fetch error:", error);
      return;
    }

    if (data) {
      console.log("Exercises loaded:", data.length);
      setExercises(data);
    }
  };

  const deleteExercise = async (exerciseId: string) => {
    Alert.alert(
      "Eliminar ejercicio",
      "¿Seguro que querés eliminar este ejercicio?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase
              .from("exercises")
              .delete()
              .eq("id", exerciseId);

            if (error) {
              Alert.alert("Error", error.message);
              return;
            }

            fetchExercises();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{dayName}</Text>

      
      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          router.push({
            pathname: "/(trainer)/clients/CrearEjercicio",
            params: { dayId },
          } as any)
        }
      >
        <Text style={styles.buttonText}>Agregar Ejercicio</Text>
      </TouchableOpacity>

      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text>No hay ejercicios todavía</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.exerciseName}>{item.name}</Text>

            <Text style={styles.exerciseInfo}>
              {item.sets} x {item.reps}
            </Text>

            <Text style={styles.exerciseInfo}>
              Peso sugerido: {item.suggested_weight} kg
            </Text>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() =>
                  router.push({
                    pathname: "/(trainer)/clients/EditarEjercicio",
                    params: { exerciseId: item.id },
                  } as any)
                }
              >
                <Text style={styles.actionText}>Editar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteExercise(item.id)}
              >
                <Text style={styles.actionText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },

  routineButton: {
    backgroundColor: "#7C3AED",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },

  button: {
    backgroundColor: "#2563EB",
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
  },

  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },

  card: {
    backgroundColor: "#E5E7EB",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },

  exerciseName: {
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 8,
  },

  exerciseInfo: {
    fontSize: 16,
    marginBottom: 4,
  },

  actions: {
    flexDirection: "row",
    marginTop: 16,
    gap: 10,
  },

  editButton: {
    flex: 1,
    backgroundColor: "#F59E0B",
    padding: 12,
    borderRadius: 10,
  },

  deleteButton: {
    flex: 1,
    backgroundColor: "#DC2626",
    padding: 12,
    borderRadius: 10,
  },

  actionText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
});
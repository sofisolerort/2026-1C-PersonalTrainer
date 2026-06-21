import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  Pressable,
  ActivityIndicator,
  TextStyle,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";

import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from "@/constants/theme";
import { supabase } from "@/utils/Supabase";
import { fetchExercisesByName, ApiExercise } from "@/utils/ExerciseApi";

// 🧠 Diccionario expandido y normalizado (Soporta sinónimos y variaciones)
const translateInputSmart = (input: string): string => {
  // Limpiamos acentos para mapear fácilmente
  const clean = input.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const map: Record<string, string> = {
    // Grupos principales
    pecho: "chest",
    pectoral: "chest",
    pectorales: "chest",
    espalda: "back",
    dorsal: "back",
    dorsales: "back",
    hombro: "shoulder",
    hombros: "shoulder",
    deltoides: "shoulder",

    // Brazos
    biceps: "biceps",
    triceps: "triceps",
    antebrazo: "forearm",
    antebrazos: "forearm",
    brazo: "arm",
    brazos: "arm",

    // Piernas / Glúteos
    pierna: "leg",
    piernas: "leg",
    cuadriceps: "quad",
    femorales: "hamstring",
    femoral: "hamstring",
    gluteo: "glute",
    gluteos: "glute",
    pantorrilla: "calf",
    pantorrillas: "calves",
    gemelos: "calves",

    // Core / Equipamiento
    abdomen: "abs",
    abdominales: "abs",
    abs: "abs",
    mancuerna: "dumbbell",
    mancuernas: "dumbbell",
    barra: "barbell",
    polea: "cable",
    sentadilla: "squat",
    estocadas: "lunge",
  };

  return map[clean] || clean;
};

export default function CrearEjercicio() {
  const { dayId } = useLocalSearchParams();

  const [name, setName] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ApiExercise[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔎 SEARCH POTENCIADO ARTIFICIALMENTE
  const searchExercises = async () => {
    try {
      const cleanQuery = query.trim().toLowerCase();
      if (!cleanQuery) {
        Alert.alert("Error", "Ingresá qué ejercicio o músculo buscas");
        return;
      }

      setLoading(true);

      // Traducción inteligente
      const searchParam = translateInputSmart(cleanQuery);

      const data: ApiExercise[] = await fetchExercisesByName(searchParam);

      // Re-ordenamiento artificial en Frontend (Scoring local)
      // Como la API solo devuelve 10, nos aseguramos de ordenar arriba los más relevantes
      const smartOrderedData = data.sort((a, b) => {
        const targetA = a.target?.toLowerCase() || "";
        const targetB = b.target?.toLowerCase() || "";
        const bodyA = a.bodyPart?.toLowerCase() || "";
        const bodyB = b.bodyPart?.toLowerCase() || "";
        const nameA = a.name?.toLowerCase() || "";
        const nameB = b.name?.toLowerCase() || "";

        let scoreA = 0;
        let scoreB = 0;

        // Si el músculo objetivo o la zona del cuerpo contiene la palabra clave, suma prioridad máxima
        if (targetA.includes(searchParam) || bodyA.includes(searchParam))
          scoreA += 10;
        if (targetB.includes(searchParam) || bodyB.includes(searchParam))
          scoreB += 10;

        // Si el nombre del ejercicio empieza exactamente con el término buscado
        if (nameA.startsWith(searchParam)) scoreA += 5;
        if (nameB.startsWith(searchParam)) scoreB += 5;

        return scoreB - scoreA;
      });

      setResults(smartOrderedData);

      if (smartOrderedData.length === 0) {
        Alert.alert(
          "Aviso",
          "No se encontraron ejercicios. Prueba buscando directamente en inglés (ej: bench, squat, curl).",
        );
      }
    } catch (error) {
      console.log("API ERROR:", error);
      Alert.alert("Error", "No se pudieron obtener datos de la API");
    } finally {
      setLoading(false);
    }
  };

  //  SELECT EXERCISE
  const selectExercise = (exercise: ApiExercise) => {
    setName(exercise.name);
    setResults([]);
    setQuery("");
  };

  //  SAVE SUPABASE
  const createExercise = async () => {
    if (!name || !sets || !reps) {
      Alert.alert("Error", "Completa nombre, sets y reps");
      return;
    }

    const { error } = await supabase.from("exercises").insert({
      routine_day_id: dayId,
      name,
      sets: Number(sets),
      reps: Number(reps),
      suggested_weight: Number(weight || 0),
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

      {/* INPUT DE BÚSQUEDA */}
      <TextInput
        placeholder="Ej: pecho, cuadriceps, bench press, polea..."
        value={query}
        onChangeText={setQuery}
        style={styles.input}
        placeholderTextColor={COLORS.onSurfaceVariant}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={searchExercises}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Buscando..." : "Buscar"}
        </Text>
      </TouchableOpacity>

      {loading && (
        <ActivityIndicator
          size="small"
          color={COLORS.primary}
          style={{ marginVertical: SPACING.sm }}
        />
      )}

      {/* LISTA DE SUGERENCIAS */}
      {results.length > 0 && (
        <View style={styles.resultsContainer}>
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Pressable
                style={styles.card}
                onPress={() => selectExercise(item)}
              >
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.sub}>
                  {item.bodyPart} • {item.target} • {item.equipment}
                </Text>
              </Pressable>
            )}
          />
        </View>
      )}

      {/* FORMULARIO DE CARGA */}
      <TextInput
        placeholder="Nombre del ejercicio"
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

      <TouchableOpacity style={styles.saveButton} onPress={createExercise}>
        <Text style={styles.buttonText}>Guardar ejercicio</Text>
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
    marginBottom: SPACING.sm,
  },
  saveButton: {
    backgroundColor: COLORS.secondary,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  buttonText: {
    ...(TYPOGRAPHY.button as TextStyle),
    color: COLORS.onPrimary,
    textAlign: "center",
  },
  resultsContainer: {
    maxHeight: 220,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
  },
  card: {
    padding: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  name: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    fontWeight: "700",
    color: COLORS.onSurface,
    textTransform: "capitalize",
  },
  sub: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.onSurfaceVariant,
    marginTop: SPACING.xs,
    textTransform: "capitalize",
  },
});

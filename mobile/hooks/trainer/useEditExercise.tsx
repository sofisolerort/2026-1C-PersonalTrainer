import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";

import { supabase } from "@/utils/Supabase";
import { ApiExercise, fetchExercisesSmart } from "@/utils/ExerciseApi";

type Exercise = {
  id: string;
  routine_day_id: string;
  name: string;
  notes: string | null;
};

type RoutineDay = {
  id: string;
  day_number: number;
  day_name: string;
};

type UseEditExerciseParams = {
  exerciseId?: string;
};

export function useEditExercise({ exerciseId }: UseEditExerciseParams) {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [day, setDay] = useState<RoutineDay | null>(null);

  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");

  const [apiQuery, setApiQuery] = useState("");
  const [apiResults, setApiResults] = useState<ApiExercise[]>([]);
  const [selectedApiExercise, setSelectedApiExercise] =
    useState<ApiExercise | null>(null);

  const [searchingExercises, setSearchingExercises] = useState(false);
  const [loadingInitialData, setLoadingInitialData] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExercise();
  }, [exerciseId]);

  const fetchExercise = async () => {
    if (!exerciseId) {
      setLoadingInitialData(false);
      return;
    }

    setLoadingInitialData(true);

    const { data: exerciseData, error: exerciseError } = await supabase
      .from("exercises")
      .select("id, routine_day_id, name, notes")
      .eq("id", exerciseId)
      .maybeSingle();

    if (exerciseError || !exerciseData) {
      setExercise(null);
      setDay(null);
      setLoadingInitialData(false);
      return;
    }

    const currentExercise = exerciseData as Exercise;

    setExercise(currentExercise);
    setName(currentExercise.name);
    setNotes(currentExercise.notes ?? "");

    const { data: dayData } = await supabase
      .from("routine_days")
      .select("id, day_number, day_name")
      .eq("id", currentExercise.routine_day_id)
      .maybeSingle();

    setDay((dayData as RoutineDay | null) ?? null);

    setLoadingInitialData(false);
  };

  const searchExercises = async () => {
    const cleanQuery = apiQuery.trim();

    if (!cleanQuery) {
      Alert.alert("Búsqueda vacía", "Ingresá un ejercicio o grupo muscular");
      return;
    }

    try {
      setSearchingExercises(true);
      setApiResults([]);

      const data = await fetchExercisesSmart(cleanQuery);

      setApiResults(data);

      if (data.length === 0) {
        Alert.alert(
          "Sin resultados",
          "No se encontraron ejercicios para esa búsqueda."
        );
      }
    } catch (error) {
      console.log("Error buscando ejercicios:", error);
      Alert.alert("Error", "No se pudieron obtener los ejercicios de la API.");
    } finally {
      setSearchingExercises(false);
    }
  };

  const selectExercise = (apiExercise: ApiExercise) => {
    setSelectedApiExercise(apiExercise);
    setName(apiExercise.name);
    setApiResults([]);

    setNotes(
      `API ExerciseDB: ${apiExercise.bodyPart} · ${apiExercise.target} · ${apiExercise.equipment}`
    );
  };

  const clearSearch = () => {
    setApiQuery("");
    setApiResults([]);
  };

  const handleNameChange = (value: string) => {
    setName(value);
    setSelectedApiExercise(null);
  };

  const updateExercise = async () => {
    if (!exercise) {
      Alert.alert("Error", "No se encontró el ejercicio");
      return;
    }

    if (!name.trim()) {
      Alert.alert("Error", "Ingresá el nombre del ejercicio");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("exercises")
      .update({
        name: name.trim(),
        notes: notes.trim() || null,
      })
      .eq("id", exercise.id);

    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    Alert.alert("Éxito", "Ejercicio actualizado correctamente");
    router.back();
  };

  return {
    exercise,
    day,

    name,
    notes,
    setNotes,
    handleNameChange,

    apiQuery,
    setApiQuery,
    apiResults,
    selectedApiExercise,
    searchingExercises,
    searchExercises,
    selectExercise,
    clearSearch,

    loadingInitialData,
    loading,

    updateExercise,
  };
}
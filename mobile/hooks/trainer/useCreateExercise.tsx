import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";

import { supabase } from "@/utils/Supabase";
import { ApiExercise, fetchExercisesSmart } from "@/utils/ExerciseApi";

type RoutineDay = {
  id: string;
  day_number: number;
  day_name: string;
};

type UseCreateExerciseParams = {
  dayId?: string;
  weekNumber?: string;
};

export function useCreateExercise({
  dayId,
  weekNumber,
}: UseCreateExerciseParams) {
  const selectedWeek = Number(weekNumber ?? 1) || 1;

  const [day, setDay] = useState<RoutineDay | null>(null);

  const [apiQuery, setApiQuery] = useState("");
  const [apiResults, setApiResults] = useState<ApiExercise[]>([]);
  const [selectedApiExercise, setSelectedApiExercise] =
    useState<ApiExercise | null>(null);
  const [searchingExercises, setSearchingExercises] = useState(false);

  const [name, setName] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [suggestedWeight, setSuggestedWeight] = useState("");
  const [rpe, setRpe] = useState("");
  const [rest, setRest] = useState("");

  const [loadingInitialData, setLoadingInitialData] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDay();
  }, [dayId]);

  const fetchDay = async () => {
    if (!dayId) {
      setLoadingInitialData(false);
      return;
    }

    setLoadingInitialData(true);

    const { data, error } = await supabase
      .from("routine_days")
      .select("id, day_number, day_name")
      .eq("id", dayId)
      .maybeSingle();

    if (error || !data) {
      setDay(null);
      setLoadingInitialData(false);
      return;
    }

    setDay(data);
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

  const selectExercise = (exercise: ApiExercise) => {
    setSelectedApiExercise(exercise);
    setName(exercise.name);
    setApiResults([]);
  };

  const clearSearch = () => {
    setApiQuery("");
    setApiResults([]);
  };

  const handleNameChange = (value: string) => {
    setName(value);
    setSelectedApiExercise(null);
  };

  const parseRequiredNumber = (value: string) => {
    return Number(value.replace(",", "."));
  };

  const parseOptionalNumber = (value: string) => {
    if (value.trim() === "") return null;
    return Number(value.replace(",", "."));
  };

  const createExercise = async () => {
    if (!dayId) {
      Alert.alert("Error", "No se encontró el día");
      return;
    }

    if (!name.trim()) {
      Alert.alert("Error", "Ingresá el nombre del ejercicio");
      return;
    }

    if (!sets.trim() || !reps.trim()) {
      Alert.alert("Error", "Series y repeticiones son obligatorias");
      return;
    }

    const parsedSets = parseRequiredNumber(sets);
    const parsedReps = parseRequiredNumber(reps);

    if (Number.isNaN(parsedSets) || parsedSets <= 0) {
      Alert.alert("Error", "Las series deben ser un número mayor a 0");
      return;
    }

    if (Number.isNaN(parsedReps) || parsedReps <= 0) {
      Alert.alert("Error", "Las repeticiones deben ser un número mayor a 0");
      return;
    }

    const parsedWeight = parseOptionalNumber(suggestedWeight);

    if (parsedWeight !== null && Number.isNaN(parsedWeight)) {
      Alert.alert("Error", "El peso debe ser un número válido");
      return;
    }

    const parsedRpe = parseOptionalNumber(rpe);

    if (parsedRpe !== null && Number.isNaN(parsedRpe)) {
      Alert.alert("Error", "El RPE debe ser un número válido");
      return;
    }

    const parsedRest = parseOptionalNumber(rest);

    if (
      parsedRest !== null &&
      (Number.isNaN(parsedRest) || parsedRest < 0)
    ) {
      Alert.alert(
        "Error",
        "El descanso debe ser un número válido en segundos"
      );
      return;
    }

    setLoading(true);

    const apiNotes = selectedApiExercise
      ? `API ExerciseDB: ${selectedApiExercise.bodyPart} · ${selectedApiExercise.target} · ${selectedApiExercise.equipment}`
      : null;

    const { data: exerciseData, error: exerciseError } = await supabase
      .from("exercises")
      .insert({
        routine_day_id: dayId,
        name: name.trim(),
        notes: apiNotes,
      })
      .select("id")
      .single();

    if (exerciseError || !exerciseData) {
      setLoading(false);

      Alert.alert(
        "Error",
        exerciseError?.message ?? "No se pudo crear el ejercicio"
      );

      return;
    }

    const { error: progressionError } = await supabase
      .from("exercise_progressions")
      .insert({
        exercise_id: exerciseData.id,
        week_number: selectedWeek,
        sets: parsedSets,
        reps: parsedReps,
        suggested_weight: parsedWeight,
        rpe: parsedRpe,
        rest_seconds: parsedRest,
        hidden: false,
      });

    if (progressionError) {
      await supabase.from("exercises").delete().eq("id", exerciseData.id);

      setLoading(false);

      Alert.alert("Error", progressionError.message);
      return;
    }

    setLoading(false);

    Alert.alert("Éxito", "Ejercicio creado con su progresión inicial");

    router.back();
  };

  const previewText = () => {
    const setsText = sets.trim() || "-";
    const repsText = reps.trim() || "-";

    const weightText = suggestedWeight.trim()
      ? ` @ ${suggestedWeight.trim()} kg`
      : "";

    const rpeText = rpe.trim() ? ` · RPE ${rpe.trim()}` : "";

    const restText = rest.trim() ? ` · ${rest.trim()}s desc.` : "";

    return `${setsText}x${repsText}${weightText}${rpeText}${restText}`;
  };

  return {
    selectedWeek,

    day,

    apiQuery,
    setApiQuery,
    apiResults,
    selectedApiExercise,
    searchingExercises,
    searchExercises,
    selectExercise,
    clearSearch,

    name,
    handleNameChange,

    sets,
    setSets,
    reps,
    setReps,
    suggestedWeight,
    setSuggestedWeight,
    rpe,
    setRpe,
    rest,
    setRest,

    loadingInitialData,
    loading,

    createExercise,
    previewText,
  };
}
import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { supabase } from "@/utils/Supabase";
import { router, useFocusEffect } from "expo-router";

type Routine = {
  id: string;
  title: string;
  description: string;
};

type RoutineDay = {
  id: string;
  day_number: number;
  day_name: string;
};

export const useRoutine = (clientId?: string) => {
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [days, setDays] = useState<RoutineDay[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoutine = async () => {
    if (!clientId) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("routines")
      .select("*")
      .eq("client_id", clientId)
      .maybeSingle();

    if (error || !data) {
      setRoutine(null);
      setDays([]);
      setLoading(false);
      return;
    }

    setRoutine(data);

    const { data: daysData } = await supabase
      .from("routine_days")
      .select("*")
      .eq("routine_id", data.id)
      .order("day_number", { ascending: true });

    setDays(daysData ?? []);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchRoutine();
    }, [clientId])
  );

  const deleteRoutine = async () => {
    if (!routine) return;

    Alert.alert("Eliminar rutina", "Se eliminarán la rutina y sus días.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase
            .from("routines")
            .delete()
            .eq("id", routine.id);

          if (error) {
            Alert.alert("Error", error.message);
            return;
          }

          Alert.alert("Éxito", "Rutina eliminada");
          router.back();
        },
      },
    ]);
  };

  return {
    routine,
    days,
    loading,
    fetchRoutine,
    deleteRoutine,
  };
};
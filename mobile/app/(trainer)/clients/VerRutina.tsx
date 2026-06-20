import { useState, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import {
  useLocalSearchParams,
  router,
  useFocusEffect,
} from "expo-router";
import { supabase } from "../../../utils/Supabase";
import { MaterialIcons } from "@expo/vector-icons";

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

export default function VerRutina() {
  const { clientId } = useLocalSearchParams();

  const [routine, setRoutine] = useState<Routine | null>(null);
  const [days, setDays] = useState<RoutineDay[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchRoutine();
    }, [clientId])
  );

  const fetchRoutine = async () => {
    console.log("VIEW clientId:", clientId);

    setLoading(true);

    const { data, error } = await supabase
      .from("routines")
      .select("*")
      .eq("client_id", clientId)
      .maybeSingle();

    console.log("routine data:", data);
    console.log("routine error:", error);

    if (error || !data) {
      setLoading(false);
      return;
    }

    setRoutine(data);

    const { data: daysData, error: daysError } = await supabase
      .from("routine_days")
      .select("*")
      .eq("routine_id", data.id)
      .order("day_number", { ascending: true });

    console.log("days data:", daysData);
    console.log("days error:", daysError);

    if (!daysError && daysData) {
      setDays(daysData);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!routine) {
    return (
      <View style={styles.center}>
        <Text>Este cliente todavía no tiene rutina</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{routine.title}</Text>

        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/(trainer)/clients/EditarInfoGeneral",
              params: { clientId },
            } as any)
          }
        >
          <MaterialIcons name="edit" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <Text style={styles.description}>
        {routine.description || "Sin descripción"}
      </Text>

      <Text style={styles.subtitle}>Días de entrenamiento</Text>

      {days.length === 0 ? (
        <Text>No hay días cargados todavía</Text>
      ) : (
        <FlatList
          data={days}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.dayCard}
              onPress={() =>
                router.push({
                  pathname: "/(trainer)/clients/DayDetail",
                  params: {
                    dayId: item.id,
                    dayName: item.day_name,
                  },
                } as any)
              }
            >
              <Text style={styles.dayText}>
                Día {item.day_number}: {item.day_name}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  description: {
    fontSize: 16,
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  dayCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
    marginBottom: 12,
  },
  dayText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
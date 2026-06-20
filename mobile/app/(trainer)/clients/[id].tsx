import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { supabase } from "../../../utils/Supabase";

type ClientProfile = {
  id: string;
  nombre_completo: string;
  objetivo: string;
  nivel: string;
  cant_dias_que_entrena: number;
};

export default function ClientDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [client, setClient] = useState<ClientProfile | null>(null);
  const [hasRoutine, setHasRoutine] = useState(false);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchClient();
    }, [id]),
  );

  const fetchClient = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (!error && data) {
      setClient(data);

      const { data: routineData, error: routineError } = await supabase
        .from("routines")
        .select("id")
        .eq("client_id", id)
        .maybeSingle();

      console.log("routineData:", routineData);
      console.log("routineError:", routineError);

      setHasRoutine(!!routineData);
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

  if (!client) {
    return (
      <View style={styles.center}>
        <Text>Cliente no encontrado</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{client.nombre_completo}</Text>

      <Text style={styles.info}>Objetivo: {client.objetivo}</Text>
      <Text style={styles.info}>Nivel: {client.nivel}</Text>
      <Text style={styles.info}>
        Días por semana: {client.cant_dias_que_entrena}
      </Text>

      {!hasRoutine ? (
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            router.push({
              pathname: "/(trainer)/clients/CrearRutina",
              params: { clientId: client.id },
            } as any)
          }
        >
          <Text style={styles.buttonText}>Crear Rutina</Text>
        </TouchableOpacity>
      ) : (
        <>
          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              router.push({
                pathname: "/(trainer)/clients/VerRutina",
                params: { clientId: client.id },
              } as any)
            }
          >
            <Text style={styles.buttonText}>Ver Rutina</Text>
          </TouchableOpacity>
        </>
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
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  info: {
    fontSize: 18,
    marginBottom: 10,
  },
  button: {
    marginTop: 20,
    backgroundColor: "#2563EB",
    padding: 16,
    borderRadius: 12,
  },
  editButton: {
    backgroundColor: "#F59E0B",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
});

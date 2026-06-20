import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextStyle,
} from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { supabase } from "../../../utils/Supabase";
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from "@/constants/theme";

type ClientProfile = {
  id: string;
  full_name: string;
  objective: string;
  level: string;
  training_days: number;
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

      const { data: routineData } = await supabase
        .from("routines")
        .select("id")
        .eq("client_id", id)
        .maybeSingle();

      setHasRoutine(!!routineData);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!client) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Cliente no encontrado</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{client.full_name}</Text>

      <Text style={styles.info}>Objetivo: {client.objective}</Text>
      <Text style={styles.info}>Nivel: {client.level}</Text>
      <Text style={styles.info}>Días por semana: {client.training_days}</Text>

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
      )}
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
  info: {
    ...(TYPOGRAPHY.bodyLg as TextStyle),
    color: COLORS.onSurfaceVariant,
    marginBottom: SPACING.sm,
  },
  notFound: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    color: COLORS.onSurfaceVariant,
  },
  button: {
    marginTop: SPACING.lg,
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

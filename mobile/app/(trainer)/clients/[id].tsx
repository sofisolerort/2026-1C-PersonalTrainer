import { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TextStyle,
} from "react-native";
import {
  useLocalSearchParams,
  useRouter,
  useFocusEffect,
} from "expo-router";

import { supabase } from "@/utils/Supabase";

import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
} from "@/constants/theme";

type ClientProfile = {
  id: string;
  full_name: string;
  objective: string;
  level: string;
  training_days: number;
};

export default function ClientDetailResolver() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useFocusEffect(
    useCallback(() => {
      resolveClientRoute();
    }, [id])
  );

  const resolveClientRoute = async () => {
    if (!id) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    setLoading(true);
    setNotFound(false);

    const { data: clientData, error: clientError } = await supabase
      .from("profiles")
      .select("id, full_name, objective, level, training_days")
      .eq("id", id)
      .eq("role", "cliente")
      .maybeSingle();

    if (clientError || !clientData) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    const client = clientData as ClientProfile;

    const { data: routineData, error: routineError } = await supabase
      .from("routines")
      .select("id")
      .eq("client_id", client.id)
      .maybeSingle();

    setLoading(false);

    if (routineError) {
      setNotFound(true);
      return;
    }

    if (routineData) {
      router.replace({
        pathname: "/(trainer)/clients/VerRutina",
        params: {
          clientId: client.id,
        },
      } as any);

      return;
    }

    router.replace({
      pathname: "/(trainer)/clients/CrearRutina",
      params: {
        clientId: client.id,
      },
    } as any);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />

        <Text style={styles.loadingText}>
          Abriendo planificación...
        </Text>
      </View>
    );
  }

  if (notFound) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Cliente no encontrado</Text>
      </View>
    );
  }

  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },

  loadingText: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    color: COLORS.onSurfaceVariant,
    marginTop: SPACING.md,
    textAlign: "center",
  },

  notFound: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
  },
});
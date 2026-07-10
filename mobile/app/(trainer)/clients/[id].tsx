import { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TextStyle,
} from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";

import { supabase } from "@/utils/Supabase";
import { CustomButton } from "@/components/CustomButton";

import {
  COLORS,
  SPACING,
  RADIUS,
  SHADOWS,
  TYPOGRAPHY,
} from "@/constants/theme";

type ClientProfile = {
  id: string;
  full_name: string;
  objective: string;
  level: string;
  training_days: number;
  training_place: string;
  injuries: string | null;
};

export default function ClientDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [client, setClient] = useState<ClientProfile | null>(null);
  const [hasRoutine, setHasRoutine] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadClient();
    }, [id]),
  );

  const loadClient = async () => {
    if (!id) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    setLoading(true);
    setNotFound(false);

    const { data: clientData, error: clientError } = await supabase
      .from("profiles")
      .select(
        "id, full_name, objective, level, training_days, training_place, injuries",
      )
      .eq("id", id)
      .eq("role", "cliente")
      .maybeSingle();

    if (clientError || !clientData) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    setClient(clientData as ClientProfile);

    const { data: routineData } = await supabase
      .from("routines")
      .select("id")
      .eq("client_id", clientData.id)
      .maybeSingle();

    setHasRoutine(!!routineData);
    setLoading(false);
  };

  const goToRoutine = () => {
    if (!client) return;

    router.push({
      pathname: hasRoutine
        ? "/(trainer)/clients/VerRutina"
        : "/(trainer)/clients/CrearRutina",
      params: { clientId: client.id },
    } as any);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (notFound || !client) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Cliente no encontrado</Text>
      </View>
    );
  }

  const info: { label: string; value: string }[] = [
    { label: "Objetivo", value: client.objective },
    { label: "Nivel", value: client.level },
    {
      label: "Disponibilidad",
      value: `${client.training_days} días · ${client.training_place}`,
    },
    { label: "Lesiones", value: client.injuries || "Ninguna" },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.kicker}>Detalle del cliente</Text>
      <Text style={styles.title}>{client.full_name}</Text>

      <View style={styles.card}>
        {info.map((item, i) => (
          <View key={item.label}>
            <View style={styles.row}>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.value}>{item.value}</Text>
            </View>
            {i < info.length - 1 && <View style={styles.separator} />}
          </View>
        ))}
      </View>

      <CustomButton
        title={hasRoutine ? "Ver rutina" : "Crear rutina"}
        variant="primary"
        size="md"
        onPress={goToRoutine}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },

  kicker: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.primary,
    fontWeight: "700",
    marginBottom: SPACING.xs,
  },

  title: {
    ...(TYPOGRAPHY.h2 as TextStyle),
    color: COLORS.onSurface,
    marginBottom: SPACING.lg,
  },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOWS.card,
  },

  row: {
    paddingVertical: SPACING.md,
  },

  label: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.onSurfaceVariant,
    marginBottom: SPACING.xs,
  },

  value: {
    ...(TYPOGRAPHY.bodyLg as TextStyle),
    color: COLORS.onSurface,
    fontWeight: "600",
  },

  separator: {
    height: 1,
    backgroundColor: COLORS.outlineVariant,
  },

  notFound: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
  },
});

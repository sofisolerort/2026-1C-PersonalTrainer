import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TextStyle,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/utils/Supabase";

import {
  COLORS,
  SPACING,
  RADIUS,
  SHADOWS,
  TYPOGRAPHY,
} from "@/constants/theme";

import { CustomButton } from "@/components/CustomButton";

type Client = {
  id: string;
  full_name: string;
  objective: string;
  level: string;
};

export default function Home() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, objective, level")
        .eq("role", "cliente")
        .eq("trainer_id", user.id);

      if (error) {
        console.log("ERROR CLIENTS:", error);
        setClients([]);
      } else {
        setClients(data ?? []);
      }

      setLoading(false);
    };

    fetchClients();
  }, [user?.id]);

  const handleSignOut = async () => {
    await signOut();
    router.replace("/(auth)/Login");
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Mis Clientes ({clients.length})
      </Text>

      <CustomButton
        title="Cerrar sesión"
        onPress={handleSignOut}
      />

      <FlatList
        data={clients}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          clients.length === 0 && { flex: 1 }
        }
        ListEmptyComponent={
          <Text style={styles.empty}>
            Todavía no tenés clientes
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.full_name}</Text>
            <Text style={styles.meta}>
              Objetivo: {item.objective}
            </Text>
            <Text style={styles.meta}>
              Nivel: {item.level}
            </Text>

            <CustomButton
              title="Ver cliente"
              onPress={() =>
                router.push(`/(trainer)/clients/${item.id}`)
              }
            />
          </View>
        )}
      />
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

    logoutBtn: {
      marginBottom: SPACING.lg,
      padding: SPACING.md,
      backgroundColor: COLORS.primary,
      borderRadius: RADIUS.md,
    },

    logoutText: {
      ...(TYPOGRAPHY.bodyMd as TextStyle),
      fontWeight: "600",
      color: COLORS.onPrimary,
      textAlign: "center",
    },

    card: {
      padding: SPACING.md,
      backgroundColor: COLORS.surface,
      borderRadius: RADIUS.lg,
      marginBottom: SPACING.md,
      ...SHADOWS.card,
    },

    name: {
      ...(TYPOGRAPHY.bodyLg as TextStyle),
      fontWeight: "600",
      color: COLORS.onSurface,
      marginBottom: SPACING.sm,
    },

    meta: {
      ...(TYPOGRAPHY.bodySm as TextStyle),
      color: COLORS.onSurfaceVariant,
    },

    empty: {
      ...(TYPOGRAPHY.bodyMd as TextStyle),
      color: COLORS.onSurfaceVariant,
      textAlign: "center",
      marginTop: SPACING.xl,
    },
  })
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
import { MaterialIcons } from "@expo/vector-icons";

import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/utils/Supabase";
import { CustomButton } from "@/components/CustomButton";

import {
  COLORS,
  SPACING,
  RADIUS,
  SHADOWS,
  TYPOGRAPHY,
} from "@/constants/theme";

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

  const goToClient = (clientId: string) => {
    router.push({
      pathname: "/(trainer)/clients/[id]",
      params: { id: clientId },
    } as any);
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");

    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }

    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
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
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>Panel del entrenador</Text>
          <Text style={styles.title}>Tus clientes</Text>
        </View>

        <CustomButton
          title="Salir"
          variant="ghost"
          size="sm"
          fullWidth={false}
          onPress={handleSignOut}
        />
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryIcon}>
          <MaterialIcons
            name="groups"
            size={28}
            color={COLORS.onPrimary}
          />
        </View>

        <View style={styles.summaryContent}>
          <Text style={styles.summaryNumber}>{clients.length}</Text>
          <Text style={styles.summaryLabel}>
            {clients.length === 1 ? "cliente activo" : "clientes activos"}
          </Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Listado</Text>
        <Text style={styles.sectionCount}>{clients.length}</Text>
      </View>

      <FlatList
        data={clients}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          clients.length === 0
            ? styles.emptyListContent
            : styles.listContent
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <MaterialIcons
                name="person-search"
                size={34}
                color={COLORS.onSurfaceVariant}
              />
            </View>

            <Text style={styles.emptyTitle}>Todavía no tenés clientes</Text>

            <Text style={styles.emptyDescription}>
              Cuando un cliente sea asignado a tu perfil, va a aparecer acá.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {getInitials(item.full_name)}
                </Text>
              </View>

              <View style={styles.clientInfo}>
                <Text style={styles.name}>{item.full_name}</Text>

                <View style={styles.chipsRow}>
                  <View style={styles.chip}>
                    <Text style={styles.chipText}>{item.level}</Text>
                  </View>

                  <View style={styles.chipSoft}>
                    <Text style={styles.chipSoftText}>Activo</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.objectiveBox}>
              <Text style={styles.objectiveLabel}>Objetivo</Text>
              <Text style={styles.objectiveText}>{item.objective}</Text>
            </View>

            <View style={styles.cardActions}>
              <CustomButton
                title="abrir planificacion"
                variant="secondary"
                size="sm"
                fullWidth={false}
                onPress={() => goToClient(item.id)}
              />
            </View>
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

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.lg,
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
  },

  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    ...SHADOWS.card,
  },

  summaryIcon: {
    width: 54,
    height: 54,
    borderRadius: RADIUS.full,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },

  summaryContent: {
    flex: 1,
  },

  summaryNumber: {
    fontSize: 32,
    fontWeight: "800",
    color: COLORS.onPrimary,
  },

  summaryLabel: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    color: COLORS.onPrimary,
    opacity: 0.9,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
  },

  sectionTitle: {
    ...(TYPOGRAPHY.bodyLg as TextStyle),
    color: COLORS.onSurface,
    fontWeight: "700",
  },

  sectionCount: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.onSurfaceVariant,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    overflow: "hidden",
  },

  listContent: {
    paddingBottom: SPACING.xxl,
  },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    ...SHADOWS.card,
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },

  avatarText: {
    ...(TYPOGRAPHY.bodyLg as TextStyle),
    color: COLORS.onPrimary,
    fontWeight: "800",
  },

  clientInfo: {
    flex: 1,
  },

  name: {
    ...(TYPOGRAPHY.bodyLg as TextStyle),
    fontWeight: "700",
    color: COLORS.onSurface,
    marginBottom: SPACING.xs,
  },

  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.xs,
  },

  chip: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },

  chipText: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.onSurfaceVariant,
    fontWeight: "600",
  },

  chipSoft: {
    backgroundColor: "rgba(46, 125, 50, 0.12)",
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },

  chipSoftText: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: "#2E7D32",
    fontWeight: "700",
  },

  objectiveBox: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },

  objectiveLabel: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.onSurfaceVariant,
    marginBottom: SPACING.xs,
  },

  objectiveText: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    color: COLORS.onSurface,
    fontWeight: "600",
  },

  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },

  emptyListContent: {
    flexGrow: 1,
    justifyContent: "center",
  },

  emptyState: {
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
  },

  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.md,
  },

  emptyTitle: {
    ...(TYPOGRAPHY.bodyLg as TextStyle),
    color: COLORS.onSurface,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: SPACING.xs,
  },

  emptyDescription: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
  },
});
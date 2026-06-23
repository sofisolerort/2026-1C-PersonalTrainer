import { useLocalSearchParams, router } from "expo-router";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextStyle,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { useRoutine } from "@/hooks/useRoutine";

import {
  COLORS,
  SPACING,
  RADIUS,
  SHADOWS,
  TYPOGRAPHY,
} from "@/constants/theme";

export default function VerRutina() {
  const { clientId } = useLocalSearchParams<{ clientId: string }>();

  const { routine, days, loading, deleteRoutine } = useRoutine(clientId);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!routine) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>
          Este cliente todavía no tiene rutina
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>{routine.title}</Text>

        <View style={styles.headerButtons}>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/(trainer)/clients/EditarInfoGeneral",
                params: { clientId },
              })
            }
          >
            <MaterialIcons name="edit" size={24} color={COLORS.onSurface} />
          </TouchableOpacity>

          <TouchableOpacity onPress={deleteRoutine}>
            <MaterialIcons name="delete" size={24} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.description}>
        {routine.description || "Sin descripción"}
      </Text>

      <Text style={styles.subtitle}>Días de entrenamiento</Text>

      {days.length === 0 ? (
        <Text style={styles.muted}>No hay días cargados</Text>
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
                })
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
    alignItems: "center",
    marginBottom: SPACING.md,
  },

  headerButtons: {
    flexDirection: "row",
    gap: SPACING.md,
    alignItems: "center",
  },

  title: {
    ...(TYPOGRAPHY.h2 as TextStyle),
    color: COLORS.onSurface,
  },

  description: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    color: COLORS.onSurfaceVariant,
    marginBottom: SPACING.lg,
  },

  subtitle: {
    ...(TYPOGRAPHY.bodyLg as TextStyle),
    fontWeight: "700",
    color: COLORS.onSurface,
    marginBottom: SPACING.md,
  },

  dayCard: {
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    ...SHADOWS.card,
    marginBottom: SPACING.md,
  },

  dayText: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    fontWeight: "600",
    color: COLORS.onSurface,
  },

  muted: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    color: COLORS.onSurfaceVariant,
  },
});

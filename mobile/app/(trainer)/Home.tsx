import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  RADIUS,
  SHADOWS,
} from "@/constants/theme";
import { getClientes, getMetricasTrainer } from "../../services/clientes";
import { useAuth } from "../context/AuthContext";

export default function TrainerHome() {
  const { signOut } = useAuth();
  const [clientes, setClientes] = useState<any[]>([]);
  const [metricas, setMetricas] = useState<any>(null);

  useEffect(() => {
    getClientes().then((data: any) => setClientes(data));
    getMetricasTrainer().then((data: any) => setMetricas(data));
  }, []);

  const handleLogout = async () => {
    await signOut();
    router.replace("/(auth)/Login");
  };

  if (!metricas) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>¡Hola, Coach!</Text>
            <Text style={styles.subGreeting}>
              Tenés {metricas.clientesActivos} clientes activos
            </Text>
          </View>
          <Image
            source={{ uri: "https://i.pravatar.cc/100?img=12" }}
            style={styles.avatar}
          />
        </View>

        {/* MÉTRICA: solo clientes activos */}
        <View style={styles.metricCardFull}>
          <Text style={styles.metricNumber}>{metricas.clientesActivos}</Text>
          <Text style={styles.metricLabel}>Clientes activos</Text>
        </View>

        {/* LISTA DE CLIENTES */}
        <Text style={styles.sectionTitle}>Mis clientes</Text>

        {clientes.map((cliente: any) => (
          <View key={cliente.id} style={styles.clienteCard}>
            <View style={styles.clienteInfo}>
              <Text style={styles.clienteNombre}>{cliente.nombre}</Text>
              <Text style={styles.clienteObjetivo}>{cliente.objetivo}</Text>
            </View>
            <View style={styles.diasBadge}>
              <Text style={styles.diasNumero}>{cliente.diasEntrenamiento}</Text>
              <Text style={styles.diasLabel}>días/sem</Text>
            </View>
          </View>
        ))}

        {/* BOTÓN CERRAR SESIÓN */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.md,
    gap: SPACING.lg,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    color: COLORS.onSurfaceVariant,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    ...(TYPOGRAPHY.h2 as TextStyle),
    color: COLORS.onSurface,
  },
  subGreeting: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    color: COLORS.onSurfaceVariant,
    marginTop: SPACING.xs,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.full,
  },

  // Métrica única (ahora ocupa todo el ancho)
  metricCardFull: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: "center",
    ...SHADOWS.card,
  },
  metricNumber: {
    ...(TYPOGRAPHY.h1 as TextStyle),
    color: COLORS.primary,
  },
  metricLabel: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
    marginTop: SPACING.xs,
  },

  // Sección
  sectionTitle: {
    ...(TYPOGRAPHY.h3 as TextStyle),
    color: COLORS.onSurface,
  },

  // Cliente card
  clienteCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    ...SHADOWS.card,
  },
  clienteInfo: {
    flex: 1,
  },
  clienteNombre: {
    ...(TYPOGRAPHY.bodyLg as TextStyle),
    fontWeight: "600",
    color: COLORS.onSurface,
  },
  clienteObjetivo: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    color: COLORS.onSurfaceVariant,
    marginTop: SPACING.xs,
  },
  diasBadge: {
    backgroundColor: COLORS.primarySurface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    alignItems: "center",
    marginLeft: SPACING.md,
  },
  diasNumero: {
    ...(TYPOGRAPHY.h3 as TextStyle),
    color: COLORS.primary,
  },
  diasLabel: {
    ...(TYPOGRAPHY.labelCaps as TextStyle),
    color: COLORS.primary,
  },

  // Logout
  logoutButton: {
    backgroundColor: COLORS.error,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: "center",
    marginTop: SPACING.lg,
  },
  logoutText: {
    ...(TYPOGRAPHY.button as TextStyle),
    color: COLORS.onError,
  },
});

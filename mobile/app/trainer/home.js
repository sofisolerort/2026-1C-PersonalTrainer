import { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  RADIUS,
  SHADOWS,
} from "../../constants/theme";
import { getClientes, getMetricasTrainer } from "../../services/clientes";

export default function TrainerHome() {
  const [clientes, setClientes] = useState([]);
  const [metricas, setMetricas] = useState(null);

  // Al montar el componente, pedimos los datos al servicio
  useEffect(() => {
    getClientes().then((data) => setClientes(data));
    getMetricasTrainer().then((data) => setMetricas(data));
  }, []);

  // Mientras no llegaron las métricas, mostramos un loading simple
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

        {/* MÉTRICAS */}
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricNumber}>{metricas.clientesActivos}</Text>
            <Text style={styles.metricLabel}>Activos</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={[styles.metricNumber, { color: COLORS.tertiary }]}>
              {metricas.pagosPendientes}
            </Text>
            <Text style={styles.metricLabel}>Pagos pendientes</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={[styles.metricNumber, { color: COLORS.tertiary }]}>
              {metricas.porVencer}
            </Text>
            <Text style={styles.metricLabel}>Por vencer</Text>
          </View>
        </View>

        {/* LISTA DE CLIENTES */}
        <Text style={styles.sectionTitle}>Mis clientes</Text>

        {clientes.map((cliente) => (
          <View key={cliente.id} style={styles.clienteCard}>
            <View style={styles.clienteInfo}>
              <Text style={styles.clienteNombre}>{cliente.nombre}</Text>
              <Text style={styles.clienteObjetivo}>{cliente.objetivo}</Text>
              <Text style={styles.clienteVencimiento}>
                Vence el {cliente.fechaVencimiento}
              </Text>
            </View>
            <View style={styles.diasBadge}>
              <Text style={styles.diasNumero}>{cliente.diasEntrenamiento}</Text>
              <Text style={styles.diasLabel}>días/sem</Text>
            </View>
          </View>
        ))}
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
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    ...TYPOGRAPHY.h2,
    color: COLORS.onSurface,
  },
  subGreeting: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    marginTop: SPACING.xs,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.full,
  },

  // Métricas
  metricsRow: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  metricCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: "center",
    ...SHADOWS.card,
  },
  metricNumber: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primary,
  },
  metricLabel: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
    marginTop: SPACING.xs,
  },

  // Sección
  sectionTitle: {
    ...TYPOGRAPHY.h3,
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
    ...TYPOGRAPHY.bodyLg,
    fontWeight: "600",
    color: COLORS.onSurface,
  },
  clienteObjetivo: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    marginTop: SPACING.xs,
  },
  clienteVencimiento: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.outline,
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
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
  },
  diasLabel: {
    ...TYPOGRAPHY.labelCaps,
    color: COLORS.primary,
  },
});

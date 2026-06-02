import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  FlatList, 
  ActivityIndicator,
  TextStyle 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  RADIUS,
  SHADOWS,
} from "../../../constants/theme";
import { getClientes, getMetricasTrainer } from "../../../services/clientes";

interface Cliente {
  id: string | number;
  nombre: string;
  objetivo: string;
  fechaVencimiento: string;
  diasEntrenamiento: number;
}

interface Metricas {
  clientesActivos: number;
  pagosPendientes: number;
  porVencer: number;
}

export default function TrainerHome() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [metricas, setMetricas] = useState<Metricas | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [dataClientes, dataMetricas] = await Promise.all([
          getClientes(),
          getMetricasTrainer(),
        ]);
        setClientes(dataClientes);
        setMetricas(dataMetricas);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  if (loading || !metricas) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderHeader = () => (
    <View style={styles.headerContainer}>
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

      {/* SECCIÓN */}
      <Text style={styles.sectionTitle}>Mis clientes</Text>
    </View>
  );

  const renderClienteItem = ({ item }: { item: Cliente }) => (
    <View style={styles.clienteCard}>
      <View style={styles.clienteInfo}>
        <Text style={styles.clienteNombre}>{item.nombre}</Text>
        <Text style={styles.clienteObjetivo}>{item.objetivo}</Text>
        <Text style={styles.clienteVencimiento}>
          Vence el {item.fechaVencimiento}
        </Text>
      </View>
      <View style={styles.diasBadge}>
        <Text style={styles.diasNumero}>{item.diasEntrenamiento}</Text>
        <Text style={styles.diasLabel}>días/sem</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={clientes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderClienteItem}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      />
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
    paddingBottom: SPACING.xl,
  },
  headerContainer: {
    gap: SPACING.lg,
    marginBottom: SPACING.lg,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: SPACING.sm,
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
    ...(TYPOGRAPHY.h2 as TextStyle),
    color: COLORS.primary,
  },
  metricLabel: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
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
    marginBottom: SPACING.md,
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
  clienteVencimiento: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.outline,
    marginTop: SPACING.xs,
  },
  diasBadge: {
    backgroundColor: COLORS.primarySurface,
    borderRadius: RADIUS.md, // Corregido: antes decía ROUNDNESS.md
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
});
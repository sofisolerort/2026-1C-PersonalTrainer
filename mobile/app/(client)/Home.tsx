import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextStyle,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "../../utils/Supabase";
import {
  COLORS,
  SPACING,
  RADIUS,
  SHADOWS,
  TYPOGRAPHY,
} from "@/constants/theme";

export default function ClienteHome() {
  const { user, signOut } = useAuth();
  const [nombreCompleto, setNombreCompleto] = useState<string>("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const obtenerNombre = async () => {
      if (!user?.id) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      if (!error && data) {
        setNombreCompleto(data.full_name);
      } else {
        // Fallback: usar la parte local del email
        setNombreCompleto(user.email?.split("@")[0] || "Usuario");
      }
      setCargando(false);
    };
    obtenerNombre();
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    router.replace("/(auth)/Login");
  };

  const irAPerfil = () => router.push("/(client)/Perfil");
  const irARutinas = () => router.push("/(client)/Rutinas");
 

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.bienvenida}>
          {cargando ? "Cargando..." : `¡Bienvenido, ${nombreCompleto}!`}
        </Text>
        <Text style={styles.subtext}>Panel de Cliente</Text>
      </View>

      <View style={styles.grid}>
        <TouchableOpacity style={styles.card} onPress={irAPerfil}>
          <Text style={styles.cardEmoji}>👤</Text>
          <Text style={styles.cardTitle}>Mi Perfil</Text>
          <Text style={styles.cardDesc}>Ver y editar datos personales</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={irARutinas}>
          <Text style={styles.cardEmoji}>🏋️</Text>
          <Text style={styles.cardTitle}>Rutinas</Text>
          <Text style={styles.cardDesc}>Tus entrenamientos asignados</Text>
        </TouchableOpacity>

        

       
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    alignItems: "center",
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
  },
  bienvenida: {
    ...(TYPOGRAPHY.h3 as TextStyle),
    color: COLORS.onPrimary,
  },
  subtext: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.onPrimary,
    opacity: 0.85,
    marginTop: SPACING.xs,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: SPACING.md,
    gap: SPACING.md,
  },
  card: {
    width: "47%",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: "center",
    ...SHADOWS.card,
    marginBottom: SPACING.sm,
  },
  cardEmoji: { fontSize: 32, marginBottom: SPACING.sm },
  cardTitle: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    fontWeight: "600",
    color: COLORS.onSurface,
    marginBottom: SPACING.xs,
  },
  cardDesc: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
  },
  logoutButton: {
    backgroundColor: COLORS.error,
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  logoutText: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    fontWeight: "600",
    color: COLORS.onError,
  },
});

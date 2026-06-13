import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext";

import { useEffect, useState } from "react";
import { supabase } from "../../utils/Supabase";

export default function ClienteHome() {
  const { user, signOut } = useAuth();
  const [nombreCompleto, setNombreCompleto] = useState<string>("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const obtenerNombre = async () => {
      if (!user?.id) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("nombre_completo")
        .eq("id", user.id)
        .single();
      if (!error && data) {
        setNombreCompleto(data.nombre_completo);
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
  const irAConfig = () => router.push("/(client)/Configuracion");

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

        <TouchableOpacity
          style={styles.card}
          onPress={() => Alert.alert("Próximamente", "Próximamente")}
        >
          <Text style={styles.cardEmoji}>📊</Text>
          <Text style={styles.cardTitle}>Progreso</Text>
          <Text style={styles.cardDesc}>Evolución y estadísticas</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={irAConfig}>
          <Text style={styles.cardEmoji}>⚙️</Text>
          <Text style={styles.cardTitle}>Configuración</Text>
          <Text style={styles.cardDesc}>Preferencias de la app</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f4f8" },
  header: {
    backgroundColor: "#3b82f6",
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  bienvenida: { fontSize: 24, fontWeight: "bold", color: "white" },
  subtext: { fontSize: 14, color: "#dbeafe", marginTop: 5 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 16,
    gap: 16,
  },
  card: {
    width: "47%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 8,
  },
  cardEmoji: { fontSize: 32, marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  cardDesc: { fontSize: 12, color: "#666", textAlign: "center" },
  logoutButton: {
    backgroundColor: "#ef4444",
    margin: 16,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 40,
  },
  logoutText: { color: "white", fontWeight: "bold", fontSize: 16 },
});

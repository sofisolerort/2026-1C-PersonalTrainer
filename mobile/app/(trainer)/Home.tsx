import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../utils/Supabase";

type Client = {
  id: string;
  nombre_completo: string;
  objetivo: string;
  nivel: string;
};

export default function Home() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, [user]);

  const fetchClients = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, nombre_completo, objetivo, nivel")
      .eq("role", "cliente")
      .eq("trainer_id", user.id);

    if (error) {
      console.log("ERROR CLIENTS:", error);
    } else {
      setClients(data || []);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Clientes ({clients.length})</Text>

      <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>

      <FlatList
        data={clients}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.empty}>Todavía no tenés clientes</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              router.push(`/(trainer)/clients/${item.id}`)
            }
          >
            <Text style={styles.name}>{item.nombre_completo}</Text>
            <Text>Objetivo: {item.objetivo}</Text>
            <Text>Nivel: {item.nivel}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  logoutBtn: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: "#2563EB",
    borderRadius: 10,
  },
  logoutText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  card: {
    padding: 16,
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    marginBottom: 12,
  },
  name: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 8,
  },
  empty: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
  },
});
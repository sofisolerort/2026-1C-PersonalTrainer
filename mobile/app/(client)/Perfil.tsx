import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";

import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../utils/Supabase";

export default function PerfilCliente() {
  const { user } = useAuth();
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("perfiles")
      .select("nombre, telefono")
      .eq("id", user.id)
      .single();
    if (data) {
      setNombre(data.nombre || "");
      setTelefono(data.telefono || "");
    }
    setLoading(false);
  };

  const guardarPerfil = async () => {
    setGuardando(true);
    const { error } = await supabase
      .from("perfiles")
      .update({ nombre, telefono })
      .eq("id", user!.id);
    if (error) Alert.alert("Error", error.message);
    else Alert.alert("Éxito", "Perfil actualizado");
    setGuardando(false);
  };

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Email</Text>
      <Text style={styles.email}>{user?.email}</Text>

      <Text style={styles.label}>Nombre completo</Text>
      <TextInput
        style={styles.input}
        value={nombre}
        onChangeText={setNombre}
        placeholder="Tu nombre"
      />

      <Text style={styles.label}>Teléfono</Text>
      <TextInput
        style={styles.input}
        value={telefono}
        onChangeText={setTelefono}
        placeholder="Teléfono"
        keyboardType="phone-pad"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={guardarPerfil}
        disabled={guardando}
      >
        <Text style={styles.buttonText}>
          {guardando ? "Guardando..." : "Guardar cambios"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>Volver</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  label: { fontWeight: "bold", marginTop: 15, marginBottom: 5, fontSize: 14 },
  email: { fontSize: 16, color: "#333", marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: "white",
  },
  button: {
    backgroundColor: "#3b82f6",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 25,
  },
  buttonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  backButton: { marginTop: 15, alignItems: "center" },
  backText: { color: "#3b82f6", fontSize: 16 },
});

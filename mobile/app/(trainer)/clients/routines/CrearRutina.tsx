import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TextStyle,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";


import { CustomInput } from "@/components/CustomInput";
import { CustomButton } from "@/components/CustomButton";

import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
} from "@/constants/theme";
import { supabase } from "@/utils/Supabase";

export default function CrearRutina() {
  const { clientId } = useLocalSearchParams<{ clientId: string }>();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateRoutine = async () => {
    if (!clientId) {
      Alert.alert("Error", "Client ID inválido");
      return;
    }

    if (!title.trim()) {
      Alert.alert("Error", "La rutina debe tener un título");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("routines")
      .insert({
        client_id: clientId,
        title: title.trim(),
        description: description.trim() || null,
      });

    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    Alert.alert("Éxito", "Rutina creada correctamente");

    router.replace({
      pathname: "/(trainer)/clients/routines/CrearRutina",
      params: { clientId },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Rutina</Text>

      <CustomInput
        label="Título"
        value={title}
        onChangeText={setTitle}
        placeholder="Ej: Preparación de Torneo.... "
      />

      <CustomInput
        label="Descripción"
        value={description}
        onChangeText={setDescription}
        placeholder="Bloque enfocado en fuerza máxima"
        multiline
        style={styles.descriptionInput}
      />

      <CustomButton
        title={loading ? "Creando..." : "Crear Rutina"}
        onPress={handleCreateRoutine}
        loading={loading}
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

  title: {
    ...(TYPOGRAPHY.h2 as TextStyle),
    color: COLORS.onSurface,
    marginBottom: SPACING.xl,
    textAlign: "center",
  },

  descriptionInput: {
    height: 120,
    textAlignVertical: "top",
    paddingTop: SPACING.md,
  },
});
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextStyle,
} from "react-native";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../utils/Supabase";
import {
  COLORS,
  SPACING,
  RADIUS,
  SHADOWS,
  TYPOGRAPHY,
} from "@/constants/theme";
import { KeyboardScreen } from "@/components/KeyboardScreen";

type Profile = {
  full_name: string;
  email: string;
  phone: string | null;
  birth_date: string;
  training_days: number;
  training_place: string;
  objective: string;
  level: string;
  injuries: string | null;
};

export default function PerfilCliente() {
  const { user } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select(
        `full_name, email, phone, birth_date, training_days, training_place, objective, level, injuries`,
      )
      .eq("id", user.id)
      .single();

    if (!error && data) {
      setProfile(data);
      setFullName(data.full_name || "");
      setPhone(data.phone || "");
    }

    setLoading(false);
  };

  const guardarPerfil = async () => {
    if (!user) return;

    if (!fullName.trim()) {
      Alert.alert("Error", "El nombre no puede quedar vacío");
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone })
      .eq("id", user.id);
    setSaving(false);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    setEditing(false);
    cargarPerfil();
  };

  const cancelarEdicion = () => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
    }
    setEditing(false);
  };

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color={COLORS.primary}
        style={{ flex: 1 }}
      />
    );
  }

  if (!profile) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>No se pudo cargar el perfil</Text>
      </View>
    );
  }

  // Filas de solo lectura (los campos que se definieron en el registro)
  const readonlyItems: { label: string; value: string }[] = [
    { label: "Email", value: profile.email },
    { label: "Nacimiento", value: profile.birth_date },
    { label: "Objetivo", value: profile.objective },
    { label: "Nivel", value: profile.level },
    { label: "Días por semana", value: String(profile.training_days) },
    { label: "Entrena en", value: profile.training_place },
    { label: "Lesiones", value: profile.injuries || "Ninguna" },
  ];

  return (
    <KeyboardScreen>
      <Text style={styles.title}>Mi Perfil</Text>

      <View style={styles.card}>
        {/* Nombre: editable */}
        <View style={styles.row}>
          <Text style={styles.label}>Nombre</Text>
          {editing ? (
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Tu nombre"
              placeholderTextColor={COLORS.onSurfaceVariant}
            />
          ) : (
            <Text style={styles.value}>{profile.full_name}</Text>
          )}
        </View>
        <View style={styles.separator} />

        {/* Teléfono: editable */}
        <View style={styles.row}>
          <Text style={styles.label}>Teléfono</Text>
          {editing ? (
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Teléfono"
              placeholderTextColor={COLORS.onSurfaceVariant}
              keyboardType="phone-pad"
            />
          ) : (
            <Text style={styles.value}>
              {profile.phone || "No especificado"}
            </Text>
          )}
        </View>
        <View style={styles.separator} />

        {/* Resto: solo lectura */}
        {readonlyItems.map((item, i) => (
          <View key={item.label}>
            <View style={styles.row}>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.value}>{item.value}</Text>
            </View>
            {i < readonlyItems.length - 1 && <View style={styles.separator} />}
          </View>
        ))}
      </View>

      {editing ? (
        <View style={styles.editActions}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={cancelarEdicion}
            disabled={saving}
          >
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={guardarPerfil}
            disabled={saving}
          >
            <Text style={styles.buttonText}>
              {saving ? "Guardando..." : "Guardar"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={() => setEditing(true)}
        >
          <Text style={styles.buttonText}>Editar perfil</Text>
        </TouchableOpacity>
      )}
    </KeyboardScreen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  title: {
    ...(TYPOGRAPHY.h2 as TextStyle),
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    ...SHADOWS.card,
  },
  row: {
    paddingVertical: SPACING.md,
  },
  label: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.onSurfaceVariant,
    marginBottom: SPACING.xs,
  },
  value: {
    ...(TYPOGRAPHY.bodyLg as TextStyle),
    color: COLORS.onSurface,
    fontWeight: "600",
  },
  input: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    backgroundColor: COLORS.background,
    color: COLORS.onSurface,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.outlineVariant,
  },
  button: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: "center",
    marginTop: SPACING.lg,
  },
  editButton: {
    backgroundColor: COLORS.primary,
  },
  editActions: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  saveButton: {
    flex: 1,
    backgroundColor: COLORS.secondary,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.surfaceContainer,
  },
  buttonText: {
    ...(TYPOGRAPHY.button as TextStyle),
    color: COLORS.onPrimary,
  },
  cancelText: {
    ...(TYPOGRAPHY.button as TextStyle),
    color: COLORS.onSurface,
  },
  errorText: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    color: COLORS.error,
  },
});

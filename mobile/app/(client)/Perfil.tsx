import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
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

type Profile = {
  full_name: string;
  email: string;
  phone: string | null;
  birth_date: string;
  training_days: number;
  training_place: string;
  objective: string;
  level: string;
};

type ProfileItem = {
  label: string;
  value: string;
};

export default function PerfilCliente() {
  const { user } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select(`
        full_name,
        email,
        phone,
        birth_date,
        training_days,
        training_place,
        objective,
        level
      `)
      .eq("id", user.id)
      .single();

    if (!error && data) {
      setProfile(data);
    }

    setLoading(false);
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

  const profileItems: ProfileItem[] = [
    { label: "Nombre", value: profile.full_name },
    { label: "Email", value: profile.email },
    { label: "Teléfono", value: profile.phone || "No especificado" },
    { label: "Nacimiento", value: profile.birth_date },
    { label: "Objetivo", value: profile.objective },
    { label: "Nivel", value: profile.level },
    { label: "Días por semana", value: String(profile.training_days) },
    { label: "Entrena en", value: profile.training_place },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mi Perfil</Text>

      <View style={styles.card}>
        <FlatList
          data={profileItems}
          keyExtractor={(item) => item.label}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.value}>{item.value}</Text>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
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
    flex: 1,
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
  separator: {
    height: 1,
    backgroundColor: COLORS.outlineVariant,
  },
  errorText: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    color: COLORS.error,
  },
});
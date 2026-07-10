import { Stack, Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { supabase } from "../../utils/Supabase";
import { useAuth } from "../../context/AuthContext";
import { COLORS } from "@/constants/theme";

export default function ClienteLayout() {
  const { session, isLoading } = useAuth();
  const [rol, setRol] = useState<string | null>(null);
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    const verificar = async () => {
      if (session?.user) {
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
        setRol(data?.role || null);
      }
      setVerificando(false);
    };
    if (!isLoading) verificar();
  }, [isLoading, session]);

  if (isLoading || verificando) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: COLORS.background,
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!session || rol !== "cliente") {
    return <Redirect href="/(auth)/Login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.onPrimary,
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      <Stack.Screen name="Home" options={{ title: "Inicio" }} />
      <Stack.Screen name="Perfil" options={{ title: "Mi Perfil" }} />
      <Stack.Screen name="Rutinas" options={{ title: "Mis Rutinas" }} />
      <Stack.Screen name="bloque/[id]" options={{ title: "Bloque" }} />
      <Stack.Screen name="ejercicios/[id]" options={{ title: "Día" }} />
    </Stack>
  );
}

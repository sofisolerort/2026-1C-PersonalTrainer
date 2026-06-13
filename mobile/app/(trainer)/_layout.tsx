import { Stack, Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { supabase } from "../../utils/Supabase";
import { useAuth } from "../../context/AuthContext";

export default function TrainerLayout() {
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
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!session || rol !== "entrenador") {
    return <Redirect href="/(auth)/Login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#2563EB" },
        headerTintColor: "white",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      <Stack.Screen name="Home" options={{ title: "Panel del Entrenador" }} />
    </Stack>
  );
}

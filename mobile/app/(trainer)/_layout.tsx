import { Stack } from "expo-router";
import { COLORS } from "@/constants/theme";

export default function TrainerLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.onPrimary,
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      <Stack.Screen name="Home" options={{ title: "Panel del Entrenador" }} />
      <Stack.Screen name="clients/[id]" options={{ title: "Cliente" }} />
      <Stack.Screen name="clients/CrearRutina" options={{ title: "Crear Rutina" }} />
      <Stack.Screen name="clients/VerRutina" options={{ title: "Rutina" }} />
      <Stack.Screen name="clients/EditarInfoGeneral" options={{ title: "Editar Rutina" }} />
      <Stack.Screen name="clients/DayDetail" options={{ title: "Día" }} />
      <Stack.Screen name="clients/CrearEjercicio" options={{ title: "Crear Ejercicio" }} />
      <Stack.Screen name="clients/EditarEjercicio" options={{ title: "Editar Ejercicio" }} />
    </Stack>
  );
}

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
      <Stack.Screen
        name="Home"
        options={{ title: "Panel del Entrenador" }}
      />

      <Stack.Screen
        name="clients/[id]"
        options={{ title: "Cliente" }}
      />

      <Stack.Screen
        name="clients/CrearRutina"
        options={{ title: "Crear Rutina" }}
      />

      <Stack.Screen
        name="clients/VerRutina"
        options={{ title: "Rutina" }}
      />

      <Stack.Screen
        name="clients/CrearBloque"
        options={{ title: "Crear Bloque" }}
      />

      <Stack.Screen
        name="clients/VerBloque"
        options={{ title: "Bloque" }}
      />

      <Stack.Screen
        name="clients/CrearDia"
        options={{ title: "Crear Día" }}
      />

      <Stack.Screen
        name="clients/DayDetail"
        options={{ title: "Día" }}
      />

      <Stack.Screen
        name="clients/CrearEjercicio"
        options={{ title: "Crear Ejercicio" }}
      />

      <Stack.Screen
        name="clients/EditarEjercicio"
        options={{ title: "Editar Ejercicio" }}
      />

      <Stack.Screen
        name="clients/EditarProgresion"
        options={{ title: "Editar Progresión" }}
      />

      <Stack.Screen
        name="clients/EditarInfoGeneral"
        options={{ title: "Editar Rutina" }}
      />
    </Stack>
  );
}
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

      <Stack.Screen name="clients/Progreso" options={{ title: "Progreso" }} />

      <Stack.Screen
        name="clients/routines/CrearRutina"
        options={{ title: "Crear Rutina" }}
      />

      <Stack.Screen
        name="clients/routines/VerRutina"
        options={{ title: "Rutina" }}
      />

      <Stack.Screen
        name="clients/blocks/CrearBloque"
        options={{ title: "Crear Bloque" }}
      />

      <Stack.Screen
        name="clients/blocks/VerBloque"
        options={{ title: "Bloque" }}
      />

      <Stack.Screen
        name="clients/blocks/EditarBloque"
        options={{ title: "Editar Bloque" }}
      />

      <Stack.Screen
        name="clients/blocks/EliminarBloque"
        options={{ title: "Eliminar Bloque" }}
      />

      <Stack.Screen
        name="clients/days/CrearDia"
        options={{ title: "Crear Día" }}
      />

      <Stack.Screen
        name="clients/days/DayDetails"
        options={{ title: "Día" }}
      />

      <Stack.Screen
        name="clients/days/EditarDia"
        options={{ title: "Editar Día" }}
      />

      <Stack.Screen
        name="clients/days/EliminarDia"
        options={{ title: "Eliminar Día" }}
      />

      <Stack.Screen
  name="clients/exercises/CrearEjercicio"
  options={{ title: "Crear Ejercicio" }}
/>

<Stack.Screen
  name="clients/exercises/EditarEjercicio"
  options={{ title: "Editar Ejercicio" }}
/>

<Stack.Screen
  name="clients/exercises/EliminarEjercicio"
  options={{ title: "Eliminar Ejercicio" }}
/>

<Stack.Screen
  name="clients/exercises/EditarProgresion"
  options={{ title: "Editar Progresión" }}
/>
    </Stack>
  );
}
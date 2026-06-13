// app/auth/Onboarding.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Alert,
  StyleSheet,
  TouchableOpacity,
  TextStyle,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "expo-router";
import { supabase } from "../../utils/Supabase";

import { authStyles } from "../../authStyle/AuthStyle";
import { CustomInput } from "../../components/CustomInput";
import { CustomButton } from "../../components/CustomButton";
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "@/constants/theme";

// 1. Tipado estricto del formulario (ahora con booleanos donde corresponde)
interface OnboardingFormData {
  nombreCompleto: string;
  edad: string;
  entrenoAntes: boolean | null;
  entrenaActualmente: boolean | null;
  tieneImpedimento: boolean | null;
  impedimentoFisicoDetalle: string;
  objetivoPrincipal: string;
  diasSemana: string;
  tiempoSesion: string;
  lugarEntrenamiento: string;
  compromiso: string;
}

// Opciones globales para los selectores de tipo Radio Button
const opcionesSiNo = [
  { label: "Sí", value: true },
  { label: "No", value: false },
];

const opcionesObjetivo = [
  "Bajar de peso",
  "Ganar masa muscular",
  "Mejorar fuerza",
  "Mejorar resistencia",
  "Mejorar salud general",
  "Otro",
];
const opcionesDias = ["1-2", "3-4", "5-6"];
const opcionesTiempo = [
  "Menos de 30 min",
  "30-45 min",
  "45-60 min",
  "Más de 60 min",
];
const opcionesLugar = ["Gimnasio", "Casa", "Aire libre"];
const opcionesCompromiso = [
  "Muy comprometido",
  "Comprometido",
  "Poco comprometido",
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const router = useRouter();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    defaultValues: {
      nombreCompleto: "",
      edad: "",
      entrenoAntes: null,
      entrenaActualmente: null,
      tieneImpedimento: null,
      impedimentoFisicoDetalle: "",
      objetivoPrincipal: "",
      diasSemana: "",
      tiempoSesion: "",
      lugarEntrenamiento: "",
      compromiso: "",
    },
  });

  // Observamos el estado del booleano para mostrar u ocultar el input de detalle
  const tieneImpedimento = watch("tieneImpedimento");

  const onSubmit = async (data: OnboardingFormData) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("No se encontró el usuario autenticado");

      // Insertamos el registro mapeado en la tabla de Supabase
      const { error } = await supabase.from("perfiles").insert([
        {
          id: user.id,
          rol: "cliente",
          nombre_completo: data.nombreCompleto,
          edad: parseInt(data.edad),
          // Mandamos todo el bloque de la encuesta estructurado
          datos_onboarding: {
            entrenoAntes: data.entrenoAntes,
            entrenaActualmente: data.entrenaActualmente,
            tieneImpedimento: data.tieneImpedimento,
            impedimentoFisicoDetalle: data.tieneImpedimento
              ? data.impedimentoFisicoDetalle
              : "Ninguno",
            objetivoPrincipal: data.objetivoPrincipal,
            diasSemana: data.diasSemana,
            tiempoSesion: data.tiempoSesion,
            lugarEntrenamiento: data.lugarEntrenamiento,
            compromiso: data.compromiso,
          },
        },
      ]);

      if (error) throw error;

      Alert.alert("¡Excelente!", "Tu perfil de entrenamiento fue configurado.");
      router.replace("../(tabs)/Home");
    } catch (error: any) {
      Alert.alert("Error al guardar", error.message);
    }
  };

  // Componente Reutilizable Interno para opciones Sí/No (Maneja booleanos puros)
  const SelectorBooleano = ({
    label,
    name,
  }: {
    label: string;
    name: keyof OnboardingFormData;
  }) => (
    <View style={styles.selectorContainer}>
      <Text style={authStyles.label}>{label}</Text>
      <Controller
        control={control}
        name={name}
        rules={{ required: "Este campo es obligatorio" }}
        render={({ field: { onChange, value } }) => (
          <View style={styles.opcionesGrid}>
            {opcionesSiNo.map((opcion) => (
              <TouchableOpacity
                key={opcion.label}
                style={[
                  styles.opcionBoton,
                  value === opcion.value && styles.opcionSeleccionada,
                ]}
                onPress={() => onChange(opcion.value)}
              >
                <Text
                  style={[
                    styles.opcionTexto,
                    value === opcion.value && styles.opcionTextoSeleccionado,
                  ]}
                >
                  {opcion.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      />
      {errors[name] && (
        <Text style={styles.errorText}>Selecciona una opción</Text>
      )}
    </View>
  );

  // Componente Reutilizable Interno para opciones Múltiples de Texto (Strings)
  const SelectorTexto = ({
    label,
    name,
    opciones,
  }: {
    label: string;
    name: keyof OnboardingFormData;
    opciones: string[];
  }) => (
    <View style={styles.selectorContainer}>
      <Text style={authStyles.label}>{label}</Text>
      <Controller
        control={control}
        name={name}
        rules={{ required: "Este campo es obligatorio" }}
        render={({ field: { onChange, value } }) => (
          <View style={styles.opcionesGrid}>
            {opciones.map((opcion) => (
              <TouchableOpacity
                key={opcion}
                style={[
                  styles.opcionBoton,
                  value === opcion && styles.opcionSeleccionada,
                ]}
                onPress={() => onChange(opcion)}
              >
                <Text
                  style={[
                    styles.opcionTexto,
                    value === opcion && styles.opcionTextoSeleccionado,
                  ]}
                >
                  {opcion}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      />
      {errors[name] && (
        <Text style={styles.errorText}>Este campo es requerido</Text>
      )}
    </View>
  );

  return (
    <ScrollView
      contentContainerStyle={authStyles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={authStyles.card}>
        <Text style={authStyles.title}>Configura tu Perfil</Text>
        <Text style={authStyles.subtitle}>Paso {step} de 3</Text>

        {/* --- PASO 1: Datos Personales Básicos --- */}
        {step === 1 && (
          <View>
            <Controller
              control={control}
              name="nombreCompleto"
              rules={{ required: "El nombre es obligatorio" }}
              render={({ field: { onChange, value } }) => (
                <CustomInput
                  label="Nombre Completo"
                  placeholder="Juan Pérez"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.nombreCompleto && (
              <Text style={styles.errorText}>
                {errors.nombreCompleto.message}
              </Text>
            )}

            <Controller
              control={control}
              name="edad"
              rules={{ required: "La edad es obligatoria" }}
              render={({ field: { onChange, value } }) => (
                <CustomInput
                  label="Edad"
                  placeholder="25"
                  keyboardType="numeric"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.edad && (
              <Text style={styles.errorText}>{errors.edad.message}</Text>
            )}

            <SelectorBooleano
              label="¿Entrenaste anteriormente?"
              name="entrenoAntes"
            />
            <SelectorBooleano
              label="¿Entrenas actualmente?"
              name="entrenaActualmente"
            />

            <CustomButton title="Siguiente" onPress={() => setStep(2)} />
          </View>
        )}

        {/* --- PASO 2: Restricciones y Metas --- */}
        {step === 2 && (
          <View>
            <SelectorBooleano
              label="¿Tenés algún impedimento físico?"
              name="tieneImpedimento"
            />

            {/* Si tieneImpedimento es true, mostramos dinámicamente el input de detalle */}
            {tieneImpedimento === true && (
              <View>
                <Controller
                  control={control}
                  name="impedimentoFisicoDetalle"
                  rules={{
                    required:
                      "Por favor, detalla tu impedimento para tu entrenador.",
                  }}
                  render={({ field: { onChange, value } }) => (
                    <CustomInput
                      label="Detalle del impedimento"
                      placeholder="Ej: Hernia de disco, molestia en hombro..."
                      value={value}
                      onChangeText={onChange}
                    />
                  )}
                />
                {errors.impedimentoFisicoDetalle && (
                  <Text style={styles.errorText}>
                    {errors.impedimentoFisicoDetalle.message}
                  </Text>
                )}
              </View>
            )}

            <SelectorTexto
              label="¿Cuál es tu objetivo principal?"
              name="objetivoPrincipal"
              opciones={opcionesObjetivo}
            />

            <View style={styles.rowBotones}>
              <TouchableOpacity
                style={styles.botonAtras}
                onPress={() => setStep(1)}
              >
                <Text style={styles.textoAtras}>Atrás</Text>
              </TouchableOpacity>
              <CustomButton
                title="Siguiente"
                style={{ flex: 1 }}
                onPress={() => setStep(3)}
              />
            </View>
          </View>
        )}

        {/* --- PASO 3: Disponibilidad y Nivel de Compromiso --- */}
        {step === 3 && (
          <View>
            <SelectorTexto
              label="¿Cuántos días por semana podés entrenar?"
              name="diasSemana"
              opciones={opcionesDias}
            />
            <SelectorTexto
              label="¿Cuánto tiempo podés dedicar por sesión?"
              name="tiempoSesion"
              opciones={opcionesTiempo}
            />
            <SelectorTexto
              label="¿Dónde preferís entrenar?"
              name="lugarEntrenamiento"
              opciones={opcionesLugar}
            />
            <SelectorTexto
              label="¿Qué tan comprometido te sentís para cumplir el plan?"
              name="compromiso"
              opciones={opcionesCompromiso}
            />

            <View style={styles.rowBotones}>
              <TouchableOpacity
                style={styles.botonAtras}
                onPress={() => setStep(2)}
              >
                <Text style={styles.textoAtras}>Atrás</Text>
              </TouchableOpacity>
              <CustomButton
                title="Finalizar"
                style={{ flex: 1 }}
                onPress={handleSubmit(onSubmit)}
              />
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  errorText: {
    color: COLORS.error,
    ...(TYPOGRAPHY.bodySm as TextStyle), // Reemplaza FONT_SIZES.xs y mantiene escala
    marginTop: -SPACING.md,
    marginBottom: SPACING.md,
    fontWeight: "500",
  },
  selectorContainer: {
    marginBottom: SPACING.lg,
  },
  opcionesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  opcionBoton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant, // Corregido: antes COLORS.border
    borderRadius: RADIUS.md, // Corregido: antes ROUNDNESS.md
    paddingVertical: 10,
    paddingHorizontal: SPACING.md,
    flexGrow: 1,
    minWidth: "45%",
    alignItems: "center",
  },
  opcionSeleccionada: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  opcionTexto: {
    color: COLORS.onSurface, // Corregido: antes COLORS.textPrimary
    ...(TYPOGRAPHY.bodySm as TextStyle), // Corregido: antes FONT_SIZES.sm
    fontWeight: "500",
  },
  opcionTextoSeleccionado: {
    color: COLORS.onPrimary, // Corregido: antes COLORS.textLight
  },
  rowBotones: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  botonAtras: {
    height: 50,
    justifyContent: "center",
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md, // Corregido: antes ROUNDNESS.md
    borderWidth: 1,
    borderColor: COLORS.outlineVariant, // Corregido: antes COLORS.border
    marginTop: SPACING.md,
  },
  textoAtras: {
    color: COLORS.onSurfaceVariant, // Corregido: antes COLORS.textSecondary
    ...(TYPOGRAPHY.bodyMd as TextStyle), // Corregido: antes FONT_SIZES.md
    fontWeight: "600",
  },
});

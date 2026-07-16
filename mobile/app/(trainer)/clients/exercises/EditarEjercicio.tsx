import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TextStyle,
  ScrollView,
  Pressable,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

import { CustomInput } from "@/components/CustomInput";
import { CustomButton } from "@/components/CustomButton";
import { useEditExercise } from "@/hooks/trainer/useEditExercise";

import {
  COLORS,
  SPACING,
  RADIUS,
  SHADOWS,
  TYPOGRAPHY,
} from "@/constants/theme";

export default function EditarEjercicio() {
  const { exerciseId } = useLocalSearchParams<{
    exerciseId: string;
  }>();

  const {
    exercise,
    day,

    name,
    notes,
    setNotes,
    handleNameChange,

    apiQuery,
    setApiQuery,
    apiResults,
    selectedApiExercise,
    searchingExercises,
    searchExercises,
    selectExercise,
    clearSearch,

    loadingInitialData,
    loading,

    updateExercise,
  } = useEditExercise({
    exerciseId,
  });

  if (loadingInitialData) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!exercise) {
    return (
      <View style={styles.center}>
        <View style={styles.emptyState}>
          <MaterialIcons
            name="fitness-center"
            size={46}
            color={COLORS.onSurfaceVariant}
          />

          <Text style={styles.emptyTitle}>No se encontró el ejercicio</Text>

          <Text style={styles.emptyDescription}>
            Volvé al día e intentá abrirlo nuevamente.
          </Text>

          <CustomButton
            title="Volver"
            variant="secondary"
            size="sm"
            fullWidth={false}
            onPress={() => router.back()}
          />
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.kicker}>Editar ejercicio</Text>

        <Text style={styles.title}>{exercise.name}</Text>

        <Text style={styles.subtitle}>
          {day
            ? `Día ${day.day_number}: ${day.day_name}`
            : "Día no encontrado"}
        </Text>
      </View>

      <View style={styles.contextCard}>
        <View style={styles.contextIcon}>
          <MaterialIcons name="edit" size={26} color={COLORS.onPrimary} />
        </View>

        <View style={styles.contextInfo}>
          <Text style={styles.contextTitle}>Modificar ejercicio</Text>

          <Text style={styles.contextDescription}>
            Podés cambiar el nombre manualmente o buscar una sugerencia nueva en
            la API externa.
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="search" size={20} color={COLORS.primary} />

          <Text style={styles.sectionTitle}>Buscar en la API</Text>
        </View>

        <Text style={styles.helperText}>
          Opcional. Si elegís una sugerencia, se reemplaza el nombre del
          ejercicio y se guardan datos de la API en notas.
        </Text>

        <CustomInput
          label="Ejercicio o músculo"
          value={apiQuery}
          onChangeText={setApiQuery}
          placeholder="Ej: pecho, cuádriceps, sentadilla"
        />

        <CustomButton
          title={searchingExercises ? "Buscando..." : "Buscar ejercicios"}
          variant="secondary"
          size="md"
          onPress={searchExercises}
          loading={searchingExercises}
        />

        {apiResults.length > 0 && (
          <View style={styles.resultsContainer}>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>
                {apiResults.length} resultados
              </Text>

              <Pressable onPress={clearSearch} hitSlop={10}>
                <Text style={styles.clearText}>Limpiar</Text>
              </Pressable>
            </View>

            {apiResults.map((apiExercise, index) => (
              <Pressable
                key={apiExercise.id}
                style={[
                  styles.exerciseResult,
                  index === apiResults.length - 1 &&
                    styles.exerciseResultLast,
                ]}
                onPress={() => selectExercise(apiExercise)}
              >
                <View style={styles.resultIcon}>
                  <MaterialIcons
                    name="fitness-center"
                    size={20}
                    color={COLORS.primary}
                  />
                </View>

                <View style={styles.resultInfo}>
                  <Text style={styles.resultName}>{apiExercise.name}</Text>

                  <Text style={styles.resultDescription}>
                    {apiExercise.bodyPart} · {apiExercise.target} ·{" "}
                    {apiExercise.equipment}
                  </Text>
                </View>

                <MaterialIcons
                  name="chevron-right"
                  size={24}
                  color={COLORS.onSurfaceVariant}
                />
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <MaterialIcons
            name="fitness-center"
            size={20}
            color={COLORS.primary}
          />

          <Text style={styles.sectionTitle}>Datos del ejercicio</Text>
        </View>

        <CustomInput
          label="Nombre del ejercicio"
          value={name}
          onChangeText={handleNameChange}
          placeholder="Ej: Sentadilla"
        />

        <CustomInput
          label="Notas o variante"
          value={notes}
          onChangeText={setNotes}
          placeholder="Ej: con pausa, banco plano, tempo lento"
          multiline
        />

        {selectedApiExercise && (
          <View style={styles.selectedBox}>
            <View style={styles.selectedHeader}>
              <MaterialIcons
                name="check-circle"
                size={18}
                color={COLORS.primary}
              />

              <Text style={styles.selectedLabel}>Seleccionado desde API</Text>
            </View>

            <Text style={styles.selectedText}>
              {selectedApiExercise.bodyPart} · {selectedApiExercise.target} ·{" "}
              {selectedApiExercise.equipment}
            </Text>
          </View>
        )}

        <View style={styles.previewBox}>
          <Text style={styles.previewLabel}>Vista previa</Text>

          <Text style={styles.previewTitle}>
            {name.trim() || "Nombre del ejercicio"}
          </Text>

          <Text style={styles.previewDescription}>
            {notes.trim() || "Sin notas cargadas"}
          </Text>
        </View>
      </View>

      <CustomButton
        title={loading ? "Guardando..." : "Guardar cambios"}
        variant="primary"
        size="md"
        onPress={updateExercise}
        loading={loading}
      />

      <View style={styles.cancelWrapper}>
        <CustomButton
          title="Cancelar"
          variant="ghost"
          size="sm"
          fullWidth={false}
          onPress={() => router.back()}
          disabled={loading}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },

  header: {
    marginBottom: SPACING.lg,
  },

  kicker: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.primary,
    fontWeight: "800",
    marginBottom: SPACING.xs,
  },

  title: {
    ...(TYPOGRAPHY.h2 as TextStyle),
    color: COLORS.onSurface,
    marginBottom: SPACING.xs,
  },

  subtitle: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    color: COLORS.onSurfaceVariant,
    fontWeight: "600",
  },

  contextCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    ...SHADOWS.card,
  },

  contextIcon: {
    width: 50,
    height: 50,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },

  contextInfo: {
    flex: 1,
  },

  contextTitle: {
    ...(TYPOGRAPHY.bodyLg as TextStyle),
    color: COLORS.onSurface,
    fontWeight: "800",
    marginBottom: SPACING.xs,
  },

  contextDescription: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.onSurfaceVariant,
    lineHeight: 19,
  },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    ...SHADOWS.card,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },

  sectionTitle: {
    ...(TYPOGRAPHY.bodyLg as TextStyle),
    color: COLORS.onSurface,
    fontWeight: "800",
  },

  helperText: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.onSurfaceVariant,
    lineHeight: 19,
    marginBottom: SPACING.md,
  },

  resultsContainer: {
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: RADIUS.lg,
    overflow: "hidden",
  },

  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },

  resultsTitle: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.onSurface,
    fontWeight: "800",
  },

  clearText: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.primary,
    fontWeight: "700",
  },

  exerciseResult: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },

  exerciseResultLast: {
    borderBottomWidth: 0,
  },

  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },

  resultInfo: {
    flex: 1,
  },

  resultName: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    color: COLORS.onSurface,
    fontWeight: "800",
    textTransform: "capitalize",
    marginBottom: SPACING.xs,
  },

  resultDescription: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.onSurfaceVariant,
    textTransform: "capitalize",
  },

  selectedBox: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginBottom: SPACING.md,
  },

  selectedHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },

  selectedLabel: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.primary,
    fontWeight: "800",
  },

  selectedText: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.onSurfaceVariant,
    textTransform: "capitalize",
  },

  previewBox: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    marginTop: SPACING.sm,
  },

  previewLabel: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.onSurfaceVariant,
    fontWeight: "700",
    marginBottom: SPACING.xs,
  },

  previewTitle: {
    ...(TYPOGRAPHY.bodyLg as TextStyle),
    color: COLORS.onSurface,
    fontWeight: "900",
    marginBottom: SPACING.xs,
  },

  previewDescription: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.onSurfaceVariant,
    lineHeight: 19,
  },

  cancelWrapper: {
    alignItems: "center",
    marginTop: SPACING.md,
  },

  emptyState: {
    alignItems: "center",
  },

  emptyTitle: {
    ...(TYPOGRAPHY.bodyLg as TextStyle),
    color: COLORS.onSurface,
    fontWeight: "900",
    textAlign: "center",
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },

  emptyDescription: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: SPACING.lg,
  },
});
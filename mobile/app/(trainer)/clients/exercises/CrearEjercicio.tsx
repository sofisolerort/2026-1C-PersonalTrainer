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
import { useCreateExercise } from "@/hooks/trainer/useCreateExercise";

import {
  COLORS,
  SPACING,
  RADIUS,
  SHADOWS,
  TYPOGRAPHY,
} from "@/constants/theme";

export default function CrearEjercicio() {
  const { dayId, weekNumber } = useLocalSearchParams<{
    dayId: string;
    weekNumber?: string;
  }>();

  const {
    selectedWeek,

    day,

    apiQuery,
    setApiQuery,
    apiResults,
    selectedApiExercise,
    searchingExercises,
    searchExercises,
    selectExercise,
    clearSearch,

    name,
    handleNameChange,

    sets,
    setSets,
    reps,
    setReps,
    suggestedWeight,
    setSuggestedWeight,
    rpe,
    setRpe,
    rest,
    setRest,

    loadingInitialData,
    loading,

    createExercise,
    previewText,
  } = useCreateExercise({
    dayId,
    weekNumber,
  });

  if (loadingInitialData) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!day) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>No se encontró el día</Text>
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
        <Text style={styles.kicker}>Nuevo ejercicio</Text>

        <Text style={styles.title}>Cargar ejercicio</Text>

        <Text style={styles.subtitle}>
          Día {day.day_number}: {day.day_name}
        </Text>
      </View>

      <View style={styles.contextCard}>
        <View style={styles.contextIcon}>
          <MaterialIcons
            name="event-note"
            size={26}
            color={COLORS.onPrimary}
          />
        </View>

        <View style={styles.contextInfo}>
          <Text style={styles.contextTitle}>Semana {selectedWeek}</Text>

          <Text style={styles.contextDescription}>
            Este ejercicio se va a crear con una progresión inicial para esta
            semana.
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="search" size={20} color={COLORS.primary} />

          <Text style={styles.sectionTitle}>Buscar en la API</Text>
        </View>

        <Text style={styles.helperText}>
          Opcional. Buscá por ejercicio o grupo muscular. Si elegís una opción,
          se completa el nombre del ejercicio automáticamente.
        </Text>

        <CustomInput
          label="Ejercicio o músculo"
          value={apiQuery}
          onChangeText={setApiQuery}
          placeholder="Ej: pecho, cuádriceps, sentadilla"
        />

        <CustomButton
          title={searchingExercises ? "Buscando..." : "Buscar ejercicios"}
          variant="primary"
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

            {apiResults.map((exercise, index) => (
              <Pressable
                key={exercise.id}
                style={[
                  styles.exerciseResult,
                  index === apiResults.length - 1 &&
                  styles.exerciseResultLast,
                ]}
                onPress={() => selectExercise(exercise)}
              >
                <View style={styles.resultIcon}>
                  <MaterialIcons
                    name="fitness-center"
                    size={20}
                    color={COLORS.primary}
                  />
                </View>

                <View style={styles.resultInfo}>
                  <Text style={styles.resultName}>{exercise.name}</Text>

                  <Text style={styles.resultDescription}>
                    {exercise.bodyPart} · {exercise.target} ·{" "}
                    {exercise.equipment}
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

        <Text style={styles.helperText}>
          Este es el nombre real que se guarda en la rutina. Podés escribirlo
          manualmente aunque no uses la API.
        </Text>

        <CustomInput
          label="Nombre del ejercicio"
          value={name}
          onChangeText={handleNameChange}
          placeholder="Ej: Sentadilla"
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
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="trending-up" size={20} color={COLORS.primary} />

          <Text style={styles.sectionTitle}>Progresión inicial</Text>
        </View>

        <View style={styles.row}>
          <View style={styles.half}>
            <CustomInput
              label="Series"
              value={sets}
              onChangeText={setSets}
              placeholder="3"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.half}>
            <CustomInput
              label="Reps"
              value={reps}
              onChangeText={setReps}
              placeholder="3"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.half}>
            <CustomInput
              label="Peso inicial"
              value={suggestedWeight}
              onChangeText={setSuggestedWeight}
              placeholder="140"
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.half}>
            <CustomInput
              label="RPE"
              value={rpe}
              onChangeText={setRpe}
              placeholder="8"
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <CustomInput
          label="Descanso (segundos)"
          value={rest}
          onChangeText={setRest}
          placeholder="90"
          keyboardType="numeric"
        />

        <View style={styles.previewBox}>
          <Text style={styles.previewLabel}>Vista previa</Text>

          <Text style={styles.previewText}>{previewText()}</Text>
        </View>
      </View>

      <CustomButton
        title={loading ? "Creando..." : "Crear ejercicio"}
        variant="primary"
        size="md"
        onPress={createExercise}
        loading={loading}
      />

      <View style={styles.cancelWrapper}>
        <CustomButton
          title="Cancelar"
          variant="ghost"
          size="sm"
          fullWidth={false}
          onPress={() => router.back()}
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
  },

  header: {
    marginBottom: SPACING.lg,
  },

  kicker: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.primary,
    fontWeight: "700",
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

  row: {
    flexDirection: "row",
    gap: SPACING.md,
  },

  half: {
    flex: 1,
  },

  previewBox: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  previewLabel: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.onSurfaceVariant,
    marginBottom: SPACING.xs,
    fontWeight: "600",
  },

  previewText: {
    ...(TYPOGRAPHY.bodyLg as TextStyle),
    color: COLORS.onSurface,
    fontWeight: "900",
  },

  cancelWrapper: {
    alignItems: "center",
    marginTop: SPACING.md,
  },

  empty: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
  },
  selectedBox: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
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


});
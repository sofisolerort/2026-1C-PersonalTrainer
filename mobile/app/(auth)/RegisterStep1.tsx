import {
  View,
  Text,
  StyleSheet,
  TextStyle,
} from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

import { useRegister1 } from "../../hooks/auth/useRegister1";

import { KeyboardScreen } from "@/components/KeyboardScreen";
import BackButton from "@/components/BackButton";
import { CustomInput } from "@/components/CustomInput";
import { CustomButton } from "@/components/CustomButton";

import {
  COLORS,
  SPACING,
  RADIUS,
  SHADOWS,
  TYPOGRAPHY,
} from "@/constants/theme";

export default function RegisterStep1() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    errors,
    validate,
  } = useRegister1();

  const handleNext = () => {
    if (validate()) {
      router.push({
        pathname: "/(auth)/RegisterStep2",
        params: {
          email: email.trim(),
          password,
        },
      });
    }
  };

  return (
    <KeyboardScreen contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <MaterialIcons
            name="person-add-alt-1"
            size={34}
            color={COLORS.onPrimary}
          />
        </View>

        <Text style={styles.appName}>FitnessApp</Text>

        <Text style={styles.subtitle}>
          Creá tu cuenta para empezar a cargar tus datos de entrenamiento.
        </Text>
      </View>

      <View style={styles.stepsCard}>
        <View style={styles.stepActive}>
          <Text style={styles.stepNumberActive}>1</Text>
        </View>

        <View style={styles.stepLine} />

        <View style={styles.stepInactive}>
          <Text style={styles.stepNumberInactive}>2</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Registro</Text>

        <Text style={styles.description}>
          Primero necesitamos tus datos de acceso. En el siguiente paso cargás
          tu información de entrenamiento.
        </Text>

        <CustomInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="ejemplo@gmail.com"
          autoCapitalize="none"
          keyboardType="email-address"
          autoCorrect={false}
        />
        {errors.email && <Text style={styles.error}>{errors.email}</Text>}

        <CustomInput
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          placeholder="Mínimo 6 caracteres"
          secureTextEntry
        />
        {errors.password && (
          <Text style={styles.error}>{errors.password}</Text>
        )}

        <CustomInput
          label="Repetir contraseña"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Volvé a escribir tu contraseña"
          secureTextEntry
        />
        {errors.confirmPassword && (
          <Text style={styles.error}>{errors.confirmPassword}</Text>
        )}

        <View style={styles.securityBox}>
          <MaterialIcons
            name="lock-outline"
            size={18}
            color={COLORS.primary}
          />

          <Text style={styles.securityText}>
            Tu contraseña se usa solo para iniciar sesión de forma segura.
          </Text>
        </View>

        <CustomButton
          title="Continuar"
          onPress={handleNext}
          variant="primary"
          size="md"
        />

        <View style={styles.backWrapper}>
          <BackButton
            label="Volver al login"
            onPress={() => router.back()}
          />
        </View>
      </View>
    </KeyboardScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.background,
  },

  header: {
    alignItems: "center",
    marginBottom: SPACING.lg,
  },

  iconCircle: {
    width: 86,
    height: 86,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },

  appName: {
    ...(TYPOGRAPHY.h2 as TextStyle),
    color: COLORS.onSurface,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: SPACING.xs,
  },

  subtitle: {
    ...(TYPOGRAPHY.bodyMd as TextStyle),
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
    lineHeight: 21,
    maxWidth: 310,
  },

  stepsCard: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: SPACING.lg,
  },

  stepActive: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  stepInactive: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    justifyContent: "center",
    alignItems: "center",
  },

  stepLine: {
    width: 56,
    height: 2,
    backgroundColor: COLORS.outlineVariant,
  },

  stepNumberActive: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.onPrimary,
    fontWeight: "900",
  },

  stepNumberInactive: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.onSurfaceVariant,
    fontWeight: "900",
  },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    ...SHADOWS.card,
  },

  title: {
    ...(TYPOGRAPHY.h3 as TextStyle),
    color: COLORS.onSurface,
    marginBottom: SPACING.xs,
    textAlign: "center",
    fontWeight: "900",
  },

  description: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: SPACING.lg,
  },

  error: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.error,
    marginTop: -SPACING.xs,
    marginBottom: SPACING.sm,
    fontWeight: "700",
  },

  securityBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    marginBottom: SPACING.lg,
  },

  securityText: {
    ...(TYPOGRAPHY.bodySm as TextStyle),
    color: COLORS.onSurfaceVariant,
    flex: 1,
    lineHeight: 18,
    fontWeight: "600",
  },

  backWrapper: {
    alignItems: "center",
    marginTop: SPACING.lg,
  },
});
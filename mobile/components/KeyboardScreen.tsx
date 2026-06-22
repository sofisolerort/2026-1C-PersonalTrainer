import { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from "react-native";
import { COLORS, SPACING } from "@/constants/theme";

type Props = {
  children: ReactNode;
  // Permite, por ejemplo, centrar el contenido (justifyContent: "center")
  contentContainerStyle?: StyleProp<ViewStyle>;
};

// Wrapper reutilizable para pantallas con formularios:
// evita que el teclado tape el contenido y permite scrollear.
export const KeyboardScreen = ({ children, contentContainerStyle }: Props) => {
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.content, contentContainerStyle]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flexGrow: 1,
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
});

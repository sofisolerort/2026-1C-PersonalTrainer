import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  ActivityIndicator,
  TextStyle,
  ViewStyle,
  StyleProp,
} from "react-native";

import {
  COLORS,
  RADIUS,
  SPACING,
  TYPOGRAPHY,
} from "@/constants/theme";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";

type ButtonSize = "sm" | "md" | "lg";

interface CustomButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  loading = false,
  disabled,
  variant = "primary",
  size = "md",
  fullWidth = true,
  style,
  ...restProps
}) => {
  const isButtonDisabled = disabled || loading;

  const buttonStyle: StyleProp<ViewStyle> = [
    styles.base,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : styles.autoWidth,
    isButtonDisabled && styles.disabled,
    style,
  ];

  const textStyle: StyleProp<TextStyle> = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
  ];

  const loaderColor =
    variant === "primary" || variant === "danger"
      ? COLORS.onPrimary
      : COLORS.primary;

  return (
    <TouchableOpacity
      style={buttonStyle}
      disabled={isButtonDisabled}
      activeOpacity={0.82}
      {...restProps}
    >
      {loading ? (
        <ActivityIndicator color={loaderColor} />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },

  fullWidth: {
    width: "100%",
  },

  autoWidth: {
    alignSelf: "flex-start",
  },

  sm: {
    minHeight: 36,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },

  md: {
    minHeight: 48,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },

  lg: {
    minHeight: 56,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },

  primary: {
    backgroundColor: COLORS.primary,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },

  secondary: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: COLORS.primary,
  },

  ghost: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "transparent",
  },

  danger: {
    backgroundColor: COLORS.error,
    borderWidth: 1,
    borderColor: COLORS.error,
  },

  disabled: {
    opacity: 0.55,
  },

  text: {
    ...(TYPOGRAPHY.button as TextStyle),
    textAlign: "center",
  },

  smText: {
    fontSize: 13,
  },

  mdText: {
    fontSize: 15,
  },

  lgText: {
    fontSize: 16,
  },

  primaryText: {
    color: COLORS.onPrimary,
  },

  secondaryText: {
    color: COLORS.onSurface,
  },

  outlineText: {
    color: COLORS.primary,
  },

  ghostText: {
    color: COLORS.primary,
  },

  dangerText: {
    color: COLORS.onPrimary,
  },
});
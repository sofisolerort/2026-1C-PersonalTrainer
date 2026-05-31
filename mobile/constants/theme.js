export const COLORS = {
  // Primario (azul de marca)
  primary: "#2563EB",
  primaryDark: "#004AC6",
  primaryLight: "#B4C5FF",
  primarySurface: "#DBE1FF",
  onPrimary: "#FFFFFF",

  // Secundario (verde éxito / completado)
  secondary: "#10B981",
  secondaryLight: "#D1FAE5",
  onSecondary: "#FFFFFF",

  // Terciario (naranja / advertencia / acciones secundarias)
  tertiary: "#BC4800",
  tertiaryLight: "#FED7AA",
  onTertiary: "#FFFFFF",

  // Neutral (grises para textos y bordes)
  neutral: "#757681",
  neutralDark: "#191B23",
  neutralLight: "#C3C6D7",

  // Error
  error: "#BA1A1A",
  errorLight: "#FFDAD6",
  onError: "#FFFFFF",

  // Superficies
  background: "#FAF8FF",
  surface: "#FFFFFF",
  surfaceContainer: "#EDEDF9",
  surfaceContainerHigh: "#E7E7F3",

  // Textos
  onSurface: "#191B23",
  onSurfaceVariant: "#434655",
  outline: "#737686",
  outlineVariant: "#C3C6D7",
};

export const TYPOGRAPHY = {
  h1: {
    fontFamily: "Inter",
    fontSize: 36,
    fontWeight: "700",
    lineHeight: 43,
    letterSpacing: -0.72,
  },
  h2: {
    fontFamily: "Inter",
    fontSize: 30,
    fontWeight: "700",
    lineHeight: 36,
    letterSpacing: -0.3,
  },
  h3: {
    fontFamily: "Inter",
    fontSize: 24,
    fontWeight: "600",
    lineHeight: 31,
  },
  bodyLg: {
    fontFamily: "Inter",
    fontSize: 18,
    fontWeight: "400",
    lineHeight: 29,
  },
  bodyMd: {
    fontFamily: "Inter",
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 24,
  },
  bodySm: {
    fontFamily: "Inter",
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 21,
  },
  labelCaps: {
    fontFamily: "Inter",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 12,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  button: {
    fontFamily: "Inter",
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 16,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const SHADOWS = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
  },
  modal: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 8,
  },
};

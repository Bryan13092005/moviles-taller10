import { Platform } from "react-native";

export const palette = {
  // Deep nocturnal automotive base
  carbon950: "#07080B",
  carbon900: "#0C0E14",
  carbon850: "#12151F",
  carbon800: "#181D2A",
  carbon700: "#222838",
  carbon600: "#323B50",

  // Hyper-Orange & Speed Accents
  electricOrange: "#FF5500",
  electricOrangeLight: "#FF7326",
  electricOrangeDark: "#D94400",
  neonCyan: "#00F0FF",
  tachometerRed: "#FF2D55",
  telemetryGreen: "#00E676",
  speedAmber: "#FFB000",

  // High contrast monochrome
  pureWhite: "#FFFFFF",
  silver100: "#F1F3F7",
  silver300: "#CBD2DF",
  silver500: "#8F9BAE",
  silver700: "#5A6477",

  // Alpha Overlays & Glows
  orangeGlow: "rgba(255, 85, 0, 0.35)",
  orangeSubtle: "rgba(255, 85, 0, 0.12)",
  orangeBorder: "rgba(255, 85, 0, 0.38)",
  whiteSubtle: "rgba(255, 255, 255, 0.06)",
  whiteMedium: "rgba(255, 255, 255, 0.12)",
  cardBorder: "rgba(255, 255, 255, 0.08)",
  glassDark: "rgba(18, 21, 31, 0.82)",
};

export const theme = {
  colors: {
    bg: {
      canvas: palette.carbon950,
      surface: palette.carbon900,
      card: palette.carbon850,
      cardElevated: palette.carbon800,
      input: palette.carbon850,
      glass: palette.glassDark,
      overlay: "rgba(5, 6, 9, 0.82)",
    },
    accent: {
      primary: palette.electricOrange,
      primaryHover: palette.electricOrangeLight,
      primaryPressed: palette.electricOrangeDark,
      primaryMuted: palette.orangeSubtle,
      primaryGlow: palette.orangeGlow,
      secondary: palette.neonCyan,
      secondaryMuted: "rgba(0, 240, 255, 0.12)",
    },
    text: {
      primary: palette.pureWhite,
      secondary: palette.silver300,
      tertiary: palette.silver500,
      muted: palette.silver700,
      accent: palette.electricOrange,
      inverse: palette.carbon950,
      contrast: "#FFFFFF",
    },
    status: {
      success: palette.telemetryGreen,
      successMuted: "rgba(0, 230, 118, 0.12)",
      error: palette.tachometerRed,
      errorMuted: "rgba(255, 45, 85, 0.14)",
      warning: palette.speedAmber,
    },
    border: {
      subtle: palette.cardBorder,
      medium: palette.whiteMedium,
      focus: palette.orangeBorder,
      active: palette.electricOrange,
    },
    gradients: {
      editorialHeader: [palette.carbon800, palette.carbon950] as const,
      orangeFire: [palette.electricOrangeLight, palette.electricOrangeDark] as const,
      cardGleam: ["rgba(255, 255, 255, 0.07)", "rgba(255, 255, 255, 0.01)"] as const,
      subtleMesh: ["#1F110A", "#0C0E14", "#07080B"] as const,
      glowAccent: ["rgba(255, 85, 0, 0.28)", "rgba(255, 85, 0, 0)"] as const,
    },
  },

  spacing: {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    massive: 48,
  },

  radius: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
    pill: 9999,
  },

  typography: {
    hero: {
      fontSize: 32,
      lineHeight: 38,
      fontWeight: "800" as const,
      letterSpacing: -0.8,
    },
    h1: {
      fontSize: 26,
      lineHeight: 32,
      fontWeight: "700" as const,
      letterSpacing: -0.6,
    },
    h2: {
      fontSize: 20,
      lineHeight: 26,
      fontWeight: "700" as const,
      letterSpacing: -0.4,
    },
    h3: {
      fontSize: 17,
      lineHeight: 22,
      fontWeight: "600" as const,
      letterSpacing: -0.2,
    },
    bodyLarge: {
      fontSize: 16,
      lineHeight: 22,
      fontWeight: "400" as const,
    },
    body: {
      fontSize: 15,
      lineHeight: 20,
      fontWeight: "400" as const,
    },
    bodySmall: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: "400" as const,
    },
    caption: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: "500" as const,
    },
    badge: {
      fontSize: 11,
      lineHeight: 14,
      fontWeight: "700" as const,
      letterSpacing: 0.8,
      textTransform: "uppercase" as const,
    },
    tabular: {
      fontVariant: ["tabular-nums"] as ("tabular-nums")[],
    },
  },

  shadows: {
    card: Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
      default: {},
    }),
    neon: Platform.select({
      ios: {
        shadowColor: palette.electricOrange,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.45,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      default: {},
    }),
  },

  hitSlop: {
    standard: { top: 12, bottom: 12, left: 12, right: 12 },
    large: { top: 16, bottom: 16, left: 16, right: 16 },
  },
} as const;

export type Theme = typeof theme;

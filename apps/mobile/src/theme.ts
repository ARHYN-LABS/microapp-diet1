import { Platform } from "react-native"

export const theme = {
  colors: {
    bg: "#0a0f14",
    bgDeep: "#070b10",
    panel: "#0c1218",
    panelAlt: "#0f1620",
    glass: "rgba(20, 26, 34, 0.78)",
    glassStrong: "rgba(14, 18, 24, 0.92)",
    border: "rgba(255, 255, 255, 0.08)",
    text: "#f3f6fb",
    textSoft: "#c5cfdd",
    muted: "#8d9bb0",
    accent: "#62f4c5",
    accent2: "#57b6ff",
    warning: "#ffb75a",
    danger: "#ff6d7a",
    success: "#48e7a3"
  },
  radius: {
    xl: 28,
    lg: 22,
    md: 16,
    sm: 12,
    xs: 8
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32
  },
  font: {
    heading: Platform.select({
      ios: "SF Pro Display",
      android: "sans-serif-medium",
      default: "System"
    }),
    body: Platform.select({
      ios: "SF Pro Text",
      android: "sans-serif",
      default: "System"
    })
  },
  shadow: {
    card: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.35,
      shadowRadius: 20,
      elevation: 8
    }
  }
}

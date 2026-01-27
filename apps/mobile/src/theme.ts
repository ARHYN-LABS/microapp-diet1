import { Platform } from "react-native"

export const theme = {
  colors: {
    bg: "#F8FAFC",
    bgDeep: "#F1F5F9",
    panel: "#FFFFFF",
    panelAlt: "#EEF2F7",
    glass: "rgba(255, 255, 255, 0.92)",
    glassStrong: "rgba(255, 255, 255, 0.98)",
    border: "#E2E8F0",
    text: "#1F2933",
    textSoft: "#3E4C59",
    muted: "#7B8794",
    accent: "#1ABC9C",
    accent2: "#2C7BE5",
    warning: "#E63946",
    danger: "#E63946",
    success: "#1ABC9C"
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
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 3
    }
  }
}

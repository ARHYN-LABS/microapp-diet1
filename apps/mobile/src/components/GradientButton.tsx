import { Pressable, StyleSheet, ViewStyle } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { theme } from "../theme"

type Props = {
  children: React.ReactNode
  onPress?: () => void
  disabled?: boolean
  style?: ViewStyle
}

export default function GradientButton({ children, onPress, disabled, style }: Props) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={disabled && styles.disabled}>
      <LinearGradient
        colors={[theme.colors.accent2, theme.colors.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.button, style]}
      >
        {children}
      </LinearGradient>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8
  },
  disabled: {
    opacity: 0.6
  }
})

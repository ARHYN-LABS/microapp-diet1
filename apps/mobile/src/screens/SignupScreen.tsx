import { useState } from "react"
import { View, Text, TextInput, StyleSheet, Pressable, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as AuthSession from "expo-auth-session"
import * as WebBrowser from "expo-web-browser"
import { fetchProfile } from "../api/client"
import { apiBase } from "../api/config"
import GradientButton from "../components/GradientButton"
import { theme } from "../theme"

WebBrowser.maybeCompleteAuthSession()
const OAUTH_REDIRECT_URI = "safeplate://oauth"

type Props = {
  navigation: any
}

export default function SignupScreen({ navigation }: Props) {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [status, setStatus] = useState("")

  const handleContinue = () => {
    const trimmedName = fullName.trim()
    const trimmedEmail = email.trim()
    if (!trimmedName || !trimmedEmail || password.length < 6) {
      setStatus("Please complete all fields (password min 6 chars).")
      return
    }
    if (password !== confirmPassword) {
      setStatus("Passwords do not match.")
      return
    }
    setStatus("")
    navigation.navigate("Onboarding", {
      flow: "email",
      signupData: {
        fullName: trimmedName,
        email: trimmedEmail,
        password
      }
    })
  }

  const handleGoogleSignup = async () => {
    setStatus("Opening Google...")
    try {
      const redirectUri = OAUTH_REDIRECT_URI
      const authUrl = `${apiBase}/auth/google/start?redirect=${encodeURIComponent(redirectUri)}`
      const result = await AuthSession.startAsync({ authUrl, returnUrl: redirectUri })
      if (result.type !== "success") {
        setStatus("Google sign-up canceled.")
        return
      }
      const token = result.params?.token as string | undefined
      if (!token) {
        setStatus("Google sign-up failed.")
        return
      }

      const serverProfile = await fetchProfile().catch(() => null)
      const fallbackProfile = {
        id: (result.params?.userId as string) || "",
        email: (result.params?.email as string) || "",
        fullName: (result.params?.fullName as string) || ""
      }

      navigation.navigate("Onboarding", {
        flow: "google",
        token,
        profile: serverProfile || fallbackProfile
      })
    } catch (error) {
      setStatus((error as Error).message)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.logoWrap}>
        <Image source={require("../../assets/icon.png")} style={styles.logoImage} />
      </View>
      <Text style={styles.title}>Sign up</Text>
      <Text style={styles.subtitle}>Create your account.</Text>

      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor={theme.colors.muted}
          value={fullName}
          onChangeText={setFullName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={theme.colors.muted}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={theme.colors.muted}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor={theme.colors.muted}
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <GradientButton onPress={handleContinue} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Sign Up</Text>
        </GradientButton>

        <Pressable style={[styles.socialButton, styles.googleButton]} onPress={handleGoogleSignup}>
          <Ionicons name="logo-google" size={18} color="#EA4335" />
          <Text style={styles.socialText}>Continue with Google</Text>
        </Pressable>
      </View>

      <Pressable onPress={() => navigation.goBack()}>
        <Text style={styles.link}>Back to login</Text>
      </Pressable>

      {status ? <Text style={styles.status}>{status}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl + 12,
    backgroundColor: theme.colors.bg
  },
  logoWrap: {
    alignItems: "center",
    marginBottom: theme.spacing.lg
  },
  logoImage: {
    width: 96,
    height: 96,
    resizeMode: "contain"
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.text,
    fontFamily: theme.font.heading
  },
  subtitle: {
    color: theme.colors.muted,
    marginBottom: 24
  },
  card: {
    backgroundColor: theme.colors.panel,
    borderRadius: theme.radius.lg,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  input: {
    backgroundColor: theme.colors.glass,
    color: theme.colors.text,
    padding: 12,
    borderRadius: theme.radius.md,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  primaryButton: {
    marginTop: 8
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "700"
  },
  socialButton: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 999,
    paddingVertical: 12,
    marginTop: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.glass,
    flexDirection: "row",
    gap: 8
  },
  googleButton: {
    backgroundColor: "#ffffff"
  },
  socialText: {
    color: theme.colors.text,
    fontWeight: "600"
  },
  link: {
    color: theme.colors.accent2
  },
  status: {
    color: theme.colors.muted,
    marginTop: 12
  }
})

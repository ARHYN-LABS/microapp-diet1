import { useContext, useState } from "react"
import { View, Text, TextInput, StyleSheet, Pressable, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as AuthSession from "expo-auth-session"
import * as WebBrowser from "expo-web-browser"
import { fetchHistory, fetchProfile, logInUser } from "../api/client"
import { apiBase } from "../api/config"
import GradientButton from "../components/GradientButton"
import { setProfile, setScanHistoryCache, setToken, setUserId } from "../storage/cache"
import { theme } from "../theme"
import { AuthContext } from "../auth"

WebBrowser.maybeCompleteAuthSession()
const OAUTH_REDIRECT_URI = AuthSession.makeRedirectUri({
  native: "safeplate://oauth",
  scheme: "safeplate",
  path: "oauth",
  useProxy: false
})

type Props = {
  navigation: any
}

export default function LoginScreen({ navigation }: Props) {
  const { setIsAuthed } = useContext(AuthContext)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [status, setStatus] = useState("")

  const getParamFromUrl = (url: string, key: string) => {
    const queryIndex = url.indexOf("?")
    if (queryIndex < 0) return undefined
    const query = url.slice(queryIndex + 1)
    const pairs = query.split("&")
    for (const pair of pairs) {
      const [rawKey, rawValue = ""] = pair.split("=")
      if (decodeURIComponent(rawKey) === key) {
        return decodeURIComponent(rawValue)
      }
    }
    return undefined
  }

  const handleLogin = async () => {
    setStatus("Signing in...")
    try {
      const response = await logInUser({ email, password })
      await setToken(response.token)
      await setProfile(response.profile)
      await setUserId(response.profile.id)
      try {
        const history = await fetchHistory(response.profile.id, response.profile.email || email)
        await setScanHistoryCache(history || [], response.profile.id)
      } catch {
        // ignore history prefetch failures
      }
      setIsAuthed(true)
      setStatus("Signed in.")
      navigation.replace("Main")
    } catch (error) {
      setStatus((error as Error).message)
    }
  }

  const handleGoogleLogin = async () => {
    setStatus("Opening Google...")
    try {
      const redirectUri = OAUTH_REDIRECT_URI
      const authUrl = `${apiBase}/auth/google/start?redirect=${encodeURIComponent(redirectUri)}`
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri)
      if (result.type !== "success") {
        setStatus("Google sign-in canceled.")
        return
      }
      const callbackUrl = result.url || ""
      const token = getParamFromUrl(callbackUrl, "token")
      if (!token) {
        setStatus("Google sign-in failed.")
        return
      }
      await setToken(token)
      const serverProfile = await fetchProfile().catch(() => null)
      if (serverProfile) {
        await setProfile(serverProfile)
        await setUserId(serverProfile.id)
      } else {
        const fallbackProfile = {
          id: getParamFromUrl(callbackUrl, "userId") || "",
          email: getParamFromUrl(callbackUrl, "email") || "",
          fullName: getParamFromUrl(callbackUrl, "fullName") || ""
        }
        if (fallbackProfile.id) {
          await setProfile(fallbackProfile as any)
          await setUserId(fallbackProfile.id)
        }
      }
      try {
        const profile = await fetchProfile()
        if (profile) {
          const history = await fetchHistory(profile.id, profile.email)
          await setScanHistoryCache(history || [], profile.id)
        }
      } catch {
        // ignore history prefetch failures
      }
      setIsAuthed(true)
      setStatus("Signed in.")
      navigation.replace("Main")
    } catch (error) {
      setStatus((error as Error).message)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.logoWrap}>
        <Image source={require("../../assets/icon.png")} style={styles.logoImage} />
      </View>
      <Text style={styles.title}>Log in</Text>
      <Text style={styles.subtitle}>Welcome back.</Text>

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

      <Pressable style={styles.forgotInline} onPress={() => navigation.navigate("ForgotPassword")}>
        <Text style={styles.link}>Forgot password?</Text>
      </Pressable>

      <GradientButton onPress={handleLogin} style={styles.primaryButton}>
        <Ionicons name="log-in-outline" size={18} color="#ffffff" />
        <Text style={styles.primaryButtonText}>Log in</Text>
      </GradientButton>

      <Pressable style={[styles.socialButton, styles.googleButton]} onPress={handleGoogleLogin}>
        <Ionicons name="logo-google" size={18} color="#EA4335" />
        <Text style={styles.socialText}>Google</Text>
      </Pressable>

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>Or continue with</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.registerRow}>
        <Text style={styles.registerText}>Don&apos;t have an account? </Text>
        <Pressable onPress={() => navigation.navigate("Signup")}>
          <Text style={[styles.registerText, styles.registerLink]}>Register</Text>
        </Pressable>
      </View>

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
  forgotInline: {
    alignItems: "flex-end",
    marginTop: -2,
    marginBottom: 8
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "700"
  },
  dividerRow: {
    marginTop: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E8C84A"
  },
  dividerText: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: "600"
  },
  socialButton: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.glass,
    flexDirection: "row",
    gap: 8
  },
  googleButton: {
    backgroundColor: "#ffffff",
    marginTop: 12
  },
  socialText: {
    color: theme.colors.text,
    fontWeight: "600"
  },
  link: {
    color: theme.colors.accent2
  },
  registerRow: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  registerText: {
    color: theme.colors.muted
  },
  registerLink: {
    color: theme.colors.accent2,
    fontWeight: "700"
  },
  status: {
    color: theme.colors.muted,
    marginTop: 12
  }
})

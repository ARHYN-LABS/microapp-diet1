import { useContext, useState } from "react"
import { View, Text, TextInput, StyleSheet, Pressable } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { signUpUser } from "../api/client"
import { setProfile, setToken, setUserId } from "../storage/cache"
import { theme } from "../theme"
import { AuthContext } from "../auth"

type Props = {
  navigation: any
}

export default function SignupScreen({ navigation }: Props) {
  const { setIsAuthed } = useContext(AuthContext)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [status, setStatus] = useState("")

  const handleSignup = async () => {
    setStatus("Creating account...")
    try {
      const response = await signUpUser({ fullName, email, password })
      await setToken(response.token)
      await setProfile(response.profile)
      await setUserId(response.profile.id)
      setIsAuthed(true)
      setStatus("Account created.")
      navigation.replace("Main")
    } catch (error) {
      setStatus((error as Error).message)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign up</Text>
      <Text style={styles.subtitle}>Create your profile.</Text>

      <TextInput
        style={styles.input}
        placeholder="Full name"
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

      <Pressable style={styles.primaryButton} onPress={handleSignup}>
        <Ionicons name="person-add-outline" size={18} color="#02130c" />
        <Text style={styles.primaryButtonText}>Create account</Text>
      </Pressable>

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
    backgroundColor: theme.colors.bg
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
    backgroundColor: theme.colors.accent,
    padding: 14,
    borderRadius: 999,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 8
  },
  primaryButtonText: {
    color: "#02130c",
    fontWeight: "700"
  },
  link: {
    color: theme.colors.accent2,
    marginTop: 16
  },
  status: {
    color: theme.colors.muted,
    marginTop: 12
  }
})

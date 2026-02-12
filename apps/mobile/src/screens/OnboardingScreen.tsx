import { useContext, useState } from "react"
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView } from "react-native"
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import { fetchHistory, fetchProfile, signUpUser } from "../api/client"
import GradientButton from "../components/GradientButton"
import { AuthContext } from "../auth"
import { setHealthPrefs, setProfile, setScanHistoryCache, setToken, setUserId } from "../storage/cache"
import { theme } from "../theme"

type Props = {
  navigation: any
  route: {
    params?: {
      flow?: "email" | "google"
      signupData?: { fullName: string; email: string; password: string }
      token?: string
      profile?: { id?: string; email?: string; fullName?: string } | null
    }
  }
}

const dietaryOptions = [
  { key: "halal", label: "Halal", icon: "checkmark-circle", color: "#1ABC9C", type: "ion" },
  { key: "kosher", label: "Kosher", icon: "shield-checkmark", color: "#2C7BE5", type: "ion" },
  { key: "vegetarian", label: "Vegetarian", icon: "leaf", color: "#22C55E", type: "ion" },
  { key: "vegan", label: "Vegan", icon: "leaf-outline", color: "#16A34A", type: "ion" },
  { key: "pescatarian", label: "Pescatarian", icon: "fish", color: "#3B82F6", type: "mci" },
  { key: "keto", label: "Keto", icon: "flame", color: "#F97316", type: "ion" },
  { key: "low_carb", label: "Low Carb", icon: "speedometer", color: "#14B8A6", type: "ion" },
  { key: "low_sodium", label: "Low Sodium", icon: "water", color: "#0EA5E9", type: "ion" },
  { key: "low_sugar", label: "Low Sugar", icon: "fitness", color: "#E11D48", type: "ion" },
  { key: "high_protein", label: "High Protein", icon: "barbell", color: "#2563EB", type: "ion" },
  { key: "gluten_free", label: "Gluten-Free", icon: "gf", color: "#F59E0B", type: "gf" },
  { key: "dairy_free", label: "Dairy-Free", icon: "nutrition", color: "#8B5CF6", type: "ion" }
]

const allergyOptions = [
  { key: "peanuts", label: "Peanuts", icon: "warning", color: "#E63946", type: "ion" },
  { key: "tree_nuts", label: "Tree Nuts", icon: "leaf", color: "#B45309", type: "ion" },
  { key: "dairy", label: "Dairy", icon: "cafe", color: "#2563EB", type: "ion" },
  { key: "eggs", label: "Eggs", icon: "nutrition", color: "#F59E0B", type: "ion" },
  { key: "shellfish", label: "Shellfish", icon: "shrimp", color: "#EF4444", type: "mci" },
  { key: "fish", label: "Fish", icon: "fish", color: "#3B82F6", type: "mci" },
  { key: "soy", label: "Soy", icon: "leaf-outline", color: "#22C55E", type: "ion" },
  { key: "wheat_gluten", label: "Wheat / Gluten", icon: "pizza", color: "#F97316", type: "ion" },
  { key: "sesame", label: "Sesame", icon: "nutrition-outline", color: "#F59E0B", type: "ion" },
  { key: "sulfites", label: "Sulfites", icon: "alert", color: "#EF4444", type: "ion" }
]

export default function OnboardingScreen({ navigation, route }: Props) {
  const { setIsAuthed } = useContext(AuthContext)
  const flow = route.params?.flow || "email"
  const [step, setStep] = useState(1)
  const [status, setStatus] = useState("")
  const [dietary, setDietary] = useState<Record<string, boolean>>({})
  const [allergies, setAllergies] = useState<Record<string, boolean>>({})
  const [allergyOther, setAllergyOther] = useState("")

  const completeAuth = async () => {
    setStatus("Finalizing account...")
    try {
      if (flow === "email") {
        const signupData = route.params?.signupData
        if (!signupData) {
          throw new Error("Missing sign-up data")
        }
        const response = await signUpUser(signupData)
        await setToken(response.token)
        await setProfile(response.profile)
        await setUserId(response.profile.id)
      } else {
        const token = route.params?.token
        if (!token) {
          throw new Error("Missing Google token")
        }
        await setToken(token)
        const serverProfile = await fetchProfile().catch(() => null)
        const fallbackProfile = route.params?.profile
        const activeProfile = serverProfile || fallbackProfile
        if (!activeProfile?.id) {
          throw new Error("Could not load profile")
        }
        await setProfile(activeProfile as any)
        await setUserId(activeProfile.id)
      }

      const profile = await fetchProfile()
      await setProfile(profile)
      await setUserId(profile.id)

      const restrictions = Object.entries(dietary)
        .filter(([, value]) => value)
        .map(([key]) => key)
      const allergens = Object.entries(allergies)
        .filter(([, value]) => value)
        .map(([key]) => key)
      await setHealthPrefs({ restrictions, allergens, allergyOther })

      try {
        const history = await fetchHistory(profile.id, profile.email)
        if (history && history.length) {
          await setScanHistoryCache(history)
        }
      } catch {
        // ignore history prefetch failures
      }

      setIsAuthed(true)
      navigation.replace("Main")
    } catch (error) {
      setStatus((error as Error).message)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Onboarding</Text>
      <Text style={styles.subtitle}>
        {step === 1 ? "Step 1: Common Dietary Restrictions" : "Step 2: Allergens"}
      </Text>

      <View style={styles.stepRow}>
        <View style={[styles.stepDot, step === 1 && styles.stepDotActive]} />
        <View style={[styles.stepDot, step === 2 && styles.stepDotActive]} />
      </View>

      {step === 1 ? (
        <View style={styles.card}>
          {dietaryOptions.map((item) => (
            <Pressable
              key={item.key}
              style={styles.checkRow}
              onPress={() => setDietary((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
            >
              <Ionicons
                name={dietary[item.key] ? "checkbox" : "square-outline"}
                size={20}
                color={dietary[item.key] ? theme.colors.accent2 : theme.colors.muted}
              />
              {item.type === "gf" ? (
                <View style={styles.gfIcon}>
                  <Text style={styles.gfText}>GF</Text>
                  <View style={styles.gfSlash} />
                </View>
              ) : item.type === "mci" ? (
                <MaterialCommunityIcons name={item.icon as any} size={16} color={item.color} />
              ) : (
                <Ionicons name={item.icon as any} size={16} color={item.color} />
              )}
              <Text style={styles.checkLabel}>{item.label}</Text>
            </Pressable>
          ))}
          <GradientButton onPress={() => setStep(2)} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Next</Text>
          </GradientButton>
        </View>
      ) : (
        <View style={styles.card}>
          {allergyOptions.map((item) => (
            <Pressable
              key={item.key}
              style={styles.checkRow}
              onPress={() => setAllergies((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
            >
              <Ionicons
                name={allergies[item.key] ? "checkbox" : "square-outline"}
                size={20}
                color={allergies[item.key] ? theme.colors.warning : theme.colors.muted}
              />
              {item.type === "mci" ? (
                <MaterialCommunityIcons name={item.icon as any} size={16} color={item.color} />
              ) : (
                <Ionicons name={item.icon as any} size={16} color={item.color} />
              )}
              <Text style={styles.checkLabel}>{item.label}</Text>
            </Pressable>
          ))}
          <Text style={styles.label}>Other (optional)</Text>
          <TextInput
            style={styles.input}
            value={allergyOther}
            onChangeText={setAllergyOther}
            placeholder="Add custom allergy"
            placeholderTextColor={theme.colors.muted}
          />
          <View style={styles.stepActions}>
            <Pressable style={styles.secondaryButton} onPress={completeAuth}>
              <Text style={styles.secondaryButtonText}>Skip</Text>
            </Pressable>
            <GradientButton onPress={completeAuth} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Finish</Text>
            </GradientButton>
          </View>
        </View>
      )}

      {status ? <Text style={styles.status}>{status}</Text> : null}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl + 12,
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
    marginTop: 2,
    marginBottom: 16
  },
  stepRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.border
  },
  stepDotActive: {
    backgroundColor: theme.colors.accent2,
    width: 20
  },
  card: {
    backgroundColor: theme.colors.panel,
    borderRadius: theme.radius.lg,
    padding: 16,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8
  },
  checkLabel: {
    color: theme.colors.text,
    fontWeight: "600"
  },
  gfIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: "#F59E0B",
    alignItems: "center",
    justifyContent: "center",
    position: "relative"
  },
  gfText: {
    fontSize: 8,
    fontWeight: "700",
    color: "#F59E0B"
  },
  gfSlash: {
    position: "absolute",
    width: 22,
    height: 2,
    backgroundColor: "#F59E0B",
    transform: [{ rotate: "-35deg" }]
  },
  label: {
    fontWeight: "600",
    color: theme.colors.text,
    marginTop: 8,
    marginBottom: 6
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
  stepActions: {
    flexDirection: "row",
    gap: 12
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.glass,
    alignItems: "center",
    justifyContent: "center"
  },
  secondaryButtonText: {
    fontWeight: "700",
    color: theme.colors.text
  },
  primaryButton: {
    flex: 1,
    marginTop: 0
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "700"
  },
  status: {
    color: theme.colors.muted,
    marginTop: 12
  }
})

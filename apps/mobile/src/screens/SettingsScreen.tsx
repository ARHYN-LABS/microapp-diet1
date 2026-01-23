import { useEffect, useState } from "react"
import { View, Text, TextInput, StyleSheet, Pressable, Switch, ScrollView } from "react-native"
import { defaultUserId } from "../api/config"
import { fetchPrefs, updatePrefs } from "../api/client"
import { getUserPrefs, setUserPrefs } from "../storage/cache"
import type { UserPrefs } from "@wimf/shared"
import { theme } from "../theme"

const emptyPrefs: UserPrefs = {
  userId: defaultUserId,
  halalCheckEnabled: false,
  lowSodiumMgLimit: null,
  lowSugarGlimit: null,
  lowCarbGlimit: null,
  lowCalorieLimit: null,
  highProteinGtarget: null,
  vegetarian: false,
  vegan: false,
  sensitiveStomach: false
}

const toNumberOrNull = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) return null
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : null
}

export default function SettingsScreen() {
  const [prefs, setPrefs] = useState<UserPrefs>(emptyPrefs)
  const [status, setStatus] = useState("")

  useEffect(() => {
    const load = async () => {
      const cached = await getUserPrefs()
      if (cached) {
        setPrefs({ ...emptyPrefs, ...cached })
      }
      try {
        const remote = await fetchPrefs(defaultUserId)
        setPrefs({ ...emptyPrefs, ...remote })
        setUserPrefs(remote)
      } catch {
        // ignore API errors, keep cached prefs
      }
    }

    load()
  }, [])

  const handleSave = async () => {
    setStatus("Saving...")
    try {
      const saved = await updatePrefs(prefs)
      await setUserPrefs(saved)
      setStatus("Saved")
    } catch {
      setStatus("Saved locally (offline)")
      await setUserPrefs(prefs)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Preferences</Text>
      <Text style={styles.subtitle}>Personalize flags for your scans.</Text>

      <View style={styles.card}>
        <View style={styles.switchRow}>
          <Text style={styles.label}>Enable halal check</Text>
          <Switch
            value={prefs.halalCheckEnabled}
            onValueChange={(value) => setPrefs((prev) => ({ ...prev, halalCheckEnabled: value }))}
          />
        </View>

        <Text style={styles.label}>Low sodium limit (mg)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={prefs.lowSodiumMgLimit?.toString() || ""}
          onChangeText={(value) =>
            setPrefs((prev) => ({ ...prev, lowSodiumMgLimit: toNumberOrNull(value) }))
          }
          placeholder="e.g. 200"
          placeholderTextColor={theme.colors.muted}
        />

        <Text style={styles.label}>Low sugar limit (g)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={prefs.lowSugarGlimit?.toString() || ""}
          onChangeText={(value) =>
            setPrefs((prev) => ({ ...prev, lowSugarGlimit: toNumberOrNull(value) }))
          }
          placeholder="e.g. 10"
          placeholderTextColor={theme.colors.muted}
        />

        <Text style={styles.label}>Low carb limit (g)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={prefs.lowCarbGlimit?.toString() || ""}
          onChangeText={(value) =>
            setPrefs((prev) => ({ ...prev, lowCarbGlimit: toNumberOrNull(value) }))
          }
          placeholder="e.g. 30"
          placeholderTextColor={theme.colors.muted}
        />

        <Text style={styles.label}>Low calorie limit (per 50g)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={prefs.lowCalorieLimit?.toString() || ""}
          onChangeText={(value) =>
            setPrefs((prev) => ({ ...prev, lowCalorieLimit: toNumberOrNull(value) }))
          }
          placeholder="e.g. 150"
          placeholderTextColor={theme.colors.muted}
        />

        <Text style={styles.label}>High protein target (g)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={prefs.highProteinGtarget?.toString() || ""}
          onChangeText={(value) =>
            setPrefs((prev) => ({ ...prev, highProteinGtarget: toNumberOrNull(value) }))
          }
          placeholder="e.g. 12"
          placeholderTextColor={theme.colors.muted}
        />

        <View style={styles.switchRow}>
          <Text style={styles.label}>Vegetarian</Text>
          <Switch
            value={!!prefs.vegetarian}
            onValueChange={(value) => setPrefs((prev) => ({ ...prev, vegetarian: value }))}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.label}>Vegan</Text>
          <Switch
            value={!!prefs.vegan}
            onValueChange={(value) => setPrefs((prev) => ({ ...prev, vegan: value }))}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.label}>Sensitive stomach</Text>
          <Switch
            value={!!prefs.sensitiveStomach}
            onValueChange={(value) => setPrefs((prev) => ({ ...prev, sensitiveStomach: value }))}
          />
        </View>
      </View>

      <Pressable style={styles.primaryButton} onPress={handleSave}>
        <Text style={styles.primaryButtonText}>Save</Text>
      </Pressable>
      {status ? <Text style={styles.status}>{status}</Text> : null}
      <Text style={styles.disclaimer}>Educational, not medical advice.</Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: theme.colors.bg
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 6
  },
  subtitle: {
    color: theme.colors.muted,
    marginBottom: 16
  },
  card: {
    backgroundColor: theme.colors.panel,
    borderRadius: theme.radius.lg,
    padding: 16
  },
  label: {
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 6
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.panelAlt,
    borderRadius: theme.radius.md,
    padding: 12,
    marginBottom: 16,
    color: theme.colors.text
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16
  },
  primaryButton: {
    backgroundColor: theme.colors.accent,
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    marginTop: 16
  },
  primaryButtonText: {
    color: "#02130c",
    fontWeight: "700"
  },
  status: {
    marginTop: 12,
    color: theme.colors.accent2
  },
  disclaimer: {
    marginTop: 16,
    color: theme.colors.muted,
    textAlign: "center"
  }
})
